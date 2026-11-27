# 一键补全词库例句

这个工具使用 DeepSeek，为钟日词库中 `example` 为空的词条分批生成例句。它不会覆盖已有例句，也不会改变词条 ID、释义或学习记录。

## 第一次使用

1. 在 DeepSeek 控制台创建一枚新的 API Key。
2. 打开本仓库 **Settings → Secrets and variables → Actions**。
3. 点击 **New repository secret**。
4. Name 填 `DEEPSEEK_API_KEY`，Secret 粘贴 API Key，然后保存。

密钥只会在 GitHub Actions 服务器中使用，不会进入 PWA、代码、报告或提交记录。不要把密钥粘贴到聊天、Issue 或普通仓库文件。

## 一键运行

1. 打开仓库 **Actions**。
2. 在左侧选择 **补全钟日词库例句**。
3. 点击 **Run workflow**。
4. 第一次保持 `all / 100 / 20`，确认生成效果后再把 `max_words` 改成 `500`。
5. 运行完成后，工具会自动提交词库并触发 GitHub Pages 部署。

重复运行会自动跳过已经有例句的词，相当于断点续跑。`all` 会交替选择日语和英语，避免一种语言长期排在另一种前面。

自动化工具也可以通过更新 `.github/example-generation-request.json` 发起同样的任务；该文件只保存语言和批量大小，不保存 API Key。

## 生成规则

- 日语：自然日语例句、中文翻译，所有汉字使用钟日支持的假名标注格式。
- 英语：符合 CET 等级的自然例句和中文翻译。
- 每条例句必须包含目标词的原样文字。
- 自动拒绝缺翻译、重复、过长、语言错误、格式错误或日语汉字未注音的结果。
- 未通过的词保持空白，下次运行会再次尝试；详细原因记录在运行报告中。

## 例句风格：贴近专升本写作模板

专升本词条（`folder: 专升本词汇`）的例句按《英语语法背诵清单》里的写作模板来写，方便背单词时顺带记作文句型：

- 能直接套模板的，优先用模板原句或它的固定框架，例如 "Nowadays, an increasing number of people come to realize the importance of ..."、
  "It is obvious that ... has a bad effect on our health."、"Only by ... can we solve the problem."、"To sum up, ... but it is worth trying."。
- 抽象名词与动词（problem、effect、importance、situation、cooperation 等）优先走模板框架；具体名词（bee、basket、carrot 等）用日常陈述句，不要硬套。
- 形式与原词库一致：`English sentence. / 中文翻译。`。英文必须包含词条本身（可用自然屈折形式），中文 8～40 字并以 。！？ 结尾，同一批例句不重复。

2026-11 的 2190 条专升本词条例句就是按这套规则补齐的，`wordbanks/en-006.js`～`en-008.js` 里可以直接看到成品。

## 用量控制

每次运行的报告会记录请求数、输入 Token、输出 Token和剩余空例句数量。费用由 DeepSeek 按实际 Token 从账户余额扣除，建议先生成 100 词检查质量，再逐批生成 500 词。
