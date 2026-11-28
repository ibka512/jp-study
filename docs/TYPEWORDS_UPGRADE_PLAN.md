# 钟日（jp-study）借鉴 TypeWords 功能升级技术改造方案

本文档基于本地 `jp-study`（V9.1，纯原生 HTML/CSS/JS + PWA + Capacitor 8）与 `TypeWords` 两个仓库的实际源码对比整理，按 **P0 → P1 → P2** 优先级规划功能升级路线，确保改造符合 `jp-study` 现有的解耦模块化架构、双语隔离原则与零回归测试底线。

---

## 一、改造原则与架构约束

1. **保持纯原生与解耦边界**：所有新增核心状态机采用与 `study-card-viewmodel.js`、`rote-learning-core.js` 一致的 UMD 模块封装，挂载到 `globalThis`，可脱离 DOM 在 `node --test` 下独立单测，不破坏 `tests/axiomatic-decoupling.test.js` 的解耦约束。
2. **复用现有基础设施**：优先复用 `app.js` 中已有的 `RomajiEngine`（免切换系统 IME 的罗马音转假名引擎）、`EnglishInput`、`Hardware.playSound()`、`Hardware.speakWord()`、`HAPTICS`（`haptics.js`）与 `SETTINGS_STORE`（`settings-store.js`）。
3. **双端差异化默认策略**：桌面宽屏（实体键盘为主）默认激活展示拼写跟打；移动端（Capacitor / 触屏）默认关闭，避免弹出系统软键盘遮挡学习卡片，仅在用户手动开启或外接物理键盘时启用。
4. **发版资产同步**：每次新增脚本或修改 `index.html` 版本查询参数，必须同步更新 `sw.js` 的 `CACHE_NAME` 并执行 `npm run sync:assets && npm run check:assets`；若新增界面汉字或 Material Symbols 图标，需分别运行 `npm run fonts:zh:build` 与 `npm run icons:build`。

---

## 二、优先级总览

| 优先级 | 编号 | 改造项 | TypeWords 参考源码 | `jp-study` 核心落点 | 预期收益 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P0** | P0-1 | 学习模式展示拼写实时跟打（自由浏览 + 循环强记初识） | `visible-word-typing.ts`、`usePracticeWordTyping.ts`、`WordTypingCore.vue` | 新增 `visible-typing-core.js`；接入 `app.js` 卡片渲染与 `keydown` 中枢 | 将被动看卡升级为“视觉 + 听觉 + 肌肉记忆”三通道闭环 |
| **P0** | P0-2 | 跟打重复次数、自动切词、空格防误触冷却与桌面打字音效 | `usePracticeWordTyping.ts`（`repeatCount`/`autoNextWord`/`spaceCooldownTime`）、`setting.ts` | `settings-store.js`、`app.js`（`Hardware.playSound` 与设置面板） | 形成手不离键的心流节奏，补足桌面端缺少马达触感的反馈 |
| **P1** | P1-1 | 阶段默认显隐策略 + 单卡临时覆盖自动复位 | `usePracticeDisplayPolicy.ts` | `study-card-viewmodel.js`、`app.js` | 解决 `#next-display-mode` 状态残留，支持 `Esc`/快捷键临时偷看 |
| **P1** | P1-2 | 展示跟打首条例句自动串播 | `practice-audio.ts`（`shouldChainPracticeFirstSentence`） | `app.js`（`Hardware.speakWord` 与跟打完成回调）、`settings-store.js` | 单词拼写后自动接例句朗读，强化语境记忆 |
| **P1** | P1-3 | 拼写/跟打客观失误自动映射 FSRS 评分 | `setting.ts`（`fsrsEasyLimit`/`fsrsGoodLimit`/`fsrsHardLimit`） | `fsrs-scheduler.js`、`app.js`（`Model.recordFsrsReview`） | 用客观错键数与提示次数减少主观自评偏差 |
| **P2** | P2-1 | 例句关键词挖空跟打 & 易混词成对跟打 | `useSentenceTypingFlow.ts` | `app.js`（`#w-example-box`）、`confusables-data.js` | 从孤立词拼写升级到语境填空与近形/近音辨析 |
| **P2** | P2-2 | 桌面端底部极简快捷键提示条 & 全角标点兼容 | `visible-word-typing.ts`（`normalizePracticeInputCharacter`） | `index.html`、`style.css`、`visible-typing-core.js` | 降低快捷键记忆成本，避免中文输入法标点误判 |

---

## 三、分阶段详细技术设计

### P0-1：学习模式展示拼写实时跟打引擎

