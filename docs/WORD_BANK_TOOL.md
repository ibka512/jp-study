# 钟日词库一键更新工具

这个工具把 GitHub 上的公开词库或 Anki 卡片转换成钟日现有的 `data.js` 和 `english-data.js`，通过 GitHub Actions 自动测试、提交并触发 GitHub Pages 更新。

## 最简单的使用方法

1. 打开仓库的 **Actions**。
2. 选择 **更新钟日词库**，点击 **Run workflow**。
3. 粘贴来源链接，选择日语/英语或自动判断，并填写来源页面明确标注的许可证。
4. AI 补全选 `missing`，然后运行。
5. 完成后查看本次运行的 `wordbank-report`，确认新增、重复、冲突和拒绝数量。

支持的来源：

- 整个 GitHub 仓库或仓库内的单个文件链接
- Anki `.apkg`、`.anki2`、`.anki21`
- ZIP 中的上述文件
- CSV、TSV、TXT、JSON

工具不会执行来源里的程序，也不会导入图片和音频。压缩包路径、文件数量、下载体积和解压体积都有限制。

## AI 补全

在仓库 **Settings → Secrets and variables → Actions** 新增名为 `DEEPSEEK_API_KEY` 的 Secret。密钥只在 GitHub Actions 中使用，不会写进网页或词库文件。

- `missing`：只处理缺释义、缺词性、缺读音，或释义不是中文的条目。
- `all`：检查所有导入条目，消耗更多 Token。
- `off`：完全不用 AI，只有规则转换。

没有配置 Secret 时，`missing/all` 会自动退回规则转换；仍缺中文释义的条目会进入拒绝报告，不会污染正式词库。

## 去重与学习记录

- 英语按不区分大小写的单词去重。
- 日语按“单词 + 假名”去重；不同读音的同形词可以共存。
- 已有单词的 `_id` 永远保留，因此用户的学习记录不会因更新词库丢失。
- 新词用内容生成稳定 `_id`，重复运行不会换 ID。
- 新来源只填充原词的空字段；不同释义等冲突保留原值并写入报告。

## 一个词属于多个考纲

同一个词只入库一条，**第二个考纲记在 `tags` 里**，不复制词条。比如 `ability` 先由四级词库导入（`level: CET-4`），
后来专升本词库再遇到它时，只把 `专升本` 追加进 `tags`，词条数量不变、学习记录也不分叉。

所以判断「某本考试词书包含哪些词」时，要看**级别或标签**，不能只看 `folder` / `level`：

```js
// app.js checkFilter：考试词书按「级别或标签」判定
const EXAM_BOOK_LEVELS = { '四级词汇': 'CET-4', '六级词汇': 'CET-6', '专升本词汇': '专升本' };
```

- 「专升本词汇」词书因此包含专升本考纲的全部词：独占词（`level: 专升本`）+ 与四六级共享的词（`tags` 含 `专升本`）。
- 详情页会同时显示两个考纲的级别 chip（主级别实心、共享级别描边），共享词不再只露出先导入的那个级别。
- 词库页的范围下拉会按同一口径显示每个词书的实时词数。

## 许可保护

GitHub 仓库公开不等于允许转载。工作流必须填写来源明确标注的许可；`unknown`、`none`、`unlicensed` 或空值会被阻止。对于 GitHub 来源，工具还会读取仓库作者、当前提交和 GitHub 检测到的许可证，发现不一致就报警。每次更新都会把这些来源信息、时间和数量记入 `wordbank-sources.json`。

## 字段映射

常见的 `Front/Back`、`Word/Meaning`、`Expression/Reading`、`IPA`、`例文` 等字段会自动识别。特别的卡片模板可填写：

```json
{"word":"正面字段","kana":"读音字段","meaning":"背面字段","example":"例句字段"}
```

## 本地运行

```bash
python tools/wordbank_compiler.py \
  --source ./my-deck.apkg \
  --language ja \
  --license CC-BY-4.0 \
  --source-name 我的日语词库 \
  --ai-mode missing
```

加上 `--dry-run` 可只检查结果，不改文件。完整参数见 `python tools/wordbank_compiler.py --help`。
