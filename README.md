# 钟日（jp-study）

离线优先的日英双语词汇学习 PWA 与 Android 原生应用，围绕「精装双语辞书」的排版与交互体验打造，纯原生 HTML / CSS / JavaScript 构建，零前端框架与零前端 AI 依赖，完整词库与学习进度全部本地可用。

- **在线使用（PWA）**：<https://ibka512.github.io/jp-study/>
- **应用标识**：`com.ibka.zhongri`（Capacitor 8 Android 封装）
- **内置词库规模**：日语 **5,906** 词（N5–N1，7 个分片） · 英语 **3,922** 词（CET-4 / CET-6，5 个分片）

---

## 核心特性

### 1. 多维学习与记忆调度
- **FSRS 智能到期复习**：内置 `ts-fsrs` 间隔重复算法，按「单词 / 读音 / 释义」维度追踪记忆曲线与连续学习天数，自动安排下次复习时间。
- **五种互补练习模式**：
  - **自由浏览**：翻卡听音，支持「全显 / 仅显汉字 / 仅显假名 / 仅显释义」遮盖模式，快速熟悉词形与发音。
  - **往复检验**：在读音拼写与词义辨认间交替出题，支持内置拼写键盘与四选一。
  - **循环强记**：针对当前词组反复巩固，答错词条自动回炉加练。
  - **三轮通关**：递进式测验点亮词条三维度掌握度标记，含盲听辨音阶段。
  - **筛选检验**：支持按「薄弱词优先 / 新词优先 / 词库原顺序」出题，可智能跳过已掌握维度；错误自动汇入**智能错题本**（同一词连续答对 3 次自动归档为已解决）。
- **高频桌面快捷键**：首页 `A–G` 直达各学习模式与范围设置，学习工作区支持 `← / ↓ / → / Space / Esc` 零延迟全键盘操作。

### 2. 双语词库与数据安全
- **按语言隔离与按需加载**：日语与英语词书独立分片加载，学习进度、收藏、错题、FSRS 调度和自定义词夹按语言完全隔离、互不串扰。
- **高效词库管理**：虚拟列表渲染近万词条，支持多列布局与列表遮盖、级别/难度筛选、自定义文件夹、批量移动/编辑/删除、7 天回收站、批量文本导入预检与内置词库数据完整性审计。
- **英语词根词缀公式**：英语词条支持词根词缀拆分展示，并内置独立的词根审核工作台（`root-review.js`）。
- **离线双保险持久化**：IndexedDB（`idb-keyval`）为主存储、`localStorage` 自动降级兜底；支持完整 JSON 备份导入/导出，大型清理或导入操作前自动生成恢复点并支持一键撤销。
- **多引擎语音朗读**：内置微软语音（Azure）、网易有道及系统本地 TTS 切换，支持切卡自动朗读。

### 3. 精装辞书视觉与物理动效
- **三套独立校准的辞书配色**（在「设置 → 外观与朗读」实时切换，均独立校准日间 / 夜间 × 日语 / 英语，并满足 WCAG AA 对比度）：
  - **和纸朱印（默认）**：暖宣纸底色 · 胜色靛蓝（日）/ 牛津松绿（英）· 朱砂印 / 琥珀金
  - **陶土日轮**：羊皮纸底色 · 柿渋赤陶（日）/ 普鲁士蓝（英）· 黄铜金 / 灼陶橙
  - **瑞士印刷**：石膏灰底色 · 墨黑权威 · 信号红 / 档案绿
- **跨语种辞书字体体系**：
  - 中文界面标题采用离线打包的明体子集 `LXGW Neo ZhiSong`（4,104 常用字，`vendor/zh-ming-subset.woff2`），回退 `PMingLiU / MingLiU`。
  - 英语词头采用 `Literata` 光学衬线，日语词头采用 `Noto Serif JP`，假名与注音采用 `BIZ UDPGothic`，音标配备独立高兼容字体栈。
- **物理手势与克制动效**：
  - 底部抽屉 1:1 跟手直接变换（零父级变量继承重算）、遮罩透明度联动、向上越界指数阻尼与速度感知甩出关闭。
  - 落印式长按打卡（GPU `scaleX` 非对称时序）、机械刻槽拨动开关、主题联动书脊词书卡、辞书签条式通知与同心刻纹盲听键。
  - 高频键盘操作不做冗余动画；完整支持 `@media (hover: hover) and (pointer: fine)` 触屏悬停隔离与温和的 `prefers-reduced-motion` 降级。

### 4. 多端响应与 Android 原生能力
- **三态自适应壳层**：手机竖屏底栏、横屏紧凑侧栏、桌面端完整侧边导航栏无缝切换。
- **Android 原生增强**（Capacitor 8）：
  - 场景化触感反馈（`@capacitor/haptics`）：点击、切换、确认、成功、错误分场景震动。
  - 后台智能复习提醒（`@capacitor/local-notifications`）：根据 FSRS 到期状态与当日学习记录自动编排提醒、未学习补救、星期筛选与跨午夜免打扰时段，通知内可直接「开始复习」或「30 分钟后提醒」。

---

## 项目结构

