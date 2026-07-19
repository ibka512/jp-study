#!/usr/bin/env python3
"""用 DeepSeek 为钟日内置词库分批补全双语例句。"""

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


KANJI_RE = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff々〆ヶ]")
KANA_RE = re.compile(r"[\u3040-\u30ffー]")
KANA_ONLY_RE = re.compile(r"[\u3040-\u30ffー]+")
ZH_RE = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff]")
FURIGANA_RE = re.compile(r"\$\\overset\{([^{}$]+)\}\{([^{}$]+)\}\$")
AI_FURIGANA_RE = re.compile(r"\[\[([^\[\]|]+)\|([^\[\]|]+)\]\]")
AI_FURIGANA_MISSING_CLOSE_RE = re.compile(
    r"\[\[([^\[\]|]+)\|([\u3040-\u30ffー]+)\](?!\])"
)
AI_FURIGANA_MISSING_OPEN_RE = re.compile(
    r"(?<!\[)\[([^\[\]|]+)\|([\u3040-\u30ffー]+)\]\]"
)
FURIGANA_SURFACE_TOKEN_RE = re.compile(
    r"[\u3400-\u4dbf\u4e00-\u9fff々〆ヶ0-9０-９]+|[\u3040-\u30ffー]+"
)
EN_IRREGULAR_FORMS = {
    "swear": {"swore", "sworn"},
}


@dataclass
class Candidate:
    language: str
    index: int
    word: dict[str, Any]
    retry_feedback: str = ""
    rejected_sentence: str = ""


@dataclass
class Usage:
    requests: int = 0
    input_tokens: int = 0
    output_tokens: int = 0


@dataclass
class GenerationReport:
    generated_at: str
    model: str
    language: str
    level: str
    max_words: int
    batch_size: int
    missing_before: dict[str, int]
    selected: int = 0
    generated: int = 0
    normalized_existing: int = 0
    cleared_invalid_existing: int = 0
    missing_after: dict[str, int] = field(default_factory=dict)
    failures: list[dict[str, str]] = field(default_factory=list)
    usage: Usage = field(default_factory=Usage)

    def payload(self) -> dict[str, Any]:
        result = asdict(self)
        result["failed"] = len(self.failures)
        return result


class FatalAPIError(CompilerError):
    """密钥、余额或请求配置错误；继续重试不会成功。"""


def clean_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def strip_furigana(value: str) -> str:
    return FURIGANA_RE.sub(lambda match: match.group(2), value)


def convert_ai_furigana(value: str) -> str:
    """把 AI 标记转换成 PWA 的 overset，并修复常见的单侧缺括号。"""
    value = AI_FURIGANA_RE.sub(
        lambda match: rf"$\overset{{{match.group(2)}}}{{{match.group(1)}}}$",
        value,
    )
    value = AI_FURIGANA_MISSING_CLOSE_RE.sub(
        lambda match: rf"$\overset{{{match.group(2)}}}{{{match.group(1)}}}$",
        value,
    )
    return AI_FURIGANA_MISSING_OPEN_RE.sub(
        lambda match: rf"$\overset{{{match.group(2)}}}{{{match.group(1)}}}$",
        value,
    )


def kana_key(value: str) -> str:
    """统一片假名和平假名，供送假名对齐使用。"""
    return "".join(
        chr(ord(char) - 0x60) if "ァ" <= char <= "ヶ" else char
        for char in value
    )


def split_mixed_furigana(reading: str, surface: str) -> str | None:
    """按送假名锚点，把 [[食べ物|たべもの]] 安全拆成两个汉字注音。"""
    tokens = FURIGANA_SURFACE_TOKEN_RE.findall(surface)
    if not tokens or "".join(tokens) != surface:
        return None
    reading_match = kana_key(reading)
    cursor = 0
    result: list[str] = []
    for index, token in enumerate(tokens):
        if KANA_ONLY_RE.fullmatch(token):
            token_match = kana_key(token)
            if not reading_match.startswith(token_match, cursor):
                return None
            result.append(token)
            cursor += len(token)
            continue

        next_kana = (
            tokens[index + 1]
            if index + 1 < len(tokens) and KANA_ONLY_RE.fullmatch(tokens[index + 1])
            else ""
        )
        if next_kana:
            end = reading_match.find(kana_key(next_kana), cursor)
            if end <= cursor:
                return None
        else:
            end = len(reading)
        token_reading = reading[cursor:end]
        if not token_reading or not KANA_ONLY_RE.fullmatch(token_reading):
            return None
        result.append(rf"$\overset{{{token_reading}}}{{{token}}}$")
        cursor = end
    return "".join(result) if cursor == len(reading) else None


