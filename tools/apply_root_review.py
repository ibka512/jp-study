#!/usr/bin/env python3
"""把人工审核清单应用到 AI 生成的英语词根结果。"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from wordbank_compiler import load_js_words, write_wordbank_assets


ROOT_PART_RE = re.compile(r"([^()\-]+)\([^()]+\)")


def root_letters(value: str) -> str:
    parts = value.split("-")
    matches = [ROOT_PART_RE.fullmatch(part.strip()) for part in parts]
    if len(matches) < 2 or any(match is None for match in matches):
        return ""
    return "".join(re.sub(r"[^a-z]", "", match.group(1).casefold()) for match in matches)


def apply_decisions(en_words, review):
    decisions = review.get("decisions")
    if isinstance(decisions, list):
        by_id = {str(word.get("_id", "")): word for word in en_words if word.get("_id")}
        by_word = {str(word.get("word", "")): word for word in en_words}
        kept = hidden = 0
        for item in decisions:
            if not isinstance(item, dict):
                continue
            spelling = str(item.get("word", "")).strip()
            decision = str(item.get("decision", "")).strip()
            target = by_id.get(str(item.get("id", ""))) or by_word.get(spelling)
            if not target or decision not in {"accept", "hide"}:
                continue
            if decision == "accept":
                roots = str(item.get("roots", "")).strip()
                target_key = re.sub(r"[^a-z]", "", spelling.casefold())
                if not roots or root_letters(roots) != target_key:
                    raise ValueError(f"{spelling} 的拆分无法原样拼回单词")
                target["roots"] = roots
                target["rootsStatus"] = "verified"
                target["rootsReview"] = "human"
                kept += 1
            else:
                target["roots"] = ""
                target["rootsStatus"] = "not-applicable"
                target["rootsReview"] = "human-rejected"
                hidden += 1
        return kept, hidden

    accepted = set(review.get("accepted", []))
    rejected = set(review.get("rejected", {}))
    if not accepted or not rejected:
        raise ValueError("审核清单必须包含 decisions，或同时包含 accepted 和 rejected")
    kept = hidden = 0
    for word in en_words:
        if word.get("rootsStatus") != "verified":
            continue
        spelling = str(word.get("word", ""))
        if spelling in accepted:
            word["rootsReview"] = "human"
            kept += 1
        else:
            word["roots"] = ""
            word["rootsStatus"] = "not-applicable"
            word["rootsReview"] = "human-rejected"
            hidden += 1
    return kept, hidden


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument("--review", required=True)
    args = parser.parse_args()
    repo = Path(args.repo).resolve()
    review_path = (repo / args.review).resolve()
    review = json.loads(review_path.read_text(encoding="utf-8"))
    ja_words = load_js_words(repo / "data.js", "DefaultWords")
    en_words = load_js_words(repo / "english-data.js", "DefaultEnglishWords")
    try:
        kept, hidden = apply_decisions(en_words, review)
    except ValueError as exc:
        raise SystemExit(str(exc)) from exc

    write_wordbank_assets(repo, ja_words, en_words)
    summary = {
        "review_file": args.review,
        "accepted_and_present": kept,
        "hidden_after_review": hidden,
    }
    (repo / "reports" / "root-review-application-latest.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(summary, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
