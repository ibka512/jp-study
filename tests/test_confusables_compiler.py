import json
import tempfile
import unittest
from pathlib import Path

from tools.confusables_compiler import (
    main,
    parse_confusables_markdown,
    parse_root_families_markdown,
)


class ConfusablesCompilerTests(unittest.TestCase):
    def test_parse_confusables_markdown_with_inline_examples(self):
        sample = """---
title: 英语专升本易混词组辨析
---

## 第 01–20 组

### 2. incident, accident

- incident 指小事件；
- accident 指不幸的事故，例：He was killed in the accident.

### 15. class, lesson

- 作“课”解时，两者可以替换。
- 指课文用lesson，例：Lesson 6，第6 课；
- 指班级或全体学生用class，例：Class 5，5 班。
"""
        groups = parse_confusables_markdown(sample)
        self.assertEqual(len(groups), 2)

        g1 = groups[0]
        self.assertEqual(g1["id"], "conf-002")
        self.assertEqual(g1["words"], ["incident", "accident"])
        self.assertEqual(len(g1["diffNotes"]), 2)
        self.assertEqual(len(g1["examples"]), 1)
        self.assertEqual(g1["examples"][0]["blank"], "He was killed in the ____.")
        self.assertEqual(g1["examples"][0]["answer"], "accident")

        g2 = groups[1]
        self.assertEqual(g2["id"], "conf-015")
        self.assertEqual(len(g2["examples"]), 2)
        self.assertEqual(g2["examples"][0]["answer"], "lesson")
        self.assertEqual(g2["examples"][0]["translation"], "第6 课")

    def test_parse_root_families_and_cli_json_output(self):
        sample = """## 第 04 组 · vol/volv 卷、转

- **revolve** *v.* 旋转
- **evolve** *v.* 进化
- 辨析：**move** 是"移动"，"旋转"用 **revolve**
"""
        families = parse_root_families_markdown(sample)
        self.assertIn("vol", families)
        self.assertIn("volv", families)
        self.assertIn("revolve", families["vol"]["words"])
        self.assertIn("移动", families["vol"]["note"])

        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            src = root / "conf.md"
            out = root / "conf.json"
            src.write_text("### 1. spend / take\n- spend 主语为人，例：I spend time on reading.\n", encoding="utf-8")
            code = main([str(src), "-o", str(out), "--format", "json"])
            self.assertEqual(code, 0)
            payload = json.loads(out.read_text(encoding="utf-8"))
            self.assertEqual(len(payload), 1)
            self.assertEqual(payload[0]["examples"][0]["answer"], "spend")


if __name__ == "__main__":
    unittest.main()