def normalize_furigana_markup(value: str) -> tuple[str, bool]:
    """去掉纯假名伪注音，并安全拆分汉字与送假名混标。"""
    invalid_mixed = False

    def replace(match: re.Match[str]) -> str:
        nonlocal invalid_mixed
        reading, surface = match.group(1), match.group(2)
        if not KANJI_RE.search(surface):
            return surface
        if KANA_RE.search(surface):
            split = split_mixed_furigana(reading, surface)
            if split:
                return split
            invalid_mixed = True
        return rf"$\overset{{{reading}}}{{{surface}}}$"

    return FURIGANA_RE.sub(replace, value), invalid_mixed


def cleanup_existing_japanese_examples(words: list[dict[str, Any]]) -> tuple[int, int]:
    normalized = 0
    cleared = 0
    for word in words:
        example = clean_text(word.get("example"))
        if not example:
            continue
        cleaned, invalid = normalize_furigana_markup(example)
        if invalid:
            word["example"] = ""
            cleared += 1
        elif cleaned != example:
            word["example"] = cleaned
            normalized += 1
    return normalized, cleared


def load_ai_json(content: str) -> dict[str, Any]:
    """解析 JSON；兼容模型偶尔未转义 LaTeX 反斜杠的旧式响应。"""
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        repaired = re.sub(r'\\(?!["\\/bfnrtu])', r'\\\\', content)
        return json.loads(repaired)


def sentence_key(value: str) -> str:
    plain = strip_furigana(value)
    return re.sub(r"[\s。．.!！?？'\"“”‘’、,，;；:：]", "", plain).casefold()


def split_existing_example(value: Any) -> str:
    block = clean_text(value).split("||", 1)[0].strip()
    if " / " in block:
        return block.split(" / ", 1)[0].strip()
    return block


def missing_counts(ja_words: list[dict[str, Any]], en_words: list[dict[str, Any]]) -> dict[str, int]:
    return {
        "ja": sum(not clean_text(word.get("example")) for word in ja_words),
        "en": sum(not clean_text(word.get("example")) for word in en_words),
    }


def _eligible(words: list[dict[str, Any]], language: str, level: str) -> list[Candidate]:
    normalized_level = level.casefold()
    return [
        Candidate(language, index, word)
        for index, word in enumerate(words)
        if not clean_text(word.get("example"))
        and (not normalized_level or clean_text(word.get("level")).casefold() == normalized_level)
    ]


def select_candidates(ja_words: list[dict[str, Any]], en_words: list[dict[str, Any]],
                      language: str, level: str, max_words: int) -> list[Candidate]:
    ja = _eligible(ja_words, "ja", level) if language in {"all", "ja"} else []
    en = _eligible(en_words, "en", level) if language in {"all", "en"} else []
    if language != "all":
        selected = ja + en
    else:
        selected = []
        for index in range(max(len(ja), len(en))):
            if index < len(ja):
                selected.append(ja[index])
            if index < len(en):
                selected.append(en[index])
    return selected if max_words <= 0 else selected[:max_words]


