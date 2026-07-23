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
assert.match(app, /const loadMathJax = \(\) =>/);
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
assert.match(index, /style\.css\?v=smart-reminder-v1/);
assert.match(index, /ui-system\.css\?v=ui-system-v4/);
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
assert.match(index, /id="root-review-overlay"[\s\S]*?aria-hidden="true" inert/);
assert.match(
    fs.readFileSync('root-review.js', 'utf8'),
    /root-review-overlay'\)\.setAttribute\('inert', ''\)/
);
assert.match(index, /notification-planner\.js\?v=smart-reminder-v1/);
assert.match(index, /app\.js\?v=wcag-acceptance-v2/);
assert.match(index, /native-app\.js\?v=smart-reminder-v1/);
assert.ok(
    index.indexOf('notification-planner.js') < index.indexOf('native-app.js'),
    '提醒规划器必须先于原生提醒桥加载'
);
assert.match(index, /id="setting-study-reminder-mode"/);
assert.match(index, /id="setting-study-reminder-exact"/);
assert.match(index, /name="study-reminder-weekday"/);
assert.match(serviceWorker, /zhongri-shell-v26/);
assert.match(serviceWorker, /app\.js\?v=wcag-acceptance-v2/);
assert.match(serviceWorker, /ui-system\.css\?v=ui-system-v4/);
assert.match(serviceWorker, /notification-planner\.js\?v=smart-reminder-v1/);
assert.match(index, /id="action-toast"[\s\S]*?aria-hidden="true" inert/);
assert.match(app, /const setActionToastAccessibility = \(toast, actionBtn, isOpen\) =>/);
assert.match(app, /setActionToastAccessibility\(toast, actionBtn, false\)/);
assert.equal(logo.subarray(1, 4).toString('ascii'), 'PNG');
assert.equal(logo.readUInt32BE(16), 512);
assert.equal(logo.readUInt32BE(20), 512);
assert.ok(logo.length < 40 * 1024, 'PWA 图标应保持在 40KB 以内');

console.log('应用外壳安全检查通过');
