#!/usr/bin/env python3
"""用明确许可的开放数据构建钟日首批 JLPT/CET 正式词库。"""

from __future__ import annotations

import argparse
import csv
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from wordbank_compiler import Report, load_js_words, merge_entries, write_wordbank_assets


PITCH_CHARS = "⓪①②③④⑤⑥⑦⑧⑨⑩"
KANJI_RE = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff々〆ヶ]+[（(]([^）)]*)[）)]")
PAREN_RE = re.compile(r"[（(][^）)]*[）)]")
JA_DEF_RE = re.compile(rf"^[{PITCH_CHARS}\s]*([^\s]+)\s+(.+)$")
POS_MARK_RE = re.compile(r"(?m)^(n|v|vt|vi|a|s|adj|ad|adv|prep|conj|pron|num|art|int)\.")


TYPE_NAMES = {
    "n": "名词",
    "v": "动词",
    "vt": "及物动词",
    "vi": "不及物动词",
    "adj": "形容词",
    "a": "形容词",
    "s": "形容词",
    "ad": "副词",
    "adv": "副词",
    "prep": "介词",
    "conj": "连词",
    "pron": "代词",
    "num": "数词",
    "art": "冠词",
    "int": "感叹词",
}


def load_json(path: Path) -> list[dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, list):
        raise ValueError(f"{path} 顶层不是数组")
    return payload


def parse_japanese_notation(value: str) -> tuple[str, str]:
    source = str(value or "").strip()
    word = PAREN_RE.sub("", source).replace(" ", "")
    kana = KANJI_RE.sub(lambda match: match.group(1), source)
    kana = re.sub(r"[（）()]", "", kana).replace(" ", "")
    return word, kana


def parse_japanese_definition(values: Any) -> tuple[str, str, str]:
    source = "；".join(str(value).strip() for value in (values or []) if str(value).strip())
    match = JA_DEF_RE.match(source)
    if not match:
        return "", source, ""
    raw_type, meaning = match.groups()
    pitch_match = re.match(rf"^[{PITCH_CHARS}]", source)
    pitch = pitch_match.group(0) if pitch_match else ""
    type_name = (
        raw_type.replace("名", "名词")
        .replace("自动", "自动词")
        .replace("他动", "他动词")
        .replace("自他动", "自他动词")
        .replace("副", "副词")
        .replace("接续", "接续词")
        .replace("连体", "连体词")
    )
    return type_name, meaning.strip(), pitch


def english_type_from_ecdict(row: dict[str, str]) -> str:
    markers = []
    for source in (row.get("translation", ""), row.get("definition", ""), row.get("pos", "")):
        markers.extend(POS_MARK_RE.findall(source or ""))
    names = []
    for marker in markers:
        name = TYPE_NAMES.get(marker, "")
        if name and name not in names:
            names.append(name)
    return "・".join(names)


def parse_english_definitions(values: Any) -> tuple[str, str]:
    meanings = []
    types = []
    for value in values or []:
        text = re.sub(r"\s+", " ", str(value)).strip()
        match = re.search(r"\s*\(([^()]*)\)\s*$", text)
        if match:
            for marker in re.split(r"[&/,\s]+", match.group(1).replace(".", "")):
                name = TYPE_NAMES.get(marker, "")
                if name and name not in types:
                    types.append(name)
            text = text[:match.start()].strip()
        if text and text not in meanings:
            meanings.append(text)
    return "；".join(meanings), "・".join(types)


def load_ecdict(path: Path, target_words: set[str]) -> dict[str, dict[str, str]]:
    output: dict[str, dict[str, str]] = {}
    with path.open(encoding="utf-8", newline="") as source:
        for row in csv.DictReader(source):
            key = str(row.get("word", "")).strip().casefold()
            if key not in target_words:
                continue
            current = output.get(key)
            richness = sum(bool(row.get(field)) for field in ("phonetic", "translation", "definition", "pos", "tag"))
            old_richness = sum(bool(current and current.get(field)) for field in ("phonetic", "translation", "definition", "pos", "tag"))
            if current is None or richness > old_richness:
                output[key] = row
    return output


