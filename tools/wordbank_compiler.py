#!/usr/bin/env python3
"""钟日词库编译器：把 GitHub/Anki/表格数据安全合并进双语内置词库。"""

from __future__ import annotations

import argparse
import csv
import hashlib
import html
import io
import json
import os
import re
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable


MAX_DOWNLOAD_BYTES = 200 * 1024 * 1024
MAX_ARCHIVE_FILES = 10_000
MAX_ARCHIVE_BYTES = 500 * 1024 * 1024
MAX_TEXT_BYTES = 30 * 1024 * 1024
SUPPORTED_SUFFIXES = {".apkg", ".anki2", ".anki21", ".csv", ".tsv", ".txt", ".json"}
BLOCKED_LICENSES = {"", "unknown", "none", "no-license", "unlicensed", "未注明", "不清楚"}
ZH_RE = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff]")
JA_RE = re.compile(r"[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]")
TAG_RE = re.compile(r"<[^>]+>")
SOUND_RE = re.compile(r"\[sound:[^\]]+\]", re.I)
BR_RE = re.compile(r"<br\s*/?>", re.I)


FIELD_ALIASES = {
    "word": [
        "word", "vocab", "vocabulary", "expression", "term", "front", "question",
        "単語", "表現", "日本語", "日文", "汉字", "漢字", "英语", "英語", "单词",
    ],
    "kana": ["kana", "reading", "hiragana", "furigana", "yomigana", "読み", "よみ", "假名", "仮名"],
    "meaning": [
        "meaning", "definition", "translation", "gloss", "answer", "back", "chinese",
        "释义", "解釋", "解释", "意思", "中文", "意味", "訳", "翻译", "翻譯",
    ],
    "type": ["type", "pos", "partofspeech", "part of speech", "词性", "詞性", "品詞"],
    "example": ["example", "sentence", "examples", "sentences", "例文", "例句", "用例"],
    "phonetic": ["phonetic", "ipa", "pronunciation", "pron", "音标", "音標", "发音", "發音"],
    "roots": ["roots", "root", "etymology", "word roots", "词根", "詞根", "词源", "詞源"],
    "level": ["level", "jlpt", "cefr", "grade", "等级", "等級", "级别", "級別"],
    "tags": ["tags", "tag", "标签", "標籤"],
    "folder": ["folder", "deck", "category", "book", "词书", "詞書", "分类", "分類"],
}
OUTPUT_FIELDS = {
    "ja": ["word", "kana", "type", "meaning", "example", "level", "tags"],
    "en": ["word", "type", "phonetic", "meaning", "example", "roots", "folder", "level", "tags"],
}
WORD_BANK_CHUNK_BYTES = 500 * 1024


class CompilerError(RuntimeError):
    pass


@dataclass
class SourceBatch:
    name: str
    fields: list[str]
    rows: list[dict[str, str]]
    origin: str


@dataclass
class Report:
    source: str
    source_name: str
    license: str
    requested_language: str
    source_author: str = ""
    source_commit: str = ""
    detected_license: str = ""
    started_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    files_seen: int = 0
    rows_seen: int = 0
    parsed: int = 0
    added: int = 0
    enriched_existing: int = 0
    duplicates: int = 0
    conflicts: list[dict[str, Any]] = field(default_factory=list)
    rejected: list[dict[str, Any]] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    mappings: list[dict[str, Any]] = field(default_factory=list)
    ai_requests: int = 0
    ai_input_tokens: int = 0
    ai_output_tokens: int = 0
    ai_status: str = "未启用"
    output_counts: dict[str, int] = field(default_factory=dict)

    def as_dict(self) -> dict[str, Any]:
        return self.__dict__.copy()


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value).replace("\x00", "").replace("\r\n", "\n").replace("\r", "\n")
    text = SOUND_RE.sub("", text)
    text = BR_RE.sub("\n", text)
    text = TAG_RE.sub("", text)
    text = html.unescape(text)
    text = re.sub(r"\[\[type:[^\]]+\]\]", "", text, flags=re.I)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def normalized_name(value: str) -> str:
    return re.sub(r"[\s_\-./\\:：()（）]+", "", clean_text(value).lower())


def infer_language(rows: Iterable[dict[str, str]], fields: Iterable[str]) -> str:
    sample = " ".join(clean_text(v) for row in list(rows)[:30] for v in row.values())
    field_blob = " ".join(fields).lower()
    if any(x in field_blob for x in ("japanese", "kana", "hiragana", "日本語", "読み")):
        return "ja"
    if re.search(r"[\u3040-\u30ff]", sample):
        return "ja"
    latin = len(re.findall(r"[A-Za-z]", sample))
    japanese = len(JA_RE.findall(sample))
    return "en" if latin > japanese * 2 else "ja"


def detect_mapping(fields: list[str], language: str, manual: dict[str, str] | None = None) -> dict[str, str]:
    result: dict[str, str] = {}
    manual = manual or {}
    exact = {normalized_name(name): name for name in fields}
    for target, source in manual.items():
        if target in OUTPUT_FIELDS[language] and source in fields:
            result[target] = source
    for target in OUTPUT_FIELDS[language]:
        if target in result:
            continue
        for alias in FIELD_ALIASES.get(target, []):
            if normalized_name(alias) in exact:
                result[target] = exact[normalized_name(alias)]
                break
    if "word" not in result and fields:
        result["word"] = fields[0]
    if "meaning" not in result and len(fields) > 1:
        remaining = [f for f in fields if f != result.get("word")]
        if remaining:
            result["meaning"] = remaining[0]
    return result


