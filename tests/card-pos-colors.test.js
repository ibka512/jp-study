'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers/app-runtime');

test('单词性按 8 大词性输出独立和纸矿物色与单色顶条', () => {
    const { View } = loadApp();

    const cases = [
        ['名词', 'ja', 'noun'],
        ['五段动词自', 'ja', 'verb'],
        ['形容词', 'ja', 'adj'],
        ['形容动词', 'ja', 'adj-na'],
        ['副词', 'ja', 'adv'],
        ['代词', 'ja', 'pronoun'],
        ['介词', 'en', 'func'],
        ['连词', 'en', 'func'],
        ['感叹词', 'ja', 'other']
    ];

    for (const [typeStr, lang, expectedCat] of cases) {
        const v = View.getCardVisuals(typeStr, lang);
        assert.deepEqual(Array.from(v.cats), [expectedCat], `${typeStr} 应映射为 ${expectedCat}`);
        assert.equal(v.isMulti, false);
        assert.equal(v.bg, `var(--pos-${expectedCat}-bg)`);
        assert.equal(
            v.strip,
            `linear-gradient(90deg, var(--pos-${expectedCat}-accent), var(--pos-${expectedCat}-accent))`
        );
    }
});

test('双词性与三词性生成斜切拼色卡面与分段顶条，并兼容多种分隔符', () => {
    const { View } = loadApp();

    // 2-POS Japanese: 名・形动
    const jaTwo = View.getCardVisuals('名・形动', 'ja');
    assert.equal(jaTwo.isMulti, true);
    assert.deepEqual(Array.from(jaTwo.cats), ['noun', 'adj-na']);
    assert.match(jaTwo.bg, /^linear-gradient\(132deg, var\(--pos-noun-bg\) 0%, var\(--pos-noun-bg\) 49\.2%, var\(--pos-adj-na-bg\) 50\.8%, var\(--pos-adj-na-bg\) 100%\)$/);
    assert.equal(jaTwo.strip, 'linear-gradient(90deg, var(--pos-noun-accent) 0% 50%, var(--pos-adj-na-accent) 50% 100%)');

    // 3-POS English: 名词・形容词・动词
    const enThree = View.getCardVisuals('名词・形容词・动词', 'en');
    assert.equal(enThree.isMulti, true);
    assert.deepEqual(Array.from(enThree.cats), ['noun', 'adj', 'verb']);
    assert.match(enThree.bg, /^linear-gradient\(132deg,/);
    assert.ok(enThree.bg.includes('var(--pos-noun-bg)'));
    assert.ok(enThree.bg.includes('var(--pos-adj-bg)'));
    assert.ok(enThree.bg.includes('var(--pos-verb-bg)'));
    assert.equal(
        enThree.strip,
        'linear-gradient(90deg, var(--pos-noun-accent) 0% 33.33%, var(--pos-adj-accent) 33.33% 66.67%, var(--pos-verb-accent) 66.67% 100%)'
    );

    // Alternative separators (slash / Chinese comma)
    const slashSplit = View.getCardVisuals('名/动', 'ja');
    assert.equal(slashSplit.isMulti, true);
    assert.deepEqual(Array.from(slashSplit.cats), ['noun', 'verb']);

    // Empty type falls back cleanly without breaking background-image
    const empty = View.getCardVisuals('', 'ja');
    assert.equal(empty.isMulti, false);
    assert.match(empty.strip, /^linear-gradient\(90deg,/);
});
