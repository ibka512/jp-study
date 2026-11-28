(function (root, factory) {
    const api = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    root.ZhongriVisibleTypingCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const SHIFT_FULL_WIDTH_CHARACTER_CODE_MAP = Object.freeze({
        '！': Object.freeze(['Digit1']),
        '￥': Object.freeze(['Digit4']),
        '…': Object.freeze(['Digit6']),
        '（': Object.freeze(['Digit9']),
        '—': Object.freeze(['Minus']),
        '？': Object.freeze(['Slash']),
        '》': Object.freeze(['Period']),
        '《': Object.freeze(['Comma']),
        '“': Object.freeze(['Quote']),
        '”': Object.freeze(['Quote']),
        '：': Object.freeze(['Semicolon']),
        '）': Object.freeze(['Digit0'])
    });

    const FULL_WIDTH_CHARACTER_CODE_MAP = Object.freeze({
        '、': Object.freeze(['Slash']),
        '。': Object.freeze(['Period']),
        '，': Object.freeze(['Comma']),
        '‘': Object.freeze(['Quote']),
        '’': Object.freeze(['Quote']),
        '；': Object.freeze(['Semicolon']),
        '【': Object.freeze(['BracketLeft']),
        '】': Object.freeze(['BracketRight']),
        'ー': Object.freeze(['Minus'])
    });

    const ROMAJI_MAP = Object.freeze({
        a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
        ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
        ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
        sa: 'さ', shi: 'し', si: 'し', su: 'す', se: 'せ', so: 'そ',
        za: 'ざ', ji: 'じ', zi: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
        ta: 'た', chi: 'ち', ti: 'ち', tsu: 'つ', tu: 'つ', te: 'て', to: 'と',
        da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
        na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
        ha: 'は', hi: 'ひ', fu: 'ふ', hu: 'ふ', he: 'へ', ho: 'ほ',
        ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
        pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
        ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
        ya: 'や', yu: 'ゆ', yo: 'よ',
        ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
        wa: 'わ', wo: 'を', nn: 'ん', "n'": 'ん', '-': 'ー',
        kya: 'きゃ', kyu: 'きゅ', kyo: 'きょ',
        gya: 'ぎゃ', gyu: 'ぎゅ', gyo: 'ぎょ',
        sha: 'しゃ', sya: 'しゃ', shu: 'しゅ', syu: 'しゅ', sho: 'しょ', syo: 'しょ', she: 'しぇ', sye: 'しぇ',
        ja: 'じゃ', zya: 'じゃ', jya: 'じゃ', ju: 'じゅ', zyu: 'じゅ', jyu: 'じゅ', jo: 'じょ', zyo: 'じょ', jyo: 'じょ', je: 'じぇ', zye: 'じぇ', jye: 'じぇ',
        cha: 'ちゃ', tya: 'ちゃ', cya: 'ちゃ', chu: 'ちゅ', tyu: 'ちゅ', cyu: 'ちゅ', cho: 'ちょ', tyo: 'ちょ', cyo: 'ちょ', che: 'ちぇ', tye: 'ちぇ', cye: 'ちぇ',
        nya: 'にゃ', nyu: 'にゅ', nyo: 'にょ',
        hya: 'ひゃ', hyu: 'ひゅ', hyo: 'ひょ',
        bya: 'びゃ', byu: 'びゅ', byo: 'びょ',
        pya: 'ぴゃ', pyu: 'ぴゅ', pyo: 'ぴょ',
        mya: 'みゃ', myu: 'みゅ', myo: 'みょ',
        rya: 'りゃ', ryu: 'りゅ', ryo: 'りょ',
        fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ', fyu: 'ふゅ',
        wi: 'うぃ', we: 'うぇ', wha: 'うぁ', whi: 'うぃ', whe: 'うぇ', who: 'うぉ',
        thi: 'てぃ', tha: 'てゃ', thu: 'てゅ', the: 'てぇ', tho: 'てょ',
        dhi: 'でぃ', dha: 'でゃ', dhu: 'でゅ', dhe: 'でぇ', dho: 'でょ',
        tsa: 'つぁ', tsi: 'つぃ', tse: 'つぇ', tso: 'つぉ',
        va: 'ゔぁ', vi: 'ゔぃ', vu: 'ゔ', ve: 'ゔぇ', vo: 'ゔぉ',
        xa: 'ぁ', xi: 'ぃ', xu: 'ぅ', xe: 'ぇ', xo: 'ぉ', xtu: 'っ', xtsu: 'っ', xya: 'ゃ', xyu: 'ゅ', xyo: 'ょ',
        la: 'ぁ', li: 'ぃ', lu: 'ぅ', le: 'ぇ', lo: 'ぉ', ltu: 'っ', ltsu: 'っ', lya: 'ゃ', lyu: 'ゅ', lyo: 'ょ'
    });

    const ROMAJI_KEYS = Object.keys(ROMAJI_MAP);

    function toHiragana(text) {
        return String(text || '').replace(/[\u30A1-\u30F6]/g, ch =>
            String.fromCharCode(ch.charCodeAt(0) - 0x60)
        );
    }

    function normalizeFullWidthKey(event, targetChar = '') {
        const key = String(event?.key ?? '');
        const code = String(event?.code ?? '');
        const shiftKey = Boolean(event?.shiftKey);
        const map = shiftKey ? SHIFT_FULL_WIDTH_CHARACTER_CODE_MAP : FULL_WIDTH_CHARACTER_CODE_MAP;
        if (targetChar && map[targetChar] && map[targetChar].includes(code)) {
            return targetChar;
        }
        if (key === '’' || key === '‘') return "'";
        if (key === '—' || key === '–' || key === '－') return '-';
        return key;
    }

    function normalizeEnglishTarget(word) {
        return String(word || '')
            .replace(/[’‘`]/g, "'")
            .replace(/[‐‑‒–—]/g, '-')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function normalizeJapaneseTarget(wordObj) {
        const raw = typeof wordObj === 'string'
            ? wordObj
            : String(wordObj?.kana || wordObj?.word || '');
        const cleaned = raw
            .replace(/[【】\[\]()（）\s]/g, '')
            .split(/[\/／・,，;；]/)[0] || '';
        return cleaned.trim();
    }

    function resolveTargetText(wordObj) {
        const lang = wordObj?.lang === 'en' ? 'en' : 'ja';
        return lang === 'en'
            ? normalizeEnglishTarget(wordObj?.word)
            : normalizeJapaneseTarget(wordObj);
    }

    function isCharMatch(inputChar, targetChar, { lang = 'en', ignoreCase = true } = {}) {
        if (targetChar === undefined || inputChar === undefined) return false;
        if (lang === 'ja') {
            return toHiragana(inputChar) === toHiragana(targetChar);
        }
        const normIn = inputChar === '’' || inputChar === '‘' ? "'" : inputChar;
        const normTarget = targetChar === '’' || targetChar === '‘' ? "'" : targetChar;
        if (!ignoreCase) return normIn === normTarget;
        return normIn.toLowerCase() === normTarget.toLowerCase();
    }

    function getCharacterStates(inputText, targetText, { lang = 'en', ignoreCase = true } = {}) {
        const inputChars = Array.from(String(inputText || ''));
        const targetChars = Array.from(String(targetText || ''));
        return targetChars.map((targetChar, index) => {
            if (index >= inputChars.length) {
                return { char: targetChar, targetChar, status: 'pending', index };
            }
            const actualChar = inputChars[index];
            const correct = isCharMatch(actualChar, targetChar, { lang, ignoreCase });
            return {
                char: correct ? targetChar : actualChar,
                targetChar,
                status: correct ? 'correct' : 'wrong',
                index
            };
        });
    }

    function getFirstWrongIndex(inputText, targetText, options = {}) {
        const inputChars = Array.from(String(inputText || ''));
        const targetChars = Array.from(String(targetText || ''));
        for (let i = 0; i < inputChars.length; i++) {
            if (!isCharMatch(inputChars[i], targetChars[i], options)) {
                return i;
            }
        }
        return -1;
    }

    function isWholeInputComplete(inputText, targetText) {
        return Array.from(String(inputText || '')).length >= Array.from(String(targetText || '')).length &&
            Array.from(String(targetText || '')).length > 0;
    }

    function isWholeInputCorrect(inputText, targetText, options = {}) {
        const inChars = Array.from(String(inputText || ''));
        const targetChars = Array.from(String(targetText || ''));
        if (targetChars.length === 0 || inChars.length !== targetChars.length) {
            return false;
        }
        return getFirstWrongIndex(inputText, targetText, options) === -1;
    }

    function getInputAfterWrongBackspace(inputText, targetText, options = {}) {
        const inChars = Array.from(String(inputText || ''));
        const firstWrong = getFirstWrongIndex(inputText, targetText, options);
        if (firstWrong === -1) {
            return inChars.slice(0, -1).join('');
        }
        return inChars.slice(0, firstWrong).join('');
    }

    function hasRomajiPrefix(prefix) {
        return ROMAJI_KEYS.some(key => key.startsWith(prefix));
    }

    function consumeRomajiBuffer(raw, buffer, targetText) {
        let nextRaw = raw;
        let nextBuf = buffer;
        let safety = 0;
        while (nextBuf.length > 0 && safety++ < 10) {
            if (nextBuf.length >= 2 && nextBuf[0] === nextBuf[1] && !"aeiouyn'-".includes(nextBuf[0])) {
                nextRaw += 'っ';
                nextBuf = nextBuf.slice(1);
                continue;
            }
            if (nextBuf.length >= 2 && nextBuf[0] === 'n' && nextBuf[1] !== 'n' && !"aeiouy'-".includes(nextBuf[1])) {
                nextRaw += 'ん';
                nextBuf = nextBuf.slice(1);
                continue;
            }
            let matched = false;
            for (let len = Math.min(4, nextBuf.length); len > 0; len--) {
                const chunk = nextBuf.slice(0, len);
                if (ROMAJI_MAP[chunk]) {
                    nextRaw += ROMAJI_MAP[chunk];
                    nextBuf = nextBuf.slice(len);
                    matched = true;
                    break;
                }
            }
            if (matched) continue;
            if (!hasRomajiPrefix(nextBuf)) {
                nextBuf = nextBuf.slice(1);
                continue;
            }
            break;
        }

        // If the final pending 'n' matches the exact final character 'ん/ン' of target, auto-commit it.
        const targetChars = Array.from(String(targetText || ''));
        const rawChars = Array.from(nextRaw);
        if (
            nextBuf === 'n' &&
            rawChars.length === targetChars.length - 1 &&
            toHiragana(targetChars[targetChars.length - 1]) === 'ん'
        ) {
            nextRaw += 'ん';
            nextBuf = '';
        }

        return { raw: nextRaw, buffer: nextBuf };
    }

    function extractFirstExampleText(exampleStr) {
        if (!exampleStr || typeof exampleStr !== 'string') return '';
        const firstBlock = exampleStr
            .split(/\s*\|\|\s*/)
            .map(s => s.trim())
            .filter(Boolean)[0];
        if (!firstBlock) return '';

        let divider = firstBlock.search(/\s\/\s/);
        if (divider !== -1) {
            divider += 1;
        } else {
            for (let i = firstBlock.lastIndexOf('/'); i !== -1; i = firstBlock.lastIndexOf('/', i - 1)) {
                const tail = firstBlock.slice(i + 1).trim();
                if (tail && /[\u3400-\u4DBF\u4E00-\u9FFF]/.test(tail)) {
                    divider = i;
                    break;
                }
            }
        }
        const original = divider > 0 ? firstBlock.slice(0, divider).trim() : firstBlock;
        return original
            .replace(/\$/g, '')
            .replace(/\\overset\{[^\}]+\}\{([^\}]+)\}/g, '$1')
            .trim();
    }

    function shouldChainFirstSentence({
        autoPlayFirstSentence = false,
        mode = '',
        isWordVisible = false,
        exampleText = '',
        alreadyPlayed = false
    } = {}) {
        const supportedMode = mode === 'pendulum' || mode === 'rote-learning';
        return Boolean(
            autoPlayFirstSentence &&
            supportedMode &&
            isWordVisible &&
            !alreadyPlayed &&
            extractFirstExampleText(exampleText)
        );
    }

    function createVisibleTypingSession({
        word,
        repeatTarget = 1,
        ignoreCase = true,
        spaceCooldownTime = 300,
        now = () => Date.now()
    } = {}) {
        const lang = word?.lang === 'en' ? 'en' : 'ja';
        const targetText = resolveTargetText(word);
        const targetChars = Array.from(targetText);
        const safeRepeatTarget = Math.max(1, Math.min(5, Number.parseInt(repeatTarget, 10) || 1));
        const safeCooldown = Math.max(0, Number.parseInt(spaceCooldownTime, 10) || 0);

        const state = {
            lang,
            targetText,
            inputText: '',
            romajiBuffer: '',
            locked: false,
            completed: false,
            repeatDone: 0,
            repeatTarget: safeRepeatTarget,
            typoCount: 0,
            completedAt: 0
        };

        const getSnapshot = () => {
            const charStates = getCharacterStates(state.inputText, state.targetText, {
                lang: state.lang,
                ignoreCase
            });
            const hasWrong = getFirstWrongIndex(state.inputText, state.targetText, {
                lang: state.lang,
                ignoreCase
            }) !== -1;
            return {
                lang: state.lang,
                targetText: state.targetText,
                inputText: state.inputText,
                romajiBuffer: state.romajiBuffer,
                locked: state.locked,
                completed: state.completed,
                hasWrong,
                repeatDone: state.repeatDone,
                repeatTarget: state.repeatTarget,
                typoCount: state.typoCount,
                completedAt: state.completedAt,
                charStates
            };
        };

        const resetForNextRepeat = () => {
            state.inputText = '';
            state.romajiBuffer = '';
            state.locked = false;
            state.completed = false;
            return getSnapshot();
        };

        const canSpaceAdvance = () => {
            if (!state.completed) return false;
            if (!state.completedAt || safeCooldown <= 0) return true;
            return (now() - state.completedAt) >= safeCooldown;
        };

        const backspace = ({ smartWrongJump = true } = {}) => {
            if (state.completed) {
                return { handled: false, event: 'ignored', snapshot: getSnapshot() };
            }
            if (state.lang === 'ja' && state.romajiBuffer.length > 0) {
                state.romajiBuffer = state.romajiBuffer.slice(0, -1);
                state.locked = false;
                return { handled: true, event: 'backspace', snapshot: getSnapshot() };
            }
            if (!state.inputText) {
                return { handled: false, event: 'ignored', snapshot: getSnapshot() };
            }
            const nextInput = smartWrongJump
                ? getInputAfterWrongBackspace(state.inputText, state.targetText, {
                    lang: state.lang,
                    ignoreCase
                })
                : Array.from(state.inputText).slice(0, -1).join('');
            state.inputText = nextInput;
            state.locked = false;
            return { handled: true, event: 'backspace', snapshot: getSnapshot() };
        };

        const inputKey = (event) => {
            if (!targetChars.length) {
                return { handled: false, event: 'ignored', snapshot: getSnapshot() };
            }
            const rawKey = String(event?.key ?? '');
            const code = String(event?.code ?? '');

            if (rawKey === 'Backspace' || code === 'Backspace') {
                return backspace({ smartWrongJump: state.locked });
            }

            if (state.completed) {
                return { handled: false, event: 'ignored', snapshot: getSnapshot() };
            }

            if (state.locked) {
                return { handled: true, event: 'wrong_locked', snapshot: getSnapshot() };
            }

            const currentLen = Array.from(state.inputText).length;
            const targetChar = targetChars[currentLen] || '';
            const normalizedKey = normalizeFullWidthKey(event, targetChar);

            if (state.lang === 'en') {
                if (normalizedKey === ' ' || code === 'Space') {
                    // Only consume space during English typing if target actually contains space
                    if (!state.targetText.includes(' ') || !state.inputText || state.inputText.endsWith(' ')) {
                        return { handled: false, event: 'ignored', snapshot: getSnapshot() };
                    }
                    state.inputText += ' ';
                } else if (normalizedKey.length === 1 && /^[a-zA-Z0-9\-',.!?]$/.test(normalizedKey)) {
                    state.inputText += normalizedKey;
                    if (!isCharMatch(normalizedKey, targetChar, { lang: 'en', ignoreCase })) {
                        state.typoCount += 1;
                    }
                } else {
                    return { handled: false, event: 'ignored', snapshot: getSnapshot() };
                }
            } else {
                // Japanese romaji-to-kana visible typing
                const lower = normalizedKey.toLowerCase();
                if (lower.length === 1 && /^[a-z'-]$/.test(lower)) {
                    const prevRawLen = Array.from(state.inputText).length;
                    const res = consumeRomajiBuffer(state.inputText, state.romajiBuffer + lower, state.targetText);
                    state.inputText = res.raw;
                    state.romajiBuffer = res.buffer;
                    const newChars = Array.from(state.inputText);
                    for (let i = prevRawLen; i < newChars.length; i++) {
                        if (!isCharMatch(newChars[i], targetChars[i], { lang: 'ja', ignoreCase: true })) {
                            state.typoCount += 1;
                        }
                    }
                } else if (normalizedKey === 'ー' || (normalizedKey.length === 1 && /[\u3041-\u3096\u30A1-\u30F6]/.test(normalizedKey))) {
                    const idx = Array.from(state.inputText).length;
                    state.inputText += normalizedKey;
                    state.romajiBuffer = '';
                    if (!isCharMatch(normalizedKey, targetChars[idx], { lang: 'ja', ignoreCase: true })) {
                        state.typoCount += 1;
                    }
                } else {
                    return { handled: false, event: 'ignored', snapshot: getSnapshot() };
                }
            }

            // Clamp overflow beyond target length
            const nextChars = Array.from(state.inputText);
            if (nextChars.length > targetChars.length) {
                state.inputText = nextChars.slice(0, targetChars.length).join('');
                state.romajiBuffer = '';
            }

            if (isWholeInputComplete(state.inputText, state.targetText)) {
                state.romajiBuffer = '';
                if (isWholeInputCorrect(state.inputText, state.targetText, { lang: state.lang, ignoreCase })) {
                    state.repeatDone += 1;
                    if (state.repeatDone < state.repeatTarget) {
                        state.completed = false;
                        state.locked = true;
                        return { handled: true, event: 'completed_repeat', snapshot: getSnapshot() };
                    }
                    state.completed = true;
                    state.locked = true;
                    state.completedAt = now();
                    return { handled: true, event: 'completed_word', snapshot: getSnapshot() };
                } else {
                    state.locked = true;
                    return { handled: true, event: 'wrong_locked', snapshot: getSnapshot() };
                }
            }

            return { handled: true, event: 'typed', snapshot: getSnapshot() };
        };

        return Object.freeze({
            inputKey,
            backspace,
            canSpaceAdvance,
            resetForNextRepeat,
            getSnapshot
        });
    }

    return Object.freeze({
        SHIFT_FULL_WIDTH_CHARACTER_CODE_MAP,
        FULL_WIDTH_CHARACTER_CODE_MAP,
        toHiragana,
        normalizeFullWidthKey,
        normalizeEnglishTarget,
        normalizeJapaneseTarget,
        resolveTargetText,
        isCharMatch,
        getCharacterStates,
        getFirstWrongIndex,
        isWholeInputComplete,
        isWholeInputCorrect,
        getInputAfterWrongBackspace,
        extractFirstExampleText,
        shouldChainFirstSentence,
        createVisibleTypingSession
    });
});
