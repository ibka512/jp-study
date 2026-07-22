(function (root, factory) {
    const info = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = info;
    }

    root.ZhongriReleaseInfo = info;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    return Object.freeze({
        version: 'V8',
        build: '2026.07.22.4',
        publishedAt: '2026-07-22T05:12:00Z'
    });
});
