'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const planner = require('../notification-planner.js');

const localDate = (day, time) => {
  const [hour, minute] = time.split(':').map(Number);
  return new Date(2026, 6, day, hour, minute, 0, 0);
};

const settings = overrides => ({
  ...planner.DEFAULT_SETTINGS,
  enabled: true,
  ...overrides
});

test('到期复习优先于当天未学习提醒，并汇总复习维度', () => {
  const result = planner.planNotifications({
    now: localDate(23, '08:00'),
    settings: settings({ weekdays: [4], reminderTime: '20:00' }),
    cards: [
      { due: localDate(23, '07:00'), dimension: 'reading' },
      { due: localDate(23, '07:30'), dimension: 'meaning' }
    ],
    horizonDays: 1
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].kind, 'due');
  assert.equal(result[0].dueCount, 2);
  assert.match(result[0].body, /读音 1/);
  assert.match(result[0].body, /释义 1/);
});

test('主要提醒时间已过时，可在稍后的补救时间提醒', () => {
  const result = planner.planNotifications({
    now: localDate(23, '20:30'),
    settings: settings({
      weekdays: [4],
      reminderTime: '20:00',
      rescueTime: '21:30'
    }),
    cards: [{ due: localDate(23, '07:00'), dimension: 'kanji' }],
    horizonDays: 1
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].kind, 'rescue');
  assert.equal(new Date(result[0].at).getHours(), 21);
});

test('已学习日期不再安排固定或智能提醒', () => {
  const smart = planner.planNotifications({
    now: localDate(23, '08:00'),
    settings: settings({ weekdays: [4] }),
    cards: [{ due: localDate(23, '07:00'), dimension: 'meaning' }],
    studyDates: [localDate(23, '07:30')],
    horizonDays: 1
  });
  const fixed = planner.planNotifications({
    now: localDate(23, '08:00'),
    settings: settings({ mode: 'fixed', weekdays: [4] }),
    studyDates: [localDate(23, '07:30')],
    horizonDays: 1
  });

  assert.deepEqual(smart, []);
  assert.deepEqual(fixed, []);
});

test('跨午夜免打扰时段会阻止其中的提醒', () => {
  assert.equal(planner.isInsideQuietHours('23:00', '22:30', '07:30'), true);
  assert.equal(planner.isInsideQuietHours('06:00', '22:30', '07:30'), true);
  assert.equal(planner.isInsideQuietHours('20:00', '22:30', '07:30'), false);

  const result = planner.planNotifications({
    now: localDate(23, '08:00'),
    settings: settings({
      weekdays: [4],
      dueEnabled: true,
      rescueEnabled: false,
      reminderTime: '23:00'
    }),
    cards: [{ due: localDate(23, '07:00'), dimension: 'meaning' }],
    horizonDays: 1
  });
  assert.deepEqual(result, []);
});

test('只在选中的星期安排提醒', () => {
  const result = planner.planNotifications({
    now: localDate(23, '08:00'),
    settings: settings({
      mode: 'fixed',
      weekdays: [5],
      reminderTime: '20:00'
    }),
    horizonDays: 2
  });

  assert.equal(result.length, 1);
  assert.equal(planner.dateKey(result[0].at), '2026-07-24');
  assert.equal(result[0].id, planner.PLANNED_NOTIFICATION_BASE_ID + 1);
});

test('设置归一化保留空星期并回退非法时间', () => {
  const result = planner.normalizeSettings({
    mode: 'unknown',
    reminderTime: '25:00',
    rescueTime: 'bad',
    weekdays: [],
    exact: true
  });

  assert.equal(result.mode, 'smart');
  assert.equal(result.reminderTime, '20:00');
  assert.equal(result.rescueTime, '21:30');
  assert.deepEqual(result.weekdays, []);
  assert.equal(result.exact, true);
});
