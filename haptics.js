(function (root, factory) {
    const api = factory(root);

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    root.ZhongriHaptics = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
    'use strict';

    const STORAGE_KEY = 'hapticsEnabled';
    const COMPAT_STORAGE_KEY = 'hapticsCompatMode';
    const DEDUPE_WINDOW_MS = 140;
    const COMPAT_GATE_MS = 1050;
    const MAX_DURATION_MS = 2000;

    const PROFILES = Object.freeze({
        tap: Object.freeze([22]),
        focus: Object.freeze([18]),
        selection: Object.freeze([28]),
        navigation: Object.freeze([28, 34, 28]),
        toggle: Object.freeze([24, 34, 42]),
        confirm: Object.freeze([30, 38, 58]),
        success: Object.freeze([38, 44, 38, 44, 85]),
        warning: Object.freeze([65, 48, 65]),
        error: Object.freeze([95, 62, 95]),
        delete: Object.freeze([75, 55, 120]),
        longPress: Object.freeze([35, 42, 110]),
        diagnostic: Object.freeze([220, 120, 220])
    });
    const PRIORITIES = Object.freeze({
        tap: 1,
        focus: 1,
        selection: 2,
        navigation: 2,
        toggle: 3,
        confirm: 3,
        longPress: 4,
        warning: 4,
        delete: 5,
        success: 5,
        error: 6,
        diagnostic: 7
    });

    let installedDocument = null;
    let lastTriggerAt = -Infinity;
    let lastPriority = 0;
    let iosSwitchLabel = null;
    const pendingTimers = new Set();

    const scheduleTimer = (fn, delay) => {
        const setTimer = root.setTimeout || setTimeout;
        const id = setTimer(() => {
            pendingTimers.delete(id);
            fn();
        }, delay);
        pendingTimers.add(id);
        return id;
    };

    const cancelPending = () => {
        const clearTimer = root.clearTimeout || clearTimeout;
        pendingTimers.forEach(id => clearTimer(id));
        pendingTimers.clear();
    };

    const getNativeHaptics = () => {
        const capacitor = root.Capacitor;
        const plugin = capacitor?.Plugins?.Haptics;

        if (!plugin) {
            return null;
        }

        if (
            typeof capacitor.isNativePlatform === 'function' &&
            !capacitor.isNativePlatform()
        ) {
            return null;
        }

        return plugin;
    };

    const hasWebVibrateApi = () => {
        return Boolean(
            root.navigator &&
            typeof root.navigator.vibrate === 'function'
        );
    };

    const isIosSafariSwitchSupported = () => {
        if (getNativeHaptics() || hasWebVibrateApi()) {
            return false;
        }
        const nav = root.navigator;
        const doc = root.document;
        if (!nav || !doc || typeof doc.createElement !== 'function') {
            return false;
        }
        const ua = String(nav.userAgent || '');
        const isAppleTouch =
            /iPhone|iPad|iPod/i.test(ua) ||
            (nav.platform === 'MacIntel' && Number(nav.maxTouchPoints || 0) > 1);
        return Boolean(isAppleTouch);
    };

    const triggerIosSwitchHaptic = () => {
        if (!isIosSafariSwitchSupported() || !root.document?.body) {
            return false;
        }
        try {
            if (!iosSwitchLabel || !iosSwitchLabel.isConnected) {
                const label = root.document.createElement('label');
                label.setAttribute('aria-hidden', 'true');
                label.dataset.haptic = 'none';
                label.style.cssText =
                    'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;';
                const input = root.document.createElement('input');
                input.type = 'checkbox';
                input.setAttribute('switch', '');
                input.tabIndex = -1;
                input.dataset.haptic = 'none';
                label.appendChild(input);
                root.document.body.appendChild(label);
                iosSwitchLabel = label;
            }
            iosSwitchLabel.click();
            return true;
        } catch (_error) {
            return false;
        }
    };

    const isSupported = () => {
        return Boolean(
            getNativeHaptics() ||
            hasWebVibrateApi() ||
            isIosSafariSwitchSupported()
        );
    };

    const isEnabled = () => {
        try {
            return root.localStorage?.getItem(STORAGE_KEY) !== 'false';
        } catch (_error) {
            return true;
        }
    };

    const isCompatMode = () => {
        try {
            return root.localStorage?.getItem(COMPAT_STORAGE_KEY) === 'true';
        } catch (_error) {
            return false;
        }
    };

    const setCompatMode = enabled => {
        try {
            root.localStorage?.setItem(
                COMPAT_STORAGE_KEY,
                enabled ? 'true' : 'false'
            );
        } catch (_error) {}
    };

    const rawBrowserVibrate = arg => {
        if (!hasWebVibrateApi()) {
            return false;
        }
        try {
            const result = root.navigator.vibrate(arg);
            return result !== false;
        } catch (_error) {
            return false;
        }
    };

    const setEnabled = enabled => {
        try {
            root.localStorage?.setItem(
                STORAGE_KEY,
                enabled ? 'true' : 'false'
            );
        } catch (_error) {}

        lastTriggerAt = -Infinity;
        lastPriority = 0;

        if (!enabled) {
            cancelPending();
            if (hasWebVibrateApi()) {
                rawBrowserVibrate(0);
            }
        }
    };

    const normalizePattern = pattern => {
        const source = Array.isArray(pattern) ? pattern : [pattern];
        const normalized = source
            .map(value => Math.max(0, Math.min(MAX_DURATION_MS, Number(value) || 0)))
            .slice(0, 15);

        return normalized.length ? normalized : [0];
    };

    const shouldTrigger = ({ force = false, priority = 1 } = {}) => {
        if (!force && !isEnabled()) {
            return false;
        }

        const now = Date.now();
        if (
            !force &&
            now - lastTriggerAt < DEDUPE_WINDOW_MS &&
            priority <= lastPriority
        ) {
            return false;
        }

        return true;
    };

    const recordTrigger = (priority = 1) => {
        lastTriggerAt = Date.now();
        lastPriority = priority;
    };

    const vibrateInBrowserCompat = normalized => {
        cancelPending();
        const isStopOnly = normalized.every(value => value === 0);
        if (isStopOnly) {
            return rawBrowserVibrate(0);
        }

        const firstDuration = normalized[0];
        if (!firstDuration) {
            return rawBrowserVibrate(0);
        }

        const firstGate = firstDuration <= 1000 ? COMPAT_GATE_MS : firstDuration;
        const accepted = rawBrowserVibrate(firstGate);
        if (!accepted) {
            return false;
        }

        let offset = 0;
        for (let i = 0; i < normalized.length; i += 2) {
            const pulse = normalized[i] || 0;
            const pause = normalized[i + 1] || 0;

            if (i > 0 && pulse > 0) {
                const startAt = offset;
                const gate = pulse <= 1000 ? COMPAT_GATE_MS : pulse;
                scheduleTimer(() => {
                    rawBrowserVibrate(gate);
                }, startAt);
            }

            if (pulse > 0 && pulse <= 1000) {
                const stopAt = offset + pulse;
                scheduleTimer(() => {
                    rawBrowserVibrate(0);
                }, stopAt);
            }

            offset += pulse + pause;
        }

        return true;
    };

    const vibrateInBrowser = (normalized, { compat = isCompatMode() } = {}) => {
        if (!hasWebVibrateApi()) {
            return false;
        }

        const isStopOnly = normalized.every(value => value === 0);
        if (isStopOnly) {
            cancelPending();
            return rawBrowserVibrate(0);
        }

        if (compat && normalized.some((value, idx) => idx % 2 === 0 && value > 0 && value <= 1000)) {
            return vibrateInBrowserCompat(normalized);
        }

        cancelPending();
        return rawBrowserVibrate(
            normalized.length === 1
                ? normalized[0]
                : normalized
        );
    };

    const runNativeProfile = (type, normalized) => {
        const nativeHaptics = getNativeHaptics();
        if (!nativeHaptics) {
            return false;
        }

        let task;
        if (type === 'success') {
            task = nativeHaptics.notification({ type: 'SUCCESS' });
        } else if (type === 'warning') {
            task = nativeHaptics.notification({ type: 'WARNING' });
        } else if (type === 'error' || type === 'delete') {
            task = nativeHaptics.notification({ type: 'ERROR' });
        } else if (type === 'diagnostic') {
            cancelPending();
            task = nativeHaptics.vibrate({ duration: 220 });
            scheduleTimer(() => {
                Promise.resolve(
                    nativeHaptics.vibrate({ duration: 220 })
                ).catch(() => {});
            }, 340);
        } else {
            const style =
                type === 'tap' || type === 'focus'
                    ? 'LIGHT'
                    : type === 'confirm' || type === 'longPress'
                        ? 'HEAVY'
                        : 'MEDIUM';
            task = nativeHaptics.impact({ style });
        }

        Promise.resolve(task).catch(() => {
            vibrateInBrowser(normalized);
        });
        return true;
    };

    const vibratePattern = (
        pattern,
        { force = false, priority = 1, compat } = {}
    ) => {
        const normalized = normalizePattern(pattern);
        const isStopOnly = normalized.every(value => value === 0);
        if (isStopOnly) {
            cancelPending();
            return hasWebVibrateApi() ? rawBrowserVibrate(0) : false;
        }

        if (!isSupported() || !shouldTrigger({ force, priority })) {
            return false;
        }

        const nativeHaptics = getNativeHaptics();
        if (nativeHaptics) {
            const activePulses = normalized.filter(
                (_value, index) => index % 2 === 0
            );
            const peak = Math.max(...activePulses);
            let task;
            if (peak <= 18 && typeof nativeHaptics.impact === 'function') {
                task = nativeHaptics.impact({ style: 'LIGHT' });
            } else if (peak <= 35 && typeof nativeHaptics.impact === 'function') {
                task = nativeHaptics.impact({ style: 'MEDIUM' });
            } else {
                const duration = Math.max(40, Math.min(300, peak));
                task = nativeHaptics.vibrate({ duration });
            }
            Promise.resolve(task).catch(() => {
                vibrateInBrowser(normalized, { compat });
            });
            recordTrigger(priority);
            return true;
        }

        const accepted = hasWebVibrateApi()
            ? vibrateInBrowser(normalized, { compat })
            : triggerIosSwitchHaptic();

        if (accepted) {
            recordTrigger(priority);
        }
        return accepted;
    };

    const getPattern = type => {
        const profile = PROFILES[type] || PROFILES.tap;
        return [...profile];
    };

    const trigger = (type = 'tap', options = {}) => {
        const safeType = PROFILES[type] ? type : 'tap';
        const priority = options.priority ?? PRIORITIES[safeType];
        const triggerOptions = {
            ...options,
            priority
        };

        if (!isSupported() || !shouldTrigger(triggerOptions)) {
            return false;
        }

        const normalized = normalizePattern(PROFILES[safeType]);
        if (runNativeProfile(safeType, normalized)) {
            recordTrigger(priority);
            return true;
        }

        const accepted = hasWebVibrateApi()
            ? vibrateInBrowser(normalized, { compat: options.compat })
            : triggerIosSwitchHaptic();

        if (accepted) {
            recordTrigger(priority);
        }
        return accepted;
    };

    const triggerLegacy = (pattern, options = {}) => {
        return vibratePattern(pattern, {
            ...options,
            priority: options.priority ?? 1
        });
    };

    const getDiagnostics = () => {
        const isNative = Boolean(getNativeHaptics());
        const hasVibrateApi = hasWebVibrateApi();
        const iosSwitch = isIosSafariSwitchSupported();
        const ua = root.navigator?.userActivation;
        return Object.freeze({
            engine: isNative
                ? 'native'
                : (hasVibrateApi ? 'web' : (iosSwitch ? 'ios-switch' : 'none')),
            isNative,
            hasVibrateApi,
            supported: isSupported(),
            enabled: isEnabled(),
            compatMode: isCompatMode(),
            userActive: ua ? Boolean(ua.isActive) : null,
            hasBeenActive: ua ? Boolean(ua.hasBeenActive) : null
        });
    };

    const classify = element => {
        if (!element || typeof element.closest !== 'function') {
            return 'tap';
        }

        const explicit = element.closest('[data-haptic]');
        if (explicit?.dataset?.haptic) {
            return explicit.dataset.haptic;
        }

        const control = element.closest(
            'button, a[href], summary, input, select, textarea, label, ' +
            '[role="button"], [tabindex], .nav-item, .book-card, ' +
            '.wb-card, .move-folder-item'
        );

        if (!control) {
            return 'none';
        }

        if (
            control.disabled ||
            control.getAttribute?.('aria-disabled') === 'true'
        ) {
            return 'none';
        }

        if (control.matches?.('input[type="checkbox"], input[type="radio"]')) {
            return 'toggle';
        }
        if (control.matches?.('summary')) {
            return 'selection';
        }
        if (control.matches?.('select, option')) {
            return 'selection';
        }
        if (control.matches?.('input, textarea, [contenteditable="true"]')) {
            return 'focus';
        }
        if (
            control.matches?.(
                '.nav-item, [data-settings-back], .settings-back-btn, ' +
                '#btn-prev, #btn-next, #detail-prev, #detail-next'
            )
        ) {
            return 'navigation';
        }
        if (
            control.matches?.(
                '.danger, .batch-action-danger, ' +
                '[data-trash-action="delete"]'
            )
        ) {
            return 'delete';
        }

        const identity = [
            control.id,
            control.className,
            control.getAttribute?.('aria-label'),
            control.getAttribute?.('title')
        ].filter(Boolean).join(' ').toLowerCase();

        if (/delete|remove|clear|reset|danger|wrong|forget|删除|清空|重置/.test(identity)) {
            return 'warning';
        }
        if (/save|confirm|finish|start|submit|accept|correct|保存|确认|完成|开始/.test(identity)) {
            return 'confirm';
        }
        if (/star|select|option|chip|choice|bookmark/.test(identity)) {
            return 'selection';
        }

        return 'tap';
    };

    const install = (documentRef = root.document) => {
        if (!documentRef || installedDocument === documentRef) {
            return false;
        }

        installedDocument = documentRef;

        // Bubble phase so explicit semantic handlers run first without being cancelled
        // or swallowed by generic delegated click/change fallbacks.
        documentRef.addEventListener('click', event => {
            const target = event.target;
            if (!target || target.closest?.('input, select, textarea')) {
                return;
            }
            const label = target.closest?.('label');
            if (label && label.control) {
                return;
            }

            const type = classify(target);
            if (type !== 'none') {
                trigger(type);
            }
        }, false);

        documentRef.addEventListener('change', event => {
            const type = classify(event.target);
            if (type !== 'none') {
                trigger(type);
            }
        }, false);

        documentRef.addEventListener('focusin', event => {
            if (event.target?.matches?.(
                'input:not([type="checkbox"]):not([type="radio"]), ' +
                'textarea, [contenteditable="true"]'
            )) {
                trigger('focus');
            }
        }, true);

        const stopOnHide = () => {
            if (pendingTimers.size > 0) {
                cancelPending();
                if (hasWebVibrateApi()) {
                    rawBrowserVibrate(0);
                }
            }
        };

        documentRef.addEventListener('visibilitychange', () => {
            if (documentRef.hidden) {
                stopOnHide();
            }
        });
        root.addEventListener?.('pagehide', stopOnHide);

        return true;
    };

    return Object.freeze({
        PROFILES,
        classify,
        getDiagnostics,
        getPattern,
        install,
        isCompatMode,
        isEnabled,
        isSupported,
        setCompatMode,
        setEnabled,
        trigger,
        triggerLegacy
    });
});
