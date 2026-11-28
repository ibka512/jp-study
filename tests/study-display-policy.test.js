'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const StudyCardViewModel = require('../study-card-viewmodel.js');

test('P1-1: resolveDisplayPolicy 按模式返回正确的默认显隐策略', () => {
    assert.deepEqual(
        StudyCardViewModel.resolveDisplayPolicy('pendulum', 'all', false),
        { maskWord: false, maskReading: false, maskMeaning: false }
    );
    assert.deepEqual(
        StudyCardViewModel.resolveDisplayPolicy('pendulum', 'word', false),
        { maskWord: false, maskReading: true, maskMeaning: true }
    );
    assert.deepEqual(
        StudyCardViewModel.resolveDisplayPolicy('pendulum', 'meaning', true),
        { maskWord: true, maskReading: true, maskMeaning: false }
    );
    assert.deepEqual(
        StudyCardViewModel.resolveDisplayPolicy('dual-track', 'spell', true),
        { maskWord: true, maskReading: false, maskMeaning: false }
    );
});

test('P1-1: createDisplayPolicyController 支持单卡临时覆盖与切卡自动复位', () => {
    const ctrl = StudyCardViewModel.createDisplayPolicyController();

    const p1 = ctrl.setPhase('pendulum:0:word', 'pendulum', 'word', false);
    assert.equal(p1.maskWord, false);
    assert.equal(p1.maskMeaning, true);

    // 临时切换释义可见
    const toggled = ctrl.toggleField('maskMeaning');
    assert.equal(toggled.maskMeaning, false);

    // 临时偷看全部
    const peeking = ctrl.setPeekAll(true);
    assert.equal(peeking.maskWord, false);
    assert.equal(peeking.maskReading, false);
    assert.equal(peeking.maskMeaning, false);
    assert.equal(peeking.isPeeking, true);

    // 切换到下一张卡（phaseKey 变化），临时覆盖必须自动复位
    const p2 = ctrl.setPhase('pendulum:1:word', 'pendulum', 'word', false);
    assert.equal(p2.maskWord, false);
    assert.equal(p2.maskReading, true);
    assert.equal(p2.maskMeaning, true);
    assert.equal(p2.isPeeking, false);
});
