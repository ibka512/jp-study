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

    function resolveKeyFromCode(code, shiftKey = false) {
        const letterMatch = /^Key([A-Z])$/.exec(String(code || ''));
        if (letterMatch) {
            return shiftKey ? letterMatch[1] : letterMatch[1].toLowerCase();
        }
        if (code === 'Space') return ' ';
        if (code === 'Minus') return '-';
        if (code === 'Quote') return "'";
        return '';
    }

    function normalizeFullWidthKey(event, targetChar = '') {
        let key = String(event?.key ?? '');
        const code = String(event?.code ?? '');
        const shiftKey = Boolean(event?.shiftKey);
        const map = shiftKey ? SHIFT_FULL_WIDTH_CHARACTER_CODE_MAP : FULL_WIDTH_CHARACTER_CODE_MAP;
        if (targetChar && map[targetChar] && map[targetChar].includes(code)) {
            return targetChar;
        }
        if (key === 'Process' || key === 'Unidentified' || event?.isComposing) {
            const fromCode = resolveKeyFromCode(code, shiftKey);
            if (fromCode) return fromCode;
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
        let primary = raw
            .replace(/[【】\[\]()（）\s]/g, '')
            .split(/[\/／・,，;；]/)[0] || '';
        const headword = typeof wordObj === 'object' && wordObj?.word
            ? String(wordObj.word).replace(/\s+/g, '')
            : '';
        if (headword && primary.startsWith(headword) && primary.length > headword.length) {
            primary = primary.slice(headword.length);
        }
        const kanaOnly = primary.replace(/[\u3400-\u4DBF\u4E00-\u9FFF々〆ヶ]/g, '').trim();
        return kanaOnly || primary.trim();
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

    function getCharacterStates(inputText, targetText, { lang = 'en', ignoreCase = true, wrongChar = '' } = {}) {
        const inputChars = Array.from(String(inputText || ''));
        const targetChars = Array.from(String(targetText || ''));
        return targetChars.map((targetChar, index) => {
            if (index < inputChars.length) {
                const actualChar = inputChars[index];
                const correct = isCharMatch(actualChar, targetChar, { lang, ignoreCase });
                return {
                    char: correct ? targetChar : actualChar,
                    targetChar,
                    status: correct ? 'correct' : 'wrong',
                    index
                };
            }
            if (index === inputChars.length && wrongChar) {
                return {
                    char: targetChar,
                    targetChar,
                    status: 'wrong',
                    index
                };
            }
            return { char: targetChar, targetChar, status: 'pending', index };
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
            wrongChar: '',
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
                ignoreCase,
                wrongChar: state.wrongChar
            });
            const hasWrong = Boolean(state.wrongChar) || getFirstWrongIndex(state.inputText, state.targetText, {
                lang: state.lang,
                ignoreCase
            }) !== -1;
            return {
                lang: state.lang,
                targetText: state.targetText,
                inputText: state.inputText,
                romajiBuffer: state.romajiBuffer,
                wrongChar: state.wrongChar,
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
            state.wrongChar = '';
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
            if (state.wrongChar) {
                state.wrongChar = '';
                state.locked = false;
                return { handled: true, event: 'backspace', snapshot: getSnapshot() };
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
                return backspace({ smartWrongJump: true });
            }

            if (state.completed) {
                return { handled: false, event: 'ignored', snapshot: getSnapshot() };
            }

            const currentLen = Array.from(state.inputText).length;
            const targetChar = targetChars[currentLen] || '';
            const normalizedKey = normalizeFullWidthKey(event, targetChar);

            if (state.lang === 'en') {
                if (normalizedKey === ' ' || code === 'Space') {
                    if (!state.targetText.includes(' ') || !state.inputText || state.inputText.endsWith(' ')) {
                        return { handled: false, event: 'ignored', snapshot: getSnapshot() };
                    }
                    if (!isCharMatch(' ', targetChar, { lang: 'en', ignoreCase })) {
                        state.typoCount += 1;
                        state.wrongChar = ' ';
                        return { handled: true, event: 'wrong_char', snapshot: getSnapshot() };
                    }
                    state.wrongChar = '';
                    state.inputText += ' ';
                } else if (normalizedKey.length === 1 && /^[a-zA-Z0-9\-',.!?]$/.test(normalizedKey)) {
                    if (!isCharMatch(normalizedKey, targetChar, { lang: 'en', ignoreCase })) {
                        state.typoCount += 1;
                        state.wrongChar = normalizedKey;
                        return { handled: true, event: 'wrong_char', snapshot: getSnapshot() };
                    }
                    state.wrongChar = '';
                    state.inputText += normalizedKey;
                } else {
                    return { handled: false, event: 'ignored', snapshot: getSnapshot() };
                }
            } else {
                // Japanese romaji-to-kana visible typing
                const lower = normalizedKey.toLowerCase();
                if (lower.length === 1 && /^[a-z'-]$/.test(lower)) {
                    const prevRaw = state.inputText;
                    const prevRawLen = Array.from(prevRaw).length;
                    const res = consumeRomajiBuffer(prevRaw, state.romajiBuffer + lower, state.targetText);
                    const newChars = Array.from(res.raw);
                    let mismatch = false;
                    for (let i = prevRawLen; i < newChars.length; i++) {
                        if (!isCharMatch(newChars[i], targetChars[i], { lang: 'ja', ignoreCase: true })) {
                            mismatch = true;
                            break;
                        }
                    }
                    if (mismatch) {
                        state.typoCount += 1;
                        state.wrongChar = newChars[prevRawLen] || lower;
                        state.romajiBuffer = '';
                        return { handled: true, event: 'wrong_char', snapshot: getSnapshot() };
                    }
                    state.wrongChar = '';
                    state.inputText = res.raw;
                    state.romajiBuffer = res.buffer;
                } else if (normalizedKey === 'ー' || (normalizedKey.length === 1 && /[\u3041-\u3096\u30A1-\u30F6]/.test(normalizedKey))) {
                    const idx = Array.from(state.inputText).length;
                    if (!isCharMatch(normalizedKey, targetChars[idx], { lang: 'ja', ignoreCase: true })) {
                        state.typoCount += 1;
                        state.wrongChar = normalizedKey;
                        state.romajiBuffer = '';
                        return { handled: true, event: 'wrong_char', snapshot: getSnapshot() };
                    }
                    state.wrongChar = '';
                    state.inputText += normalizedKey;
                    state.romajiBuffer = '';
                } else {
                    return { handled: false, event: 'ignored', snapshot: getSnapshot() };
                }
            }

            if (isWholeInputComplete(state.inputText, state.targetText)) {
                state.romajiBuffer = '';
                state.wrongChar = '';
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

    function parseRootFormula(rootsStr) {
        if (!rootsStr || typeof rootsStr !== 'string') return [];
        return rootsStr
            .split('-')
            .map(part => part.trim())
            .filter(Boolean)
            .map((part, index) => {
                const match = part.match(/^(.+?)\((.+?)\)$/);
                const rawToken = (match ? match[1] : part).trim();
                const meaning = (match ? match[2] : '').trim();
                const variants = rawToken
                    .split(/[\/／,，]/)
                    .map(v => v.replace(/[^a-zA-Z]/g, '').toLowerCase())
                    .filter(Boolean);
                return {
                    index,
                    raw: part,
                    token: rawToken,
                    variants,
                    meaning,
                    colorIdx: index % 3
                };
            })
            .filter(item => item.variants.length > 0);
    }

    function alignWordToRoots(word, rootsStr) {
        const target = normalizeEnglishTarget(word);
        const targetLower = target.toLowerCase();
        if (!targetLower || /\s/.test(targetLower)) return null;
        const morphemes = parseRootFormula(rootsStr);
        if (morphemes.length < 2) return null;

        // 1. Fast exact concatenation match (supports slash variants like ab/abs)
        const tryExact = (mIdx, pos, acc) => {
            if (mIdx === morphemes.length) {
                return pos === targetLower.length ? acc : null;
            }
            const m = morphemes[mIdx];
            for (const v of m.variants) {
                if (targetLower.startsWith(v, pos)) {
                    const next = tryExact(mIdx + 1, pos + v.length, [
                        ...acc,
                        {
                            index: m.index,
                            start: pos,
                            end: pos + v.length,
                            text: target.slice(pos, pos + v.length),
                            token: m.token,
                            meaning: m.meaning,
                            colorIdx: m.colorIdx
                        }
                    ]);
                    if (next) return next;
                }
            }
            return null;
        };

        const exactSegments = tryExact(0, 0, []);
        if (exactSegments) {
            const charToSegment = new Array(target.length);
            exactSegments.forEach(seg => {
                for (let i = seg.start; i < seg.end; i++) charToSegment[i] = seg.index;
            });
            return { exact: true, segments: exactSegments, charToSegment };
        }

        // 2. Stem-change tolerant alignment (e.g. academic => academy-ic, decision => de-cid-ion)
        const n = morphemes.length;
        const starts = new Array(n).fill(-1);
        const ends = new Array(n).fill(-1);

        let leftPos = 0;
        let leftIdx = 0;
        while (leftIdx < n) {
            const m = morphemes[leftIdx];
            let bestLen = 0;
            for (const v of m.variants) {
                if (targetLower.startsWith(v, leftPos) && v.length > bestLen) {
                    bestLen = v.length;
                }
            }
            if (bestLen > 0 && leftPos + bestLen <= targetLower.length - (n - 1 - leftIdx)) {
                starts[leftIdx] = leftPos;
                ends[leftIdx] = leftPos + bestLen;
                leftPos += bestLen;
                leftIdx++;
            } else {
                break;
            }
        }

        let rightPos = targetLower.length;
        let rightIdx = n - 1;
        while (rightIdx >= leftIdx) {
            const m = morphemes[rightIdx];
            let bestLen = 0;
            for (const v of m.variants) {
                if (rightPos - v.length >= leftPos && targetLower.slice(rightPos - v.length, rightPos) === v && v.length > bestLen) {
                    bestLen = v.length;
                }
            }
            if (bestLen > 0 && rightPos - bestLen >= leftPos + (rightIdx - leftIdx)) {
                starts[rightIdx] = rightPos - bestLen;
                ends[rightIdx] = rightPos;
                rightPos -= bestLen;
                rightIdx--;
            } else {
                break;
            }
        }

        const remainingCount = rightIdx - leftIdx + 1;
        const remainingLen = rightPos - leftPos;
        if (remainingCount > 0) {
            if (remainingLen < remainingCount) return null;
            if (remainingCount === 1) {
                const mid = morphemes[leftIdx];
                const slice = targetLower.slice(leftPos, rightPos);
                const hasSimilarity = mid.variants.some(v => {
                    let common = 0;
                    const lim = Math.min(v.length, slice.length);
                    while (common < lim && v[common] === slice[common]) common++;
                    return common >= Math.min(2, v.length, slice.length);
                });
                if (!hasSimilarity) return null;
                starts[leftIdx] = leftPos;
                ends[leftIdx] = rightPos;
            } else {
                const totalWeight = morphemes
                    .slice(leftIdx, rightIdx + 1)
                    .reduce((sum, m) => sum + (m.variants[0]?.length || 1), 0);
                let cursor = leftPos;
                for (let i = leftIdx; i <= rightIdx; i++) {
                    const isLastMid = i === rightIdx;
                    const weight = morphemes[i].variants[0]?.length || 1;
                    const minLeftForRest = rightIdx - i;
                    const span = isLastMid
                        ? rightPos - cursor
                        : Math.max(1, Math.min(rightPos - cursor - minLeftForRest, Math.round((remainingLen * weight) / totalWeight)));
                    starts[i] = cursor;
                    ends[i] = cursor + span;
                    cursor += span;
                }
            }
        }

        const segments = [];
        const charToSegment = new Array(target.length);
        let expectedPos = 0;
        for (let i = 0; i < n; i++) {
            if (starts[i] !== expectedPos || ends[i] <= starts[i] || ends[i] > target.length) {
                return null;
            }
            const m = morphemes[i];
            segments.push({
                index: m.index,
                start: starts[i],
                end: ends[i],
                text: target.slice(starts[i], ends[i]),
                token: m.token,
                meaning: m.meaning,
                colorIdx: m.colorIdx
            });
            for (let c = starts[i]; c < ends[i]; c++) charToSegment[c] = m.index;
            expectedPos = ends[i];
        }
        if (expectedPos !== target.length) return null;
        return { exact: false, segments, charToSegment };
    }

    function getMorphemeTypingStates(alignment, typedLen = 0, { completed = false, hasWrong = false } = {}) {
        if (!alignment || !Array.isArray(alignment.segments)) return [];
        return alignment.segments.map(seg => {
            if (completed || typedLen >= seg.end) {
                return { index: seg.index, status: 'done' };
            }
            if (typedLen >= seg.start && typedLen < seg.end) {
                return { index: seg.index, status: hasWrong ? 'wrong' : 'active' };
            }
            return { index: seg.index, status: 'pending' };
        });
    }

    function buildRootScaffoldState(word, rootsStr, stage = 0) {
        const alignment = alignWordToRoots(word, rootsStr);
        const morphemes = alignment ? alignment.segments : parseRootFormula(rootsStr);
        if (!morphemes.length) return null;

        const maxStage = morphemes.length + 1;
        const safeStage = Math.max(0, Math.min(maxStage, Number.parseInt(stage, 10) || 0));
        const items = morphemes.map((m, idx) => {
            const len = typeof m.start === 'number' && typeof m.end === 'number'
                ? Math.max(1, m.end - m.start)
                : Math.max(1, (m.variants?.[0] || m.token || '').length);
            const revealedMeaning = safeStage >= 1;
            const revealedText = safeStage >= idx + 2;
            const displayText = revealedText
                ? (m.token || m.text)
                : '■'.repeat(len);
            return {
                index: idx,
                text: displayText,
                realText: m.token || m.text,
                meaning: revealedMeaning ? m.meaning : '■■■',
                realMeaning: m.meaning,
                revealedText,
                revealedMeaning,
                length: len,
                colorIdx: idx % 3
            };
        });

        return {
            stage: safeStage,
            maxStage,
            isFullyRevealed: safeStage >= maxStage,
            items
        };
    }

    return Object.freeze({
        SHIFT_FULL_WIDTH_CHARACTER_CODE_MAP,
        FULL_WIDTH_CHARACTER_CODE_MAP,
        toHiragana,
        resolveKeyFromCode,
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
        createVisibleTypingSession,
        parseRootFormula,
        alignWordToRoots,
        getMorphemeTypingStates,
        buildRootScaffoldState
    });
});
