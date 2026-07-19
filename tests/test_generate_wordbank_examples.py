import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

import generate_wordbank_examples as generator  # noqa: E402


class GenerateWordbankExamplesTests(unittest.TestCase):
    def candidate(self, language, word, item_id="test-1", **extra):
        payload = {
            "_id": item_id,
            "word": word,
            "meaning": "测试释义",
            "level": "N5" if language == "ja" else "CET-4",
            "example": "",
        }
        payload.update(extra)
        return generator.Candidate(language, 0, payload)

    def test_validates_english_example(self):
        candidate = self.candidate("en", "achieve")
        formatted, reason = generator.validate_result(candidate, {
            "sentence": "She hopes to achieve her goal this year.",
            "translation": "她希望今年实现自己的目标。",
        }, set())
        self.assertFalse(reason)
        self.assertEqual(
            formatted,
            "She hopes to achieve her goal this year. / 她希望今年实现自己的目标。",
        )

    def test_accepts_common_english_inflection_but_not_unrelated_substring(self):
        candidate = self.candidate("en", "achieve")
        formatted, reason = generator.validate_result(candidate, {
            "sentence": "She achieved her goal.",
            "translation": "她实现了目标。",
        }, set())
        self.assertTrue(formatted)
        self.assertFalse(reason)

        candidate = self.candidate("en", "he")
        formatted, reason = generator.validate_result(candidate, {
            "sentence": "The book is here.",
            "translation": "书在这里。",
        }, set())
        self.assertFalse(formatted)
        self.assertIn("目标词", reason)

    def test_validates_japanese_furigana_and_rejects_unannotated_kanji(self):
        candidate = self.candidate("ja", "学校", kana="がっこう")
        valid = {
            "sentence": r"$\overset{わたし}{私}$は$\overset{まいにち}{毎日}$$\overset{がっこう}{学校}$へ行く。".replace("行", r"$\overset{い}{行}$"),
            "translation": "我每天去学校。",
        }
        formatted, reason = generator.validate_result(candidate, valid, set())
        self.assertTrue(formatted)
        self.assertFalse(reason)

        invalid = dict(valid)
        invalid["sentence"] = r"$\overset{わたし}{私}$は学校へ行く。"
        formatted, reason = generator.validate_result(candidate, invalid, set())
        self.assertFalse(formatted)
        self.assertIn("未标注", reason)

    def test_converts_safe_ai_furigana_markup(self):
        candidate = self.candidate("ja", "学校", kana="がっこう")
        formatted, reason = generator.validate_result(candidate, {
            "sentence": "[[私|わたし]]は[[学校|がっこう]]へ[[行|い]]く。",
            "translation": "我去学校。",
        }, set())
        self.assertFalse(reason)
        self.assertIn(r"$\overset{がっこう}{学校}$", formatted)
        self.assertNotIn("[[", formatted)

    def test_removes_kana_furigana_and_repairs_mixed_okurigana(self):
        candidate = self.candidate("ja", "テレビ", kana="テレビ")
        formatted, reason = generator.validate_result(candidate, {
            "sentence": "[[テレビ|テレビ]]を[[見|み]]ます。",
            "translation": "看电视。",
        }, set())
        self.assertFalse(reason)
        self.assertIn("テレビを", formatted)
        self.assertNotIn(r"\overset{テレビ}{テレビ}", formatted)

        candidate = self.candidate("ja", "新しい", kana="あたらしい")
        formatted, reason = generator.validate_result(candidate, {
            "sentence": "[[新しい|あたらしい]][[本|ほん]]です。",
            "translation": "是新书。",
        }, set())
        self.assertTrue(formatted)
        self.assertFalse(reason)
        self.assertIn(r"$\overset{あたら}{新}$しい", formatted)

    def test_cleans_existing_japanese_examples_before_resuming(self):
        words = [
            {"example": r"$\overset{テレビ}{テレビ}$を$\overset{み}{見}$る。 / 看电视。"},
            {"example": r"$\overset{あたらしい}{新しい}$$\overset{ほん}{本}$。 / 新书。"},
        ]
        normalized, cleared = generator.cleanup_existing_japanese_examples(words)
        self.assertEqual((normalized, cleared), (2, 0))
        self.assertIn("テレビを", words[0]["example"])
        self.assertIn(r"$\overset{あたら}{新}$しい", words[1]["example"])

    def test_repairs_unescaped_legacy_latex_json(self):
        payload = generator.load_ai_json(
            r'{"items":[{"sentence":"$\overset{わたし}{私}$です。"}]}'
        )
        self.assertEqual(payload["items"][0]["sentence"], r"$\overset{わたし}{私}$です。")

    def test_all_language_selection_is_interleaved_and_resumable(self):
        ja = [
            {"_id": "ja-1", "word": "一", "example": ""},
            {"_id": "ja-2", "word": "二", "example": ""},
        ]
        en = [
            {"_id": "en-1", "word": "one", "example": ""},
            {"_id": "en-2", "word": "two", "example": "已有例句 / 已有翻译"},
        ]
        selected = generator.select_candidates(ja, en, "all", "", 3)
        self.assertEqual([item.word["_id"] for item in selected], ["ja-1", "en-1", "ja-2"])

    def test_generation_retries_invalid_result_and_updates_only_example(self):
        word = {
            "_id": "en-1",
            "word": "learn",
            "meaning": "学习",
            "level": "CET-4",
            "example": "",
            "type": "动词",
        }
        candidates = [generator.Candidate("en", 0, word)]
        ja_words = []
        en_words = [dict(word)]

        class FakeClient:
            def __init__(self):
                self.calls = 0

            def request(self, language, pending):
                self.calls += 1
                if self.calls == 1:
                    return {"en-1": {"sentence": "This is wrong.", "translation": "这是错的。"}}
                return {"en-1": {
                    "sentence": "Children learn new words at school.",
                    "translation": "孩子们在学校学习新单词。",
                }}

        report = generator.GenerationReport(
            generated_at="test",
            model="test-model",
            language="en",
            level="",
            max_words=1,
            batch_size=1,
            missing_before={"ja": 0, "en": 1},
            selected=1,
        )
        client = FakeClient()
        generator.run_generation(client, candidates, 1, ja_words, en_words, report)
        self.assertEqual(client.calls, 2)
        self.assertEqual(report.generated, 1)
        self.assertEqual(report.failures, [])
        self.assertEqual(en_words[0]["type"], "动词")
        self.assertIn("Children learn", en_words[0]["example"])


if __name__ == "__main__":
    unittest.main()
