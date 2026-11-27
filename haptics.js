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
    const INTENSITY_STORAGE_KEY = 'hapticsIntensity';
    const DEDUPE_WINDOW_MS = 140;
    const FAST_DEDUPE_WINDOW_MS = 45;
    const COMPAT_GATE_MS = 1050;
    const MAX_DURATION_MS = 2000;

    const INTENSITY_SCALES = Object.freeze({
        light: 0.7,
        standard: 1,
        strong: 1.45
    });

    const PROFILES = Object.freeze({
        key: Object.freeze([14]),
        tap: Object.freeze([22]),
        focus: Object.freeze([18]),
        selection: Object.freeze([28]),
        cardFlip: Object.freeze([18, 24, 30]),
        navigation: Object.freeze([28, 34, 28]),
        sheetOpen: Object.freeze([20, 26, 36]),
        sheetClose: Object.freeze([26, 20, 14]),
        toggle: Object.freeze([24, 34, 42]),
        star: Object.freeze([20, 30, 48]),
        confirm: Object.freeze([30, 38, 58]),
        hint: Object.freeze([24, 40, 24]),
        easy: Object.freeze([18, 24, 36]),
        correct: Object.freeze([28, 36, 54]),
        combo: Object.freeze([26, 30, 42, 30, 72]),
        success: Object.freeze([38, 44, 38, 44, 85]),
        celebration: Object.freeze([40, 42, 40, 42, 65, 50, 130]),
        warning: Object.freeze([65, 48, 65]),
        error: Object.freeze([95, 62, 95]),
        delete: Object.freeze([75, 55, 120]),
        chargeTick: Object.freeze([18]),
        longPress: Object.freeze([35, 42, 110]),
        diagnostic: Object.freeze([220, 120, 220])
    });

    const PRIORITIES = Object.freeze({
        key: 1,
        tap: 1,
        focus: 1,
        chargeTick: 1,
        selection: 2,
        cardFlip: 2,
        navigation: 2,
        sheetOpen: 2,
        sheetClose: 2,
        toggle: 3,
        star: 3,
        confirm: 3,
        hint: 3,
        easy: 4,
        longPress: 4,
        warning: 4,
        correct: 5,
        delete: 5,
        success: 5,
        combo: 6,
        error: 6,
        celebration: 7,
        diagnostic: 8
    });

    const FAST_DEDUPE_TYPES = new Set(['key', 'chargeTick']);

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

    const getIntensity = () => {
        try {
            const raw = root.localStorage?.getItem(INTENSITY_STORAGE_KEY);
            return Object.prototype.hasOwnProperty.call(INTENSITY_SCALES, raw)
                ? raw
                : 'standard';
        } catch (_error) {
            return 'standard';
        }
    };

    const setIntensity = level => {
        const normalized = Object.prototype.hasOwnProperty.call(INTENSITY_SCALES, level)
            ? level
            : 'standard';
        try {
            root.localStorage?.setItem(INTENSITY_STORAGE_KEY, normalized);
        } catch (_error) {}
        return normalized;
    };

    const scalePatternForIntensity = (normalized, { unscaled = false } = {}) => {
        if (unscaled) return normalized;
        const scale = INTENSITY_SCALES[getIntensity()] || 1;
        if (scale === 1) return normalized;
        return normalized.map((value, index) => {
            if (index % 2 === 1 || value <= 0) return value;
            return Math.max(10, Math.min(MAX_DURATION_MS, Math.round(value * scale)));
        });
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

    const shouldTrigger = ({ force = false, priority = 1, windowMs = DEDUPE_WINDOW_MS } = {}) => {
        if (!force && !isEnabled()) {
            return false;
        }

        const now = Date.now();
        if (
            !force &&
            now - lastTriggerAt < windowMs &&
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

    const mapImpactStyle = baseStyle => {
        const intensity = getIntensity();
        if (intensity === 'light') {
            return baseStyle === 'HEAVY' ? 'MEDIUM' : 'LIGHT';
        }
        if (intensity === 'strong') {
            return baseStyle === 'LIGHT' ? 'MEDIUM' : 'HEAVY';
        }
        return baseStyle;
    };

    const runNativeProfile = (type, normalized) => {
        const nativeHaptics = getNativeHaptics();
        if (!nativeHaptics) {
            return false;
        }

        let task;
        if (type === 'celebration') {
            cancelPending();
            task = nativeHaptics.notification({ type: 'SUCCESS' });
            scheduleTimer(() => {
                Promise.resolve(
                    nativeHaptics.vibrate({ duration: 120 })
                ).catch(() => {});
            }, 210);
        } else if (type === 'combo') {
            cancelPending();
            task = nativeHaptics.notification({ type: 'SUCCESS' });
            scheduleTimer(() => {
                Promise.resolve(
                    nativeHaptics.impact({ style: mapImpactStyle('HEAVY') })
                ).catch(() => {});
            }, 145);
        } else if (type === 'success' || type === 'correct') {
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
            const baseStyle =
                type === 'key' ||
                type === 'tap' ||
                type === 'focus' ||
                type === 'sheetClose' ||
                type === 'easy' ||
                type === 'hint' ||
                type === 'chargeTick'
                    ? 'LIGHT'
                    : type === 'confirm' || type === 'longPress'
                        ? 'HEAVY'
                        : 'MEDIUM';
            task = nativeHaptics.impact({ style: mapImpactStyle(baseStyle) });
        }

        Promise.resolve(task).catch(() => {
            vibrateInBrowser(normalized);
        });
        return true;
    };

    const vibratePattern = (
        pattern,
        { force = false, priority = 1, compat, windowMs = DEDUPE_WINDOW_MS, unscaled = false } = {}
    ) => {
        const normalized = normalizePattern(pattern);
        const isStopOnly = normalized.every(value => value === 0);
        if (isStopOnly) {
            cancelPending();
            return hasWebVibrateApi() ? rawBrowserVibrate(0) : false;
        }

        if (!isSupported() || !shouldTrigger({ force, priority, windowMs })) {
            return false;
        }

        const scaled = scalePatternForIntensity(normalized, { unscaled });
        const nativeHaptics = getNativeHaptics();
        if (nativeHaptics) {
            const activePulses = scaled.filter(
                (_value, index) => index % 2 === 0
            );
            const peak = Math.max(...activePulses);
            let task;
            if (peak <= 18 && typeof nativeHaptics.impact === 'function') {
                task = nativeHaptics.impact({ style: mapImpactStyle('LIGHT') });
            } else if (peak <= 35 && typeof nativeHaptics.impact === 'function') {
                task = nativeHaptics.impact({ style: mapImpactStyle('MEDIUM') });
            } else {
                const duration = Math.max(40, Math.min(300, peak));
                task = nativeHaptics.vibrate({ duration });
            }
            Promise.resolve(task).catch(() => {
                vibrateInBrowser(scaled, { compat });
            });
            recordTrigger(priority);
            return true;
        }

        const accepted = hasWebVibrateApi()
            ? vibrateInBrowser(scaled, { compat })
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
        const windowMs = options.windowMs ?? (
            FAST_DEDUPE_TYPES.has(safeType)
                ? FAST_DEDUPE_WINDOW_MS
                : DEDUPE_WINDOW_MS
        );
        const triggerOptions = {
            ...options,
            priority,
            windowMs
        };

        if (!isSupported() || !shouldTrigger(triggerOptions)) {
            return false;
        }

        const rawNormalized = normalizePattern(PROFILES[safeType]);
        const scaled = scalePatternForIntensity(rawNormalized, {
            unscaled: safeType === 'diagnostic'
        });

        if (runNativeProfile(safeType, scaled)) {
            recordTrigger(priority);
            return true;
        }

        const accepted = hasWebVibrateApi()
            ? vibrateInBrowser(scaled, { compat: options.compat })
            : triggerIosSwitchHaptic();

        if (accepted) {
            recordTrigger(priority);
        }
        return accepted;
    };

    const triggerChargeTick = (progress = 0) => {
        const ratio = Math.max(0, Math.min(1, Number(progress) || 0));
        const duration = Math.round(16 + ratio * 26); // 16ms -> 42ms crescendo
        return vibratePattern([duration], {
            priority: PRIORITIES.chargeTick,
            windowMs: FAST_DEDUPE_WINDOW_MS
        });
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
            intensity: getIntensity(),
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

        if (control.matches?.('.qwerty-key')) {
            return 'key';
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
        if (control.matches?.('.sheet-collapse-btn, [data-sheet-close], #detail-close, #btn-cancel-edit, #btn-cancel-move, #dialog-cancel, #prompt-cancel')) {
            return 'sheetClose';
        }
        if (control.matches?.('.bs-facade')) {
            return 'sheetOpen';
        }
        if (control.matches?.('#btn-prev, #btn-next, #detail-prev, #detail-next')) {
            return 'cardFlip';
        }
        if (
            control.matches?.(
                '.nav-item, [data-settings-back], .settings-back-btn'
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
        if (/star|bookmark|收藏/.test(identity)) {
            return 'star';
        }
        if (/select|option|chip|choice|segmented|palette|book-card/.test(identity)) {
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
        INTENSITY_SCALES,
        PROFILES,
        classify,
        getDiagnostics,
        getIntensity,
        getPattern,
        install,
        isCompatMode,
        isEnabled,
        isSupported,
        setCompatMode,
        setEnabled,
        setIntensity,
        trigger,
        triggerChargeTick,
        triggerLegacy
    });
});