def build_jlpt_level_map(openjlpt_dir: Path) -> tuple[dict[tuple[str, str], str], dict[str, set[str]]]:
    by_key: dict[tuple[str, str], str] = {}
    by_word: dict[str, set[str]] = {}
    for level in ("N5", "N4", "N3", "N2", "N1"):
        for row in load_json(openjlpt_dir / f"{level.lower()}.json"):
            word = str(row.get("word", "")).strip()
            reading = str(row.get("reading", "")).strip()
            if not reading and re.fullmatch(r"[\u3040-\u30ffー]+", word):
                reading = word
            by_key.setdefault((word, reading), level)
            by_word.setdefault(word, set()).add(level)
    return by_key, by_word


def build_japanese(qwerty_dir: Path, openjlpt_dir: Path) -> tuple[list[dict[str, Any]], dict[str, int]]:
    level_by_key, levels_by_word = build_jlpt_level_map(openjlpt_dir)
    source_rows = []
    for filename in (
        "Jap_High-Frequency_N4N5.json",
        "Jap_High-Frequency_N3.json",
        "Jap_High-Frequency_N2.json",
        "Jap_High-Frequency_N1.json",
    ):
        source_rows.extend(load_json(qwerty_dir / filename))

    words_by_key: dict[str, dict[str, Any]] = {}
    counts = {level: 0 for level in ("N5", "N4", "N3", "N2", "N1")}
    for row in source_rows:
        word, kana = parse_japanese_notation(row.get("notation", ""))
        if not word:
            continue
        level = level_by_key.get((word, kana), "")
        if not level and len(levels_by_word.get(word, set())) == 1:
            level = next(iter(levels_by_word[word]))
        if not level:
            continue
        type_name, meaning, pitch = parse_japanese_definition(row.get("trans"))
        if not meaning:
            continue
        key = f"{word}\x1f{kana}"
        if key in words_by_key:
            current = words_by_key[key]
            old_meanings = [part.strip() for part in current["meaning"].split("；") if part.strip()]
            new_meanings = [part.strip() for part in meaning.split("；") if part.strip()]
            current["meaning"] = "；".join(dict.fromkeys(old_meanings + new_meanings))
            if type_name and type_name not in current["type"]:
                current["type"] = "・".join(filter(None, [current["type"], type_name]))
            continue
        counts[level] += 1
        words_by_key[key] = {
                "word": word,
                "kana": kana,
                "type": type_name,
                "meaning": meaning,
                "example": "",
                "level": level,
                "difficulty": 0,
                "tags": ["JLPT", level, "高频词"],
                "pitch": pitch,
                "sourceName": "Qwerty Learner 中文释义 + OpenJLPT 分级",
                "sourceVersion": "e0dc7a09 + 450fd50f",
                "sourceLevels": [{"source": "OpenJLPT", "level": level}],
                "dataVersion": 1,
            }
    order = {"N5": 0, "N4": 1, "N3": 2, "N2": 3, "N1": 4}
    words = sorted(words_by_key.values(), key=lambda item: (order[item["level"]], item["word"], item["kana"]))
    return words, counts


def build_english(qwerty_dir: Path, ecdict_csv: Path) -> tuple[list[dict[str, Any]], dict[str, int]]:
    level_rows = {
        "CET-4": load_json(qwerty_dir / "CET4_T.json"),
        "CET-6": load_json(qwerty_dir / "CET6_T.json"),
    }
    targets = {
        str(row.get("name", "")).strip().casefold()
        for rows in level_rows.values()
        for row in rows
        if str(row.get("name", "")).strip()
    }
    ecdict = load_ecdict(ecdict_csv, targets)
    seen: set[str] = set()
    words: list[dict[str, Any]] = []
    counts = {"CET-4": 0, "CET-6": 0}
    for level in ("CET-4", "CET-6"):
        for row in level_rows[level]:
            word = str(row.get("name", "")).strip()
            key = word.casefold()
            if not word or key in seen:
                continue
            meaning, qwerty_type = parse_english_definitions(row.get("trans"))
            if not meaning:
                continue
            extra = ecdict.get(key, {})
            phonetic = str(row.get("usphone") or extra.get("phonetic") or "").strip().strip("/[]")
            seen.add(key)
            counts[level] += 1
            ecdict_type = english_type_from_ecdict(extra)
            type_names = list(dict.fromkeys(filter(None, (ecdict_type.split("・") + qwerty_type.split("・")))))
            words.append({
                "word": word,
                "type": "・".join(type_names),
                "phonetic": f"/{phonetic}/" if phonetic else "",
                "meaning": meaning,
                "example": "",
                "roots": "",
                "folder": "四级词汇" if level == "CET-4" else "六级词汇",
                "level": level,
                "difficulty": 0,
                "tags": [level, "大学英语"],
                "sourceName": "Qwerty Learner + ECDICT",
                "sourceVersion": "e0dc7a09 + bc015ed2",
                "sourceLevels": [{"source": "qwerty-learner-vscode", "level": level}],
                "dataVersion": 1,
            })
    return words, counts


