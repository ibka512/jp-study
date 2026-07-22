import argparse
import json
import shutil
import sqlite3
import tempfile
import unittest
import zipfile
from pathlib import Path

import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

import wordbank_compiler as compiler


class WordbankCompilerTests(unittest.TestCase):
    def test_detects_japanese_fields_and_strips_anki_markup(self):
        fields = ["Expression", "Reading", "Meaning", "Example"]
        mapping = compiler.detect_mapping(fields, "ja")
        self.assertEqual(mapping["word"], "Expression")
        self.assertEqual(mapping["kana"], "Reading")
        self.assertEqual(mapping["meaning"], "Meaning")
        self.assertEqual(compiler.clean_text("<b>学校</b><br>[sound:a.mp3]学校。"), "学校\n学校。")

    def test_csv_without_header_uses_front_and_back(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "words.tsv"
            path.write_text("apple\t苹果\nbook\t书\n", encoding="utf-8")
            batch = compiler.read_tabular(path)
        self.assertEqual(batch.fields[:2], ["Front", "Back"])
        mapping = compiler.detect_mapping(batch.fields, "en")
        self.assertEqual(mapping, {"word": "Front", "meaning": "Back"})

    def test_apkg_prefers_real_collection_anki21_over_dummy(self):
        with tempfile.TemporaryDirectory() as folder:
            folder = Path(folder)
            dummy = folder / "dummy.sqlite"
            real = folder / "real.sqlite"
            self._create_anki(dummy, "Dummy", "占位")
            self._create_anki(real, "季節", "季节")
            apkg = folder / "deck.apkg"
            with zipfile.ZipFile(apkg, "w") as archive:
                archive.write(dummy, "collection.anki2")
                archive.write(real, "collection.anki21")
            batches = compiler.read_apkg(apkg, folder / "unpacked")
        self.assertEqual(batches[0].rows[0]["Expression"], "季節")

    def test_merge_keeps_existing_id_and_stable_new_id(self):
        existing = [{"_id": "keep-me", "word": "学校", "kana": "がっこう", "meaning": "学校", "tags": []}]
        incoming = [
            {"word": "学校", "kana": "がっこう", "meaning": "学校；学堂", "type": "名词", "tags": ["N5"]},
            {"word": "先生", "kana": "せんせい", "meaning": "老师", "type": "名词", "tags": []},
        ]
        report = compiler.Report("fixture", "fixture", "CC0-1.0", "ja")
        first = compiler.merge_entries(existing, incoming, "ja", report)
        second_report = compiler.Report("fixture", "fixture", "CC0-1.0", "ja")
        second = compiler.merge_entries(existing, incoming, "ja", second_report)
        self.assertEqual(first[0]["_id"], "keep-me")
        self.assertEqual(first[1]["_id"], second[1]["_id"])
        self.assertEqual(first[0]["type"], "名词")
        self.assertTrue(report.conflicts)

    def test_license_is_required(self):
        with self.assertRaises(compiler.CompilerError):
            compiler.validate_license("unknown")
        compiler.validate_license("CC-BY-4.0")

    def test_private_query_is_not_written_to_report(self):
        self.assertEqual(
            compiler.safe_source_label("https://example.com/deck.apkg?token=secret#x"),
            "https://example.com/deck.apkg",
        )

    def test_end_to_end_dry_run_does_not_modify_repo(self):
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / "words.json"
            source.write_text(json.dumps([
                {"word": "compilerfixture", "meaning": "编译器测试词", "type": "名词"}
            ], ensure_ascii=False), encoding="utf-8")
            before = (ROOT / "english-data.js").read_bytes()
            existing_count = len(compiler.load_js_words(ROOT / "english-data.js", "DefaultEnglishWords"))
            args = argparse.Namespace(
                source=str(source), language="en", license="CC0-1.0", source_name="测试",
                repo=str(ROOT), field_map="", level="TEST", folder="测试词库", max_words=0,
                ai_mode="off", ai_key_env="DEEPSEEK_API_KEY", ai_base_url="https://api.deepseek.com",
                ai_model="deepseek-v4-flash", dry_run=True,
            )
            report = compiler.run(args)
            after = (ROOT / "english-data.js").read_bytes()
        self.assertEqual(before, after)
        self.assertEqual(report.added, 1)
        self.assertEqual(report.output_counts["en"], existing_count + 1)

    def test_end_to_end_write_generates_both_data_and_report(self):
        with tempfile.TemporaryDirectory() as folder:
            repo = Path(folder) / "repo"
            shutil.copytree(
                ROOT,
                repo,
                ignore=shutil.ignore_patterns(
                    ".git",
                    "__pycache__",
                    "node_modules",
                    "dist",
                    "android",
                    "ios",
                    "assets",
                ),
            )
            existing_count = len(compiler.load_js_words(repo / "data.js", "DefaultWords"))
            args = argparse.Namespace(
                source=str(ROOT / "tests" / "fixtures" / "sample-ja.tsv"), language="ja",
                license="CC0-1.0", source_name="测试日语词库", repo=str(repo), field_map="",
                level="N5", folder="导入词库", max_words=0, ai_mode="off",
                ai_key_env="DEEPSEEK_API_KEY", ai_base_url="https://api.deepseek.com",
                ai_model="deepseek-v4-flash", dry_run=False,
            )
            report = compiler.run(args)
            generated = compiler.load_js_words(repo / "data.js", "DefaultWords")
            report_json = json.loads((repo / "reports" / "wordbank-latest.json").read_text(encoding="utf-8"))
            service_worker = (repo / "sw.js").read_text(encoding="utf-8")
        self.assertEqual(report.added, 2)
        self.assertEqual(len(generated), existing_count + 2)
        self.assertEqual(generated[-1]["word"], "鐘日試験語乙")
        self.assertEqual(report_json["added"], 2)
        self.assertIn("zhongri-wordbank-", service_worker)

    @staticmethod
    def _create_anki(path: Path, word: str, meaning: str):
        connection = sqlite3.connect(path)
        models = {
            "100": {
                "name": "Japanese",
                "flds": [{"name": "Expression", "ord": 0}, {"name": "Reading", "ord": 1}, {"name": "Meaning", "ord": 2}],
            }
        }
        connection.execute("CREATE TABLE col (models TEXT)")
        connection.execute("INSERT INTO col VALUES (?)", (json.dumps(models),))
        connection.execute("CREATE TABLE notes (mid INTEGER, flds TEXT, tags TEXT)")
        connection.execute("INSERT INTO notes VALUES (?, ?, ?)", (100, f"{word}\x1fきせつ\x1f{meaning}", "N5"))
        connection.commit()
        connection.close()


if __name__ == "__main__":
    unittest.main()
