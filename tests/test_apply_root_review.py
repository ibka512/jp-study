import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

import apply_root_review as reviewer  # noqa: E402


class ApplyRootReviewTests(unittest.TestCase):
    def test_applies_explicit_accept_and_hide_decisions(self):
        words = [
            {"word": "rebuild", "roots": ""},
            {"word": "remote", "roots": "re(再次)-mote(移动)"},
        ]
        kept, hidden = reviewer.apply_decisions(words, {"decisions": [
            {"word": "rebuild", "decision": "accept", "roots": "re(再次)-build(建造)"},
            {"word": "remote", "decision": "hide", "roots": "re(再次)-mote(移动)"},
        ]})
        self.assertEqual((kept, hidden), (1, 1))
        self.assertEqual(words[0]["rootsReview"], "human")
        self.assertEqual(words[1]["roots"], "")

    def test_rejects_split_that_cannot_rebuild_word(self):
        with self.assertRaises(ValueError):
            reviewer.apply_decisions(
                [{"word": "rebuild", "roots": ""}],
                {"decisions": [{"word": "rebuild", "decision": "accept", "roots": "re(再次)-built(建造)"}]},
            )


if __name__ == "__main__":
    unittest.main()
