import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

import generate_wordbank_roots as generator  # noqa: E402


class GenerateWordbankRootsTests(unittest.TestCase):
    def candidate(self, word="discourage"):
        return generator.Candidate(0, {
            "_id": "en-1",
            "word": word,
            "meaning": "使泄气；劝阻",
            "level": "CET-4",
            "roots": "",
        })

    def test_accepts_visible_reconstructable_morphemes(self):
        roots, status, reason = generator.validate_result(self.candidate(), {
            "splittable": True,
            "parts": [
                {"text": "dis", "meaning": "否定", "role": "prefix"},
                {"text": "courage", "meaning": "勇气", "role": "root"},
            ],
        })
        self.assertFalse(reason)
        self.assertEqual(status, "verified")
        self.assertEqual(roots, "dis(否定)-courage(勇气)")

    def test_rejects_parts_that_cannot_rebuild_word(self):
        roots, status, reason = generator.validate_result(self.candidate("pollution"), {
            "splittable": True,
            "parts": [
                {"text": "pollute", "meaning": "污染", "role": "root"},
                {"text": "ion", "meaning": "名词后缀", "role": "suffix"},
            ],
        })
        self.assertFalse(roots)
        self.assertFalse(status)
        self.assertIn("无法原样拼回", reason)

    def test_accepts_explicit_not_applicable_without_fake_roots(self):
        roots, status, reason = generator.validate_result(self.candidate("achieve"), {
            "splittable": False,
            "parts": [],
            "reason": "没有可靠的现代英语表面拆分",
        })
        self.assertFalse(roots)
        self.assertEqual(status, "not-applicable")
        self.assertFalse(reason)

    def test_selection_skips_existing_and_reviewed_words(self):
        words = [
            {"word": "one", "level": "CET-4", "roots": "one(一)-ness(后缀)"},
            {"word": "two", "level": "CET-4", "roots": "", "rootsStatus": "not-applicable"},
            {"word": "three", "level": "CET-4", "roots": ""},
            {"word": "four", "level": "CET-6", "roots": ""},
        ]
        selected = generator.select_candidates(words, "CET-4", 100)
        self.assertEqual([item.word["word"] for item in selected], ["three"])


if __name__ == "__main__":
    unittest.main()
