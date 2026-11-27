'use strict';

const assert = require('node:assert/strict');

const calls = [];
const storage = new Map();
let vibrateReturnValue = true;

Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
        userActivation: { isActive: true, hasBeenActive: true },
        vibrate(pattern) {
            calls.push(pattern);
            return vibrateReturnValue;
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
assert.deepEqual(haptics.getPattern('navigation'), [28, 34, 28]);
assert.deepEqual(haptics.getPattern('diagnostic'), [220, 120, 220]);
assert.deepEqual(haptics.getPattern('unknown'), [22]);

haptics.setEnabled(true);
assert.equal(haptics.isEnabled(), true);
assert.equal(haptics.trigger('tap', { force: true }), true);
assert.equal(calls.at(-1), 22);

haptics.trigger('success', { force: true });
assert.deepEqual(calls.at(-1), [38, 44, 38, 44, 85]);

const callCount = calls.length;
haptics.setEnabled(false);
assert.equal(haptics.isEnabled(), false);
assert.equal(haptics.trigger('error'), false);
assert.equal(calls.length, callCount + 1, '关闭时只应发送一次停止震动指令');
assert.equal(calls.at(-1), 0);

haptics.trigger('toggle', { force: true });
assert.deepEqual(calls.at(-1), [24, 34, 42]);

haptics.trigger('diagnostic', { force: true });
assert.deepEqual(calls.at(-1), [220, 120, 220]);

// 失败的震动调用不应占用去重窗口，后续有效手势应能立即触发
haptics.setEnabled(true);
vibrateReturnValue = false;
assert.equal(haptics.trigger('tap'), false);
vibrateReturnValue = true;
const callsBeforeRetry = calls.length;
assert.equal(haptics.trigger('tap'), true, '前次震动被拦截后，紧随其后的有效请求不应被去重吞掉');
assert.equal(calls.length, callsBeforeRetry + 1);

// 兼容部分返回 undefined 的 OEM WebView 实现
vibrateReturnValue = undefined;
assert.equal(haptics.trigger('confirm', { force: true }), true);
vibrateReturnValue = true;

// 兼容模式（绕过 Chromium Android <=1000ms 短震动被忽略的回归）
const scheduled = [];
const origSetTimeout = globalThis.setTimeout;
const origClearTimeout = globalThis.clearTimeout;
let fakeTimerId = 1;
globalThis.setTimeout = (fn, delay) => {
    const entry = { id: fakeTimerId++, fn, delay, cleared: false };
    scheduled.push(entry);
    return entry.id;
};
globalThis.clearTimeout = id => {
    const entry = scheduled.find(item => item.id === id);
    if (entry) entry.cleared = true;
};

try {
    haptics.setCompatMode(true);
    assert.equal(haptics.isCompatMode(), true);
    const beforeCompat = calls.length;
    assert.equal(haptics.trigger('diagnostic', { force: true }), true);
    assert.equal(calls[beforeCompat], 1050, '兼容模式首脉冲应使用 >1000ms 门控');
    assert.deepEqual(
        scheduled.filter(s => !s.cleared).map(s => s.delay),
        [220, 340, 560],
        '兼容模式应精确排期截断与第二段脉冲'
    );
    // 执行定时截断与第二段脉冲
    scheduled.filter(s => !s.cleared).forEach(s => s.fn());
    assert.deepEqual(calls.slice(beforeCompat), [1050, 0, 1050, 0]);

    // 关闭总开关时必须清除所有待执行兼容定时器并发送 0
    scheduled.length = 0;
    haptics.trigger('tap', { force: true });
    assert.equal(scheduled.length, 1);
    haptics.setEnabled(false);
    assert.equal(scheduled[0].cleared, true, '关闭触感时必须取消所有待执行截断定时器');
    assert.equal(calls.at(-1), 0);

    haptics.setCompatMode(false);
    haptics.setEnabled(true);
} finally {
    globalThis.setTimeout = origSetTimeout;
    globalThis.clearTimeout = origClearTimeout;
}

// 诊断接口在浏览器环境下返回准确状态
const webDiag = haptics.getDiagnostics();
assert.equal(webDiag.engine, 'web');
assert.equal(webDiag.hasVibrateApi, true);
assert.equal(webDiag.isNative, false);
assert.equal(webDiag.compatMode, false);
assert.equal(webDiag.intensity, 'standard');

// 场景化节奏与强度档位缩放（仅缩放有效脉冲，保留停顿间隔与诊断测试脉冲）
assert.deepEqual(haptics.getPattern('key'), [14]);
assert.deepEqual(haptics.getPattern('cardFlip'), [18, 24, 30]);
assert.deepEqual(haptics.getPattern('star'), [20, 30, 48]);
assert.deepEqual(haptics.getPattern('correct'), [28, 36, 54]);
assert.deepEqual(haptics.getPattern('combo'), [26, 30, 42, 30, 72]);
assert.deepEqual(haptics.getPattern('celebration'), [40, 42, 40, 42, 65, 50, 130]);

haptics.setIntensity('light');
assert.equal(haptics.getIntensity(), 'light');
haptics.trigger('star', { force: true });
assert.deepEqual(calls.at(-1), [14, 30, 34], '轻柔档位应按 0.7x 缩放脉冲并保留 30ms 停顿');

haptics.setIntensity('strong');
assert.equal(haptics.getIntensity(), 'strong');
haptics.trigger('star', { force: true });
assert.deepEqual(calls.at(-1), [29, 30, 70], '强烈档位应按 1.45x 缩放脉冲并保留 30ms 停顿');

// 诊断脉冲不受强度缩放影响
haptics.trigger('diagnostic', { force: true });
assert.deepEqual(calls.at(-1), [220, 120, 220]);

// 长按蓄力渐进脉冲（16ms -> 42ms）
haptics.setIntensity('standard');
haptics.setEnabled(true);
assert.equal(haptics.triggerChargeTick(0), true);
assert.equal(calls.at(-1), 16);
const origDateNow = Date.now;
Date.now = () => origDateNow() + 60;
try {
    assert.equal(haptics.triggerChargeTick(1), true, '蓄力与按键场景使用 45ms 快速去重窗口');
    assert.equal(calls.at(-1), 42);
} finally {
    Date.now = origDateNow;
}

// 原生 Capacitor 环境缺少 navigator.vibrate 时关闭触感不应抛异常
const nativeCalls = [];
Object.defineProperty(globalThis, 'Capacitor', {
    configurable: true,
    value: {
        isNativePlatform: () => true,
        Plugins: {
            Haptics: {
                impact: async opts => nativeCalls.push(['impact', opts]),
                notification: async opts => nativeCalls.push(['notification', opts]),
                vibrate: async opts => nativeCalls.push(['vibrate', opts])
            }
        }
    }
});
Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {}
});
assert.doesNotThrow(() => haptics.setEnabled(false));
assert.equal(haptics.isSupported(), true);
assert.equal(haptics.getDiagnostics().engine, 'native');
haptics.setEnabled(true);
assert.equal(haptics.triggerLegacy(12, { force: true }), true);
assert.deepEqual(nativeCalls.at(-1), ['impact', { style: 'LIGHT' }]);

console.log('场景化触感模块测试通过');
