(function (root, factory) {
    const api = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    root.RoteLearningCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const GROUP_SIZE = 10;
    const GROUP_STEP = 7;
    const MODES = Object.freeze(['word', 'kana', 'meaning']);

    const STEP_TABLE = Object.freeze({
        ja: Object.freeze({
            word: Object.freeze([
                Object.freeze({
                    test: 'spell',
                    dimension: 'reading',
                    prompt: Object.freeze(['word']),
                    answer: 'kana'
                }),
                Object.freeze({
                    test: 'choice-meaning',
                    dimension: 'meaning',
                    prompt: Object.freeze(['word', 'kana']),
                    answer: 'meaning'
                })
            ]),
            kana: Object.freeze([
                Object.freeze({
                    test: 'choice-word',
                    dimension: 'reading',
                    prompt: Object.freeze(['kana']),
                    answer: 'word'
                }),
                Object.freeze({
                    test: 'choice-meaning',
                    dimension: 'meaning',
                    prompt: Object.freeze(['word', 'kana']),
                    answer: 'meaning'
                })
            ]),
            meaning: Object.freeze([
                Object.freeze({
                    test: 'spell',
                    dimension: 'reading',
                    prompt: Object.freeze(['meaning']),
                    answer: 'kana'
                }),
                Object.freeze({
                    test: 'choice-word',
                    dimension: 'meaning',
                    prompt: Object.freeze(['kana', 'meaning']),
                    answer: 'word'
                })
            ])
        }),
        en: Object.freeze({
            word: Object.freeze([
                Object.freeze({
                    test: 'spell',
                    dimension: 'spell',
                    prompt: Object.freeze(['meaning', 'type']),
                    answer: 'word',
                    hidePhonetic: true
                }),
                Object.freeze({
                    test: 'choice-meaning',
                    dimension: 'meaning',
                    prompt: Object.freeze(['word', 'phonetic', 'type']),
                    answer: 'meaning'
                })
            ]),
            kana: Object.freeze([
                Object.freeze({
                    test: 'choice-word',
                    dimension: 'listening',
                    prompt: Object.freeze(['audio']),
                    answer: 'word',
                    hidePhonetic: true
                }),
                Object.freeze({
                    test: 'choice-meaning',
                    dimension: 'meaning',
                    prompt: Object.freeze(['word', 'phonetic', 'type']),
                    answer: 'meaning'
                })
            ]),
            meaning: Object.freeze([
                Object.freeze({
                    test: 'choice-meaning',
                    dimension: 'meaning',
                    prompt: Object.freeze(['word', 'phonetic', 'type']),
                    answer: 'meaning'
                }),
                Object.freeze({
                    test: 'choice-word',
                    dimension: 'spell',
                    prompt: Object.freeze(['meaning', 'type']),
                    answer: 'word',
                    hidePhonetic: true
                })
            ])
        })
    });

    function normalizeLanguage(language) {
        return language === 'en' ? 'en' : 'ja';
    }

    function normalizeMode(language, mode) {
        normalizeLanguage(language);
        return MODES.includes(mode) ? mode : 'word';
    }

    function normalizeStep(step) {
        return Number(step) === 2 ? 2 : 1;
    }

    function getStep(language, mode, step) {
        const lang = normalizeLanguage(language);
        const safeMode = normalizeMode(lang, mode);
        const safeStep = normalizeStep(step);
        return STEP_TABLE[lang][safeMode][safeStep - 1];
    }

    function getGroupRange(groupIndex, totalWords) {
        const safeIndex = Number.isInteger(groupIndex) && groupIndex >= 0
            ? groupIndex
            : 0;
        const safeTotal = Number.isFinite(totalWords) && totalWords > 0
            ? Math.floor(totalWords)
            : 0;
        const start = safeIndex * GROUP_STEP;
        const end = Math.min(start + GROUP_SIZE, safeTotal);

        return Object.freeze({
            groupIndex: safeIndex,
            start,
            end,
            size: Math.max(0, end - start),
            labelStart: start + 1,
            labelEnd: end,
            hasWords: start < safeTotal
        });
    }

    function buildInterleavedQueue(sourceIndexes) {
        const source = Array.isArray(sourceIndexes)
            ? sourceIndexes.filter(Number.isInteger)
            : [];
        const queue = [];

        for (let index = 0; index < source.length; index++) {
            queue.push(source[index]);

            for (let back = index - 1; back >= 0; back--) {
                queue.push(source[back]);
            }

            for (let forward = 1; forward <= index; forward++) {
                queue.push(source[forward]);
            }
        }

        return queue;
    }

    function isFirstAppearance(queue, currentIndex) {
        if (!Array.isArray(queue) || !Number.isInteger(currentIndex)) {
            return false;
        }

        if (currentIndex < 0 || currentIndex >= queue.length) {
            return false;
        }

        return queue.indexOf(queue[currentIndex]) === currentIndex;
    }

    return Object.freeze({
        GROUP_SIZE,
        GROUP_STEP,
        MODES,
        normalizeLanguage,
        normalizeMode,
        normalizeStep,
        getStep,
        getGroupRange,
        buildInterleavedQueue,
        isFirstAppearance
    });
});
