(function (root, factory) {
    const api = factory(root);

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    root.ZhongriSettingsStore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
    'use strict';

    /**
     * Declarative preference schema (Single Source of Truth for DP2 Persistence).
     * Eliminates reverse coupling A_{2,4..7} where backup logic previously had
     * to hardcode knowledge of scattered localStorage keys across upper modules.
     */
    const PREFERENCE_SCHEMA = Object.freeze({
        theme: Object.freeze({ defaultValue: 'light', backup: true, type: 'string' }),
        colorPalette: Object.freeze({ defaultValue: 'washi', backup: true, type: 'string' }),
        langMode: Object.freeze({ defaultValue: 'ja', backup: true, type: 'string' }),
        autoSpeak: Object.freeze({ defaultValue: 'true', backup: true, type: 'boolean' }),
        hapticsEnabled: Object.freeze({ defaultValue: 'true', backup: true, type: 'boolean' }),
        hapticsIntensity: Object.freeze({ defaultValue: 'standard', backup: true, type: 'string' }),
        hapticsCompatMode: Object.freeze({ defaultValue: 'false', backup: true, type: 'boolean' }),
        showRoots: Object.freeze({ defaultValue: 'true', backup: true, type: 'boolean' }),
        darkBtnStyle: Object.freeze({ defaultValue: 'false', backup: true, type: 'boolean' }),
        postponeTested: Object.freeze({ defaultValue: 'false', backup: true, type: 'boolean' }),
        wordOrderMode: Object.freeze({ defaultValue: 'smart', backup: true, type: 'string' }),
        skipMastered: Object.freeze({ defaultValue: 'false', backup: true, type: 'boolean' }),
        skipPhraseSpell: Object.freeze({ defaultValue: 'false', backup: true, type: 'boolean' }),
        studyVisibleTyping: Object.freeze({ defaultValue: 'auto', backup: true, type: 'string' }),
        typingRepeatCount: Object.freeze({ defaultValue: '1', backup: true, type: 'string' }),
        autoNextOnTyped: Object.freeze({ defaultValue: 'false', backup: true, type: 'boolean' }),
        waitTimeForChangeWord: Object.freeze({ defaultValue: '300', backup: true, type: 'string' }),
        spaceCooldownTime: Object.freeze({ defaultValue: '300', backup: true, type: 'string' }),
        typingKeySound: Object.freeze({ defaultValue: 'true', backup: true, type: 'boolean' }),
        autoPlayFirstSentence: Object.freeze({ defaultValue: 'false', backup: true, type: 'boolean' }),
        ttsEngine: Object.freeze({ defaultValue: 'microsoft', backup: true, type: 'string' }),
        ttsRate: Object.freeze({ defaultValue: '1', backup: true, type: 'string' }),
        displayMode: Object.freeze({ defaultValue: 'all', backup: true, type: 'string' }),
        lastCustomGroupTxt: Object.freeze({ defaultValue: '', backup: true, type: 'string' }),
        lastCustomGroupVal: Object.freeze({ defaultValue: '', backup: true, type: 'string' }),
        lastSelectedFolder: Object.freeze({ defaultValue: '', backup: true, type: 'string' }),
        lastTestDisplay: Object.freeze({ defaultValue: 'kana', backup: true, type: 'string' }),
        lastTestRange: Object.freeze({ defaultValue: 'all', backup: true, type: 'string' }),
        wbCols: Object.freeze({ defaultValue: '3', backup: false, type: 'string' }),
        wbBlur: Object.freeze({ defaultValue: 'all', backup: false, type: 'string' })
    });

    const BACKUP_KEYS = Object.freeze(
        Object.keys(PREFERENCE_SCHEMA).filter(key => PREFERENCE_SCHEMA[key].backup)
    );

    const ALL_KEYS = Object.freeze(Object.keys(PREFERENCE_SCHEMA));

    const resolveStorage = storage => {
        if (storage && typeof storage.getItem === 'function') {
            return storage;
        }
        if (root && root.localStorage && typeof root.localStorage.getItem === 'function') {
            return root.localStorage;
        }
        return null;
    };

    const getSchema = () => PREFERENCE_SCHEMA;
    const getBackupKeys = () => BACKUP_KEYS;
    const getAllKeys = () => ALL_KEYS;

    const get = (key, storage) => {
        const store = resolveStorage(storage);
        const def = Object.prototype.hasOwnProperty.call(PREFERENCE_SCHEMA, key)
            ? PREFERENCE_SCHEMA[key].defaultValue
            : null;
        if (!store) return def;
        const raw = store.getItem(key);
        return raw === null ? def : raw;
    };

    const getRaw = (key, storage) => {
        const store = resolveStorage(storage);
        return store ? store.getItem(key) : null;
    };

    const getBool = (key, storage) => {
        const val = get(key, storage);
        return val === true || val === 'true';
    };

    const set = (key, value, storage) => {
        const store = resolveStorage(storage);
        if (!store) return false;
        if (value === null || value === undefined) {
            store.removeItem(key);
            return true;
        }
        store.setItem(key, String(value));
        return true;
    };

    const remove = (key, storage) => {
        const store = resolveStorage(storage);
        if (!store) return false;
        store.removeItem(key);
        return true;
    };

    const collectBackupPreferences = storage => {
        const store = resolveStorage(storage);
        const preferences = {};
        if (!store) return preferences;

        for (const key of BACKUP_KEYS) {
            const value = store.getItem(key);
            if (value !== null) {
                preferences[key] = value;
            }
        }
        return preferences;
    };

    const applyBackupPreferences = (preferences, storage) => {
        const store = resolveStorage(storage);
        if (
            !store ||
            !preferences ||
            typeof preferences !== 'object' ||
            Array.isArray(preferences)
        ) {
            return 0;
        }

        let applied = 0;
        for (const key of BACKUP_KEYS) {
            if (Object.prototype.hasOwnProperty.call(preferences, key)) {
                store.setItem(key, String(preferences[key]));
                applied += 1;
            }
        }
        return applied;
    };

    const clearBackupPreferences = storage => {
        const store = resolveStorage(storage);
        if (!store) return 0;
        for (const key of BACKUP_KEYS) {
            store.removeItem(key);
        }
        return BACKUP_KEYS.length;
    };

    return Object.freeze({
        PREFERENCE_SCHEMA,
        getSchema,
        getBackupKeys,
        getAllKeys,
        get,
        getRaw,
        getBool,
        set,
        remove,
        collectBackupPreferences,
        applyBackupPreferences,
        clearBackupPreferences
    });
});
