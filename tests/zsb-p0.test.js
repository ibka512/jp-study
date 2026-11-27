'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { loadApp } = require('./helpers/app-runtime');

function loadZsbHelpers() {
    const app = loadApp();
    const helpers = vm.runInContext(
        '({ EnglishInput, normalizeEnglishSpellText, getEnglishPhraseMeta, WORD_LEVEL_OPTIONS, normalizeWordLevel, validateVocabularyData, normalizeWordType })',
        app.context
    );
    return { ...app, ...helpers };
}

test('P0-1: EnglishInput 支持多词短语空格、撇号与防连续空格，且校验忽略大小写与多余空白', () => {
    const { EnglishInput, normalizeEnglishSpellText, getEnglishPhraseMeta } = loadZsbHelpers();

    EnglishInput.reset();
    // 忽略开头空格
    EnglishInput.input(' ');
    assert.equal(EnglishInput.getDisplayText(), '');

    // 输入 "in order to"（包含重复空格测试）
    for (const ch of 'In  order   to') {
        EnglishInput.input(ch);
    }
    assert.equal(EnglishInput.getDisplayText(), 'in order to');
    assert.equal(EnglishInput.getFinalText(), 'in order to');

    // 支持撇号与弯引号（如 one's own）
    EnglishInput.reset();
    for (const ch of "One’s own") {
        EnglishInput.input(ch);
    }
    assert.equal(EnglishInput.getDisplayText(), "one's own");
    assert.equal(
        normalizeEnglishSpellText("  ONE'S   OWN "),
        EnglishInput.getFinalText()
    );

    // 退格与 Space 键名
    EnglishInput.input('Backspace');
    assert.equal(EnglishInput.getDisplayText(), "one's ow");
    EnglishInput.input('n');
    EnglishInput.input('Space');
    EnglishInput.input('Space');
    assert.equal(EnglishInput.getDisplayText(), "one's own ");
    assert.equal(EnglishInput.getFinalText(), "one's own");

    // 短语元数据提示
    const phraseMeta = getEnglishPhraseMeta('take care of');
    assert.equal(phraseMeta.isMultiWord, true);
    assert.equal(phraseMeta.wordCount, 3);
    assert.deepEqual(Array.from(phraseMeta.letterCounts), [4, 4, 2]);
    assert.equal(getEnglishPhraseMeta('ability').isMultiWord, false);
});

test('P0-2: 英语级别枚举包含「专升本」，支持别名归一化且通过词库校验', () => {
    const { WORD_LEVEL_OPTIONS, normalizeWordLevel, validateVocabularyData } = loadZsbHelpers();

    assert.ok(WORD_LEVEL_OPTIONS.en.includes('专升本'), 'WORD_LEVEL_OPTIONS.en 应包含 专升本');
    assert.equal(normalizeWordLevel('专升本', 'en'), '专升本');
    assert.equal(normalizeWordLevel('ZSB', 'en'), '专升本');
    assert.equal(normalizeWordLevel('zsb-en', 'en'), '专升本');
    assert.equal(normalizeWordLevel('专升本英语', 'en'), '专升本');
    assert.equal(normalizeWordLevel('英语专升本', 'en'), '专升本');
    assert.equal(normalizeWordLevel('专升本', 'ja'), '');

    const report = validateVocabularyData([
        {
            _id: 'en-zsb-001',
            lang: 'en',
            word: 'in order to',
            type: '短语',
            meaning: '为了',
            phonetic: '',
            folder: '专升本词汇',
            level: '专升本',
            difficulty: 2,
            builtIn: false
        }
    ]);
    assert.equal(report.errors.length, 0, '专升本词条不应触发校验错误');
});

test('P0-3: 应用内批量导入解析器兼容 Markdown 词汇清单、不规则动词变位与传统 CSV/TSV', () => {
    const { Controller } = loadZsbHelpers();

    const mdSample = [
        '---',
        'title: 专升本英语考纲词汇 · 背诵清单',
        'tags: [专升本, 英语, 词汇]',
        '---',
        '',
        '# 专升本英语考纲词汇',
        '> 说明文字应被自动忽略',
        '',
        '## 单元 01',
        "- [ ] **ability** `[ə'biləti]` *n.* 1.能力, 本领 2. 才能",
        '- [ ] **alter** *v.* 改变，改动，变更',
        '- [ ] **above all** 首先；尤其；最重要的是',
        "- [ ] **arise (arose, arisen)** `[ə'raɪz]` *vi.* 出现；产生",
        '- [ ] **burst** *vi. ,n.* 突然发生，爆裂',
        '- 辨析：**move** 是“移动”'
    ].join('\n');

    const result = Controller.parseBatchImportText(mdSample, { lang: 'en' });
    assert.equal(result.isMarkdownDoc, true);
    assert.equal(result.errors.length, 0, '合法 Markdown 清单不应产生误报错误');
    assert.equal(result.parsed.length, 5);

    assert.equal(result.parsed[0].word, 'ability');
    assert.equal(result.parsed[0].reading, "[ə'biləti]");
    assert.equal(result.parsed[0].type, '名词');
    assert.equal(result.parsed[0].inferredLevel, '专升本');

    assert.equal(result.parsed[1].word, 'alter');
    assert.equal(result.parsed[1].reading, '');
    assert.equal(result.parsed[1].type, '动词');

    assert.equal(result.parsed[2].word, 'above all');
    assert.equal(result.parsed[2].type, '短语');
    assert.equal(result.parsed[2].meaning, '首先；尤其；最重要的是');

    assert.equal(result.parsed[3].word, 'arise');
    assert.deepEqual(Array.from(result.parsed[3].aliases), ['arose', 'arisen']);
    assert.equal(result.parsed[3].type, '不及物动词');

    assert.equal(result.parsed[4].word, 'burst');
    assert.equal(result.parsed[4].type, '不及物动词・名词');

    // 仍兼容传统 CSV/TSV 格式
    const csvResult = Controller.parseBatchImportText("apple,/ˈæpəl/,名词,苹果,An apple a day.", { lang: 'en' });
    assert.equal(csvResult.errors.length, 0);
    assert.equal(csvResult.parsed.length, 1);
    assert.equal(csvResult.parsed[0].word, 'apple');
    assert.equal(csvResult.parsed[0].example, 'An apple a day.');
});
