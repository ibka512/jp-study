'use strict';

const assert = require('node:assert/strict');
const {
    DAY_MS,
    clampGoal,
    localDateKey,
    isMastered,
    rateReview,
    buildDailyPlan
} = require('../daily-learning-core.js');

assert.equal(clampGoal(5), 5);
assert.equal(clampGoal('15'), 15);
assert.equal(clampGoal(999), 10);
assert.equal(localDateKey(new Date(2026, 6, 20, 23, 55)), '2026-07-20');
assert.equal(isMastered({ kanji: true, kana: true, meaning: true }), true);
assert.equal(isMastered({ kanji: true, kana: true }), false);

const now = new Date(2026, 6, 20, 12).getTime();
const words = [
    { id: 'ja-due', index: 0, lang: 'ja' },
    { id: 'ja-new-1', index: 1, lang: 'ja' },
    { id: 'ja-new-2', index: 2, lang: 'ja' },
    { id: 'ja-mastered', index: 3, lang: 'ja' },
    { id: 'en-new', index: 4, lang: 'en' }
];
const clearStates = {
    'ja-due': { needsReview: true },
    'ja-mastered': { kanji: true, kana: true, meaning: true }
};
const reviewRecords = {
    'ja-due': { dueAt: now - 1000, intervalDays: 1, repetitions: 1 }
};

const delayedAgainPlan = buildDailyPlan({
    words,
    clearStates: { 'ja-due': { needsReview: true } },
    reviewRecords: {
        'ja-due': { dueAt: now + 10 * 60 * 1000, lastRating: 'again' }
    },
    language: 'ja',
    goal: 5,
    now,
    reviewOnly: true
});
assert.equal(delayedAgainPlan.dueCount, 0, '稍后再见的词不应立刻计为到期');

const plan = buildDailyPlan({
    words,
    clearStates,
    reviewRecords,
    language: 'ja',
    goal: 5,
    now
});
assert.equal(plan.goal, 5);
assert.equal(plan.dueCount, 1);
assert.equal(plan.indices[0], 0, '到期词应优先进入今日学习');
assert.ok(plan.indices.includes(1));
assert.ok(plan.indices.includes(2));
assert.ok(!plan.indices.includes(4), '日语计划不应混入英语词');
assert.equal(new Set(plan.indices).size, plan.indices.length, '短回合不应重复词');

const reviewPlan = buildDailyPlan({
    words,
    clearStates,
    reviewRecords,
    language: 'ja',
    goal: 5,
    now,
    reviewOnly: true
});
assert.equal(reviewPlan.indices[0], 0);
assert.ok(reviewPlan.indices.includes(3), '复习回合应以已掌握词补足');

const again = rateReview({}, 'again', now);
assert.equal(again.dueAt, now + 10 * 60 * 1000);
assert.equal(again.lastRating, 'again');

const firstGood = rateReview({}, 'good', now);
assert.equal(firstGood.intervalDays, 1);
assert.equal(firstGood.dueAt, now + DAY_MS);
const secondGood = rateReview(firstGood, 'good', now + DAY_MS);
assert.equal(secondGood.intervalDays, 3);

const hard = rateReview({ intervalDays: 4, repetitions: 2 }, 'hard', now);
assert.equal(hard.intervalDays, 5);
assert.equal(hard.lastRating, 'hard');

console.log('每日学习核心检查通过');
