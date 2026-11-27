#!/usr/bin/env python3
"""将 Markdown 格式的「易混词组辨析」与「母词/词根族」编译为钟日可用的静态 JSON / JS 数据。"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


GROUP_HEADING_RE = re.compile(r"^###\s*(\d+)\s*[.、．]\s*(.+?)\s*$")
BULLET_RE = re.compile(r"^\s*[-*+]\s+(.*)$")
EXAMPLE_SPLIT_RE = re.compile(r"(?:^|[。；;.,，\s])例[：:]\s*")
ROOT_GROUP_HEADING_RE = re.compile(r"^##\s*第\s*(\d+)\s*组\s*[·・:：]\s*(.+?)\s*$")


def clean_line(text: str) -> str:
    return re.sub(r"\s+", " ", str(text or "").replace("\r", "")).strip()


def split_confusable_words(raw_title: str) -> list[str]:
    cleaned = clean_line(raw_title)
    # 兼容逗号、顿号、斜杠分隔（如 "spend / take / pay / cost" 或 "a number of, the number of"）
    parts = re.split(r"[,，、/／]+", cleaned)
    words: list[str] = []
    for part in parts:
        token = clean_line(part).strip("`'\"*")
        if token and token not in words:
            words.append(token)
    return words


def make_cloze_blank(sentence: str, candidate_words: list[str], preferred_word: str = "") -> tuple[str, str]:
    """在英文例句中挖空匹配的易混词，返回 (blank_sentence, answer_word)。"""
    ordered = []
    if preferred_word:
        ordered.append(preferred_word)
    for w in sorted(candidate_words, key=len, reverse=True):
        if w not in ordered:
            ordered.append(w)

    for word in ordered:
        # 优先精确词边界匹配，其次兼容简单词尾屈折（s/es/ed/ing）
        escaped = re.escape(word)
        patterns = [
            re.compile(rf"(?<![A-Za-z]){escaped}(?![A-Za-z])", re.I),
        ]
        if " " not in word and len(word) >= 3:
            stem = re.escape(word[:-1]) if word.endswith("e") else escaped
            patterns.append(re.compile(rf"(?<![A-Za-z])(?:{escaped}(?:s|es|ed|ing)|{stem}(?:ed|ing))(?![A-Za-z])", re.I))
        for pat in patterns:
            if pat.search(sentence):
                blank = pat.sub("____", sentence, count=1)
                return blank, word
    return "", preferred_word or (ordered[0] if ordered else "")


def extract_example_parts(example_raw: str) -> tuple[str, str]:
    """拆分例句与可能紧跟在后的中文翻译（如 'Lesson 6，第6 课'）。"""
    text = clean_line(example_raw).rstrip("；;")
    # 如果例句以英文为主，末尾跟中文注释（以中文逗号/括号/空格分隔）
    m = re.match(r"^([A-Za-z0-9'\".,!?;:\-/\s()]+?)(?:\s*[，,]\s*([\u4e00-\u9fff].*))?$", text)
    if m and re.search(r"[A-Za-z]{2,}", m.group(1)):
        sentence = clean_line(m.group(1))
        translation = clean_line(m.group(2) or "")
        return sentence, translation
    return text, ""


def parse_confusables_markdown(text: str) -> list[dict[str, Any]]:
    groups: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None

    def flush() -> None:
        nonlocal current
        if current and current["words"]:
            groups.append(current)
        current = None

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        heading_match = GROUP_HEADING_RE.match(line)
        if heading_match:
            flush()
            seq = int(heading_match.group(1))
            raw_title = heading_match.group(2)
            words = split_confusable_words(raw_title)
            current = {
                "id": f"conf-{seq:03d}",
                "title": " / ".join(words),
                "words": words,
                "diffNotes": [],
                "examples": [],
            }
            continue

        if current is None:
            continue

        if line.startswith("## ") or line.startswith("# "):
            flush()
            continue

        bullet_match = BULLET_RE.match(line)
        content = clean_line(bullet_match.group(1) if bullet_match else line)
        if not content:
            continue

        # 切分内联 "例：..."
        parts = EXAMPLE_SPLIT_RE.split(content)
        note_part = clean_line(parts[0]).rstrip("；;。")
        example_chunks = [clean_line(chunk) for chunk in parts[1:] if clean_line(chunk)]

        # 识别该条辨析归属哪个易混词
        matched_word = ""
        note_body = note_part
        for w in sorted(current["words"], key=len, reverse=True):
            pat = re.compile(rf"^(?:\*\*)?{re.escape(w)}(?:\*\*)?(?:[\s：:（(]+|$)", re.I)
            if pat.match(note_part):
                matched_word = w
                stripped = re.sub(rf"^(?:\*\*)?{re.escape(w)}(?:\*\*)?[\s：:]*", "", note_part, count=1, flags=re.I)
                note_body = clean_line(stripped) or note_part
                break

        if note_body:
            current["diffNotes"].append({
                "word": matched_word,
                "note": note_body,
            })

        for ex_chunk in example_chunks:
            sentence, translation = extract_example_parts(ex_chunk)
            if not sentence or not re.search(r"[A-Za-z]", sentence):
                continue
            blank, answer = make_cloze_blank(sentence, current["words"], matched_word)
            if blank and answer:
                current["examples"].append({
                    "sentence": sentence,
                    "blank": blank,
                    "answer": answer,
                    "translation": translation,
                })

    flush()
    return groups


def parse_root_families_markdown(text: str) -> dict[str, dict[str, Any]]:
    """解析形如《58组母词.md》的词根母词笔记，生成以词根键索引的词族注释表。"""
    families: dict[str, dict[str, Any]] = {}
    current_keys: list[str] = []
    current_entry: dict[str, Any] | None = None

    def flush() -> None:
        nonlocal current_keys, current_entry
        if current_keys and current_entry:
            for key in current_keys:
                families[key] = dict(current_entry)
        current_keys = []
        current_entry = None

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        m_head = ROOT_GROUP_HEADING_RE.match(line)
        if m_head:
            flush()
            seq = int(m_head.group(1))
            desc = clean_line(m_head.group(2))
            keys = list(dict.fromkeys(k.lower() for k in re.findall(r"[A-Za-z]{2,}", desc)))
            meaning = clean_line(re.sub(r"[A-Za-z/\-\s]+", " ", desc))
            current_keys = keys
            current_entry = {
                "group": seq,
                "title": desc,
                "rootKeys": keys,
                "coreMeaning": meaning,
                "note": "",
                "words": [],
            }
            continue

        if current_entry is None:
            continue

        m_note = re.match(r"^[-*+]\s*辨析[：:]\s*(.+)$", line)
        if m_note:
            note_text = re.sub(r"\*\*([^*]+)\*\*", r"\1", clean_line(m_note.group(1)))
            current_entry["note"] = (current_entry["note"] + "；" + note_text).strip("；")
            continue

        m_word = re.match(r"^[-*+]\s*\*\*([^*]+)\*\*", line)
        if m_word:
            w = clean_line(m_word.group(1))
            if w and w not in current_entry["words"]:
                current_entry["words"].append(w)

    flush()
    return families


def render_output(data: Any, fmt: str, global_name: str) -> str:
    payload = json.dumps(data, ensure_ascii=False, indent=2)
    if fmt == "json":
        return payload + "\n"
    return (
        f"(function (root) {{\n"
        f"  'use strict';\n"
        f"  const DATA = {payload};\n"
        f"  if (typeof module === 'object' && module.exports) {{\n"
        f"    module.exports = DATA;\n"
        f"  }}\n"
        f"  root.{global_name} = DATA;\n"
        f"}})(typeof globalThis !== 'undefined' ? globalThis : this);\n"
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="编译 Markdown 易混词组辨析或母词词根笔记为 JSON/JS")
    parser.add_argument("input", type=Path, help="输入 Markdown 文件路径")
    parser.add_argument("-o", "--output", type=Path, help="输出文件路径（省略则打印到标准输出）")
    parser.add_argument("--mode", choices=["confusables", "root-families"], default="confusables", help="解析模式")
    parser.add_argument("--format", choices=["json", "js"], default="json", help="输出格式")
    args = parser.parse_args(argv)

    text = args.input.read_text(encoding="utf-8")
    if args.mode == "root-families":
        data = parse_root_families_markdown(text)
        global_name = "ZhongriRootFamilyNotes"
    else:
        data = parse_confusables_markdown(text)
        global_name = "ZhongriConfusables"

    rendered = render_output(data, args.format, global_name)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
        count = len(data)
        print(f"已编译 {count} 项到 {args.output}")
    else:
        sys.stdout.write(rendered)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
