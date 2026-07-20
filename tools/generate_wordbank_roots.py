#!/usr/bin/env python3
"""用 DeepSeek 为英语词库补全可验证的表面词根词缀拆分。"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from wordbank_compiler import CompilerError, load_js_words, write_wordbank_assets


ZH_RE = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff]")
PART_RE = re.compile(r"[A-Za-z]{2,24}")
VALID_ROLES = {"prefix", "root", "suffix", "compound"}


@dataclass
class Candidate:
    index: int
    word: dict[str, Any]
    retry_feedback: str = ""


@dataclass
class Usage:
    requests: int = 0
    input_tokens: int = 0
    output_tokens: int = 0


@dataclass
class RootReport:
    generated_at: str
    model: str
    level: str
    max_words: int
    batch_size: int
    selected: int = 0
    generated: int = 0
    not_applicable: int = 0
    failures: list[dict[str, str]] = field(default_factory=list)
    samples: list[dict[str, str]] = field(default_factory=list)
    suggestions: list[dict[str, Any]] = field(default_factory=list)
    auto_applied: bool = False
    coverage_before: dict[str, int] = field(default_factory=dict)
    coverage_after: dict[str, int] = field(default_factory=dict)
    usage: Usage = field(default_factory=Usage)

    def payload(self) -> dict[str, Any]:
        result = asdict(self)
        result["failed"] = len(self.failures)
        return result


class FatalAPIError(CompilerError):
    """密钥、余额或请求配置错误。"""


def clean_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def word_key(value: Any) -> str:
    return re.sub(r"[^a-z]", "", clean_text(value).casefold())


def has_usable_roots(word: dict[str, Any]) -> bool:
    return bool(clean_text(word.get("roots")))


def is_roots_reviewed(word: dict[str, Any]) -> bool:
    return clean_text(word.get("rootsStatus")) in {"verified", "not-applicable"}


def coverage(words: list[dict[str, Any]]) -> dict[str, int]:
    with_roots = sum(has_usable_roots(word) for word in words)
    not_applicable = sum(
        clean_text(word.get("rootsStatus")) == "not-applicable"
        for word in words
    )
    return {
        "total": len(words),
        "with_roots": with_roots,
        "not_applicable": not_applicable,
        "reviewed": with_roots + not_applicable,
        "pending": len(words) - with_roots - not_applicable,
    }


def select_candidates(words: list[dict[str, Any]], level: str, max_words: int) -> list[Candidate]:
    normalized_level = clean_text(level).casefold()
    selected = [
        Candidate(index, word)
        for index, word in enumerate(words)
        if not has_usable_roots(word)
        and not is_roots_reviewed(word)
        and (
            not normalized_level
            or normalized_level == "all"
            or clean_text(word.get("level")).casefold() == normalized_level
        )
        and bool(word_key(word.get("word")))
    ]
    return selected if max_words <= 0 else selected[:max_words]


def system_prompt() -> str:
    return """你是面向中文英语学习者的构词法编辑。请判断输入单词是否适合做现代英语表面词素拆分，并只输出 JSON。

输出格式：
{"items":[{"id":"原ID","splittable":true,"parts":[{"text":"dis","meaning":"否定","role":"prefix"},{"text":"courage","meaning":"勇气","role":"root"}],"reason":""}]}

严格规则：
1. 每个输入 id 必须原样返回且只返回一次。
2. 只做对学习有帮助、能从当前单词表面直接看出的构词拆分，不做牵强的历史词源拆分。
3. parts 必须是原单词中从左到右连续出现的片段；拼接后必须与原单词完全一致。
4. 至少两个、最多四个 parts；text 只能是两个以上英文字母，不能改写拼写，不能添加或省略字母。
5. role 只能是 prefix、root、suffix、compound；meaning 用简短准确的简体中文。
6. 禁止把普通字母片段假装成词根。例如无法可靠解释 achieve 时，应返回 splittable=false，而不是 a + chieve。
7. 单纯按音节切分、专有名词、缩写、拼写不透明或没有可靠现代构词结构时，返回 splittable=false、parts=[]。
8. 宁可留空也不要编造。不要输出 Markdown、说明文字或额外字段。
9. 若输入含 retry_feedback，必须修正对应问题。"""


def review_prompt() -> str:
    return """你是第二位独立的英语构词法审校员。输入包含单词、中文词义和另一模型提出的拆分。只输出 JSON。

输出格式：
{"items":[{"id":"原ID","approved":false,"reason":"简短原因"}]}

