'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const Fsrs = require('../fsrs-scheduler.js');

test('P1-3: suggestRatingFromTyping 根据客观失误数与提示状态映射 FSRS 评分', () => {
    assert.equal(Fsrs.suggestRatingFromTyping({ typoCount: 0 }), 'easy');
    assert.equal(Fsrs.suggestRatingFromTyping({ typoCount: 0, conservative: true }), 'good');
    assert.equal(Fsrs.suggestRatingFromTyping({ typoCount: 1 }), 'good');
    assert.equal(Fsrs.suggestRatingFromTyping({ typoCount: 2 }), 'hard');
    assert.equal(Fsrs.suggestRatingFromTyping({ typoCount: 3 }), 'hard');
    assert.equal(Fsrs.suggestRatingFromTyping({ typoCount: 4 }), 'again');
    assert.equal(Fsrs.suggestRatingFromTyping({ typoCount: 0, usedHint: true }), 'again');
    assert.equal(Fsrs.suggestRatingFromTyping({ typoCount: 0, isSkipped: true }), 'again');
});