```text
jp-study/
├── index.html                  # 应用外壳与全部视图结构
├── ui-system.css               # 设计令牌（三套日夜双语配色、字体栈、动效曲线、基础控件）
├── style.css                   # 页面布局、学习工作区、词库、设置、抽屉与精装组件样式
├── app.js                      # 核心应用逻辑（Model / View / Controller）
├── settings-store.js           # 偏好设置声明式 Schema 与备份隔离（DP2）
├── wordbank-loader.js          # 按语言词库快照与分片加载器（DP1）
├── study-card-viewmodel.js     # FSRS 与筛选检验卡片纯视图模型（DP4 / DP5）
├── fsrs-scheduler.js           # FSRS 复习调度封装
├── rote-learning-core.js       # 循环强记状态机核心
├── notification-planner.js     # Android 智能/固定/免打扰提醒规划器
├── haptics.js                  # 场景化触感反馈封装
├── native-app.js / .css        # Capacitor Android 原生桥接与样式适配
├── root-review.js              # 英语词根词缀审核工作台
├── core-utils.js               # 公共工具与安全转义
├── release-info.js             # 版本与发布时间元数据
├── sw.js                       # PWA Service Worker（资产清单由脚本自动同步）
├── wordbanks/                  # 按语言切分的正式词库分片（ja-001~007 / en-001~005）
├── vendor/                     # 离线字体子集（明体/图标）、ts-fsrs UMD 构建
├── scripts/                    # 资产同步、字体/图标子集构建、Android Capacitor 打包脚本
├── tools/                      # Python 词库编译器、例句生成、词根生成与审校工具
├── tests/                      # 44 项 Node.js 测试 + 35 项 Python 单元测试
└── docs/                       # 专题开发、打包与词库建设文档
```

---

## 本地开发与测试

### 环境要求
- **Node.js**：`>= 22`（运行内置测试与构建脚本）
- **Python 3**：本地静态预览与运行词库工具单测
- **uv**（可选）：仅在需要重建离线中文字体子集 `vendor/zh-ming-subset.woff2` 时需要

### 本地运行
项目无需前端构建步骤，直接在仓库根目录起一个静态服务即可预览：

```bash
python3 -m http.server 8080
```

浏览器访问 `http://127.0.0.1:8080/` 即可体验完整 PWA。

### 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm test` | 运行全部 44 项 Node.js 自动化测试（持久化、外壳安全、FSRS、解耦模块、词库载荷等） |
| `python3 -m unittest discover -s tests -p "test_*.py"` | 运行全部 35 项 Python 词库编译与数据工具单元测试 |
| `npm run sync:assets` | 以 `index.html` 为唯一真相源，自动同步 `sw.js` 的本地预缓存资产清单 |
| `npm run check:assets` | 校验 `sw.js` 资产清单与 `index.html` 是否一致（CI 必检） |
| `npm run fonts:zh:build` | 扫描源码中文字符并通过 `pyftsubset` 重建离线明体子集 `vendor/zh-ming-subset.woff2` |
| `npm run icons:build` | 按源码引用的 Material Symbols 图标重建精简图标字体 `vendor/material-symbols-rounded.woff2` |
| `npm run wordbanks:slim` | 精简并校验分片词库载荷 |
| `npm run build:web` | 生成适配离线 Android WebView 的 `dist/` 产物 |
| `npm run android:prepare` | 构建 Web 产物并同步 Capacitor Android 工程 |
| `npm run android:debug` | 本地构建 Android Debug APK |

> **开发约定**：
> 1. 修改 `index.html` 中任何本地 CSS / JS 查询版本号后，运行 `npm run sync:assets` 并递增 `sw.js` 中的 `CACHE_NAME`。
> 2. 在界面中新增之前未出现过的汉字时，运行 `npm run fonts:zh:build` 并更新 `vendor/zh-ming.css` 缓存版本，确保离线明体全覆盖。
> 3. 新增 Material Symbols 图标时，运行 `npm run icons:build` 更新离线图标子集。

---

## 词库构建与专题文档

仓库内置离线词库构建工具链（`tools/`），可将外部公开词库、Anki `.apkg`、CSV / TSV / TXT / JSON 规范化合并为分片词库，支持稳定 ID、去重、例句补全、词根生成与许可登记。

详细指南请参阅：
- [安卓打包与上架说明](docs/ANDROID_BUILD.md) — GitHub Actions 自动构建 APK/AAB、持久签名配置、旧包迁移与商店发布
- [词库一键更新工具说明](docs/WORD_BANK_TOOL.md) — 钟日词库编译器用法与 GitHub Actions 一键入库
- [一键补全词库例句](docs/EXAMPLE_GENERATOR.md) — 缺失例句的分批生成、质量校验与部署流程
- [数据完整性说明](docs/DATA_INTEGRITY.md) — 词库结构约束、持久化迁移与恢复点机制
- [响应式界面说明](docs/RESPONSIVE_UI.md) — 手机、横屏与桌面多端断点与交互约定
- [第三方词库与许可](THIRD_PARTY_WORD_BANKS.md) — 内置日语 / 英语词库的数据来源与开源许可清单
