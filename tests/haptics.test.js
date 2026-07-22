'use strict';

const assert = require('node:assert/strict');

const calls = [];
const storage = new Map();

Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
        vibrate(pattern) {
            calls.push(pattern);
            return true;
        }
    }
});
Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
        getItem(key) {
            return storage.has(key) ? storage.get(key) : null;
        },
        setItem(key, value) {
            storage.set(key, String(value));
        }
    }
});

const haptics = require('../haptics.js');

assert.equal(Object.isFrozen(haptics), true);
assert.equal(Object.isFrozen(haptics.PROFILES), true);
assert.equal(haptics.isSupported(), true);
assert.deepEqual(haptics.getPattern('navigation'), [12, 18, 12]);
assert.deepEqual(haptics.getPattern('unknown'), [8]);

haptics.setEnabled(true);
assert.equal(haptics.isEnabled(), true);
assert.equal(haptics.trigger('tap', { force: true }), true);
assert.equal(calls.at(-1), 8);

haptics.trigger('success', { force: true });
assert.deepEqual(calls.at(-1), [18, 24, 18, 24, 36]);

const callCount = calls.length;
haptics.setEnabled(false);
assert.equal(haptics.isEnabled(), false);
assert.equal(haptics.trigger('error'), false);
assert.equal(calls.length, callCount + 1, '关闭时只应发送一次停止震动指令');
assert.equal(calls.at(-1), 0);

haptics.trigger('toggle', { force: true });
assert.deepEqual(calls.at(-1), [10, 18, 16]);

console.log('场景化触感模块测试通过');
