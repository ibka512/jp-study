'use strict';

/**
 * 专升本词书范围与多考纲标签。
 *
 * 词库里同一个词只保留一条记录，另一个考纲记在 tags 里（如 CET-4 的 ability
 * 同时带「专升本」标签）。这些测试锁定两件事：词书范围要按「级别或标签」判定，
 * 界面要能把共享词的两个考纲都显示出来。
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createStorage, loadApp } = require('./helpers/app-runtime');

function makeStubElement(id = '') {
    const classes = new Set();
    const attrs = new Map();
    const styleProps = {};
    return {
        id,
        innerHTML: '',
        innerText: '',
        textContent: '',
        lang: '',
        hidden: false,
        disabled: false,
        dataset: {},
        style: new Proxy(styleProps, {
            get(target, prop) {
                if (prop === 'setProperty') {
                    return (key, value) => { target[key] = String(value); };
                }
                if (prop === 'removeProperty') {
                    return (key) => { delete target[key]; };
                }
                return target[prop] ?? '';
            },
            set(target, prop, value) {
                target[prop] = String(value);
                return true;
            }
        }),
        classList: {
            add: (...names) => names.forEach(name => classes.add(name)),
            remove: (...names) => names.forEach(name => classes.delete(name)),
            contains: name => classes.has(name),
            toggle: (name, force) => {
                if (force === undefined) {
                    if (classes.has(name)) classes.delete(name); else classes.add(name);
                } else if (force) {
                    classes.add(name);
                } else {
                    classes.delete(name);
                }
            }
        },
        setAttribute: (key, value) => attrs.set(key, String(value)),
        getAttribute: key => attrs.get(key) ?? null,
        removeAttribute: key => attrs.delete(key),
        toggleAttribute: (key, force) => { if (force) attrs.set(key, ''); else attrs.delete(key); },
        querySelector: () => null,
        querySelectorAll: () => [],
        appendChild() {},
        addEventListener() {}
    };
}

function attachDetailDom(context) {
    const elements = new Map();
    const ids = [
        'detail-overlay', 'detail-card-container', 'dt-watermark', 'dt-word',
        'dt-kana', 'dt-type', 'dt-roots', 'dt-mean', 'dt-example-box',
        'dt-meta', 'dt-hanko-badge', 'dt-star-btn', 'dt-star-icon',
        'dt-wrong-summary', 'toast', 'action-toast', 'action-toast-message',
        'action-toast-action', 'recycle-bin-list', 'recycle-bin-empty',
        'recycle-bin-count', 'btn-clear-recycle-bin'
    ];
    for (const id of ids) elements.set(id, makeStubElement(id));
    const watermarkLayer = makeStubElement('watermark-layer');
    context.document.getElementById = id => elements.get(id) ?? null;
    context.document.querySelector = selector => {
        if (selector === '#detail-card-container .watermark-layer') return watermarkLayer;
        return null;
    };
    return elements;
}

function loadEnglish() {
    const storage = createStorage();
    const app = loadApp(storage);
    return app;
}

test('考试词书范围按「级别或标签」判定，共享词同时属于两个考纲', async () => {
    const { Model } = loadEnglish();
    await Model.ensureBuiltInLanguage('en');
    const english = Model.db.filter(word => (word.lang || 'ja') === 'en');

    const levelOnly = english.filter(word => word.level === '专升本').length;
    const scoped = english.filter(word => Model.checkFilter(word, '专升本词汇'));
    assert.ok(
        scoped.length > levelOnly,
        `专升本词书应包含共享词：${scoped.length} 不应只是 ${levelOnly}`
    );

    // 独立计算期望值，避免把实现写死进断言
    const expected = english.filter(word => (
        word.folder === '专升本词汇' ||
        word.level === '专升本' ||
        (Array.isArray(word.tags) && word.tags.includes('专升本'))
    ));
    assert.equal(scoped.length, expected.length);

    const ability = english.find(word => word.word === 'ability');
    assert.ok(ability, '测试数据应包含 ability');
    assert.equal(ability.level, 'CET-4');
    assert.ok(ability.tags.includes('专升本'));
    assert.ok(Model.checkFilter(ability, '专升本词汇'), 'ability 应属于专升本词书');
    assert.ok(Model.checkFilter(ability, '四级词汇'), 'ability 仍应属于四级词书');

    // 不属于该考纲的词不应被带进来
    const japanese = Model.db.filter(word => (word.lang || 'ja') === 'ja');
    assert.equal(
        japanese.filter(word => Model.checkFilter(word, '专升本词汇')).length,
        0,
        '日语词条不应出现在专升本词书里'
    );
});

test('共享词的详情元信息同时显示两个考试级别', async () => {
    const { Model, View, Controller, context } = loadEnglish();
    const elements = attachDetailDom(context);
    View.updateWordbankUI = () => {};
    View.resetWordbankRenderer = () => {};
    await Model.init();
    await Model.ensureBuiltInLanguage('en');

    const ability = Model.db.find(word => word.word === 'ability' && (word.lang || 'ja') === 'en');
    assert.ok(ability);

    Model.state.detailArray = [Model.db.indexOf(ability)];
    Model.state.activeDetailIdx = 0;
    elements.get('detail-overlay').classList.add('active');
    Controller.updateDetailContent(ability, false);

    const metaHtml = View.getEl('dt-meta').innerHTML;
    assert.ok(metaHtml.includes('CET-4'), '应显示主级别 CET-4');
    assert.ok(metaHtml.includes('专升本'), '应显示共享的专升本考纲');
    assert.ok(metaHtml.includes('is-level-alt'), '次要级别应带 is-level-alt 标记');
});

test('专升本补词与脏词头修正', async () => {
    const { Model } = loadEnglish();
    await Model.ensureBuiltInLanguage('en');
    const english = Model.db.filter(word => (word.lang || 'ja') === 'en');
    const byWord = new Map(english.map(word => [String(word.word).toLowerCase(), word]));

    for (const word of ['fair', 'keep', 'shout', 'walk', 'wall', 'disadvantage', 'slow down', 'a lot of', 'on the other hand']) {
        const entry = byWord.get(word);
        assert.ok(entry, `缺少补录词条：${word}`);
        assert.equal(entry.folder, '专升本词汇', `${word} 应属于专升本词汇`);
        assert.equal(entry.level, '专升本', `${word} 级别应为专升本`);
        assert.match(String(entry.example || ''), / \/ /, `${word} 应带双语例句`);
        if (entry.type !== '短语' && !String(entry.word).includes(' ')) {
            assert.ok(String(entry.phonetic || '').trim(), `${word} 应带音标`);
        }
    }

    for (const dirty of ['justice n .', 'rush v .', 'by far ….', 'justice n.', 'rush v.']) {
        assert.equal(byWord.has(dirty), false, `脏词头仍在词库里：${dirty}`);
    }
    assert.ok(byWord.has('justice'));
    assert.ok(byWord.has('rush'));
    assert.ok(byWord.has('by far'));
});
