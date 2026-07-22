'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const app = fs.readFileSync('app.js', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
const serviceWorker = fs.readFileSync('sw.js', 'utf8');

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
assert.doesNotMatch(index, /mathjax@3\/es5\/tex-mml-chtml\.js/);
assert.match(app, /const loadMathJax = \(\) =>/);
assert.match(app, /document\.head\.appendChild\(script\)/);
assert.doesNotMatch(serviceWorker, /mathjax@3\/es5\/tex-mml-chtml\.js/);
assert.match(serviceWorker, /request\.mode === ['"]navigate['"]/);
assert.match(serviceWorker, /NETWORK_FIRST_ASSETS/);
assert.match(serviceWorker, /event\.request\.method !== ['"]GET['"]/);

console.log('应用外壳安全检查通过');
