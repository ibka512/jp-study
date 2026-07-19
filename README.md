# 钟日（jp-study）

AI 辅助开发的日英双语学习 PWA：<https://ibka512.github.io/jp-study/>

## 自动建设词库

仓库已内置“钟日词库编译器”，可把 GitHub 公开词库、Anki `.apkg`、CSV/TSV/TXT/JSON 自动转换并合并进 `data.js` 和 `english-data.js`。它支持自动字段识别、DeepSeek 批量补全、稳定 ID、去重、冲突报告、许可记录，以及 GitHub Actions 一键提交部署。

使用方法见 [词库一键更新工具说明](docs/WORD_BANK_TOOL.md)。

当前内置词库的数据来源与许可见 [第三方词库与许可](THIRD_PARTY_WORD_BANKS.md)。

当前规模：日语约 5900 词（N5–N1），英语约 3900 词（CET-4/CET-6）。所有词条均包含中文释义、词性和读音字段。