def prompt_for(language: str) -> str:
    schema = '{"items":[{"id":"词条ID","sentence":"例句","translation":"中文翻译"}]}'
    common = f"""你是面向中文学习者的词典例句编辑。请为输入词条各写一条例句，并只输出 JSON 对象。
严格按输入 id 原样返回，每个 id 恰好一次，格式为：{schema}
例句必须自然、常用、简洁，符合词条的 level 和 meaning，不涉及成人、暴力、歧视或危险内容。
sentence 必须包含输入 word 的原样文字，translation 必须是准确简体中文。不要输出 Markdown、解释或额外字段。
如果输入带 retry_feedback 和 rejected_sentence，必须重新写不同的句子，并逐项修正反馈指出的问题。"""
    if language == "en":
        return common + """
英语规则：sentence 写完整英语句子，建议 6～18 个英文单词。必须使用输入 word 的原形拼写；可以用不定式等自然结构，不得用其他屈折形式代替。"""
    return common + """
日语规则：sentence 写完整自然日语句子，建议 8～35 个日文字符，并包含输入 word 的原样表记。
为避免 JSON 转义问题，sentence 中每一处汉字都必须写成 [[汉字|假名]]；纯假名和标点保持原样。
标记左侧必须只含汉字（数字可以和汉字一起出现），不得把平假名、片假名或送假名包进标记。
假名词和片假名词不要标注；例如「あさって」「テレビ」必须直接写原文。
例如「食べ物」必须写成 [[食|た]]べ[[物|もの]]，不能写成 [[食べ物|たべもの]]。
每个标记必须完整保留两对方括号。例如：[[私|わたし]]は[[毎日|まいにち]][[日本語|にほんご]]を[[勉強|べんきょう]]する。"""


