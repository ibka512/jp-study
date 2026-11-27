import tempfile
import unittest
from pathlib import Path

from tools.wordbank_compiler import (
    Report,
    collect_batches,
    merge_entries,
    parse_markdown_wordlist_text,
    read_markdown_wordlist,
)


class MarkdownWordlistTests(unittest.TestCase):
    def test_parse_markdown_formats_and_irregular_verbs(self):
        sample = """---
title: 专升本英语考纲词汇 · 背诵清单
tags: [专升本, 英语, 词汇]
---

# 专升本英语考纲词汇

> 说明文字

## 单元 01

- [ ] **ability** `[ə'biləti]` *n.* 1.能力, 本领
- [ ] **alter** *v.* 改变，改动，变更
- [ ] **above all** 首先；尤其；最重要的是
- [ ] **arise (arose, arisen)** `[ə'raɪz]` *vi.* 出现；产生
- [ ] **across** `[ə'krɔs]` *adv.* & prep. 横过
- [ ] **one's own** 自己的
- 辨析：**move** 是移动
"""
        rows = parse_markdown_wordlist_text(sample)
        self.assertEqual(len(rows), 6)

        self.assertEqual(rows[0]["word"], "ability")
        self.assertEqual(rows[0]["phonetic"], "[ə'biləti]")
        self.assertEqual(rows[0]["type"], "名词")
        self.assertEqual(rows[0]["level"], "专升本")

        self.assertEqual(rows[1]["word"], "alter")
        self.assertEqual(rows[1]["phonetic"], "")
        self.assertEqual(rows[1]["type"], "动词")

        self.assertEqual(rows[2]["word"], "above all")
        self.assertEqual(rows[2]["type"], "短语")

        self.assertEqual(rows[3]["word"], "arise")
        self.assertEqual(rows[3]["aliases"], "arose, arisen")
        self.assertEqual(rows[3]["type"], "不及物动词")

        self.assertEqual(rows[4]["word"], "across")
        self.assertEqual(rows[4]["type"], "副词・介词")

        self.assertEqual(rows[5]["word"], "one's own")
        self.assertEqual(rows[5]["type"], "短语")

    def test_collect_batches_supports_markdown_and_preserves_existing_ids(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            md_path = root / "zsb.md"
            md_path.write_text(
                "---\ntitle: 专升本英语\n---\n- [ ] **arise (arose, arisen)** `[ə'raɪz]` *vi.* 出现\n- [ ] **take care of** 照顾\n",
                encoding="utf-8",
            )
            report = Report(source=str(md_path), source_name="zsb", license="MIT", requested_language="en")
            batches = collect_batches(md_path, root, report)
            self.assertEqual(len(batches), 1)
            self.assertEqual(len(batches[0].rows), 2)

            existing = [{
                "_id": "en-built-in-000001",
                "lang": "en",
                "word": "arise",
                "type": "不及物动词",
                "phonetic": "",
                "meaning": "出现",
                "example": "",
                "roots": "",
                "folder": "四级词汇",
                "level": "CET-4",
                "tags": [],
                "builtIn": True,
            }]
            incoming = [{
                "word": "arise",
                "type": "不及物动词",
                "phonetic": "[ə'raɪz]",
                "meaning": "出现",
                "aliases": ["arose", "arisen"],
                "level": "专升本",
                "tags": ["专升本"],
            }]
            merged = merge_entries(existing, incoming, "en", report)
            self.assertEqual(len(merged), 1)
            self.assertEqual(merged[0]["_id"], "en-built-in-000001")
            self.assertEqual(merged[0]["phonetic"], "[ə'raɪz]")
            self.assertEqual(merged[0]["aliases"], ["arose", "arisen"])


if __name__ == "__main__":
    unittest.main()
