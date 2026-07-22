'use strict';

const assert = require('node:assert/strict');
const manifest = require('../wordbanks/assets.js');
const loader = require('../wordbank-loader.js');

assert.equal(Object.isFrozen(loader), true, '加载器 API 应保持只读');
assert.equal(loader.normalizeLanguage('en'), 'en');
assert.equal(loader.normalizeLanguage('ja'), 'ja');
assert.equal(loader.normalizeLanguage('unexpected'), 'ja');

for (const language of ['ja', 'en']) {
    const assets = loader.getAssets(language);
    assert.ok(assets.length >= 2, `${language} 词库资源清单不完整`);
    assert.equal(
        assets.at(-1),
        manifest.WORD_BANK_FINALIZER,
        `${language} 词库缺少统一收尾脚本`
    );
    assert.deepEqual(
        assets.slice(0, -1),
        manifest.WORD_BANK_LANG_ASSETS[language],
        `${language} 词库加载顺序应与分片清单一致`
    );
}

loader.markLoaded('en');
assert.equal(loader.isLoaded('en'), true);
assert.equal(loader.isLoaded('ja'), false);

console.log('按语言词库加载器检查通过');
