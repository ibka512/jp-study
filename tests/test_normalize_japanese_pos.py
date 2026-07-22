import tempfile
import unittest
from pathlib import Path

from tools.normalize_japanese_pos import normalize_content, normalize_type


class NormalizeJapanesePosTests(unittest.TestCase):
    def test_replaces_only_exact_pos_tokens(self):
        value, count = normalize_type("名词·ナ形・ナ形容词")
        self.assertEqual(value, "名词·形容动词・ナ形容词")
        self.assertEqual(count, 1)

    def test_changes_type_field_but_not_meaning_or_example(self):
        source = '{"type":"名词·ナ形","meaning":"ナ形","example":"ナ形"}'
        result, count = normalize_content(source)
        self.assertEqual(count, 1)
        self.assertIn('"type":"名词·形容动词"', result)
        self.assertIn('"meaning":"ナ形"', result)
        self.assertIn('"example":"ナ形"', result)


if __name__ == "__main__":
    unittest.main()
