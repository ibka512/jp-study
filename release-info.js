(function (root, factory) {
    const info = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = info;
    }

    root.ZhongriReleaseInfo = info;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    return Object.freeze({
        version: 'V9',
        build: '2026.07.22.5',
        publishedAt: '2026-07-22T06:00:00Z'
    });
});
