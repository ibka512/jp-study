'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const index = read('index.html');
const app = read('app.js');
const serviceWorker = read('sw.js');
const wordbankAssets = read('wordbanks/assets.js');

const coreScriptPosition = index.indexOf(
    '<script src="rote-learning-core.js"></script>'
);
const appScriptPosition = index.indexOf('<script src="app.js"></script>');
const dailyCoreScriptPosition = index.indexOf(
    '<script src="daily-learning-core.js"></script>'
);
const dailyScriptPosition = index.indexOf(
    '<script src="daily-learning.js"></script>'
);

assert.ok(coreScriptPosition >= 0, '页面没有加载循环强记核心模块');
assert.ok(
    coreScriptPosition < appScriptPosition,
    '循环强记核心模块必须先于 app.js 加载'
);
assert.ok(dailyCoreScriptPosition >= 0, '页面没有加载每日学习核心模块');
assert.ok(dailyScriptPosition >= 0, '页面没有加载每日学习交互模块');
assert.ok(
    dailyCoreScriptPosition < appScriptPosition && appScriptPosition < dailyScriptPosition,
    '每日学习核心、app.js 和每日学习交互模块的顺序不正确'
);
assert.match(serviceWorker, /'\.\/rote-learning-core\.js'/);
assert.match(serviceWorker, /'\.\/daily-learning-core\.js'/);
assert.match(serviceWorker, /'\.\/daily-learning\.js'/);
assert.match(serviceWorker, /importScripts\('\.\/wordbanks\/assets\.js'\)/);
assert.match(serviceWorker, /\.\.\.WORD_BANK_ASSETS/);
assert.doesNotMatch(serviceWorker, /wordbank-builder\.html/);
assert.match(app, /renderRoteLearningUI\(wObj, displayMode\)/);
assert.match(app, /ROTE_CORE\.getGroupRange/);
assert.match(app, /ROTE_CORE\.buildInterleavedQueue/);
assert.match(app, /ROTE_CORE\.isFirstAppearance/);
assert.match(app, /const isEnglishSpelling = wObj\?\.lang === 'en'/);
assert.match(app, /\/\[a-zA-Z-\]\//);
assert.match(app, /isRedundantMetadataTag/);
assert.match(app, /\^JLPT/);

for (const id of [
    'btn-start-today',
    'btn-start-review',
    'daily-session-controls',
    'daily-detail-toggle',
    'daily-complete-overlay',
    'onboarding-overlay',
    'btn-toolbox-manual',
    'btn-toolbox-ai',
    'btn-toolbox-audit'
]) {
    assert.match(index, new RegExp(`id="${id}"`), `缺少每日学习界面：${id}`);
}

for (const asset of [
    'index.html',
    'manifest.json',
    'logo.png',
    'style.css',
    'data.js',
    'english-data.js',
    'rote-learning-core.js',
    'daily-learning-core.js',
    'app.js',
    'daily-learning.js'
]) {
    assert.ok(fs.existsSync(path.join(root, asset)), `缺少预缓存文件：${asset}`);
}

const chunkAssets = [...wordbankAssets.matchAll(/"(\.\/wordbanks\/(?:ja|en)-\d+\.js)"/g)]
    .map(match => match[1]);
assert.ok(chunkAssets.length >= 2, '词库分片清单为空');

for (const asset of chunkAssets) {
    const relative = asset.replace(/^\.\//, '');
    assert.ok(fs.existsSync(path.join(root, relative)), `缺少词库分片：${relative}`);
    assert.match(index, new RegExp(`<script src="${relative.replace('.', '\\.')}"></script>`));
}
assert.match(index, /<script src="wordbanks\/finalize\.js"><\/script>/);

console.log('循环强记集成检查通过');