审核标准：
1. 只有拆分各部分能自然帮助中文学习者理解这个单词的现代常用词义时才批准。
2. 否决仅仅在历史词源上成立、现代词义已经不透明的拆分，例如 remote→re+mote、resemble→re+semble、result→re+sult、pretend→pre+tend。
3. 否决把普通字母片段包装成词根、循环解释整词、词素释义错误或含义牵强的拆分。
4. 派生词和复合词可批准，例如 rebuild→re+build、fashionable→fashion+able、headline→head+line。
5. 宁可否决也不要放过会误导学习者的结果。每个 id 必须原样返回一次。"""


class DeepSeekClient:
    def __init__(self, api_key: str, model: str, base_url: str, usage: Usage):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url.rstrip("/")
        self.usage = usage

    def request(self, candidates: list[Candidate]) -> dict[str, dict[str, Any]]:
        entries = [
            {
                "id": clean_text(candidate.word.get("_id")),
                "word": clean_text(candidate.word.get("word")),
                "type": clean_text(candidate.word.get("type")),
                "meaning": clean_text(candidate.word.get("meaning")),
                "level": clean_text(candidate.word.get("level")),
                "retry_feedback": candidate.retry_feedback,
            }
            for candidate in candidates
        ]
        body = json.dumps({
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt()},
                {"role": "user", "content": json.dumps({"entries": entries}, ensure_ascii=False)},
            ],
            "response_format": {"type": "json_object"},
            "thinking": {"type": "disabled"},
            "temperature": 0.1,
            "max_tokens": max(1800, len(candidates) * 160),
        }, ensure_ascii=False).encode("utf-8")
        request = urllib.request.Request(
            self.base_url + "/chat/completions",
            data=body,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        last_error: Exception | None = None
        for attempt in range(4):
            try:
                with urllib.request.urlopen(request, timeout=120) as response:
                    result = json.loads(response.read().decode("utf-8"))
                payload = json.loads(result["choices"][0]["message"]["content"])
                usage = result.get("usage", {})
                self.usage.requests += 1
                self.usage.input_tokens += int(usage.get("prompt_tokens", 0) or 0)
                self.usage.output_tokens += int(usage.get("completion_tokens", 0) or 0)
                # DeepSeek's JSON mode may return either the requested
                # {"items": [...]} envelope or the array itself.  Both carry
                # the same data, so accept both instead of failing a whole
                # generation run on the harmless outer-shape difference.
                items = payload if isinstance(payload, list) else payload.get("items", [])
                if not isinstance(items, list):
                    raise ValueError("返回 JSON 缺少 items 数组")
                output: dict[str, dict[str, Any]] = {}
                for item in items:
                    item_id = clean_text(item.get("id")) if isinstance(item, dict) else ""
                    if item_id and item_id not in output:
                        output[item_id] = item
                return output
            except urllib.error.HTTPError as exc:
                detail = exc.read().decode("utf-8", errors="replace")[:500]
                if exc.code in {400, 401, 402, 403, 404}:
                    raise FatalAPIError(
                        f"DeepSeek API 无法使用（HTTP {exc.code}）：{detail}"
                    ) from exc
                last_error = exc
            except (OSError, KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
                last_error = exc
            if attempt < 3:
                time.sleep(2 ** attempt)
        raise CompilerError(f"DeepSeek 请求连续失败：{last_error}")

    def review(self, candidates: list[Candidate], proposals: dict[str, dict[str, Any]]) -> dict[str, dict[str, Any]]:
        entries = []
        for candidate in candidates:
            item_id = clean_text(candidate.word.get("_id"))
            proposal = proposals.get(item_id, {})
            if proposal.get("splittable") is not True:
                continue
            entries.append({
                "id": item_id,
                "word": clean_text(candidate.word.get("word")),
                "meaning": clean_text(candidate.word.get("meaning")),
                "proposal": proposal.get("parts", []),
            })
        if not entries:
            return {}
        body = json.dumps({
            "model": self.model,
            "messages": [
                {"role": "system", "content": review_prompt()},
                {"role": "user", "content": json.dumps({"entries": entries}, ensure_ascii=False)},
            ],
            "response_format": {"type": "json_object"},
            "thinking": {"type": "disabled"},
            "temperature": 0,
            "max_tokens": max(1200, len(entries) * 90),
        }, ensure_ascii=False).encode("utf-8")
        request = urllib.request.Request(
            self.base_url + "/chat/completions",
            data=body,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        last_error: Exception | None = None
        for attempt in range(4):
            try:
                with urllib.request.urlopen(request, timeout=120) as response:
                    result = json.loads(response.read().decode("utf-8"))
                payload = json.loads(result["choices"][0]["message"]["content"])
                usage = result.get("usage", {})
                self.usage.requests += 1
                self.usage.input_tokens += int(usage.get("prompt_tokens", 0) or 0)
                self.usage.output_tokens += int(usage.get("completion_tokens", 0) or 0)
                items = payload if isinstance(payload, list) else payload.get("items", [])
                if not isinstance(items, list):
                    raise ValueError("复核 JSON 缺少 items 数组")
                return {
                    clean_text(item.get("id")): item
                    for item in items
                    if isinstance(item, dict) and clean_text(item.get("id"))
                }
            except urllib.error.HTTPError as exc:
                detail = exc.read().decode("utf-8", errors="replace")[:500]
                if exc.code in {400, 401, 402, 403, 404}:
                    raise FatalAPIError(
                        f"DeepSeek API 无法使用（HTTP {exc.code}）：{detail}"
                    ) from exc
                last_error = exc
            except (OSError, KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
                last_error = exc
            if attempt < 3:
                time.sleep(2 ** attempt)
        raise CompilerError(f"DeepSeek 复核连续失败：{last_error}")


def validate_result(candidate: Candidate, item: dict[str, Any]) -> tuple[str, str, str]:
    if item.get("splittable") is False:
        if item.get("parts") not in (None, []):
            return "", "", "不可拆分时 parts 必须为空"
        return "", "not-applicable", ""
    if item.get("splittable") is not True:
        return "", "", "缺少明确的 splittable 判断"
    parts = item.get("parts")
    if not isinstance(parts, list) or not 2 <= len(parts) <= 4:
        return "", "", "parts 数量必须是 2～4"
    formatted: list[str] = []
    raw_parts: list[str] = []
    for part in parts:
        if not isinstance(part, dict):
            return "", "", "part 不是对象"
        text = clean_text(part.get("text")).casefold()
        meaning = clean_text(part.get("meaning"))
        role = clean_text(part.get("role"))
        if not PART_RE.fullmatch(text):
            return "", "", f"词素格式无效：{text or '空'}"
        if role not in VALID_ROLES:
            return "", "", f"词素角色无效：{role or '空'}"
        if not ZH_RE.search(meaning) or len(meaning) > 16:
            return "", "", f"词素中文含义无效：{meaning or '空'}"
        if any(mark in meaning for mark in "()-（）—-"):
            return "", "", "词素含义包含禁止的分隔符"
        raw_parts.append(text)
        formatted.append(f"{text}({meaning})")
    target = word_key(candidate.word.get("word"))
    if "".join(raw_parts) != target:
        return "", "", f"词素无法原样拼回 {target}"
    roots = "-".join(formatted)
    if len(roots) > 160:
        return "", "", "词根词缀结果过长"
    return roots, "verified", ""


def run_generation(client: DeepSeekClient, candidates: list[Candidate], batch_size: int,
                   words: list[dict[str, Any]], report: RootReport,
                   apply_results: bool = False) -> None:
    for offset in range(0, len(candidates), batch_size):
        pending = candidates[offset:offset + batch_size]
        final_reasons: dict[str, str] = {}
        for attempt in range(3):
            if not pending:
                break
            results = client.request(pending)
            reviews = client.review(pending, results)
            retry: list[Candidate] = []
            for candidate in pending:
                item_id = clean_text(candidate.word.get("_id"))
                proposal = results.get(item_id, {})
                if proposal.get("splittable") is True:
                    review = reviews.get(item_id, {})
                    if review.get("approved") is not True:
                        proposal = {"splittable": False, "parts": []}
                roots, status, reason = validate_result(candidate, proposal)
                if status:
                    target = words[candidate.index]
                    report.suggestions.append({
                        "id": item_id,
                        "word": clean_text(target.get("word")),
                        "meaning": clean_text(target.get("meaning")),
                        "level": clean_text(target.get("level")),
                        "roots": roots,
                        "recommendation": "accept" if status == "verified" else "hide",
                    })
                    if apply_results:
                        target["roots"] = roots
                        target["rootsStatus"] = status
                        target["rootsReview"] = "auto-strict"
                    if status == "verified":
                        report.generated += 1
                        if len(report.samples) < 40:
                            report.samples.append({
                                "word": clean_text(target.get("word")),
                                "roots": roots,
                            })
                    else:
                        report.not_applicable += 1
                    final_reasons.pop(item_id, None)
                else:
                    final_reasons[item_id] = reason or "API 未返回对应词条"
                    candidate.retry_feedback = final_reasons[item_id]
                    retry.append(candidate)
            pending = retry if attempt < 2 else []
        for candidate in pending:
            item_id = clean_text(candidate.word.get("_id"))
            final_reasons.setdefault(item_id, "三次生成均未通过校验")
        for item_id, reason in final_reasons.items():
            candidate = next(
                (entry for entry in candidates if clean_text(entry.word.get("_id")) == item_id),
                None,
            )
            report.failures.append({
                "id": item_id,
                "word": clean_text(candidate.word.get("word")) if candidate else "",
                "reason": reason,
            })
        print(
            f"::notice::已处理 {min(offset + batch_size, len(candidates))}/{len(candidates)}，"
            f"有效拆分 {report.generated}，不适合拆分 {report.not_applicable}"
        )


def write_report(repo: Path, report: RootReport) -> None:
    reports = repo / "reports"
    reports.mkdir(exist_ok=True)
    payload = report.payload()
    (reports / "root-generation-latest.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    samples = "\n".join(
        f"- `{item['word']}`：{item['roots']}" for item in report.samples
    ) or "- 无"
    failures = "\n".join(
        f"- `{item['word']}`：{item['reason']}" for item in report.failures[:100]
    ) or "- 无"
    markdown = f"""# 钟日英语词根词缀生成报告