class AIClient:
    def __init__(self, api_key: str, model: str, base_url: str, report: Report):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url.rstrip("/")
        self.report = report

    @property
    def enabled(self) -> bool:
        return bool(self.api_key)

    def json(self, system: str, payload: dict[str, Any]) -> dict[str, Any]:
        body = json.dumps({
            "model": self.model,
            "messages": [
                {"role": "system", "content": system + " 只输出 JSON。"},
                {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.1,
            "max_tokens": 6000,
        }, ensure_ascii=False).encode("utf-8")
        request = urllib.request.Request(
            self.base_url + "/chat/completions",
            data=body,
            headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
            method="POST",
        )
        last_error: Exception | None = None
        for attempt in range(3):
            try:
                with urllib.request.urlopen(request, timeout=90) as response:
                    result = json.loads(response.read().decode("utf-8"))
                content = result["choices"][0]["message"]["content"]
                usage = result.get("usage", {})
                self.report.ai_requests += 1
                self.report.ai_input_tokens += int(usage.get("prompt_tokens", 0) or 0)
                self.report.ai_output_tokens += int(usage.get("completion_tokens", 0) or 0)
                return json.loads(content)
            except (OSError, KeyError, ValueError, json.JSONDecodeError) as exc:
                last_error = exc
                if attempt < 2:
                    time.sleep(2 ** attempt)
        raise CompilerError(f"AI 请求失败：{last_error}")

    def improve_mapping(self, fields: list[str], rows: list[dict[str, str]], language: str,
                        mapping: dict[str, str]) -> dict[str, str]:
        recognized: set[str] = set()
        for target in ("word", "meaning"):
            source = mapping.get(target, "")
            aliases = {normalized_name(value) for value in FIELD_ALIASES[target]}
            if normalized_name(source) in aliases:
                recognized.add(target)
        if not self.enabled or recognized == {"word", "meaning"}:
            return mapping
        response = self.json(
            "你是日英词典数据工程师。根据字段名与样例，把来源字段映射到钟日词库字段。不要翻译内容。",
            {
                "language": language,
                "allowed_targets": OUTPUT_FIELDS[language],
                "source_fields": fields,
                "current_mapping": mapping,
                "samples": rows[:5],
                "output_schema": {"mapping": {"target": "source_field"}},
            },
        )
        for target, source in response.get("mapping", {}).items():
            if target in OUTPUT_FIELDS[language] and source in fields:
                mapping[target] = source
        return mapping

    def enrich(self, entries: list[dict[str, Any]], language: str, mode: str) -> list[dict[str, Any]]:
        if not self.enabled or mode == "off":
            return entries
        result = [dict(item) for item in entries]
        candidates: list[tuple[int, dict[str, Any]]] = []
        for index, item in enumerate(result):
            missing = not item.get("meaning") or not item.get("type")
            missing = missing or (language == "ja" and not item.get("kana"))
            foreign_meaning = bool(item.get("meaning")) and not ZH_RE.search(item["meaning"])
            if mode == "all" or missing or foreign_meaning:
                candidates.append((index, item))
        for offset in range(0, len(candidates), 30):
            chunk = candidates[offset:offset + 30]
            payload_entries = []
            for local_id, (_, item) in enumerate(chunk):
                payload_entries.append({"id": local_id, **{k: item.get(k, "") for k in OUTPUT_FIELDS[language]}})
            response = self.json(
                "你是严谨的日英汉词典编辑。补齐缺失字段，把 meaning 写成简洁准确的中文；保留正确原值，无法确定则留空。"
                "日语补 kana/type，英语补 type/phonetic/roots；例句不得凭空添加具体人名或事实。",
                {
                    "language": language,
                    "entries": payload_entries,
                    "output_schema": {"entries": [{"id": 0, "fields": {"meaning": "", "type": ""}, "confidence": 0.0}]},
                },
            )
            for update in response.get("entries", []):
                try:
                    source_index, original = chunk[int(update["id"])]
                except (KeyError, ValueError, TypeError, IndexError):
                    continue
                confidence = float(update.get("confidence", 0) or 0)
                if confidence < 0.65:
                    continue
                for key, value in update.get("fields", {}).items():
                    value = clean_text(value)
                    if key in OUTPUT_FIELDS[language] and value and (mode == "all" or not original.get(key) or key == "meaning"):
                        result[source_index][key] = value
        return result


def read_limited(response: Any, limit: int) -> bytes:
    length = int(response.headers.get("Content-Length", 0) or 0)
    if length > limit:
        raise CompilerError(f"下载文件超过限制：{length} bytes")
    chunks: list[bytes] = []
    total = 0
    while True:
        chunk = response.read(min(1024 * 1024, limit - total + 1))
        if not chunk:
            break
        total += len(chunk)
        if total > limit:
            raise CompilerError(f"下载文件超过限制：{limit} bytes")
        chunks.append(chunk)
    return b"".join(chunks)


def github_archive_url(url: str) -> tuple[str, str] | None:
    parsed = urllib.parse.urlparse(url)
    if parsed.netloc.lower() not in {"github.com", "www.github.com"}:
        return None
    parts = [urllib.parse.unquote(p) for p in parsed.path.strip("/").split("/")]
    if len(parts) < 2:
        return None
    owner, repo = parts[0], re.sub(r"\.git$", "", parts[1])
    if len(parts) >= 5 and parts[2] == "blob":
        ref = parts[3]
        path = "/".join(parts[4:])
        return f"https://raw.githubusercontent.com/{owner}/{repo}/{ref}/{path}", Path(path).name
    if len(parts) >= 4 and parts[2] == "tree":
        ref = parts[3]
        return f"https://api.github.com/repos/{owner}/{repo}/zipball/{ref}", f"{repo}-{ref}.zip"
    return f"https://api.github.com/repos/{owner}/{repo}/zipball", f"{repo}.zip"


def github_source_metadata(url: str) -> dict[str, str]:
    parsed = urllib.parse.urlparse(url)
    if parsed.netloc.lower() not in {"github.com", "www.github.com"}:
        return {}
    parts = [urllib.parse.unquote(p) for p in parsed.path.strip("/").split("/")]
    if len(parts) < 2:
        return {}
    owner, repo = parts[0], re.sub(r"\.git$", "", parts[1])
    requested_ref = parts[3] if len(parts) >= 4 and parts[2] in {"tree", "blob"} else ""
    headers = {"User-Agent": "zhongri-wordbank-compiler/1.0", "Accept": "application/vnd.github+json"}
    if os.environ.get("GITHUB_TOKEN"):
        headers["Authorization"] = f"Bearer {os.environ['GITHUB_TOKEN']}"

    def fetch(path: str) -> dict[str, Any]:
        request = urllib.request.Request(f"https://api.github.com/repos/{owner}/{repo}/{path}".rstrip("/"), headers=headers)
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(read_limited(response, 2 * 1024 * 1024).decode("utf-8"))

    repository = fetch("")
    ref = requested_ref or clean_text(repository.get("default_branch", "main"))
    commit = fetch("commits/" + urllib.parse.quote(ref, safe=""))
    license_info = repository.get("license") or {}
    return {
        "author": owner,
        "commit": clean_text(commit.get("sha", "")),
        "detected_license": clean_text(license_info.get("spdx_id", "")),
    }


def materialize_source(source: str, temp_dir: Path) -> Path:
    parsed = urllib.parse.urlparse(source)
    if parsed.scheme not in {"http", "https"}:
        path = Path(source).expanduser().resolve()
        if not path.exists():
            raise CompilerError(f"找不到来源：{path}")
        return path
    converted = github_archive_url(source)
    url, filename = converted or (source, Path(urllib.parse.unquote(parsed.path)).name or "source.download")
    headers = {"User-Agent": "zhongri-wordbank-compiler/1.0", "Accept": "application/octet-stream"}
    if os.environ.get("GITHUB_TOKEN") and urllib.parse.urlparse(url).netloc in {"api.github.com", "raw.githubusercontent.com"}:
        headers["Authorization"] = f"Bearer {os.environ['GITHUB_TOKEN']}"
    request = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            data = read_limited(response, MAX_DOWNLOAD_BYTES)
            disposition = response.headers.get("Content-Disposition", "")
            match = re.search(r"filename=[\"']?([^\"';]+)", disposition)
            if match:
                filename = Path(match.group(1)).name
    except urllib.error.HTTPError as exc:
        raise CompilerError(f"下载失败（HTTP {exc.code}）：{url}") from exc
    target = temp_dir / (Path(filename).name or "source.download")
    target.write_bytes(data)
    return target


def safe_extract_zip(path: Path, target: Path) -> list[Path]:
    outputs: list[Path] = []
    total = 0
    with zipfile.ZipFile(path) as archive:
        infos = archive.infolist()
        if len(infos) > MAX_ARCHIVE_FILES:
            raise CompilerError(f"压缩包文件数超过限制：{len(infos)}")
        for info in infos:
            total += info.file_size
            if total > MAX_ARCHIVE_BYTES:
                raise CompilerError("压缩包解压后体积超过 500MB")
            if info.is_dir():
                continue
            relative = Path(info.filename)
            if relative.is_absolute() or ".." in relative.parts:
                raise CompilerError(f"压缩包含不安全路径：{info.filename}")
            output = target / relative
            output.parent.mkdir(parents=True, exist_ok=True)
            with archive.open(info) as source, output.open("wb") as destination:
                shutil.copyfileobj(source, destination)
            outputs.append(output)
    return outputs


def decode_text(data: bytes) -> str:
    for encoding in ("utf-8-sig", "utf-8", "utf-16", "gb18030", "shift_jis"):
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace")


def read_tabular(path: Path) -> SourceBatch:
    if path.stat().st_size > MAX_TEXT_BYTES:
        raise CompilerError(f"文本文件超过 30MB：{path.name}")
    text = decode_text(path.read_bytes())
    suffix = path.suffix.lower()
    delimiter = "\t" if suffix in {".tsv", ".txt"} else ","
    sample = text[:8192]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",\t;|")
        delimiter = dialect.delimiter
    except csv.Error:
        pass
    rows_raw = list(csv.reader(io.StringIO(text), delimiter=delimiter))
    rows_raw = [row for row in rows_raw if any(clean_text(x) for x in row)]
    if not rows_raw:
        return SourceBatch(path.name, [], [], str(path))
    first = [clean_text(x) for x in rows_raw[0]]
    alias_names = {normalized_name(a) for values in FIELD_ALIASES.values() for a in values}
    has_header = any(normalized_name(x) in alias_names for x in first)
    # Sniffer 在只有两行、且两列文字体系不同（如 apple/苹果）时很容易误判表头。
    if not has_header and len(rows_raw) >= 3:
        try:
            has_header = csv.Sniffer().has_header(sample)
        except csv.Error:
            has_header = False
    fields = first if has_header else ["Front", "Back"] + [f"Field {i}" for i in range(3, len(first) + 1)]
    data_rows = rows_raw[1:] if has_header else rows_raw
    rows = [{fields[i]: clean_text(value) for i, value in enumerate(row[:len(fields)])} for row in data_rows]
    return SourceBatch(path.name, fields, rows, str(path))


def read_json_file(path: Path) -> list[SourceBatch]:
    if path.stat().st_size > MAX_TEXT_BYTES:
        raise CompilerError(f"JSON 文件超过 30MB：{path.name}")
    payload = json.loads(decode_text(path.read_bytes()))
    if isinstance(payload, dict):
        for key in ("words", "cards", "notes", "entries", "data", "items"):
            if isinstance(payload.get(key), list):
                payload = payload[key]
                break
        else:
            payload = [payload]
    if not isinstance(payload, list):
        raise CompilerError(f"JSON 顶层必须是数组或包含 words/cards/data 数组：{path.name}")
    rows = []
    for item in payload:
        if isinstance(item, dict):
            row = {}
            for key, value in item.items():
                if isinstance(value, list):
                    value = ",".join(clean_text(part) for part in value)
                elif isinstance(value, dict):
                    value = json.dumps(value, ensure_ascii=False)
                row[str(key)] = clean_text(value)
            rows.append(row)
        elif isinstance(item, list):
            rows.append({f"Field {i + 1}": clean_text(v) for i, v in enumerate(item)})
    fields = list(dict.fromkeys(key for row in rows for key in row))
    return [SourceBatch(path.name, fields, rows, str(path))]


def read_anki_database(path: Path, origin: str) -> list[SourceBatch]:
    uri = f"file:{urllib.parse.quote(str(path.resolve()))}?mode=ro"
    connection = sqlite3.connect(uri, uri=True)
    try:
        models_raw = connection.execute("SELECT models FROM col LIMIT 1").fetchone()
        models = json.loads(models_raw[0]) if models_raw else {}
        grouped: dict[str, list[dict[str, str]]] = {}
        grouped_fields: dict[str, list[str]] = {}
        for mid, flds, tags in connection.execute("SELECT mid, flds, tags FROM notes"):
            model = models.get(str(mid), {})
            model_name = clean_text(model.get("name", f"model-{mid}"))
            definitions = sorted(model.get("flds", []), key=lambda item: item.get("ord", 0))
            names = [clean_text(item.get("name", f"Field {i + 1}")) for i, item in enumerate(definitions)]
            values = [clean_text(value) for value in flds.split("\x1f")]
            if not names:
                names = [f"Field {i + 1}" for i in range(len(values))]
            row = {name: values[i] if i < len(values) else "" for i, name in enumerate(names)}
            row["Tags"] = clean_text(tags)
            grouped.setdefault(model_name, []).append(row)
            grouped_fields[model_name] = list(dict.fromkeys(names + ["Tags"]))
        return [SourceBatch(f"{Path(origin).name}:{name}", grouped_fields[name], rows, origin) for name, rows in grouped.items()]
    except sqlite3.DatabaseError as exc:
        raise CompilerError(f"无法读取 Anki 数据库 {Path(origin).name}：{exc}") from exc
    finally:
        connection.close()


def read_apkg(path: Path, temp_dir: Path) -> list[SourceBatch]:
    folder = temp_dir / ("apkg-" + hashlib.sha1(str(path).encode()).hexdigest()[:10])
    folder.mkdir(parents=True, exist_ok=True)
    files = safe_extract_zip(path, folder)
    # 新版 .apkg 会同时放一个兼容用的 dummy collection.anki2 和真实 collection.anki21。
    candidates = [p for preferred in ("collection.anki21", "collection.anki2") for p in files if p.name == preferred]
    if not candidates:
        raise CompilerError(f"{path.name} 不含可读取的 collection.anki2/collection.anki21")
    return read_anki_database(candidates[0], str(path))


def collect_batches(source: Path, temp_dir: Path, report: Report) -> list[SourceBatch]:
    candidates: list[Path] = []
    if source.is_dir():
        candidates = [p for p in source.rglob("*") if p.is_file() and p.suffix.lower() in SUPPORTED_SUFFIXES]
    elif source.suffix.lower() in {".zip", ".deck", ".download"} or zipfile.is_zipfile(source):
        if source.suffix.lower() == ".apkg":
            candidates = [source]
        else:
            folder = temp_dir / "archive"
            folder.mkdir(parents=True, exist_ok=True)
            candidates = [p for p in safe_extract_zip(source, folder) if p.suffix.lower() in SUPPORTED_SUFFIXES]
    else:
        candidates = [source]
    candidates = sorted(candidates, key=lambda p: str(p).lower())
    batches: list[SourceBatch] = []
    for path in candidates:
        suffix = path.suffix.lower()
        try:
            if suffix == ".apkg":
                batches.extend(read_apkg(path, temp_dir))
            elif suffix in {".anki2", ".anki21"}:
                batches.extend(read_anki_database(path, str(path)))
            elif suffix == ".json":
                batches.extend(read_json_file(path))
            elif suffix in {".csv", ".tsv", ".txt"}:
                batches.append(read_tabular(path))
        except (CompilerError, OSError, ValueError, json.JSONDecodeError) as exc:
            report.warnings.append(str(exc))
        report.files_seen += 1
    if not batches:
        raise CompilerError("来源中没有找到可读取的 .apkg/.anki2/.csv/.tsv/.txt/.json 数据")
    return batches


def parse_manual_mapping(value: str) -> dict[str, str]:
    if not value.strip():
        return {}
    try:
        payload = json.loads(value)
    except json.JSONDecodeError as exc:
        raise CompilerError(f"field-map 不是有效 JSON：{exc}") from exc
    if not isinstance(payload, dict):
        raise CompilerError("field-map 必须是 JSON 对象")
    return {str(k): str(v) for k, v in payload.items()}


def map_batch(batch: SourceBatch, language: str, manual: dict[str, str], ai: AIClient,
              report: Report, default_level: str, default_folder: str) -> list[dict[str, Any]]:
    mapping = detect_mapping(batch.fields, language, manual)
    mapping = ai.improve_mapping(batch.fields, batch.rows, language, mapping)
    report.mappings.append({"batch": batch.name, "language": language, "mapping": mapping, "rows": len(batch.rows)})
    entries: list[dict[str, Any]] = []
    for row_number, row in enumerate(batch.rows, 1):
        report.rows_seen += 1
        entry: dict[str, Any] = {}
        for target in OUTPUT_FIELDS[language]:
            source_field = mapping.get(target)
            entry[target] = clean_text(row.get(source_field, "")) if source_field else ""
        if entry.get("tags"):
            entry["tags"] = [x for x in re.split(r"[,;\s]+", entry["tags"]) if x]
        else:
            entry["tags"] = []
        if default_level and not entry.get("level"):
            entry["level"] = default_level
        if language == "en" and default_folder and not entry.get("folder"):
            entry["folder"] = default_folder
        entry["_source"] = batch.name
        entry["_row"] = row_number
        if not entry.get("word"):
            report.rejected.append({"batch": batch.name, "row": row_number, "reason": "缺少单词"})
            continue
        if language == "en" and not re.search(r"[A-Za-z]", entry["word"]):
            report.rejected.append({"batch": batch.name, "row": row_number, "word": entry["word"], "reason": "不像英语单词"})
            continue
        entries.append(entry)
        report.parsed += 1
    return entries


def load_js_words(path: Path, variable: str) -> list[dict[str, Any]]:
    source = path.read_text(encoding="utf-8")
    language = "ja" if variable == "DefaultWords" else "en"
    chunk_dir = path.parent / "wordbanks"
    if chunk_dir.exists():
        for chunk in sorted(chunk_dir.glob(f"{language}-*.js")):
            source += "\n" + chunk.read_text(encoding="utf-8")
        finalize = chunk_dir / "finalize.js"
        if finalize.exists():
            source += "\n" + finalize.read_text(encoding="utf-8")
    script = source + f"\nprocess.stdout.write(JSON.stringify({variable}));\n"
    result = subprocess.run(["node"], input=script, text=True, capture_output=True, timeout=30)
    if result.returncode != 0:
        raise CompilerError(f"无法读取 {path.name}：{result.stderr.strip()}")
    payload = json.loads(result.stdout)
    if not isinstance(payload, list):
        raise CompilerError(f"{path.name} 中的 {variable} 不是数组")
    return payload


def identity(entry: dict[str, Any], language: str) -> str:
    word = re.sub(r"\s+", " ", clean_text(entry.get("word", ""))).casefold()
    if language == "ja":
        kana = re.sub(r"\s+", "", clean_text(entry.get("kana", ""))).casefold()
        return f"{word}\x1f{kana}"
    return word


def stable_id(entry: dict[str, Any], language: str) -> str:
    digest = hashlib.sha1((language + "\x1f" + identity(entry, language)).encode("utf-8")).hexdigest()[:14]
    return f"builtin-{language}-import-{digest}"


def merge_entries(existing: list[dict[str, Any]], incoming: list[dict[str, Any]], language: str,
                  report: Report) -> list[dict[str, Any]]:
    output = [dict(item) for item in existing]
    by_key = {identity(item, language): item for item in output}
    by_word: dict[str, list[dict[str, Any]]] = {}
    for item in output:
        by_word.setdefault(clean_text(item.get("word", "")).casefold(), []).append(item)
    for raw in incoming:
        item = {k: v for k, v in raw.items() if not k.startswith("_") or k == "_id"}
        key = identity(item, language)
        current = by_key.get(key)
        if current is None and language == "ja" and not item.get("kana"):
            candidates = by_word.get(clean_text(item.get("word", "")).casefold(), [])
            if len(candidates) == 1:
                current = candidates[0]
        if current is not None:
            changed = False
            conflict_fields = []
            for field_name in OUTPUT_FIELDS[language]:
                value = item.get(field_name)
                if not value:
                    continue
                if not current.get(field_name):
                    current[field_name] = value
                    changed = True
                elif field_name not in {"tags", "level", "folder"} and clean_text(current[field_name]) != clean_text(value):
                    conflict_fields.append(field_name)
            if isinstance(item.get("tags"), list):
                tags = list(dict.fromkeys(list(current.get("tags", [])) + item["tags"]))
                if tags != current.get("tags", []):
                    current["tags"] = tags
                    changed = True
            if conflict_fields:
                report.conflicts.append({"word": item.get("word"), "fields": conflict_fields, "action": "保留原词库值"})
            if changed:
                report.enriched_existing += 1
            else:
                report.duplicates += 1
            continue
        if not item.get("meaning"):
            report.rejected.append({"word": item.get("word"), "reason": "缺少中文释义，且 AI 未成功补全"})
            continue
        item["_id"] = stable_id(item, language)
        item["builtIn"] = True
        item["lang"] = language
        item.setdefault("level", "")
        item.setdefault("difficulty", 0)
        item.setdefault("tags", [])
        if language == "ja":
            item.setdefault("kana", "")
            item.setdefault("type", "")
            item.setdefault("example", "")
        else:
            item.setdefault("type", "")
            item.setdefault("phonetic", "")
            item.setdefault("example", "")
            item.setdefault("roots", "")
            item.setdefault("folder", "导入词库")
        output.append(item)
        by_key[key] = item
        by_word.setdefault(clean_text(item.get("word", "")).casefold(), []).append(item)
        report.added += 1
    return output


def render_js(words: list[dict[str, Any]], language: str) -> str:
    variable = "DefaultWords" if language == "ja" else "DefaultEnglishWords"
    title = "日语" if language == "ja" else "英语"
    payload = json.dumps(words, ensure_ascii=False, indent=2)
    suffix = ""
    if language == "ja":
        suffix = """

const Gojuon = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ".split('');

DefaultWords.forEach((word, index) => {
  word._id = word._id || `ja-built-in-${String(index + 1).padStart(6, '0')}`;
  word.level = word.level || '';
  word.difficulty = Number.isInteger(word.difficulty) ? word.difficulty : 0;
  word.tags = Array.isArray(word.tags) ? word.tags : [];
  word.builtIn = true;
});
"""
    else:
        suffix = """

DefaultEnglishWords.forEach((word, index) => {
  word._id = word._id || `en-built-in-${String(index + 1).padStart(6, '0')}`;
  word.level = word.level || '';
  word.difficulty = Number.isInteger(word.difficulty) ? word.difficulty : 0;
  word.tags = Array.isArray(word.tags) ? word.tags : [];
  word.builtIn = true;
});
"""
    return f"/**\n * 钟日 - {title}词库（由 tools/wordbank_compiler.py 生成，请勿手工改 ID）\n */\n\nconst {variable} = {payload};\n{suffix}"


def split_word_chunks(words: list[dict[str, Any]]) -> list[list[dict[str, Any]]]:
    chunks: list[list[dict[str, Any]]] = []
    current: list[dict[str, Any]] = []
    current_bytes = 2
    for word in words:
        size = len(json.dumps(word, ensure_ascii=False, separators=(",", ":")).encode("utf-8")) + 2
        if current and current_bytes + size > WORD_BANK_CHUNK_BYTES:
            chunks.append(current)
            current = []
            current_bytes = 2
        current.append(word)
        current_bytes += size
    if current:
        chunks.append(current)
    return chunks


def render_wordbank_base(language: str) -> str:
    if language == "ja":
        return """/** 钟日 - 日语词库入口；正式数据位于 wordbanks/ja-*.js。 */
const DefaultWords = [];
const Gojuon = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ".split('');
"""
    return """/** 钟日 - 英语词库入口；正式数据位于 wordbanks/en-*.js。 */
const DefaultEnglishWords = [];
"""


def render_finalize() -> str:
    return """/** 钟日词库统一收尾。 */
if (typeof DefaultWords !== 'undefined') {
  DefaultWords.forEach((word, index) => {
    word._id = word._id || `ja-built-in-${String(index + 1).padStart(6, '0')}`;
    word.level = word.level || '';
    word.difficulty = Number.isInteger(word.difficulty) ? word.difficulty : 0;
    word.tags = Array.isArray(word.tags) ? word.tags : [];
    word.builtIn = true;
  });
}

if (typeof DefaultEnglishWords !== 'undefined') {
  DefaultEnglishWords.forEach((word, index) => {
    word._id = word._id || `en-built-in-${String(index + 1).padStart(6, '0')}`;
    word.level = word.level || '';
    word.difficulty = Number.isInteger(word.difficulty) ? word.difficulty : 0;
    word.tags = Array.isArray(word.tags) ? word.tags : [];
    word.builtIn = true;
  });
}
"""


def sync_index_wordbank_scripts(path: Path, assets: list[str]) -> None:
    source = path.read_text(encoding="utf-8")
    block = "<!-- WORDBANK_CHUNKS_START -->\n" + "\n".join(
        f'<script src="{asset}"></script>' for asset in assets if asset != "wordbanks/assets.js"
    ) + "\n<!-- WORDBANK_CHUNKS_END -->"
    pattern = re.compile(r"<!-- WORDBANK_CHUNKS_START -->.*?<!-- WORDBANK_CHUNKS_END -->", re.S)
    if pattern.search(source):
        source = pattern.sub(block, source)
    else:
        marker = '<script src="rote-learning-core.js"></script>'
        if marker not in source:
            raise CompilerError("index.html 中找不到循环强记脚本标记")
        source = source.replace(marker, block + "\n" + marker, 1)
    path.write_text(source, encoding="utf-8")


def write_wordbank_assets(repo: Path, ja_words: list[dict[str, Any]], en_words: list[dict[str, Any]]) -> None:
    directory = repo / "wordbanks"
    directory.mkdir(exist_ok=True)
    for stale in list(directory.glob("ja-*.js")) + list(directory.glob("en-*.js")):
        stale.unlink()

    assets: list[str] = ["wordbanks/assets.js"]
    for language, variable, words in (
        ("ja", "DefaultWords", ja_words),
        ("en", "DefaultEnglishWords", en_words),
    ):
        for index, chunk in enumerate(split_word_chunks(words), 1):
            name = f"{language}-{index:03d}.js"
            payload = json.dumps(chunk, ensure_ascii=False, separators=(",", ":"))
            (directory / name).write_text(f"{variable}.push(...{payload});\n", encoding="utf-8")
            assets.append(f"wordbanks/{name}")
    (directory / "finalize.js").write_text(render_finalize(), encoding="utf-8")
    assets.append("wordbanks/finalize.js")
    manifest = "const WORD_BANK_ASSETS = " + json.dumps([f"./{asset}" for asset in assets], ensure_ascii=False, indent=2) + ";\n"
    (directory / "assets.js").write_text(manifest, encoding="utf-8")
    (repo / "data.js").write_text(render_wordbank_base("ja"), encoding="utf-8")
    (repo / "english-data.js").write_text(render_wordbank_base("en"), encoding="utf-8")
    sync_index_wordbank_scripts(repo / "index.html", assets)
    digest_source = json.dumps(ja_words, ensure_ascii=False, separators=(",", ":"))
    digest_source += json.dumps(en_words, ensure_ascii=False, separators=(",", ":"))
    update_cache_version(repo / "sw.js", digest_source, "")


def update_cache_version(path: Path, ja_content: str, en_content: str) -> None:
    digest = hashlib.sha256((ja_content + en_content).encode("utf-8")).hexdigest()[:12]
    source = path.read_text(encoding="utf-8")
    source, count = re.subn(r"const CACHE_NAME = ['\"][^'\"]+['\"];", f"const CACHE_NAME = 'zhongri-wordbank-{digest}';", source, count=1)
    if count != 1:
        raise CompilerError("无法更新 sw.js 的 CACHE_NAME")
    path.write_text(source, encoding="utf-8")


def write_reports(repo: Path, report: Report) -> None:
    reports = repo / "reports"
    reports.mkdir(exist_ok=True)
    payload = report.as_dict()
    (reports / "wordbank-latest.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    conflict_lines = "\n".join(f"- {item}" for item in report.conflicts[:50]) or "- 无"
    rejected_lines = "\n".join(f"- {item}" for item in report.rejected[:50]) or "- 无"
    markdown = f"""# 钟日词库更新报告

- 来源：`{report.source}`
- 来源名：{report.source_name}
- 许可：{report.license}
- GitHub 检测许可：{report.detected_license or '不适用/未识别'}
- 来源作者/提交：{report.source_author or '未识别'} / {report.source_commit or '未识别'}
- 目标语言：{report.requested_language}
- 扫描文件/原始行：{report.files_seen} / {report.rows_seen}
- 成功解析/新增：{report.parsed} / {report.added}
- 补全原词/重复：{report.enriched_existing} / {report.duplicates}
- AI：{report.ai_status}，请求 {report.ai_requests} 次，输入/输出 Token {report.ai_input_tokens}/{report.ai_output_tokens}
- 当前词数：日语 {report.output_counts.get('ja', 0)}，英语 {report.output_counts.get('en', 0)}

## 冲突（保留原值）

{conflict_lines}

## 拒绝项

{rejected_lines}
"""
    (reports / "wordbank-latest.md").write_text(markdown, encoding="utf-8")


def update_ledger(repo: Path, args: argparse.Namespace, report: Report) -> None:
    path = repo / "wordbank-sources.json"
    payload = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {"version": 1, "imports": []}
    fingerprint = hashlib.sha256(f"{args.source}\x1f{args.license}\x1f{args.source_name}".encode()).hexdigest()[:16]
    record = {
        "fingerprint": fingerprint,
        "source": safe_source_label(args.source),
        "name": args.source_name,
        "license": args.license,
        "detectedLicense": report.detected_license,
        "author": report.source_author,
        "commit": report.source_commit,
        "language": args.language,
        "importedAt": datetime.now(timezone.utc).isoformat(),
        "added": report.added,
        "enriched": report.enriched_existing,
    }
    payload.setdefault("imports", []).append(record)
    payload["imports"] = payload["imports"][-100:]
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def validate_license(value: str) -> None:
    if value.strip().lower() in BLOCKED_LICENSES:
        raise CompilerError("来源没有明确许可，已阻止公开合并。请填写来源标注的许可证或 public-domain。")


def safe_source_label(source: str) -> str:
    """报告只保留公开路径，避免把临时签名或访问令牌提交进仓库。"""
    parsed = urllib.parse.urlparse(source)
    if parsed.scheme in {"http", "https"}:
        return urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", "", ""))
    return Path(source).name


def run(args: argparse.Namespace) -> Report:
    validate_license(args.license)
    repo = Path(args.repo).resolve()
    if not (repo / "data.js").exists() or not (repo / "english-data.js").exists():
        raise CompilerError(f"不是钟日项目目录：{repo}")
    report = Report(safe_source_label(args.source), args.source_name, args.license, args.language)
    try:
        metadata = github_source_metadata(args.source)
        report.source_author = metadata.get("author", "")
        report.source_commit = metadata.get("commit", "")
        report.detected_license = metadata.get("detected_license", "")
        detected = report.detected_license.lower()
        declared = args.license.strip().lower()
        if detected and detected != "noassertion" and detected != declared:
            report.warnings.append(f"声明许可 {args.license} 与 GitHub 检测值 {report.detected_license} 不同，请查看来源许可证文件。")
        if detected == "noassertion":
            report.warnings.append("GitHub 未自动识别仓库许可证；本次使用工作流中填写的许可声明。")
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        report.warnings.append(f"未能读取 GitHub 来源元数据：{exc}")
    api_key = os.environ.get(args.ai_key_env, "") if args.ai_mode != "off" else ""
    ai = AIClient(api_key, args.ai_model, args.ai_base_url, report)
    if args.ai_mode == "off":
        report.ai_status = "关闭"
    elif ai.enabled:
        report.ai_status = f"已启用（{args.ai_model} / {args.ai_mode}）"
    else:
        report.ai_status = f"未找到 {args.ai_key_env}，已使用非 AI 流程"
        report.warnings.append(report.ai_status)
    manual = parse_manual_mapping(args.field_map)
    with tempfile.TemporaryDirectory(prefix="zhongri-wordbank-") as folder:
        temp_dir = Path(folder)
        source = materialize_source(args.source, temp_dir)
        batches = collect_batches(source, temp_dir, report)
        by_language: dict[str, list[dict[str, Any]]] = {"ja": [], "en": []}
        for batch in batches:
            language = args.language if args.language in {"ja", "en"} else infer_language(batch.rows, batch.fields)
            entries = map_batch(batch, language, manual, ai, report, args.level, args.folder)
            by_language[language].extend(entries)
        for language in ("ja", "en"):
            if args.max_words > 0:
                by_language[language] = by_language[language][:args.max_words]
            by_language[language] = ai.enrich(by_language[language], language, args.ai_mode)

    ja_existing = load_js_words(repo / "data.js", "DefaultWords")
    en_existing = load_js_words(repo / "english-data.js", "DefaultEnglishWords")
    ja_words = merge_entries(ja_existing, by_language["ja"], "ja", report)
    en_words = merge_entries(en_existing, by_language["en"], "en", report)
    ja_content = render_js(ja_words, "ja")
    en_content = render_js(en_words, "en")
    report.output_counts = {"ja": len(ja_words), "en": len(en_words)}
    if not args.dry_run:
        write_wordbank_assets(repo, ja_words, en_words)
        update_ledger(repo, args, report)
        write_reports(repo, report)
    return report


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="把 GitHub/Anki/CSV/JSON 词库合并到钟日 PWA")
    parser.add_argument("--source", required=True, help="本地路径、HTTPS 下载链接或 GitHub 仓库/文件链接")
    parser.add_argument("--language", choices=["auto", "ja", "en"], default="auto")
    parser.add_argument("--license", required=True, help="来源许可证，如 MIT、CC0-1.0、CC-BY-4.0、public-domain")
    parser.add_argument("--source-name", default="外部词库")
    parser.add_argument("--repo", default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument("--field-map", default="", help='手工字段映射 JSON，如 {"word":"Front","meaning":"Back"}')
    parser.add_argument("--level", default="")
    parser.add_argument("--folder", default="导入词库")
    parser.add_argument("--max-words", type=int, default=0, help="每种语言最多处理多少词，0 为不限")
    parser.add_argument("--ai-mode", choices=["off", "missing", "all"], default="missing")
    parser.add_argument("--ai-key-env", default="DEEPSEEK_API_KEY")
    parser.add_argument("--ai-base-url", default=os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com"))
    parser.add_argument("--ai-model", default=os.environ.get("DEEPSEEK_MODEL", "deepseek-v4-flash"))
    parser.add_argument("--dry-run", action="store_true")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        report = run(args)
    except CompilerError as exc:
        print(f"::error::{exc}", file=sys.stderr)
        return 2
    print(json.dumps(report.as_dict(), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
