'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadWords(file, variable) {
    const context = {};
    vm.createContext(context);
    const language = variable === 'DefaultWords' ? 'ja' : 'en';
    const chunks = fs.readdirSync('wordbanks')
        .filter(name => name.startsWith(`${language}-`) && name.endsWith('.js'))
        .sort()
        .map(name => fs.readFileSync(`wordbanks/${name}`, 'utf8'))
        .join('\n');
    vm.runInContext(
        fs.readFileSync(file, 'utf8') + chunks +
            fs.readFileSync('wordbanks/finalize.js', 'utf8') +
            `;globalThis.__words=${variable}`,
        context
    );
    return context.__words;
}

const japanese = loadWords('data.js', 'DefaultWords');
const english = loadWords('english-data.js', 'DefaultEnglishWords');

const minimumCounts = {
    ja: { N5: 400, N4: 450, N3: 1400, N2: 1200, N1: 2200 },
    en: { 'CET-4': 2500, 'CET-6': 1200 }
};

for (const [language, words] of [['ja', japanese], ['en', english]]) {
    const ids = new Set();
    const counts = {};

    for (const word of words) {
        assert.ok(word._id, `${language} 词条缺少 ID`);
        assert.ok(!ids.has(word._id), `${language} 出现重复 ID：${word._id}`);
        ids.add(word._id);
        assert.ok(String(word.word || '').trim(), `${language} 词条缺少单词`);
        assert.ok(String(word.meaning || '').trim(), `${word.word} 缺少释义`);
        assert.ok(String(word.type || '').trim(), `${word.word} 缺少词性`);
        assert.equal(word.lang, language, `${word.word} 的语言标记错误`);
        assert.equal(word.builtIn, true, `${word.word} 不是内置词`);

        if (language === 'ja') {
            assert.ok(String(word.kana || '').trim(), `${word.word} 缺少假名`);
        } else {
            assert.ok(String(word.phonetic || '').trim(), `${word.word} 缺少音标`);
        }

        counts[word.level] = (counts[word.level] || 0) + 1;
    }

    for (const [level, minimum] of Object.entries(minimumCounts[language])) {
        assert.ok(
            (counts[level] || 0) >= minimum,
            `${level} 数量不足：${counts[level] || 0} < ${minimum}`
        );
    }
}

console.log(`正式词库校验通过：日语 ${japanese.length}，英语 ${english.length}`);
