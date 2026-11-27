'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers/app-runtime');

test('P1-4: View.renderRoots 支持可点击胶囊，且同根词族能按词根/标签聚合与读取母词注释', () => {
    const { View, Model, Controller } = loadApp();

    const html = View.renderRoots('trans(跨越)-port(搬运)', false, false, { interactive: true });
    assert.match(html, /<button type="button" class="root-capsule capsule-1 is-clickable" data-root-key="port"/);
    assert.match(html, /data-root-label="port\(搬运\)"/);

    // 遮盖状态下保持非交互
    const maskedHtml = View.renderRoots('trans(跨越)-port(搬运)', true, false, { interactive: true });
    assert.doesNotMatch(maskedHtml, /is-clickable/);

    // 注入测试英语词条，验证同根词族查找与母词注释
    Model.db.push(
        { _id: 'en-rf-1', lang: 'en', word: 'transport', roots: 'trans(跨越)-port(搬运)', meaning: '运输', tags: [] },
        { _id: 'en-rf-2', lang: 'en', word: 'export', roots: 'ex(出)-port(搬运)', meaning: '出口', tags: [] },
        { _id: 'en-rf-3', lang: 'en', word: 'passport', roots: '', meaning: '护照', tags: ['母词:port'] },
        { _id: 'en-rf-4', lang: 'en', word: 'revolve', roots: 're(回)-volv(转)', meaning: '旋转', tags: [] }
    );

    const portFamily = Controller.rootFamily.findFamilyWords('port');
    const portWords = portFamily.map(item => item.word.word);
    assert.ok(portWords.includes('transport'));
    assert.ok(portWords.includes('export'));
    assert.ok(portWords.includes('passport'));
    assert.ok(!portWords.includes('revolve'));

    const portNote = Controller.rootFamily.getFamilyNote('port');
    assert.ok(portNote && portNote.note.includes('transport'));

    // 支持导入自定义母词族注释（如 58 组母词 JSON）
    const imported = Controller.confusables.importPayload(JSON.stringify({
        duc: { group: 10, title: 'duc / duct 引导', rootKeys: ['duc', 'duct'], coreMeaning: '引导', note: 'intro+duce 引导进入' }
    }));
    assert.equal(imported.type, 'root-families');
    assert.equal(imported.count, 1);
    assert.equal(Controller.rootFamily.getFamilyNote('duc').coreMeaning, '引导');
});

test('P1-5: 易混词辨析支持内置对比组、Markdown/JSON 导入与错题记录复刷', () => {
    const { Controller } = loadApp();

    const builtInGroups = Controller.confusables.getGroups();
    assert.ok(builtInGroups.length >= 10, '应预置至少 10 组高频易混词辨析');
    assert.ok(builtInGroups.some(g => g.words.includes('spend') && g.words.includes('cost')));
    assert.ok(builtInGroups.some(g => g.words.includes('a number of') && g.words.includes('the number of')));

    // 客户端直接导入 Markdown 易混词组辨析
    const mdSample = [
        '### 2. incident, accident',
        '- incident 指小事件；',
        '- accident 指不幸的事故，例：He was killed in the accident.',
        '',
        '### 3. amount, number',
        '- amount 后接不可数名词；',
        '- number 后接可数名词，例：a number of students'
    ].join('\n');

    const res = Controller.confusables.importPayload(mdSample);
    assert.equal(res.type, 'confusables');
    assert.equal(res.count, 2);

    const afterGroups = Controller.confusables.getGroups();
    const importedGroup = afterGroups.find(g => g.id === 'conf-user-002');
    assert.ok(importedGroup, '应保存导入的 Markdown 易混词组');
    assert.equal(importedGroup.examples.length, 1);
    assert.equal(importedGroup.examples[0].blank, 'He was killed in the ____.');
    assert.equal(importedGroup.examples[0].answer, 'accident');

    // 错题记录与答对清除
    Controller.confusables.recordMistake('conf-builtin-001');
    assert.ok(Controller.confusables.getMistakeIds().includes('conf-builtin-001'));
    Controller.confusables.clearMistake('conf-builtin-001');
    assert.ok(!Controller.confusables.getMistakeIds().includes('conf-builtin-001'));

    // 语境选词测验判定逻辑
    Controller.confusables.buildQuizQueue('conf-builtin-001');
    const wrongResult = Controller.confusables.submitQuizAnswer('cost');
    assert.equal(wrongResult.isCorrect, false);
    assert.ok(Controller.confusables.getMistakeIds().includes('conf-builtin-001'));

    Controller.confusables.buildQuizQueue('conf-builtin-001');
    const rightResult = Controller.confusables.submitQuizAnswer('spend');
    assert.equal(rightResult.isCorrect, true);
    assert.ok(!Controller.confusables.getMistakeIds().includes('conf-builtin-001'));
});
