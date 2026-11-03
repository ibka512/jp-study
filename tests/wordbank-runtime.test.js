'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');

test('首页按当前语言启动，切换语言可加载且重复请求不会增加词条', async () => {
    for (const initialLanguage of ['ja', 'en']) {
        const context = vm.createContext({
            localStorage: { getItem: () => initialLanguage },
            document: {
                write(html) {
                    for (const match of html.matchAll(/<script src="([^"]+)"/g)) run(match[1]);
                },
                querySelector: () => null,
                createElement() {
                    const listeners = {};
                    return { dataset: {}, addEventListener(type, fn) { listeners[type] = fn; }, listeners };
                },
                head: { appendChild(script) { run(script.src); script.listeners.load(); } }
            }
        });
        context.window = context;
        const run = file => vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
        const html = fs.readFileSync('index.html', 'utf8');
        // Use the real HTML script sequence, stopping before application UI startup.
        let started = false;
        for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
            const source = match[1].match(/src="([^"]+)"/)?.[1];
            if (source === 'data.js') started = true;
            if (!started) continue;
            if (source?.startsWith('app.js')) break;
            if (source && /^(?:data\.js|english-data\.js|wordbank-loader\.js|wordbanks\/)/.test(source)) run(source);
            else if (!source) vm.runInContext(match[2], context);
        }
        const count = language => vm.runInContext(language === 'en' ? 'DefaultEnglishWords.length' : 'DefaultWords.length', context);
        const otherLanguage = initialLanguage === 'ja' ? 'en' : 'ja';
        assert.ok(count(initialLanguage) > 0, `${initialLanguage} 初始词库不能为空`);
        assert.equal(count(otherLanguage), 0, '另一种语言应保持延迟加载');
        const loader = context.ZhongriWordbankLoader;
        await loader.loadLanguage(otherLanguage);
        const before = count(otherLanguage);
        assert.ok(before > 0, '切换后必须真正加载词条');
        await loader.loadLanguage(otherLanguage);
        assert.equal(count(otherLanguage), before);
        assert.equal(typeof context.ZhongriFinalizeWordbanks, 'function');
        const words = vm.runInContext('[...DefaultWords, ...DefaultEnglishWords]', context);
        assert.equal(new Set(words.map(word => word._id)).size, words.length);
    }
});
