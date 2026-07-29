'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const app = fs.readFileSync('app.js', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
const serviceWorker = fs.readFileSync('sw.js', 'utf8');
const styles = fs.readFileSync('style.css', 'utf8');
const uiStyles = fs.readFileSync('ui-system.css', 'utf8');
const logo = fs.readFileSync('logo.png');

assert.match(
    app,
    /删除「\$\{escapeHTML\(filter\)\}」/
);
assert.match(
    app,
    /默认词库「\$\{escapeHTML\(mainFallbackFolder\)\}」/
);
assert.match(index, /updateViaCache:\s*['"]none['"]/);
assert.match(index, /registration\.update\(\)/);
assert.match(index, /zhongri-update-ready/);
assert.doesNotMatch(index, /mathjax@3\/es5\/tex-mml-chtml\.js/);
assert.doesNotMatch(app, /mathjax@3\/es5\/tex-mml-chtml\.js/);
assert.match(app, /mathjax@3\.2\.2\/es5\/tex-mml-chtml\.js/);
assert.match(app, /const MATHJAX_INTEGRITY =\s*'sha384-[A-Za-z0-9+/=]+'/);
assert.match(app, /const loadMathJax = \(\) =>/);
assert.match(app, /script\.integrity = MATHJAX_INTEGRITY/);
assert.match(app, /script\.crossOrigin = 'anonymous'/);
assert.match(app, /document\.head\.appendChild\(script\)/);
assert.match(app, /HAPTICS\.install\(\)/);
assert.match(app, /'diagnostic',[\s\S]*\{ force: true \}/);
assert.match(app, /Hardware\.playSound\('click', \{ haptic: false \}\)/);
assert.match(index, /id="setting-haptics-enabled"/);
assert.match(index, /data-haptic="none"/);
assert.match(index, /id="settings-app-version"/);
assert.match(index, /id="settings-app-published"/);
assert.match(index, /wordbank-loader\.js/);
assert.match(index, /setting-item-vertical ai-key-setting/);
assert.match(
    index,
    /AI 引擎（DeepSeek）[\s\S]*?setting-key-wrapper/
);
assert.match(
    index,
    /智能跳过已亮维度[\s\S]*?<div class="setting-item"/
);
assert.match(index, /ai-capability-list/);
assert.doesNotMatch(index, /ai-capability-panel/);
assert.match(
    styles,
    /\.settings-key-wrapper\s*\{\s*width:\s*100%/
);
assert.match(
    fs.readFileSync('style.css', 'utf8'),
    /\.ai-key-setting\s*\{[\s\S]*?flex-direction:\s*column\s*!important/
);
assert.doesNotMatch(serviceWorker, /mathjax@3\/es5\/tex-mml-chtml\.js/);
assert.equal(
    (app.match(/Controller\.renderAIHistory\s*=\s*function/g) || []).length,
    1,
    'AI 历史记录应只保留增强后的渲染实现'
);
assert.doesNotMatch(app, /async callDeepSeekStream\s*\(/);
assert.doesNotMatch(app, /openAIHistoryDetail\s*\(/);
assert.doesNotMatch(index, /ai-history-detail-(?:overlay|title|copy|close|messages)/);
assert.equal(
    (app.match(/\blet messagesToSend\s*=/g) || []).length,
    2,
    '只应在两个实际发起请求的流式方法中组装消息'
);
assert.match(serviceWorker, /request\.mode === ['"]navigate['"]/);
assert.match(serviceWorker, /NETWORK_FIRST_ASSETS/);
assert.match(serviceWorker, /staleWhileRevalidate/);
assert.match(serviceWorker, /WORD_BANK_BASE_URL/);
assert.match(serviceWorker, /event\.request\.method !== ['"]GET['"]/);
assert.doesNotMatch(
    app,
    /kanaRow\)\s*kanaRow\.style\.display\s*=\s*['"]flex['"]/,
    '读音行必须保留网格布局，不能压缩进度轨道'
);
assert.match(app, /classList\.toggle\('has-progress', Number\(percent\) > 0\)/);
assert.match(styles, /\.home-sub-progress-track > div\.has-progress\s*\{\s*min-width:\s*3px/);
assert.match(styles, /\.wb-card\.is-english-word\.is-word-long\s*\.wb-c-word/);
assert.match(index, /style\.css\?v=ui-density-v1/);
assert.match(index, /ui-system\.css\?v=ui-density-v1/);
assert.match(index, /M\+PLUS\+Rounded\+1c/);
assert.match(index, /family=Nunito/);
assert.match(uiStyles, /--font-title:/);
assert.match(uiStyles, /--font-body:/);
assert.match(uiStyles, /--font-number:/);
assert.match(uiStyles, /--secondary:\s*#345f8c/);
assert.match(uiStyles, /--tertiary:\s*#675585/);
assert.match(uiStyles, /prefers-reduced-motion:\s*reduce/);
assert.match(
    uiStyles,
    /#wb-grid \.wb-card\.is-english-word \.wb-c-word[\s\S]*?font-family:\s*var\(--font-word-en\)\s*!important/
);
assert.match(app, /const syncModalAccessibility = \(overlay, isOpen\) =>/);
assert.match(app, /overlay\.removeAttribute\('inert'\)/);
assert.match(app, /overlay\.setAttribute\('inert', ''\)/);
assert.match(app, /overlay\.setAttribute\('aria-hidden', 'true'\)/);
assert.match(app, /role',\s*Model\.state\.batchMode[\s\S]*?'checkbox'[\s\S]*?'group'/);
assert.match(app, /card\.setAttribute\([\s\S]*?'aria-checked'/);
assert.match(app, /grid\.addEventListener\('keydown'/);
assert.match(app, /<button type="button" class="wb-c-star btn-wb-star/);
assert.match(app, /<button type="button" class="wb-c-speaker btn-wb-speak/);
assert.match(index, /<button type="button" class="nav-item active"/);
assert.equal(
    (index.match(/class="nav-item(?: active)?"/g) || []).length,
    4,
    '非学习界面必须常驻四个底部导航入口'
);
assert.doesNotMatch(index, /id="prompt-visibility"/);
assert.doesNotMatch(app, /prompt-visibility/);
assert.doesNotMatch(styles, /prompt-visibility-btn/);
assert.doesNotMatch(index, /分阶段重复强化记忆|连续三轮检验掌握程度|自由翻看，不记录答题结果|正反方向交替检验记忆|先找出已认识的词/);
assert.doesNotMatch(index, /class="home-study-eyebrow"[\s\S]*?>开始学习</);
assert.doesNotMatch(
    index,
    /class="home-section-label"[\s\S]*?>(?:[\s\S]*?学习前筛选|[\s\S]*?选择学习方式)/
);
assert.match(
    index,
    /id="btn-start-filter-test"[\s\S]*?material-symbols-rounded">content_cut</
);
assert.match(index, /<strong>往复检验<\/strong>/);
assert.doesNotMatch(index, /道場|語彙|対話|設定|環境設定|全景語彙|AI対話|道场/);
assert.match(index, /<span class="nav-label">学习<\/span>/);
assert.match(index, /<span class="nav-label">词库<\/span>/);
assert.match(index, /<span class="nav-label">对话<\/span>/);
assert.match(index, /<span class="nav-label">设置<\/span>/);
assert.equal(
    (index.match(/class="kbd-hint home-shortcut-hint">[A-G]</g) || []).length,
    7,
    '首页 A-G 快捷键提示应使用横屏专属样式'
);
assert.match(uiStyles, /\.home-shortcut-hint\s*\{\s*display:\s*none\s*!important/);
assert.match(
    uiStyles,
    /@media \(orientation:\s*landscape\)[\s\S]*?\.home-shortcut-hint\s*\{[\s\S]*?display:\s*inline-flex\s*!important/
);
assert.doesNotMatch(styles, /content:\s*["']済["']/);
assert.match(styles, /@keyframes checkin-hold-shake/);
assert.match(styles, /\.btn-long-press\.pressing\s*\{[\s\S]*?animation:\s*checkin-hold-shake/);
assert.match(uiStyles, /#dt-star-btn\s*\{[\s\S]*?top:\s*auto\s*!important[\s\S]*?bottom:\s*14px\s*!important/);
assert.match(
    uiStyles,
    /\.speaker-icon,\s*\.star-btn\s*\{[\s\S]*?width:\s*48px/,
    '答题卡的发音与收藏按钮必须保持固定触控宽度'
);
assert.match(
    styles,
    /button:not\(\.glass-icon-btn\):not\(\.speaker-icon\):not\(\.star-btn\)/,
    '全局全宽按钮规则不能覆盖答题卡的图标按钮'
);
assert.match(
    uiStyles,
    /button:not\(\.glass-icon-btn\):not\(\.speaker-icon\):not\(\.star-btn\)/,
    'UI 系统的通用按钮皮肤不能覆盖答题卡的图标按钮'
);
assert.doesNotMatch(
    styles,
    /button:not\(\.glass-icon-btn\)(?!:not\(\.speaker-icon\):not\(\.star-btn\))/
);
assert.doesNotMatch(
    uiStyles,
    /button:not\(\.glass-icon-btn\)(?!:not\(\.speaker-icon\):not\(\.star-btn\))/
);
assert.equal(
    (app.match(/Controller\.registerInitExtension\(/g) || []).length,
    3,
    '附加功能应通过初始化扩展注册，不能反复覆盖 Controller.init'
);
assert.doesNotMatch(app, /Controller\.init\s*=\s*async function/);
assert.doesNotMatch(app, /getEl\(['"]mt-warning['"]\)/);
assert.doesNotMatch(app, /fsrs-rating-\$\{rating\}/);
assert.doesNotMatch(app, /study-feedback-mark/);
assert.doesNotMatch(styles, /study-feedback-mark|@keyframes study-stamp/);
assert.doesNotMatch(uiStyles, /study-feedback-mark/);
assert.doesNotMatch(
    app,
    /getEl\(['"](?:db-total-count|total-days|streak-days)['"]\)/
);
assert.match(uiStyles, /#detail-prev\s*\{\s*left:\s*-8px\s*!important/);
assert.match(uiStyles, /#detail-next\s*\{\s*right:\s*-8px\s*!important/);
assert.match(
    uiStyles,
    /@media \(max-width:\s*760px\), \(pointer:\s*coarse\)[\s\S]*?backdrop-filter:\s*none\s*!important/
);
assert.match(app, /const center =[\s\S]*?itemRect\.left - navRect\.left/);
assert.match(app, /--nav-indicator-top/);
assert.match(uiStyles, /top:\s*var\(--nav-indicator-top,\s*7px\)/);
assert.match(uiStyles, /\.settings-category-icon\s*\{[\s\S]*?width:\s*40px\s*!important/);
assert.match(uiStyles, /\.bottom-nav\s*\{[\s\S]*?min-height:\s*62px\s*!important/);
assert.match(
    uiStyles,
    /\.home-filter-card\.filter-test-btn-group,\s*\.home-mode-card\s*\{[\s\S]*?box-shadow:/
);
assert.match(
    uiStyles,
    /@media \(max-width:\s*600px\)[\s\S]*?\.home-mode-card\s*\{[\s\S]*?min-height:\s*70px\s*!important/
);
assert.match(app, /if \(didRender !== false\)\s*\{\s*decorateWordbankCards\(\)/);
assert.match(index, /id="root-review-overlay"[\s\S]*?aria-hidden="true" inert/);
assert.match(
    fs.readFileSync('root-review.js', 'utf8'),
    /root-review-overlay'\)\.setAttribute\('inert', ''\)/
);
assert.match(index, /notification-planner\.js\?v=smart-reminder-v1/);
assert.match(index, /core-utils\.js\?v=sse-buffer-v1/);
assert.match(index, /app\.js\?v=ui-density-v1/);
assert.match(index, /native-app\.js\?v=smart-reminder-v1/);
assert.ok(
    index.indexOf('notification-planner.js') < index.indexOf('native-app.js'),
    '提醒规划器必须先于原生提醒桥加载'
);
assert.match(index, /id="setting-study-reminder-mode"/);
assert.match(index, /id="setting-study-reminder-exact"/);
assert.match(index, /name="study-reminder-weekday"/);
assert.match(serviceWorker, /zhongri-shell-v30/);
assert.match(serviceWorker, /ZhongriWordbankAssets\.WORD_BANK_ASSETS/);
assert.match(serviceWorker, /core-utils\.js\?v=sse-buffer-v1/);
assert.match(serviceWorker, /app\.js\?v=ui-density-v1/);
assert.match(serviceWorker, /ui-system\.css\?v=ui-density-v1/);
assert.match(serviceWorker, /notification-planner\.js\?v=smart-reminder-v1/);
assert.match(
    index,
    /idb-keyval@6\.2\.2\/dist\/umd\.js[\s\S]*?integrity="sha384-[A-Za-z0-9+/=]+"/
);
assert.doesNotMatch(index, /idb-keyval@6\/dist\/umd\.js/);
assert.match(
    fs.readFileSync('scripts/adapt-android-dist.mjs', 'utf8'),
    /createHash\('sha384'\)[\s\S]*?digest\('base64'\)[\s\S]*?IDB_KEYVAL_SHA384/
);
assert.match(
    app,
    /fsrsCards:\s*rawData\.data\.fsrsCards[\s\S]*?fsrsReviewLogs:\s*Array\.isArray\(rawData\.data\.fsrsReviewLogs\)/
);
assert.match(index, /id="fsrs-reveal-answer"/);
assert.match(app, /fsrsAnswerRevealed:\s*false/);
assert.match(app, /word:\s*word\?\.lang === 'en' \? 'spelling' : 'kanji'/);
assert.match(app, /dtWordAppearanceMap\[item\.index\]\s*=\s*2/);
assert.match(index, /id="wb-result-count"/);
assert.match(app, /点击或按回车查看详细释义/);
assert.match(app, /folderNameElement\.textContent = folderName/);
assert.doesNotMatch(
    app,
    /<span class="folder-name">\$\{folderName\}<\/span>/
);
assert.match(app, /const readDeepSeekTextStream = async \(response, onText\) =>/);
assert.equal(
    (app.match(/response\.body\.getReader\(\)/g) || []).length,
    1,
    'AI 流式响应必须统一经过带跨分块缓冲的解析器'
);
assert.match(index, /id="action-toast"[\s\S]*?aria-hidden="true" inert/);
assert.match(app, /const setActionToastAccessibility = \(toast, actionBtn, isOpen\) =>/);
assert.match(app, /setActionToastAccessibility\(toast, actionBtn, false\)/);
assert.equal(logo.subarray(1, 4).toString('ascii'), 'PNG');
assert.equal(logo.readUInt32BE(16), 512);
assert.equal(logo.readUInt32BE(20), 512);
assert.ok(logo.length < 40 * 1024, 'PWA 图标应保持在 40KB 以内');

console.log('应用外壳安全检查通过');
