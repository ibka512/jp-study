'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const app = fs.readFileSync('app.js', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
const serviceWorker = fs.readFileSync('sw.js', 'utf8');
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
assert.match(index, /ai-capability-list/);
assert.doesNotMatch(index, /ai-capability-panel/);
assert.match(
    fs.readFileSync('style.css', 'utf8'),
    /\.settings-key-wrapper\s*\{\s*width:\s*100%/
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
assert.equal(logo.subarray(1, 4).toString('ascii'), 'PNG');
assert.equal(logo.readUInt32BE(16), 512);
assert.equal(logo.readUInt32BE(20), 512);
assert.ok(logo.length < 40 * 1024, 'PWA 图标应保持在 40KB 以内');

console.log('应用外壳安全检查通过');
