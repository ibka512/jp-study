<div align="center">
  <img src="./logo.png" alt="钟日（jp-study）Logo" width="116" height="116" />

  <h1>钟日 · jp-study</h1>

  <p>
    <strong>离线优先的日英双语词汇学习 PWA 与 Android 原生应用</strong><br />
    以「精装双语辞书」为设计语言，纯原生 HTML / CSS / JavaScript 构建 · 零前端框架 · 零前端 AI 依赖
  </p>

  <p>
    <a href="https://ibka512.github.io/jp-study/">
      <img src="https://img.shields.io/badge/在线体验-PWA_Web_App-1b3b5a?style=flat-square" alt="在线体验 PWA" />
    </a>
    <img src="https://img.shields.io/badge/版本-V9.1-a63e26?style=flat-square" alt="版本 V9.1" />
    <img src="https://img.shields.io/badge/词库规模-9,828_词_(日_5,906_·_英_3,922)-1b4d3e?style=flat-square" alt="词库规模 9828 词" />
    <img src="https://img.shields.io/badge/Android-Capacitor_8-2e6699?style=flat-square" alt="Android Capacitor 8" />
    <img src="https://img.shields.io/badge/自动化测试-48_Node_+_35_Python_+_Smoke-277c54?style=flat-square" alt="自动化测试" />
  </p>

  <p>
    <a href="https://ibka512.github.io/jp-study/">在线使用（PWA）</a> ·
    <a href="#核心功能">核心功能</a> ·
    <a href="#词性配色与拼色卡片">词性配色</a> ·
    <a href="#物理动效与场景化触感">动效与触感</a> ·
    <a href="#系统架构与目录结构">项目结构</a> ·
    <a href="#本地开发与测试">开发与测试</a> ·
    <a href="#专题文档">专题文档</a>
  </p>
</div>

---

## 项目简介

**钟日（`jp-study` / `com.ibka.zhongri`）** 是一款面向长期高频背词场景的离线优先双语词汇应用，同时支持浏览器 **PWA 离线安装** 与 **Capacitor 8 Android 原生封装**。

- **极致轻快与离线可用**：不引入任何重型前端框架、打包器或云端 AI 依赖，9,828 个内置词条、离线中文字体子集、图标字体与 FSRS 复习算法全部本地预缓存，断网亦可完整学习与复习。
- **双语完全隔离**：日语（JLPT N5–N1，5,906 词）与英语（CET-4 / CET-6，3,922 词）独立按需加载；学习进度、收藏、错题本、FSRS 记忆曲线与自定义词夹按语言严格隔离，互不串扰。
- **精装辞书美学 × 真实物理手感**：结合和纸矿物色系、多词性斜切拼色卡片、240Hz 弹簧物理导航与全站滑块、以及面向 X 轴线性马达调校的场景化触感反馈，让日常背词兼具纸质词典的克制耐看与原生级交互质感。

---

## 核心功能

### 1. FSRS 智能调度与五种互补练习模式

内置 `ts-fsrs` 间隔重复算法，按「**单词 / 读音 / 释义**」三维度追踪记忆稳定性与遗忘曲线，并配合 28 天「**打卡印谱**」与精装「**学习完成小票**」提供即时正向闭环。

| 学习模式 | 适用阶段 | 核心机制与交互特性 | 桌面快捷键 |
| :--- | :--- | :--- | :---: |
| **自由浏览** | 初识词形与读音 | 翻卡听音，支持「全显 / 仅显汉字 / 仅显假名 / 仅显释义」四态遮盖 | `A` |
| **往复检验** | 拼写与词义强化 | 读音拼写与词义辨认交替出题，内置定制拼写键盘与四选一 | `B` |
| **循环强记** | 高频短组巩固 | 独立状态机（`rote-learning-core.js`），错词自动回炉加练直至掌握 | `C` |
| **三轮通关** | 阶段验收 | 三轮递进测验点亮三杠掌握度标记，包含同心刻纹盲听辨音阶段 | `D` |
| **筛选检验** | 查漏补缺 | 支持「薄弱优先 / 新词优先 / 词库原序」与智能跳过已亮维度，错词自动归入智能错题本（连对 3 次自动归档） | `E` |
| **FSRS 到期复习** | 长期防遗忘 | 依据遗忘曲线自动排期，四级评分（重来 / 困难 / 良好 / 简单）动态计算下次复习间隔 | 首页卡片直达 |

**高频桌面快捷键**：首页支持 `A–G` 直达学习模式与范围选择；学习工作区支持 `← / ↓ / → / Space / Esc` 零延迟全键盘流转（高频键盘操作遵循「零冗余动画」原则，不拖慢节拍）。

---

### 2. 词性配色与拼色卡片

