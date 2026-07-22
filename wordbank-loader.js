(function (root, factory) {
    const api = factory(root);

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    root.ZhongriWordbankLoader = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
    'use strict';

    const loadedLanguages = new Set();
    const loadingLanguages = new Map();

    const normalizeLanguage = language => {
        return language === 'en' ? 'en' : 'ja';
    };

    const getAssets = language => {
        const normalizedLanguage = normalizeLanguage(language);
        const manifest = root.ZhongriWordbankAssets || {};
        const groups = manifest.WORD_BANK_LANG_ASSETS || (
            typeof WORD_BANK_LANG_ASSETS !== 'undefined'
                ? WORD_BANK_LANG_ASSETS
                : {}
        );
        const finalizer = manifest.WORD_BANK_FINALIZER || (
            typeof WORD_BANK_FINALIZER !== 'undefined'
                ? WORD_BANK_FINALIZER
                : './wordbanks/finalize.js'
        );

        return [
            ...(groups[normalizedLanguage] || []),
            finalizer
        ];
    };

    const loadScript = source => {
        if (!root.document) {
            return Promise.reject(new Error('当前环境无法加载词库脚本'));
        }

        const existing = root.document.querySelector(
            `script[data-zhongri-wordbank="${source}"]`
        );
        if (existing?.dataset?.loaded === 'true') {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = existing || root.document.createElement('script');
            const finish = () => {
                script.dataset.loaded = 'true';
                resolve();
            };

            if (existing) {
                existing.addEventListener('load', finish, { once: true });
                existing.addEventListener('error', () => {
                    reject(new Error(`词库脚本加载失败：${source}`));
                }, { once: true });
                return;
            }

            script.src = source;
            script.async = false;
            script.dataset.zhongriWordbank = source;
            script.addEventListener('load', finish, { once: true });
            script.addEventListener('error', () => {
                script.remove();
                reject(new Error(`词库脚本加载失败：${source}`));
            }, { once: true });
            root.document.head.appendChild(script);
        });
    };

    const markLoaded = language => {
        loadedLanguages.add(normalizeLanguage(language));
    };

    const isLoaded = language => {
        return loadedLanguages.has(normalizeLanguage(language));
    };

    const loadLanguage = language => {
        const normalizedLanguage = normalizeLanguage(language);

        if (isLoaded(normalizedLanguage)) {
            return Promise.resolve(normalizedLanguage);
        }
        if (loadingLanguages.has(normalizedLanguage)) {
            return loadingLanguages.get(normalizedLanguage);
        }

        const finalizer = (root.ZhongriWordbankAssets || {})
            .WORD_BANK_FINALIZER || (
                typeof WORD_BANK_FINALIZER !== 'undefined'
                    ? WORD_BANK_FINALIZER
                    : './wordbanks/finalize.js'
            );
        const task = getAssets(normalizedLanguage)
            .filter(source => source !== finalizer)
            .reduce(
                (chain, source) => chain.then(() => loadScript(source)),
                Promise.resolve()
            )
            .then(() => {
                if (typeof root.ZhongriFinalizeWordbanks === 'function') {
                    root.ZhongriFinalizeWordbanks();
                    return;
                }
                return loadScript(finalizer);
            })
            .then(() => {
                markLoaded(normalizedLanguage);
                loadingLanguages.delete(normalizedLanguage);
                return normalizedLanguage;
            })
            .catch(error => {
                loadingLanguages.delete(normalizedLanguage);
                throw error;
            });

        loadingLanguages.set(normalizedLanguage, task);
        return task;
    };

    return Object.freeze({
        getAssets,
        isLoaded,
        loadLanguage,
        markLoaded,
        normalizeLanguage
    });
});
