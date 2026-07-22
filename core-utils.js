(function (root, factory) {
    const api = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    root.ZhongriCoreUtils = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const escapeHTML = value => {
        if (!value) {
            return '';
        }

        return String(value).replace(/[&<>'"]/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        })[character]);
    };

    const escapeRegExp = value => {
        return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const cloneDataValue = value => {
        if (typeof structuredClone === 'function') {
            try {
                return structuredClone(value);
            } catch (_error) {}
        }

        return JSON.parse(JSON.stringify(value));
    };

    const hashStableText = value => {
        let hash = 2166136261;
        const text = String(value ?? '');

        for (let index = 0; index < text.length; index++) {
            hash ^= text.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }

        return (hash >>> 0).toString(36);
    };

    const normalizeEntryText = (value, useCompatibility = true) => {
        const source = String(value ?? '');

        return source
            .normalize(useCompatibility ? 'NFKC' : 'NFC')
            .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
            .replace(/\u00A0/g, ' ')
            .replace(/[ \t]+/g, ' ')
            .trim();
    };

    return Object.freeze({
        cloneDataValue,
        escapeHTML,
        escapeRegExp,
        hashStableText,
        normalizeEntryText
    });
});