- 生成时间：{report.generated_at}
- 模型：`{report.model}`
- 等级：{report.level or '全部'}
- 本次检查：{report.selected}
- 有效拆分：{report.generated}
- 不适合可靠拆分：{report.not_applicable}
- 未通过校验：{len(report.failures)}
- API 请求：{report.usage.requests}
- 输入 Token：{report.usage.input_tokens}
- 输出 Token：{report.usage.output_tokens}
- 处理前待检查：{report.coverage_before.get('pending', 0)}
- 处理后待检查：{report.coverage_after.get('pending', 0)}

## 拆分样例

{samples}

## 未通过项目

{failures}
"""
    (reports / "root-generation-latest.md").write_text(markdown, encoding="utf-8")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="补全英语词库中的可靠词根词缀")
    parser.add_argument("--repo", default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument("--level", default="CET-4")
    parser.add_argument("--max-words", type=int, default=100)
    parser.add_argument("--batch-size", type=int, default=20)
    parser.add_argument(
        "--apply",
        action="store_true",
        help="将通过双重审校的结果直接写入正式英语词库",
    )
    parser.add_argument("--api-key-env", default="DEEPSEEK_API_KEY")
    parser.add_argument(
        "--api-base-url",
        default=os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
    )
    parser.add_argument(
        "--model",
        default=os.environ.get("DEEPSEEK_MODEL", "deepseek-v4-flash"),
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    if args.max_words < 0 or not 1 <= args.batch_size <= 40:
        print("::error::max-words 不能为负数，batch-size 必须为 1～40", file=sys.stderr)
        return 2
    repo = Path(args.repo).resolve()
    try:
        ja_words = load_js_words(repo / "data.js", "DefaultWords")
        en_words = load_js_words(repo / "english-data.js", "DefaultEnglishWords")
        candidates = select_candidates(en_words, args.level, args.max_words)
        report = RootReport(
            generated_at=datetime.now(timezone.utc).isoformat(),
            model=args.model,
            level=args.level,
            max_words=args.max_words,
            batch_size=args.batch_size,
            selected=len(candidates),
            auto_applied=args.apply,
            coverage_before=coverage(en_words),
        )
        if candidates:
            api_key = os.environ.get(args.api_key_env, "").strip()
            if not api_key:
                raise FatalAPIError(
                    f"缺少 GitHub Secret：{args.api_key_env}。请在仓库 Settings → "
                    "Secrets and variables → Actions 中添加；不要把密钥写入代码。"
                )
            client = DeepSeekClient(api_key, args.model, args.api_base_url, report.usage)
            run_generation(
                client,
                candidates,
                args.batch_size,
                en_words,
                report,
                apply_results=args.apply,
            )
            report.coverage_after = coverage(en_words)
            if args.apply:
                write_wordbank_assets(repo, ja_words, en_words)
        else:
            report.coverage_after = report.coverage_before
        write_report(repo, report)
        print(json.dumps(report.payload(), ensure_ascii=False, indent=2))
        return 0 if not candidates or report.generated + report.not_applicable > 0 else 3
    except CompilerError as exc:
        print(f"::error::{exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
