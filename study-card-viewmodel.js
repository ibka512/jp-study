(function (root, factory) {
    const api = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    root.ZhongriStudyCardViewModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const MASK_FIXED = '■■■';

    const isMaskedText = text => {
        const trimmed = String(text || '').trim();
        return Boolean(trimmed && /^[■\s]+$/.test(trimmed));
    };

    const stripKanaBrackets = kana => {
        return String(kana || '').replace(/[【】\[\]()]/g, '');
    };

    const computeWordFontSize = (wordText, isEnglish, isMasked = false) => {
        if (isMasked) {
            return '2.8rem';
        }
        const length = Array.from(String(wordText || '')).length;
        if (isEnglish) {
            if (length >= 14) return '1.8rem';
            if (length >= 11) return '2.2rem';
            if (length >= 8) return '2.8rem';
            if (length >= 5) return '3.5rem';
            return '4.2rem';
        }
        if (length >= 10) return '1.8rem';
        if (length >= 7) return '2.2rem';
        if (length >= 5) return '2.6rem';
        return '';
    };

    /**
     * Pure ViewModel builder for FSRS Review (DP5 -> DP4 decoupled boundary).
     * Eliminates direct DOM manipulation by FSRS review logic inside renderStudyCard.
     */
    const buildFsrsCardViewModel = ({
        word,
        dimension = 'meaning',
        isRevealed = false,
        isEnglish = false,
        showRootsPref = true
    }) => {
        const entry = word || {};
        const hideWord =
            !isRevealed &&
            ['kanji', 'spelling', 'listening'].includes(dimension);
        const hideReading =
            !isRevealed &&
            ['reading', 'spelling', 'listening'].includes(dimension);
        const hideMeaning =
            !isRevealed &&
            ['meaning', 'listening'].includes(dimension);
        const isListeningPrompt =
            !isRevealed && dimension === 'listening';

        const wordText = hideWord ? MASK_FIXED : (entry.word || '');
        const readingText = hideReading
            ? MASK_FIXED
            : isEnglish
                ? (entry.phonetic || '')
                : stripKanaBrackets(entry.kana);
        const meaningText = hideMeaning ? MASK_FIXED : (entry.meaning || '');

        return Object.freeze({
            mode: 'fsrs-review',
            isEnglish: Boolean(isEnglish),
            wordText,
            wordFontSize: hideWord ? '2.8rem' : '',
            readingText,
            meaningText,
            isMaskedWord: hideWord,
            isMaskedReading: hideReading,
            isMaskedMeaning: hideMeaning,
            showWordRow: !isListeningPrompt,
            showReadingRow: !isListeningPrompt,
            showMeaningRow: !isListeningPrompt,
            showType: Boolean(isRevealed),
            showRoots: Boolean(isRevealed && isEnglish && entry.roots && showRootsPref),
            maskRootText: false,
            maskRootMeaning: false,
            showExample: Boolean(isRevealed && entry.example),
            showBlindAudio: isListeningPrompt,
            showBlindHint: false,
            showSpeaker: Boolean(isRevealed),
            showStar: Boolean(isRevealed),
            autoSpeakOnRender: isListeningPrompt
        });
    };

    /**
     * Pure ViewModel builder for Filter Test (DP4 declarative state calculation).
     */
    const buildFilterTestCardViewModel = ({
        word,
        displayMode = 'kana',
        ftState = 'A',
        ftHint = '',
        showKanaHint = false,
        isEnglish = false,
        showRootsPref = true
    }) => {
        const entry = word || {};
        const normalizedDisplayMode =
            isEnglish && displayMode === 'kana' ? 'word' : displayMode;

        const isVisible = field => {
            if (ftState === 'C') return true;
            if (normalizedDisplayMode === field) return true;
            if (ftState === 'B' && ftHint === field) return true;
            return false;
        };

        const showW = isVisible('word');
        const showK = isVisible('kana') || Boolean(showKanaHint);
        const showM = isVisible('meaning');
        const showA = isVisible('audio');

        const wordText = showW ? (entry.word || '') : MASK_FIXED;
        const readingText = showK
            ? (isEnglish ? (entry.phonetic || '') : stripKanaBrackets(entry.kana))
            : MASK_FIXED;
        const meaningText = showM ? (entry.meaning || '') : MASK_FIXED;

        const isBlindAudioPrompt =
            ftState !== 'C' && normalizedDisplayMode === 'audio';
        const showWordRow = ftState === 'C' || !isBlindAudioPrompt || showW;

        return Object.freeze({
            mode: 'filter-test',
            isEnglish: Boolean(isEnglish),
            normalizedDisplayMode,
            ftState,
            wordText,
            wordFontSize: computeWordFontSize(wordText, isEnglish, !showW),
            readingText,
            meaningText,
            isMaskedWord: !showW,
            isMaskedReading: !showK,
            isMaskedMeaning: !showM,
            showWordRow,
            showReadingRow: true,
            showMeaningRow: true,
            showType: ftState === 'C',
            showRoots: Boolean(isEnglish && entry.roots && showRootsPref),
            maskRootText: !showW,
            maskRootMeaning: !showM,
            showExample: ftState === 'C',
            showBlindAudio: isBlindAudioPrompt,
            showBlindHint: false,
            showSpeaker: ftState === 'C' || (showA && normalizedDisplayMode !== 'audio'),
            showStar: ftState === 'C',
            autoSpeakOnRender:
                (ftState === 'A' && normalizedDisplayMode === 'audio') ||
                (ftState === 'B' && ftHint === 'audio')
        });
    };

    /**
     * Stage default display policy + single-card temporary override (P1-1).
     * Mirrors TypeWords usePracticeDisplayPolicy: overrides never mutate base
     * and automatically reset when phaseKey / card changes.
     */
    const resolveDisplayPolicy = (mode = 'pendulum', displayMode = 'all', isEnglish = false) => {
        if (mode === 'pendulum' || mode === 'rote-learning') {
            if (displayMode === 'word') {
                return Object.freeze({ maskWord: false, maskReading: true, maskMeaning: true });
            }
            if (displayMode === 'kana') {
                return Object.freeze({
                    maskWord: true,
                    maskReading: false,
                    maskMeaning: true
                });
            }
            if (displayMode === 'meaning') {
                return Object.freeze({ maskWord: true, maskReading: true, maskMeaning: false });
            }
            return Object.freeze({ maskWord: false, maskReading: false, maskMeaning: false });
        }
        if (mode === 'dual-track' && displayMode === 'spell') {
            return Object.freeze({
                maskWord: Boolean(isEnglish),
                maskReading: !isEnglish,
                maskMeaning: false
            });
        }
        return Object.freeze({ maskWord: false, maskReading: false, maskMeaning: false });
    };

    const applyDisplayOverride = (basePolicy, override = {}) => {
        const base = basePolicy || { maskWord: false, maskReading: false, maskMeaning: false };
        if (override && override.peekAll) {
            return Object.freeze({
                maskWord: false,
                maskReading: false,
                maskMeaning: false,
                isPeeking: true
            });
        }
        return Object.freeze({
            maskWord: typeof override?.maskWord === 'boolean' ? override.maskWord : Boolean(base.maskWord),
            maskReading: typeof override?.maskReading === 'boolean' ? override.maskReading : Boolean(base.maskReading),
            maskMeaning: typeof override?.maskMeaning === 'boolean' ? override.maskMeaning : Boolean(base.maskMeaning),
            isPeeking: false
        });
    };

    const createDisplayPolicyController = () => {
        let phaseKey = '';
        let basePolicy = resolveDisplayPolicy('pendulum', 'all', false);
        let override = { maskWord: null, maskReading: null, maskMeaning: null, peekAll: false };

        const resetOverrides = () => {
            override = { maskWord: null, maskReading: null, maskMeaning: null, peekAll: false };
        };

        const setPhase = (nextPhaseKey, mode, displayMode, isEnglish) => {
            const nextKey = String(nextPhaseKey || '');
            basePolicy = resolveDisplayPolicy(mode, displayMode, isEnglish);
            if (nextKey !== phaseKey) {
                phaseKey = nextKey;
                resetOverrides();
            }
            return applyDisplayOverride(basePolicy, override);
        };

        const toggleField = field => {
            if (!['maskWord', 'maskReading', 'maskMeaning'].includes(field)) {
                return applyDisplayOverride(basePolicy, override);
            }
            const current = applyDisplayOverride(basePolicy, override)[field];
            const next = !current;
            override = {
                ...override,
                [field]: next === basePolicy[field] ? null : next
            };
            return applyDisplayOverride(basePolicy, override);
        };

        const setPeekAll = enabled => {
            override = { ...override, peekAll: Boolean(enabled) };
            return applyDisplayOverride(basePolicy, override);
        };

        const getEffective = () => applyDisplayOverride(basePolicy, override);

        return Object.freeze({
            setPhase,
            toggleField,
            setPeekAll,
            resetOverrides,
            getEffective
        });
    };

    return Object.freeze({
        MASK_FIXED,
        isMaskedText,
        stripKanaBrackets,
        computeWordFontSize,
        buildFsrsCardViewModel,
        buildFilterTestCardViewModel,
        resolveDisplayPolicy,
        applyDisplayOverride,
        createDisplayPolicyController
    });
});
