#!/usr/bin/env python3
"""把人工审核清单应用到 AI 生成的英语词根结果。"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from wordbank_compiler import load_js_words, write_wordbank_assets


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument("--review", required=True)
    args = parser.parse_args()
    repo = Path(args.repo).resolve()
    review_path = (repo / args.review).resolve()
    review = json.loads(review_path.read_text(encoding="utf-8"))
    accepted = set(review.get("accepted", []))
    rejected = set(review.get("rejected", {}))
    if not accepted or not rejected:
        raise SystemExit("审核清单必须同时包含 accepted 和 rejected")

    ja_words = load_js_words(repo / "data.js", "DefaultWords")
    en_words = load_js_words(repo / "english-data.js", "DefaultEnglishWords")
    kept = 0
    hidden = 0
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
