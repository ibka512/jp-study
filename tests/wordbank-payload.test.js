'use strict';

/**
 * 词库载荷检查。
 *
 * 词库文件只应保存逐条不同的字段：语言、内置标记、默认难度这些由
 * wordbanks/finalize.js 在收尾阶段补出来。曾经每条词都内嵌一份完全相同的
 * 来源信息，让词库白白大了三分之一。这个测试用来防止再退回去。
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const BANK_DIR = path.join(__dirname, '..', 'wordbanks');

/** 由 finalize.js 补出来的字段，不应出现在词条里 */
const DERIVED_FIELDS = ['builtIn', 'lang'];

/** 全库一致的来源信息，已提到文件头注释 */
const HOISTED_FIELDS = ['sourceName', 'sourceVersion', 'sourceLevels', 'dataVersion'];

const chunks = fs.readdirSync(BANK_DIR).filter(name => /^(ja|en)-\d+\.js$/.test(name)).sort();

assert.ok(chunks.length > 0, '未找到词库分片');

const totals = { ja: 0, en: 0 };
const offenders = [];

for (const name of chunks) {
    const source = fs.readFileSync(path.join(BANK_DIR, name), 'utf8');
    // 先去掉文件头注释：来源信息里的 sourceLevels 自带方括号，会干扰数组定位
    const body = source.replace(/^\s*\/\*\*[\s\S]*?\*\/\s*/, '');
    const words = JSON.parse(body.slice(body.indexOf('['), body.lastIndexOf(']') + 1));

    totals[name.slice(0, 2)] += zlib.gzipSync(Buffer.from(source), { level: 9 }).length;

    for (const word of words) {
        for (const field of [...DERIVED_FIELDS, ...HOISTED_FIELDS]) {
            if (field in word) offenders.push(`${name} ${word.word || word._id} 含冗余字段 ${field}`);
        }
        if (word.difficulty === 0) offenders.push(`${name} ${word.word} 含默认值 difficulty`);
        if (Array.isArray(word.tags) && word.tags.length === 0) {
            offenders.push(`${name} ${word.word} 含空 tags`);
        }
    }
}

assert.deepEqual(offenders.slice(0, 10), [], `词库仍有冗余字段，请运行 node scripts/slim-wordbanks.mjs：\n${offenders.slice(0, 10).join('\n')}`);

// 体积护栏：给后续扩充词库留出空间，但阻止悄悄涨回去
const BUDGET_KB = { ja: 510, en: 450 };
for (const [language, bytes] of Object.entries(totals)) {
    const kb = bytes / 1024;
    assert.ok(
        kb < BUDGET_KB[language],
        `${language} 词库 gzip 后 ${kb.toFixed(0)} KB，超出预算 ${BUDGET_KB[language]} KB`
    );
}

console.log(
    `词库载荷检查通过：分片 ${chunks.length} 个，` +
    `日语 ${(totals.ja / 1024).toFixed(0)} KB，英语 ${(totals.en / 1024).toFixed(0)} KB（gzip）`
);
