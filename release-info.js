(function (root, factory) {
    const info = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = info;
    }

    root.ZhongriReleaseInfo = info;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    return Object.freeze({
        version: 'V9.1',
        build: '2026.07.23.2',
        publishedAt: '2026-07-23T04:55:00Z'
    });
});