#### 1. 涉及文件
- **新增**：`visible-typing-core.js`（纯逻辑状态机与逐字比对模块，UMD 导出 `globalThis.ZhongriVisibleTypingCore`）
- **修改**：
  - `index.html`：在 `app.js` 之前引入 `<script src="visible-typing-core.js?v=..." defer></script>`；在 `#flash-card` 内保留 `#w-word` / `#w-kana` 结构并增加跟打状态容器属性（如 `data-typing-active`）与轻量待转换罗马音提示槽。
  - `app.js`：
    - `View.updateCardContent`（约 L7569 起）：在 `Model.state.mode === 'pendulum'` 与 `isRote && forceRoteFull` 分支初始化跟打目标并渲染逐字叠层视图。
    - 全局键盘中枢 `document.addEventListener('keydown', ...)`（约 L10891–11032）：在 `isSpelling` 判断之后增加 `isVisibleTypingActive` 分支，接管字母/连字符/撇号/退格（及英文多词短语的空格）。
  - `style.css` / `ui-system.css`：新增 `.vt-char-correct`（绿色/主题正色）、`.vt-char-wrong`（朱砂红）、`.vt-char-pending`（低透明度未输入原词）、`.vt-romaji-buffer`（日语待合成罗马音下划线胶囊）、`.vt-cursor`（闪烁竖线光标）与 `.vt-shake`（错误抖动，遵循 `prefers-reduced-motion`）。
  - `sw.js`：通过 `npm run sync:assets` 自动纳入 `visible-typing-core.js`。

#### 2. 数据结构设计

##### (1) 跟打会话状态（`VisibleTypingState`）
```js
/**
 * 挂在 visible-typing-core.js 内部实例或 Model.state.visibleTyping
 */
const VisibleTypingState = {
  active: false,            // 当前卡面是否启用了可见跟打
  lang: 'ja',               // 'ja' | 'en'
  targetText: '',           // 规范化后的跟打目标（英语为 w.word，日语为清理括号后的主假名）
  targetTokens: [],         // 逐字/逐假名数组（Array.from(targetText)）
  inputText: '',            // 已提交的字符（英语为已敲字母，日语为 RomajiEngine.raw）
  romajiBuffer: '',         // 日语未合成的罗马音缓冲（RomajiEngine.buffer）
  locked: false,            // 敲满但含错字时锁定，提示按 Backspace 修正
  completed: false,         // 当前遍已完成且全对
  repeatDone: 0,            // 当前词已完成跟打遍数
  repeatTarget: 1,          // 目标跟打遍数（来自 settings-store）
  typoCount: 0,             // 本词累计错键次数（供 P1-3 FSRS 评分使用）
  completedAt: 0            // 完成时间戳（供 spaceCooldownTime 防误触使用）
};
```

##### (2) 逐字渲染视图状态（`VisibleTypingCharState[]`）
```js
/**
 * 借鉴 TypeWords visible-word-typing.ts 的 getPracticeInputCharacterStates
 */
{
  char: 'a',                // 目标字符或实际输入字符
  status: 'correct' | 'wrong' | 'pending',
  index: 0
}
```

##### (3) 双语目标提取与校验规则
- **英语（`lang === 'en'`）**：
  - 目标：`normalizeHeadword(w.word, 'en')`，默认忽略大小写，统一弯引号 `’‘` → `'`。
  - 若 `skipPhraseSpell === true` 且 `getEnglishPhraseMeta(w.word).isMultiWord === true`，可跳过或仅做提示（保持与现有设置语义一致）。
  - 全词可见时采用 TypeWords 的 `wholeInputAttempt` 语义：输错不清空，实时逐字标红/绿；敲满长度后若含错字则锁定并触发抖动；按 `Backspace` 可选择逐字删除或调用 `getInputAfterWrongBackspace()` 直接退回第一个错字位置。
- **日语（`lang === 'ja'`）**：
  - 展示策略：`#w-word` 正常显示汉字词头，`#w-kana` 作为跟打渲染区。
  - 目标：取 `w.kana || w.word`，去除 `[【】\[\]()]` 后取首个读音（按 `/／` 切分）。
  - 比较策略：统一用 `RomajiEngine.toHiragana()` 将输入与目标归一化比对（避免平/片假名模式切换打断心流，但仍保留片假名外观显示）；`n` 处于词尾且目标末位为 `ん/ン` 时自动补全提交，避免必须多敲一次 `n`。

---

### P0-2：跟打节奏控制、防误触冷却与桌面按键音效

