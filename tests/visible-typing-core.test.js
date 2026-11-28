'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const VT = require('../visible-typing-core.js');
const SettingsStore = require('../settings-store.js');

test('P0-1: 英语可见跟打支持逐字绿红状态、忽略大小写、原地错字提示不移位与空格冷却', () => {
    let clock = 1000;
    const session = VT.createVisibleTypingSession({
        word: { word: 'Abandon', lang: 'en' },
        repeatTarget: 1,
        spaceCooldownTime: 300,
        now: () => clock
    });

    // 正确敲入 ab
    assert.equal(session.inputKey({ key: 'a', code: 'KeyA' }).event, 'typed');
    assert.equal(session.inputKey({ key: 'b', code: 'KeyB' }).event, 'typed');

    // 在第 3 位敲错 x：当前位标红但不推进光标，后续直接敲正确字母即可继续
    const wrongRes = session.inputKey({ key: 'x', code: 'KeyX' });
    assert.equal(wrongRes.event, 'wrong_char');
    assert.equal(wrongRes.snapshot.inputText, 'ab');
    assert.equal(wrongRes.snapshot.hasWrong, true);
    assert.equal(wrongRes.snapshot.typoCount, 1);
    assert.equal(wrongRes.snapshot.charStates[0].status, 'correct');
    assert.equal(wrongRes.snapshot.charStates[2].status, 'wrong');

    // 直接继续敲正确字母 andon，无需连按退格
    let lastRes = null;
    'andon'.split('').forEach(ch => {
        lastRes = session.inputKey({ key: ch, code: `Key${ch.toUpperCase()}` });
    });
    assert.equal(lastRes.event, 'completed_word');
    assert.equal(lastRes.snapshot.completed, true);
    assert.equal(lastRes.snapshot.typoCount, 1);

    // Space cooldown check
    assert.equal(session.canSpaceAdvance(), false);
    clock += 350;
    assert.equal(session.canSpaceAdvance(), true);
});

test('P0-1: 英语多词短语支持空格、撇号与 IME Process/code 回退', () => {
    const session = VT.createVisibleTypingSession({
        word: { word: "don't give up", lang: 'en' }
    });

    const leadingSpace = session.inputKey({ key: ' ', code: 'Space' });
    assert.equal(leadingSpace.handled, false);

    // 模拟中文/日语输入法下 key === 'Process' 但 code === 'KeyD'
    const imeRes = session.inputKey({ key: 'Process', code: 'KeyD', isComposing: true });
    assert.equal(imeRes.event, 'typed');
    assert.equal(imeRes.snapshot.inputText, 'd');

    let lastRes = null;
    "on't give up".split('').forEach(ch => {
        lastRes = session.inputKey({ key: ch, code: ch === ' ' ? 'Space' : '' });
    });
    assert.equal(lastRes.event, 'completed_word');
    assert.equal(lastRes.snapshot.completed, true);
});

test('P0-1: 日语假名跟打支持罗马音直打、促音、拨音、片假名等价、词尾单 n 与含汉字假名清洗', () => {
    // 1. 促音 + 词尾拨音：きっさてん (喫茶店)
    const s1 = VT.createVisibleTypingSession({
        word: { word: '喫茶店', kana: '【きっさてん】', lang: 'ja' }
    });
    let res1 = null;
    'kissaten'.split('').forEach(ch => {
        res1 = s1.inputKey({ key: ch });
    });
    assert.equal(res1.event, 'completed_word');
    assert.equal(res1.snapshot.completed, true);

    // 2. 片假名 + 长音：コーヒー
    const s2 = VT.createVisibleTypingSession({
        word: { word: 'コーヒー', kana: 'コーヒー', lang: 'ja' }
    });
    let res2 = null;
    'ko-hi-'.split('').forEach(ch => {
        res2 = s2.inputKey({ key: ch });
    });
    assert.equal(res2.event, 'completed_word');
    assert.equal(res2.snapshot.completed, true);

    // 3. 假名字段混入汉字的内置词（如 徐々にじょじょに）应自动剥离汉字
    const s3 = VT.createVisibleTypingSession({
        word: { word: '徐々に', kana: '徐々にじょじょに', lang: 'ja' }
    });
    assert.equal(s3.getSnapshot().targetText, 'じょじょに');
    let res3 = null;
    'jojoni'.split('').forEach(ch => {
        res3 = s3.inputKey({ key: ch });
    });
    assert.equal(res3.event, 'completed_word');
});

test('P0-2: repeatTarget > 1 时原地重复跟打并在末遍触发 completed_word', () => {
    const session = VT.createVisibleTypingSession({
        word: { word: 'cat', lang: 'en' },
        repeatTarget: 2
    });

    let r1 = null;
    'cat'.split('').forEach(ch => { r1 = session.inputKey({ key: ch }); });
    assert.equal(r1.event, 'completed_repeat');
    assert.equal(r1.snapshot.repeatDone, 1);
    assert.equal(r1.snapshot.completed, false);

    session.resetForNextRepeat();
    let r2 = null;
    'cat'.split('').forEach(ch => { r2 = session.inputKey({ key: ch }); });
    assert.equal(r2.event, 'completed_word');
    assert.equal(r2.snapshot.repeatDone, 2);
    assert.equal(r2.snapshot.completed, true);
});

test('P1-2 & P2-2: 全角标点映射、首条例句提取与串播判定', () => {
    assert.equal(
        VT.normalizeFullWidthKey({ key: '—', code: 'Minus', shiftKey: false }, 'ー'),
        'ー'
    );
    assert.equal(
        VT.normalizeFullWidthKey({ key: '’', code: 'Quote', shiftKey: false }, "'"),
        "'"
    );

    const ex = '$\\overset{きせつ}{季節}$の変わり目 / 季节交替 || 次の例 / 下一句';
    assert.equal(VT.extractFirstExampleText(ex), '季節の変わり目');

    assert.equal(
        VT.shouldChainFirstSentence({
            autoPlayFirstSentence: true,
            mode: 'pendulum',
            isWordVisible: true,
            exampleText: ex,
            alreadyPlayed: false
        }),
        true
    );
    assert.equal(
        VT.shouldChainFirstSentence({
            autoPlayFirstSentence: false,
            mode: 'pendulum',
            isWordVisible: true,
            exampleText: ex,
            alreadyPlayed: false
        }),
        false
    );

    const backupKeys = SettingsStore.getBackupKeys();
    [
        'studyVisibleTyping',
        'typingRepeatCount',
        'autoNextOnTyped',
        'waitTimeForChangeWord',
        'spaceCooldownTime',
        'typingKeySound',
        'autoPlayFirstSentence'
    ].forEach(k => assert.ok(backupKeys.includes(k), `missing backup key ${k}`));
});
