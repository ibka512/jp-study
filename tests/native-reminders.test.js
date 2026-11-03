'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
const planner = require('../notification-planner.js');

async function startNativeReminders({ permission = 'granted', exact = false } = {}) {
  const now = new Date(2026, 10, 3, 8);
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now.getTime()])); }
    static now() { return now.getTime(); }
  }
  const settings = { ...planner.DEFAULT_SETTINGS, enabled: true, exact };
  const snapshot = { cards: [{ due: now.toISOString(), dimension: 'meaning' }], studyDates: [] };
  const scheduled = new Map();
  const handlers = new Map();
  const timers = new Map();
  const elements = new Map();
  const actions = [];
  let initialize;
  let timerId = 0;
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      dataset: {}, textContent: '',
      classList: { add() {}, remove() {} },
      querySelectorAll: () => [],
      addEventListener() {}
    });
    return elements.get(id);
  };
  const notifications = {
    async checkPermissions() { return { display: permission }; },
    async checkExactNotificationSetting() { return { exact_alarm: 'granted' }; },
    async createChannel() {},
    async registerActionTypes(payload) { actions.push(...payload.types); },
    async addListener(name, fn) { handlers.set(name, fn); },
    async cancel({ notifications: list }) { list.forEach(item => scheduled.delete(item.id)); },
    async schedule({ notifications: list }) { list.forEach(item => scheduled.set(item.id, item)); }
  };
  const context = vm.createContext({
    Date: FixedDate, console,
    localStorage: { getItem: key => key === 'nativeStudyReminderSettingsV2' ? JSON.stringify(settings) : null },
    document: {
      readyState: 'loading',
      getElementById: element,
      addEventListener(name, fn) { if (name === 'DOMContentLoaded') initialize = fn; }
    },
    addEventListener(name, fn) { handlers.set(name, fn); },
    setTimeout(fn) { timers.set(++timerId, fn); return timerId; },
    clearTimeout(id) { timers.delete(id); },
    ZhongriNotificationPlanner: planner,
    ZhongriReminderData: { getSnapshot: () => snapshot },
    ZhongriAppReady: Promise.resolve(),
    Capacitor: {
      isNativePlatform: () => true, getPlatform: () => 'android',
      Plugins: {
        LocalNotifications: notifications,
        App: { async addListener(name, fn) { handlers.set(name, fn); } }
      }
    }
  });
  context.window = context;
  vm.runInContext(fs.readFileSync('native-app.js', 'utf8'), context);
  context.document.readyState = 'complete';
  await initialize();
  // Drain queued promises after lifecycle callbacks; no real clock delays.
  const flush = () => new Promise(resolve => setImmediate(resolve));
  const runTimers = async () => {
    const pending = [...timers.values()];
    timers.clear();
    pending.forEach(fn => fn());
    await flush();
  };
  return { now, scheduled, handlers, snapshot, actions, flush, runTimers, element };
}

test('真实原生桥把到期维度安排到通知，并支持推迟 30 分钟', async () => {
  const app = await startNativeReminders();
  const today = app.scheduled.get(planner.PLANNED_NOTIFICATION_BASE_ID);
  assert.match(today.title, /1 个维度/);
  assert.equal(today.schedule.at.getHours(), 20);
  assert.equal(today.schedule.allowWhileIdle, undefined, '默认无需准时提醒权限');
  const actions = app.actions[0].actions.map(action => action.id);
  assert.ok(actions.includes('START_REVIEW'));
  assert.ok(actions.includes('SNOOZE_30'));
  await app.handlers.get('localNotificationActionPerformed')({ actionId: 'SNOOZE_30', notification: today });
  const snooze = [...app.scheduled.values()].find(item => item.extra.kind === 'snooze');
  assert.equal(snooze.schedule.at.getTime() - app.now.getTime(), 30 * 60 * 1000);
});

test('完成学习后数据事件取消今天的提醒，恢复前台会按新数据重排', async () => {
  const app = await startNativeReminders();
  const todayId = planner.PLANNED_NOTIFICATION_BASE_ID;
  assert.ok(app.scheduled.has(todayId));
  app.snapshot.studyDates.push(planner.dateKey(app.now));
  app.handlers.get('zhongri-study-data-changed')();
  await app.runTimers();
  assert.equal(app.scheduled.has(todayId), false);
  app.snapshot.studyDates.length = 0;
  app.handlers.get('appStateChange')({ isActive: true });
  await app.flush();
  assert.ok(app.scheduled.has(todayId));
});

test('通知权限拒绝时不安排通知，显式开启准时提醒时才使用 allowWhileIdle', async () => {
  const denied = await startNativeReminders({ permission: 'denied' });
  assert.equal(denied.scheduled.size, 0);
  assert.match(denied.element('study-reminder-status').textContent, /权限未开启/);
  const exact = await startNativeReminders({ exact: true });
  assert.equal(exact.scheduled.get(planner.PLANNED_NOTIFICATION_BASE_ID).schedule.allowWhileIdle, true);
});