#### 1. 涉及文件
- **修改**：
  - `settings-store.js`：在 `PREFERENCE_SCHEMA` 中新增声明式偏好项（自动纳入备份/恢复）。
  - `app.js`：
    - `Hardware.playSound()`：新增 `'key_type'`（短促高频清脆合成音，约 20–30ms，支持音量控制）与 `'key_wrong'`（低沉短提示音），避免阻塞音频上下文。
    - `Controller` 设置页事件绑定与学习区 `keydown` 中的 `spaceCooldownTime` 校验。
  - `index.html`：在「设置 → 学习偏好 / 交互与声音」增加对应开关与分段选择器（沿用 `.tactile-switch-wrap` 与 `.segmented-control`，自动接入 `SliderMotion`）。

#### 2. `settings-store.js` 新增字段 Schema
```js
// 追加至 PREFERENCE_SCHEMA
studyVisibleTyping: Object.freeze({ defaultValue: 'auto', backup: true, type: 'string' }),   // 'auto'（桌面开/移动关）| 'on' | 'off'
typingRepeatCount: Object.freeze({ defaultValue: '1', backup: true, type: 'string' }),       // '1' | '2' | '3'
autoNextOnTyped: Object.freeze({ defaultValue: 'true', backup: true, type: 'boolean' }),     // 打完自动切下一词
waitTimeForChangeWord: Object.freeze({ defaultValue: '300', backup: true, type: 'string' }), // 自动切词延迟（ms）
spaceCooldownTime: Object.freeze({ defaultValue: '300', backup: true, type: 'string' }),     // 完成后空格防误触冷却（ms）
typingKeySound: Object.freeze({ defaultValue: 'true', backup: true, type: 'boolean' }),      // 桌面端按键音效
autoPlayFirstSentence: Object.freeze({ defaultValue: 'false', backup: true, type: 'boolean' }) // P1-2 首句串播开关
```

---

### P1-1：阶段默认显隐策略 + 单卡临时覆盖自动复位

#### 1. 涉及文件
- **修改**：
  - `study-card-viewmodel.js`：新增 `resolveDisplayPolicy(mode, subStage)` 与 `applyCardDisplayOverride(basePolicy, overrides)` 纯函数。
  - `app.js`：在 `Model.state` 新增 `cardRevealOverride`（如 `{ showWord: null, showMeaning: null, peekAll: false }`），每次切词或切换学习阶段（`renderStudyCard` 触发新词/新阶段）时自动清空 `cardRevealOverride`，并绑定临时偷看快捷键（例如在非弹窗状态下按 `Alt` 或独立热键临时显示全词，松开或切词恢复）。

#### 2. 数据结构设计
```js
const CardDisplayPolicy = {
  base: {
    maskWord: false,
    maskReading: false,
    maskMeaning: false
  },
  override: {
    maskWord: null,       // boolean | null（null 表示沿用 base）
    maskReading: null,
    maskMeaning: null,
    peekAll: false        // 临时揭晓全部，切词立即归 false
  }
};
```

---

### P1-2：首条例句自动串播

#### 1. 涉及文件
- **修改**：
  - `app.js`：
    - 抽离纯判断函数 `shouldChainFirstSentence({ autoPlayFirstSentence, mode, isWordVisible, exampleText, alreadyPlayed })`（借鉴 TypeWords `practice-audio.ts`）。
    - 扩展 `Hardware.speakWord(w, btnEl, { onEnd })`，在单词播报结束回调中按需解析 `w.example` 首条外语原文（按 `||` 取第一段、按 `findExampleDividerIndex` 截取原文），调用 `Hardware.speakText(firstSentence, null, w.lang)`。
    - 切词或用户再次触发发音时立即调用 `Hardware.stopAllAudio()` 并取消待执行的串播回调（防止音轨重叠）。

---

### P1-3：拼写/跟打客观失误自动映射 FSRS 评分

#### 1. 涉及文件
- **修改**：
  - `fsrs-scheduler.js`：新增纯函数 `suggestRatingFromTyping({ typoCount, usedHint, isSkipped, limits })`。
  - `app.js`：在往复检验拼写、循环强记拼写、三轮通关拼写完成时，把本次 `typoCount` 与 `usedHint` 传入 `suggestRatingFromTyping`，写入 `Model.recordFsrsReview({ word, dimension, rating, source })`；在 FSRS 复习页若开启跟打，则高亮推荐对应 `1–4` 评分按钮供一键确认。