针对日英双语词库，词库卡片（`.wb-card`）、学习闪卡（`#flash-card`）与单词详情卡（`#detail-card-container`）全面采用 **8 大词性和纸矿物配色**，并在浅色 / 深色模式及全部三套调色盘下自动保持高对比度可读性：

| 词性类别 | 矿物色系 | 浅色卡面 / 强调色 | 深色卡面 / 强调色 |
| :--- | :--- | :--- | :--- |
| **名词** | 浅葱蓝染 | `#E8F1FA` / `#25639A` | `#192634` / `#70B3EB` |
| **动词** | 珊瑚暖橘 | `#FCEBE5` / `#C94C34` | `#321F1B` / `#EF836C` |
| **形容词** | 郁金琥珀 | `#FCF2D6` / `#B57B10` | `#2F2615` / `#E8B548` |
| **形容动词（ナ形）** | 樱桃胭脂 | `#FAE8EF` / `#BA466D` | `#301D26` / `#EA7FA3` |
| **副词** | 若竹苔绿 | `#E5F4EB` / `#277C54` | `#182B22` / `#64C796` |
| **代词** | 藤紫 | `#F0E9FA` / `#6F48A8` | `#261E34` / `#B492E8` |
| **介词 / 连词 / 助词** | 青瓷碧青 | `#E3F4F4` / `#1E7A7D` | `#162B2D` / `#5EC5C9` |
| **其他（感叹词 / 短语等）** | 暖砂银鼠 | `#F1EDE6` / `#73685A` | `#25221E` / `#AFA394` |

- **多词性斜切拼色**：当词条兼具两种或三种以上词性（如日语 `元気` 名・形动、`仕事` 名・サ变动词；英语 `abstract` 形容词・名词、`triple` 名词・形容词・动词），卡片表面呈现 **`132°` 锐利微羽化斜切拼色**，顶部配套等分硬切色带（`50%/50%` 或 `33.3%×3`）及各自匹配词性配色的 `.type-capsule` 徽章。
- **多分隔符兼容**：显示层统一识别 `・ / ／ 、 , ， ; ； |` 等多种词性分隔符，自定义导入词条同样即时呈现拼色。

---

### 3. 双语词库、语音朗读与数据安全

- **虚拟列表高效渲染**：近万词条丝滑滚动，支持多列切换、列表分项遮盖、级别/难度/词夹筛选、关键词搜索一键清空、快捷新建词条、批量移动/编辑/删除与 7 天回收站。
- **单词详情页手势与快捷编辑**：详情卡支持 **1:1 横向滑动切词**、例句单条删除与一键撤销、行内快捷编辑与收藏。
- **英语词根词缀公式**：内置英语词根拆分彩色公式卡片，配套独立离线审校工作台（`root-review.js`）。
- **多引擎 × 三档语速朗读**：支持微软语音（Azure）、网易有道及系统自带 TTS 切换，提供 `0.75× 慢速 / 1.0× 标准 / 1.25× 较快` 三档语速分段调节，离线时自动无感回退至系统语音。
- **离线双保险持久化**：IndexedDB（`idb-keyval`）为主存储、`localStorage` 自动降级兜底；内置全库数据完整性审计（0 阻断错误）、完整 JSON 备份导入/导出，以及大批量导入或清理前的自动恢复点保护。

---

### 4. 精装辞书视觉与字体体系

- **三套独立校准的辞书调色盘**（在「设置 → 外观与朗读」实时切换，均按日间/夜间 × 日语/英语独立校准）：
  - **和纸朱印（默认）**：暖宣纸底色 · 胜色靛蓝（日）/ 牛津松绿（英）· 朱砂印 / 琥珀金
  - **陶土日轮**：羊皮纸底色 · 柿渋赤陶（日）/ 普鲁士蓝（英）· 黄铜金 / 灼陶橙
  - **瑞士印刷**：石膏灰底色 · 墨黑权威 · 信号红 / 档案绿
- **跨语种辞书排印**：
  - 中文界面标题采用离线打包的明体子集 `LXGW Neo ZhiSong`（4,104 常用字，`vendor/zh-ming-subset.woff2`），回退 `PMingLiU / MingLiU`。
  - 英语词头采用 `Literata` 光学衬线，日语词头采用 `Noto Serif JP`，假名采用 `BIZ UDPGothic`，音标配备独立高兼容字体栈。
  - Material Symbols 图标字体按源码实际引用精简打包（`vendor/material-symbols-rounded.woff2`，约 39.5 KB），保留 `FILL` 可变轴。

---

### 5. 物理动效与场景化触感

