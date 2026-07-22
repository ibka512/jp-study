'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const index = read('index.html');
const app = read('app.js');
const style = read('style.css');
const serviceWorker = read('sw.js');
const wordbankAssets = read('wordbanks/assets.js');

const coreUtilsPosition = index.indexOf(
    '<script src="core-utils.js"></script>'
);
const coreScriptPosition = index.indexOf(
    '<script src="rote-learning-core.js"></script>'
);
const appScriptPosition = index.indexOf('<script src="app.js"></script>');

assert.ok(coreUtilsPosition >= 0, '页面没有加载公共工具模块');
assert.ok(
    coreUtilsPosition < appScriptPosition,
    '公共工具模块必须先于 app.js 加载'
);
assert.ok(coreScriptPosition >= 0, '页面没有加载循环强记核心模块');
assert.ok(
    coreScriptPosition < appScriptPosition,
    '循环强记核心模块必须先于 app.js 加载'
);
assert.match(serviceWorker, /'\.\/rote-learning-core\.js'/);
assert.match(serviceWorker, /'\.\/core-utils\.js'/);
assert.match(serviceWorker, /importScripts\('\.\/wordbanks\/assets\.js'\)/);
assert.match(serviceWorker, /\.\.\.WORD_BANK_ASSETS/);
assert.doesNotMatch(serviceWorker, /wordbank-builder\.html/);
assert.match(app, /renderRoteLearningUI\(wObj, displayMode\)/);
assert.match(app, /ROTE_CORE\.getGroupRange/);
assert.match(app, /ROTE_CORE\.buildInterleavedQueue/);
assert.match(app, /ROTE_CORE\.isFirstAppearance/);
assert.match(app, /const isEnglishSpelling = wObj\?\.lang === 'en'/);
assert.match(app, /\/\[a-zA-Z-\]\//);

const metadataTagHelper = app.match(
    /const isRedundantWordMetadataTag = \([\s\S]*?\n};/
);
assert.ok(metadataTagHelper, '缺少卡片元数据标签去重逻辑');

const metadataTagContext = {
    normalizeEntryText: value => String(value || '').trim(),
    normalizeWordLevel: (value, lang) => {
        const normalized = String(value || '').toUpperCase();
        return lang === 'en'
            ? (/^CET-?[46]$/.test(normalized) ? normalized.replace(/^CET([46])$/, 'CET-$1') : '')
            : (/^(?:JLPT[-_]?)?N[1-5]$/.test(normalized) ? normalized.replace(/^JLPT[-_]?/, '') : '');
    },
    normalizeWordFrequency: value => /^(?:高频|中频|低频)$/.test(value) ? value : '',
    DIFFICULTY_LABELS: {
        0: '难度未定', 1: '入门', 2: '较易', 3: '中等', 4: '较难', 5: '困难'
    }
};
vm.createContext(metadataTagContext);
vm.runInContext(
    `${metadataTagHelper[0]}; globalThis.isRedundant = isRedundantWordMetadataTag;`,
    metadataTagContext
);

for (const [tag, lang] of [
    ['N4', 'ja'], ['JLPT', 'ja'], ['CET-4', 'en'],
    ['大学英语', 'en'], ['高频', 'ja'], ['难度未定', 'ja']
]) {
    assert.equal(metadataTagContext.isRedundant(tag, lang), true, `未过滤重复标签：${tag}`);
}
assert.equal(metadataTagContext.isRedundant('片假名词', 'ja'), false);
assert.equal(metadataTagContext.isRedundant('口语', 'ja'), false);
assert.equal(
    (app.match(/filter\(tag => !isRedundantWordMetadataTag\(tag, lang\)\)/g) || []).length,
    2,
    '普通标签和特殊标签都应经过元数据去重'
);

for (const source of [index, app, style]) {
    assert.doesNotMatch(source, /jlpt-test-package/i);
    assert.doesNotMatch(source, /词库压力测试/);
    assert.doesNotMatch(source, /testBundleId|isTestWord/);
}

for (const id of [
    'btn-import',
    'btn-run-library-audit',
    'btn-export-backup',
    'recycle-bin-list'
]) {
    assert.match(index, new RegExp(`id="${id}"`), `误删正式功能：${id}`);
}
assert.match(app, /runVocabularyAudit/);
assert.match(app, /storePreImportRestorePoint/);

for (const asset of [
    'index.html',
    'manifest.json',
    'logo.png',
    'style.css',
    'data.js',
    'english-data.js',
    'core-utils.js',
    'rote-learning-core.js',
    'app.js'
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