#### 2. 评分映射数据结构
```js
const DEFAULT_FSRS_TYPING_LIMITS = Object.freeze({
  easyMaxTypos: 0,        // 0 错且未看提示 -> 'easy'（或跟打模式保守给 'good'）
  goodMaxTypos: 1,        // 1 错且未看提示 -> 'good'
  hardMaxTypos: 3         // 2–3 错 -> 'hard'；>3 错或偷看提示/跳过 -> 'again'
});
```

---

### P2-1 & P2-2：例句关键词挖空跟打、易混词对比与快捷键提示条

#### 1. 涉及文件
- **修改**：
  - `app.js`：在 `#w-example-box` 渲染例句时，对命中的目标词（英语支持简单词形匹配，日语匹配词头或假名）提供“点击挖空跟打”交互；在词库/复习中结合 `confusables-data.js` 增加易混词组对比跟打入口。
  - `visible-typing-core.js`：补充 `normalizeFullWidthKey(event, targetChar)`（借鉴 TypeWords `SHIFT_FULL_WIDTH_CHARACTER_CODE_MAP` / `FULL_WIDTH_CHARACTER_CODE_MAP`，防止中文输入法下输入 `—`、`’`、`、` 等符号误判）。
  - `index.html` & `style.css`：在桌面端（`@media (hover: hover) and (pointer: fine)` 且宽屏）学习区底部渲染单行克制的快捷键提示条（`字母 跟打 · Space 发音/继续 · ←/→ 切词 · Esc 退出`），移动端自动隐藏。

---

## 四、测试用例清单

### 1. 新增自动化单元测试（Node.js `node --test`）

| 测试文件 | 覆盖优先级 | 核心测试场景 |
| :--- | :---: | :--- |
| `tests/visible-typing-core.test.js` | **P0** | 1. 英语逐字校验：正确标绿、错误标红但不清空、忽略大小写与弯引号归一化<br>2. 英语多词短语：空格正确匹配、连续空格防重复、敲满含错字时 `locked=true` 触发错误态<br>3. `getInputAfterWrongBackspace`：一键退回首个错字索引；无错时正常删末位<br>4. 日语假名跟打：平/片假名统一比对、促音（`tt→っ`）、拨音（`nn`/`n+辅音→ん`）、词尾单 `n` 自动收敛、含括号/多读音假名清洗<br>5. 重复次数与冷却：`repeatTarget=2` 时第一遍不触发 `onComplete` 而重置进入第二遍；`spaceCooldownTime` 内按空格被忽略<br>6. 全角标点归一化（P2-2） |
| `tests/study-display-policy.test.js` | **P1** | 1. 各模式默认显隐矩阵正确返回<br>2. 单卡临时覆盖（`peekAll` / `maskMeaning`）生效且不修改基础策略<br>3. 切词或切换阶段时临时覆盖自动清空复位 |
| `tests/fsrs-auto-rating.test.js` | **P1** | 1. `typoCount=0, usedHint=false` 映射为 `good/easy`<br>2. `typoCount=1` 映射为 `good`，`typoCount=2..3` 映射为 `hard`<br>3. `typoCount>3`、`usedHint=true` 或 `isSkipped=true` 强制映射为 `again` |
| `tests/settings-store` / `tests/app-persistence.test.js`（扩充） | **P0/P1** | 新增 7 个偏好键的默认值读取、备份收集（`collectBackupPreferences`）与恢复（`applyBackupPreferences`）完整无遗漏 |

### 2. 端到端与交互回归测试（Chromium Smoke + 手工验收）

| 验证维度 | 检查项 | 执行方式 |
| :--- | :--- | :--- |
| **资产与构建一致性** | `index.html` 新增 `visible-typing-core.js` 后 `sw.js` 预缓存清单零漂移；新增汉字/图标无缺字 | `npm run sync:assets && npm run check:assets` |
| **全量自动化回归** | 现有 48 项 JS 单测 + 新增单测 + 35 项 Python 单测全绿 | `npm test` & `python3 -m unittest discover -s tests -p "test_*.py"` |
| **浏览器冒烟测试** | 在 `scripts/smoke-browser.mjs` 增加自由浏览桌面端键盘跟打用例（输入英语词/日语罗马音 → 验证绿色高亮 → 输错验证抖动 → 完成后切词） | `npm run test:smoke` |
| **跨端与无障碍验收** | 1. 桌面端 `Cmd+K` 命令面板打开时屏蔽卡片跟打<br>2. 手机竖屏/矮横屏默认不弹软键盘、Combo 顶栏与卡片零遮挡<br>3. `prefers-reduced-motion: reduce` 下关闭错误抖动与光标闪烁动画<br>4. 切词瞬间中断未播完的首句例句音频，无双轨串音 | 真机 / DevTools 响应式模拟验收 |
