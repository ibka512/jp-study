(function (root, factory) {
    const api = factory(root);

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    root.ZhongriHaptics = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
    'use strict';

    const STORAGE_KEY = 'hapticsEnabled';
    const DEDUPE_WINDOW_MS = 140;
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

    const isSupported = () => {
        return Boolean(
            root.navigator &&
            typeof root.navigator.vibrate === 'function'
        );
    };

    const isEnabled = () => {
        try {
            return root.localStorage?.getItem(STORAGE_KEY) !== 'false';
        } catch (_error) {
            return true;
        }
    };

    const setEnabled = enabled => {
        try {
            root.localStorage?.setItem(
                STORAGE_KEY,
                enabled ? 'true' : 'false'
            );
        } catch (_error) {}

        if (!enabled && isSupported()) {
            root.navigator.vibrate(0);
        }
    };

    const normalizePattern = pattern => {
        const source = Array.isArray(pattern) ? pattern : [pattern];
        const normalized = source
            .map(value => Math.max(0, Math.min(1000, Number(value) || 0)))
            .slice(0, 15);

        return normalized.length ? normalized : [0];
    };

    const vibratePattern = (
        pattern,
        { force = false, priority = 1 } = {}
    ) => {
        if ((!force && !isEnabled()) || !isSupported()) {
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

        const normalized = normalizePattern(pattern);
        lastTriggerAt = now;
        lastPriority = priority;

        try {
            return root.navigator.vibrate(
                normalized.length === 1
                    ? normalized[0]
                    : normalized
            );
        } catch (_error) {
            return false;
        }
    };

    const getPattern = type => {
        const profile = PROFILES[type] || PROFILES.tap;
        return [...profile];
    };

    const trigger = (type = 'tap', options = {}) => {
        const safeType = PROFILES[type] ? type : 'tap';
        return vibratePattern(PROFILES[safeType], {
            ...options,
            priority: options.priority ?? PRIORITIES[safeType]
        });
    };

    const triggerLegacy = (pattern, options = {}) => {
        return vibratePattern(pattern, {
            ...options,
            priority: options.priority ?? 1
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
            'button, a[href], input, select, textarea, label, ' +
            '[role="button"], [tabindex], .nav-item, .book-card, ' +
            '.wb-card, .move-folder-item, .ai-history-card'
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
                '.danger, .batch-action-danger, .ai-history-del-btn, ' +
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

        documentRef.addEventListener('click', event => {
            const target = event.target;
            if (!target || target.closest?.('input, select, textarea')) {
                return;
            }

            const type = classify(target);
            if (type !== 'none') {
                trigger(type);
            }
        }, true);

        documentRef.addEventListener('change', event => {
            const type = classify(event.target);
            if (type !== 'none') {
                trigger(type);
            }
        }, true);

        documentRef.addEventListener('focusin', event => {
            if (event.target?.matches?.(
                'input:not([type="checkbox"]):not([type="radio"]), ' +
                'textarea, [contenteditable="true"]'
            )) {
                trigger('focus');
            }
        }, true);

        return true;
    };

    return Object.freeze({
        PROFILES,
        classify,
        getPattern,
        install,
        isEnabled,
        isSupported,
        setEnabled,
        trigger,
        triggerLegacy
    });
});
