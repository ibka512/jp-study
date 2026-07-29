const assert = require('assert');
const scheduler = require('../fsrs-scheduler.js');

const now = new Date('2026-07-22T00:00:00.000Z');
const card = scheduler.hydrate(null, now);
assert.strictEqual(scheduler.key('word-1', 'ja', 'reading'), 'ja:word-1:reading');
assert.deepStrictEqual(scheduler.DIMENSIONS.en, ['spelling', 'listening', 'meaning']);
assert.strictEqual(scheduler.rating('again'), scheduler.RATING.again);
assert.strictEqual(scheduler.dimensionFor('ja', 'word'), 'kanji');
assert.strictEqual(scheduler.dimensionFor('ja', 'audio'), 'reading');
assert.strictEqual(scheduler.dimensionFor('en', 'spell'), 'spelling');
assert.strictEqual(scheduler.dimensionFor('en', 'audio'), 'listening');
assert.strictEqual(scheduler.key('word-2', 'en', 'spell'), 'en:word-2:spelling');

const preview = scheduler.preview(card, now);
for (const name of ['again', 'hard', 'good', 'easy']) {
  assert.ok(preview[name].card.due, `${name} should have a due date`);
  assert.ok(typeof preview[name].label === 'string');
}

const reviewed = scheduler.review(card, 'good', now);
assert.strictEqual(reviewed.card.reps, 1);
assert.strictEqual(reviewed.log.rating, scheduler.RATING.good);
assert.strictEqual(scheduler.isDue(reviewed.card, now), false);
assert.ok(scheduler.isDue(reviewed.card, new Date('2026-07-23T00:00:00.000Z')));

const serialized = scheduler.serialize(scheduler.hydrate(reviewed.card, now));
assert.strictEqual(typeof serialized.due, 'string');
console.log('fsrs scheduler tests passed');