class DeepSeekClient:
    def __init__(self, api_key: str, model: str, base_url: str, usage: Usage):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url.rstrip("/")
        self.usage = usage

    def request(self, language: str, candidates: list[Candidate]) -> dict[str, dict[str, Any]]:
        entries = [{
            "id": clean_text(candidate.word.get("_id")),
            "word": clean_text(candidate.word.get("word")),
            "reading": clean_text(candidate.word.get("kana")) if language == "ja" else "",
            "type": clean_text(candidate.word.get("type")),
            "meaning": clean_text(candidate.word.get("meaning")),
            "level": clean_text(candidate.word.get("level")),
            "retry_feedback": candidate.retry_feedback,
            "rejected_sentence": candidate.rejected_sentence,
        } for candidate in candidates]
        body = json.dumps({
            "model": self.model,
            "messages": [
                {"role": "system", "content": prompt_for(language)},
                {"role": "user", "content": json.dumps({"entries": entries}, ensure_ascii=False)},
            ],
            "response_format": {"type": "json_object"},
            "thinking": {"type": "disabled"},
            "temperature": 0.2,
            "max_tokens": max(2000, len(candidates) * 220),
        }, ensure_ascii=False).encode("utf-8")
        request = urllib.request.Request(
            self.base_url + "/chat/completions",
            data=body,
            headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
            method="POST",
        )
        last_error: Exception | None = None
        for attempt in range(4):
            try:
                with urllib.request.urlopen(request, timeout=120) as response:
                    result = json.loads(response.read().decode("utf-8"))
                content = result["choices"][0]["message"]["content"]
                payload = load_ai_json(content)
                self.usage.requests += 1
                usage = result.get("usage", {})
                self.usage.input_tokens += int(usage.get("prompt_tokens", 0) or 0)
                self.usage.output_tokens += int(usage.get("completion_tokens", 0) or 0)
                items = payload.get("items", [])
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
                    raise FatalAPIError(f"DeepSeek API 无法使用（HTTP {exc.code}）：{detail}") from exc
                last_error = exc
            except (OSError, KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
                last_error = exc
            if attempt < 3:
                time.sleep(2 ** attempt)
        raise CompilerError(f"DeepSeek 请求连续失败：{last_error}")


def validate_result(candidate: Candidate, item: dict[str, Any], used: set[str]) -> tuple[str, str]:
    sentence = clean_text(item.get("sentence"))
    translation = clean_text(item.get("translation"))
    word = clean_text(candidate.word.get("word"))
    if candidate.language == "ja":
        sentence = convert_ai_furigana(sentence)
        if "[[" in sentence or "]]" in sentence:
            return "", "日语注音中间标记不完整"
        sentence, invalid_mixed = normalize_furigana_markup(sentence)
        if invalid_mixed:
            return "", "日语注音把汉字和送假名混在同一标记中"
    if not sentence or not translation:
        return "", "缺少例句或中文翻译"
    if any(marker in sentence + translation for marker in ("```", "||", "\n", "\r")):
        return "", "包含禁止的格式标记"
    if len(sentence) > 260 or len(translation) > 180:
        return "", "例句或翻译过长"
    plain = strip_furigana(sentence)
    contains_word = word in plain
    if candidate.language == "en":
        forms = {word}
        if re.fullmatch(r"[A-Za-z]+", word):
            forms.update({word + "s", word + "es", word + "ed", word + "ing"})
            if word.endswith("e"):
                forms.update({word + "d", word[:-1] + "ing"})
            if len(word) > 1 and word.endswith("y") and word[-2].lower() not in "aeiou":
                forms.update({word[:-1] + "ies", word[:-1] + "ied"})
            if (
                len(word) >= 3
                and word[-1].lower() not in "aeiouwxy"
                and word[-2].lower() in "aeiou"
                and word[-3].lower() not in "aeiou"
            ):
                forms.update({word + word[-1] + "ed", word + word[-1] + "ing"})
            forms.update(EN_IRREGULAR_FORMS.get(word.casefold(), set()))
        contains_word = any(bool(re.search(
            rf"(?<![A-Za-z]){re.escape(form)}(?![A-Za-z])",
            plain,
            flags=re.IGNORECASE,
        )) for form in forms)
    elif not contains_word and len(word) >= 2 and word[-1] in "るうくぐすつぬぶむい":
        stem = word[:-1]
        contains_word = len(stem) >= 2 or bool(KANJI_RE.search(stem))
        contains_word = contains_word and stem in plain
    if not contains_word:
        return "", "例句没有包含目标词原样文字"
    if not ZH_RE.search(translation):
        return "", "翻译不是中文"
    if candidate.language == "en":
        if not re.search(r"[A-Za-z]", sentence):
            return "", "英语例句缺少英文"
        if FURIGANA_RE.search(sentence):
            return "", "英语例句意外包含日语注音"
    else:
        if not KANA_RE.search(plain):
            return "", "日语例句缺少假名"
        without_annotated = FURIGANA_RE.sub("", sentence)
        if KANJI_RE.search(without_annotated):
            return "", "日语例句存在未标注假名的汉字"
        if KANJI_RE.search(plain) and not FURIGANA_RE.search(sentence):
            return "", "日语汉字没有假名标注"
    key = sentence_key(sentence)
    if not key or key in used:
        return "", "例句与词库中其他例句重复"
    return f"{sentence} / {translation}", ""


def existing_sentence_keys(ja_words: list[dict[str, Any]], en_words: list[dict[str, Any]]) -> set[str]:
    return {
        sentence_key(split_existing_example(word.get("example")))
        for word in ja_words + en_words
        if clean_text(word.get("example"))
    }


def run_generation(client: DeepSeekClient, candidates: list[Candidate], batch_size: int,
                   ja_words: list[dict[str, Any]], en_words: list[dict[str, Any]],
                   report: GenerationReport) -> None:
    used = existing_sentence_keys(ja_words, en_words)
    pools = {
        "ja": [candidate for candidate in candidates if candidate.language == "ja"],
        "en": [candidate for candidate in candidates if candidate.language == "en"],
    }
    for language in ("ja", "en"):
        pool = pools[language]
        for offset in range(0, len(pool), batch_size):
            pending = pool[offset:offset + batch_size]
            last_reasons: dict[str, str] = {}
            for validation_attempt in range(3):
                if not pending:
                    break
                try:
                    results = client.request(language, pending)
                except FatalAPIError:
                    raise
                except CompilerError as exc:
                    for candidate in pending:
                        last_reasons[clean_text(candidate.word.get("_id"))] = str(exc)
                    break
                retry: list[Candidate] = []
                for candidate in pending:
                    item_id = clean_text(candidate.word.get("_id"))
                    item = results.get(item_id, {})
                    formatted, reason = validate_result(candidate, item, used)
                    if formatted:
                        target = ja_words if language == "ja" else en_words
                        target[candidate.index]["example"] = formatted
                        used.add(sentence_key(formatted.split(" / ", 1)[0]))
                        report.generated += 1
                        last_reasons.pop(item_id, None)
                    else:
                        last_reasons[item_id] = reason or "API 未返回对应词条"
                        candidate.retry_feedback = last_reasons[item_id]
                        candidate.rejected_sentence = clean_text(item.get("sentence"))
                        retry.append(candidate)
                pending = retry if validation_attempt < 2 else []
            for candidate in pending:
                item_id = clean_text(candidate.word.get("_id"))
                last_reasons.setdefault(item_id, "三次生成均未通过校验")
            for item_id, reason in last_reasons.items():
                candidate = next((item for item in pool if clean_text(item.word.get("_id")) == item_id), None)
                report.failures.append({
                    "id": item_id,
                    "word": clean_text(candidate.word.get("word")) if candidate else "",
                    "reason": reason,
                })
            completed = min(offset + batch_size, len(pool))
            print(f"::notice::{language} 已处理 {completed}/{len(pool)}，本次成功 {report.generated}")


def write_report(repo: Path, report: GenerationReport) -> None:
    reports = repo / "reports"
    reports.mkdir(exist_ok=True)
    payload = report.payload()
    (reports / "example-generation-latest.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    failure_lines = "\n".join(
        f"- `{item['id']}` {item['word']}：{item['reason']}" for item in report.failures[:100]
    ) or "- 无"
    markdown = f"""# 钟日例句生成报告

- 生成时间：{report.generated_at}
- 模型：`{report.model}`
- 选择范围：{report.language} / {report.level or '全部等级'}
- 本次选择：{report.selected}
- 成功写入：{report.generated}
- 清理已有多余注音：{report.normalized_existing}
- 退回已有错误注音：{report.cleared_invalid_existing}
- 未通过校验：{len(report.failures)}
- 剩余空例句：日语 {report.missing_after.get('ja', 0)}，英语 {report.missing_after.get('en', 0)}
- API 请求：{report.usage.requests}
- 输入 Token：{report.usage.input_tokens}
- 输出 Token：{report.usage.output_tokens}

## 未通过项目（最多显示 100 条）

{failure_lines}
"""
    (reports / "example-generation-latest.md").write_text(markdown, encoding="utf-8")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="为钟日词库中缺少例句的词条分批生成双语例句")
    parser.add_argument("--repo", default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument("--language", choices=["all", "ja", "en"], default="all")
    parser.add_argument("--level", default="", help="只处理指定等级，如 N5、CET-4；留空表示全部")
    parser.add_argument("--max-words", type=int, default=500, help="本次最多处理多少词，0 表示全部")
    parser.add_argument("--batch-size", type=int, default=20, help="每次 API 请求包含的词数（1～40）")
    parser.add_argument("--api-key-env", default="DEEPSEEK_API_KEY")
    parser.add_argument("--api-base-url", default=os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com"))
    parser.add_argument("--model", default=os.environ.get("DEEPSEEK_MODEL", "deepseek-v4-flash"))
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
        normalized, cleared = cleanup_existing_japanese_examples(ja_words)
        before = missing_counts(ja_words, en_words)
        candidates = select_candidates(ja_words, en_words, args.language, args.level, args.max_words)
        report = GenerationReport(
            generated_at=datetime.now(timezone.utc).isoformat(),
            model=args.model,
            language=args.language,
            level=args.level,
            max_words=args.max_words,
            batch_size=args.batch_size,
            missing_before=before,
            selected=len(candidates),
            normalized_existing=normalized,
            cleared_invalid_existing=cleared,
        )
        if candidates:
            api_key = os.environ.get(args.api_key_env, "").strip()
            if not api_key:
                raise FatalAPIError(
                    f"缺少 GitHub Secret：{args.api_key_env}。请在仓库 Settings → "
                    "Secrets and variables → Actions 中添加，绝对不要把密钥写入代码或聊天。"
                )
            client = DeepSeekClient(api_key, args.model, args.api_base_url, report.usage)
            run_generation(client, candidates, args.batch_size, ja_words, en_words, report)
            report.missing_after = missing_counts(ja_words, en_words)
            write_wordbank_assets(repo, ja_words, en_words)
        else:
            report.missing_after = before
            if normalized or cleared:
                write_wordbank_assets(repo, ja_words, en_words)
        write_report(repo, report)
        print(json.dumps(report.payload(), ensure_ascii=False, indent=2))
        return 0 if not candidates or report.generated > 0 else 3
    except CompilerError as exc:
        print(f"::error::{exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
