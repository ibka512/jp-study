'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
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
                    return (k, v) => { target[k] = String(v); };
                }
                if (prop === 'removeProperty') {
                    return (k) => { delete target[k]; };
                }
                return target[prop] ?? '';
            },
            set(target, prop, value) {
                target[prop] = String(value);
                return true;
            }
        }),
        classList: {
            add: (...names) => names.forEach(n => classes.add(n)),
            remove: (...names) => names.forEach(n => classes.delete(n)),
            contains: (n) => classes.has(n),
            toggle: (n, force) => {
                if (force === undefined) {
                    if (classes.has(n)) classes.delete(n); else classes.add(n);
                } else if (force) {
                    classes.add(n);
                } else {
                    classes.delete(n);
                }
            }
        },
        setAttribute: (k, v) => attrs.set(k, String(v)),
        getAttribute: (k) => attrs.get(k) ?? null,
        removeAttribute: (k) => attrs.delete(k),
        toggleAttribute: (k, force) => {
            if (force) attrs.set(k, ''); else attrs.delete(k);
        },
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

    context.document.getElementById = (id) => elements.get(id) ?? null;
    context.document.querySelector = (sel) => {
        if (sel === '#detail-card-container .watermark-layer') return watermarkLayer;
        return null;
    };
    return elements;
}

test('删除某词唯一例句后，切到其他词仍正常显示例句，且撤销立即刷新详情弹窗', async () => {
    const storage = createStorage();
    const { Model, View, Controller, context } = loadApp(storage);
    const elements = attachDetailDom(context);
    View.updateWordbankUI = () => {};
    View.resetWordbankRenderer = () => {};
    await Model.init();

    const wordsWithExamples = Model.db.filter(
        w => (w.lang || 'ja') === 'ja' && String(w.example || '').trim().length > 0
    );
    assert.ok(wordsWithExamples.length >= 2, '测试需要至少两个带例句的词条');

    const wordA = wordsWithExamples[0];
    const wordB = wordsWithExamples[1];
    const idxA = Model.db.indexOf(wordA);
    const idxB = Model.db.indexOf(wordB);

    wordA.example = '今日はいい天気です / 今天天气很好';
    const originalExampleA = wordA.example;
    const originalExampleB = wordB.example;

    Model.state.detailArray = [idxA, idxB];
    Model.state.activeDetailIdx = 0;

    elements.get('detail-overlay').classList.add('active');
    Controller.updateDetailContent(wordA, false);

    const exBox = View.getEl('dt-example-box');
    assert.equal(exBox.style.display, '', '初始有例句时例句容器应可见');
    assert.match(exBox.innerHTML, /今天天气很好/);

    // 1. 删除词 A 的唯一例句
    await Controller.deleteExample(wordA, 0);
    assert.equal(wordA.example, '', '词 A 唯一例句删除后应为空');
    assert.equal(exBox.style.display, 'none', '无例句时应隐藏例句容器');
    assert.equal(Model.recycleBin.length, 1, '删除的例句应进入回收站');

    // 2. 切到词 B，验证例句容器必须恢复可见，不能被词 A 的 display:none 永久污染
    Model.state.activeDetailIdx = 1;
    Controller.updateDetailContent(wordB, false);
    assert.equal(exBox.style.display, '', '切换到有例句的其他词时必须清除 display:none');
    assert.ok(exBox.innerHTML.trim().length > 0, '词 B 的例句内容应正常渲染');
    assert.equal(wordB.example, originalExampleB);

    // 3. 切回词 A 并执行撤销，验证数据与当前打开的详情弹窗同步恢复
    Model.state.activeDetailIdx = 0;
    Controller.updateDetailContent(wordA, false);
    assert.equal(exBox.style.display, 'none');

    const trashId = Model.recycleBin[0].id;
    await Controller.restoreTrashBatch([trashId]);

    assert.equal(wordA.example, originalExampleA, '撤销后词 A 的例句数据应恢复');
    assert.equal(Model.recycleBin.length, 0, '撤销后回收站中该记录应移除');
    assert.equal(exBox.style.display, '', '撤销后打开中的详情弹窗例句容器应立即恢复可见');
    assert.match(exBox.innerHTML, /今天天气很好/, '撤销后详情弹窗应立即重新渲染被恢复的例句');
});

test('旧格式双竖线分隔的单条英语例句删除与撤销保持原子一致', async () => {
    const storage = createStorage();
    const { Model, View, Controller, context } = loadApp(storage);
    attachDetailDom(context);
    View.updateWordbankUI = () => {};
    View.resetWordbankRenderer = () => {};
    await Model.init();

    const word = Model.db[0];
    word.lang = 'en';
    word.example = 'Time flies quickly || 时光飞逝';

    await Controller.deleteExample(word, 0);
    assert.equal(word.example, '', '双竖线单条例句应整条删除，不残留孤立中文翻译');
    assert.equal(Model.recycleBin.length, 1);

    await Controller.restoreTrashBatch([Model.recycleBin[0].id]);
    assert.equal(word.example, 'Time flies quickly / 时光飞逝', '撤销后应恢复完整例句');
});