#### 物理引擎驱动的导航与滑块
- **悬浮展开胶囊岛 TabBar × 顶边朱砂书签丝带**：
  - 移动端为居中悬浮展开胶囊岛，桌面/横屏自动切换为左侧导航栏。
  - 共享主色胶囊 `#nav-pill` 与顶边朱砂书签 `#nav-ribbon` 由同一套 **240Hz 子步半隐式欧拉弹簧引擎**驱动，支持速度继承中途打断、速度感应液态拉伸（Squash & Stretch）、**底栏 1:1 跟手滑切**（边界橡皮筋阻尼 + 松手速度注入）与方向感知可打断切页转场。
- **全站 18 处滑块与机械开关动效（`SliderMotion`）**：
  - 顶栏语言切换器（移动端 `日 | EN` / 桌面端 `日本語 | English`）与设置页 4 组分段控制器全部使用共享 `.seg-thumb` 弹簧滑块，同步插值位置与宽度并支持 1:1 跟手滑切；挂载 `ResizeObserver` 确保隐藏子页首次展开零闪烁对齐。
  - 全部 12 处开关（`.tactile-slider` / `.native-switch` / `.native-mini-switch`）支持按下方向蓄力拉伸、非线性微过冲弹簧回弹与 **1:1 横向拖拽拨动**（越过中点触发刻度微震）。
- **底部抽屉与克制动效规范**：底部抽屉 1:1 跟手直接变换、遮罩透明度联动与甩出关闭；落印式长按打卡（GPU `scaleX` 非对称时序）；完整支持 `@media (hover: hover) and (pointer: fine)` 触屏悬停隔离与 `prefers-reduced-motion` 无障碍降级。

#### 场景化 X 轴线性马达触感体系（`haptics.js`）
- **短促有力「咚咚」调校**：全部震动脉冲标定在 **8–36ms**（强烈档上限 42ms），配合 36–56ms 干净刹停间隙，模拟旗舰手机 X 轴线性马达的清脆颗粒感，拒绝拖泥带水的长嗡鸣。
- **全场景触感语汇**：区分 `key`、`navigation`、`cardFlip`、`sheetOpen / Close`、`star`、`hint`、`easy`、`correct`、`error`、`combo`（连击里程碑递增）、`celebration`（通关庆祝）、`chargeTick`（长按打卡渐进震动）与 FSRS 四级评分手感。
- **可视化调节与跨端兼容**：支持「轻柔 / 标准 / 强烈」3 档强度调节与 6 场景实时试听条；内置 **Android Chrome / Edge 短震动兼容模式**（绕过 Chromium 忽略 `<= 1000ms` 短脉冲的问题）、**iOS 17.4+ `<input switch>` 触感回退**，以及 Capacitor Android 原生 `@capacitor/haptics` 桥接。

---

### 6. Android 原生增强（Capacitor 8）

- **三态响应式壳层**：手机竖屏悬浮底栏、矮屏横屏紧凑侧栏、桌面宽屏完整侧栏无缝切换。
- **后台智能学习提醒（`@capacitor/local-notifications` + `notification-planner.js`）**：按 FSRS 到期维度数与当日学习记录自动编排提醒，支持未学习补救时段、星期多选、跨午夜免打扰与准时提醒选项；通知栏可直接点击「开始复习」或「30 分钟后提醒」。

---

## 系统架构与目录结构

应用采用轻量级解耦模块化架构，显式生命周期事件总线 `ZhongriHooks` 替代传统 Monkey-Patch 链，核心状态机与视图模型可脱离 DOM 独立单测：

```text
jp-study/
├── logo.png                    # 钟日品牌图标（PWA / 导航栏 / Android 图标源）
├── manifest.json               # Web App Manifest（独立离线安装配置）
├── index.html                  # 应用外壳与全部视图结构（资产版本号唯一真相源）
├── ui-system.css               # 设计令牌（3 套日夜双语调色盘、8 大词性矿物色、字体栈、开关控件）
├── style.css                   # 页面布局、TabBar、词库、闪卡/详情卡、设置与抽屉样式
├── app.js                      # 核心应用逻辑（Model / View / Controller / Nav / SliderMotion / ZhongriHooks）
├── settings-store.js           # 偏好设置声明式 Schema 与备份隔离（DP2）
├── wordbank-loader.js          # 按语言词库快照与分片按需加载器（DP1）
├── study-card-viewmodel.js     # FSRS 与筛选检验卡片纯视图模型（DP4 / DP5）
├── fsrs-scheduler.js           # ts-fsrs 复习调度封装
├── rote-learning-core.js       # 循环强记状态机核心
├── notification-planner.js     # Android 智能 / 补救 / 免打扰提醒规划器
├── haptics.js                  # 场景化 X 轴线性马达触感引擎与跨浏览器兼容层
├── native-app.js / .css        # Capacitor 8 Android 原生桥接与安全区样式适配
├── root-review.js              # 英语词根词缀离线审校工作台
├── core-utils.js               # 公共工具与安全 HTML 转义
├── release-info.js             # 版本号与构建时间元数据
├── sw.js                       # PWA Service Worker（预缓存清单由脚本自动同步）
├── wordbanks/                  # 按语言切分的正式词库分片（ja-001~007 / en-001~005）
├── vendor/                     # 离线字体子集（明体 / Material Symbols）、ts-fsrs UMD 构建
├── scripts/                    # 资产同步、字体/图标子集、Chromium 冒烟测试、Android 打包脚本
├── tools/                      # Python 词库编译器、例句补全、词根生成与审校工具
├── tests/                      # 48 项 Node.js 单元测试 + 35 项 Python 单元测试
└── docs/                       # Android 打包、词库工具、数据完整性与响应式规范文档
```

