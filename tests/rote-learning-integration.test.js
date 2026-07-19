'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const index = read('index.html');
const app = read('app.js');
const serviceWorker = read('sw.js');

const coreScriptPosition = index.indexOf(
    '<script src="rote-learning-core.js"></script>'
);
const appScriptPosition = index.indexOf('<script src="app.js"></script>');

assert.ok(coreScriptPosition >= 0, '页面没有加载循环强记核心模块');
assert.ok(
    coreScriptPosition < appScriptPosition,
    '循环强记核心模块必须先于 app.js 加载'
);
assert.match(serviceWorker, /'\.\/rote-learning-core\.js'/);
assert.doesNotMatch(serviceWorker, /wordbank-builder\.html/);
assert.match(app, /renderRoteLearningUI\(wObj, displayMode\)/);
assert.match(app, /ROTE_CORE\.getGroupRange/);
assert.match(app, /ROTE_CORE\.buildInterleavedQueue/);
assert.match(app, /ROTE_CORE\.isFirstAppearance/);
assert.match(app, /const isEnglishSpelling = wObj\?\.lang === 'en'/);
assert.match(app, /\/\[a-zA-Z-\]\//);

for (const asset of [
    'index.html',
    'manifest.json',
    'logo.png',
    'style.css',
    'data.js',
    'english-data.js',
    'rote-learning-core.js',
    'app.js'
]) {
    assert.ok(fs.existsSync(path.join(root, asset)), `缺少预缓存文件：${asset}`);
}

console.log('循环强记集成检查通过');
