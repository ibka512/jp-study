'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const VT = require('../visible-typing-core.js');
const SettingsStore = require('../settings-store.js');

test('P0-1: 英语可见跟打支持逐字绿红状态、忽略大小写、错误锁定与退格回退首个错字', () => {
    let clock = 1000;
    const session = VT.createVisibleTypingSession({
        word: { word: 'Abandon', lang: 'en' },
        repeatTarget: 1,
        spaceCooldownTime: 300,
        now: () => clock
    });

    // Type 'abxndon' (index 2 is wrong)
    'abxndon'.split('').forEach(ch => {
        session.inputKey({ key: ch, code: `Key${ch.toUpperCase()}` });
    });

    const lockedSnap = session.getSnapshot();
    assert.equal(lockedSnap.locked, true);
    assert.equal(lockedSnap.completed, false);
    assert.equal(lockedSnap.hasWrong, true);
    assert.equal(lockedSnap.typoCount, 1);
    assert.equal(lockedSnap.charStates[0].status, 'correct');
    assert.equal(lockedSnap.charStates[2].status, 'wrong');

    // Backspace in locked state jumps directly back to first wrong index (2)
    const backRes = session.inputKey({ key: 'Backspace', code: 'Backspace' });
    assert.equal(backRes.event, 'backspace');
    assert.equal(backRes.snapshot.inputText, 'ab');
    assert.equal(backRes.snapshot.locked, false);

    // Finish correctly
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

test('P0-1: 英语多词短语支持空格与撇号，且不吞掉无效前导空格', () => {
    const session = VT.createVisibleTypingSession({
        word: { word: "don't give up", lang: 'en' }
    });

    const leadingSpace = session.inputKey({ key: ' ', code: 'Space' });
    assert.equal(leadingSpace.handled, false);

    let lastRes = null;
    "don't give up".split('').forEach(ch => {
        lastRes = session.inputKey({ key: ch, code: ch === ' ' ? 'Space' : '' });
    });
    assert.equal(lastRes.event, 'completed_word');
    assert.equal(lastRes.snapshot.completed, true);
});

test('P0-1: 日语假名跟打支持罗马音直打、促音、拨音、片假名等价与词尾单 n 收敛', () => {
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

    // SettingsStore registers all 7 new backup keys
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