---

## 本地开发与测试

### 环境要求

- **Node.js**：`>= 22`（运行 `node --test` 与全部构建/同步脚本）
- **Python 3**：本地静态预览服务与运行词库工具单元测试
- **uv**（可选）：仅在需要重建离线中文字体子集 `vendor/zh-ming-subset.woff2` 时需要

### 本地运行

无需任何前端编译或打包步骤，在仓库根目录启动静态服务即可体验完整 PWA：

```bash
git clone https://github.com/ibka512/jp-study.git
cd jp-study
python3 -m http.server 8080
```

浏览器访问 `http://127.0.0.1:8080/` 即可使用。

### 常用命令

| 命令 | 说明 |
| :--- | :--- |
| `npm test` | 运行全部 **48 项** Node.js 自动化测试（持久化、外壳安全、词性拼色、触感引擎、FSRS、解耦模块、词库载荷等） |
| `python3 -m unittest discover -s tests -p "test_*.py"` | 运行全部 **35 项** Python 词库编译与数据工具单元测试 |
| `npm run test:smoke` | 启动本地服务并运行真机 Chromium 端到端冒烟测试（首页、9,828 词审计、语速、结算小票、桌面端布局） |
| `npm run sync:assets` | 以 `index.html` 为唯一真相源，自动同步 `sw.js` 中的本地预缓存资产清单（共 26 项） |
| `npm run check:assets` | 校验 `sw.js` 资产清单与 `index.html` 零漂移（CI 必检） |
| `npm run fonts:zh:build` | 扫描源码汉字并通过 `pyftsubset` 重建离线明体子集 `vendor/zh-ming-subset.woff2` |
| `npm run icons:build` | 按源码引用的 Material Symbols 图标重建精简图标字体 `vendor/material-symbols-rounded.woff2` |
| `npm run wordbanks:slim` | 精简并校验分片词库体积与载荷 |
| `npm run build:web` | 生成适配离线 Android WebView 的 `dist/` 构建产物 |
| `npm run android:prepare` | 构建 Web 产物并同步 Capacitor 8 Android 原生工程 |
| `npm run android:debug` | 本地编译 Android Debug APK |

### 开发与发版约定

1. **缓存版本同步**：修改 `index.html` 中任何本地 CSS / JS 查询版本号后，务必递增 `sw.js` 中的 `CACHE_NAME` 并运行 `npm run sync:assets && npm run check:assets`。
2. **离线字体同步**：在界面中新增此前未出现过的汉字时，运行 `npm run fonts:zh:build` 并更新 `vendor/zh-ming.css` 版本号；新增 Material Symbols 图标时运行 `npm run icons:build`。
3. **零回归底线**：提交前保持 `npm run check:assets`、`npm test`（48/48）、Python 单测（35/35）与 `npm run test:smoke` 全绿。

---

## 专题文档

仓库内置完整离线词库构建工具链（`tools/`）与专题工程文档：

- [安卓打包与上架说明](docs/ANDROID_BUILD.md) — GitHub Actions 自动构建 APK / AAB、持久签名配置、旧包迁移与发布流程
- [词库一键更新工具说明](docs/WORD_BANK_TOOL.md) — 钟日词库编译器（支持 Anki `.apkg` / CSV / TSV / TXT / JSON）与一键入库工作流
- [一键补全词库例句](docs/EXAMPLE_GENERATOR.md) — 缺失例句的分批生成、质量校验与部署流程
- [数据完整性说明](docs/DATA_INTEGRITY.md) — 词库结构约束、持久化迁移与自动恢复点机制
- [响应式界面说明](docs/RESPONSIVE_UI.md) — 手机、横屏与桌面三态断点与交互约定
- [第三方词库与许可](THIRD_PARTY_WORD_BANKS.md) — 内置日语 / 英语词库数据来源与开源许可清单
