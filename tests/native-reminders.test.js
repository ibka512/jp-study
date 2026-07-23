'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const nativeApp = fs.readFileSync('native-app.js', 'utf8');
const app = fs.readFileSync('app.js', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
const buildScript = fs.readFileSync(
  'scripts/build-capacitor-web.mjs',
  'utf8'
);
const manifest = fs.readFileSync(
  'android/app/src/main/AndroidManifest.xml',
  'utf8'
);

test('原生提醒提供开始复习和稍后提醒操作', () => {
  assert.match(nativeApp, /STUDY_REMINDER_ACTIONS/);
  assert.match(nativeApp, /START_REVIEW/);
  assert.match(nativeApp, /SNOOZE_30/);
  assert.match(nativeApp, /30 分钟后提醒/);
  assert.match(nativeApp, /localNotificationActionPerformed/);
});

test('提醒会在应用恢复和学习数据变化后自动重排', () => {
  assert.match(nativeApp, /appStateChange/);
  assert.match(nativeApp, /zhongri-study-data-changed/);
  assert.match(app, /ZhongriReminderData/);
  assert.match(app, /saveRecords[\s\S]*saveFsrs/);
  assert.match(app, /window\.ZhongriAppReady/);
});

test('准时权限为可选项且 Android 构建包含提醒规划器', () => {
  assert.match(index, /准时提醒（可选）/);
  assert.match(nativeApp, /settings\.exact/);
  assert.match(nativeApp, /schedule\.allowWhileIdle = true/);
  assert.match(
    manifest,
    /android\.permission\.SCHEDULE_EXACT_ALARM/
  );
  assert.match(buildScript, /notification-planner\.js/);
});
