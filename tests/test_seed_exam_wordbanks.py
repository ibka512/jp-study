import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

from seed_exam_wordbanks import (
    build_jlpt_level_map,
    english_type_from_ecdict,
    parse_english_definitions,
    parse_japanese_definition,
    parse_japanese_notation,
)


class SeedExamWordbankTests(unittest.TestCase):
    def test_parses_furigana_notation(self):
        self.assertEqual(parse_japanese_notation("相容(あいい)れない"), ("相容れない", "あいいれない"))
        self.assertEqual(parse_japanese_notation("男(おとこ)の子(こ)"), ("男の子", "おとこのこ"))
        self.assertEqual(parse_japanese_notation("パソコン"), ("パソコン", "パソコン"))

    def test_splits_japanese_type_meaning_and_pitch(self):
        type_name, meaning, pitch = parse_japanese_definition(["⓪ 名·ナ形  意外；意想不到的"])
        self.assertEqual(type_name, "名词·ナ形")
        self.assertEqual(meaning, "意外；意想不到的")
        self.assertEqual(pitch, "⓪")

    def test_extracts_english_part_of_speech(self):
        row = {"translation": "n. 计划\nvt. 计划\nvi. 打算", "definition": "", "pos": ""}
        self.assertEqual(english_type_from_ecdict(row), "名词・及物动词・不及物动词")
        self.assertEqual(parse_english_definitions(["空调系统 (n.)"]), ("空调系统", "名词"))


if __name__ == "__main__":
    unittest.main()