def update_source_ledger(repo: Path, summary: dict[str, Any]) -> None:
    path = repo / "wordbank-sources.json"
    payload = json.loads(path.read_text(encoding="utf-8"))
    source_urls = {
        "https://github.com/Realkai42/qwerty-learner-vscode",
        "https://github.com/evanclan/OpenJLPT",
        "https://github.com/skywind3000/ECDICT",
    }
    imports = [item for item in payload.get("imports", []) if item.get("source") not in source_urls]
    imported_at = datetime.now(timezone.utc).isoformat()
    imports.extend([
        {
            "fingerprint": "qwerty-e0dc7a09",
            "source": "https://github.com/Realkai42/qwerty-learner-vscode",
            "name": "JLPT 中文释义与 CET-4/CET-6 词表",
            "license": "MIT",
            "author": "Kaiyi ZHANG",
            "commit": "e0dc7a09a5e0946d77b2c279f72a89daf3659b97",
            "language": "ja+en",
            "importedAt": imported_at,
            "accepted": summary["incoming"]["ja"] + summary["incoming"]["en"],
        },
        {
            "fingerprint": "openjlpt-450fd50f",
            "source": "https://github.com/evanclan/OpenJLPT",
            "name": "JLPT N5–N1 分级校验",
            "license": "CC-BY-SA-4.0",
            "commit": "450fd50f58f52e26502e9032632bc3f44fdb0725",
            "language": "ja",
            "importedAt": imported_at,
            "accepted": summary["incoming"]["ja"],
        },
        {
            "fingerprint": "ecdict-bc015ed2",
            "source": "https://github.com/skywind3000/ECDICT",
            "name": "CET 词性与音标补全",
            "license": "MIT",
            "author": "Linwei",
            "commit": "bc015ed2e24a7abef49fc6dbbb7fe32c1dadaf8b",
            "language": "en",
            "importedAt": imported_at,
            "accepted": summary["incoming"]["en"],
        },
    ])
    payload["imports"] = imports
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--qwerty-dicts", type=Path, required=True)
    parser.add_argument("--openjlpt-vocab", type=Path, required=True)
    parser.add_argument("--ecdict-csv", type=Path, required=True)
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()

    ja_incoming, ja_counts = build_japanese(args.qwerty_dicts, args.openjlpt_vocab)
    en_incoming, en_counts = build_english(args.qwerty_dicts, args.ecdict_csv)
    report = Report(
        "https://github.com/Realkai42/qwerty-learner-vscode",
        "JLPT N5–N1 与 CET-4/CET-6 首批开放词库",
        "MIT",
        "ja+en",
        source_author="Kaiyi ZHANG / Linwei",
        source_commit="e0dc7a09a5e0946d77b2c279f72a89daf3659b97 + 450fd50f58f52e26502e9032632bc3f44fdb0725 + bc015ed2e24a7abef49fc6dbbb7fe32c1dadaf8b",
        detected_license="MIT + CC BY-SA 4.0",
    )
    repo = args.repo.resolve()
    ja_existing = [
        word for word in load_js_words(repo / "data.js", "DefaultWords")
        if not str(word.get("sourceName", "")).startswith("Qwerty Learner")
    ]
    en_existing = [
        word for word in load_js_words(repo / "english-data.js", "DefaultEnglishWords")
        if not str(word.get("sourceName", "")).startswith("Qwerty Learner")
    ]
    ja_words = merge_entries(ja_existing, ja_incoming, "ja", report)
    en_words = merge_entries(en_existing, en_incoming, "en", report)
    write_wordbank_assets(repo, ja_words, en_words)

    summary = {
        "japanese": ja_counts,
        "english": en_counts,
        "incoming": {"ja": len(ja_incoming), "en": len(en_incoming)},
        "final": {"ja": len(ja_words), "en": len(en_words)},
        "merge": {
            "added": report.added,
            "enrichedExisting": report.enriched_existing,
            "duplicates": report.duplicates,
            "conflicts": len(report.conflicts),
            "rejected": len(report.rejected),
        },
    }
    reports = repo / "reports"
    reports.mkdir(exist_ok=True)
    (reports / "initial-wordbank-import.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    update_source_ledger(repo, summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
