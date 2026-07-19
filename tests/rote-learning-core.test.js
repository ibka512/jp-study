'use strict';

const assert = require('node:assert/strict');
const core = require('../rote-learning-core.js');

assert.equal(core.normalizeMode('ja', 'all'), 'word');
assert.equal(core.normalizeMode('en', 'all'), 'word');
assert.equal(core.normalizeMode('ja', 'kana'), 'kana');

for (const language of ['ja', 'en']) {
    for (const mode of core.MODES) {
        for (const step of [1, 2]) {
            const descriptor = core.getStep(language, mode, step);
            assert.ok(descriptor.test, `${language}/${mode}/${step} 缺少题型`);
            assert.ok(descriptor.dimension, `${language}/${mode}/${step} 缺少学习维度`);
            assert.ok(descriptor.answer, `${language}/${mode}/${step} 缺少答案字段`);
            assert.ok(descriptor.prompt.length > 0, `${language}/${mode}/${step} 缺少题面`);
        }
    }
}

assert.equal(core.getStep('en', 'word', 1).test, 'spell');
assert.equal(core.getStep('en', 'word', 1).hidePhonetic, true);
assert.equal(core.getStep('en', 'kana', 1).dimension, 'listening');
assert.equal(core.getStep('ja', 'meaning', 2).test, 'choice-word');

assert.deepEqual(core.getGroupRange(0, 24), {
    groupIndex: 0,
    start: 0,
    end: 10,
    size: 10,
    labelStart: 1,
    labelEnd: 10,
    hasWords: true
});
assert.deepEqual(core.getGroupRange(1, 24), {
    groupIndex: 1,
    start: 7,
    end: 17,
    size: 10,
    labelStart: 8,
    labelEnd: 17,
    hasWords: true
});
assert.deepEqual(core.getGroupRange(2, 24), {
    groupIndex: 2,
    start: 14,
    end: 24,
    size: 10,
    labelStart: 15,
    labelEnd: 24,
    hasWords: true
});

const queue = core.buildInterleavedQueue([1, 2, 3]);
assert.deepEqual(queue, [1, 2, 1, 2, 3, 2, 1, 2, 3]);
assert.equal(core.isFirstAppearance(queue, 0), true);
assert.equal(core.isFirstAppearance(queue, 1), true);
assert.equal(core.isFirstAppearance(queue, 2), false);
assert.equal(core.isFirstAppearance(queue, 4), true);

console.log('循环强记核心测试通过');
