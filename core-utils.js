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

    const createSSEDataParser = onData => {
        if (typeof onData !== 'function') {
            throw new TypeError('SSE 数据处理器必须是函数');
        }

        let buffer = '';

        const dispatchEvent = block => {
            const data = String(block || '')
                .split(/\r?\n/)
                .filter(line => line === 'data' || line.startsWith('data:'))
                .map(line => {
                    return line === 'data'
                        ? ''
                        : line.slice(5).replace(/^ /, '');
                })
                .join('\n');

            if (data) {
                onData(data);
            }
        };

        const drain = flush => {
            let boundary = buffer.match(/\r?\n\r?\n/);

            while (boundary) {
                const index = boundary.index;
                const separatorLength = boundary[0].length;
                dispatchEvent(buffer.slice(0, index));
                buffer = buffer.slice(index + separatorLength);
                boundary = buffer.match(/\r?\n\r?\n/);
            }

            if (flush && buffer.trim()) {
                dispatchEvent(buffer);
                buffer = '';
            }
        };

        return Object.freeze({
            push(chunk) {
                buffer += String(chunk ?? '');
                drain(false);
            },
            finish() {
                drain(true);
            }
        });
    };

    return Object.freeze({
        cloneDataValue,
        createSSEDataParser,
        escapeHTML,
        escapeRegExp,
        hashStableText,
        normalizeEntryText
    });
});
