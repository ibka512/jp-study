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
        build: '2026.07.23.1',
        publishedAt: '2026-07-22T21:32:00Z'
    });
});
