#!/usr/bin/env python3
"""Normalize exact Japanese part-of-speech tokens in compiled wordbank chunks."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


TYPE_FIELD = re.compile(r'"type":("(?:\\.|[^"\\])*")')
TOKEN_SPLIT = re.compile(r'([·・])')


def normalize_type(value: str) -> tuple[str, int]:
    parts = TOKEN_SPLIT.split(value)
    replacements = 0
    for index, part in enumerate(parts):
        if part.strip() == "ナ形":
            padding_left = part[: len(part) - len(part.lstrip())]
            padding_right = part[len(part.rstrip()) :]
            parts[index] = f"{padding_left}形容动词{padding_right}"
            replacements += 1
    return "".join(parts), replacements


def normalize_content(content: str) -> tuple[str, int]:
    replacements = 0

    def replace(match: re.Match[str]) -> str:
        nonlocal replacements
        value = json.loads(match.group(1))
        normalized, count = normalize_type(value)
        replacements += count
        return f'"type":{json.dumps(normalized, ensure_ascii=False, separators=(",", ":"))}'

    return TYPE_FIELD.sub(replace, content), replacements


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write normalized chunks")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()

    total = 0
    changed_files = 0
    for path in sorted((args.root / "wordbanks").glob("ja-*.js")):
        content = path.read_text(encoding="utf-8")
        normalized, count = normalize_content(content)
        if count:
            total += count
            changed_files += 1
            if args.apply:
                path.write_text(normalized, encoding="utf-8")

    action = "已替换" if args.apply else "待替换"
    print(f"{action} {total} 个ナ形词性标签，涉及 {changed_files} 个文件")
    return 1 if total and not args.apply else 0


if __name__ == "__main__":
    raise SystemExit(main())
