/**
  * 钟日 - 核心控制逻辑
 */

const DATA_SCHEMA_VERSION = 8;
const MIGRATION_SNAPSHOT_KEY = 'migrationSafetySnapshot_v1';

const BACKUP_FORMAT_ID = 'zhongri-backup';
const BACKUP_FORMAT_VERSION = 10;

const USER_WORDS_STORAGE_KEY = 'userWords_v1';
const WORD_OVERRIDES_STORAGE_KEY = 'wordOverrides_v1';
const LEGACY_WORD_DB_STORAGE_KEY = 'myWordDB_v3';
const WORD_STORAGE_VERSION_KEY = 'wordStorageVersion';
const WORD_STORAGE_VERSION = 1;
const PRE_IMPORT_RESTORE_KEY = 'preImportRestorePoint_v1';

const ROTE_CORE = globalThis.RoteLearningCore;

if (!ROTE_CORE) {
    throw new Error('循环强记核心模块加载失败');
}

const BACKUP_PREFERENCE_KEYS = Object.freeze([
    'theme',
    'langMode',
    'autoSpeak',
    'showRoots',
        'darkBtnStyle',
    'postponeTested',
    'wordOrderMode',
    'skipMastered',
    'useRubyRender',
    'ttsEngine',
    'displayMode',
    'lastCustomGroupTxt',
    'lastCustomGroupVal',
    'lastSelectedFolder',
    'lastTestDisplay',
    'lastTestRange'
]);
const escapeHTML = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag]));
};

const escapeRegExp = (str) => {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};


const cloneDataValue = value => {
    if (typeof structuredClone === 'function') {
        try {
            return structuredClone(value);
        } catch (error) {}
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

const createRandomWordId = () => {
    if (
        typeof crypto !== 'undefined' &&
        typeof crypto.randomUUID === 'function'
    ) {
        return `user-${crypto.randomUUID()}`;
    }

    return (
        `user-${Date.now().toString(36)}-` +
        Math.random().toString(36).slice(2, 10)
    );
};

const createFallbackBuiltInWordId = entry => {
    const lang = entry?.lang === 'en' ? 'en' : 'ja';
    const word = String(entry?.word || '').normalize('NFKC').trim();
    const reading = lang === 'en'
        ? String(entry?.phonetic || '').normalize('NFKC').trim()
        : String(entry?.kana || '').normalize('NFKC').trim();

    return `builtin-${lang}-${hashStableText(`${lang}|${word}|${reading}`)}`;
};

const ensureStableWordId = (
    entry,
    { builtInHint = false } = {}
) => {
    if (!entry || typeof entry !== 'object') {
        return '';
    }

    const existingId = String(entry._id || '').trim();

    if (existingId) {
        entry._id = existingId;
        return existingId;
    }

    const isBuiltIn =
        builtInHint ||
        entry.builtIn === true;

    entry._id = isBuiltIn
        ? createFallbackBuiltInWordId(entry)
        : createRandomWordId();

    return entry._id;
};

const getStableWordId = entry => {
    return ensureStableWordId(entry, {
        builtInHint: entry?.builtIn === true
    });
};

const normalizeWordAliases = value => {
    const source = Array.isArray(value)
        ? value
        : String(value ?? '').split(/[、,，;；|｜/]+/);

    return [
        ...new Set(
            source
                .map(item => String(item ?? '').normalize('NFKC').trim())
                .filter(Boolean)
        )
    ].slice(0, 24);
};

const normalizeReviewStatus = value => {
    const normalized = String(value || '').trim().toLowerCase();

    return ['draft', 'reviewed', 'verified'].includes(normalized)
        ? normalized
        : 'draft';
};

const normalizeWordSources = value => {
    const source = Array.isArray(value)
        ? value
        : String(value ?? '').split(/[\n;；|｜]+/);

    return [
        ...new Set(
            source
                .map(item => {
                    if (typeof item === 'string') {
                        return item.trim();
                    }

                    if (item && typeof item === 'object') {
                        return String(
                            item.name ||
                            item.source ||
                            item.title ||
                            ''
                        ).trim();
                    }

                    return '';
                })
                .filter(Boolean)
        )
    ].slice(0, 20);
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

const normalizeHeadword = (value, lang = 'ja') => {
    let text = normalizeEntryText(value)
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/\s*([-‐‑‒–—])\s*/g, '-')
        .trim();

    if (lang === 'en') {
        text = text
            .replace(/\s*'\s*/g, "'")
            .replace(/\s+/g, ' ');
    }

    return text;
};

const normalizeWordType = (value) => {
    const aliasMap = new Map([
        ['名', '名词'],
        ['名词', '名词'],
        ['名詞', '名词'],
        ['noun', '名词'],
        ['n', '名词'],
        ['动', '动词'],
        ['動', '动词'],
        ['动词', '动词'],
        ['動詞', '动词'],
        ['verb', '动词'],
        ['v', '动词'],
        ['形', '形容词'],
        ['形容词', '形容词'],
        ['形容詞', '形容词'],
        ['adjective', '形容词'],
        ['adj', '形容词'],
        ['形动', '形容动词'],
        ['形動', '形容动词'],
        ['形容动词', '形容动词'],
        ['形容動詞', '形容动词'],
        ['ナ形容词', '形容动词'],
        ['ナ形容詞', '形容动词'],
        ['副', '副词'],
        ['副词', '副词'],
        ['副詞', '副词'],
        ['adverb', '副词'],
        ['adv', '副词'],
        ['代', '代词'],
        ['代词', '代词'],
        ['代詞', '代词'],
        ['pronoun', '代词'],
        ['pron', '代词'],
        ['介词', '介词'],
        ['介詞', '介词'],
        ['前置词', '介词'],
        ['前置詞', '介词'],
        ['preposition', '介词'],
        ['prep', '介词'],
        ['连词', '连词'],
        ['連詞', '连词'],
        ['接续词', '连词'],
        ['接続詞', '连词'],
        ['conjunction', '连词'],
        ['conj', '连词'],
        ['助词', '助词'],
        ['助詞', '助词'],
        ['助动词', '助动词'],
        ['助動詞', '助动词'],
        ['感叹词', '感叹词'],
        ['感嘆詞', '感叹词'],
        ['冠词', '冠词'],
        ['冠詞', '冠词'],
        ['article', '冠词'],
        ['短语', '短语'],
        ['词组', '短语'],
        ['固定搭配', '固定搭配'],
        ['惯用语', '惯用语'],
        ['慣用句', '惯用语'],
        ['熟语', '熟语'],
        ['熟語', '熟语'],
        ['数词', '数词'],
        ['数詞', '数词'],
        ['量词', '量词'],
        ['量詞', '量词'],
        ['接头词', '接头词'],
        ['接頭辞', '接头词'],
        ['接尾词', '接尾词'],
        ['接尾辞', '接尾词']
    ]);

    const source = normalizeEntryText(value)
        .replace(/[／/、，,;；|＋+&＆]+/g, '・')
        .replace(/\s*・\s*/g, '・')
        .replace(/・{2,}/g, '・')
        .replace(/^・|・$/g, '');

    const parts = source
        .split('・')
        .map(part => {
            let token = part
                .replace(/\s+/g, '')
                .replace(/[.]$/g, '')
                .replace(/名詞/g, '名词')
                .replace(/動詞/g, '动词')
                .replace(/形容詞/g, '形容词')
                .replace(/形容動詞/g, '形容动词')
                .replace(/副詞/g, '副词')
                .replace(/代詞/g, '代词')
                .replace(/介詞/g, '介词')
                .replace(/接続詞/g, '连词')
                .replace(/助動詞/g, '助动词')
                .replace(/自動詞/g, '自动词')
                .replace(/他動詞/g, '他动词')
                .replace(/サ変/g, 'サ变');

            const lower = token.toLowerCase();

            if (aliasMap.has(token)) {
                return aliasMap.get(token);
            }

            if (aliasMap.has(lower)) {
                return aliasMap.get(lower);
            }

            const suruMatch = token.match(
                /^サ变(?:动词)?(?:する)?([自他]?)$/
            );

            if (suruMatch) {
                return `サ变动词する${suruMatch[1] || ''}`;
            }

            if (/^形动(?:词)?$/.test(token)) {
                return '形容动词';
            }

            return token;
        })
        .filter(Boolean);

    return [...new Set(parts)].join('・');
};

const normalizeMeaningText = (value) => {
    const source = normalizeEntryText(value, false)
        .replace(/\r?\n+/g, '；')
        .replace(/[、,，;；]+/g, '；')
        .replace(/\s*；\s*/g, '；')
        .replace(/；{2,}/g, '；')
        .replace(/^；|；$/g, '');

    return [...new Set(
        source
            .split('；')
            .map(part => part.trim())
            .filter(Boolean)
    )].join('；');
};

const normalizePhoneticText = (value) => {
    let text = normalizeEntryText(value, false)
        .replace(/^\s*[\/\[【(（]+/, '')
        .replace(/[\/\]】)）]+\s*$/, '')
        .trim();

    if (!text) {
        return '';
    }

    text = text.replace(/\s+/g, ' ');

    return `/${text}/`;
};

const normalizeKanaText = (value) => {
    return normalizeEntryText(value)
        .replace(/[【】\[\]()（）]/g, '')
        .replace(/\s+/g, '');
};

const normalizeRootsText = (value) => {
    const text = normalizeEntryText(value, false)
        .replace(/[（]/g, '(')
        .replace(/[）]/g, ')')
        .replace(/[‐‑‒–—−]+/g, '-')
        .replace(/\s*-\s*/g, '-')
        .replace(/-{2,}/g, '-')
        .trim();

    if (
        /^(?:无|暂无|不确定|无法可靠拆解|none|null|n\/a)$/i
            .test(text)
    ) {
        return '';
    }

    return text;
};

const WORD_LEVEL_OPTIONS = Object.freeze({
    ja: Object.freeze(['N5', 'N4', 'N3', 'N2', 'N1']),
    en: Object.freeze(['CET-4', 'CET-6'])
});

const DIFFICULTY_LABELS = Object.freeze({
    0: '难度未定',
    1: '入门',
    2: '较易',
    3: '中等',
    4: '较难',
    5: '困难'
});

const normalizeWordLevel = (value, lang = 'ja') => {
    const raw = normalizeEntryText(value)
        .toUpperCase()
        .replace(/\s+/g, '')
        .replace(/^JLPT[-_]?/, '')
        .replace(/^CET[-_]?([46])$/, 'CET-$1')
        .replace(/^大学英语([四六])级$/, match => {
            return match.includes('四') ? 'CET-4' : 'CET-6';
        });

    if (!raw) {
        return '';
    }

    if (lang === 'ja') {
        const normalized = /^N[1-5]$/.test(raw)
            ? raw
            : '';

        return normalized;
    }

    if (/^(?:CET-?4|四级)$/.test(raw)) {
        return 'CET-4';
    }

    if (/^(?:CET-?6|六级)$/.test(raw)) {
        return 'CET-6';
    }

    return '';
};

const normalizeSourceLevels = (value, lang = 'ja') => {
    const source = Array.isArray(value) ? value : [];

    return source
        .map(item => {
            if (typeof item === 'string') {
                const level = normalizeWordLevel(item, lang);
                return level ? { source: '', level } : null;
            }

            if (!item || typeof item !== 'object') {
                return null;
            }

            const level = normalizeWordLevel(item.level, lang);

            if (!level) {
                return null;
            }

            return {
                source: String(item.source || '').trim(),
                level
            };
        })
        .filter(Boolean)
        .slice(0, 20);
};

const normalizeWordDifficulty = value => {
    const parsed = Number.parseInt(value, 10);

    if (!Number.isFinite(parsed)) {
        return 0;
    }

    return Math.min(5, Math.max(0, parsed));
};

const normalizeWordTags = value => {
    const source = Array.isArray(value)
        ? value
        : String(value ?? '')
            .split(/[、,，;；|｜/]+/);

    return [
        ...new Set(
            source
                .map(tag => normalizeEntryText(tag))
                .filter(Boolean)
        )
    ].slice(0, 12);
};

const WORD_FREQUENCY_VALUES = Object.freeze([
    '高频',
    '中频',
    '低频'
]);

const WORD_SPECIAL_TAG_PRIORITY = Object.freeze([
    '片假名词',
    '拟声拟态',
    '缩略语',
    '口语',
    '尊敬语',
    '谦让语',
    '礼貌语',
    '惯用表达',
    '接头词',
    '接尾词',
    '构词成分',
    '异体写法'
]);

const normalizeWordFrequency = value => {
    const normalized = String(value ?? '')
        .normalize('NFKC')
        .trim()
        .toLowerCase();

    if (!normalized) {
        return '';
    }

    if (
        normalized.includes('高频') ||
        normalized === 'high' ||
        normalized.includes('high-frequency') ||
        normalized.includes('high frequency')
    ) {
        return '高频';
    }

    if (
        normalized.includes('中频') ||
        normalized === 'medium' ||
        normalized === 'mid' ||
        normalized.includes('medium-frequency') ||
        normalized.includes('medium frequency')
    ) {
        return '中频';
    }

    if (
        normalized.includes('低频') ||
        normalized === 'low' ||
        normalized.includes('low-frequency') ||
        normalized.includes('low frequency')
    ) {
        return '低频';
    }

    return '';
};

const isRedundantWordMetadataTag = (tag, lang = 'ja') => {
    const normalized = normalizeEntryText(tag)
        .normalize('NFKC')
        .trim();
    const compactTag = normalized
        .toUpperCase()
        .replace(/[\s_-]+/g, '');

    return Boolean(
        normalizeWordLevel(normalized, lang) ||
        normalizeWordFrequency(normalized) ||
        /^JLPT(?:词汇)?$/i.test(normalized) ||
        /^(?:大学英语|大学英语词汇|四六级|CET)$/i.test(normalized) ||
        compactTag === '难度未定' ||
        Object.values(DIFFICULTY_LABELS).includes(normalized)
    );
};

const normalizeWordPitch = value => {
    return normalizeEntryText(value || '', false)
        .replace(/\s+/g, '')
        .slice(0, 24);
};

const CIRCLED_PITCH_NUMBERS = Object.freeze([
    '⓪', '①', '②', '③', '④', '⑤', '⑥',
    '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬',
    '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳'
]);

const formatWordPitchDisplay = value => {
    const normalized = normalizeWordPitch(value);

    if (!normalized) {
        return '';
    }

    const numberMatches = normalized.match(/\d{1,2}/g);

    if (numberMatches?.length) {
        return numberMatches
            .map(token => {
                const number = Number.parseInt(token, 10);

                return CIRCLED_PITCH_NUMBERS[number] || token;
            })
            .join(' ');
    }

    const circledMatches = normalized.match(
        /[⓪①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]/g
    );

    if (circledMatches?.length) {
        return circledMatches.join(' ');
    }

    return normalized;
};

const normalizeWordSpecialTags = value => {
    const normalized = normalizeWordTags(value).map(tag => {
        if (/カタカナ|片假名/.test(tag)) {
            return '片假名词';
        }

        if (/オノマトペ|拟声|擬声|拟态|擬態/.test(tag)) {
            return '拟声拟态';
        }

        if (/略語|缩略|縮略/.test(tag)) {
            return '缩略语';
        }

        if (/口語|口语|口頭語|口头语/.test(tag)) {
            return '口语';
        }

        if (/尊敬語|尊敬语/.test(tag)) {
            return '尊敬语';
        }

        if (/謙譲語|谦让语|謙讓語/.test(tag)) {
            return '谦让语';
        }

        if (/丁寧語|礼貌语|禮貌語/.test(tag)) {
            return '礼貌语';
        }

        if (/慣用|惯用|成句/.test(tag)) {
            return '惯用表达';
        }

        if (/接頭|接头/.test(tag)) {
            return '接头词';
        }

        if (/接尾/.test(tag)) {
            return '接尾词';
        }

        if (/造語|构词|構詞|造词|造詞/.test(tag)) {
            return '构词成分';
        }

        if (/異体|异体|異表記|异写|異寫/.test(tag)) {
            return '异体写法';
        }

        return tag;
    });

    const unique = [...new Set(normalized.filter(Boolean))];
    const priority = new Map(
        WORD_SPECIAL_TAG_PRIORITY.map((tag, index) => [tag, index])
    );

    return unique
        .sort((left, right) => {
            const leftIndex = priority.has(left)
                ? priority.get(left)
                : Number.MAX_SAFE_INTEGER;
            const rightIndex = priority.has(right)
                ? priority.get(right)
                : Number.MAX_SAFE_INTEGER;

            if (leftIndex !== rightIndex) {
                return leftIndex - rightIndex;
            }

            return left.localeCompare(right, 'zh-CN');
        })
        .slice(0, 12);
};

const normalizeWordSourceText = (value, maxLength = 160) => {
    return normalizeEntryText(value || '').slice(0, maxLength);
};

const getDifficultyLabel = value => {
    return DIFFICULTY_LABELS[
        normalizeWordDifficulty(value)
    ] || DIFFICULTY_LABELS[0];
};

const getWordMetadataHTML = (
    entry = {},
    {
        compact = false,
        showUnassigned = false,
        includeTags = false,
        specialTagLimit = null
    } = {}
) => {
    const lang = entry.lang === 'en' ? 'en' : 'ja';
    const level = normalizeWordLevel(entry.level, lang);
    const frequency = normalizeWordFrequency(entry.frequency);
    const difficulty = normalizeWordDifficulty(
        entry.difficulty
    );
    const tags = normalizeWordTags(entry.tags)
        .filter(tag => !isRedundantWordMetadataTag(tag, lang));
    const specialTags = normalizeWordSpecialTags(
        entry.specialTags
    ).filter(tag => !isRedundantWordMetadataTag(tag, lang));
    const maxSpecialTags = Number.isInteger(specialTagLimit)
        ? Math.max(0, specialTagLimit)
        : (compact ? 1 : 2);
    const chips = [];

    if (level) {
        chips.push(
            `<span class="word-meta-chip is-level">${escapeHTML(level)}</span>`
        );
    } else if (showUnassigned) {
        chips.push(
            '<span class="word-meta-chip is-muted">未分级</span>'
        );
    }

    if (frequency) {
        const frequencyClass = {
            '高频': 'frequency-high',
            '中频': 'frequency-medium',
            '低频': 'frequency-low'
        }[frequency] || '';

        chips.push(
            `<span class="word-meta-chip is-frequency ${frequencyClass}">` +
                `${escapeHTML(frequency)}` +
            '</span>'
        );
    }

    if (difficulty > 0) {
        chips.push(
            `<span class="word-meta-chip is-difficulty difficulty-${difficulty}">` +
                `${compact ? difficulty + '·' + escapeHTML(getDifficultyLabel(difficulty)) : escapeHTML(getDifficultyLabel(difficulty))}` +
            '</span>'
        );
    } else if (showUnassigned && !compact) {
        chips.push(
            '<span class="word-meta-chip is-muted">难度未定</span>'
        );
    }

    specialTags
        .slice(0, maxSpecialTags)
        .forEach(tag => {
            chips.push(
                `<span class="word-meta-chip is-special">${escapeHTML(tag)}</span>`
            );
        });

    if (includeTags) {
        const specialTagSet = new Set(specialTags);

        tags
            .filter(tag => {
                if (normalizeWordFrequency(tag)) {
                    return false;
                }

                const normalizedSpecial =
                    normalizeWordSpecialTags([tag])[0] || '';

                return !specialTagSet.has(normalizedSpecial);
            })
            .slice(0, 4)
            .forEach(tag => {
                chips.push(
                    `<span class="word-meta-chip is-tag">${escapeHTML(tag)}</span>`
                );
            });
    }

    return chips.join('');
};

const validateVocabularyData = (entries = []) => {
    const issues = [];
    const idMap = new Map();
    const identityMap = new Map();

    const addIssue = (
        severity,
        index,
        word,
        message,
        field = ''
    ) => {
        issues.push({
            severity,
            index,
            word: String(word || `第 ${index + 1} 条`),
            message,
            field
        });
    };

    entries.forEach((rawEntry, index) => {
        const raw = rawEntry && typeof rawEntry === 'object'
            ? rawEntry
            : {};
        const lang = raw.lang === 'en' ? 'en' : 'ja';
        const normalized = normalizeWordEntry(
            raw,
            { preserveWord: true }
        );
        const wordLabel = normalized.word || `第 ${index + 1} 条`;
        const id = String(raw._id || '').trim();

        if (!id) {
            addIssue(
                'error',
                index,
                wordLabel,
                '缺少稳定 ID（_id）',
                '_id'
            );
        } else if (idMap.has(id)) {
            addIssue(
                'error',
                index,
                wordLabel,
                `稳定 ID 与第 ${idMap.get(id) + 1} 条重复：${id}`,
                '_id'
            );
        } else {
            idMap.set(id, index);
        }

        if (!normalized.word) {
            addIssue('error', index, wordLabel, '缺少单词', 'word');
        }

        if (!normalized.type) {
            addIssue('error', index, wordLabel, '缺少词性', 'type');
        }

        if (!normalized.meaning) {
            addIssue('error', index, wordLabel, '缺少中文释义', 'meaning');
        }

        const identity =
            `${lang}::${normalizeHeadword(normalized.word, lang).toLowerCase()}`;

        if (normalized.word) {
            if (identityMap.has(identity)) {
                const firstIndex = identityMap.get(identity);
                const bothBuiltIn =
                    raw.builtIn === true &&
                    entries[firstIndex]?.builtIn === true;

                addIssue(
                    bothBuiltIn ? 'error' : 'warning',
                    index,
                    wordLabel,
                    `与第 ${firstIndex + 1} 条同语言同词重复`,
                    'word'
                );
            } else {
                identityMap.set(identity, index);
            }
        }

        const rawLevel = normalizeEntryText(raw.level || '');
        const normalizedLevel = normalizeWordLevel(rawLevel, lang);

        if (rawLevel && !normalizedLevel) {
            addIssue(
                'error',
                index,
                wordLabel,
                lang === 'en'
                    ? '级别只能是 CET-4 或 CET-6'
                    : '级别只能是 N5、N4、N3、N2 或 N1',
                'level'
            );
        } else if (raw.builtIn === true && !normalizedLevel) {
            addIssue(
                'error',
                index,
                wordLabel,
                '内置词缺少级别',
                'level'
            );
        }

        const rawDifficulty = raw.difficulty;
        const difficulty = normalizeWordDifficulty(rawDifficulty);

        if (
            rawDifficulty !== undefined &&
            rawDifficulty !== null &&
            String(rawDifficulty).trim() !== '' &&
            Number(rawDifficulty) !== 0 &&
            (
                !Number.isInteger(Number(rawDifficulty)) ||
                Number(rawDifficulty) < 1 ||
                Number(rawDifficulty) > 5
            )
        ) {
            addIssue(
                'error',
                index,
                wordLabel,
                '难度必须是 1～5 的整数',
                'difficulty'
            );
        } else if (raw.builtIn === true && difficulty === 0) {
            addIssue(
                'error',
                index,
                wordLabel,
                '内置词缺少难度',
                'difficulty'
            );
        }

        if (lang === 'ja') {
            const containsKanji =
                /[\u3400-\u4DBF\u4E00-\u9FFF々〆ヶ]/
                    .test(normalized.word);

            if (containsKanji && !normalized.kana) {
                addIssue(
                    'error',
                    index,
                    wordLabel,
                    '日语汉字词缺少假名',
                    'kana'
                );
            }
        } else if (!normalized.phonetic) {
            addIssue(
                raw.builtIn === true ? 'error' : 'warning',
                index,
                wordLabel,
                '英语词缺少音标',
                'phonetic'
            );
        }

        if (!normalized.example) {
            addIssue(
                'warning',
                index,
                wordLabel,
                '缺少例句',
                'example'
            );
        } else {
            const exampleBlocks = normalized.example
                .split('||')
                .map(block => block.trim())
                .filter(Boolean);

            const missingTranslation = exampleBlocks.some(block => {
                const divider = findExampleDividerIndex(block);
                return divider <= 0 || divider >= block.length - 1;
            });

            if (missingTranslation) {
                addIssue(
                    'warning',
                    index,
                    wordLabel,
                    '部分例句缺少中文翻译',
                    'example'
                );
            }
        }
    });

    const errors = issues.filter(issue => {
        return issue.severity === 'error';
    });
    const warnings = issues.filter(issue => {
        return issue.severity === 'warning';
    });

    return {
        total: entries.length,
        japanese: entries.filter(entry => {
            return (entry?.lang || 'ja') === 'ja';
        }).length,
        english: entries.filter(entry => {
            return entry?.lang === 'en';
        }).length,
        builtIn: entries.filter(entry => {
            return entry?.builtIn === true;
        }).length,
        errors,
        warnings,
        issues,
        passed: errors.length === 0
    };
};

const findExampleDividerIndex = (block) => {
    const spacedDivider = block.search(/\s\/\s/);

    if (spacedDivider !== -1) {
        return spacedDivider + 1;
    }

    for (
        let index = block.lastIndexOf('/');
        index !== -1;
        index = block.lastIndexOf('/', index - 1)
    ) {
        const translation = block
            .slice(index + 1)
            .trim();

        if (
            translation &&
            /[\u3400-\u4DBF\u4E00-\u9FFF]/
                .test(translation)
        ) {
            return index;
        }
    }

    return -1;
};

const normalizeExampleBlock = (value) => {
    const block = normalizeEntryText(value, false)
        .replace(/\r?\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!block) {
        return '';
    }

    const dividerIndex = findExampleDividerIndex(block);

    if (dividerIndex <= 0 || dividerIndex >= block.length - 1) {
        return block;
    }

    const original = block
        .slice(0, dividerIndex)
        .trim();

    const translation = block
        .slice(dividerIndex + 1)
        .trim();

    if (!original || !translation) {
        return block;
    }

    return `${original} / ${translation}`;
};

const normalizeExampleText = (value, lang = '') => {
    const source = String(value ?? '')
        .normalize('NFC')
        .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
        .replace(/／/g, '/')
        .replace(/[｜|]{2}/g, '||')
        .trim();

    if (!source) {
        return '';
    }

    let blocks = source
        .split(/\s*\|\|\s*/)
        .map(block => block.trim())
        .filter(Boolean);

    const allBlocksHaveNoDivider = blocks.every(block => {
        return findExampleDividerIndex(block) === -1;
    });

    /*
     * 只在能够明确判断“原文 + 中文翻译”时，
     * 才把相邻的两个 || 区块配成一条例句。
     * 这样不会把两个独立外语例句误拼成一组翻译。
     */
    const canPairAsBilingual =
        blocks.length >= 2 &&
        blocks.length % 2 === 0 &&
        allBlocksHaveNoDivider &&
        blocks.every((block, index) => {
            if (index % 2 === 1) {
                return /[\u3400-\u4DBF\u4E00-\u9FFF]/
                    .test(block);
            }

            if (lang === 'en') {
                return /[A-Za-z]/.test(block);
            }

            if (lang === 'ja') {
                return /[ぁ-ゖァ-ヺー]/u.test(block);
            }

            return false;
        });

    if (canPairAsBilingual) {
        const pairedBlocks = [];

        for (let index = 0; index < blocks.length; index += 2) {
            pairedBlocks.push(
                `${blocks[index]} / ${blocks[index + 1]}`
            );
        }

        blocks = pairedBlocks;
    }

    const normalizedBlocks = blocks
        .map(normalizeExampleBlock)
        .filter(Boolean);

    return [...new Set(normalizedBlocks)].join(' || ');
};

const normalizeWordEntry = (
    entry = {},
    { preserveWord = false } = {}
) => {
    const lang = entry.lang === 'en' ? 'en' : 'ja';
    const normalizedTags = normalizeWordTags(entry.tags);
    const explicitSpecialTags = Array.isArray(entry.specialTags)
        ? entry.specialTags.length > 0
        : Boolean(String(entry.specialTags || '').trim());
    const specialTagSource = explicitSpecialTags
        ? entry.specialTags
        : normalizedTags;
    const normalizedSpecialTags = normalizeWordSpecialTags(
        specialTagSource
    );
    const frequency =
        normalizeWordFrequency(entry.frequency) ||
        normalizeWordFrequency(
            normalizedTags.join(' ')
        );

    const normalized = {
        ...entry,
        lang,
        word: preserveWord
            ? String(entry.word ?? '')
            : normalizeHeadword(entry.word, lang),
        type: normalizeWordType(entry.type),
        meaning: normalizeMeaningText(entry.meaning),
        example: normalizeExampleText(entry.example, lang),
        folder: normalizeEntryText(entry.folder || ''),
        level: normalizeWordLevel(entry.level, lang),
        difficulty: normalizeWordDifficulty(entry.difficulty),
        tags: normalizedTags,
        frequency,
        pitch: lang === 'ja'
            ? normalizeWordPitch(
                entry.pitch || entry.vocabPitch
            )
            : '',
        specialTags: explicitSpecialTags
            ? normalizedSpecialTags
            : normalizedSpecialTags.filter(tag => {
                return WORD_SPECIAL_TAG_PRIORITY.includes(tag);
            }),
        sourceId: normalizeWordSourceText(
            entry.sourceId || entry.sourceID,
            128
        ),
        sourceName: normalizeWordSourceText(
            entry.sourceName,
            120
        ),
        sourceVersion: normalizeWordSourceText(
            entry.sourceVersion,
            80
        ),
        aliases: normalizeWordAliases(entry.aliases),
        sourceLevels: normalizeSourceLevels(entry.sourceLevels, lang),
        reviewStatus: normalizeReviewStatus(entry.reviewStatus),
        source: normalizeWordSources(entry.source),
        dataVersion: Math.max(
            1,
            Number.parseInt(entry.dataVersion, 10) || 1
        ),
        builtIn: entry.builtIn === true
    };

    if (lang === 'en') {
        normalized.phonetic = normalizePhoneticText(
            entry.phonetic
        );
        normalized.roots = normalizeRootsText(entry.roots);
    } else {
        normalized.kana = normalizeKanaText(entry.kana);
        normalized.roots = '';
    }

    return normalized;
};

const getWordEntryQuality = (entry = {}) => {
    const normalized = normalizeWordEntry(entry);
    const items = [];

    const add = (level, text, field = '') => {
        items.push({ level, text, field });
    };

    const missingBaseFields = [];

    if (!normalized.word) {
        missingBaseFields.push('单词');
        add('error', '缺少单词', 'word');
    }

    if (!normalized.type) {
        missingBaseFields.push('词性');
        add('error', '缺少词性', 'type');
    }

    if (!normalized.meaning) {
        missingBaseFields.push('释义');
        add('error', '缺少中文释义', 'meaning');
    }

    if (missingBaseFields.length === 0) {
        add('ok', '单词、词性和释义完整');
    }

    const typeParts = normalized.type
        .split('・')
        .filter(Boolean);

    const knownTypePattern =
        /^(?:名词|动词|形容词|形容动词|副词|代词|介词|连词|助词|助动词|感叹词|冠词|自动词|他动词|短语|固定搭配|惯用语|熟语|数词|量词|接头词|接尾词|サ变动词する[自他]?)$/;

    if (
        normalized.type &&
        typeParts.some(type => {
            return !knownTypePattern.test(type);
        })
    ) {
        add(
            'warn',
            '有无法识别的词性，请确认写法',
            'type'
        );
    } else if (normalized.type) {
        add('ok', '词性格式可以识别');
    }

    if (normalized.lang === 'en') {
        if (!normalized.phonetic) {
            add('warn', '缺少音标，仍可保存', 'phonetic');
        } else if (!/^\/[^/]+\/$/.test(normalized.phonetic)) {
            add('warn', '音标格式建议核对', 'phonetic');
        } else {
            add('ok', '音标格式正常');
        }

        if (normalized.roots) {
            add(
                'warn',
                'AI 词根仅供辅助，建议人工核对',
                'roots'
            );
        } else {
            add('info', '词根不确定时留空是正常的');
        }
    } else {
        const containsKanji =
            /[\u3400-\u4DBF\u4E00-\u9FFF々〆ヶ]/
                .test(normalized.word);

        if (containsKanji && !normalized.kana) {
            add('warn', '汉字词缺少假名', 'kana');
        } else if (
            normalized.kana &&
            !/^[ぁ-ゖァ-ヺー・]+$/u.test(normalized.kana)
        ) {
            add('warn', '假名中含有异常字符', 'kana');
        } else if (normalized.kana) {
            add('ok', '假名格式正常');
        }
    }

    if (!normalized.example) {
        add('warn', '缺少例句，仍可保存', 'example');
    } else {
        const exampleBlocks = normalized.example
            .split('||')
            .map(block => block.trim())
            .filter(Boolean);

        const allHaveTranslation = exampleBlocks.every(block => {
            const index = findExampleDividerIndex(block);

            return (
                index > 0 &&
                index < block.length - 1
            );
        });

        if (allHaveTranslation) {
            add('ok', '例句包含对应翻译');
        } else {
            add(
                'warn',
                '部分例句缺少中文翻译',
                'example'
            );
        }
    }

    if (normalized.level) {
        add('ok', `级别：${normalized.level}`);
    } else if (normalized.builtIn) {
        add('warn', '内置词缺少级别', 'level');
    } else {
        add('info', '个人词汇可以不填写考试级别');
    }

    if (normalized.difficulty > 0) {
        add(
            'ok',
            `难度：${getDifficultyLabel(normalized.difficulty)}`
        );
    } else if (normalized.builtIn) {
        add('warn', '内置词缺少难度', 'difficulty');
    } else {
        add('info', '尚未设置难度');
    }

    return {
        normalized,
        items,
        errorCount: items.filter(item => {
            return item.level === 'error';
        }).length,
        warningCount: items.filter(item => {
            return item.level === 'warn';
        }).length
    };
};

const JAPANESE_RUBY_INSTRUCTION = `

【日语注音格式规则】
凡是回答中出现日语，所有包含汉字的日语词语都必须标注假名读音。

请严格使用“日语原文《假名读音》”格式，例如：
日本語《にほんご》
勉強《べんきょう》する
食《た》べる
気持《きも》ち
一人《ひとり》

必须根据句子语境选择正确读音。
纯平假名、纯片假名和中文汉字不要标注。
不要直接输出 HTML、ruby 标签、括号读音或其他注音格式。
日语汉字不能遗漏注音。`;

const withJapaneseRubyInstruction = (prompt = '') => {
    const basePrompt = prompt || '你是精通多语言的私人外教，耐心解答用户的任何语言学习问题。';

    if (basePrompt.includes('【日语注音格式规则】')) {
        return basePrompt;
    }

    return basePrompt + JAPANESE_RUBY_INSTRUCTION;
};

const renderAIMessageHTML = (text, targetWord = '') => {
    /*
     * AI 流式输出偶尔会混入零宽字符，
     * 或使用外观相似的全角括号。
     * 先统一格式，再开始转义和渲染。
     */
    const normalizedText = String(text || '')
        .normalize('NFC')
        .replace(
            /[\u200B-\u200D\u2060\uFEFF]/g,
            ''
        )
        .replace(/[〈＜«]/g, '《')
        .replace(/[〉＞»]/g, '》')
        .replace(/《[\s\u00A0]+/g, '《')
        .replace(/[\s\u00A0]+》/g, '》');

    let html = escapeHTML(normalizedText);

    const safeTargetWord =
        escapeHTML(
            String(targetWord || '')
                .trim()
                .replace(
                    /[\u200B-\u200D\u2060\uFEFF]/g,
                    ''
                )
        );

    const rubyBlocks = [];

    /*
     * 将暂存的日语注音结构保存成占位符，
     * 避免后续标题、加粗和目标词高亮破坏 ruby。
     */
    const storeRuby = (
        match,
        baseText,
        readingText
    ) => {
        const cleanBase =
            String(baseText || '')
                .trim();

        const cleanReading =
            String(readingText || '')
                .trim();

        const containsKanji =
            /[\u3400-\u4DBF\u4E00-\u9FFF々〆ヶ]/
                .test(cleanBase);

        if (
            !containsKanji ||
            !cleanReading
        ) {
            return match;
        }

        const token =
            `@@JP_RUBY_${rubyBlocks.length}@@`;

        let rubyHTML =
            '<ruby class="jp-ruby">' +
                '<rb>' +
                    cleanBase +
                '</rb>' +
                '<rt>' +
                    cleanReading +
                '</rt>' +
            '</ruby>';

        /*
         * 目标词继续保留原来的胶囊高亮。
         */
        if (
            safeTargetWord &&
            (
                safeTargetWord.includes(
                    cleanBase
                ) ||
                cleanBase.includes(
                    safeTargetWord
                )
            )
        ) {
            rubyHTML =
                '<span class="ai-key-chip ai-key-chip-ruby">' +
                    rubyHTML +
                '</span>';
        }

        rubyBlocks.push(rubyHTML);

        return token;
    };

        /*
     * 只匹配紧贴注音括号的词。
     *
     * 可以正确处理：
     * 道《みち》
     * 道 《みち》
     * 食べる《たべる》
     *
     * 同时避免把“夜の道《みち》”
     * 整体误认为一个词。
     */
    html = html.replace(
        /([\u3400-\u4DBF\u4E00-\u9FFF々〆ヶ0-9０-９]+(?:[ぁ-ゖァ-ヺー]{1,6})?)[ \t\u00A0\u3000]*《([ぁ-ゖァ-ヺー・ \t\u00A0\u3000]+?)》/g,
        storeRuby
    );

    html = html
        .replace(
            /### (.*?)\n/g,
            '<h4>$1</h4>\n'
        )
        .replace(
            /\*\*(.*?)\*\*/g,
            '<strong>$1</strong>'
        )
        .replace(
            /\n/g,
            '<br>'
        );

    /*
     * 高亮没有被注音标记包住的目标词。
     */
    if (safeTargetWord) {
        const wordPattern =
            new RegExp(
                escapeRegExp(
                    safeTargetWord
                ),
                'g'
            );

        html = html.replace(
            wordPattern,
            '<span class="ai-key-chip">' +
                safeTargetWord +
            '</span>'
        );
    }

    /*
     * 恢复暂存的 ruby 注音结构。
     */
    html = html.replace(
        /@@JP_RUBY_(\d+)@@/g,
        (match, index) => {
            return (
                rubyBlocks[
                    Number(index)
                ] ||
                ''
            );
        }
    );

    return html;
};

window.createStarParticles = (el) => {
    let rect = el.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
        let p = document.createElement('div'); 
        p.className = 'star-particle';
        p.style.left = (rect.left + rect.width / 2) + 'px'; 
        p.style.top = (rect.top + rect.height / 2) + 'px';
        let angle = Math.random() * Math.PI * 2; 
        let dist = 25 + Math.random() * 25;
        p.style.setProperty('--tx', Math.cos(angle) * dist + 'px'); 
        p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
        document.body.appendChild(p); 
        setTimeout(() => p.remove(), 400);
    }
};

// 新增：用于记录打开弹窗前最后操作的 DOM 元素
let previousFocusElement = null;

window.toggleModal = (id, show) => {
    let el = document.getElementById(id);
    if (!el) return;

    if (!show && id === 'ai-sheet-overlay') {
        if (
            typeof Controller !== 'undefined' &&
            typeof Controller._saveCurrentChat === 'function'
        ) {
            Controller._saveCurrentChat();
        }

        const inputEl = document.getElementById('ai-chat-input');

        if (inputEl) {
            inputEl.value = '';
        }
    }
    
    if (show) {
        // 1. 焦点借出：仅在当前没有任何弹窗开启时记录焦点
        if (document.querySelectorAll('.modal-overlay.active').length === 0) {
            previousFocusElement = document.activeElement;
        }
        el.classList.add('active');
        
        // 2. 焦点入场：延迟等待 CSS 动画生效后，自动聚焦弹窗内第一个可交互元素
        setTimeout(() => {
            let focusable = Array.from(el.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
                                 .filter(node => node.offsetParent !== null);
            
            if (focusable.length > 0 && !el.contains(document.activeElement)) {
                focusable[0].focus();
            }
        }, 100);
        
    } else {
        el.classList.remove('active');
        
        // 3. 焦点归还：当所有弹窗都关闭时，将焦点还给触发弹窗的原元素
        if (document.querySelectorAll('.modal-overlay.active').length === 0 && previousFocusElement) {
            previousFocusElement.focus();
            previousFocusElement = null;
        }
    }
    
    if (document.querySelectorAll('.modal-overlay.active').length > 0) {
        document.body.classList.add('modal-open');
    } else {
        document.body.classList.remove('modal-open');
    }
};


window.showToast = (msg) => {
    let t = document.getElementById('toast');
    t.innerText = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
};

window.showConfirm = (title, msg, onConfirm) => {
    document.getElementById('dialog-title').innerHTML = title;
    document.getElementById('dialog-msg').innerHTML = msg;
    window.toggleModal('dialog-overlay', true);
    document.getElementById('dialog-confirm').onclick = () => { Hardware.vibrate(15); window.toggleModal('dialog-overlay', false); onConfirm(); };
    document.getElementById('dialog-cancel').onclick = () => { Hardware.vibrate(10); window.toggleModal('dialog-overlay', false); };
};

window.showPrompt = (title, defaultVal, onConfirm) => {
    const titleEl = document.getElementById('prompt-title');
    const helperEl = document.getElementById('prompt-helper');
    const iconEl = document.getElementById('prompt-icon');
    const visibilityBtn = document.getElementById('prompt-visibility');
    const input = document.getElementById('prompt-input');

    titleEl.textContent = title;
    helperEl.hidden = true;
    helperEl.textContent = '';

    iconEl.textContent = 'edit';

    input.type = 'text';
    input.autocomplete = 'off';
    input.placeholder = '请输入内容';
    input.value = defaultVal || '';

    visibilityBtn.hidden = true;

    window.toggleModal('prompt-overlay', true);

    setTimeout(() => {
        input.focus();
        input.select();
    }, 100);

    document.getElementById('prompt-confirm').onclick = () => {
        Hardware.vibrate(15);

        const val = input.value.trim();

        if (val) {
            window.toggleModal('prompt-overlay', false);
            onConfirm(val);
        }
    };

    document.getElementById('prompt-cancel').onclick = () => {
        Hardware.vibrate(10);
        window.toggleModal('prompt-overlay', false);
    };
};

const Nav = {
    init() {
        document.querySelectorAll('.nav-item').forEach(item => {
            // 1. 响应手指按下：实现“即刻反馈”，并将震动时长从 10 增至 25，确保所有机型都能感受到干脆的震感
            item.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                Hardware.playSound('click'); Hardware.vibrate(25);
                let targetId = e.currentTarget.getAttribute('data-target');
                let titleData = e.currentTarget.getAttribute('data-title');
                this.switchTab(targetId, titleData, e.currentTarget);
            });
            
            // 2. 保留 click 用于兼容：拦截真实的物理抬手点击(防重复执行)，但放行代码级别的虚拟点击(如使用电脑键盘左右方向键切换 Tab)
            item.addEventListener('click', (e) => {
                if (e.isTrusted) return; 
                Hardware.playSound('click'); Hardware.vibrate(25);
                let targetId = e.currentTarget.getAttribute('data-target');
                let titleData = e.currentTarget.getAttribute('data-title');
                this.switchTab(targetId, titleData, e.currentTarget);
            });
        });


        let inputs = document.querySelectorAll('input[type="text"], textarea');
let nav = document.getElementById('bottom-nav');
inputs.forEach(el => {
    el.addEventListener('focus', () => {
        if (el.closest('#ai-chat-view') || el.closest('#ai-sheet-overlay')) return;
        if(nav) nav.style.transform = 'translateY(150%)';
    });
    el.addEventListener('blur', () => {
        if (el.closest('#ai-chat-view') || el.closest('#ai-sheet-overlay')) return;
        if(nav) nav.style.transform = 'translateY(0)';
    });
});
    },
        switchTab(targetId, titleData, navItemEl) {
        if (Model.state.batchMode || Model.state.manageMode) {
            Model.state.batchMode = false;
            Model.state.manageMode = false;
            Model.state.selectedSet.clear();
            
            View.updateWordbankUI(); 
            Model.state.renderedStartIndex = -1; 
        }

        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        if(navItemEl) navItemEl.classList.add('active');


        document.querySelectorAll('.tab-content').forEach(el => {
            el.classList.add('hidden');
            el.classList.remove('active');
        });
        
        let targetEl = document.getElementById(targetId);
        if(targetEl) {
            targetEl.classList.remove('hidden');
            void targetEl.offsetWidth; 
            targetEl.classList.add('active');
        }

        if (titleData) {
            let [icon, text] = titleData.split('|');
            let titleEl = document.getElementById('app-global-title');
            if(titleEl) titleEl.innerHTML = `<span class="material-symbols-rounded" style="color:var(--tertiary); font-size:1.8rem; margin-right: 6px;">${icon}</span> ${text}`;
        }

        if (targetId === 'tab-home') {
    View.renderDashboard();
} else if (targetId === 'tab-ai-history') {
    Controller.renderAIHistory();
} else if (targetId === 'tab-wordbank') {
            if(Model.state.renderedStartIndex === -1) {
                View.resetWordbankRenderer();
            } else {
                View.renderVirtualGrid();
            }
        }
        
        window.dispatchEvent(new Event('scroll')); 
    }
};

const BottomSheet = {
    init() {
        document.querySelectorAll('select:not(.no-bs)').forEach(sel => {
            let facade = document.createElement('div');
            facade.className = 'bs-facade';
            facade.setAttribute('tabindex', '0');
            facade.setAttribute('role', 'button');

            if (sel.style.marginBottom) {
                facade.style.marginBottom = sel.style.marginBottom;
            }

            if (sel.style.flex) {
                facade.style.flex = sel.style.flex;
            }

            if (sel.style.width) {
                facade.style.width = sel.style.width;
            }

            if (sel.style.marginTop) {
                facade.style.marginTop = sel.style.marginTop;
            }

            let textSpan = document.createElement('span');
            textSpan.className = 'bs-facade-text';
            textSpan.innerText =
                sel.options[sel.selectedIndex]?.text || '';

            let arrowSpan = document.createElement('span');
            arrowSpan.className = 'material-symbols-rounded';
            arrowSpan.innerText = 'keyboard_arrow_down';
            arrowSpan.style.opacity = '0.5';

            facade.appendChild(textSpan);
            facade.appendChild(arrowSpan);

            sel.style.display = 'none';
            sel.parentNode.insertBefore(facade, sel.nextSibling);

            facade.addEventListener('click', () => {
                Hardware.vibrate(10);
                this.open(sel, textSpan);
            });

            sel.addEventListener('facade-update', () => {
                textSpan.innerText =
                    sel.options[sel.selectedIndex]?.text || '';
            });
        });

        /*
         * 为所有底部抽屉安装右上角收起按钮，
         * 同时保留原有的拖动关闭能力。
         */
        this.installCollapseButtons();
        this.initDragSupport();
    },

    installCollapseButtons() {
        document
            .querySelectorAll('.modal-overlay .bottom-sheet')
            .forEach(sheet => {
                const alreadyInstalled =
                    Array.from(sheet.children).some(child => {
                        return child.classList?.contains(
                            'sheet-collapse-btn'
                        );
                    });

                if (alreadyInstalled) {
                    return;
                }

                const overlay =
                    sheet.closest('.modal-overlay');

                if (!overlay?.id) {
                    return;
                }

                const button =
                    document.createElement('button');

                button.type = 'button';
                button.className = 'sheet-collapse-btn';
                button.title = '收起抽屉';
                button.setAttribute('aria-label', '收起抽屉');
                button.innerHTML = `
                    <span class="material-symbols-rounded">
                        keyboard_arrow_down
                    </span>
                `;

                button.addEventListener('click', event => {
                    event.stopPropagation();
                    Hardware.vibrate(10);
                    window.toggleModal(overlay.id, false);
                });

                sheet.insertBefore(button, sheet.firstChild);
            });
    },

    initDragSupport() {
        document
            .querySelectorAll('.modal-overlay .bottom-sheet')
            .forEach(sheet => {
                /*
                 * 防止初始化函数重复执行时，
                 * 同一个抽屉被绑定多次事件。
                 */
                if (sheet.dataset.dragReady === 'true') {
                    return;
                }

                const overlay =
                    sheet.closest('.modal-overlay');

                /*
                 * 只寻找抽屉最外层的横条，
                 * 避免误选内容区内的同名元素。
                 */
                const handle =
                    Array.from(sheet.children).find(child => {
                        return child.classList.contains('bs-handle');
                    });

                if (!overlay || !handle) {
                    return;
                }

                sheet.dataset.dragReady = 'true';

                /*
                 * 横条同时支持键盘操作。
                 */
                handle.setAttribute('role', 'button');
                handle.setAttribute('tabindex', '0');
                handle.setAttribute(
                    'aria-label',
                    '向下拖动关闭抽屉'
                );

                let dragging = false;
                let pointerId = null;
                let startY = 0;
                let currentY = 0;
                let startTime = 0;
                let finishTimer = null;

                const clearMotionState = () => {
                    if (finishTimer) {
                        window.clearTimeout(finishTimer);
                        finishTimer = null;
                    }

                    dragging = false;
                    pointerId = null;
                    currentY = 0;

                    sheet.classList.remove(
                        'is-dragging',
                        'is-settling',
                        'is-dismissing'
                    );

                    handle.classList.remove('is-dragging');
                    overlay.classList.remove('sheet-dismissing');

                    sheet.style.removeProperty(
                        '--sheet-drag-y'
                    );
                };

                /*
                 * 没有达到关闭距离时，
                 * 让抽屉弹回原位。
                 */
                const springBack = () => {
                    sheet.classList.remove(
                        'is-dragging',
                        'is-dismissing'
                    );

                    handle.classList.remove('is-dragging');
                    overlay.classList.remove(
                        'sheet-dismissing'
                    );

                    sheet.classList.add('is-settling');

                    sheet.style.setProperty(
                        '--sheet-drag-y',
                        '0px'
                    );

                    finishTimer = window.setTimeout(() => {
                        sheet.classList.remove('is-settling');

                        sheet.style.removeProperty(
                            '--sheet-drag-y'
                        );

                        finishTimer = null;
                    }, 300);
                };

                /*
                 * 完整执行抽屉退出动画，
                 * 然后调用现有的弹窗关闭方法。
                 */
                const dismissSheet = () => {
                    sheet.classList.remove(
                        'is-dragging',
                        'is-settling'
                    );

                    handle.classList.remove('is-dragging');

                    sheet.classList.add('is-dismissing');
                    overlay.classList.add(
                        'sheet-dismissing'
                    );

                    const dismissDistance = Math.max(
                        window.innerHeight,
                        sheet.offsetHeight + 120
                    );

                    sheet.style.setProperty(
                        '--sheet-drag-y',
                        `${dismissDistance}px`
                    );

                    Hardware.vibrate(12);

                    finishTimer = window.setTimeout(() => {
                        window.toggleModal(
                            overlay.id,
                            false
                        );

                        finishTimer =
                            window.setTimeout(() => {
                                clearMotionState();
                            }, 420);
                    }, 220);
                };

                const endDrag = event => {
                    if (
                        !dragging ||
                        event.pointerId !== pointerId
                    ) {
                        return;
                    }

                    const elapsed = Math.max(
                        performance.now() - startTime,
                        1
                    );

                    const totalDistance = Math.max(
                        0,
                        event.clientY - startY
                    );

                    const velocity =
                        totalDistance / elapsed;

                    /*
                     * 抽屉越高，关闭阈值会适当增加，
                     * 但不会超过 160 像素。
                     */
                    const closeThreshold = Math.min(
                        160,
                        Math.max(
                            90,
                            sheet.offsetHeight * 0.22
                        )
                    );

                    dragging = false;

                    try {
                        handle.releasePointerCapture(
                            pointerId
                        );
                    } catch (error) {}

                    pointerId = null;

                    /*
                     * 满足任一条件即可关闭：
                     *
                     * 1. 下拉距离足够；
                     * 2. 下拉距离超过 28 像素，
                     *    并且手势速度足够快。
                     */
                    const shouldClose =
                        currentY > closeThreshold ||
                        (
                            currentY > 28 &&
                            velocity > 0.55
                        );

                    if (shouldClose) {
                        dismissSheet();
                    } else {
                        springBack();
                    }
                };

                handle.addEventListener(
                    'pointerdown',
                    event => {
                        if (
                            !overlay.classList.contains(
                                'active'
                            )
                        ) {
                            return;
                        }

                        if (
                            event.pointerType === 'mouse' &&
                            event.button !== 0
                        ) {
                            return;
                        }

                        if (
                            overlay.classList.contains(
                                'sheet-dismissing'
                            )
                        ) {
                            return;
                        }

                        event.preventDefault();

                        if (finishTimer) {
                            window.clearTimeout(
                                finishTimer
                            );

                            finishTimer = null;
                        }

                        dragging = true;
                        pointerId = event.pointerId;
                        startY = event.clientY;
                        currentY = 0;
                        startTime = performance.now();

                        sheet.classList.remove(
                            'is-settling',
                            'is-dismissing'
                        );

                        overlay.classList.remove(
                            'sheet-dismissing'
                        );

                        sheet.classList.add(
                            'is-dragging'
                        );

                        handle.classList.add(
                            'is-dragging'
                        );

                        sheet.style.setProperty(
                            '--sheet-drag-y',
                            '0px'
                        );

                        try {
                            handle.setPointerCapture(
                                pointerId
                            );
                        } catch (error) {}
                    }
                );

                handle.addEventListener(
                    'pointermove',
                    event => {
                        if (
                            !dragging ||
                            event.pointerId !== pointerId
                        ) {
                            return;
                        }

                        event.preventDefault();

                        const rawDistance =
                            event.clientY - startY;

                        /*
                         * 向下时完全跟手。
                         * 向上时增加阻力，最多只移动 18 像素。
                         */
                        currentY = rawDistance < 0
                            ? Math.max(
                                -18,
                                rawDistance * 0.18
                            )
                            : rawDistance;

                        sheet.style.setProperty(
                            '--sheet-drag-y',
                            `${currentY}px`
                        );
                    }
                );

                handle.addEventListener(
                    'pointerup',
                    endDrag
                );

                handle.addEventListener(
                    'pointercancel',
                    event => {
                        if (
                            !dragging ||
                            event.pointerId !== pointerId
                        ) {
                            return;
                        }

                        dragging = false;
                        pointerId = null;

                        springBack();
                    }
                );

                /*
                 * 为键盘和辅助设备提供关闭方式。
                 */
                handle.addEventListener(
                    'keydown',
                    event => {
                        if (
                            !overlay.classList.contains(
                                'active'
                            )
                        ) {
                            return;
                        }

                        if (
                            event.key === 'Enter' ||
                            event.key === ' ' ||
                            event.key === 'ArrowDown'
                        ) {
                            event.preventDefault();
                            dismissSheet();
                        }
                    }
                );
            });
    },

    open(selectEl, textSpan) {
        const container =
            document.getElementById('bs-options');

        const overlay =
            document.getElementById('bs-overlay');

        const isWordbankPicker =
            selectEl.id === 'wb-folder-filter';

        const isRangePicker =
            selectEl.id === 'test-range-select';

        const isDisplayModePicker = [
            'next-display-mode',
            'test-display-select'
        ].includes(selectEl.id);

        container.innerHTML = '';
        container.className = 'bs-options';

        [
            'wordbank-picker-open',
            'range-picker-open',
            'display-mode-picker-open',
            'compact-picker-open'
        ].forEach(className => {
            overlay?.classList.remove(className);
        });

        container.classList.toggle(
            'is-wordbank-picker',
            isWordbankPicker
        );

        container.classList.toggle(
            'is-range-picker',
            isRangePicker
        );

        container.classList.toggle(
            'is-display-mode-picker',
            isDisplayModePicker
        );

        overlay?.classList.toggle(
            'wordbank-picker-open',
            isWordbankPicker
        );

        overlay?.classList.toggle(
            'range-picker-open',
            isRangePicker
        );

        overlay?.classList.toggle(
            'display-mode-picker-open',
            isDisplayModePicker
        );

        const titleMap = {
            'test-range-select': '选择检验范围',
            'test-display-select': '默认显示模式',
            'next-display-mode': (
                Model.state.mode === 'rote-learning' &&
                Model.state.currentLangMode === 'en'
            )
                ? '选择强化模式'
                : '遮盖模式',
            'wb-folder-filter': '选择词库',
            'wb-level-filter': '选择考试级别',
            'wb-difficulty-filter': '选择学习难度',
            'move-dest-select': '移动至目标文件夹',
            'import-lang-select': '选择词汇语言',
            'import-folder-select': '选择目标词库',
            'import-level-select': '选择批次级别',
            'import-difficulty-select': '选择批次难度',
            'import-duplicate-mode': '选择重复词处理方式',
            'setting-word-order-mode': '选择词汇排列方式'
        };

        document.getElementById('bs-title').innerText =
            titleMap[selectEl.id] || '请选择';

        const visibleOptions =
            Array.from(selectEl.options).filter(option => {
                return option.style.display !== 'none';
            });

        const longestOptionLength =
            visibleOptions.reduce((maxLength, option) => {
                return Math.max(
                    maxLength,
                    Array.from(option.text.trim()).length
                );
            }, 0);

        const saveSelection = option => {
            Hardware.vibrate(15);
            selectEl.value = option.value;

            if (selectEl.id === 'test-range-select') {
                localStorage.setItem(
                    'lastTestRange',
                    option.value
                );
            }

            if (selectEl.id === 'test-display-select') {
                localStorage.setItem(
                    'lastTestDisplay',
                    option.value
                );
            }

            if (selectEl.id === 'wb-folder-filter') {
                localStorage.setItem(
                    'lastSelectedFolder',
                    option.value
                );
            }

            selectEl.dispatchEvent(
                new Event('facade-update')
            );

            selectEl.dispatchEvent(
                new Event('change')
            );

            window.toggleModal('bs-overlay', false);
        };

        const countWordsForOption = option => {
            if (!isWordbankPicker && !isRangePicker) {
                return null;
            }

            return Model.db.filter(word => {
                if (
                    (word.lang || 'ja') !==
                    Model.state.currentLangMode
                ) {
                    return false;
                }

                return option.value === 'all'
                    ? true
                    : Model.checkFilter(
                          word,
                          option.value
                      );
            }).length;
        };

        const displayIconMap = {
            all: 'visibility',
            word: 'text_fields',
            kana: 'record_voice_over',
            meaning: 'translate',
            audio: 'headphones',
            spell: 'spellcheck'
        };

        const genericIconMap = {
            all: 'grid_view',
            ja: 'translate',
            en: 'abc',
            N5: 'looks_5',
            N4: 'looks_4',
            N3: 'looks_3',
            N2: 'looks_two',
            N1: 'looks_one',
            'CET-4': 'filter_4',
            'CET-6': 'filter_6',
            '1': 'filter_1',
            '2': 'filter_2',
            '3': 'filter_3',
            '4': 'filter_4',
            '5': 'filter_5',
            skip: 'skip_next',
            update: 'sync',
            keep: 'content_copy'
        };

        const makeButton = (option, meta = {}) => {
            const button = document.createElement('div');
            const count = countWordsForOption(option);

            button.className = 'bs-option';
            button.classList.toggle('selected', option.selected);
            button.classList.toggle('is-wide', Boolean(meta.wide));
            button.classList.toggle(
                'is-featured',
                Boolean(meta.featured)
            );

            button.setAttribute('tabindex', '0');
            button.setAttribute('role', 'button');
            button.setAttribute(
                'aria-pressed',
                option.selected ? 'true' : 'false'
            );

            const icon =
                meta.icon ||
                (isDisplayModePicker
                    ? displayIconMap[option.value]
                    : genericIconMap[option.value]) ||
                'tune';

            button.innerHTML = `
                <span class="bs-option-icon material-symbols-rounded">
                    ${icon}
                </span>

                <span class="bs-option-label">
                    ${escapeHTML(meta.label || option.text)}
                </span>

                ${
                    count === null
                        ? ''
                        : `
                            <span class="bs-option-count">
                                ${count}
                            </span>
                        `
                }

                <span class="bs-option-check material-symbols-rounded">
                    check
                </span>
            `;

            button.addEventListener('click', () => {
                saveSelection(option);
            });

            button.addEventListener('keydown', event => {
                if (
                    event.key !== 'Enter' &&
                    event.key !== ' '
                ) {
                    return;
                }

                event.preventDefault();
                saveSelection(option);
            });

            return button;
        };

        const buildGroupedPicker = (
            groupDefinitions,
            resolveMeta
        ) => {
            const groups = {};

            groupDefinitions.forEach(([key, title]) => {
                const section =
                    document.createElement('section');

                const heading =
                    document.createElement('div');

                const grid =
                    document.createElement('div');

                section.className =
                    `bs-option-group bs-option-group-${key}`;

                section.hidden = true;
                heading.className = 'bs-option-group-title';
                heading.textContent = title;
                grid.className = 'bs-option-grid';

                section.appendChild(heading);
                section.appendChild(grid);
                container.appendChild(section);

                groups[key] = { section, grid };
            });

            visibleOptions.forEach(option => {
                const meta = resolveMeta(option);
                const target = groups[meta.group];

                if (!target) {
                    return;
                }

                target.section.hidden = false;
                target.grid.appendChild(
                    makeButton(option, meta)
                );
            });
        };

        if (isWordbankPicker) {
            const metaMap = {
                all: ['quick', '查看所有', 'grid_view'],
                virtual_starred: [
                    'quick',
                    '收藏词汇',
                    'star'
                ],
                virtual_wrong_all: [
                    'wrong',
                    '智能错题本',
                    'error_med',
                    true,
                    true
                ],
                virtual_wrong_spell: [
                    'wrong',
                    '拼写',
                    'spellcheck'
                ],
                virtual_wrong_listening: [
                    'wrong',
                    '听力',
                    'headphones'
                ],
                virtual_wrong_reading: [
                    'wrong',
                    '读音',
                    'record_voice_over'
                ],
                virtual_wrong_meaning: [
                    'wrong',
                    '释义',
                    'translate'
                ],
                virtual_wrong_ai: [
                    'wrong',
                    'AI 小测',
                    'quiz'
                ],
                virtual_wrong_repeated: [
                    'wrong',
                    '反复出错',
                    'priority_high'
                ],
                virtual_wrong_resolved: [
                    'wrong',
                    '已解决',
                    'task_alt',
                    true
                ],
                virtual_cleared: [
                    'progress',
                    '完全通关',
                    'workspace_premium'
                ],
                virtual_uncleared: [
                    'progress',
                    '未通关',
                    'hourglass_empty'
                ],
                virtual_know_kanji: [
                    'progress',
                    Model.state.currentLangMode === 'en'
                        ? '拼写掌握'
                        : '汉字了解',
                    'visibility'
                ],
                virtual_know_kana: [
                    'progress',
                    Model.state.currentLangMode === 'en'
                        ? '听力掌握'
                        : '读音了解',
                    Model.state.currentLangMode === 'en'
                        ? 'hearing'
                        : 'record_voice_over'
                ],
                virtual_know_meaning: [
                    'progress',
                    '释义了解',
                    'psychology_alt'
                ]
            };

            buildGroupedPicker(
                [
                    ['quick', '快捷入口'],
                    ['wrong', '错题本'],
                    ['progress', '学习状态'],
                    ['folders', '我的词库']
                ],
                option => {
                    const fixed = metaMap[option.value];

                    if (fixed) {
                        return {
                            group: fixed[0],
                            label: fixed[1],
                            icon: fixed[2],
                            wide: Boolean(fixed[3]),
                            featured: Boolean(fixed[4])
                        };
                    }

                    const label = option.text.trim();

                    return {
                        group: 'folders',
                        label,
                        icon: option.value === 'default'
                            ? 'library_books'
                            : 'folder',
                        wide: Array.from(label).length >= 9
                    };
                }
            );
        } else if (isRangePicker) {
            buildGroupedPicker(
                [
                    ['folders', '词库'],
                    ['quick', '快捷范围'],
                    ['weak', '专项攻坚'],
                    ['review', '复习巩固']
                ],
                option => {
                    const value = option.value;
                    const label = option.text
                        .replace(/^专项攻坚[:：]\s*/, '')
                        .replace(/^复习巩固[:：]\s*/, '')
                        .trim();

                    if (value.startsWith('virtual_miss_')) {
                        const icon = value.endsWith('kanji')
                            ? 'spellcheck'
                            : value.endsWith('kana')
                                ? 'headphones'
                                : 'translate';

                        return {
                            group: 'weak',
                            label,
                            icon
                        };
                    }

                    if (value.startsWith('virtual_know_')) {
                        const icon = value.endsWith('kanji')
                            ? 'verified'
                            : value.endsWith('kana')
                                ? 'hearing_disabled'
                                : 'psychology_alt';

                        return {
                            group: 'review',
                            label,
                            icon
                        };
                    }

                    if (value === 'virtual_starred') {
                        return {
                            group: 'quick',
                            label: '收藏词汇',
                            icon: 'star'
                        };
                    }

                    if (value === 'virtual_cleared') {
                        return {
                            group: 'quick',
                            label: '完全通关',
                            icon: 'workspace_premium'
                        };
                    }

                    if (value === 'virtual_uncleared') {
                        return {
                            group: 'quick',
                            label: '所有未通关',
                            icon: 'hourglass_empty'
                        };
                    }

                    return {
                        group: 'folders',
                        label: option.text,
                        icon: 'folder',
                        wide:
                            Array.from(option.text).length >= 10
                    };
                }
            );
        } else {
            const useCompactGrid =
                visibleOptions.length >= 2 &&
                visibleOptions.length <= 8 &&
                longestOptionLength <= 18;

            container.classList.toggle(
                'is-compact-grid',
                useCompactGrid
            );

            container.classList.toggle(
                'is-compact-list',
                !useCompactGrid
            );

            container.classList.toggle(
                'is-display-mode-picker',
                isDisplayModePicker
            );

            overlay?.classList.add('compact-picker-open');

            visibleOptions.forEach(option => {
                container.appendChild(
                    makeButton(option)
                );
            });
        }

        window.toggleModal('bs-overlay', true);
    }
};

const RomajiEngine = {
    mode: 'hiragana', // 'hiragana' or 'katakana'
    raw: '',          // 已转换的假名
    buffer: '',       // 缓冲中的罗马字
    map: {
        "a":"あ","i":"い","u":"う","e":"え","o":"お","ka":"か","ki":"き","ku":"く","ke":"け","ko":"こ","ga":"が","gi":"ぎ","gu":"ぐ","ge":"げ","go":"ご",
        "sa":"さ","shi":"し","si":"し","su":"す","se":"せ","so":"そ","za":"ざ","ji":"じ","zi":"じ","zu":"ず","ze":"ぜ","zo":"ぞ",
        "ta":"た","chi":"ち","ti":"ち","tsu":"つ","tu":"つ","te":"て","to":"と","da":"だ","di":"ぢ","du":"づ","de":"で","do":"ど",
        "na":"な","ni":"に","nu":"ぬ","ne":"ね","no":"の","ha":"は","hi":"ひ","fu":"ふ","hu":"ふ","he":"へ","ho":"ほ",
        "ba":"ば","bi":"び","bu":"ぶ","be":"べ","bo":"ぼ","pa":"ぱ","pi":"ぴ","pu":"ぷ","pe":"ぺ","po":"ぽ",
        "ma":"ま","mi":"み","mu":"む","me":"め","mo":"も","ya":"や","yu":"ゆ","yo":"よ","ra":"ら","ri":"り","ru":"る","re":"れ","ro":"ろ",
        "wa":"わ","wo":"を","nn":"ん","n ":"ん","-":"ー",
        "kya":"きゃ","kyu":"きゅ","kyo":"きょ","gya":"ぎゃ","gyu":"ぎゅ","gyo":"ぎょ",
        "sha":"しゃ","sya":"しゃ","shu":"しゅ","syu":"しゅ","sho":"しょ","syo":"しょ",
                "ja":"じゃ","zya":"じゃ","jya":"じゃ","ju":"じゅ","zyu":"じゅ","jyu":"じゅ","jo":"じょ","zyo":"じょ","jyo":"じょ",
        "cha":"ちゃ","tya":"ちゃ","cya":"ちゃ","chu":"ちゅ","tyu":"ちゅ","cyu":"ちゅ","cho":"ちょ","tyo":"ちょ","cyo":"ちょ",

        "nya":"にゃ","nyu":"にゅ","nyo":"にょ","hya":"ひゃ","hyu":"ひゅ","hyo":"ひょ",
        "bya":"びゃ","byu":"びゅ","byo":"びょ","pya":"ぴゃ","pyu":"ぴゅ","pyo":"ぴょ",
        "mya":"みゃ","myu":"みゅ","myo":"みょ","rya":"りゃ","ryu":"りゅ","ryo":"りょ"
    },
    reset() { this.raw = ''; this.buffer = ''; this.mode = 'hiragana'; },
    toggleMode() { this.mode = this.mode === 'hiragana' ? 'katakana' : 'hiragana'; Hardware.vibrate(10); },
    toKatakana(hira) { return hira.replace(/[\u3041-\u3096]/g, m => String.fromCharCode(m.charCodeAt(0) + 0x60)); },
    input(char) {
        if (char === 'Backspace') {
            if (this.buffer.length > 0) this.buffer = this.buffer.slice(0, -1);
            else if (this.raw.length > 0) this.raw = this.raw.slice(0, -1);
            Hardware.vibrate(10); return;
        }
        Hardware.vibrate(15);
        this.buffer += char.toLowerCase();
        
        // 促音规则
        if (this.buffer.length >= 2 && this.buffer[0] === this.buffer[1] && !"aeiouy-".includes(this.buffer[0]) && this.buffer[0] !== 'n') {
            this.raw += this.mode === 'hiragana' ? "っ" : "ッ";
            this.buffer = this.buffer.slice(1);
        }
        // 拨音规则
        if (this.buffer.length >= 2 && this.buffer[0] === 'n' && this.buffer[1] !== 'n' && !"aeiouy-".includes(this.buffer[1])) {
            this.raw += this.mode === 'hiragana' ? "ん" : "ン";
            this.buffer = this.buffer.slice(1);
        }
        // 匹配合成
        for (let i = 3; i > 0; i--) {
            if (this.buffer.length >= i) {
                let chunk = this.buffer.slice(0, i);
                if (this.map[chunk]) {
                    let kana = this.map[chunk];
                    this.raw += this.mode === 'hiragana' ? kana : this.toKatakana(kana);
                    this.buffer = this.buffer.slice(i);
                    break;
                }
            }
        }
    },
    getDisplayText() { return this.raw + (this.buffer ? `<span class="pending-romaji">${this.buffer}</span>` : ''); },
    getFinalText() { 
        let finalBuf = this.buffer;
        if (finalBuf === 'n') finalBuf = this.mode === 'hiragana' ? 'ん' : 'ン';
        return this.raw + finalBuf; 
    }
};

// Simple English word input buffer for spelling mode
const EnglishInput = {
    buffer: '',
    reset() { this.buffer = ''; },
    input(char) {
        if (char === 'Backspace') {
            this.buffer = this.buffer.slice(0, -1);
            return;
        }
        if (char.length === 1 && /[a-zA-Z-]/.test(char)) {
            this.buffer += char.toLowerCase();
        }
    },
    getDisplayText() { return this.buffer || ''; },
    getFinalText() { return this.buffer; }
};

const Model = {
  db: [],
  builtInWords: [],
  userWords: [],
  wordOverrides: {},
  builtInIdSet: new Set(),
  folders: ["默认词库"],
  folderLangs: { "默认词库": "ja" },
  stars: [],
  records: [],
  aiConversations: [],
  editingIdx: -1,
  mtGroupClears: {},
  mtWordClears: {},
  getFolderLang(folderName) {
    return this.folderLangs[folderName] || "ja";
  },
    getCurrentLang() {
    return this.state.currentLangMode || "ja";
  },

  state: {
    mode: 'none', studyQueue: [], currentIndex: 0, currentGroupLabel: '', currentGroupKey: '',
    dtWordAppearanceMap: {}, dtSubMode: '', dtSpellTarget: [], dtSpellCurrentIdx: 0,
    mtRound: 1, mtStep: 1, currentWordFailed: false, totalTestWords: 0, mtBaseQueue: [],
    ftState: 'A', ftHint: null, ftShowKanaHint: false,
        comboCount: 0,
    maxProgressSeen: 0, uniqueWordCount: 0, initialQueueLength: 0,
    batchMode: false, manageMode: false, selectedSet: new Set(), activeDetailIdx: 0, detailArray: [], moveTargetIdx: -1, 
    isAnimating: false, filteredDb: [], renderedStartIndex: -1, renderedEndIndex: -1, currentLangMode: 'ja'
  },


  getWordId(word) {
      return getStableWordId(word);
  },

  getWordById(wordId) {
      const target = String(wordId || '').trim();

      if (!target) {
          return null;
      }

      return this.db.find(word => {
          return this.getWordId(word) === target;
      }) || null;
  },

  isStarred(word) {
      const wordId = this.getWordId(word);
      return Boolean(wordId && this.stars.includes(wordId));
  },

  getClearState(word) {
      const wordId = this.getWordId(word);
      const stored = wordId
          ? this.mtWordClears[wordId]
          : null;

      if (!stored || typeof stored !== 'object') {
          return {
              kanji: false,
              kana: false,
              meaning: false
          };
      }

      if (
          word?.lang === 'en' &&
          stored.word !== undefined
      ) {
          return {
              ...stored,
              kanji: Boolean(stored.word),
              kana: Boolean(stored.kana),
              meaning: Boolean(stored.meaning)
          };
      }

      return stored;
  },

  ensureClearState(word) {
      const wordId = this.getWordId(word);

      if (!wordId) {
          return null;
      }

      if (
          !this.mtWordClears[wordId] ||
          typeof this.mtWordClears[wordId] !== 'object'
      ) {
          this.mtWordClears[wordId] = {
              kanji: false,
              kana: false,
              meaning: false
          };
      }

      return this.mtWordClears[wordId];
  },

  getDefaultBuiltInWords() {
      const words = [];

      if (typeof DefaultWords !== 'undefined') {
          DefaultWords.forEach(word => {
              const entry = normalizeWordEntry({
                  ...cloneDataValue(word),
                  lang: 'ja',
                  folder: word.folder || '默认词库',
                  builtIn: true
              });

              ensureStableWordId(entry, {
                  builtInHint: true
              });

              words.push(entry);
          });
      }

      if (typeof DefaultEnglishWords !== 'undefined') {
          DefaultEnglishWords.forEach(word => {
              const entry = normalizeWordEntry({
                  ...cloneDataValue(word),
                  lang: 'en',
                  folder: word.folder || '四级词汇',
                  builtIn: true
              });

              ensureStableWordId(entry, {
                  builtInHint: true
              });

              words.push(entry);
          });
      }

      return words;
  },

  getWordIdentity(word, includeFolder = true) {
      const lang = word?.lang === 'en' ? 'en' : 'ja';
      const headword = normalizeHeadword(
          word?.word || '',
          lang
      ).toLowerCase();
      const folder = includeFolder
          ? normalizeEntryText(word?.folder || '')
          : '';

      return includeFolder
          ? `${lang}::${folder}::${headword}`
          : `${lang}::${headword}`;
  },

  buildWordOverride(canonical, current) {
      const editableFields = [
          'word',
          'kana',
          'phonetic',
          'type',
          'meaning',
          'example',
          'roots',
          'folder',
          'level',
          'difficulty',
          'tags',
          'frequency',
          'pitch',
          'specialTags',
          'sourceId',
          'sourceName',
          'sourceVersion',
          'aliases',
          'sourceLevels',
          'reviewStatus',
          'source',
          'dataVersion'
      ];
      const override = {};

      editableFields.forEach(field => {
          const baseValue = canonical[field];
          const currentValue = current[field];

          if (
              JSON.stringify(baseValue ?? null) !==
              JSON.stringify(currentValue ?? null)
          ) {
              override[field] = cloneDataValue(currentValue);
          }
      });

      if (Object.keys(override).length > 0) {
          override.updatedAt = new Date().toISOString();
      }

      return override;
  },

  rebuildCombinedDB() {
      const merged = [];
      const seenIds = new Set();
      const overrides =
          this.wordOverrides &&
          typeof this.wordOverrides === 'object' &&
          !Array.isArray(this.wordOverrides)
              ? this.wordOverrides
              : {};

      this.builtInWords.forEach(canonical => {
          const wordId = this.getWordId(canonical);
          const override = overrides[wordId];

          if (override?._deleted === true) {
              return;
          }

          const combined = normalizeWordEntry({
              ...cloneDataValue(canonical),
              ...(override || {}),
              _id: wordId,
              lang: canonical.lang,
              builtIn: true
          });

          ensureStableWordId(combined, {
              builtInHint: true
          });

          merged.push(combined);
          seenIds.add(wordId);
      });

      const normalizedUsers = [];

      (Array.isArray(this.userWords)
          ? this.userWords
          : []
      ).forEach(rawWord => {
          const word = normalizeWordEntry({
              ...cloneDataValue(rawWord),
              builtIn: false
          });

          ensureStableWordId(word, {
              builtInHint: false
          });

          if (seenIds.has(word._id)) {
              word._id = createRandomWordId();
          }

          seenIds.add(word._id);
          normalizedUsers.push(word);
          merged.push(word);
      });

      this.userWords = normalizedUsers;
      this.db = merged;
      this.builtInIdSet = new Set(
          this.builtInWords.map(word => this.getWordId(word))
      );
  },

  migrateLegacyWordStorage(
      legacyWords,
      { markMissingBuiltInsAsDeleted = true } = {}
  ) {
      const canonicalById = new Map();
      const canonicalByIdentity = new Map();
      const canonicalByLooseIdentity = new Map();

      this.builtInWords.forEach(word => {
          const wordId = this.getWordId(word);
          canonicalById.set(wordId, word);
          canonicalByIdentity.set(
              this.getWordIdentity(word, true),
              word
          );

          const looseIdentity = this.getWordIdentity(
              word,
              false
          );

          if (!canonicalByLooseIdentity.has(looseIdentity)) {
              canonicalByLooseIdentity.set(
                  looseIdentity,
                  []
              );
          }

          canonicalByLooseIdentity.get(looseIdentity).push(word);
      });

      const userWords = [];
      const overrides = {};
      const foundBuiltInIds = new Set();

      (Array.isArray(legacyWords)
          ? legacyWords
          : []
      ).forEach(rawWord => {
          if (!rawWord || typeof rawWord !== 'object') {
              return;
          }

          const normalized = normalizeWordEntry({
              ...cloneDataValue(rawWord),
              lang: rawWord.lang === 'en' ? 'en' : 'ja'
          });
          const rawId = String(rawWord._id || '').trim();
          let canonical = rawId
              ? canonicalById.get(rawId)
              : null;

          if (!canonical) {
              canonical = canonicalByIdentity.get(
                  this.getWordIdentity(normalized, true)
              ) || null;
          }

          if (!canonical) {
              const candidates = canonicalByLooseIdentity.get(
                  this.getWordIdentity(normalized, false)
              ) || [];

              if (candidates.length === 1) {
                  const candidate = candidates[0];
                  const rawFolder = normalizeEntryText(
                      normalized.folder || ''
                  );
                  const canonicalFolder = normalizeEntryText(
                      candidate.folder || ''
                  );
                  const comparableFields = normalized.lang === 'en'
                      ? [
                          'phonetic',
                          'type',
                          'meaning',
                          'example',
                          'roots'
                      ]
                      : [
                          'kana',
                          'type',
                          'meaning',
                          'example'
                      ];
                  const comparableValues = comparableFields.filter(field => {
                      return Boolean(
                          normalizeEntryText(candidate[field] || '')
                      );
                  });
                  const matchingValues = comparableValues.filter(field => {
                      return (
                          normalizeEntryText(normalized[field] || '') ===
                          normalizeEntryText(candidate[field] || '')
                      );
                  });
                  const contentLooksBuiltIn =
                      comparableValues.length > 0 &&
                      matchingValues.length >= Math.min(
                          3,
                          comparableValues.length
                      );
                  const likelyLegacyBuiltIn =
                      rawWord.builtIn === true ||
                      !rawFolder ||
                      rawFolder === canonicalFolder ||
                      contentLooksBuiltIn;

                  if (likelyLegacyBuiltIn) {
                      canonical = candidate;
                  }
              }
          }

          if (canonical) {
              const wordId = this.getWordId(canonical);
              const current = normalizeWordEntry({
                  ...normalized,
                  _id: wordId,
                  builtIn: true,
                  lang: canonical.lang
              });
              const override = this.buildWordOverride(
                  canonical,
                  current
              );

              foundBuiltInIds.add(wordId);

              if (Object.keys(override).length > 0) {
                  overrides[wordId] = override;
              }

              return;
          }

          normalized.builtIn = false;
          ensureStableWordId(normalized, {
              builtInHint: false
          });
          userWords.push(normalized);
      });

      if (markMissingBuiltInsAsDeleted) {
          this.builtInWords.forEach(word => {
              const wordId = this.getWordId(word);

              if (!foundBuiltInIds.has(wordId)) {
                  overrides[wordId] = {
                      _deleted: true,
                      updatedAt: new Date().toISOString()
                  };
              }
          });
      }

      this.userWords = userWords;
      this.wordOverrides = overrides;
      this.rebuildCombinedDB();
  },

  async persistSeparatedWordData() {
      await Promise.all([
          this.writeStorageValue(
              USER_WORDS_STORAGE_KEY,
              this.userWords
          ),
          this.writeStorageValue(
              WORD_OVERRIDES_STORAGE_KEY,
              this.wordOverrides
          )
      ]);

      localStorage.setItem(
          WORD_STORAGE_VERSION_KEY,
          String(WORD_STORAGE_VERSION)
      );
  },

  async init() {
      await this.loadData();
  },

  idbAvailable: true,

  async readStorageValue(key) {
      if (
          this.idbAvailable &&
          typeof idbKeyval !== 'undefined'
      ) {
          try {
              const storedValue = await idbKeyval.get(key);

              if (storedValue !== undefined) {
                  return storedValue;
              }
          } catch (error) {
              console.warn(
                  `[Storage] 读取 ${key} 失败，尝试本地备用存储`,
                  error
              );
          }
      }

      const rawValue = localStorage.getItem(key);

      if (rawValue === null) {
          return null;
      }

      try {
          return JSON.parse(rawValue);
      } catch (error) {
          return rawValue;
      }
  },

  async writeStorageValue(key, value) {
      if (
          this.idbAvailable &&
          typeof idbKeyval !== 'undefined'
      ) {
          try {
              await idbKeyval.set(key, value);
              return;
          } catch (error) {
              console.warn(
                  `[Storage] 写入 ${key} 失败，尝试本地备用存储`,
                  error
              );
          }
      }

      localStorage.setItem(
          key,
          JSON.stringify(value)
      );
  },

  async createMigrationSnapshot(fromVersion) {
      const snapshot = {
          type: 'migration-snapshot',
          createdAt: new Date().toISOString(),
          fromVersion,
          toVersion: DATA_SCHEMA_VERSION,

          db: structuredClone(this.db),
          folders: structuredClone(this.folders),
          folderLangs: structuredClone(this.folderLangs),
          stars: structuredClone(this.stars),
          records: structuredClone(this.records),
          mtGroupClears: structuredClone(
              this.mtGroupClears
          ),
          mtWordClears: structuredClone(
              this.mtWordClears
          ),
          aiConversations: structuredClone(
              this.aiConversations
          )
      };

      try {
          await this.writeStorageValue(
              MIGRATION_SNAPSHOT_KEY,
              snapshot
          );

          console.log(
              '[Migration] 更新前安全快照已保存'
          );
      } catch (error) {
          /*
           * 快照保存失败时停止迁移。
           * 宁可暂时不更新，也不能冒险改坏用户数据。
           */
          console.error(
              '[Migration] 无法建立安全快照',
              error
          );

          throw new Error(
              '无法建立数据安全快照，已停止更新'
          );
      }

      return snapshot;
  },

  async saveAllUserData() {
      await Promise.all([
          this.saveDB(),
          this.saveFolders(),
          this.saveFolderLangs(),
          this.saveStars(),
          this.saveRecords(),
          this.saveClears(),

          this.writeStorageValue(
              'aiConversations',
              this.aiConversations
          )
      ]);
  },

  async restoreMigrationSnapshot(snapshot) {
      if (!snapshot) {
          throw new Error('没有可恢复的数据快照');
      }

      this.db = Array.isArray(snapshot.db)
          ? structuredClone(snapshot.db)
          : [];

      this.folders = Array.isArray(snapshot.folders)
          ? structuredClone(snapshot.folders)
          : ['默认词库'];

      this.folderLangs =
          snapshot.folderLangs &&
          typeof snapshot.folderLangs === 'object'
              ? structuredClone(snapshot.folderLangs)
              : { '默认词库': 'ja' };

      this.stars = Array.isArray(snapshot.stars)
          ? structuredClone(snapshot.stars)
          : [];

      this.records = Array.isArray(snapshot.records)
          ? structuredClone(snapshot.records)
          : [];

      this.mtGroupClears =
          snapshot.mtGroupClears &&
          typeof snapshot.mtGroupClears === 'object'
              ? structuredClone(snapshot.mtGroupClears)
              : {};

      this.mtWordClears =
          snapshot.mtWordClears &&
          typeof snapshot.mtWordClears === 'object'
              ? structuredClone(snapshot.mtWordClears)
              : {};

      this.aiConversations =
          Array.isArray(snapshot.aiConversations)
              ? structuredClone(
                    snapshot.aiConversations
                )
              : [];

      await this.saveAllUserData();

      console.warn(
          '[Migration] 已恢复更新前的数据快照'
      );
  },

  async runDataMigrations() {
      let dbChanged = false;
      let foldersChanged = false;
      let starsChanged = false;
      let clearsChanged = false;

      for (const word of this.db) {
          if (!word.lang) {
              word.lang = 'ja';
              dbChanged = true;
          }

          const shouldBeBuiltIn =
              this.builtInIdSet.has(String(word._id || '')) ||
              word.builtIn === true;

          if (word.builtIn !== shouldBeBuiltIn) {
              word.builtIn = shouldBeBuiltIn;
              dbChanged = true;
          }

          const previousId = String(word._id || '');
          ensureStableWordId(word, {
              builtInHint: shouldBeBuiltIn
          });

          if (previousId !== word._id) {
              dbChanged = true;
          }

          const normalized = normalizeWordEntry(
              word,
              { preserveWord: true }
          );

          if (
              normalized.builtIn === true &&
              normalized.lang === 'en' &&
              normalized.folder === '四级词汇' &&
              !normalized.level
          ) {
              normalized.level = 'CET-4';
          }

          const trackedFields = [
              '_id',
              'lang',
              'type',
              'meaning',
              'example',
              'folder',
              'phonetic',
              'kana',
              'roots',
              'level',
              'difficulty',
              'tags',
              'frequency',
              'pitch',
              'specialTags',
              'sourceId',
              'sourceName',
              'sourceVersion',
              'aliases',
              'sourceLevels',
              'reviewStatus',
              'source',
              'dataVersion',
              'builtIn'
          ];

          const hasChange = trackedFields.some(field => {
              return (
                  JSON.stringify(word[field] ?? null) !==
                  JSON.stringify(normalized[field] ?? null)
              );
          });

          if (hasChange) {
              Object.assign(word, normalized);
              dbChanged = true;
          }

          const folder = word.folder || (
              word.lang === 'en'
                  ? '四级词汇'
                  : '默认词库'
          );

          if (!word.folder) {
              word.folder = folder;
              dbChanged = true;
          }

          if (!this.folders.includes(folder)) {
              this.folders.push(folder);
              foldersChanged = true;
          }

          const folderLang = word.lang === 'en' ? 'en' : 'ja';

          if (this.folderLangs[folder] !== folderLang) {
              this.folderLangs[folder] = folderLang;
              foldersChanged = true;
          }
      }

      const validIds = new Set(
          this.db.map(word => this.getWordId(word))
      );
      const wordsByLegacyKey = new Map();

      const addLegacyKey = (key, wordId) => {
          const normalizedKey = String(key || '').trim();

          if (!normalizedKey) {
              return;
          }

          if (!wordsByLegacyKey.has(normalizedKey)) {
              wordsByLegacyKey.set(normalizedKey, new Set());
          }

          wordsByLegacyKey.get(normalizedKey).add(wordId);
      };

      this.db.forEach(word => {
          const wordId = this.getWordId(word);
          const lang = word.lang === 'en' ? 'en' : 'ja';
          const headword = String(word.word || '').trim();

          addLegacyKey(headword, wordId);
          addLegacyKey(
              normalizeHeadword(headword, lang).toLowerCase(),
              wordId
          );
      });

      const migratedStars = [];
      const migratedStarSet = new Set();

      (Array.isArray(this.stars) ? this.stars : []).forEach(storedKey => {
          const key = String(storedKey || '').trim();
          let targetIds = [];

          if (validIds.has(key)) {
              targetIds = [key];
          } else {
              const direct = wordsByLegacyKey.get(key);
              const normalized = wordsByLegacyKey.get(
                  key.toLowerCase()
              );

              targetIds = [
                  ...(direct || []),
                  ...(normalized || [])
              ];
          }

          targetIds.forEach(wordId => {
              if (!migratedStarSet.has(wordId)) {
                  migratedStarSet.add(wordId);
                  migratedStars.push(wordId);
              }
          });
      });

      if (
          JSON.stringify(migratedStars) !==
          JSON.stringify(this.stars)
      ) {
          this.stars = migratedStars;
          starsChanged = true;
      }

      const normalizeClearState = value => {
          if (!value || typeof value !== 'object') {
              return {
                  kanji: false,
                  kana: false,
                  meaning: false
              };
          }

          return {
              ...cloneDataValue(value),
              kanji: Boolean(
                  value.kanji ?? value.word ?? false
              ),
              kana: Boolean(value.kana ?? false),
              meaning: Boolean(value.meaning ?? false),
              needsReview: Boolean(value.needsReview)
          };
      };

      const mergeClearState = (base, incoming) => {
          if (!base) {
              return normalizeClearState(incoming);
          }

          const next = normalizeClearState(base);
          const addition = normalizeClearState(incoming);

          next.kanji = next.kanji || addition.kanji;
          next.kana = next.kana || addition.kana;
          next.meaning = next.meaning || addition.meaning;
          next.needsReview =
              next.needsReview || addition.needsReview;

          return next;
      };

      const migratedClears = {};

      Object.entries(
          this.mtWordClears &&
          typeof this.mtWordClears === 'object'
              ? this.mtWordClears
              : {}
      ).forEach(([storedKey, storedState]) => {
          const key = String(storedKey || '').trim();
          let targetIds = [];

          if (validIds.has(key)) {
              targetIds = [key];
          } else {
              const direct = wordsByLegacyKey.get(key);
              const normalized = wordsByLegacyKey.get(
                  key.toLowerCase()
              );

              targetIds = [
                  ...(direct || []),
                  ...(normalized || [])
              ];
          }

          if (targetIds.length === 0) {
              migratedClears[key] = normalizeClearState(storedState);
              return;
          }

          [...new Set(targetIds)].forEach(wordId => {
              migratedClears[wordId] = mergeClearState(
                  migratedClears[wordId],
                  storedState
              );
          });
      });

      if (
          JSON.stringify(migratedClears) !==
          JSON.stringify(this.mtWordClears)
      ) {
          this.mtWordClears = migratedClears;
          clearsChanged = true;
      }

      if (dbChanged) {
          await this.saveDB();
      }

      if (foldersChanged) {
          await Promise.all([
              this.saveFolders(),
              this.saveFolderLangs()
          ]);
      }

      if (starsChanged) {
          await this.saveStars();
      }

      if (clearsChanged) {
          await this.saveClears();
      }
  },

  async loadData() {
      const storedSchemaVersion = Number.parseInt(
          localStorage.getItem('dataSchemaVersion') || '0',
          10
      );
      const needsMigration =
          storedSchemaVersion < DATA_SCHEMA_VERSION;

      try {
          if (typeof idbKeyval === 'undefined') {
              this.idbAvailable = false;
          } else {
              await idbKeyval.get('__zhongri_storage_probe__');
          }
      } catch (error) {
          console.warn(
              '[DB] idb-keyval 不可用，降级至 localStorage',
              error
          );
          this.idbAvailable = false;
      }

      this.builtInWords = this.getDefaultBuiltInWords();
      this.builtInIdSet = new Set(
          this.builtInWords.map(word => this.getWordId(word))
      );

      const [
          storedUserWords,
          storedOverrides,
          legacyDB,
          storedFolders,
          storedFolderLangs,
          storedStars,
          storedRecords,
          storedGroupClears,
          storedWordClears,
          storedConversations
      ] = await Promise.all([
          this.readStorageValue(USER_WORDS_STORAGE_KEY),
          this.readStorageValue(WORD_OVERRIDES_STORAGE_KEY),
          this.readStorageValue(LEGACY_WORD_DB_STORAGE_KEY),
          this.readStorageValue('myFolders_v3'),
          this.readStorageValue('myFolderLangs'),
          this.readStorageValue('starredWords'),
          this.readStorageValue('studyRecords'),
          this.readStorageValue('mtGroupClears_v3'),
          this.readStorageValue('mtWordClears_v3'),
          this.readStorageValue('aiConversations')
      ]);

      const hasSeparatedStorage =
          Array.isArray(storedUserWords) ||
          (
              storedOverrides &&
              typeof storedOverrides === 'object' &&
              !Array.isArray(storedOverrides)
          ) ||
          Number.parseInt(
              localStorage.getItem(WORD_STORAGE_VERSION_KEY) || '0',
              10
          ) >= WORD_STORAGE_VERSION;

      if (hasSeparatedStorage) {
          this.userWords = Array.isArray(storedUserWords)
              ? cloneDataValue(storedUserWords)
              : [];
          this.wordOverrides =
              storedOverrides &&
              typeof storedOverrides === 'object' &&
              !Array.isArray(storedOverrides)
                  ? cloneDataValue(storedOverrides)
                  : {};
          this.rebuildCombinedDB();
      } else if (Array.isArray(legacyDB)) {
          this.migrateLegacyWordStorage(legacyDB, {
              markMissingBuiltInsAsDeleted: true
          });
      } else {
          this.userWords = [];
          this.wordOverrides = {};
          this.rebuildCombinedDB();
      }

      this.folders = Array.isArray(storedFolders)
          ? cloneDataValue(storedFolders)
          : ['默认词库'];
      this.folderLangs =
          storedFolderLangs &&
          typeof storedFolderLangs === 'object' &&
          !Array.isArray(storedFolderLangs)
              ? cloneDataValue(storedFolderLangs)
              : { '默认词库': 'ja' };
      this.stars = Array.isArray(storedStars)
          ? cloneDataValue(storedStars)
          : [];
      this.records = Array.isArray(storedRecords)
          ? cloneDataValue(storedRecords)
          : [];
      this.mtGroupClears =
          storedGroupClears &&
          typeof storedGroupClears === 'object' &&
          !Array.isArray(storedGroupClears)
              ? cloneDataValue(storedGroupClears)
              : {};
      this.mtWordClears =
          storedWordClears &&
          typeof storedWordClears === 'object' &&
          !Array.isArray(storedWordClears)
              ? cloneDataValue(storedWordClears)
              : {};
      this.aiConversations = Array.isArray(storedConversations)
          ? cloneDataValue(storedConversations)
          : [];

      this.builtInWords.forEach(word => {
          const folder = word.folder || (
              word.lang === 'en'
                  ? '四级词汇'
                  : '默认词库'
          );

          if (!this.folders.includes(folder)) {
              this.folders.push(folder);
          }

          this.folderLangs[folder] =
              word.lang === 'en' ? 'en' : 'ja';
      });

      let migrationSnapshot = null;

      if (needsMigration) {
          migrationSnapshot =
              await this.createMigrationSnapshot(
                  storedSchemaVersion
              );
      }

      try {
          await this.runDataMigrations();
          await this.persistSeparatedWordData();

          if (needsMigration) {
              localStorage.setItem(
                  'dataSchemaVersion',
                  String(DATA_SCHEMA_VERSION)
              );

              console.log(
                  `[Migration] 数据格式已从 ${storedSchemaVersion} 升级到 ${DATA_SCHEMA_VERSION}`
              );
          }
      } catch (error) {
          console.error('[Migration] 数据迁移失败', error);

          if (migrationSnapshot) {
              try {
                  await this.restoreMigrationSnapshot(
                      migrationSnapshot
                  );

                  localStorage.setItem(
                      'dataSchemaVersion',
                      String(storedSchemaVersion)
                  );
              } catch (restoreError) {
                  console.error(
                      '[Migration] 自动恢复也失败',
                      restoreError
                  );
              }
          }

          throw error;
      }
  },

  saveDB() {
      const canonicalMap = new Map(
          this.builtInWords.map(word => [
              this.getWordId(word),
              word
          ])
      );
      const currentById = new Map();
      const userWords = [];
      const overrides = {};

      this.db.forEach(rawWord => {
          Object.assign(
              rawWord,
              normalizeWordEntry(
                  rawWord,
                  { preserveWord: true }
              )
          );

          ensureStableWordId(rawWord, {
              builtInHint: rawWord.builtIn === true
          });

          if (currentById.has(rawWord._id)) {
              rawWord._id = createRandomWordId();
              rawWord.builtIn = false;
          }

          currentById.set(rawWord._id, rawWord);
      });

      this.db.forEach(word => {
          const canonical = canonicalMap.get(word._id);

          if (canonical) {
              word.builtIn = true;
              word.lang = canonical.lang;

              const override = this.buildWordOverride(
                  canonical,
                  word
              );

              if (Object.keys(override).length > 0) {
                  overrides[word._id] = override;
              }

              return;
          }

          word.builtIn = false;
          userWords.push(cloneDataValue(word));
      });

      this.builtInWords.forEach(canonical => {
          const wordId = this.getWordId(canonical);

          if (!currentById.has(wordId)) {
              overrides[wordId] = {
                  _deleted: true,
                  updatedAt: new Date().toISOString()
              };
          }
      });

      this.userWords = userWords;
      this.wordOverrides = overrides;

      return this.persistSeparatedWordData();
  },
  saveFolders() {
      if (!this.idbAvailable) { localStorage.setItem('myFolders_v3', JSON.stringify(this.folders)); return Promise.resolve(); }
      return idbKeyval.set('myFolders_v3', this.folders);
  },
  saveFolderLangs() {
      if (!this.idbAvailable) { localStorage.setItem('myFolderLangs', JSON.stringify(this.folderLangs)); return Promise.resolve(); }
      return idbKeyval.set('myFolderLangs', this.folderLangs);
  },
  saveStars() {
      if (!this.idbAvailable) { localStorage.setItem('starredWords', JSON.stringify(this.stars)); return Promise.resolve(); }
      return idbKeyval.set('starredWords', this.stars);
  },
  saveRecords() {
      if (!this.idbAvailable) { localStorage.setItem('studyRecords', JSON.stringify(this.records)); return Promise.resolve(); }
      return idbKeyval.set('studyRecords', this.records);
  },
  
  checkFilter(w, filterName) {
      const st = this.getClearState(w);

      if (filterName === 'virtual_starred') return this.isStarred(w);
      // 统一三杠判断：日语和英语均用 kanji + kana + meaning
      if (filterName === 'virtual_cleared') {
          return st.kanji && st.kana && st.meaning; 
      }
      if (filterName === 'virtual_uncleared') {
          return !(st.kanji && st.kana && st.meaning); 
      }
      if (filterName === 'virtual_know_kanji') return st.kanji;
      if (filterName === 'virtual_know_kana') return st.kana;
      if (filterName === 'virtual_know_meaning') return st.meaning;
      if (filterName === 'virtual_miss_kanji') return !st.kanji;
      if (filterName === 'virtual_miss_kana') return !st.kana;
      if (filterName === 'virtual_miss_meaning') return !st.meaning;
      
      return w.folder === (filterName === 'default' ? '默认词库' : filterName);
  },

  saveClears() {
      if (!this.idbAvailable) {
          localStorage.setItem('mtGroupClears_v3', JSON.stringify(this.mtGroupClears));
          localStorage.setItem('mtWordClears_v3', JSON.stringify(this.mtWordClears));
          return Promise.resolve();
      }
      return Promise.all([
          idbKeyval.set('mtGroupClears_v3', this.mtGroupClears),
          idbKeyval.set('mtWordClears_v3', this.mtWordClears)
      ]);
  },
  
    updateFilteredDb(searchQuery, currentFilter) {
      this.state.filteredDb = this.db.map((w, idx) => ({w, idx})).filter(item => {
          if ((item.w.lang || 'ja') !== Model.state.currentLangMode) return false;
          let matchFolder = currentFilter === 'all' ? true : this.checkFilter(item.w, currentFilter);
          let matchSearch = !searchQuery || 
                            item.w.word.toLowerCase().includes(searchQuery) ||
                            (item.w.kana || '').toLowerCase().includes(searchQuery) ||
                            item.w.meaning.toLowerCase().includes(searchQuery);
          return matchFolder && matchSearch;
      });
      this.state.filteredDb.unshift({ w: { word: 'HINT_CARD', type: 'hint' }, idx: -999 });
  },


  splitKanaByMora(kanaStr) {
      let tokens = kanaStr.replace(/[【】\[\]()]/g, '').match(/([ぁ-んァ-ン][ゃゅょャュョぁぃぅぇぉァィゥェォ]?|[っッんンー])/g);
      return tokens || kanaStr.split('');
  },
  
  calculateStats() {
      let dailyRecords = this.records.filter(r => r.type === 'daily_punch').map(r => r.date);
      let uniqueDates = [...new Set(dailyRecords)].sort((a, b) => new Date(b) - new Date(a));
      let totalDays = uniqueDates.length; let streak = 0;
      let today = new Date(); today.setHours(0,0,0,0);
      for (let i = 0; i < uniqueDates.length; i++) {
          let d = new Date(uniqueDates[i]); d.setHours(0,0,0,0);
          let diff = (today - d) / 86400000;
          if (i === 0 && diff > 1) break; 
          if (i > 0) {
              let prevD = new Date(uniqueDates[i-1]); prevD.setHours(0,0,0,0);
              if ((prevD - d) / 86400000 > 1) break; 
          }
          streak++;
      }
      return { totalDays, streak };
  }
};

const Hardware = {
  audioCtx: null, jaVoiceCache: null, enVoiceCache: null, chargeOsc: null, chargeGain: null, _currentAudio: null,
  init() {
    try {
        if (window.speechSynthesis) {
          let loadVoice = () => { this.jaVoiceCache = window.speechSynthesis.getVoices().find(v => v.lang.includes('ja') || v.lang.includes('JP')); };
          loadVoice();
          if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = loadVoice;
        }
    } catch(e) {}
  },
  vibrate(pattern) { 
  try { 
    if (navigator.vibrate) {
      return navigator.vibrate(pattern);
    }
    return false;
  } catch(e) {
    return false;
  }
},
  playSound(type) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        if (!this.audioCtx) this.audioCtx = new AudioContext();
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        const osc = this.audioCtx.createOscillator(); const gain = this.audioCtx.createGain();
        osc.connect(gain); gain.connect(this.audioCtx.destination);
        const now = this.audioCtx.currentTime;
        if (type === 'click') {
          osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
          gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
          osc.start(now); osc.stop(now + 0.05);
        } else if (type === 'success') {
          osc.type = 'triangle'; osc.frequency.setValueAtTime(523.25, now); osc.frequency.setValueAtTime(783.99, now + 0.2); osc.frequency.setValueAtTime(1046.50, now + 0.3);
          gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.2, now + 0.05); gain.gain.linearRampToValueAtTime(0, now + 0.6);   
          osc.start(now); osc.stop(now + 0.6);
        } else if (type === 'error') {
          osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
          gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.start(now); osc.stop(now + 0.15);
        }
    } catch(e) {}
  },
  playChargeSound() {
      try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!this.audioCtx) this.audioCtx = new AudioContext();
          if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
          this.chargeOsc = this.audioCtx.createOscillator();
          this.chargeGain = this.audioCtx.createGain();
          this.chargeOsc.connect(this.chargeGain);
          this.chargeGain.connect(this.audioCtx.destination);
          let now = this.audioCtx.currentTime;
          this.chargeOsc.type = 'sine';
          this.chargeOsc.frequency.setValueAtTime(100, now);
          this.chargeOsc.frequency.exponentialRampToValueAtTime(800, now + 1.5); 
          this.chargeGain.gain.setValueAtTime(0, now);
          this.chargeGain.gain.linearRampToValueAtTime(0.2, now + 0.2); 
          this.chargeGain.gain.linearRampToValueAtTime(0.5, now + 1.5); 
          this.chargeOsc.start(now);
      } catch(e) {}
  },
  stopChargeSound() {
      try {
          if(this.chargeOsc && this.chargeGain) {
              let now = this.audioCtx.currentTime;
              this.chargeGain.gain.cancelScheduledValues(now);
              this.chargeGain.gain.setValueAtTime(this.chargeGain.gain.value, now);
              this.chargeGain.gain.linearRampToValueAtTime(0, now + 0.1);
              this.chargeOsc.stop(now + 0.1);
              this.chargeOsc = null;
          }
      } catch(e) {}
  },
  playDingDong() {
      try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!this.audioCtx) this.audioCtx = new AudioContext();
          if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
          let osc1 = this.audioCtx.createOscillator(); let gain1 = this.audioCtx.createGain();
          let osc2 = this.audioCtx.createOscillator(); let gain2 = this.audioCtx.createGain();
          osc1.connect(gain1); gain1.connect(this.audioCtx.destination);
          osc2.connect(gain2); gain2.connect(this.audioCtx.destination);
          
          let now = this.audioCtx.currentTime;
          osc1.type = 'sine'; osc1.frequency.setValueAtTime(880, now); 
          gain1.gain.setValueAtTime(0, now); gain1.gain.linearRampToValueAtTime(0.3, now + 0.02); gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc1.start(now); osc1.stop(now + 0.3);
          
          osc2.type = 'sine'; osc2.frequency.setValueAtTime(659.25, now + 0.15); 
          gain2.gain.setValueAtTime(0, now + 0.15); gain2.gain.linearRampToValueAtTime(0.3, now + 0.17); gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
          osc2.start(now + 0.15); osc2.stop(now + 0.6);
      } catch(e) {}
  },
stopAllAudio() {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (this._currentAudio) {
            this._currentAudio.pause();
            this._currentAudio.src = '';
            this._currentAudio = null;
        }
    },
isSpeechUnlocked: false,
      unlockSpeech() {

    try { 
        if (!window.speechSynthesis) return;
        if (!this.jaVoiceCache) {
            let voices = window.speechSynthesis.getVoices();
            this.jaVoiceCache = voices.find(v => v.lang.includes('ja') || v.lang.includes('JP'));
        }
        if (this.isSpeechUnlocked) return;
        let unlock = new SpeechSynthesisUtterance(''); 
        unlock.volume = 0; 
        window.speechSynthesis.speak(unlock); 
        this.isSpeechUnlocked = true; 
    } catch(e) {}
},
fallbackLocalTTS(text, isSentence = false, onComplete = null, lang = 'ja-JP') {
    if (!window.speechSynthesis) {
        if (onComplete) onComplete();
        return;
    }
    
    setTimeout(() => {
        let msg = new SpeechSynthesisUtterance(text);
        msg.lang = lang;
        msg.rate = isSentence ? 0.75 : 0.8;
        
        let voices = window.speechSynthesis.getVoices();
        if (lang === 'en-US') {
            if (!this.enVoiceCache) this.enVoiceCache = voices.find(v => v.lang.includes('en') && (v.lang.includes('US') || v.lang.includes('GB')));
            if (this.enVoiceCache) msg.voice = this.enVoiceCache;
        } else if (lang === 'zh-CN') {
            if (!this.zhVoiceCache) this.zhVoiceCache = voices.find(v => v.lang.includes('zh') || v.lang.includes('CN'));
            if (this.zhVoiceCache) msg.voice = this.zhVoiceCache;
        } else {
            if (!this.jaVoiceCache) this.jaVoiceCache = voices.find(v => v.lang.includes('ja') || v.lang.includes('JP'));
            if (this.jaVoiceCache) msg.voice = this.jaVoiceCache;
        }
        
        if (onComplete) {
            msg.onend = onComplete;
            msg.onerror = onComplete;
        }
        
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        window.speechSynthesis.speak(msg);
    }, 50);
},


// Helper: speak the appropriate text for a word based on its language
speakWord(w, btnEl) {
    if (!w) return;
    const isEnglish = w.lang === 'en';
    const text = isEnglish 
        ? (w.word || '') 
        : ((w.kana || '').replace(/[【】\[\]()]/g,''));
    this.speakText(text, btnEl, isEnglish ? 'en' : 'ja');
},

async speakText(text, btnEl = null, lang = 'ja') {
  try {
      if (typeof text !== 'string' || text.trim() === '') return;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (this._currentAudio) {
          this._currentAudio.pause();
          this._currentAudio = null;
      }
            
            let iconEl = null; let originalIcon = '';
            if (btnEl) {
                btnEl.classList.add('speaker-loading');
                iconEl = btnEl.classList.contains('material-symbols-rounded') ? btnEl : btnEl.querySelector('.material-symbols-rounded');
                if (iconEl) { originalIcon = iconEl.innerText; iconEl.innerText = 'spa'; }
            }

            const revertBtn = () => { if (btnEl) { btnEl.classList.remove('speaker-loading'); if (iconEl) iconEl.innerText = originalIcon || 'volume_up'; } };

            let isSentence = text.length > 12 || /[。？！，、]/.test(text);
            let engine = localStorage.getItem('ttsEngine') || 'azure';
            const ttsLang = lang === 'en' ? 'en-US' : (lang === 'zh' ? 'zh-CN' : 'ja-JP');


 if (engine === 'local' || (engine === 'youdao' && isSentence)) {
    this.fallbackLocalTTS(text, isSentence, revertBtn, ttsLang);
    return;
}

if (engine === 'youdao') {
    const langParam = lang === 'en' ? 'eng' : (lang === 'zh' ? 'zh' : 'jap');
    const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&le=${langParam}`;
    if (this._currentAudio) {
        this._currentAudio.pause();
        this._currentAudio.src = '';
        this._currentAudio.load();
        this._currentAudio = null;
    }
    const audio = new Audio(url);
    audio.playbackRate = 0.85;
    audio.oncanplaythrough = revertBtn; 
    audio.onerror = () => { this.fallbackLocalTTS(text, isSentence, revertBtn, ttsLang); };
    this._currentAudio = audio;
    audio.play().catch(() => { this.fallbackLocalTTS(text, isSentence, revertBtn, ttsLang); });
    return;
}
if (engine === 'azure') {
    const workerUrl = "https://ibka.moyu54433.workers.dev/v1/audio/speech";
    let voice = 'ja-JP-NanamiNeural';
    if (lang === 'en') voice = 'en-US-AriaNeural';
    if (lang === 'zh') voice = 'zh-CN-XiaoxiaoNeural';
    
    const response = await fetch(workerUrl, {        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "tts-1", input: text, voice: voice })
    });

    if (!response.ok) throw new Error("Azure API 请求失败");
    const blob = await response.blob();
    
    if (this._currentAudio) {
        this._currentAudio.pause();
        if (this._currentAudio.src) URL.revokeObjectURL(this._currentAudio.src);
        this._currentAudio = null;
    }

    const audio = new Audio(URL.createObjectURL(blob));
    audio.playbackRate = isSentence ? 0.75 : 0.85;
    audio.oncanplaythrough = revertBtn; 
    audio.onerror = () => { this.fallbackLocalTTS(text, isSentence, revertBtn, ttsLang); };
    this._currentAudio = audio;
    audio.play().catch(() => { this.fallbackLocalTTS(text, isSentence, revertBtn, ttsLang); });
}
        } catch(e) {
            console.warn("[TTS] 在线引擎失效，降级为本地发音", e);
            if (btnEl) { btnEl.classList.remove('speaker-loading'); let i = btnEl.querySelector('.material-symbols-rounded'); if(i) i.innerText = 'volume_up'; }
            this.fallbackLocalTTS(text, isSentence);
        }
      }
};

const View = {
  getEl: (id) => document.getElementById(id),

  playStudyFeedback(type) {
      const card = this.getEl('flash-card');
      if (!card) return;

      const correctClass = 'study-feedback-correct';
      const wrongClass = 'study-feedback-wrong';
      const activeClass = type === 'correct' ? correctClass : wrongClass;

      card.classList.remove(correctClass, wrongClass);
      void card.offsetWidth;
      card.classList.add(activeClass);

      window.setTimeout(() => {
          card.classList.remove(activeClass);
      }, type === 'correct' ? 360 : 300);
  },

  revealStudyElement(el) {
      if (!el) return;

      el.classList.remove('blur-text', 'answer-reveal');
      el.removeAttribute('aria-hidden');

      void el.offsetWidth;
      el.classList.add('answer-reveal');

      window.setTimeout(() => {
          el.classList.remove('answer-reveal');
      }, 460);
  },

  revealStudyAnswer() {
      const elements = [
          this.getEl('w-word'),
          this.getEl('w-kana'),
          this.getEl('w-type'),
          this.getEl('w-meaning'),
          this.getEl('w-roots'),
          this.getEl('w-example-box')
      ].filter(el => {
          return el && el.style.display !== 'none' && !el.classList.contains('hidden');
      });

      elements.forEach((el, index) => {
          window.setTimeout(() => {
              this.revealStudyElement(el);
          }, index * 40);
      });
  },
  
  showPage(pageId) {
      let studyArea = this.getEl('study-area');
      let bottomNav = this.getEl('bottom-nav');
      let globalHeader = this.getEl('global-header');

      if (pageId === 'study-area') {
          studyArea.classList.remove('hidden');
          if(bottomNav) bottomNav.style.transform = 'translateY(150%)';
          if(globalHeader) globalHeader.style.transform = 'translateY(-150%)';
      } else {
          studyArea.classList.add('hidden');
          if(bottomNav) bottomNav.style.transform = 'translateY(0)';
          if(globalHeader) globalHeader.style.transform = 'translateY(0)';
      }
  },
  
  toggleTheme(e) {
    let isDark = document.body.getAttribute('data-theme') === 'dark';
    let toggleAction = () => {
        if (isDark) { document.body.removeAttribute('data-theme'); localStorage.setItem('theme', 'light'); document.querySelectorAll('.theme-icon').forEach(icon => icon.innerText = 'light_mode'); } 
        else { document.body.setAttribute('data-theme', 'dark'); localStorage.setItem('theme', 'dark'); document.querySelectorAll('.theme-icon').forEach(icon => icon.innerText = 'dark_mode'); }
    };
    if (!document.startViewTransition) { toggleAction(); return; }
    const x = e ? (e.clientX || (e.touches && e.touches[0].clientX)) : window.innerWidth / 2;
    const y = e ? (e.clientY || (e.touches && e.touches[0].clientY)) : window.innerHeight / 2;
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    document.documentElement.classList.add('theme-switching');
    const transition = document.startViewTransition(toggleAction);
    transition.ready.then(() => {
        document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`], opacity: [0.5, 1] }, { duration: 400, easing: 'cubic-bezier(0.2, 0.0, 0, 1.0)', pseudoElement: '::view-transition-new(root)' });
        document.documentElement.animate({ filter: ['brightness(1) blur(0px)', 'brightness(0.6) blur(4px)'] }, { duration: 400, easing: 'cubic-bezier(0.2, 0.0, 0, 1.0)', pseudoElement: '::view-transition-old(root)' });
    });
    transition.finished.then(() => { document.documentElement.classList.remove('theme-switching'); });
  },
  
      renderRoots(rootsStr, maskText = false, maskMean = false) {
      if (!rootsStr) return '';
      let maskFixed = "■■■"; 
      return rootsStr.split('-').map((part, index) => {
          let match = part.match(/(.+?)\((.+?)\)/);
          if (match) {
              let tReal = escapeHTML(match[1]);
              let mReal = escapeHTML(match[2]);
              let t = maskText ? maskFixed : tReal;
              let m = maskMean ? maskFixed : mReal;
              return `<div class="root-capsule capsule-${index % 3}"><span class="r-text blur-target" data-real="${tReal}">${t}</span><span class="r-mean blur-target" data-real="${mReal}">${m}</span></div>`;
          }
          let tReal = escapeHTML(part);
          let t = maskText ? maskFixed : tReal;
          return `<div class="root-capsule capsule-${index % 3}"><span class="r-text blur-target" data-real="${tReal}">${t}</span></div>`;
      }).join('<span class="root-plus">+</span>');
  },

  syncRootsDisplay() {
      let rootsEl = this.getEl('w-roots');
      if (!rootsEl || rootsEl.style.display === 'none') return;
      
      let wWord = this.getEl('w-word');
      let wMean = this.getEl('w-meaning');
      
      let wordVis = wWord && wWord.style.display !== 'none' && !wWord.innerText.includes('■');
      let meanVis = wMean && wMean.style.display !== 'none' && !wMean.innerText.includes('■');

      rootsEl.querySelectorAll('.r-text').forEach(n => {
          n.innerHTML = wordVis ? (n.dataset.real || '■■■') : '■■■';
      });
      rootsEl.querySelectorAll('.r-mean').forEach(n => {
          n.innerHTML = meanVis ? (n.dataset.real || '■■■') : '■■■';
      });
  },



  getCardVisuals(typeStr, lang) {
    if (!typeStr) return { bg: 'var(--surface-container)', wm: '', tagsHTML: '' };
    
    // English words: use simple PoS abbreviations as watermark
    if (lang === 'en') {
        /*
         * 显示层继续兼容多种词性分隔符，
         * 即使旧数据尚未经过迁移，也能正确显示双色卡片。
         */
        let tags = String(typeStr)
            .split(/[・/／、,，;；|]+/)
            .map(type => type.trim())
            .filter(Boolean);

        if (tags.length === 0) {
            tags = [String(typeStr).trim()];
        }

        const getEnglishWatermark = type => {
            if (type.includes('名词') || type === '名') {
                return 'n.';
            }

            if (type.includes('动词') || type === '动') {
                return 'v.';
            }

            if (
                type.includes('形容词') &&
                !type.includes('形容动词')
            ) {
                return 'adj.';
            }

            if (type.includes('副词')) {
                return 'adv.';
            }

            if (type.includes('介词')) {
                return 'prep.';
            }

            if (
                type.includes('连词') ||
                type.includes('连接')
            ) {
                return 'conj.';
            }

            if (type.includes('代词')) {
                return 'pron.';
            }

            return type.charAt(0);
        };

        const watermarkItems = [
            ...new Set(
                tags
                    .map(getEnglishWatermark)
                    .filter(Boolean)
            )
        ].slice(0, 2);

        const enWm =
            watermarkItems.length > 1
                ? `<span class="wm-multi">${watermarkItems.join('・')}</span>`
                : (watermarkItems[0] || '');

        const getCat = type => {
            if (
                type.includes('形容动词') ||
                type.includes('形动') ||
                type.includes('形容词')
            ) {
                return { color: 'var(--bg-adj)' };
            }

            if (
                type.includes('动词') ||
                type === '动'
            ) {
                return { color: 'var(--bg-verb)' };
            }

            if (
                type.includes('名词') ||
                type === '名'
            ) {
                return { color: 'var(--bg-noun)' };
            }

            if (
                type.includes('副词') ||
                type.includes('接')
            ) {
                return { color: 'var(--bg-adv)' };
            }

            if (type.includes('代词')) {
                return { color: 'var(--bg-pronoun)' };
            }

            return { color: 'var(--bg-other)' };
        };

        const mainColors = [];

        const tagsHTML = tags
            .map(type => {
                const catInfo = getCat(type);
                mainColors.push(catInfo.color);

                return (
                    `<span class="type-capsule" ` +
                    `style="background: ${catInfo.color};">` +
                    `${escapeHTML(type)}` +
                    `</span>`
                );
            })
            .join('');

        const uniqueColors = [
            ...new Set(mainColors)
        ];

        let bg =
            uniqueColors[0] ||
            'var(--surface-container)';

        if (uniqueColors.length >= 2) {
            bg =
                `linear-gradient(` +
                `135deg, ` +
                `${uniqueColors[0]} 50%, ` +
                `${uniqueColors[1]} 50%` +
                `)`;
        }

        if (
            bg === 'var(--surface-container)' &&
            tagsHTML
        ) {
            bg = 'var(--bg-other)';
        }

        return {
            bg,
            wm: enWm,
            tagsHTML
        };
    }
    
    // Japanese words: keep original grammar character watermark
    let wmSet = new Set();
    if (typeStr.includes('自他')) { wmSet.add('が'); wmSet.add('を'); }
    else {
        if (typeStr.includes('自')) wmSet.add('が');
        if (typeStr.includes('他')) wmSet.add('を');
    }
    if (typeStr.includes('形动') || typeStr.includes('形容动词')) wmSet.add('な');
    if (typeStr.includes('名')) wmSet.add('の');

    let wmArray = Array.from(wmSet).slice(0, 2);
    let wm = wmArray.length > 1 ? `<span class="wm-multi">${wmArray.join('・')}</span>` : wmArray.join('');

    const getCat = (t) => {
        if (t.includes('形容动词') || t.includes('形动')) return { color: 'var(--bg-adj-na)' };
        if (t.includes('形')) return { color: 'var(--bg-adj)' };
        if (/[段変变動自他サ]/.test(t)) return { color: 'var(--bg-verb)' };
        if (t.includes('代')) return { color: 'var(--bg-pronoun)' };
        if (t.includes('名')) return { color: 'var(--bg-noun)' };
        if (t.includes('副') || t.includes('接')) return { color: 'var(--bg-adv)' };
        return { color: 'var(--bg-other)' }; 
    };
    let tags = typeStr.split('・').map(t => t.trim()).filter(t => t);
    if (tags.length === 0) tags = [typeStr]; 
    let mainColors = [];
    let tagsHTML = tags.map(t => {
        let catInfo = getCat(t); mainColors.push(catInfo.color);
        return `<span class="type-capsule" style="background: ${catInfo.color};">${t}</span>`;
    }).join('');
    let uniqueColors = [...new Set(mainColors)];
    let bg = uniqueColors[0] || 'var(--surface-container)';
    if (uniqueColors.length >= 2) { bg = `linear-gradient(135deg, ${uniqueColors[0]} 50%, ${uniqueColors[1]} 50%)`; }
    if (bg === 'var(--surface-container)' && tagsHTML) {
        bg = 'var(--bg-other)';
    }
    return { bg, wm, tagsHTML };
  },

  updateComboBadge() {
      let badge = this.getEl('combo-badge');
      if (!badge) return;

      if (Model.state.mode !== 'rote-learning' && Model.state.mode !== 'dual-track' && Model.state.mode !== 'memory-test') {
          badge.classList.remove('active', 'tier-2', 'tier-3');
          return;
      }
      
      let count = Model.state.comboCount;
      if (count > 0) {
          badge.innerText = `Combo x${count}`;
          badge.className = 'combo-badge active';
          void badge.offsetWidth; 
          badge.classList.add('combo-pop');

          if (count >= 10) badge.classList.add('tier-3');
          else if (count >= 5) badge.classList.add('tier-2');
      } else {
          badge.className = 'combo-badge';
      }
  },
  
  updatePixelMatrix() {
    let c = this.getEl('pixel-matrix');
    let mode = Model.state.mode;
    
    let totalPixels = 10;
    let displayCurrent = 0;
    
    if (mode === 'memory-test') {
        let total = Model.state.mtBaseQueue.length;
        totalPixels = total;
        displayCurrent = total - Model.state.studyQueue.length;
    } else if (mode === 'filter-test') {
        let totalWords = Model.state.studyQueue.length;
        if (totalWords <= 100) {
            totalPixels = totalWords;
            displayCurrent = Model.state.currentIndex;
        } else {
            totalPixels = 10;
            displayCurrent = Math.floor((Model.state.currentIndex / totalWords) * 10);
        }
    } else if (mode === 'rote-learning') {
        totalPixels = 10;
        let ratio = Model.state.initialQueueLength ? (Model.state.currentIndex / Model.state.initialQueueLength) : 0;
        let currentProgress = Math.floor(ratio * 10);
        
        if (currentProgress > Model.state.maxProgressSeen) {
            Model.state.maxProgressSeen = currentProgress;
        }
        displayCurrent = Model.state.maxProgressSeen;
    } else if (mode === 'pendulum' || mode === 'dual-track') {
        totalPixels = Model.state.studyQueue.length;
        displayCurrent = Model.state.currentIndex;
    }
    
        if (displayCurrent > totalPixels) displayCurrent = totalPixels;

    let baseCount = Model.state.studyQueue.length;
    if (mode === 'memory-test') {
        baseCount = Model.state.mtBaseQueue.length;
    } else if (mode === 'rote-learning' || mode === 'pendulum' || mode === 'dual-track') {
        baseCount = Model.state.uniqueWordCount;
    }
    
    if (baseCount > 100 || mode === 'rote-learning' || mode === 'memory-test') {
        c.classList.add('matrix-legacy');
    } else {
        c.classList.remove('matrix-legacy');
    }

    if (totalPixels <= 10) {
        c.classList.add('compact-mode');
    } else {
        c.classList.remove('compact-mode');
    }

    while (c.children.length < totalPixels) { let p = document.createElement('div'); p.className = 'pixel'; c.appendChild(p); }

    while (c.children.length > totalPixels) { c.removeChild(c.lastChild); }
    
    Array.from(c.children).forEach((p, i) => {
      p.className = (i < displayCurrent) ? 'pixel filled' : (i === displayCurrent ? 'pixel current' : 'pixel');
      p.style.setProperty('--fill-color', ['#e0d7cd','#d1c5b8','#c2b4a3','#b2a18d','#a28f78','#917e62','#816d4d','#705b38','#5f4923','#4e370e'][Math.min(9, Math.floor((i/totalPixels)*10))]);
    });
  },



  renderGroupRangePicker() {
      const container =
          this.getEl('group-list-container');

      if (!container) {
          return;
      }

      container.innerHTML = '';
      container.className =
          'bs-scrollable-content group-range-sections';
      container.classList.remove('is-empty');

      try {
          const currentLang =
              Model.state.currentLangMode;

          const isEnglish =
              currentLang === 'en';

          const entries = [];

          /*
           * 当前语言下的真实词库直接分组展示。
           * 不再先切换标签，再进行第二次选择。
           */
          Model.folders.forEach(folder => {
              if (
                  (
                      Model.folderLangs[folder] ||
                      'ja'
                  ) !== currentLang
              ) {
                  return;
              }

              entries.push({
                  cat:
                      folder === '默认词库'
                          ? 'default'
                          : folder,
                  text: folder,
                  icon:
                      folder === '默认词库'
                          ? 'library_books'
                          : 'folder',
                  tone: 'library'
              });
          });

          /*
           * 学习状态与薄弱项也放在同一页中，
           * 形成与“选择词库”一致的分栏式结构。
           */
          entries.push(
              {
                  cat: 'virtual_starred',
                  text: '收藏词汇',
                  icon: 'star',
                  tone: 'favorite'
              },
              {
                  cat: 'virtual_cleared',
                  text: '完全通关',
                  icon: 'workspace_premium',
                  tone: 'review'
              },
              {
                  cat: 'virtual_uncleared',
                  text: '所有未通关',
                  icon: 'hourglass_empty',
                  tone: 'review'
              },
              {
                  cat: 'virtual_miss_kanji',
                  text: isEnglish
                      ? '未掌握拼写'
                      : '未了解汉字',
                  icon: 'spellcheck',
                  tone: 'weak'
              },
              {
                  cat: 'virtual_miss_kana',
                  text: isEnglish
                      ? '未掌握听力'
                      : '未了解读音',
                  icon: isEnglish
                      ? 'headphones'
                      : 'record_voice_over',
                  tone: 'weak'
              },
              {
                  cat: 'virtual_miss_meaning',
                  text: '未了解释义',
                  icon: 'translate',
                  tone: 'weak'
              }
          );

          const selectedGroup =
              Model.state.currentGroupKey ||
              localStorage.getItem(
                  'lastCustomGroupVal'
              ) ||
              '';

          const GROUP_SIZE = ROTE_CORE.GROUP_SIZE;
          const GROUP_STEP = ROTE_CORE.GROUP_STEP;
          const fragment =
              document.createDocumentFragment();

          let visibleSectionCount = 0;

          entries.forEach(entry => {
              const words =
                  Model.db.filter(word => {
                      return (
                          (
                              word.lang ||
                              'ja'
                          ) === currentLang &&
                          Model.checkFilter(
                              word,
                              entry.cat
                          )
                      );
                  });

              /* 空分类不占据抽屉空间。 */
              if (words.length === 0) {
                  return;
              }

              visibleSectionCount++;

              const section =
                  document.createElement(
                      'section'
                  );

              section.className =
                  `group-range-section ` +
                  `is-${entry.tone}`;

              const heading =
                  document.createElement(
                      'div'
                  );

              heading.className =
                  'group-range-section-head';

              heading.innerHTML = `
                  <span
                      class="group-range-section-icon material-symbols-rounded"
                      aria-hidden="true"
                  >
                      ${entry.icon}
                  </span>

                  <span
                      class="group-range-section-title"
                  >
                      ${escapeHTML(entry.text)}
                  </span>

                  <span
                      class="group-range-section-count"
                  >
                      ${words.length} 词
                  </span>
              `;

              const grid =
                  document.createElement(
                      'div'
                  );

              grid.className =
                  'group-range-section-grid';

              let groupIndex = 0;

              while (
                  groupIndex * GROUP_STEP <
                  words.length
              ) {
                  const range = ROTE_CORE.getGroupRange(
                      groupIndex,
                      words.length
                  );
                  const startIndex = range.start;
                  const endIndex = range.end;

                  const groupValue =
                      `group|${entry.cat}|${groupIndex}`;

                  const selected =
                      selectedGroup === groupValue;

                  const clearCount =
                      Model.mtGroupClears[
                          groupValue
                      ] || 0;

                  const button =
                      document.createElement(
                          'div'
                      );

                  button.className =
                      `bs-option group-range-option ` +
                      `${selected ? 'selected' : ''}`;

                  button.setAttribute(
                      'tabindex',
                      '0'
                  );

                  button.setAttribute(
                      'role',
                      'button'
                  );

                  button.setAttribute(
                      'aria-pressed',
                      selected ? 'true' : 'false'
                  );

                  let badgeHTML = '';

                  if (
                      entry.cat !==
                          'virtual_uncleared' &&
                      (
                          clearCount > 0 ||
                          entry.cat ===
                              'virtual_cleared'
                      )
                  ) {
                      let badgeClass =
                          'hanko-bronze';

                      if (
                          clearCount >= 10 ||
                          entry.cat ===
                              'virtual_cleared'
                      ) {
                          badgeClass =
                              'hanko-diamond';
                      } else if (
                          clearCount >= 5
                      ) {
                          badgeClass =
                              'hanko-gold';
                      } else if (
                          clearCount >= 3
                      ) {
                          badgeClass =
                              'hanko-silver';
                      }

                      badgeHTML = `
                          <span
                              class="hanko-badge ${badgeClass}"
                              aria-hidden="true"
                          ></span>
                      `;
                  }

                  const rangeTitle =
                      words.length <= GROUP_SIZE
                          ? `全部 ${words.length} 词`
                          : (
                              `第 ${startIndex + 1}` +
                              `–${endIndex} 词`
                          );

                  button.innerHTML = `
                      <span
                          class="group-range-icon material-symbols-rounded"
                          aria-hidden="true"
                      >
                          view_module
                      </span>

                      <span
                          class="group-range-copy"
                      >
                          <strong>
                              ${rangeTitle}
                          </strong>

                          <small>
                              ${endIndex - startIndex}
                              个词
                          </small>
                      </span>

                      ${badgeHTML}

                      <span
                          class="group-range-check material-symbols-rounded"
                          aria-hidden="true"
                      >
                          check
                      </span>
                  `;

                  const displayText =
                      `${entry.text} ` +
                      `(第 ${startIndex + 1}` +
                      `-${endIndex} 词)`;

                  const choose = () => {
                      Hardware.playSound('click');
                      Hardware.vibrate(15);

                      Model.state.currentGroupKey =
                          groupValue;

                      Model.state.currentGroupLabel =
                          displayText;

                      const textElement =
                          this.getEl(
                              'custom-group-text'
                          );

                      if (textElement) {
                          textElement.innerText =
                              displayText;
                      }

                      localStorage.setItem(
                          'lastCustomGroupVal',
                          groupValue
                      );

                      localStorage.setItem(
                          'lastCustomGroupTxt',
                          displayText
                      );

                      window.toggleModal(
                          'group-select-overlay',
                          false
                      );
                  };

                  button.addEventListener(
                      'click',
                      choose
                  );

                  button.addEventListener(
                      'keydown',
                      event => {
                          if (
                              event.key !== 'Enter' &&
                              event.key !== ' '
                          ) {
                              return;
                          }

                          event.preventDefault();
                          choose();
                      }
                  );

                  grid.appendChild(button);
                  groupIndex++;

                  if (groupIndex > 1000) {
                      break;
                  }
              }

              section.appendChild(heading);
              section.appendChild(grid);
              fragment.appendChild(section);
          });

          if (visibleSectionCount === 0) {
              container.classList.add(
                  'is-empty'
              );

              container.innerHTML = `
                  <div class="group-range-empty">
                      <span
                          class="material-symbols-rounded"
                          aria-hidden="true"
                      >
                          spa
                      </span>

                      <strong>
                          当前没有可选择的学习范围
                      </strong>
                  </div>
              `;

              return;
          }

          container.appendChild(fragment);
      } catch (error) {
          console.error(
              '[Group Range Picker]',
              error
          );

          container.classList.add(
              'is-empty'
          );

          container.innerHTML = `
              <div
                  class="group-range-empty is-error"
              >
                  <span
                      class="material-symbols-rounded"
                      aria-hidden="true"
                  >
                      error
                  </span>

                  <strong>
                      加载出错，请重试
                  </strong>
              </div>
          `;
      }
  },

  updateWordbankManagementUI() {
    const isManaging = Model.state.batchMode;
    const selectedCount = Model.state.selectedSet.size;

    const batchBar = this.getEl('batch-bar');
    const countNum = this.getEl('batch-count-num');
    const manageBtn = this.getEl('wb-manage-toggle');
    const manageIcon = this.getEl('manage-icon');
    const manageLabel = this.getEl('manage-label');
    const moveBtn = this.getEl('btn-batch-move');
    const editBtn = this.getEl('btn-batch-edit');
    const deleteBtn = this.getEl('btn-batch-del');
    const grid = this.getEl('wb-grid');

    if (batchBar) {
        batchBar.style.display = isManaging ? 'flex' : 'none';
    }

    if (countNum) {
        countNum.innerText = selectedCount;
    }

    if (manageBtn) {
        manageBtn.classList.toggle('active', isManaging);
        manageBtn.setAttribute(
            'aria-pressed',
            String(isManaging)
        );
        manageBtn.title = isManaging
            ? '完成管理'
            : '管理词汇';
    }

    if (manageIcon) {
        manageIcon.innerText = isManaging
            ? 'done'
            : 'edit_note';
    }

    if (manageLabel) {
        manageLabel.innerText = isManaging
            ? '完成'
            : '管理';
    }

    if (grid) {
        grid.classList.toggle(
            'is-managing',
            isManaging
        );
    }

    const hasSelection = selectedCount > 0;

    if (moveBtn) {
        moveBtn.disabled = !hasSelection;
    }

    if (deleteBtn) {
        deleteBtn.disabled = !hasSelection;
    }

    if (editBtn) {
        editBtn.hidden = selectedCount !== 1;
    }
  },

  updateWordbankUI() {
    let searchInput = this.getEl('wb-search-input');
    if (searchInput) searchInput.placeholder = Model.state.currentLangMode === 'en' ? '搜索英文、音标或释义...' : '搜索汉字、假名或释义...';
    
    let modeSel = this.getEl('next-display-mode');
    if (modeSel) {
        const isEnglishBook = Model.state.currentLangMode === 'en';
        modeSel.options[0].text = '全显';
        modeSel.options[1].text = isEnglishBook ? '英文' : '汉字';
        modeSel.options[2].text = isEnglishBook ? '音标' : '假名';
        modeSel.options[3].text = '释义';
        modeSel.options[0].style.display = '';
    }

    this.updateWordbankManagementUI();

    let selFilter = this.getEl('wb-folder-filter'); 
    let currentVal = selFilter.value;
    selFilter.innerHTML = ''; 
    selFilter.add(new Option('查看所有词汇', 'all'));
    selFilter.add(new Option('收藏词汇', 'virtual_starred'));
    selFilter.add(new Option('完全通关词汇', 'virtual_cleared'));
        selFilter.add(new Option('所有未通关', 'virtual_uncleared'));
    selFilter.add(new Option(Model.state.currentLangMode === 'en' ? '专项图鉴: 拼写掌握(黄)' : '专项图鉴: 汉字了解(黄)', 'virtual_know_kanji'));
    selFilter.add(new Option(Model.state.currentLangMode === 'en' ? '专项图鉴: 听力掌握(红)' : '专项图鉴: 读音了解(红)', 'virtual_know_kana'));
    selFilter.add(new Option('专项图鉴: 释义了解(白)', 'virtual_know_meaning'));

    
    Model.folders.forEach(f => { 
      if ((Model.folderLangs[f] || 'ja') !== Model.state.currentLangMode) return;
      selFilter.add(new Option(f, f)); 
    });
    
    let lastFolder = localStorage.getItem('lastSelectedFolder') || currentVal;
    if(Array.from(selFilter.options).some(opt => opt.value === lastFolder)) {
        selFilter.value = lastFolder;
    } else {
        selFilter.value = 'all';
    }
    selFilter.dispatchEvent(new Event('facade-update'));

        // 以当前词书语种作为判断基准，而非筛选器值
    const selLang = Model.state.currentLangMode;
        document.querySelectorAll('.jp-only').forEach(el => {
        el.style.display = selLang === 'en' ? 'none' : '';
    });
    document.querySelectorAll('.en-only').forEach(el => {
        el.style.display = selLang === 'en' ? 'flex' : 'none';
        if(el.classList.contains('edit-input-group')) el.style.display = selLang === 'en' ? 'block' : 'none';
    });


    // 动态更新词库视图设置的按钮文本，赋予其英语模式下的新功能
    let blurWordBtn = document.querySelector('.vs-blur-btn[data-val="word"]');
    if (blurWordBtn) blurWordBtn.innerText = selLang === 'en' ? '仅显英文' : '仅显单词';

    let blurKanaBtn = document.querySelector('.vs-blur-btn[data-val="kana"]');
    if (blurKanaBtn) {
        blurKanaBtn.innerText = selLang === 'en' ? '仅显音标' : '仅显假名';
        blurKanaBtn.classList.remove('jp-only'); // 挣脱日语专属束缚，允许在英语模式下显示
    }


    const groupOverlay =
        this.getEl('group-select-overlay');

    if (
        groupOverlay?.classList.contains('active')
    ) {
        this.renderGroupRangePicker();
    }
  },

  renderDashboard() {
    // 英语模式下显示三杠（听力杠替代读音杠），标签文字动态切换
    const currentLang = Model.getCurrentLang();
    const kanaRow = this.getEl('prog-row-kana');
    if (kanaRow) kanaRow.style.display = 'flex';
    const kanaBarLabel = document.getElementById('kana-bar-label');
    if (kanaBarLabel) kanaBarLabel.innerText = currentLang === 'en' ? '听力' : '读音';

let dbTotalEl = this.getEl('db-total-count');
    if (dbTotalEl) dbTotalEl.innerText = Model.db.filter(w => (w.lang || 'ja') === Model.state.currentLangMode).length;    
    let stats = Model.calculateStats();
    this.getEl('total-days').innerText = stats.totalDays;
    this.getEl('streak-days').innerText = stats.streak;

    let clearedWordsCount = 0, kanjiCount = 0, kanaCount = 0, meaningCount = 0;
    
    // Build word → lang lookup for accurate counting
    const wordLangMap = {};
    Model.db.forEach(w => { wordLangMap[Model.getWordId(w)] = w.lang || 'ja'; });
    
Object.entries(Model.mtWordClears).forEach(([wordKey, st]) => {
        if (typeof st === 'object') {
            const lang = wordLangMap[wordKey] || 'ja';
            if (lang !== Model.state.currentLangMode) return;
            // 兼容旧英语格式 {word, meaning} → 映射为三杠
            if (lang === 'en' && st.word !== undefined) {
                st = { kanji: st.word || false, kana: false, meaning: st.meaning || false };
            }
            // 统一三杠判断
            if (st.kanji && st.kana && st.meaning) clearedWordsCount++;
            if (st.kanji) kanjiCount++;
            if (st.kana) kanaCount++;
            if (st.meaning) meaningCount++;
        }
    });

    let totalWordsCount = Model.db.filter(w => (w.lang || 'ja') === Model.state.currentLangMode).length;
    let masteryPercent = totalWordsCount === 0 ? 0 : ((clearedWordsCount / totalWordsCount) * 100).toFixed(1);
    let pKanji = totalWordsCount === 0 ? 0 : ((kanjiCount / totalWordsCount) * 100).toFixed(1);
    let pKana = totalWordsCount === 0 ? 0 : ((kanaCount / totalWordsCount) * 100).toFixed(1);
    let pMeaning = totalWordsCount === 0 ? 0 : ((meaningCount / totalWordsCount) * 100).toFixed(1);

    if (this.getEl('mastery-count')) this.getEl('mastery-count').innerText = clearedWordsCount;
    if (this.getEl('mastery-total')) this.getEl('mastery-total').innerText = totalWordsCount;
    if (this.getEl('mastery-percent')) this.getEl('mastery-percent').innerText = `(${masteryPercent}%)`;
    
    setTimeout(() => {
        if (this.getEl('mastery-bar')) this.getEl('mastery-bar').style.width = `${masteryPercent}%`;
        
        if (this.getEl('prog-bar-kanji')) this.getEl('prog-bar-kanji').style.width = `${pKanji}%`;
        if (this.getEl('prog-bar-kana')) this.getEl('prog-bar-kana').style.width = `${pKana}%`;
        if (this.getEl('prog-bar-meaning')) this.getEl('prog-bar-meaning').style.width = `${pMeaning}%`;
        
        if (this.getEl('prog-txt-kanji')) this.getEl('prog-txt-kanji').innerHTML = `${kanjiCount} <span style="font-size:0.85em; opacity:0.6;">(${pKanji}%)</span>`;
        if (this.getEl('prog-txt-kana')) this.getEl('prog-txt-kana').innerHTML = `${kanaCount} <span style="font-size:0.85em; opacity:0.6;">(${pKana}%)</span>`;
        if (this.getEl('prog-txt-meaning')) this.getEl('prog-txt-meaning').innerHTML = `${meaningCount} <span style="font-size:0.85em; opacity:0.6;">(${pMeaning}%)</span>`;
    }, 50);

    let lastTxt = localStorage.getItem('lastCustomGroupTxt');
    if (!lastTxt) {
        let defFolder = Model.folders.find(f => (Model.folderLangs[f] || 'ja') === Model.state.currentLangMode) || '默认词库';
        lastTxt = `${defFolder} (第 1-10 词)`;
    }
    this.getEl('custom-group-text').innerText = lastTxt;

    this.updateTestSelects();

        let displaySel = this.getEl('test-display-select');
    if (displaySel) {
        let isEn = Model.state.currentLangMode === 'en';
        displaySel.options[0].text = isEn ? '专攻英文拼写 (点亮黄杠)' : '专攻汉字辨认 (点亮黄杠)';
        displaySel.options[1].text = isEn ? '专攻假名辨认' : '专攻假名辨认 (点亮红杠)';
        displaySel.options[2].text = isEn ? '专攻听力辨音 (点亮红杠)' : '专攻听力辨音 (点亮红杠)';
        
        // 英语模式下直接隐藏用不到的“专攻假名”选项
        displaySel.options[1].style.display = isEn ? 'none' : '';
    }

    let lastTestDisplay = localStorage.getItem('lastTestDisplay') || 'kana';
    if (displaySel && Array.from(displaySel.options).some(o => o.value === lastTestDisplay)) {

        displaySel.value = lastTestDisplay;
        displaySel.dispatchEvent(new Event('facade-update'));
    }
    
    let t = new Date().toLocaleDateString('zh-CN'); let btn = this.getEl('btn-long-press');
    if (btn) {
        let isPunched = Model.records.some(r => r.date === t && r.type === 'daily_punch');
        if(isPunched) {
            btn.className = 'btn-long-press done';
            btn.innerHTML = `<span class="lp-text"><span class="material-symbols-rounded" style="font-size:1.6rem;">task_alt</span> 今日已完成</span>`;
        } else {
            btn.className = 'btn-long-press';
            btn.innerHTML = `<div class="lp-bg"></div><span class="lp-text"><span class="material-symbols-rounded" style="font-size:1.6rem;">fingerprint</span> 长按打卡</span>`;
        }
    }
  },

  updateTestSelects() {
      let testSel = this.getEl('test-range-select');
      let defFolder = Model.folders.find(f => (Model.folderLangs[f] || 'ja') === Model.state.currentLangMode) || '默认词库';
      let currentTest = testSel.value || localStorage.getItem('lastTestRange') || defFolder;

      testSel.innerHTML = '';
      
      let options = [];
      Model.folders.forEach(f => {
          if ((Model.folderLangs[f] || 'ja') === Model.state.currentLangMode) {
              options.push({ text: f, val: f });
          }
      });
      options.push(
          { text: '收藏词汇', val: 'virtual_starred' },
          { text: '完全通关词汇', val: 'virtual_cleared' },
                    { text: '所有未通关', val: 'virtual_uncleared' },
          { text: Model.state.currentLangMode === 'en' ? '专项攻坚: 未掌握拼写(黄)' : '专项攻坚: 未了解汉字(黄)', val: 'virtual_miss_kanji' },
          { text: Model.state.currentLangMode === 'en' ? '专项攻坚: 未掌握听力(红)' : '专项攻坚: 未了解读音(红)', val: 'virtual_miss_kana' },
          { text: '专项攻坚: 未了解释义(白)', val: 'virtual_miss_meaning' },
          { text: Model.state.currentLangMode === 'en' ? '复习巩固: 已掌握拼写(黄)' : '复习巩固: 已了解汉字(黄)', val: 'virtual_know_kanji' },
          { text: Model.state.currentLangMode === 'en' ? '复习巩固: 已掌握听力(红)' : '复习巩固: 已了解读音(红)', val: 'virtual_know_kana' },
          { text: '复习巩固: 已了解释义(白)', val: 'virtual_know_meaning' }

      );

      options.forEach(opt => { testSel.add(new Option(opt.text, opt.val)); });

if (Array.from(testSel.options).some(o => o.value === currentTest)) testSel.value = currentTest;
      else if (testSel.options.length > 0) testSel.value = testSel.options[0].value;
      testSel.dispatchEvent(new Event('facade-update'));  },

    renderStudyCard(anim = 'none') {
    let idx = Model.state.studyQueue[Model.state.currentIndex];
    let w = Model.db[idx];

    if (!Number.isInteger(idx) || !w) {
        Model.state.isAnimating = false;
        showToast('当前学习词条无法读取，请重新选择词组');
        this.getEl('btn-exit-study')?.click();
        return;
    }

    let mode = this.getEl('next-display-mode').value;
    
    let isMemTest = (Model.state.mode === 'memory-test');
    let isRote = (Model.state.mode === 'rote-learning');
    let isFilterTest = (Model.state.mode === 'filter-test');
    // 切卡时自动收起 AI 解析面板
let aiPanel = View.getEl('ai-inline-panel');
if (aiPanel) aiPanel.classList.add('hidden');
    let forceRoteFull = false;
    if (isRote) {
    let isFirstAppearance = ROTE_CORE.isFirstAppearance(
        Model.state.studyQueue,
        Model.state.currentIndex
    );
    if (isFirstAppearance) { 
        forceRoteFull = true; 
        mode = 'all'; 
        Model.state.mtStep = 1; 
    }
}

    if (Model.state.mode === 'dual-track') {
        Model.state.dtWordAppearanceMap[idx] = (Model.state.dtWordAppearanceMap[idx] || 0) + 1;
        let count = Model.state.dtWordAppearanceMap[idx];
        Model.state.dtSubMode = ((count - 1) % 5 < 3) ? 'choice' : 'spell';
        mode = 'all';
    }

    if (isMemTest) {
        let remain = Model.state.studyQueue.length;
        let total = Model.state.mtBaseQueue.length;
        this.getEl('progress-text').innerText = `Round ${Model.state.mtRound} : ${total - remain + 1} / ${total}`;
    } else {
        this.getEl('progress-text').innerText = `${Model.state.currentIndex + 1} / ${Model.state.studyQueue.length}`;
    }
    
    if (Model.state.mode === 'pendulum' || Model.state.mode === 'dual-track' || isMemTest || isRote || isFilterTest) {
        this.updatePixelMatrix(); 
    }

    let card = this.getEl('flash-card');
    let visuals = this.getCardVisuals(w.type, w.lang);
    card.querySelector('.watermark-layer').style.background = visuals.bg;
    this.getEl('flash-watermark').innerHTML = visuals.wm; 
    
    card.classList.remove(
    'anim-slide-next',
    'anim-slide-prev',
    'anim-slide-out-left',
    'anim-slide-out-right',
    'anim-slide-in-right',
    'anim-slide-in-left',
    'study-card-exit-next',
    'study-card-exit-prev',
    'study-card-enter-next',
    'study-card-enter-prev',
    'study-feedback-correct',
    'study-feedback-wrong',
    'shimmering'
);
void card.offsetWidth;
    
    // 提取公共无障碍播报逻辑，自动过滤掉非纯文本的假名修饰符
    const triggerSRAnnouncement = () => {
        let announcer = document.getElementById('sr-announcer');
        if (announcer && w && w.word && w.word !== 'HINT_CARD') {
            const isEn = w.lang === 'en';
            if (isEn) {
                announcer.innerText = `Current word: ${w.word}. Meaning: ${w.meaning}.`;
            } else {
                let cleanKana = (w.kana || '').replace(/[【】\[\]()]/g, '');
                announcer.innerText = `当前单词：${w.word}。假名：${cleanKana}。`;
            }
        }
    };

    if (anim !== 'none') {
        Model.state.isAnimating = true;

        const exitClass = anim === 'next'
            ? 'study-card-exit-next'
            : 'study-card-exit-prev';

        const enterClass = anim === 'next'
            ? 'study-card-enter-next'
            : 'study-card-enter-prev';

        card.classList.add(exitClass);

        window.setTimeout(() => {
            this.updateCardContent(
                w,
                visuals,
                mode,
                forceRoteFull,
                isMemTest,
                isRote,
                isFilterTest
            );

            triggerSRAnnouncement();

            card.classList.remove(exitClass);
            void card.offsetWidth;
            card.classList.add(enterClass);

            window.setTimeout(() => {
                card.classList.remove(enterClass);
                Model.state.isAnimating = false;
            }, 330);
        }, 180);
    } else {
        this.updateCardContent(
            w,
            visuals,
            mode,
            forceRoteFull,
            isMemTest,
            isRote,
            isFilterTest
        );

        triggerSRAnnouncement();
        Model.state.isAnimating = false;
    }
  },


    updateCardContent(w, visuals, mode, forceRoteFull, isMemTest, isRote, isFilterTest) {
    const isEnglish = w.lang === 'en';
    
    // 动态修改提示按钮的文案
    let hintBtn = this.getEl('btn-mt-show-hint');
    if (hintBtn) {
        hintBtn.innerText = isEnglish ? '听不清？点击朗读例句' : '听不清？显示假名';
    }

    this.getEl('mt-blind-audio-ui').classList.add('hidden');

    this.getEl('w-word').style.display = 'block';
        this.getEl('w-kana').style.display = isEnglish ? 'block' : 'block';
    this.getEl('w-meaning').style.display = 'block';
    this.getEl('w-type').style.display = 'flex';
    this.getEl('w-example-box').style.display = 'block';


    let mask = (str) => '■'.repeat(Array.from(str || '').length);
    let maskFixed = "■■■"; 

    if (isFilterTest) {
        let displayMode = this.getEl('test-display-select').value || 'kana'; 
        // 英语模式：kana 维度不存在，映射为 word；audio 维度保留为听力辨音
        if (isEnglish && displayMode === 'kana') {
            displayMode = 'word';
        }
        let st = Model.state.ftState; 
        let hint = Model.state.ftHint;
        let showKanaHint = Model.state.ftShowKanaHint; 

        let isVisible = (field) => {
            if (st === 'C') return true;
            if (displayMode === field) return true;
            if (st === 'B' && hint === field) return true;
            return false;
        };

                let showW = isVisible('word');
        let showK = (!isEnglish && isVisible('kana')) || showKanaHint; 
        let showM = isVisible('meaning');
        let showA = isVisible('audio');

        // 引入动态字号计算引擎，防止筛选检验模式长单词排版崩溃
        let finalWord = showW ? w.word : maskFixed;
        let wWordEl = this.getEl('w-word');
        wWordEl.innerText = finalWord;
        
        let wLen = Array.from(finalWord || '').length;
        if (isEnglish) {
            if (wLen >= 14) wWordEl.style.fontSize = '1.8rem';
            else if (wLen >= 11) wWordEl.style.fontSize = '2.2rem';
            else if (wLen >= 8) wWordEl.style.fontSize = '2.8rem';
            else if (wLen >= 5) wWordEl.style.fontSize = '3.5rem';
            else wWordEl.style.fontSize = '4.2rem';
        } else {
            if (wLen >= 10) wWordEl.style.fontSize = '1.8rem';
            else if (wLen >= 7) wWordEl.style.fontSize = '2.2rem';
            else if (wLen >= 5) wWordEl.style.fontSize = '2.6rem';
            else wWordEl.style.fontSize = ''; 
        }

        if (!isEnglish) {

            this.getEl('w-kana').innerText = showK ? (w.kana || '').replace(/[【】\[\]()]/g,'') : maskFixed;
            this.getEl('w-kana').style.display = 'block';
        } else {
            // 恢复为纯文本（背词界面已有专门的全局发音按钮）
            this.getEl('w-kana').innerText = showK ? (w.phonetic || '') : maskFixed;
            this.getEl('w-kana').style.display = 'block';
        }


        this.getEl('w-meaning').innerText = showM ? w.meaning : maskFixed;
        this.getEl('w-type').innerHTML = visuals.tagsHTML;
        this.getEl('w-type').style.display = st === 'C' ? 'flex' : 'none'; 
        
        let rootsEl = this.getEl('w-roots');
        let showRootsPref = localStorage.getItem('showRoots') !== 'false';
        if (rootsEl) {
            if (isEnglish && w.roots && showRootsPref) {
                // 根据主单词和主释义的显示状态，决定是否对词根的对应部分打码(■■■)
                rootsEl.innerHTML = this.renderRoots(w.roots, !showW, !showM);
                rootsEl.style.display = 'flex';
            } else {
                rootsEl.style.display = 'none';
            }
        }

        ['word','kana','meaning','type'].forEach(k => {
             let el = this.getEl(`w-${k}`);
             if(!el) return;
             el.className = (k === 'word') ? 'word-main' : (k === 'type' ? 'type-row' : `${k}-row`);
        });
        if(rootsEl) rootsEl.className = 'roots-row';

                let blindAudioUi = this.getEl('mt-blind-audio-ui');
        if (st === 'C') {
            blindAudioUi.classList.add('hidden');
            this.getEl('w-word').style.display = 'block';
        } else {
            if (displayMode === 'audio') {
                blindAudioUi.classList.remove('hidden');
                if (!showW) this.getEl('w-word').style.display = 'none';
            }
        }

        this.getEl('btn-speaker').style.display = (st === 'C' || (showA && displayMode !== 'audio')) ? 'block' : 'none';
        
        if ((st === 'A' && displayMode === 'audio') || (st === 'B' && hint === 'audio')) {

             Hardware.speakWord(w);
        }

        this.renderExampleBox(w.example, 'w-example-box', 'normal', w);
        this.getEl('w-example-box').style.display = st === 'C' ? 'block' : 'none';
        this.getEl('w-example-box').className = 'dt-example-box';

        this.getEl('capsule-pendulum').classList.add('hidden');
        this.getEl('dual-track-ui').classList.add('hidden');
        this.getEl('memory-test-ui').classList.add('hidden');
        this.getEl('btn-display-mode-trigger').style.display = 'none';
        this.getEl('star-btn').style.display = st === 'C' ? 'block' : 'none'; 
        this.getEl('star-icon').style.fontVariationSettings = Model.isStarred(w) ? "'FILL' 1" : "'FILL' 0";

        if (st === 'C') {
            this.getEl('capsule-filter-test').classList.add('hidden');
            this.getEl('capsule-filter-judge').classList.remove('hidden');
        } else {
            this.getEl('capsule-filter-judge').classList.add('hidden');
            this.getEl('capsule-filter-test').classList.remove('hidden');
            let blurBtn = this.getEl('ft-blur');
            if (st === 'B') blurBtn.style.display = 'none'; 
            else blurBtn.style.display = 'flex';
        }
        
        this.syncRootsDisplay();
        return; 
    }

    let showWord = true, showKana = !isEnglish, showMeaning = true;

    let isDtSpell = (Model.state.mode === 'dual-track' && Model.state.dtSubMode === 'spell');
    let isDtChoice = (Model.state.mode === 'dual-track' && Model.state.dtSubMode === 'choice');

    // 🚀 针对英语模式的往复测验：拼写阶段隐藏英文单词（变马赛克），并确保释义可见
    if (isEnglish && isDtSpell) {
        showWord = false;
    }
    
        if (isRote && mode !== 'all' && !forceRoteFull) {
        if (mode === 'word') {
            if (isEnglish) {
                /*
                 * 英语“英文”模式：
                 * 先显示释义，让用户根据释义拼写英文。
                 */
                showWord = false;
                showKana = false;
                showMeaning = true;
            } else {
                showKana = Model.state.mtStep > 1;
                showMeaning = false;
            }
        } else if (mode === 'kana') {
            if (isEnglish) {
                showWord = false;
                showKana = true;
                showMeaning = false;
            } else {
                showWord = Model.state.mtStep > 1;
                showMeaning = false;
            }
        } else if (mode === 'meaning') {
            showWord = false;
            showKana = isEnglish ? false : Model.state.mtStep > 1;
            showMeaning = true;
        }
    }

    const wordIsMasked = !showWord && !isMemTest;

    /*
     * 英文单词隐藏时固定使用三个方块。
     * 不再按照单词字母数量生成方块，避免长单词冲出卡片。
     */
    let finalWord = wordIsMasked
        ? (isEnglish ? maskFixed : mask(w.word))
        : w.word;

    let wWordEl = this.getEl('w-word');
    wWordEl.innerText = finalWord;

    let wLen = Array.from(w.word || '').length;

    if (isEnglish) {
        if (wordIsMasked) {
            wWordEl.style.fontSize = '2.8rem';
        } else if (wLen >= 14) {
            wWordEl.style.fontSize = '1.8rem';
        } else if (wLen >= 11) {
            wWordEl.style.fontSize = '2.2rem';
        } else if (wLen >= 8) {
            wWordEl.style.fontSize = '2.8rem';
        } else if (wLen >= 5) {
            wWordEl.style.fontSize = '3.5rem';
        } else {
            wWordEl.style.fontSize = '4.2rem';
        }
    } else {
        if (wLen >= 10) {
            wWordEl.style.fontSize = '1.8rem';
        } else if (wLen >= 7) {
            wWordEl.style.fontSize = '2.2rem';
        } else if (wLen >= 5) {
            wWordEl.style.fontSize = '2.6rem';
        } else {
            wWordEl.style.fontSize = '';
        }
    }
 

    const isEnglishRoteSpell =
        isEnglish &&
        isRote &&
        !forceRoteFull &&
        Model.state.mtStep === 1 &&
        (mode === 'word' || mode === 'meaning');

    const isEnglishMemorySpell =
        isEnglish &&
        isMemTest &&
        Model.state.mtRound === 2;

    const hideEnglishPhonetic =
        isEnglish &&
        (
            isDtSpell ||
            isEnglishRoteSpell ||
            isEnglishMemorySpell
        );

    if (!isEnglish) {
        this.getEl('w-kana').innerText =
            (!showKana && !isMemTest)
                ? mask((w.kana || '').replace(/[【】\[\]()]/g, ''))
                : (w.kana || '');
    } else {
        this.getEl('w-kana').innerText = w.phonetic || '';
        this.getEl('w-kana').style.display =
            hideEnglishPhonetic ? 'none' : 'block';
    }
    this.getEl('w-meaning').innerText = (!showMeaning && !isMemTest) ? mask(w.meaning) : w.meaning;
    this.getEl('w-type').innerHTML = visuals.tagsHTML; 
    
    let rootsEl = this.getEl('w-roots');
    if (rootsEl) {
        let showRootsPref = localStorage.getItem('showRoots') !== 'false';
        if (isEnglish && w.roots && showRootsPref) {
            let maskW = (!showWord && !isMemTest);
            let maskM = (!showMeaning && !isMemTest);
            rootsEl.innerHTML = this.renderRoots(w.roots, maskW, maskM);
            rootsEl.style.display = 'flex';
        } else {
            rootsEl.style.display = 'none';
        }
    }

    let isStarred = Model.isStarred(w);
    let starBtn = this.getEl('star-btn');
    let starIcon = this.getEl('star-icon');
    if (starBtn && starIcon) {
        starIcon.style.fontVariationSettings = isStarred ? "'FILL' 1" : "'FILL' 0";
        if (isStarred) starBtn.classList.add('active');
        else starBtn.classList.remove('active');
        starBtn.style.display = 'block';
    }

    if (!isMemTest && !isRote) {
        this.getEl('w-kana').style.display =
            hideEnglishPhonetic ? 'none' : 'block';

        this.getEl('w-meaning').style.display =
            isDtChoice ? 'none' : 'block';
    } else if (!isMemTest) {
        this.getEl('w-kana').style.display =
            hideEnglishPhonetic ? 'none' : 'block';

        this.getEl('w-meaning').style.display = 'block';
    }
    
    const isEnglishRoteTraining = isEnglish && isRote && !forceRoteFull;
    let hideSpeaker =
        isDtSpell ||
        isMemTest ||
        isEnglishRoteTraining ||
        (isRote && !isEnglish && mode !== 'kana' && mode !== 'all' && !forceRoteFull);
    this.getEl('btn-speaker').style.display = hideSpeaker ? 'none' : 'block';
    
    let displayTrigger = this.getEl('btn-display-mode-trigger');
    if (displayTrigger) displayTrigger.style.display = (Model.state.mode === 'dual-track' || isMemTest) ? 'none' : 'inline-flex';

    this.renderExampleBox(w.example, 'w-example-box', Model.state.mode === 'dual-track' ? Model.state.dtSubMode : 'normal', w);

        if (!isMemTest && !isRote && Model.state.mode !== 'dual-track') {
            ['word','kana','type','meaning'].forEach(k => {
                let el = this.getEl(`w-${k}`);
                if(!el) return;
                el.className = (k === 'word') ? 'word-main blur-target' : (k === 'type' ? 'type-row blur-target' : `${k}-row blur-target`);
                if (mode !== 'all' && mode !== k && !(mode === 'meaning' && k === 'type')) {
                    el.classList.add('blur-text');
                    el.setAttribute('aria-hidden', 'true');
                } else {
                    el.removeAttribute('aria-hidden');
                }
            });
            
            let rEl = this.getEl('w-roots');
            if (rEl) {
                rEl.className = 'roots-row'; // 容器本身不模糊，针对内部精细模糊
                // 修复：补上变量声明，读取设置，防止 JS 崩溃
                let isShowRoots = localStorage.getItem('showRoots') !== 'false';
                if (isEnglish && w.roots && isShowRoots) {
                    let blurW = (mode !== 'all' && mode !== 'word');
                    let blurM = (mode !== 'all' && mode !== 'meaning');
                    rEl.querySelectorAll('.r-text').forEach(n => {
                        if (blurW) { n.classList.add('blur-text'); n.setAttribute('aria-hidden', 'true'); }
                    });
                    rEl.querySelectorAll('.r-mean').forEach(n => {
                        if (blurM) { n.classList.add('blur-text'); n.setAttribute('aria-hidden', 'true'); }
                    });
                }
            }

        let exBox = this.getEl('w-example-box'); exBox.className = 'dt-example-box blur-target';
        if (mode !== 'all' && mode !== 'meaning') {
            exBox.classList.add('blur-text');
            exBox.setAttribute('aria-hidden', 'true');
        } else {
            exBox.removeAttribute('aria-hidden');
        }
    } else if (isMemTest) {
        ['word','kana','type','meaning'].forEach(k => { let el = this.getEl(`w-${k}`); if(el) { el.className = (k === 'word') ? 'word-main' : (k === 'type' ? 'type-row' : `${k}-row`); el.removeAttribute('aria-hidden'); } });
        let rEl = this.getEl('w-roots'); if(rEl) rEl.className = 'roots-row';
        this.getEl('w-example-box').className = 'dt-example-box'; this.getEl('w-example-box').style.display = 'none'; this.getEl('w-example-box').removeAttribute('aria-hidden');
    } else if (forceRoteFull) {
        ['word','kana','type','meaning'].forEach(k => { let el = this.getEl(`w-${k}`); if(el) { el.className = (k === 'word') ? 'word-main' : (k === 'type' ? 'type-row' : `${k}-row`); el.removeAttribute('aria-hidden'); } });
        let rEl = this.getEl('w-roots'); if(rEl) rEl.className = 'roots-row';
        this.getEl('w-example-box').className = 'dt-example-box'; this.getEl('w-example-box').style.display = 'block'; this.getEl('w-example-box').removeAttribute('aria-hidden');
        } else {
        ['word','kana','type','meaning'].forEach(k => { let el = this.getEl(`w-${k}`); if(el) { el.className = (k === 'word') ? 'word-main' : (k === 'type' ? 'type-row' : `${k}-row`); el.removeAttribute('aria-hidden'); } });
        let rEl = this.getEl('w-roots'); if(rEl) rEl.className = 'roots-row';
        this.getEl('w-example-box').className = 'dt-example-box';
        // 🚀 修复：如果在往复测验的拼写阶段（isDtSpell），强制隐藏例句防作弊
        if ((isRote && mode !== 'all') || isDtSpell) this.getEl('w-example-box').style.display = 'none';
        this.getEl('w-example-box').removeAttribute('aria-hidden');
    }


    this.getEl('capsule-pendulum').classList.add('hidden');
    this.getEl('capsule-filter-test').classList.add('hidden');
    this.getEl('capsule-filter-judge').classList.add('hidden');
    this.getEl('dual-track-ui').classList.add('hidden');
    this.getEl('memory-test-ui').classList.add('hidden');
    
    if (Model.state.mode === 'pendulum' || (isRote && (forceRoteFull || mode === 'all'))) {
      this.getEl('capsule-pendulum').classList.remove('hidden');
      this.getEl('btn-prev').disabled = Model.state.currentIndex === 0;
      this.getEl('btn-next').style.display = (Model.state.currentIndex === Model.state.studyQueue.length - 1) ? 'none' : 'flex';
      this.getEl('btn-finish').style.display = (Model.state.currentIndex === Model.state.studyQueue.length - 1) ? 'flex' : 'none';
    } else if (Model.state.mode === 'dual-track') {
      this.getEl('dual-track-ui').classList.remove('hidden');
      this.renderDualTrackUI(w);
    } else if (isMemTest || (isRote && !forceRoteFull)) {
      this.getEl('memory-test-ui').classList.remove('hidden');
      if (isRote) {
          this.renderRoteLearningUI(w, mode);
      } else {
          this.renderMemoryTestUI(w, mode);
      }
    }
    
    if (isMemTest && (Model.state.mtRound === 1 || Model.state.mtRound === 2)) {
        Hardware.speakWord(w);
    } else {
        let autoSpeak = localStorage.getItem('autoSpeak') !== 'false';
        if (autoSpeak && !hideSpeaker) { Hardware.speakWord(w); }
    }

    this.syncRootsDisplay();
  },

    renderExampleBox(exString, boxId, mode = 'normal', targetWordObj = null) {
    let exBox = this.getEl(boxId);
    if (!exBox) return;
    
    if (!exString || typeof exString !== 'string') {
        exBox.style.display = 'none';
        exBox.innerHTML = '';
        return;
    }

    let useRuby = localStorage.getItem('useRubyRender') !== 'false';
    
    let processedStr = exString;
    // 🚀 终极修复：强制将英语例句的 || 替换为正确的翻译分隔符 /
    if (processedStr.includes('||') && !processedStr.includes('/')) {
        processedStr = processedStr.replace(/\|\|/g, '/');
    }

    if (mode === 'spell' && targetWordObj) {
        processedStr = processedStr.replace(/\\overset\{([^\}]+)\}\{([^\}]+)\}/g, (match, ruby, kanji) => {
            if (targetWordObj.word.includes(kanji) || targetWordObj.kana === ruby) return `\\overset{○}{${kanji}}`; return match;
        });
    }

    let htmlStr = processedStr.split('||').map(blk => {
        let parts = blk.split('/'); 
        let jpPart = parts[0] ? parts[0].trim() : "暂无例句"; 
        let cnPart = parts[1] ? parts[1].trim() : "";
        
        let pureJpText = jpPart.replace(/\$/g, '').replace(/\\overset\{[^\}]+\}\{([^\}]+)\}/g, '$1');
        let safeJpPart = escapeHTML(jpPart).replace(/\\＆/g, '\\&');
        
        if (useRuby) {
            safeJpPart = safeJpPart.replace(/\$\\overset\{([^\}]+)\}\{([^\}]+)\}\$/g, '<ruby>$2<rt>$1</rt></ruby>');
        }

        let safeCnPart = escapeHTML(cnPart);
        
                let wordLang = targetWordObj ? (targetWordObj.lang || 'ja') : 'ja';
        let targetWordIndex = targetWordObj ? Model.db.indexOf(targetWordObj) : -1;
let sparkBtnHTML = `<span class="material-symbols-rounded ai-sparkle-icon" data-sentence="${escapeHTML(pureJpText)}" data-word="${targetWordObj ? escapeHTML(targetWordObj.word) : ''}" data-lang="${wordLang}" data-word-index="${targetWordIndex}">auto_awesome</span>`;
        let jpBoxHTML = `<div class="dt-ex-jp" data-speak="${escapeHTML(pureJpText)}" style="display:flex; align-items:flex-start; gap:6px;"><span class="material-symbols-rounded ex-speaker" style="flex-shrink:0;">volume_up</span><span style="flex:1;">${safeJpPart}</span>${sparkBtnHTML}</div>`;

        if (mode === 'choice' && cnPart) { 
            return `<div class="ex-item">${jpBoxHTML}<div class="dt-ex-cn hidden-translation" data-text="${safeCnPart}"><span class="material-symbols-rounded" style="font-size:1.1rem;">lock</span> 答对选项后解密</div></div>`; 
        }
        return `<div class="ex-item">${jpBoxHTML}<div class="dt-ex-cn revealed-translation">${safeCnPart}</div></div>`;

    }).join('');
    
    if (!htmlStr.replace(/<[^>]*>/g, '').trim()) { 
        exBox.style.display = 'none'; 
        exBox.innerHTML = ''; 
        return; 
    }

    exBox.innerHTML = htmlStr;
    let jpExEls = exBox.querySelectorAll('.dt-ex-jp');
    
    if (!useRuby && window.MathJax && window.MathJax.typesetPromise) { 
        window.mathJaxQueue = (window.mathJaxQueue || Promise.resolve())
            .then(() => MathJax.typesetPromise(Array.from(jpExEls)))
            .catch((err) => { console.warn('MathJax 排版被中断', err); });
    }
  },


  renderDualTrackUI(wObj) {
      if (Model.state.dtSubMode === 'spell') {
          this.getEl('dt-choice-area').classList.add('hidden'); this.getEl('dt-spell-area').classList.remove('hidden');
          RomajiEngine.reset(); EnglishInput.reset();
          let inputEl = this.getEl('dt-spell-input'); inputEl.innerHTML = ''; inputEl.classList.remove('error-state', 'shake-anim');
          View.renderQwertyKeyboard('dt-spell-keyboard', inputEl, wObj, null);
      }
 else if (Model.state.dtSubMode === 'choice') {
          this.getEl('dt-spell-area').classList.add('hidden'); this.getEl('dt-choice-area').classList.remove('hidden');
          let targetMeaning = wObj.meaning;
          let pool = Model.db.filter(x => x.folder === wObj.folder && x.type === wObj.type && x.word !== wObj.word && x.meaning !== targetMeaning);
          if (pool.length < 3) pool = Model.db.filter(x => x.word !== wObj.word && x.meaning !== targetMeaning); 
          pool = pool.sort(() => Math.random() - 0.5).slice(0, 3);
          let choices = [{text: targetMeaning, correct: true}];
          pool.forEach(x => choices.push({text: x.meaning, correct: false})); choices.sort(() => Math.random() - 0.5); 
          let cb = this.getEl('dt-choice-buttons'); cb.innerHTML = '';
          choices.forEach((c, idx) => { 
              let btn = document.createElement('div'); btn.className = 'dt-choice-btn'; 
              btn.setAttribute('tabindex', '0');
              btn.setAttribute('role', 'button');
              let label = String.fromCharCode(65 + idx); // 生成 A, B, C, D
              let labelSpan = document.createElement('span'); labelSpan.className = 'choice-label'; labelSpan.innerText = label + '.';
              let textSpan = document.createElement('span'); textSpan.innerText = c.text;
              btn.appendChild(labelSpan); btn.appendChild(textSpan);
              btn.onpointerdown = (e) => { e.preventDefault(); Controller.handleDtChoiceClick(btn, c.correct); }; 
              cb.appendChild(btn); 
          });
      }
  },
  
  setEnglishCardWord(wObj, masked = false, visible = true) {
      const wordEl = this.getEl('w-word');
      if (!wordEl) return;

      if (!visible) {
          wordEl.style.display = 'none';
          return;
      }

      wordEl.innerText = masked ? '■■■' : (wObj.word || '');
      wordEl.style.display = 'block';

      if (masked) {
          wordEl.style.fontSize = '2.8rem';
          return;
      }

      const wordLength = Array.from(wObj.word || '').length;
      if (wordLength >= 14) wordEl.style.fontSize = '1.8rem';
      else if (wordLength >= 11) wordEl.style.fontSize = '2.2rem';
      else if (wordLength >= 8) wordEl.style.fontSize = '2.8rem';
      else if (wordLength >= 5) wordEl.style.fontSize = '3.5rem';
      else wordEl.style.fontSize = '4.2rem';
  },

  showEnglishRoteFullCard(wObj) {
      const phoneticEl = this.getEl('w-kana');
      const meaningEl = this.getEl('w-meaning');
      const typeEl = this.getEl('w-type');
      const rootsEl = this.getEl('w-roots');
      const exampleEl = this.getEl('w-example-box');
      const blindAudioUi = this.getEl('mt-blind-audio-ui');

      if (blindAudioUi) blindAudioUi.classList.add('hidden');

      this.setEnglishCardWord(wObj, false, true);

      if (phoneticEl) {
          phoneticEl.innerText = wObj.phonetic || '';
          phoneticEl.style.display = 'block';
      }

      if (meaningEl) {
          meaningEl.innerText = wObj.meaning || '';
          meaningEl.style.display = 'block';
      }

      if (typeEl) typeEl.style.display = 'flex';

      if (rootsEl) {
          const showRoots = localStorage.getItem('showRoots') !== 'false';
          if (showRoots && wObj.roots) {
              rootsEl.innerHTML = this.renderRoots(wObj.roots, false, false);
              rootsEl.style.display = 'flex';
          } else {
              rootsEl.style.display = 'none';
          }
      }

      this.renderExampleBox(wObj.example, 'w-example-box', 'normal', wObj);
      if (exampleEl && wObj.example) exampleEl.style.display = 'block';

      this.syncRootsDisplay();
      this.revealStudyAnswer();
  },

  showJapaneseRoteFullCard(wObj) {
      const wordEl = this.getEl('w-word');
      const kanaEl = this.getEl('w-kana');
      const meaningEl = this.getEl('w-meaning');
      const typeEl = this.getEl('w-type');
      const rootsEl = this.getEl('w-roots');
      const exampleEl = this.getEl('w-example-box');
      const blindAudioUi = this.getEl('mt-blind-audio-ui');

      if (blindAudioUi) blindAudioUi.classList.add('hidden');

      if (wordEl) {
          wordEl.innerText = wObj.word || '';
          wordEl.style.display = 'block';
      }

      if (kanaEl) {
          kanaEl.innerText = (wObj.kana || '').replace(/[【】\[\]()]/g, '');
          kanaEl.style.display = 'block';
      }

      if (meaningEl) {
          meaningEl.innerText = wObj.meaning || '';
          meaningEl.style.display = 'block';
      }

      if (typeEl) typeEl.style.display = 'flex';
      if (rootsEl) rootsEl.style.display = 'none';

      this.renderExampleBox(wObj.example, 'w-example-box', 'normal', wObj);
      if (exampleEl) {
          exampleEl.style.display = wObj.example ? 'block' : 'none';
      }

      this.revealStudyAnswer();
  },

  showRoteFullCard(wObj) {
      if (wObj.lang === 'en') {
          this.showEnglishRoteFullCard(wObj);
      } else {
          this.showJapaneseRoteFullCard(wObj);
      }
  },

  renderRoteChoiceButtons(wObj, displayMode, answerField) {
      const choiceArea = this.getEl('mt-choice-area');
      const choiceButtons = this.getEl('mt-choice-buttons');

      if (!choiceArea || !choiceButtons) return;

      const targetText = String(wObj[answerField] || '').trim();

      if (!targetText) {
          choiceArea.classList.add('hidden');
          showToast('当前词条缺少训练所需字段，已跳过');
          window.setTimeout(() => Controller.mtAdvanceNext(), 300);
          return;
      }

      choiceArea.classList.remove('hidden');

      const language = wObj.lang === 'en' ? 'en' : 'ja';
      const candidates = Model.db
          .filter(candidate => {
              const candidateLanguage = candidate.lang === 'en' ? 'en' : 'ja';
              const candidateText = String(candidate[answerField] || '').trim();

              return (
                  candidateLanguage === language &&
                  candidate !== wObj &&
                  candidateText &&
                  candidateText !== targetText
              );
          })
          .sort(() => Math.random() - 0.5);

      const seen = new Set([targetText]);
      const choices = [{ text: targetText, correct: true }];

      for (const candidate of candidates) {
          const text = String(candidate[answerField] || '').trim();
          if (seen.has(text)) continue;

          seen.add(text);
          choices.push({ text, correct: false });

          if (choices.length === 4) break;
      }

      choices.sort(() => Math.random() - 0.5);
      choiceButtons.innerHTML = '';

      choices.forEach((choice, index) => {
          const button = document.createElement('div');
          button.className = 'dt-choice-btn choice-flip-anim';
          button.setAttribute('tabindex', '0');
          button.setAttribute('role', 'button');

          const label = document.createElement('span');
          label.className = 'choice-label';
          label.innerText = String.fromCharCode(65 + index) + '.';

          const text = document.createElement('span');
          text.innerText = choice.text;

          button.appendChild(label);
          button.appendChild(text);
          button.onpointerdown = event => {
              event.preventDefault();
              Controller.handleMtChoiceClick(
                  button,
                  choice.correct,
                  wObj,
                  displayMode
              );
          };
          choiceButtons.appendChild(button);
      });
  },

  renderJapaneseRoteUI(wObj, displayMode) {
      const mode = ROTE_CORE.normalizeMode('ja', displayMode);
      const step = ROTE_CORE.normalizeStep(Model.state.mtStep);
      const stepConfig = ROTE_CORE.getStep('ja', mode, step);
      const wordEl = this.getEl('w-word');
      const kanaEl = this.getEl('w-kana');
      const meaningEl = this.getEl('w-meaning');
      const typeEl = this.getEl('w-type');
      const rootsEl = this.getEl('w-roots');
      const exampleEl = this.getEl('w-example-box');
      const speakerEl = this.getEl('btn-speaker');
      const spellArea = this.getEl('mt-spell-area');
      const choiceArea = this.getEl('mt-choice-area');
      const blindAudioUi = this.getEl('mt-blind-audio-ui');
      const mtWarning = this.getEl('mt-warning');

      if (mtWarning) mtWarning.classList.add('hidden');
      if (spellArea) spellArea.classList.add('hidden');
      if (choiceArea) choiceArea.classList.add('hidden');
      if (blindAudioUi) blindAudioUi.classList.add('hidden');
      if (rootsEl) rootsEl.style.display = 'none';
      if (exampleEl) exampleEl.style.display = 'none';
      if (speakerEl) speakerEl.style.display = 'none';

      [wordEl, kanaEl, meaningEl, typeEl].forEach(element => {
          if (!element) return;
          element.style.display = 'none';
          element.classList.remove('blur-text');
          element.removeAttribute('aria-hidden');
      });

      if (stepConfig.prompt.includes('word') && wordEl) {
          wordEl.innerText = wObj.word || '';
          wordEl.style.display = 'block';
      }

      if (stepConfig.prompt.includes('kana') && kanaEl) {
          kanaEl.innerText = (wObj.kana || '').replace(/[【】\[\]()]/g, '');
          kanaEl.style.display = 'block';
      }

      if (stepConfig.prompt.includes('meaning') && meaningEl) {
          meaningEl.innerText = wObj.meaning || '';
          meaningEl.style.display = 'block';
      }

      if (stepConfig.test === 'spell') {
          spellArea.classList.remove('hidden');
          RomajiEngine.reset();
          EnglishInput.reset();

          const inputEl = this.getEl('mt-spell-input');
          inputEl.innerHTML = '';
          inputEl.classList.remove('error-state', 'shake-anim');
          this.renderQwertyKeyboard('mt-spell-keyboard', inputEl, wObj, mode);
          return;
      }

      this.renderRoteChoiceButtons(
          wObj,
          mode,
          stepConfig.answer
      );
  },

  renderRoteLearningUI(wObj, displayMode) {
      const language = wObj.lang === 'en' ? 'en' : 'ja';
      const mode = ROTE_CORE.normalizeMode(language, displayMode);

      if (mode !== displayMode) {
          const modeSelect = this.getEl('next-display-mode');
          if (modeSelect) {
              modeSelect.value = mode;
              modeSelect.dispatchEvent(new Event('facade-update'));
          }
          localStorage.setItem('displayMode', mode);
      }

      if (language === 'en') {
          this.renderEnglishRoteUI(wObj, mode);
      } else {
          this.renderJapaneseRoteUI(wObj, mode);
      }
  },

  renderEnglishRoteUI(wObj, displayMode) {
      const mtWarning = this.getEl('mt-warning');
      const spellArea = this.getEl('mt-spell-area');
      const choiceArea = this.getEl('mt-choice-area');
      const blindAudioUi = this.getEl('mt-blind-audio-ui');
      const wordEl = this.getEl('w-word');
      const phoneticEl = this.getEl('w-kana');
      const meaningEl = this.getEl('w-meaning');
      const typeEl = this.getEl('w-type');
      const rootsEl = this.getEl('w-roots');
      const exampleEl = this.getEl('w-example-box');
      const speakerEl = this.getEl('btn-speaker');

      if (mtWarning) mtWarning.classList.add('hidden');
      if (spellArea) spellArea.classList.add('hidden');
      if (choiceArea) choiceArea.classList.add('hidden');
      if (blindAudioUi) blindAudioUi.classList.add('hidden');

      let mode = ROTE_CORE.normalizeMode('en', displayMode);

      if (mode !== displayMode) {
          const modeSelect = this.getEl('next-display-mode');
          if (modeSelect) {
              modeSelect.value = mode;
              modeSelect.dispatchEvent(new Event('facade-update'));
          }
          localStorage.setItem('displayMode', mode);
      }

      const step = ROTE_CORE.normalizeStep(Model.state.mtStep);
      const stepConfig = ROTE_CORE.getStep('en', mode, step);
      let currentTestType = stepConfig.test;
      let isMeaning = false;
      let targetText = '';

      [wordEl, phoneticEl, meaningEl, typeEl].forEach(el => {
          if (!el) return;
          el.classList.remove('blur-text');
          el.removeAttribute('aria-hidden');
      });

      if (wordEl) wordEl.style.display = 'none';
      if (phoneticEl) phoneticEl.style.display = 'none';
      if (meaningEl) meaningEl.style.display = 'none';
      if (typeEl) typeEl.style.display = 'none';
      if (rootsEl) rootsEl.style.display = 'none';
      if (exampleEl) exampleEl.style.display = 'none';
      if (speakerEl) speakerEl.style.display = 'none';

      if (mode === 'word') {
          if (step === 1) {
              currentTestType = 'spell';
              this.setEnglishCardWord(wObj, true, true);

              if (meaningEl) {
                  meaningEl.innerText = wObj.meaning || '';
                  meaningEl.style.display = 'block';
              }
              if (typeEl) typeEl.style.display = 'flex';
          } else {
              currentTestType = 'choice-meaning';
              isMeaning = true;
              targetText = wObj.meaning || '';
              this.setEnglishCardWord(wObj, false, true);

              if (phoneticEl) {
                  phoneticEl.innerText = wObj.phonetic || '';
                  phoneticEl.style.display = 'block';
              }
              if (typeEl) typeEl.style.display = 'flex';
          }
      } else if (mode === 'kana') {
          if (step === 1) {
              currentTestType = 'choice-word';
              isMeaning = false;
              targetText = wObj.word || '';

              if (blindAudioUi) blindAudioUi.classList.remove('hidden');

              requestAnimationFrame(() => {
                  Hardware.unlockSpeech();
                  Hardware.speakWord(wObj);
              });
          } else {
              currentTestType = 'choice-meaning';
              isMeaning = true;
              targetText = wObj.meaning || '';
              this.setEnglishCardWord(wObj, false, true);

              if (phoneticEl) {
                  phoneticEl.innerText = wObj.phonetic || '';
                  phoneticEl.style.display = 'block';
              }
              if (typeEl) typeEl.style.display = 'flex';
          }
      } else {
          if (step === 1) {
              currentTestType = 'choice-meaning';
              isMeaning = true;
              targetText = wObj.meaning || '';
              this.setEnglishCardWord(wObj, false, true);

              if (phoneticEl) {
                  phoneticEl.innerText = wObj.phonetic || '';
                  phoneticEl.style.display = 'block';
              }
              if (typeEl) typeEl.style.display = 'flex';
          } else {
              currentTestType = 'choice-word';
              isMeaning = false;
              targetText = wObj.word || '';
              this.setEnglishCardWord(wObj, true, true);

              if (meaningEl) {
                  meaningEl.innerText = wObj.meaning || '';
                  meaningEl.style.display = 'block';
              }
              if (typeEl) typeEl.style.display = 'flex';
          }
      }

      if (currentTestType === 'spell') {
          if (spellArea) spellArea.classList.remove('hidden');
          RomajiEngine.reset();
          EnglishInput.reset();

          const inputEl = this.getEl('mt-spell-input');
          inputEl.innerHTML = '';
          inputEl.classList.remove('error-state', 'shake-anim');
          this.renderQwertyKeyboard('mt-spell-keyboard', inputEl, wObj, mode);
          return;
      }

      if (choiceArea) choiceArea.classList.remove('hidden');

      const wordLang = wObj.lang || 'en';
      let pool = Model.db.filter(x => {
          return (
              (x.lang || 'ja') === wordLang &&
              x.folder === wObj.folder &&
              x.type === wObj.type &&
              x.word !== wObj.word
          );
      });

      if (pool.length < 3) {
          pool = Model.db.filter(x => {
              return (
                  (x.lang || 'ja') === wordLang &&
                  x.word !== wObj.word
              );
          });
      }

      pool = pool.sort(() => Math.random() - 0.5).slice(0, 3);

      let choices = [{ text: targetText, correct: true }];
      pool.forEach(x => {
          choices.push({
              text: isMeaning ? x.meaning : x.word,
              correct: false
          });
      });
      choices.sort(() => Math.random() - 0.5);

      const choiceButtons = this.getEl('mt-choice-buttons');
      choiceButtons.innerHTML = '';

      choices.forEach((choice, index) => {
          const btn = document.createElement('div');
          btn.className = 'dt-choice-btn choice-flip-anim';
          btn.setAttribute('tabindex', '0');
          btn.setAttribute('role', 'button');

          const labelSpan = document.createElement('span');
          labelSpan.className = 'choice-label';
          labelSpan.innerText = String.fromCharCode(65 + index) + '.';

          const textSpan = document.createElement('span');
          textSpan.innerText = choice.text;

          btn.appendChild(labelSpan);
          btn.appendChild(textSpan);
          btn.onpointerdown = e => {
              e.preventDefault();
              Controller.handleMtChoiceClick(
                  btn,
                  choice.correct,
                  wObj,
                  mode
              );
          };
          choiceButtons.appendChild(btn);
      });
  },

  renderMemoryTestUI(wObj, displayMode) {
      let mtWarning = this.getEl('mt-warning');
      if (mtWarning) mtWarning.classList.add('hidden');

      this.getEl('mt-spell-area').classList.add('hidden');
      this.getEl('mt-choice-area').classList.add('hidden');

      let blindAudioUi = this.getEl('mt-blind-audio-ui');
      if (blindAudioUi) blindAudioUi.classList.add('hidden');

      let isMemTest = Model.state.mode === 'memory-test';

      if (!isMemTest) {
          this.renderRoteLearningUI(wObj, displayMode);
          return;
      }

      let currentTestType = '';
      let isMeaning = false;
      let targetText = '';

      if (isMemTest) {
          this.getEl('w-word').style.display = 'none';
          this.getEl('w-kana').style.display = 'none';
          this.getEl('w-meaning').style.display = 'none';
          this.getEl('w-type').style.display = 'none';

          let round = Model.state.mtRound;
          let step = Model.state.mtStep;
          const isEnglishMt = wObj.lang === 'en';

          if (round === 1) {
              if (blindAudioUi) blindAudioUi.classList.remove('hidden');
              currentTestType = 'choice';
              isMeaning = true;
              targetText = wObj.meaning;
          } else if (round === 2) {
              if (isEnglishMt) {
                  if (blindAudioUi) blindAudioUi.classList.remove('hidden');
                  currentTestType = 'spell';
              } else if (step === 1) {
                  if (blindAudioUi) blindAudioUi.classList.remove('hidden');
                  currentTestType = 'choice';
                  isMeaning = false;
                  targetText = wObj.word;
              } else if (step === 2) {
                  this.getEl('w-word').style.display = 'block';
                  currentTestType = 'spell';
              }
          } else if (round === 3) {
              if (isEnglishMt) {
                  this.getEl('w-kana').style.display = 'block';
                  this.getEl('w-kana').innerText = wObj.phonetic || '';
                  currentTestType = 'choice';
                  isMeaning = true;
                  targetText = wObj.meaning;
              } else if (step === 1) {
                  this.getEl('w-kana').style.display = 'block';
                  currentTestType = 'choice';
                  isMeaning = true;
                  targetText = wObj.meaning;
              } else if (step === 2) {
                  this.getEl('w-kana').style.display = 'block';
                  this.getEl('w-meaning').style.display = 'block';
                  currentTestType = 'choice';
                  isMeaning = false;
                  targetText = wObj.word;
              }
          }
      } else {
          if (displayMode === 'all') {
              if (mtWarning) mtWarning.classList.remove('hidden');
              return;
          }

          if (displayMode === 'word') {
              currentTestType = Model.state.mtStep === 1
                  ? 'spell'
                  : 'choice-meaning';
          } else if (displayMode === 'kana') {
              currentTestType = Model.state.mtStep === 1
                  ? 'choice-word'
                  : 'choice-meaning';
          } else if (displayMode === 'meaning') {
              currentTestType = Model.state.mtStep === 1
                  ? 'spell'
                  : 'choice-word';
          }

          isMeaning = currentTestType === 'choice-meaning';
          targetText = isMeaning ? wObj.meaning : wObj.word;
      }

      if (currentTestType === 'spell') {
          this.getEl('mt-spell-area').classList.remove('hidden');
          RomajiEngine.reset();
          EnglishInput.reset();

          let inputEl = this.getEl('mt-spell-input');
          inputEl.innerHTML = '';
          inputEl.classList.remove('error-state', 'shake-anim');
          this.renderQwertyKeyboard(
              'mt-spell-keyboard',
              inputEl,
              wObj,
              displayMode
          );
          return;
      }

      if (currentTestType.startsWith('choice')) {
          this.getEl('mt-choice-area').classList.remove('hidden');

          const wordLang = wObj.lang || 'ja';
          let pool = Model.db.filter(x => {
              return (
                  (x.lang || 'ja') === wordLang &&
                  x.folder === wObj.folder &&
                  x.type === wObj.type &&
                  x.word !== wObj.word
              );
          });

          if (pool.length < 3) {
              pool = Model.db.filter(x => {
                  return (
                      (x.lang || 'ja') === wordLang &&
                      x.word !== wObj.word
                  );
              });
          }

          pool = pool.sort(() => Math.random() - 0.5).slice(0, 3);

          let choices = [{ text: targetText, correct: true }];
          pool.forEach(x => {
              choices.push({
                  text: isMeaning ? x.meaning : x.word,
                  correct: false
              });
          });
          choices.sort(() => Math.random() - 0.5);

          let cb = this.getEl('mt-choice-buttons');
          cb.innerHTML = '';

          choices.forEach((choice, index) => {
              let btn = document.createElement('div');
              btn.className = 'dt-choice-btn choice-flip-anim';
              btn.setAttribute('tabindex', '0');
              btn.setAttribute('role', 'button');

              let labelSpan = document.createElement('span');
              labelSpan.className = 'choice-label';
              labelSpan.innerText = String.fromCharCode(65 + index) + '.';

              let textSpan = document.createElement('span');
              textSpan.innerText = choice.text;

              btn.appendChild(labelSpan);
              btn.appendChild(textSpan);
              btn.onpointerdown = e => {
                  e.preventDefault();
                  Controller.handleMtChoiceClick(
                      btn,
                      choice.correct,
                      wObj,
                      displayMode
                  );
              };
              cb.appendChild(btn);
          });
      }
  },

    renderQwertyKeyboard(containerId, inputEl, wObj, displayMode) {
      let kb = this.getEl(containerId);
      kb.innerHTML = ''; 
      Model.state.spellFailCount = 0; 

      let hintWrap = document.createElement('div');
      hintWrap.id = containerId + '-hint-wrap';
      hintWrap.className = 'spell-hint-wrap';
      let hintBtn = document.createElement('div');
      hintBtn.className = 'spell-hint-btn';
      hintBtn.setAttribute('tabindex', '0');
      hintBtn.setAttribute('role', 'button');
      const isEnglishKb = wObj.lang === 'en';
      hintBtn.innerHTML = isEnglishKb 
          ? '<span class="material-symbols-rounded" style="font-size:1.1rem;">visibility</span> 查看首字母提示'
          : '<span class="material-symbols-rounded" style="font-size:1.1rem;">visibility</span> 查看假名提示';
      hintBtn.onpointerdown = (e) => {
          e.preventDefault();
          Hardware.vibrate(10);
          if (isEnglishKb) {
              let wWord = View.getEl('w-word');
              if (wWord) {
                  const firstLetter = (wObj.word || '').charAt(0).toLowerCase();
                  wWord.innerText = firstLetter ? firstLetter + '···' : '···';
                  wWord.style.display = 'block';
                  wWord.style.fontSize = '2.8rem';
                  wWord.classList.remove('blur-text');
                  wWord.removeAttribute('aria-hidden');
                  wWord.classList.add('hint-pop-anim');
              }
          } else {
              let wKana = View.getEl('w-kana');
              if (wKana) {
                  wKana.innerText = wObj.kana;
                  wKana.style.display = 'block';
                  wKana.classList.remove('blur-text');
                  wKana.removeAttribute('aria-hidden');
                  wKana.classList.add('hint-pop-anim');
              }
          }
          hintWrap.classList.remove('show'); 
      };
      hintWrap.appendChild(hintBtn);
      kb.appendChild(hintWrap);

      // 日语键盘 vs 英语键盘：英语键盘含完整 QWERTY 及常用标点
      const rows = isEnglishKb ? [
          ['Q','W','E','R','T','Y','U','I','O','P'],
          ['A','S','D','F','G','H','J','K','L'],
          ['Z','X','C','V','B','N','M','-',"'",'Backspace'],
          ['Enter']
      ] : [
          ['Q','W','E','R','T','Y','U','I','O','P'],
          ['A','S','D','F','G','H','J','K','L','-'],
          ['Kana','Z','X','C','V','B','N','M','Backspace'],
          ['Enter']
      ];

      rows.forEach(r => {
          let rowEl = document.createElement('div'); rowEl.className = 'qwerty-row';
          r.forEach(key => {
              let btn = document.createElement('div'); btn.className = 'qwerty-key';
              if (key === 'Kana') { btn.innerText = 'あ/ア'; btn.classList.add('qwerty-key-wide'); }
              else if (key === 'Backspace') { btn.innerHTML = '<span class="material-symbols-rounded">backspace</span>'; btn.classList.add('qwerty-key-wide'); }
              else if (key === 'Enter') { btn.innerText = '確認 (Enter)'; btn.className = 'qwerty-key qwerty-key-confirm'; }
              else btn.innerText = key;
              
              btn.setAttribute('tabindex', '0');
              btn.setAttribute('role', 'button');
              
              btn.onpointerdown = (e) => { 
                  e.preventDefault(); 
                  inputEl.classList.remove('error-state', 'shake-anim');
                  if (key === 'Kana') { RomajiEngine.toggleMode(); btn.innerText = RomajiEngine.mode === 'hiragana' ? 'あ/ア' : 'ア/あ'; return; }
                  if (key === 'Enter') { Controller.handleSpellConfirm(inputEl, wObj, displayMode); return; }
                                    if (isEnglishKb) {
                      // 补上缺失的实体按键震动反馈：退格键震动轻一点，普通按键震动强一点
                      Hardware.vibrate(key === 'Backspace' ? 10 : 15);
                      
                      if (key === 'Backspace') EnglishInput.input('Backspace');
                      else if (key === "'") EnglishInput.buffer += "'";
                      else EnglishInput.input(key);
                      inputEl.innerHTML = escapeHTML(EnglishInput.getDisplayText());
                  } else {

                      RomajiEngine.input(key);
                      inputEl.innerHTML = RomajiEngine.getDisplayText();
                  }
              };
              rowEl.appendChild(btn);
          });
          kb.appendChild(rowEl);
      });
  },

  resetWordbankRenderer() { 
      let searchInputEl = this.getEl('wb-search-input');
      let searchQuery = searchInputEl ? searchInputEl.value.trim().toLowerCase() : '';
      let currentFilter = this.getEl('wb-folder-filter').value;
      
      Model.updateFilteredDb(searchQuery, currentFilter);
      window.scrollTo({
          top: 0,
          behavior: 'auto'
      });

      Model.state.renderedStartIndex = -1;
      Model.state.renderedEndIndex = -1;

      this.renderVirtualGrid();
  },

  renderVirtualGrid() {
    const grid = this.getEl('wb-grid'); 
    const container = this.getEl('wb-grid-container');
    if(!grid || !container) return;

        const colsStr = this.getEl('wb-col-select').value;
    const requestedCols =
        Number.parseInt(colsStr, 10) || 3;

    grid.setAttribute(
        'data-cols',
        String(requestedCols)
    );

    const computedColumns =
        window.getComputedStyle(grid)
            .gridTemplateColumns;

    const actualCols =
        computedColumns &&
        computedColumns !== 'none'
            ? computedColumns
                .split(/\s+/)
                .filter(Boolean)
                .length
            : 0;

    const cols =
        actualCols || requestedCols;

    const blurMode =
        this.getEl('wb-blur-select').value; 
    
    const filteredData = Model.state.filteredDb;

    if (filteredData.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 100px 20px;">
            <span class="material-symbols-rounded" style="font-size: 5rem; margin-bottom: 24px; color: #8F9779; opacity: 0.4;">spa</span>
            <div style="font-size: 1.3rem; font-weight: 800; color: var(--on-surface); opacity: 0.7; font-family: var(--font-jp-serif), serif; letter-spacing: 2px;">【 一期一会 】</div>
            <div style="font-size: 0.95rem; margin-top: 12px; opacity: 0.5; color: var(--on-surface);">缘分未到，换个关键词再试一次吧</div>
        </div>`;
        grid.style.paddingTop = '0px'; grid.style.paddingBottom = '0px';
        return;
    }

    const stableRowHeights = {
        2: 224,
        3: 208,
        4: 180
    };

    const rowHeight =
        stableRowHeights[requestedCols] || 208;

    const totalRows = Math.ceil(filteredData.length / cols);
    const rect = container.getBoundingClientRect();
    const gridTop = window.scrollY + rect.top; 
    let relativeScrollY = Math.max(0, window.scrollY - gridTop + 20);

    const viewportHeight = window.innerHeight;
    const bufferRows = 10;
    
    let startRow = Math.floor(relativeScrollY / rowHeight) - bufferRows;
    startRow = Math.max(0, startRow);
    
    let visibleRows = Math.ceil(viewportHeight / rowHeight) + (bufferRows * 2);
    let endRow = startRow + visibleRows;
    endRow = Math.min(totalRows, endRow);

    let startIndex = startRow * cols;
    let endIndex = endRow * cols;

    if (Model.state.renderedStartIndex === startIndex && Model.state.renderedEndIndex === endIndex) { return; }
    Model.state.renderedStartIndex = startIndex;
    Model.state.renderedEndIndex = endIndex;

    const paddingTop = startRow * rowHeight;
    const paddingBottom = Math.max(0, (totalRows - endRow) * rowHeight);
    grid.style.paddingTop = `${paddingTop}px`;
    grid.style.paddingBottom = `${paddingBottom}px`;
    grid.setAttribute(
        'data-cols',
        String(requestedCols)
    );

            let slice = filteredData.slice(startIndex, endIndex);
    
    Array.from(grid.children).forEach(child => {
        if (!child.classList.contains('wb-card')) {
            grid.removeChild(child);
        }
    });

    let existingCards = Array.from(grid.children);
    let neededCount = slice.length;


    slice.forEach((item, index) => {
      let w = item.w, idx = item.idx; 
      let contentHTML = '';
      let renderFingerprint = '';
      let bgStyle = '';
      let isHintCard = (idx === -999);
      let isChecked = false;

      if (isHintCard) {
          bgStyle = 'transparent';
          renderFingerprint = 'hint-card';
          contentHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; opacity:0.6; border: 2px dashed var(--outline); border-radius: inherit; width: 100%; position: absolute; inset: 0;">
                <span class="material-symbols-rounded" style="font-size:2rem; margin-bottom:8px; color:var(--tertiary);">touch_app</span>
                <div style="font-size:1rem; font-weight:800; margin-bottom:4px; color:var(--on-surface);">长按卡片</div>
                <div style="font-size:0.75rem; font-weight:700; color:var(--on-surface);">查看详细释义</div>
            </div>`;
      } else {
          let visuals = this.getCardVisuals(w.type, w.lang);
          const isEnglishWord = w.lang === 'en';
          bgStyle = visuals.bg;
          let blurW = (blurMode !== 'all' && blurMode !== 'word') ? 'blur-text' : ''; 
          let blurK = (blurMode !== 'all' && blurMode !== 'kana') ? 'blur-text' : ''; 
          let blurM = (blurMode !== 'all' && blurMode !== 'meaning') ? 'blur-text' : '';
          isChecked = Model.state.selectedSet.has(idx);

          // 统一三杠体系：兼容旧英语 {word, meaning} 格式
          let st = Model.getClearState(w);
          if (typeof st === 'number') st = { kanji: false, kana: false, meaning: false };
          if (isEnglishWord && st.word !== undefined) {
            st = { kanji: st.word || false, kana: false, meaning: st.meaning || false };
          }
          // 统一三杠缩略图
          let hankoHTML = `
            <div class="card-tri-bar">
              <div class="tri-bar-segment bar-y ${st.kanji ? 'active' : ''}"></div>
              <div class="tri-bar-segment bar-r ${st.kana ? 'active' : ''}"></div>
              <div class="tri-bar-segment bar-w ${st.meaning ? 'active' : ''}"></div>
            </div>`;

          let starFilled = Model.isStarred(w) ? 1 : 0;
          let starClass = starFilled ? 'active' : '';

          let topRightHTML = '';
          if (Model.state.batchMode) {
              topRightHTML = `<div class="wb-checkbox ${isChecked ? 'checked' : ''}">${isChecked ? '✓' : ''}</div>`;
          } else {
              topRightHTML = `<div class="wb-c-star btn-wb-star ${starClass}"><span class="material-symbols-rounded" style="font-variation-settings: 'FILL' ${starFilled};">star</span></div>`;
          }

          let safeWord = escapeHTML(w.word); 
          let safeKana = isEnglishWord ? (w.phonetic || '') : escapeHTML(w.kana || ''); 
          let safeMean = escapeHTML(w.meaning);
          const safePitch = !isEnglishWord
              ? escapeHTML(formatWordPitchDisplay(w.pitch))
              : '';
          const pitchHTML = safePitch
              ? `<span class="wb-c-pitch">${safePitch}</span>`
              : '';
          contentHTML = `
            ${hankoHTML}
            <div class="watermark-layer"><div class="watermark">${visuals.wm}</div></div>
            ${topRightHTML}
            ${cols !== '4' && !Model.state.batchMode ? `<div class="wb-c-speaker btn-wb-speak"><span class="material-symbols-rounded">volume_up</span></div>` : ''}
            <div class="wb-c-word ${blurW}"><span class="wb-blur-trigger">${safeWord}</span></div>
            ${isEnglishWord ? `<div class="wb-c-kana ${blurK}"><span class="wb-blur-trigger">${escapeHTML(w.phonetic || '')}</span></div>` : `<div class="wb-c-kana ${blurK}"><span class="wb-blur-trigger">${safeKana}</span>${pitchHTML}</div>`}
            <div class="wb-c-mean ${blurM}"><span class="wb-blur-trigger">${safeMean}</span></div>`;

          renderFingerprint =
              String(idx) +
              blurMode +
              Model.state.batchMode +
              isChecked +
              starFilled +
              st.kanji +
              st.kana +
              st.meaning +
              String(w.pitch || '') +
              String(w.level || '') +
              String(w.frequency || '') +
              String(w.difficulty || '') +
              JSON.stringify(w.specialTags || []);
      }

      if (index < existingCards.length) {
          let card = existingCards[index];
          card.classList.toggle(
              'is-selected',
              !isHintCard && isChecked
          );
          card.setAttribute(
              'aria-pressed',
              String(!isHintCard && isChecked)
          );
          if (card.dataset.fingerprint !== renderFingerprint) {
              card.style.background = bgStyle;
              card.style.boxShadow = isHintCard ? 'none' : '';
              card.style.border = isHintCard ? 'none' : '';
              card.dataset.idx = idx;
              card.dataset.fingerprint = renderFingerprint;
              card.innerHTML = contentHTML;
          }
      } else {
          let card = document.createElement('div');
          card.className =
              'wb-card' +
              (!isHintCard && isChecked
                  ? ' is-selected'
                  : '');
          card.setAttribute('tabindex', '0');
          card.setAttribute('role', 'button');
          card.setAttribute(
              'aria-pressed',
              String(!isHintCard && isChecked)
          );
          card.style.background = bgStyle;
          card.style.boxShadow = isHintCard ? 'none' : '';
          card.style.border = isHintCard ? 'none' : '';
          card.dataset.idx = idx;
          card.dataset.fingerprint = renderFingerprint;
          card.style.opacity = '1';
          card.innerHTML = contentHTML;
          grid.appendChild(card);
      }
    });

    while (grid.children.length > neededCount) {
        grid.removeChild(grid.lastChild);
    }


    let sentinel = this.getEl('wb-scroll-sentinel');
    if (sentinel) sentinel.style.display = 'none';
  },

  simulateKeyPress(keyStr) {
      let keys = document.querySelectorAll('.qwerty-key');
      keys.forEach(k => {
          let text = k.innerText;
          let match = false;
          if (keyStr === 'Backspace' && k.querySelector('.material-symbols-rounded')) match = true;
          else if (keyStr === 'Enter' && text.includes('Enter')) match = true;
          else if (text === keyStr) match = true;
          
          if (match) {
              let isDark = document.body.getAttribute('data-theme') === 'dark';
              k.style.transition = 'none'; 
              k.style.transform = 'scale(0.92) translateY(2px)';
              k.style.background = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(139, 121, 103, 0.15)';
              k.style.boxShadow = '0 0 0 transparent';
              
              if(keyStr === 'Enter') {
                  k.style.background = isDark ? 'rgba(164, 199, 182, 0.25)' : 'rgba(74, 99, 85, 0.9)';
              }
              
              setTimeout(() => {
                  k.style.transition = 'all 0.1s'; 
                  k.style.transform = '';
                  k.style.background = '';
                  k.style.boxShadow = '';
              }, 120);
          }
      });
  }
};

const AI_TUTOR_BASE_PROMPT = `你是一名面向中文学习者的语言导师。
默认使用清晰、自然的中文解释，除非用户要求使用目标语言。
先直接回答问题，再补充必要说明；简单问题保持简短，复杂问题分层说明。
发现表达错误时，优先给出“原表达、修改后表达、修改原因”。
示例必须自然、常用并符合真实语境，区分口语、书面语、正式与非正式表达。
不要使用空洞的夸奖、客套开场或与问题无关的总结。
不确定时明确说明，不要编造词义、语法规则或固定搭配。`;

const AI_TUTOR_LANGUAGE_PROMPTS = Object.freeze({
    ja: `本次主要辅导日语。
注意区分日常口语、书面语和敬语，并指出中文直译造成的不自然表达。
解释词语时按需说明读音、词性、常见搭配和使用限制。`,

    en: `本次主要辅导英语。
解释单词时按需标注国际音标，并优先讲常见搭配和现代自然表达。
注意区分日常口语、书面语、正式与非正式表达。
不要添加日语假名注音，也不要堆砌冷僻词。`
});

const AI_CHAT_PRESETS = Object.freeze({
    free: {
        title: '自由答疑',
        icon: 'forum',
        description: '随时询问词汇、语法与表达',

        instruction: `根据用户的问题自然回答，不强制套用固定模板。
先解决用户当前最关心的问题，再按需要补充例子或提醒。`,

        welcome: {
            ja: '可以询问日语词汇、语法、表达是否自然，或直接粘贴一句话。',
            en: '可以询问英语词汇、语法、表达是否自然，或直接粘贴一句话。'
        },

        shortcuts: {
            ja: [
                '这个日语表达自然吗？',
                '比较两个近义词',
                '解释一个语法点',
                '帮我检查一句话'
            ],

            en: [
                '这个英语表达自然吗？',
                '比较两个近义词',
                '解释一个语法点',
                '帮我检查一句话'
            ]
        }
    },

    grammar: {
        title: '语法拆解',
        icon: 'account_tree',
        description: '分析句子结构与重点语法',

        instruction: `用户提供句子后，按需要从“句子大意、结构拆解、重点语法、自然度、相似例句”几个部分讲解。
不要为了凑齐栏目重复内容；句子很简单时可以合并说明。`,

        welcome: {
            ja: '粘贴一段日语，我会帮你拆开句子结构、语法和自然度。',
            en: '粘贴一段英语，我会帮你拆开句子结构、语法和自然度。'
        },

        shortcuts: {
            ja: [
                '拆解这句日语',
                '解释句中的语法',
                '这句话为什么这样说？',
                '给我相似例句'
            ],

            en: [
                '拆解这句英语',
                '解释句中的语法',
                '这句话为什么这样说？',
                '给我相似例句'
            ]
        }
    },

    vocabulary: {
        title: '单词精讲',
        icon: 'menu_book',
        description: '掌握词义、搭配与真实用法',

        instruction: `用户提供单词后，优先说明核心含义、词性或读音、常见搭配、容易混淆的词、真实使用场景和自然例句。
讲解结束时可给一个简短小测验，但用户只想查词时不要强迫练习。`,

        welcome: {
            ja: '输入一个日语单词，我会讲清读音、含义、搭配与使用场景。',
            en: '输入一个英语单词，我会讲清音标、含义、搭配与使用场景。'
        },

        shortcuts: {
            ja: [
                '解释这个单词',
                '比较两个近义词',
                '给我常见搭配',
                '用这个词考考我'
            ],

            en: [
                '解释这个单词',
                '比较两个近义词',
                '给我常见搭配',
                '用这个词考考我'
            ]
        }
    },

    polish: {
        title: '翻译润色',
        icon: 'translate',
        description: '翻译并改成更自然的表达',

        instruction: `先判断用户需要翻译、纠错还是润色。
必要时给出“直接版本、自然版本、其他语气版本、修改原因”。
保留原意，不擅自增加用户没有表达的信息。`,

        welcome: {
            ja: '输入中文或日语，我会翻译、纠错，并给出更自然的日语表达。',
            en: '输入中文或英语，我会翻译、纠错，并给出更自然的英语表达。'
        },

        shortcuts: {
            ja: [
                '翻译成自然日语',
                '改得更口语',
                '改得更正式',
                '检查是否地道'
            ],

            en: [
                '翻译成自然英语',
                '改得更口语',
                '改得更正式',
                '检查是否地道'
            ]
        }
    },

    guided: {
        title: '引导练习',
        icon: 'psychology_alt',
        description: '通过提示自己找到答案',

        instruction: `默认不要立刻公布完整答案。
先指出问题范围，再给一个小提示并等待用户尝试；根据用户的回答逐步增加提示。
用户明确要求直接看答案，或多次尝试仍不会时，再给出答案并总结原因。`,

        welcome: {
            ja: '选择一个练习方向，我会先给提示，让你自己找到日语答案。',
            en: '选择一个练习方向，我会先给提示，让你自己找到英语答案。'
        },

        shortcuts: {
            ja: [
                '给我一道翻译题',
                '陪我练习造句',
                '只给我一个提示',
                '检查我的答案'
            ],

            en: [
                '给我一道翻译题',
                '陪我练习造句',
                '只给我一个提示',
                '检查我的答案'
            ]
        }
    }
});

const buildAIChatSystemPrompt = (presetId, lang) => {
    const safeLang =
        lang === 'en'
            ? 'en'
            : 'ja';

    const preset =
        AI_CHAT_PRESETS[presetId] ||
        AI_CHAT_PRESETS.free;

    return [
        AI_TUTOR_BASE_PROMPT,
        AI_TUTOR_LANGUAGE_PROMPTS[safeLang],
        `【本次教学模式：${preset.title}】`,
        preset.instruction
    ].join('\n\n');
};

const Controller = {
  aiCache: {},
  aiActionPayloads: {},
  aiActionSerial: 0,
  pendingWordDraft: null,
  aiWordCollection: {
      sourcePayload: null,
      candidates: [],
      drafts: []
  },
  currentChat: { systemPrompt: '', messages: [], cacheKey: '' },

  aiTabChat: {
      activeIdx: -1,
      messages: [],
      systemPrompt: '',
      cacheKey: '',
      presetId: '',
      lang: 'ja',
      word: '',
      sentence: ''
  },
  async init() {
    BottomSheet.init(); 
    Nav.init(); 
    await Model.init(); 
    Model.state.currentLangMode = localStorage.getItem('langMode') || 'ja';
    document.body.setAttribute('data-lang', Model.state.currentLangMode);
    
    // 渲染书架
    document.querySelectorAll('.book-card').forEach(b => b.classList.remove('active'));
    let activeBook = document.querySelector(`.book-card[data-lang="${Model.state.currentLangMode}"]`);
    if (activeBook) activeBook.classList.add('active');

    Hardware.init(); 
    View.renderDashboard(); 
    View.updateWordbankUI(); 
    this.bindEvents();
    this.initializeImportPanel();
    await this.updateRestorePointUI();
    this.setupVirtualScroll();
    this.setupHeaderScrollShadow();
    
    if(localStorage.getItem('theme') === 'dark') { document.body.setAttribute('data-theme', 'dark'); document.querySelectorAll('.theme-icon').forEach(icon => icon.innerText = 'light_mode'); }
    
    let autoSpeak = localStorage.getItem('autoSpeak') !== 'false'; 
    let autoSpeakCheck = View.getEl('setting-auto-speak');
    if(autoSpeakCheck) autoSpeakCheck.checked = autoSpeak;
    
    let showRoots = localStorage.getItem('showRoots') !== 'false'; 
    let showRootsCheckEl = View.getEl('setting-show-roots');
    if(showRootsCheckEl) showRootsCheckEl.checked = showRoots;

    

    let darkBtnStyle = localStorage.getItem('darkBtnStyle') === 'translucent';
    let darkBtnCheck = View.getEl('setting-dark-btn');
    if(darkBtnCheck) {
        darkBtnCheck.checked = darkBtnStyle;
        if(darkBtnStyle) document.body.setAttribute('data-dark-btn', 'translucent');
    }

    let savedWordOrderMode = localStorage.getItem('wordOrderMode');

    if (!['weak-first', 'new-first', 'original'].includes(savedWordOrderMode)) {
        const legacyPostponeTested =
            localStorage.getItem('postponeTested') === 'true';

        savedWordOrderMode =
            legacyPostponeTested
                ? 'new-first'
                : 'weak-first';

        localStorage.setItem(
            'wordOrderMode',
            savedWordOrderMode
        );
    }

    let wordOrderSelect =
        View.getEl('setting-word-order-mode');

    if (wordOrderSelect) {
        wordOrderSelect.value = savedWordOrderMode;
        wordOrderSelect.dispatchEvent(
            new Event('facade-update')
        );
    }

    let skipMastered = localStorage.getItem('skipMastered') === 'true';
    let skipCheck = View.getEl('setting-skip-mastered');
    if(skipCheck) skipCheck.checked = skipMastered;

    let showRootsCheck = View.getEl('setting-show-roots');
    if (showRootsCheck) {
        showRootsCheck.addEventListener('change', (e) => {
            Hardware.playSound('click'); Hardware.vibrate(15);
            localStorage.setItem('showRoots', e.target.checked);
            showToast(e.target.checked ? "已开启词根词缀展示" : "已关闭词根词缀展示");
            if (!document.getElementById('study-area').classList.contains('hidden')) { View.renderStudyCard('none'); }
        });
    }

    let useRuby = localStorage.getItem('useRubyRender');
    if (useRuby === null) useRuby = 'true'; 
    let rubyCheck = View.getEl('setting-ruby-render');
    if(rubyCheck) rubyCheck.checked = (useRuby === 'true');
    let savedTTS = localStorage.getItem('ttsEngine') || 'azure';
    let ttsSelect = View.getEl('setting-tts-engine');
    if(ttsSelect) {
        ttsSelect.value = savedTTS;
        ttsSelect.dispatchEvent(new Event('facade-update')); 
    }


let savedMode = localStorage.getItem('displayMode') || 'all'; View.getEl('next-display-mode').value = savedMode;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        showConfirm('版本更新', '应用已有新版本，是否立即刷新以体验最新功能？', () => {
          window.location.reload();
        });
      }
    });
  }
},

setupVirtualScroll() {
    const container =
        View.getEl('wb-grid-container');

    const wordbankTab =
        document.getElementById('tab-wordbank');

    if (!container || !wordbankTab) {
        return;
    }

    let ticking = false;
    let resizeTimer = null;

    let lastLayoutWidth = Math.round(
        window.visualViewport?.width ||
        window.innerWidth
    );

    window.addEventListener(
        'scroll',
        () => {
            if (
                !wordbankTab.classList.contains(
                    'active'
                )
            ) {
                return;
            }

            if (ticking) {
                return;
            }

            ticking = true;

            window.requestAnimationFrame(() => {
                View.renderVirtualGrid();
                ticking = false;
            });
        },
        { passive: true }
    );

    window.addEventListener(
        'resize',
        () => {
            clearTimeout(resizeTimer);

            resizeTimer = setTimeout(() => {
                if (
                    !wordbankTab.classList.contains(
                        'active'
                    )
                ) {
                    return;
                }

                const nextLayoutWidth = Math.round(
                    window.visualViewport?.width ||
                    window.innerWidth
                );

                const widthChanged =
                    Math.abs(
                        nextLayoutWidth -
                        lastLayoutWidth
                    ) >= 8;

                /*
                 * 手机浏览器收起或展开地址栏时，
                 * 通常只会改变可视高度。
                 * 这种变化不应重置词库。
                 */
                if (!widthChanged) {
                    return;
                }

                lastLayoutWidth =
                    nextLayoutWidth;

                const savedScrollY =
                    window.scrollY;

                Model.state.renderedStartIndex =
                    -1;

                Model.state.renderedEndIndex =
                    -1;

                View.renderVirtualGrid();

                window.requestAnimationFrame(() => {
                    window.scrollTo({
                        top: savedScrollY,
                        behavior: 'auto'
                    });

                    View.renderVirtualGrid();
                });
            }, 140);
        },
        { passive: true }
    );
},

  setupHeaderScrollShadow() {
      const header = View.getEl('global-header');
      if (!header) return;

      const updateHeaderStatus = () => {
          if (window.scrollY > 10) {
              header.classList.add('scrolled');
          } else {
              header.classList.remove('scrolled');
          }
      };

      window.addEventListener('scroll', updateHeaderStatus, { passive: true });
      updateHeaderStatus();
  },



  closeDetailIfOpen() {
      if (document.getElementById('detail-overlay').classList.contains('active')) {
          Hardware.vibrate(10);
          window.toggleModal('detail-overlay', false);
          if (document.getElementById('tab-wordbank').classList.contains('active')) {
              Model.state.renderedStartIndex = -1;
              View.renderVirtualGrid();
          }
      }
  },

  bindEvents() {
    document.querySelectorAll('.modal-overlay').forEach(ov => { 
        ov.addEventListener('click', (e) => { 
            if(e.target === ov) {
                Hardware.vibrate(10);
                window.toggleModal(ov.id, false); 
                if (ov.id === 'detail-overlay' && document.getElementById('tab-wordbank').classList.contains('active')) { Model.state.renderedStartIndex = -1; View.renderVirtualGrid(); }
            }
        }); 
    });
    
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => { 
        btn.addEventListener('click', (e) => { Hardware.playSound('click'); Hardware.vibrate(20); View.toggleTheme(e); }); 
    });
    
    View.getEl('btn-exit-study').addEventListener('click', () => { Hardware.vibrate(20); Hardware.stopAllAudio(); View.showPage('tab-home'); View.renderDashboard(); });

    // 📚 词书切换核心事件
    document.querySelectorAll('.book-card').forEach(card => {
        card.addEventListener('click', () => {
            let targetLang = card.getAttribute('data-lang');
            if (targetLang !== Model.state.currentLangMode) {
                Hardware.playSound('click'); Hardware.vibrate(20);
                Model.state.currentLangMode = targetLang;
                localStorage.setItem('langMode', targetLang);
                document.body.setAttribute('data-lang', targetLang);
                
                document.querySelectorAll('.book-card').forEach(b => b.classList.remove('active'));
                card.classList.add('active');

                // 切换后强制清空跨语言选择，防止数据串线
                let selFilter = View.getEl('wb-folder-filter');
                if (selFilter) selFilter.value = 'all';
                localStorage.setItem('lastSelectedFolder', 'all');
                localStorage.removeItem('lastCustomGroupVal');
                localStorage.removeItem('lastCustomGroupTxt');
                Model.state.currentGroupKey = '';
                Model.state.currentGroupLabel = '';

                View.updateWordbankUI();
                View.resetWordbankRenderer();
                View.renderDashboard();
                showToast(`已切换至${targetLang === 'en' ? '英语' : '日语'}词书`);
            }
        });
    });

    View.getEl(
        'btn-custom-group-select'
    ).addEventListener(
        'click',
        () => {
            Hardware.playSound('click');
            Hardware.vibrate(15);

            View.renderGroupRangePicker();

            window.toggleModal(
                'group-select-overlay',
                true
            );
        }
    );

    View.getEl('btn-start-pendulum').addEventListener('click', () => { Hardware.unlockSpeech(); this.startPendulum('pendulum'); });
    View.getEl('btn-start-dual-track').addEventListener('click', () => { Hardware.unlockSpeech(); this.startPendulum('dual-track'); });
    View.getEl('btn-start-rote-learning').addEventListener('click', () => { Hardware.unlockSpeech(); this.startPendulum('rote-learning'); });
    View.getEl('btn-start-memory-test').addEventListener('click', () => { Hardware.unlockSpeech(); this.startPendulum('memory-test'); });
    
    View.getEl('btn-start-filter-test').addEventListener('click', () => { Hardware.unlockSpeech(); this.startFilterTest(); });
    View.getEl('btn-test-range-trigger').addEventListener('click', () => { Hardware.vibrate(10); BottomSheet.open(View.getEl('test-range-select'), document.createElement('span')); });
    View.getEl('btn-test-display-trigger').addEventListener('click', () => { Hardware.vibrate(10); BottomSheet.open(View.getEl('test-display-select'), document.createElement('span')); });

    View.getEl('ft-forget').addEventListener('click', () => { Hardware.playSound('error'); Hardware.vibrate(30); this.processFilterTestResult(false); });
    View.getEl('ft-blur').addEventListener('click', () => { 
        Hardware.playSound('click'); Hardware.vibrate(20); 
        let currentDisplay = View.getEl('test-display-select').value || 'kana'; 
        
        let poolMap = {
            'word': ['kana', 'audio'],       
            'kana': ['word', 'meaning'],     
            'meaning': ['kana', 'audio'],    
            'audio': ['meaning']             
        };
        
        let pool = poolMap[currentDisplay] || ['word', 'kana', 'meaning', 'audio'].filter(x => x !== currentDisplay);
        Model.state.ftHint = pool[Math.floor(Math.random() * pool.length)]; 
        Model.state.ftState = 'B'; 
        View.renderStudyCard('none'); 
    });
    View.getEl('ft-know').addEventListener('click', () => {
        Hardware.playSound('click');
        Hardware.vibrate(20);

        Model.state.ftState = 'C';
        View.renderStudyCard('none');

        requestAnimationFrame(() => {
            View.revealStudyAnswer();
        });
    });
    View.getEl('ft-correct').addEventListener('click', () => { Hardware.playSound('success'); Hardware.vibrate(40); this.processFilterTestResult(true); });
    View.getEl('ft-wrong').addEventListener('click', () => { Hardware.playSound('error'); Hardware.vibrate(30); this.processFilterTestResult(false); });

    View.getEl('btn-prev').addEventListener('click', () => { if(Model.state.isAnimating) return; Hardware.unlockSpeech(); if(Model.state.currentIndex > 0) { Model.state.currentIndex--; Hardware.playSound('click'); Hardware.vibrate(60); View.renderStudyCard('prev'); } });
    View.getEl('btn-next').addEventListener('click', () => { if(Model.state.isAnimating) return; Hardware.unlockSpeech(); if(Model.state.currentIndex < Model.state.studyQueue.length-1) { Model.state.currentIndex++; Hardware.playSound('click'); Hardware.vibrate(40); View.renderStudyCard('next'); } });
    View.getEl('btn-finish').addEventListener('click', () => this.finishPendulum());
    
    let displayTrigger = View.getEl('btn-display-mode-trigger');
    if (displayTrigger) { displayTrigger.addEventListener('click', () => { Hardware.playSound('click'); Hardware.vibrate(15); BottomSheet.open(View.getEl('next-display-mode'), document.createElement('span')); }); }

    let btnMtReplay = View.getEl('btn-mt-replay');
    if (btnMtReplay) { btnMtReplay.addEventListener('click', () => { Hardware.playSound('click'); Hardware.vibrate(15); Hardware.unlockSpeech(); let w = Model.db[Model.state.studyQueue[Model.state.currentIndex]]; if(w) Hardware.speakWord(w); }); }

    let btnMtShowHint = View.getEl('btn-mt-show-hint');
    if (btnMtShowHint) {
        btnMtShowHint.addEventListener('click', () => {
            Hardware.vibrate(10);
            let w = Model.db[Model.state.studyQueue[Model.state.currentIndex]];
            const isEnglish = w && w.lang === 'en';
            
            if (isEnglish) {
                // 英语模式：提取纯英文例句部分并朗读
                if (w.example) {
                    // 兼容 || 和 / 两种分隔符，精准切出前半段的英文
                    let exampleEnPart = w.example.split('||')[0].split('/')[0].trim();
                    Hardware.unlockSpeech();
                    Hardware.speakText(exampleEnPart, null, 'en');
                } else {
                    window.showToast('暂无例句');
                }
            } else {
                // 日语模式：保持原有的显示假名逻辑
                if (Model.state.mode === 'filter-test') {
                    Model.state.ftShowKanaHint = true;
                    View.renderStudyCard('none');
                } else {
                    let wKana = View.getEl('w-kana');
                    if(wKana) {
                        wKana.style.display = 'block';
                        wKana.classList.remove('blur-text');
                        wKana.removeAttribute('aria-hidden');
                    }
                }
            }
        });
    }

    let autoSpeakCheck = View.getEl('setting-auto-speak');
    if (autoSpeakCheck) { autoSpeakCheck.addEventListener('change', (e) => { Hardware.playSound('click'); Hardware.vibrate(15); localStorage.setItem('autoSpeak', e.target.checked); showToast(e.target.checked ? "已开启自动朗读" : "已关闭自动朗读"); }); }


    let darkBtnCheck = View.getEl('setting-dark-btn');
    if (darkBtnCheck) {
        darkBtnCheck.addEventListener('change', (e) => {
            Hardware.playSound('click'); Hardware.vibrate(15);
            localStorage.setItem('darkBtnStyle', e.target.checked ? 'translucent' : 'solid');
            if(e.target.checked) document.body.setAttribute('data-dark-btn', 'translucent');
            else document.body.removeAttribute('data-dark-btn');
            showToast(e.target.checked ? "已开启透明叠加质感" : "已恢复实色按钮质感");
        });
    }

    let wordOrderSelect =
        View.getEl('setting-word-order-mode');

    if (wordOrderSelect) {
        wordOrderSelect.addEventListener(
            'change',
            (e) => {
                Hardware.playSound('click');
                Hardware.vibrate(15);

                localStorage.setItem(
                    'wordOrderMode',
                    e.target.value
                );

                const modeNames = {
                    'weak-first': '薄弱词优先',
                    'new-first': '新词优先',
                    'original': '词库原顺序'
                };

                showToast(
                    `词汇排列已切换为${modeNames[e.target.value]}`
                );
            }
        );
    }

    let skipCheck = View.getEl('setting-skip-mastered');
    if (skipCheck) {
        skipCheck.addEventListener('change', (e) => {
            Hardware.playSound('click'); Hardware.vibrate(15);
            localStorage.setItem('skipMastered', e.target.checked);
            showToast(e.target.checked ? "已开启智能跳过已亮维度" : "已关闭智能跳过已亮维度");
        });
    }

    let rubyCheck = View.getEl('setting-ruby-render');
    if (rubyCheck) {
        rubyCheck.addEventListener('change', (e) => {
            Hardware.playSound('click'); Hardware.vibrate(15);
            localStorage.setItem('useRubyRender', e.target.checked);
            showToast(e.target.checked ? "已切换为原生 Ruby 排版" : "已切换为 MathJax 引擎");
            if (!document.getElementById('detail-overlay').classList.contains('hidden') && document.getElementById('detail-overlay').classList.contains('active')) {
                Controller.renderDetailCard('none', false);
            } else if (!document.getElementById('study-area').classList.contains('hidden')) {
                View.renderStudyCard('none');
            }
        });
    }
    // 初始化 DeepSeek API 密钥设置
    let aiKeyInput = View.getEl('setting-ai-key');
    if (aiKeyInput) {
        aiKeyInput.value = localStorage.getItem('deepseekApiKey') || '';
        aiKeyInput.addEventListener('change', (e) => {
            localStorage.setItem('deepseekApiKey', e.target.value.trim());
            showToast("DeepSeek API Key 已保存");
        });
    }

    let ttsSelectTrigger = View.getEl('setting-tts-engine');
if (ttsSelectTrigger) {
    ttsSelectTrigger.addEventListener('change', (e) => {
        Hardware.playSound('click'); Hardware.vibrate(15);
        localStorage.setItem('ttsEngine', e.target.value);
        let names = { 'local': '系统自带', 'youdao': '网易有道', 'azure': '微软语音' };
        showToast(`已切换至 ${names[e.target.value]} 发音`);
    });
}


let aiSheetCopy = View.getEl('ai-sheet-copy');
if (aiSheetCopy) {
    aiSheetCopy.addEventListener('click', () => {
        Hardware.vibrate(15);
        let c = View.getEl('ai-chat-messages');
        if (c) {
            let t = '';
            c.querySelectorAll('.ai-chat-bubble-text').forEach(b => {
                t += b.innerText + '\n\n';
            });
            t = t.trim();
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(t).then(() => showToast('已复制对话全文')).catch(() => showToast('复制失败，请手动选择文字'));
            } else {
                showToast('复制失败，请手动选择文字');
            }
        }
    });
}
let aiWordCollectorClose =
    View.getEl('ai-word-collector-close');

if (aiWordCollectorClose) {
    aiWordCollectorClose.addEventListener(
        'click',
        () => {
            Hardware.vibrate(10);
            Controller._closeAIWordCollector();
        }
    );
}

let aiWordCandidateList =
    View.getEl('ai-word-candidate-list');

if (aiWordCandidateList) {
    aiWordCandidateList.addEventListener(
        'change',
        () => {
            Controller._updateAIWordCandidateCount();
        }
    );
}

let aiWordPreviewList =
    View.getEl('ai-word-preview-list');

if (aiWordPreviewList) {
    aiWordPreviewList.addEventListener(
        'input',
        event => {
            const field = event.target.closest(
                '[data-ai-draft-index][data-ai-draft-field]'
            );

            if (field) {
                Controller._updateAIWordDraftField(
                    field,
                    false
                );
            }
        }
    );

    aiWordPreviewList.addEventListener(
        'change',
        event => {
            const field = event.target.closest(
                '[data-ai-draft-index][data-ai-draft-field]'
            );

            if (field) {
                Controller._updateAIWordDraftField(
                    field,
                    true
                );
            }
        }
    );
}

let aiWordSelectAll =
    View.getEl('ai-word-select-all');

if (aiWordSelectAll) {
    aiWordSelectAll.addEventListener(
        'click',
        () => {
            Hardware.vibrate(10);
            Controller._toggleAllAIWordCandidates();
        }
    );
}

let aiWordSelectCancel =
    View.getEl('ai-word-select-cancel');

if (aiWordSelectCancel) {
    aiWordSelectCancel.addEventListener(
        'click',
        () => {
            Hardware.vibrate(10);
            Controller._closeAIWordCollector();
        }
    );
}

let aiWordEnrich =
    View.getEl('ai-word-enrich');

if (aiWordEnrich) {
    aiWordEnrich.addEventListener(
        'click',
        () => {
            Hardware.vibrate(15);
            Controller._enrichSelectedAIWords();
        }
    );
}

let aiWordBack =
    View.getEl('ai-word-back');

if (aiWordBack) {
    aiWordBack.addEventListener(
        'click',
        () => {
            Hardware.vibrate(10);
            Controller._showAIWordCollectorStage(
                'select'
            );
        }
    );
}

let aiWordSave =
    View.getEl('ai-word-save');

if (aiWordSave) {
    aiWordSave.addEventListener(
        'click',
        () => {
            Hardware.vibrate(18);
            Controller._saveAIWordDrafts();
        }
    );
}

let btnNewAIChat = View.getEl('btn-new-ai-chat');

if (btnNewAIChat) {
    btnNewAIChat.addEventListener('click', () => {
        Hardware.vibrate(15);
        Controller.openAIPresetPicker();
    });
}



document
    .querySelectorAll('.ai-preset-option')
    .forEach(option => {
        option.addEventListener(
            'click',
            () => {
                Hardware.vibrate(18);

                Controller.startAITabPreset(
                    option.dataset.preset
                );
            }
        );
    });

let btnAIChatBack = View.getEl('btn-ai-chat-back');

if (btnAIChatBack) {
    /*
     * 手指按下时立即触发震动，
     * 不必等到松手后才产生反馈。
     */
    btnAIChatBack.addEventListener(
        'pointerdown',
        (event) => {
            if (
                event.pointerType === 'mouse' &&
                event.button !== 0
            ) {
                return;
            }

            Hardware.vibrate(30);
        }
    );

    btnAIChatBack.addEventListener('click', () => {
        if (
            Controller.aiTabChat.messages.length > 0 &&
            Controller.aiTabChat.activeIdx === -1
        ) {
            let conv = {
                id: Date.now(),

                date:
                    new Date().toLocaleDateString('zh-CN') +
                    ' ' +
                    new Date().toLocaleTimeString(
                        'zh-CN',
                        {
                            hour: '2-digit',
                            minute: '2-digit'
                        }
                    ),

                sentence:
                    Controller.aiTabChat.sentence || '',

                word:
                    Controller.aiTabChat.word ||
                    '自由对话',

                lang:
                    Controller.aiTabChat.lang ||
                    Model.state.currentLangMode,

                cacheKey:
                    Controller.aiTabChat.cacheKey,

                                systemPrompt:
                    Controller.aiTabChat.systemPrompt,

                presetId:
                    Controller.aiTabChat.presetId || '',

                messages: [
                    ...Controller.aiTabChat.messages
                ]
            };

            Model.aiConversations.unshift(conv);
            Controller._persistConversations();
        }

        Controller.closeAITabChat();
    });
}

let aiTabChatSend = View.getEl('ai-tab-chat-send');
if (aiTabChatSend) {
    aiTabChatSend.addEventListener('click', () => {
        Hardware.vibrate(10);
        Controller.sendAITabMessage();
    });
}
let aiTabChatInput = View.getEl('ai-tab-chat-input');

if (aiTabChatInput) {
    /*
     * 点击输入框时立即给予轻微震动。
     * 使用 pointerdown，让反馈在手指按下时发生。
     */
    aiTabChatInput.addEventListener(
        'pointerdown',
        (event) => {
            if (
                event.pointerType === 'mouse' &&
                event.button !== 0
            ) {
                return;
            }

            Hardware.vibrate(18);
        }
    );

    aiTabChatInput.addEventListener(
        'keydown',
        (e) => {
            if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                document
                    .getElementById('tab-ai-history')
                    .classList.contains('active')
            ) {
                e.preventDefault();
                Controller.sendAITabMessage();
            }
        }
    );
}
let btnClearAI = View.getEl('btn-clear-ai-history');
if (btnClearAI) {
    btnClearAI.addEventListener('click', () => {
        Hardware.vibrate(20);
        showConfirm('清空全部记录', '确定要删除所有 AI 对话记录吗？此操作不可恢复。', () => {
            Model.aiConversations = [];
            Controller._persistConversations();
            Controller.renderAIHistory();
            showToast('已清空全部对话记录');
        });
    });
}

let aiHistDetailClose = View.getEl('ai-history-detail-close');
if (aiHistDetailClose) {
    aiHistDetailClose.addEventListener('click', () => {
        Hardware.vibrate(10);
        window.toggleModal('ai-history-detail-overlay', false);
    });
}
let aiHistDetailCopy = View.getEl('ai-history-detail-copy');
if (aiHistDetailCopy) {
    aiHistDetailCopy.addEventListener('click', () => {
        Hardware.vibrate(15);
        let c = View.getEl('ai-history-detail-messages');
        if (c) {
            let t = '';
            c.querySelectorAll('.ai-chat-bubble-text').forEach(b => { t += b.innerText + '\n\n'; });
            t = t.trim();
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(t).then(() => showToast('已复制对话全文')).catch(() => showToast('复制失败'));
            } else {
                showToast('复制失败');
            }
        }
    });
}
let aiChatSend = View.getEl('ai-chat-send');
if (aiChatSend) {
    aiChatSend.addEventListener('click', () => {
        Hardware.vibrate(10);
        Controller.sendAIMessage();
    });
}
let aiChatInput = View.getEl('ai-chat-input');
if (aiChatInput) {
    aiChatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            Controller.sendAIMessage();
        }
    });
}

let testVibrateBtn = View.getEl('btn-test-vibrate');
if (testVibrateBtn) {
    testVibrateBtn.addEventListener('click', () => {
        Hardware.playSound('click');
        const vibrated = Hardware.vibrate(300);
        if (navigator.vibrate) {
            showToast('震动测试已触发，请感受设备震动');
        } else {
            showToast('您的浏览器不支持震动 API（iOS 系统或桌面浏览器）');
        }
    });
}

        let searchInput = View.getEl('wb-search-input');
    if (searchInput) { 
        searchInput.addEventListener('input', () => { 
            if (Model.state.batchMode) Controller.toggleBatchMode(); 
            View.resetWordbankRenderer(); 
        }); 
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                searchInput.blur();
            }
        });
    }

    let wbGridContainer = View.getEl('wb-grid-container');
    if (wbGridContainer) {
        wbGridContainer.addEventListener('pointerdown', () => {
            if (document.activeElement && document.activeElement.id === 'wb-search-input') {
                document.activeElement.blur();
            }
        }, { passive: true });
    }

    const btnExport = View.getEl('btn-export-backup');

    if (btnExport) {
        btnExport.addEventListener('click', () => {
            this.exportBackup();
        });
    }

    const btnImport = View.getEl('btn-import-backup');
    const fileImport = View.getEl('file-import-backup');

    if (btnImport && fileImport) {
        btnImport.addEventListener('click', () => {
            Hardware.vibrate(15);
            fileImport.click();
        });

        fileImport.addEventListener('change', event => {
            const selectedFile = event.target.files?.[0];

            if (selectedFile) {
                this.importBackup(selectedFile);
            }

            event.target.value = '';
        });
    }

    const btnUndoImport = View.getEl('btn-undo-import');

    if (btnUndoImport) {
        btnUndoImport.addEventListener('click', () => {
            this.restorePreImportBackup();
        });
    }


    let lpBtn = View.getEl('btn-long-press');
    let punchTimer = null; let vibrateInterval = null; let isLpPressing = false; 
    const clearPunch = () => { if(punchTimer) clearTimeout(punchTimer); if(vibrateInterval) clearInterval(vibrateInterval); punchTimer = null; vibrateInterval = null; isLpPressing = false; if(lpBtn) lpBtn.classList.remove('pressing'); Hardware.stopChargeSound(); };
    if(lpBtn) {
        lpBtn.addEventListener('pointerdown', (e) => {
            if(lpBtn.classList.contains('done') || isLpPressing) return; if(e.pointerType === 'mouse' && e.button !== 0) return;
            isLpPressing = true; Hardware.unlockSpeech(); try { lpBtn.setPointerCapture(e.pointerId); } catch(err) {} 
            lpBtn.classList.add('pressing'); Hardware.playChargeSound(); vibrateInterval = setInterval(() => Hardware.vibrate(10), 100);
            punchTimer = setTimeout(() => { clearPunch(); Hardware.playDingDong(); Hardware.vibrate(200); let t = new Date().toLocaleDateString('zh-CN'); Model.records.push({date: t, type: 'daily_punch'}); Model.saveRecords(); View.renderDashboard(); showToast("打卡成功！能量满点"); }, 1500);
        });
        lpBtn.addEventListener('pointerup', clearPunch); 
        lpBtn.addEventListener('pointercancel', clearPunch); 
        lpBtn.addEventListener('pointerleave', clearPunch); 
        lpBtn.addEventListener('contextmenu', (e) => { e.preventDefault(); }); 

    }

    ['next-display-mode', 'wb-col-select', 'wb-blur-select'].forEach(id => { 
        let el = View.getEl(id);
        if (el) {
            el.addEventListener('change', (e) => { 
                Hardware.playSound('click'); 
                Hardware.vibrate(10);
                if(id === 'next-display-mode') { 
                    localStorage.setItem('displayMode', e.target.value); 
                    Model.state.mtStep = 1; 
                    View.renderStudyCard('none'); 
                } else if(id.includes('wb')) { 
                    if (Model.state.batchMode) Controller.toggleBatchMode();
                    View.resetWordbankRenderer(); 
                } 
            });
        }
    });
    
    let folderFilter = View.getEl('wb-folder-filter');
    if (folderFilter) {
        folderFilter.addEventListener('change', () => { 
            Hardware.playSound('click'); 
            Hardware.vibrate(10);
            if (Model.state.batchMode) Controller.toggleBatchMode();
            View.resetWordbankRenderer(); 
        });
    }
    

    View.getEl('btn-speaker').addEventListener('click', (e) => { Hardware.vibrate(10); Hardware.unlockSpeech(); let w = Model.db[Model.state.studyQueue[Model.state.currentIndex]]; Hardware.speakWord(w, e.currentTarget); });
    View.getEl('star-btn').addEventListener('click', (e) => {
        Hardware.playSound('click');

        const wordObj =
            Model.db[Model.state.studyQueue[Model.state.currentIndex]];
        const wordId = Model.getWordId(wordObj);
        const index = Model.stars.indexOf(wordId);
        const button = e.currentTarget;
        const icon = View.getEl('star-icon');

        if (index > -1) {
            Model.stars.splice(index, 1);
            button.classList.remove('active');
            icon.style.fontVariationSettings = "'FILL' 0";
        } else {
            Model.stars.push(wordId);
            button.classList.add('active');
            icon.style.fontVariationSettings = "'FILL' 1";
            window.createStarParticles(button);
            Hardware.vibrate(20);
        }

        Model.saveStars();
    });

    let dtStarBtn = View.getEl('dt-star-btn');
    if (dtStarBtn) {
        dtStarBtn.addEventListener('click', (e) => {
            Hardware.playSound('click');
            Hardware.vibrate(10);

            const realIdx =
                Model.state.detailArray[Model.state.activeDetailIdx];
            const word = Model.db[realIdx];
            const wordId = Model.getWordId(word);
            const starIndex = Model.stars.indexOf(wordId);
            const starButton = e.currentTarget;
            const icon = View.getEl('dt-star-icon');

            if (starIndex > -1) {
                Model.stars.splice(starIndex, 1);
                starButton.classList.remove('active');
                icon.style.fontVariationSettings = "'FILL' 0";
            } else {
                Model.stars.push(wordId);
                starButton.classList.add('active');
                icon.style.fontVariationSettings = "'FILL' 1";
                window.createStarParticles(starButton);
            }

            Model.saveStars();
            Model.state.renderedStartIndex = -1;
        });
    }

        document.addEventListener('click', (e) => { 
        // 拦截 AI 闪耀按钮点击
        let aiBtn = e.target.closest('.ai-sparkle-btn, .ai-sparkle-capsule, .ai-sparkle-icon');
if (aiBtn) {
    Hardware.vibrate(15);
    Controller.openAISheet(
        aiBtn.dataset.sentence,
        aiBtn.dataset.word,
        aiBtn.dataset.lang || 'ja',
        Number(aiBtn.dataset.wordIndex)
    );
    return; 
}

        let aiResponseAction = e.target.closest('.ai-response-action');
if (aiResponseAction) {
    Hardware.vibrate(12);
    Controller.handleAIResponseAction(
        aiResponseAction.dataset.action,
        aiResponseAction.dataset.payloadId
    );
    return;
}
        // AI 内联面板关闭按钮
let aiCloseBtn = e.target.closest('.ai-inline-close-btn');
if (aiCloseBtn) {
    let panel = aiCloseBtn.closest('.ai-inline-panel');
    if (panel) panel.classList.add('hidden');
    return;
}
        let target = e.target.closest('.blur-target, .wb-blur-trigger');

        if (
            target &&
            (
                target.classList.contains('blur-text') ||
                (
                    target.parentElement &&
                    target.parentElement.classList.contains('blur-text')
                )
            )
        ) {
            let el = target.classList.contains('blur-text')
                ? target
                : target.parentElement;

            View.revealStudyElement(el);

            if (el.id === 'w-word') {
                document.querySelectorAll('#w-roots .r-text').forEach(n => {
                    View.revealStudyElement(n);
                });
            } else if (el.id === 'w-meaning') {
                document.querySelectorAll('#w-roots .r-mean').forEach(n => {
                    View.revealStudyElement(n);
                });
            } else if (el.classList.contains('r-text')) {
                let wWord = document.getElementById('w-word');

                if (wWord) {
                    View.revealStudyElement(wWord);
                }

                document.querySelectorAll('#w-roots .r-text').forEach(n => {
                    View.revealStudyElement(n);
                });
            } else if (el.classList.contains('r-mean')) {
                let wMean = document.getElementById('w-meaning');

                if (wMean) {
                    View.revealStudyElement(wMean);
                }

                document.querySelectorAll('#w-roots .r-mean').forEach(n => {
                    View.revealStudyElement(n);
                });
            }

            Hardware.playSound('click');
            Hardware.vibrate(15);
        }

        let exJp = e.target.closest('.dt-ex-jp'); 
        if (exJp) { 
            let textToSpeak = exJp.getAttribute('data-speak'); 
            if (textToSpeak) { 
                Hardware.unlockSpeech(); 
                let currentIdx = -1;
                if (document.getElementById('detail-overlay').classList.contains('active')) {
                    currentIdx = Model.state.detailArray[Model.state.activeDetailIdx];
                } else if (Model.state.studyQueue && Model.state.studyQueue.length > 0) {
                    currentIdx = Model.state.studyQueue[Model.state.currentIndex];
                }
                const wEx = currentIdx > -1 ? Model.db[currentIdx] : null;
                let lang = (wEx && wEx.lang === 'en') ? 'en' : 'ja';
                Hardware.speakText(textToSpeak, exJp.querySelector('.ex-speaker') || exJp, lang); 
                Hardware.vibrate(10); 
            } 
        }

        // 音标喇叭发音监听
        let phSpeaker = e.target.closest('.phonetic-speaker');
        if (phSpeaker) {
            Hardware.unlockSpeech();
            let currentIdx = -1;
            if (document.getElementById('detail-overlay').classList.contains('active')) {
                currentIdx = Model.state.detailArray[Model.state.activeDetailIdx];
            } else if (Model.state.studyQueue && Model.state.studyQueue.length > 0) {
                currentIdx = Model.state.studyQueue[Model.state.currentIndex];
            }
            const wObj = currentIdx > -1 ? Model.db[currentIdx] : null;
            if (wObj) {
                Hardware.speakWord(wObj, phSpeaker);
                Hardware.vibrate(15);
            }
        }
    });


    let pressTimer = null; let isPressing = false; let startX = 0; let startY = 0; let startScrollY = 0;
    const clearPressCard = (card) => { if(pressTimer) clearTimeout(pressTimer); pressTimer = null; isPressing = false; if(card) card.classList.remove('pressing'); };
    const onPointerDownCard = (e) => { if(e.pointerType === 'mouse' && e.button !== 0) return; let card = e.target.closest('.wb-card'); if (!card || e.target.closest('button, .wb-checkbox, .wb-c-speaker, .btn-wb-star')) return; if (Model.state.batchMode || parseInt(card.dataset.idx) === -999) return; startX = e.clientX; startY = e.clientY; startScrollY = window.scrollY; isPressing = true; card.classList.add('pressing'); pressTimer = setTimeout(() => { if(isPressing && Math.abs(window.scrollY - startScrollY) < 10) { Hardware.vibrate(50); Hardware.playSound('click'); Controller.openDetailModal(parseInt(card.dataset.idx)); clearPressCard(card); } }, 500); };
    const onPointerMoveCard = (e) => { if(!isPressing) return; if(Math.abs(e.clientX - startX) > 25 || Math.abs(e.clientY - startY) > 25) { let card = e.target.closest('.wb-card'); clearPressCard(card); } };
    const onPointerUpCard = (e) => { let card = e.target.closest('.wb-card'); clearPressCard(card); };
    let grid = View.getEl('wb-grid'); grid.addEventListener('pointerdown', onPointerDownCard); grid.addEventListener('pointermove', onPointerMoveCard); grid.addEventListener('pointerup', onPointerUpCard); grid.addEventListener('pointercancel', onPointerUpCard);
    grid.addEventListener('contextmenu', (e) => { if(e.target.closest('.wb-card') && !e.target.closest('.btn-wb-star')) e.preventDefault(); });
    grid.addEventListener('click', (e) => {
      let card = e.target.closest('.wb-card'); if (!card) return; let idx = parseInt(card.dataset.idx); if (idx === -999) return;
      if (e.target.closest('.btn-wb-star')) {
          Hardware.playSound('click');
          Hardware.vibrate(10);

          const word = Model.db[idx];
          const wordId = Model.getWordId(word);
          const starIndex = Model.stars.indexOf(wordId);
          const starButton = e.target.closest('.btn-wb-star');
          const icon = starButton.querySelector('.material-symbols-rounded');

          if (starIndex > -1) {
              Model.stars.splice(starIndex, 1);
              starButton.classList.remove('active');
              icon.style.fontVariationSettings = "'FILL' 0";
          } else {
              Model.stars.push(wordId);
              starButton.classList.add('active');
              icon.style.fontVariationSettings = "'FILL' 1";
              window.createStarParticles(starButton);
          }

          Model.saveStars();
          return;
      }
      if (e.target.closest('.btn-wb-speak') || e.target.closest('.wb-c-speaker')) { Hardware.unlockSpeech(); Hardware.speakWord(Model.db[idx], e.target.closest('.btn-wb-speak') || e.target.closest('.wb-c-speaker')); Hardware.vibrate(10); return; }
      if (Model.state.batchMode) {
          e.stopPropagation();

          if (Model.state.selectedSet.has(idx)) {
              Model.state.selectedSet.delete(idx);
          } else {
              Model.state.selectedSet.add(idx);
          }

          const isSelected =
              Model.state.selectedSet.has(idx);

          Hardware.playSound('click');
          Hardware.vibrate(10);

          card.classList.toggle(
              'is-selected',
              isSelected
          );
          card.setAttribute(
              'aria-pressed',
              String(isSelected)
          );

          const checkEl =
              card.querySelector('.wb-checkbox');

          if (checkEl) {
              checkEl.classList.toggle(
                  'checked',
                  isSelected
              );
              checkEl.innerText =
                  isSelected ? '✓' : '';
          }

          View.updateWordbankManagementUI();
      }
    });

    View.getEl('wb-manage-toggle').addEventListener(
        'click',
        () => this.toggleBatchMode()
    );
    View.getEl('btn-batch-cancel').addEventListener(
        'click',
        () => this.toggleBatchMode(false)
    );
    View.getEl('btn-new-folder').addEventListener('click', () => this.createFolder()); 
    View.getEl('btn-del-folder').addEventListener('click', () => this.deleteFolder());
    View.getEl('btn-batch-move').addEventListener(
        'click',
        () => {
            Hardware.vibrate(15);
            this.openMoveModal(-2);
        }
    );
    View.getEl('btn-batch-edit').addEventListener(
        'click',
        () => {
            if (Model.state.selectedSet.size !== 1) {
                return;
            }

            const [idx] = Model.state.selectedSet;
            Hardware.playSound('click');
            Hardware.vibrate(15);
            this.editWord(idx);
        }
    );
    View.getEl('btn-batch-del').addEventListener(
        'click',
        () => this.batchDelete()
    );
    View.getEl('btn-cancel-move').addEventListener('click', () => { Hardware.vibrate(10); window.toggleModal('move-overlay', false); });
    View.getEl('btn-import').addEventListener('click', () => this.importWords());
    View.getEl('import-lang-select').addEventListener('change', () => {
        this.updateImportFormatUI();
        this.updateImportFolderOptions();
        this.updateImportMetadataOptions();
    });
    View.getEl('btn-view-settings').addEventListener('click', () => { Hardware.vibrate(15); window.toggleModal('view-settings-overlay', true); document.querySelectorAll('.vs-col-btn').forEach(b => { b.onclick = () => { Hardware.vibrate(10); document.querySelectorAll('.vs-col-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); View.getEl('wb-col-select').value = b.dataset.val; View.resetWordbankRenderer(); }}); document.querySelectorAll('.vs-blur-btn').forEach(b => { b.onclick = () => { Hardware.vibrate(10); document.querySelectorAll('.vs-blur-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); View.getEl('wb-blur-select').value = b.dataset.val; View.resetWordbankRenderer(); }}); });
    View.getEl('btn-reset-progress').addEventListener('click', () => {
        Hardware.vibrate(20);
        showConfirm(
            '清空学习进度？',
            '词库、收藏、AI 对话和设置都会保留；掌握度、通关与学习记录将归零。',
            () => this.clearLearningProgress()
        );
    });
    View.getEl('btn-remove-imported').addEventListener('click', () => {
        Hardware.vibrate(20);
        showConfirm(
            '恢复内置词库？',
            '个人导入词汇和自建词库将被移除，内置日语与英语词库会重新载入。',
            () => this.restoreBuiltInLibrary()
        );
    });
    View.getEl('btn-reset').addEventListener('click', () => {
        Hardware.vibrate(30);
        showConfirm(
            '完全重置应用？',
            '<strong style="color: var(--accent-red);">此操作会删除词库改动、收藏、学习记录、AI 对话和偏好设置。</strong><br><br>DeepSeek API Key 会保留，执行前会自动建立恢复点。',
            () => this.fullResetApp()
        );
    });
    View.getEl('detail-close').addEventListener('click', () => { Hardware.vibrate(15); window.toggleModal('detail-overlay', false); if (document.getElementById('tab-wordbank').classList.contains('active')) { Model.state.renderedStartIndex = -1; View.renderVirtualGrid(); } }); 
    View.getEl('detail-prev').addEventListener('click', () => this.navDetail(-1)); View.getEl('detail-next').addEventListener('click', () => this.navDetail(1));
    View.getEl('btn-save-edit').addEventListener('click', () => {
        Hardware.vibrate(20);

        const wordValue =
            View.getEl('edit-word').value.trim();

        const typeValue =
            View.getEl('edit-type').value.trim();

        const meaningValue =
            View.getEl('edit-meaning').value.trim();

        if (!wordValue || !typeValue || !meaningValue) {
            showToast('请填写单词、词性和释义');
            return;
        }

        const readingValue =
            View.getEl('edit-kana').value.trim();

        const exampleValue =
            View.getEl('edit-example').value.trim();

        const rootsInput =
            View.getEl('edit-roots');

        const rootsValue =
            rootsInput
                ? rootsInput.value.trim()
                : '';

        const editLang =
            Model.editingIdx > -1
                ? (Model.db[Model.editingIdx]?.lang || 'ja')
                : (Controller.pendingWordDraft?.lang || 'ja');

        const levelValue = normalizeWordLevel(
            View.getEl('edit-level')?.value || '',
            editLang
        );

        const difficultyValue = normalizeWordDifficulty(
            View.getEl('edit-difficulty')?.value || 0
        );

        const tagsValue = normalizeWordTags(
            View.getEl('edit-tags')?.value || ''
        );

        if (Model.editingIdx > -1) {
            const word =
                Model.db[Model.editingIdx];

            const normalizedEdit = normalizeWordEntry({
                ...word,
                word: wordValue,
                type: typeValue,
                meaning: meaningValue,
                example: exampleValue,
                phonetic:
                    word.lang === 'en'
                        ? readingValue
                        : (word.phonetic || ''),
                kana:
                    word.lang === 'en'
                        ? (word.kana || '')
                        : readingValue,
                roots:
                    word.lang === 'en'
                        ? rootsValue
                        : '',
                level: levelValue,
                difficulty: difficultyValue,
                tags: tagsValue
            });

            Object.assign(word, normalizedEdit);

            Model.saveDB();
            View.resetWordbankRenderer();

            window.toggleModal(
                'edit-overlay',
                false
            );

            showToast('修改已保存并整理格式');
            return;
        }

        const draft =
            Controller.pendingWordDraft;

        if (!draft) {
            return;
        }

        const newWord = normalizeWordEntry({
            word: wordValue,
            type: typeValue,
            meaning: meaningValue,
            example: exampleValue,
            folder: draft.folder,
            lang: draft.lang,
            phonetic:
                draft.lang === 'en'
                    ? readingValue
                    : '',
            kana:
                draft.lang === 'ja'
                    ? readingValue
                    : '',
            roots:
                draft.lang === 'en'
                    ? rootsValue
                    : '',
            level: levelValue,
            difficulty: difficultyValue,
            tags: tagsValue,
            builtIn: false,
            isImported: true,
            importedAt: new Date().toISOString(),
            srs: {
                ease: 2.5,
                interval: 0,
                nextReview: Date.now()
            }
        });

        Model.db.push(newWord);
        Model.saveDB();

        Controller.pendingWordDraft = null;

        View.updateWordbankUI();
        View.resetWordbankRenderer();

        window.toggleModal(
            'edit-overlay',
            false
        );

        showToast(`已加入「${wordValue}」`);
    });

    View.getEl('btn-cancel-edit').addEventListener('click', () => {
        Hardware.vibrate(10);
        Controller.pendingWordDraft = null;
        window.toggleModal('edit-overlay', false);
    });

        // 🟢 WCAG 伪按钮 (role="button") 空格触发机制 (规范：Space 释放时触发)
    document.addEventListener('keyup', (e) => {
        let el = document.activeElement;
        if (el && el.getAttribute('role') === 'button' && e.key === ' ') {
            e.preventDefault();
            el.click(); // 兼容绑了 onclick 的元素（如底部菜单）
            el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse', button: 0 })); // 兼容绑了 onpointerdown 的元素（如键盘、选择题）
        }
    });

    // 🚀 实体键盘盲操接管中枢 (Physical Keyboard Integration)
    document.addEventListener('keydown', (e) => {

        
        // 🟢 WCAG 焦点陷阱 (Focus Trap) - 必须置于最顶层防线之前
        if (e.key === 'Tab') {
            let activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                // 筛选出弹窗内所有物理可见的、可聚焦的元素
                let focusable = Array.from(activeModal.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
                                     .filter(node => node.offsetParent !== null);

                if (focusable.length > 0) {
                    let firstEl = focusable[0];
                    let lastEl = focusable[focusable.length - 1];

                    if (e.shiftKey) { // Shift + Tab：反向切换
                        if (document.activeElement === firstEl || !activeModal.contains(document.activeElement)) {
                            e.preventDefault();
                            lastEl.focus();
                        }
                    } else { // Tab：正向切换
                        if (document.activeElement === lastEl || !activeModal.contains(document.activeElement)) {
                            e.preventDefault();
                            firstEl.focus();
                        }
                    }
                } else {
                    // 如果弹窗内没有任何可交互元素，彻底锁死 Tab 键
                    e.preventDefault(); 
                }
                return; // 阻断后续所有针对主界面的快捷键逻辑
            }
        }

        // 🔒 第一层防线：如果用户正在输入框里打字，静默所有快捷键 (放行 Escape)
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
            if (e.key !== 'Escape') return; 
        }
        
        // 🟢 WCAG 伪按钮 (role="button") 回车触发与空格拦截机制
        let activeEl = document.activeElement;
        if (activeEl && activeEl.getAttribute('role') === 'button' && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault(); // 关键：阻止空格键引起页面默认向下滚动
            
            // 规范：Enter 键在按下时立即触发
            if (e.key === 'Enter') {
                activeEl.click(); 
                activeEl.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse', button: 0 }));
            }
            return; // 拦截事件，防止触发下方的全局空格发音等快捷键
        }
        
        let key = e.key;
        let keyLower = key.toLowerCase();

        // 🟢 全局通用快捷键：Esc 退出与关闭
        if (key === 'Escape') {
            if (View.getEl('bs-overlay').classList.contains('active')) { window.toggleModal('bs-overlay', false); return; }
            if (View.getEl('view-settings-overlay').classList.contains('active')) { window.toggleModal('view-settings-overlay', false); return; }
            if (View.getEl('group-select-overlay').classList.contains('active')) { window.toggleModal('group-select-overlay', false); return; }
            if (View.getEl('dialog-overlay').classList.contains('active')) { window.toggleModal('dialog-overlay', false); return; }
            if (View.getEl('move-overlay').classList.contains('active')) { window.toggleModal('move-overlay', false); return; }
            if (View.getEl('detail-overlay').classList.contains('active')) { Controller.closeDetailIfOpen(); return; }
            if (!View.getEl('study-area').classList.contains('hidden')) { View.getEl('btn-exit-study').click(); return; }
        }

        // 🟡 底部下拉菜单（Bottom Sheet）的键盘接管
        let bsOverlay = View.getEl('bs-overlay');
        let groupOverlay = View.getEl('group-select-overlay');
        let moveOverlay = View.getEl('move-overlay');
        let activeOverlay = bsOverlay.classList.contains('active') ? bsOverlay : 
                            (groupOverlay.classList.contains('active') ? groupOverlay : 
                            (moveOverlay.classList.contains('active') ? moveOverlay : null));

        if (activeOverlay) {
            let options = Array.from(activeOverlay.querySelectorAll('.bs-option'));
            if (options.length === 0) return;
            let currentIdx = options.findIndex(o => o.classList.contains('selected'));
            
            // 上下键切换高亮项
            if (key === 'ArrowDown' || key === 'ArrowUp') {
                e.preventDefault();
                if (currentIdx === -1) currentIdx = 0;
                else {
                    options[currentIdx].classList.remove('selected');
                    if (key === 'ArrowDown') currentIdx = (currentIdx + 1) % options.length;
                    else currentIdx = (currentIdx - 1 + options.length) % options.length;
                }
                options[currentIdx].classList.add('selected');
                // 确保高亮项自动滚动到可视区域内
                options[currentIdx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                return;
            }
            // 空格或回车确认选中
            if (key === 'Enter' || key === ' ') {
                e.preventDefault();
                if (currentIdx !== -1) options[currentIdx].click();
                return;
            }
            return; // 在菜单里时，屏蔽其他字母键引发的乱跳转
        }

                // ⚪ 词库详情卡片翻页接管
        let detailOverlay = View.getEl('detail-overlay');
        if (detailOverlay && detailOverlay.classList.contains('active')) {
            if (key === 'ArrowLeft') { e.preventDefault(); View.getEl('detail-prev').click(); return; }
            if (key === 'ArrowRight') { e.preventDefault(); View.getEl('detail-next').click(); return; }
            // 顺手加个空格发音，体验更好
            if (key === ' ') { 
                e.preventDefault(); 
                let realIdx = Model.state.detailArray[Model.state.activeDetailIdx]; 
                let w = Model.db[realIdx]; 
                if (w) { Hardware.unlockSpeech(); Hardware.speakWord(w); Hardware.vibrate(10); } 
                return; 
            }
        }

        // 🔵 底部导航栏(Tab)的全局左右切换
        // 触发条件：没有任何弹窗处于打开状态，且不在学习区内
        let isAnyModalOpen = document.querySelectorAll('.modal-overlay.active').length > 0;
        if (!isAnyModalOpen && View.getEl('study-area').classList.contains('hidden')) {
            if (key === 'ArrowLeft' || key === 'ArrowRight') {
                e.preventDefault();
                let navItems = Array.from(document.querySelectorAll('.nav-item'));
                let currentIdx = navItems.findIndex(item => item.classList.contains('active'));
                if (currentIdx !== -1) {
                    let nextIdx = key === 'ArrowRight' ? (currentIdx + 1) % navItems.length : (currentIdx - 1 + navItems.length) % navItems.length;
                    navItems[nextIdx].click();
                }
                return;
            }
        }

        // 🔵 首页（道場）特定快捷键
        if (!View.getEl('tab-home').classList.contains('hidden') && View.getEl('study-area').classList.contains('hidden') && !isAnyModalOpen) {
            if (keyLower === 'a') { e.preventDefault(); View.getEl('btn-start-pendulum').click(); return; }
            if (keyLower === 'b') { e.preventDefault(); View.getEl('btn-start-dual-track').click(); return; }
            if (keyLower === 'c') { e.preventDefault(); View.getEl('btn-start-rote-learning').click(); return; }
            if (keyLower === 'd') { e.preventDefault(); View.getEl('btn-start-memory-test').click(); return; }
            if (keyLower === 'e') { e.preventDefault(); View.getEl('btn-start-filter-test').click(); return; }
            if (keyLower === 'f') { e.preventDefault(); View.getEl('btn-test-range-trigger').click(); return; }
            if (keyLower === 'g') { e.preventDefault(); View.getEl('btn-test-display-trigger').click(); return; }
            if (keyLower === 't' || (e.ctrlKey && keyLower === 't')) { e.preventDefault(); View.toggleTheme(); return; }
            
            // 长按空格打卡 (通过捕获 keydown 并忽略系统的按键连击)
            if (key === ' ') {
                e.preventDefault();
                let lpBtn = View.getEl('btn-long-press');
                if (lpBtn && !e.repeat) { 
                    lpBtn.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', button: 0 }));
                }
                return;
            }
        }


        // 🟣 学习/复习/测试区域快捷键
        if (!View.getEl('study-area').classList.contains('hidden')) {
            let mode = Model.state.mode;
            let dtSpellArea = View.getEl('dt-spell-area');
            let mtSpellArea = View.getEl('mt-spell-area');
            let dtChoiceArea = View.getEl('dt-choice-area');
            let mtChoiceArea = View.getEl('mt-choice-area');
            
            // 🔒 模式状态识别
            let isSpelling = (!dtSpellArea.classList.contains('hidden')) || (!mtSpellArea.classList.contains('hidden'));
            let isChoice = (!dtChoiceArea.classList.contains('hidden')) || (!mtChoiceArea.classList.contains('hidden'));

            let wObj = Model.db[Model.state.studyQueue[Model.state.currentIndex]];
            let displayMode = View.getEl('next-display-mode').value;

            // 1. 拼写输入隔离 (如果是打字阶段，把字母全部交给罗马音引擎)
            if (isSpelling) {
                let activeInputEl = !dtSpellArea.classList.contains('hidden') ? View.getEl('dt-spell-input') : View.getEl('mt-spell-input');
                const isEnglishSpelling = wObj?.lang === 'en';
                if (/^[a-zA-Z]$/.test(key) || key === '-' || key === "'" || key === 'Backspace' || key === 'Enter') {
                    e.preventDefault(); 
                    activeInputEl.classList.remove('error-state', 'shake-anim');
                    
                    if (key === 'Enter') {
                        Controller.handleSpellConfirm(activeInputEl, wObj, displayMode);
                        View.simulateKeyPress('Enter');
                    } else if (isEnglishSpelling) {
                        if (key === 'Backspace') {
                            EnglishInput.input('Backspace');
                        } else if (key === "'") {
                            EnglishInput.buffer += "'";
                        } else {
                            EnglishInput.input(key);
                        }

                        activeInputEl.innerHTML = escapeHTML(
                            EnglishInput.getDisplayText()
                        );
                        View.simulateKeyPress(
                            key === 'Backspace'
                                ? 'Backspace'
                                : key.toUpperCase()
                        );
                    } else {
                        RomajiEngine.input(key);
                        activeInputEl.innerHTML = RomajiEngine.getDisplayText();
                        View.simulateKeyPress(key.toUpperCase());
                    }
                    return;
                }
            }

            // 2. 选择题快捷键 (A, B, C, D) 以及兼容数字 1, 2, 3, 4
            if (isChoice && ['a', 'b', 'c', 'd', '1', '2', '3', '4'].includes(keyLower)) {
                e.preventDefault();
                let choiceContainer = !dtChoiceArea.classList.contains('hidden') ? View.getEl('dt-choice-buttons') : View.getEl('mt-choice-buttons');
                if (choiceContainer) {
                    let buttons = choiceContainer.querySelectorAll('.dt-choice-btn');
                    let idx = -1;
                    if (['a', 'b', 'c', 'd'].includes(keyLower)) idx = ['a', 'b', 'c', 'd'].indexOf(keyLower);
                    else idx = parseInt(keyLower) - 1;

                    if (buttons[idx]) buttons[idx].dispatchEvent(new PointerEvent('pointerdown'));
                }
                return;
            }

            // 3. H键：显示假名提示 (防误触：打字阶段 H 属于发音，不可触发此功能)
            if (keyLower === 'h' && !isSpelling) {
                let btnMtShowHint = View.getEl('btn-mt-show-hint');
                if (btnMtShowHint && !View.getEl('mt-blind-audio-ui').classList.contains('hidden')) {
                    e.preventDefault(); btnMtShowHint.click(); return;
                }
                let hintWrap = document.querySelector('.spell-hint-wrap.show .spell-hint-btn');
                if (hintWrap) { e.preventDefault(); hintWrap.click(); return; }
            }

            // 4. 方向键及回车：主导流程前进后退 / 判定判断
            if (key === 'ArrowRight' || key === 'Enter') {
                let btnNext = View.getEl('btn-next');
                let btnFinish = View.getEl('btn-finish');
                let ftKnow = View.getEl('ft-know');
                let ftCorrect = View.getEl('ft-correct');
                
                if (!View.getEl('capsule-filter-test').classList.contains('hidden') && ftKnow) {
                    e.preventDefault(); ftKnow.click(); return;
                }
                if (!View.getEl('capsule-filter-judge').classList.contains('hidden') && ftCorrect) {
                    e.preventDefault(); ftCorrect.click(); return;
                }

                if (btnNext && window.getComputedStyle(btnNext).display !== 'none' && !btnNext.disabled) {
                    e.preventDefault(); btnNext.click();
                } else if (btnFinish && window.getComputedStyle(btnFinish).display !== 'none') {
                    e.preventDefault(); btnFinish.click();
                }
            } else if (key === 'ArrowLeft') {
                let btnPrev = View.getEl('btn-prev');
                let ftForget = View.getEl('ft-forget');
                let ftWrong = View.getEl('ft-wrong');
                
                if (!View.getEl('capsule-filter-test').classList.contains('hidden') && ftForget) {
                    e.preventDefault(); ftForget.click(); return;
                }
                if (!View.getEl('capsule-filter-judge').classList.contains('hidden') && ftWrong) {
                    e.preventDefault(); ftWrong.click(); return;
                }

                if (btnPrev && window.getComputedStyle(btnPrev).display !== 'none' && !btnPrev.disabled) {
                    e.preventDefault(); btnPrev.click();
                }
            } else if (key === 'ArrowDown') {
                let ftBlur = View.getEl('ft-blur');
                if (!View.getEl('capsule-filter-test').classList.contains('hidden') && ftBlur && window.getComputedStyle(ftBlur).display !== 'none') {
                    e.preventDefault(); ftBlur.click(); return;
                }
            } 
            // 5. 空格键：万能揭晓/发音
            else if (key === ' ') {
                e.preventDefault();
                let blurTarget = document.querySelector('.blur-text');
                if (blurTarget) {
                    blurTarget.click();
                } else {
                    let btnSpeaker = View.getEl('btn-speaker');
                    let btnMtReplay = View.getEl('btn-mt-replay');
                    if (!View.getEl('mt-blind-audio-ui').classList.contains('hidden') && btnMtReplay) {
                        btnMtReplay.click();
                    } else if (btnSpeaker && window.getComputedStyle(btnSpeaker).display !== 'none') {
                        btnSpeaker.click();
                    }
                }
            }
        }
    });

    // 🚀 松开空格键：停止打卡蓄力
    document.addEventListener('keyup', (e) => {
        if (e.key === ' ') {
            if (!View.getEl('tab-home').classList.contains('hidden') && View.getEl('study-area').classList.contains('hidden')) {
                let lpBtn = View.getEl('btn-long-press');
                if (lpBtn) {
                    lpBtn.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'mouse', button: 0 }));
                }
            }
        }
    });

    // 🚀 智能呼出/隐藏键盘提示条 (感知键盘操作)
    let keyboardHintBar = View.getEl('keyboard-hint-bar');
    if (keyboardHintBar) {
        document.addEventListener('keydown', (e) => {
            // 只要检测到键盘敲击，且在复习界面内，就弹出提示条
            if (!View.getEl('study-area').classList.contains('hidden') && !['Meta', 'Alt', 'Control', 'Shift'].includes(e.key)) {
                keyboardHintBar.classList.remove('hidden');
            }
        });
        document.addEventListener('pointerdown', (e) => {
            // 如果用户使用手指触摸或鼠标点击，说明脱离了纯键盘盲操，自动隐藏提示条
            if (e.pointerType === 'mouse' || e.pointerType === 'touch') {
                keyboardHintBar.classList.add('hidden');
            }
        });
    }
  },

  collectBackupPreferences() {
      const preferences = {};

      for (const key of BACKUP_PREFERENCE_KEYS) {
          const value = localStorage.getItem(key);

          if (value !== null) {
              preferences[key] = value;
          }
      }

      return preferences;
  },

  applyBackupPreferences(preferences) {
      if (
          !preferences ||
          typeof preferences !== 'object' ||
          Array.isArray(preferences)
      ) {
          return;
      }

      for (const key of BACKUP_PREFERENCE_KEYS) {
          if (
              Object.prototype.hasOwnProperty.call(
                  preferences,
                  key
              )
          ) {
              localStorage.setItem(
                  key,
                  String(preferences[key])
              );
          }
      }
  },

  buildBackupPayload(kind = 'manual') {
      const cloneValue = value => {
          return JSON.parse(
              JSON.stringify(value)
          );
      };

      return {
          format: BACKUP_FORMAT_ID,
          backupVersion: BACKUP_FORMAT_VERSION,
          schemaVersion:
              typeof DATA_SCHEMA_VERSION === 'number'
                  ? DATA_SCHEMA_VERSION
                  : 1,

          appName: '钟日',
          kind,
          exportDate: new Date().toISOString(),

          data: {
              db: cloneValue(Model.db),
              userWords: cloneValue(Model.userWords),
              wordOverrides: cloneValue(Model.wordOverrides),
              wordStorageVersion: WORD_STORAGE_VERSION,
              folders: cloneValue(Model.folders),
              folderLangs: cloneValue(
                  Model.folderLangs
              ),
              stars: cloneValue(Model.stars),
              records: cloneValue(Model.records),
              mtGroupClears: cloneValue(
                  Model.mtGroupClears
              ),
              mtWordClears: cloneValue(
                  Model.mtWordClears
              ),
              aiConversations: cloneValue(
                  Model.aiConversations
              )
          },

          preferences:
              this.collectBackupPreferences()
      };
  },

  normalizeBackupPayload(rawData) {
      if (
          rawData &&
          rawData.format === BACKUP_FORMAT_ID &&
          rawData.data
      ) {
          return {
              format: BACKUP_FORMAT_ID,
              backupVersion:
                  Number(rawData.backupVersion) || 5,
              schemaVersion:
                  Number(rawData.schemaVersion) || 1,
              appName: rawData.appName || '钟日',
              kind: rawData.kind || 'manual',
              exportDate:
                  rawData.exportDate || null,

              data: {
                  db: rawData.data.db,
                  userWords: Array.isArray(rawData.data.userWords)
                      ? rawData.data.userWords
                      : null,
                  wordOverrides:
                      rawData.data.wordOverrides &&
                      typeof rawData.data.wordOverrides === 'object' &&
                      !Array.isArray(rawData.data.wordOverrides)
                          ? rawData.data.wordOverrides
                          : null,
                  wordStorageVersion:
                      Number(rawData.data.wordStorageVersion) || 0,
                  folders: rawData.data.folders,
                  folderLangs:
                      rawData.data.folderLangs,
                  stars: rawData.data.stars,
                  records: rawData.data.records,
                  mtGroupClears:
                      rawData.data.mtGroupClears,
                  mtWordClears:
                      rawData.data.mtWordClears,

                  aiConversations:
                      Array.isArray(
                          rawData.data.aiConversations
                      )
                          ? rawData.data.aiConversations
                          : null
              },

              preferences:
                  rawData.preferences &&
                  typeof rawData.preferences ===
                      'object'
                      ? rawData.preferences
                      : {}
          };
      }

      /*
       * 兼容旧版 v4 备份。
       */
      if (
          rawData &&
          Array.isArray(rawData.db) &&
          Array.isArray(rawData.folders)
      ) {
          return {
              format: BACKUP_FORMAT_ID,
              backupVersion: 4,
              schemaVersion: 0,
              appName: '钟日',
              kind: 'legacy',
              exportDate:
                  rawData.exportDate || null,

              data: {
                  db: rawData.db,
                  userWords: null,
                  wordOverrides: null,
                  wordStorageVersion: 0,
                  folders: rawData.folders,
                  folderLangs:
                      rawData.folderLangs || {},
                  stars: rawData.stars || [],
                  records: rawData.records || [],
                  mtGroupClears:
                      rawData.mtGroupClears || {},
                  mtWordClears:
                      rawData.mtWordClears || {},

                  aiConversations:
                      Array.isArray(
                          rawData.aiConversations
                      )
                          ? rawData.aiConversations
                          : null
              },

              preferences:
                  rawData.preferences &&
                  typeof rawData.preferences ===
                      'object'
                      ? rawData.preferences
                      : {}
          };
      }

      throw new Error('无法识别此备份文件');
  },

  validateBackupPayload(payload) {
      if (
          !payload ||
          payload.format !== BACKUP_FORMAT_ID ||
          !payload.data
      ) {
          throw new Error('备份文件格式不正确');
      }

      if (!Array.isArray(payload.data.db)) {
          throw new Error('备份中缺少词库数据');
      }

      if (!Array.isArray(payload.data.folders)) {
          throw new Error('备份中缺少文件夹数据');
      }

      const invalidWord = payload.data.db.find(word => {
          return (
              !word ||
              typeof word !== 'object' ||
              typeof word.word !== 'string'
          );
      });

      if (invalidWord) {
          throw new Error('备份中的词汇数据不完整');
      }

      return true;
  },

  renderBackupSummary(payload) {
      const data = payload.data;

      let dateText = '未知时间';

      if (payload.exportDate) {
          const parsedDate =
              new Date(payload.exportDate);

          if (!Number.isNaN(parsedDate.getTime())) {
              dateText =
                  parsedDate.toLocaleString('zh-CN');
          }
      }

      const wordCount =
          Array.isArray(data.db)
              ? data.db.length
              : 0;

      const folderCount =
          Array.isArray(data.folders)
              ? data.folders.length
              : 0;

      const recordCount =
          Array.isArray(data.records)
              ? data.records.length
              : 0;

      const aiIncluded =
          Array.isArray(data.aiConversations);

      const aiCount =
          aiIncluded
              ? data.aiConversations.length
              : 0;

      const preferenceCount =
          payload.preferences &&
          typeof payload.preferences === 'object'
              ? Object.keys(
                    payload.preferences
                ).length
              : 0;

      return `
          <div style="
              margin-top: 12px;
              padding: 16px;
              border-radius: 18px;
              background: var(--surface);
              border: 1px solid var(--outline);
              text-align: left;
              line-height: 1.8;
          ">
              <div>
                  <strong>备份时间：</strong>
                  ${escapeHTML(dateText)}
              </div>

              <div>
                  <strong>词汇：</strong>
                  ${wordCount} 条
              </div>

              <div>
                  <strong>词库：</strong>
                  ${folderCount} 个
              </div>

              <div>
                  <strong>学习记录：</strong>
                  ${recordCount} 条
              </div>

              <div>
                  <strong>AI 对话：</strong>
                  ${
                      aiIncluded
                          ? `${aiCount} 条`
                          : '旧版备份未包含'
                  }
              </div>

              <div>
                  <strong>偏好设置：</strong>
                  ${
                      preferenceCount > 0
                          ? `${preferenceCount} 项`
                          : '未包含'
                  }
              </div>
          </div>
      `;
  },

  async storePreImportRestorePoint(kind = 'pre-import-restore') {
      const restorePoint =
          this.buildBackupPayload(kind);

      await Model.writeStorageValue(
          PRE_IMPORT_RESTORE_KEY,
          restorePoint
      );

      await this.updateRestorePointUI();

      return restorePoint;
  },

  async removePreImportRestorePoint() {
      try {
          if (
              typeof idbKeyval !== 'undefined'
          ) {
              await idbKeyval.del(
                  PRE_IMPORT_RESTORE_KEY
              );
          }
      } catch (error) {
          console.warn(
              '[Backup] 删除 IndexedDB 恢复点失败',
              error
          );
      }

      localStorage.removeItem(
          PRE_IMPORT_RESTORE_KEY
      );

      await this.updateRestorePointUI();
  },

  async updateRestorePointUI() {
      const button =
          View.getEl('btn-undo-import');

      const note =
          View.getEl('backup-restore-note');

      if (!button && !note) {
          return;
      }

      let restorePoint = null;

      try {
          restorePoint =
              await Model.readStorageValue(
                  PRE_IMPORT_RESTORE_KEY
              );
      } catch (error) {
          console.warn(
              '[Backup] 读取导入恢复点失败',
              error
          );
      }

      const hasRestorePoint =
          Boolean(
              restorePoint &&
              restorePoint.data &&
              Array.isArray(
                  restorePoint.data.db
              )
          );

      if (button) {
          button.style.display =
              hasRestorePoint
                  ? 'flex'
                  : 'none';
      }

      if (note) {
          note.style.display =
              hasRestorePoint
                  ? 'block'
                  : 'none';
      }
  },

  async applyBackupPayload(payload) {
      this.validateBackupPayload(payload);

      const data = payload.data;

      const restoredDB =
          JSON.parse(
              JSON.stringify(data.db)
          );

      const restoredFolders =
          JSON.parse(
              JSON.stringify(data.folders)
          );

      const restoredFolderLangs =
          data.folderLangs &&
          typeof data.folderLangs === 'object'
              ? JSON.parse(
                    JSON.stringify(
                        data.folderLangs
                    )
                )
              : {};

      if (restoredFolders.length === 0) {
          restoredFolders.push('默认词库');
      }

      /*
       * 补齐词库语言。
       */
      for (const folder of restoredFolders) {
          if (!restoredFolderLangs[folder]) {
              const containsEnglish =
                  restoredDB.some(word => {
                      return (
                          word.folder === folder &&
                          word.lang === 'en'
                      );
                  });

              restoredFolderLangs[folder] =
                  containsEnglish
                      ? 'en'
                      : 'ja';
          }
      }

      /*
       * 补齐旧备份中没有语言信息的词汇。
       */
      for (const word of restoredDB) {
          if (!word.lang) {
              word.lang =
                  restoredFolderLangs[
                      word.folder
                  ] || 'ja';
          }
      }

      Model.builtInWords = Model.getDefaultBuiltInWords();
      Model.builtInIdSet = new Set(
          Model.builtInWords.map(word => Model.getWordId(word))
      );

      if (
          Array.isArray(data.userWords) &&
          data.wordOverrides &&
          typeof data.wordOverrides === 'object' &&
          !Array.isArray(data.wordOverrides)
      ) {
          Model.userWords = cloneDataValue(data.userWords);
          Model.wordOverrides = cloneDataValue(data.wordOverrides);
          Model.rebuildCombinedDB();
      } else {
          Model.migrateLegacyWordStorage(restoredDB, {
              markMissingBuiltInsAsDeleted: false
          });
      }

      Model.folders = restoredFolders;
      Model.folderLangs = restoredFolderLangs;

      Model.stars =
          Array.isArray(data.stars)
              ? JSON.parse(
                    JSON.stringify(data.stars)
                )
              : [];

      Model.records =
          Array.isArray(data.records)
              ? JSON.parse(
                    JSON.stringify(
                        data.records
                    )
                )
              : [];

      Model.mtGroupClears =
          data.mtGroupClears &&
          typeof data.mtGroupClears ===
              'object'
              ? JSON.parse(
                    JSON.stringify(
                        data.mtGroupClears
                    )
                )
              : {};

      Model.mtWordClears =
          data.mtWordClears &&
          typeof data.mtWordClears ===
              'object'
              ? JSON.parse(
                    JSON.stringify(
                        data.mtWordClears
                    )
                )
              : {};

      /*
       * 老备份没有 AI 对话时，
       * 保留设备里现有的 AI 对话，
       * 避免导入旧文件时意外清空。
       */
      if (
          Array.isArray(
              data.aiConversations
          )
      ) {
          Model.aiConversations =
              JSON.parse(
                  JSON.stringify(
                      data.aiConversations
                  )
              );
      }

      this.applyBackupPreferences(
          payload.preferences
      );

      await Model.runDataMigrations();
      await Model.saveAllUserData();
  },

  async exportBackup() {
      const payload =
          this.buildBackupPayload('manual');

      const dateStamp =
          new Date()
              .toISOString()
              .slice(0, 19)
              .replace(/[T:]/g, '-');

      const fileName =
          `钟日完整备份_${dateStamp}.json`;

      const blob = new Blob(
          [
              JSON.stringify(
                  payload,
                  null,
                  2
              )
          ],
          {
              type:
                  'application/json;charset=utf-8'
          }
      );

      Hardware.playSound('success');
      Hardware.vibrate(50);

      try {
          if (
              navigator.share &&
              navigator.canShare
          ) {
              const file = new File(
                  [blob],
                  fileName,
                  {
                      type:
                          'application/json'
                  }
              );

              if (
                  navigator.canShare({
                      files: [file]
                  })
              ) {
                  await navigator.share({
                      files: [file],
                      title: '钟日数据备份',
                      text:
                          '钟日完整学习数据备份'
                  });

                  showToast('备份文件已生成');
                  return;
              }
          }
      } catch (error) {
          if (error?.name === 'AbortError') {
              showToast('已取消导出');
              return;
          }

          console.warn(
              '[Backup] 系统分享失败，改用下载',
              error
          );
      }

      this.fallbackDownload(
          blob,
          fileName
      );
  },

  fallbackDownload(blob, fileName) {
      const url =
          URL.createObjectURL(blob);

      const anchor =
          document.createElement('a');

      anchor.style.display = 'none';
      anchor.href = url;
      anchor.download = fileName;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => {
          URL.revokeObjectURL(url);
      }, 1000);

      showToast('备份文件已生成');
  },

  async importBackup(file) {
      if (!file) {
          return;
      }

      if (file.size > 25 * 1024 * 1024) {
          Hardware.playSound('error');
          Hardware.vibrate(50);
          showToast('备份文件过大');
          return;
      }

      try {
          const fileText =
              await file.text();

          const rawData =
              JSON.parse(fileText);

          const payload =
              this.normalizeBackupPayload(
                  rawData
              );

          this.validateBackupPayload(
              payload
          );

          const summary =
              this.renderBackupSummary(
                  payload
              );

          showConfirm(
              '确认导入这份备份？',
              `
                  ${summary}

                  <div style="
                      margin-top: 14px;
                      color: var(--accent-red);
                      font-size: 0.86rem;
                      line-height: 1.65;
                  ">
                      当前词库和学习进度将被替换。
                      导入前会自动保存恢复点，
                      可以通过“撤销上次导入”恢复。
                  </div>
              `,
              async () => {
                  showToast('正在恢复数据…');

                  let restorePoint = null;

                  try {
                      restorePoint =
                          await this
                              .storePreImportRestorePoint();

                      await this.applyBackupPayload(
                          payload
                      );

                      Hardware.playSound(
                          'success'
                      );

                      Hardware.vibrate(100);

                      showToast('数据恢复成功');

                      window.setTimeout(() => {
                          location.reload();
                      }, 900);
                  } catch (error) {
                      console.error(
                          '[Backup] 导入失败',
                          error
                      );

                      if (restorePoint) {
                          try {
                              await this
                                  .applyBackupPayload(
                                      restorePoint
                                  );

                              showToast(
                                  '导入失败，已恢复原数据'
                              );
                          } catch (
                              restoreError
                          ) {
                              console.error(
                                  '[Backup] 自动恢复失败',
                                  restoreError
                              );

                              showToast(
                                  '导入和自动恢复均失败'
                              );
                          }
                      } else {
                          showToast(
                              '导入失败，未修改数据'
                          );
                      }

                      Hardware.playSound(
                          'error'
                      );

                      Hardware.vibrate(50);
                  }
              }
          );
      } catch (error) {
          console.error(
              '[Backup] 读取备份失败',
              error
          );

          Hardware.playSound('error');
          Hardware.vibrate(50);

          showToast(
              error?.message ||
              '无法读取备份文件'
          );
      }
  },

  async restorePreImportBackup() {
      let restorePoint = null;

      try {
          restorePoint =
              await Model.readStorageValue(
                  PRE_IMPORT_RESTORE_KEY
              );
      } catch (error) {
          console.error(
              '[Backup] 读取恢复点失败',
              error
          );
      }

      if (
          !restorePoint ||
          !restorePoint.data ||
          !Array.isArray(
              restorePoint.data.db
          )
      ) {
          showToast('没有可用的恢复点');
          await this.updateRestorePointUI();
          return;
      }

      const summary =
          this.renderBackupSummary(
              restorePoint
          );

      showConfirm(
          '撤销上次数据操作？',
          `
              ${summary}

              <div style="
                  margin-top: 14px;
                  color: var(--accent-red);
                  font-size: 0.86rem;
                  line-height: 1.65;
              ">
                  将恢复到上次导入或重置之前的状态。
              </div>
          `,
          async () => {
              /*
               * 先在内存中保存当前状态。
               * 如果撤销过程失败，仍能恢复回来。
               */
              const currentSafetyCopy =
                  this.buildBackupPayload(
                      'before-undo-data-operation'
                  );

              try {
                  showToast(
                      '正在恢复数据操作前的状态…'
                  );

                  await this.applyBackupPayload(
                      restorePoint
                  );

                  await this
                      .removePreImportRestorePoint();

                  Hardware.playSound(
                      'success'
                  );

                  Hardware.vibrate(100);

                  showToast(
                      '已撤销上次数据操作'
                  );

                  window.setTimeout(() => {
                      location.reload();
                  }, 900);
              } catch (error) {
                  console.error(
                      '[Backup] 撤销数据操作失败',
                      error
                  );

                  try {
                      await this.applyBackupPayload(
                          currentSafetyCopy
                      );

                      showToast(
                          '撤销失败，已保留当前数据'
                      );
                  } catch (
                      restoreError
                  ) {
                      console.error(
                          '[Backup] 保留当前数据失败',
                          restoreError
                      );

                      showToast(
                          '数据恢复出现严重错误'
                      );
                  }

                  Hardware.playSound('error');
                  Hardware.vibrate(50);
              }
          }
      );
  },

    startPendulum(launchMode = 'pendulum') {
    const currentLang = Model.state.currentLangMode;

    const defFolder =
        Model.folders.find(folder => {
            return (Model.folderLangs[folder] || 'ja') === currentLang;
        }) || '默认词库';

    const defCat =
        defFolder === '默认词库'
            ? 'default'
            : defFolder;

    let groupKey =
        Model.state.currentGroupKey ||
        localStorage.getItem('lastCustomGroupVal') ||
        `group|${defCat}|0`;

    let [prefix, catName, indexText] = groupKey.split('|');
    let groupIndex = Number.parseInt(indexText, 10);

    if (
        prefix !== 'group' ||
        !Number.isInteger(groupIndex) ||
        groupIndex < 0
    ) {
        catName = defCat;
        groupIndex = 0;
        groupKey = `group|${defCat}|0`;
    }

    const groupWords = Model.db
        .map((w, i) => ({ w, i }))
        .filter(item => {
            const wordLang = item.w.lang || 'ja';

            return (
                wordLang === currentLang &&
                Model.checkFilter(item.w, catName)
            );
        });

    const groupRange = ROTE_CORE.getGroupRange(
        groupIndex,
        groupWords.length
    );
    const sourceWords = groupWords.slice(
        groupRange.start,
        groupRange.end
    );

    if (sourceWords.length === 0) {
        return showToast('所选范围内暂无词汇哦');
    }

    const virtualLabels = {
        virtual_cleared: '完全通关',
        virtual_uncleared: '所有未通关',
        virtual_miss_kanji:
            currentLang === 'en'
                ? '未掌握拼写'
                : '未了解汉字',
        virtual_miss_kana:
            currentLang === 'en'
                ? '未掌握听力'
                : '未了解读音',
        virtual_miss_meaning: '未了解释义',
        virtual_starred: '收藏'
    };

    const categoryLabel =
        catName === 'default'
            ? '默认词库'
            : (virtualLabels[catName] || catName);

    const groupLabel =
        `${categoryLabel} (第 ${groupRange.labelStart}-${groupRange.labelEnd} 词)`;

    Model.state.currentGroupKey = groupKey;
    Model.state.currentGroupLabel = groupLabel;

    const groupText = View.getEl('custom-group-text');
    if (groupText) {
        groupText.innerText = groupLabel;
    }

    localStorage.setItem('lastCustomGroupVal', groupKey);
    localStorage.setItem('lastCustomGroupTxt', groupLabel);
    Hardware.playSound('click'); 
    Model.state.mode = launchMode; Model.state.currentIndex = 0; Model.state.dtWordAppearanceMap = {}; Model.state.mtStep = 1; Model.state.currentWordFailed = false; Model.state.comboCount = 0; Model.state.maxProgressSeen = 0; Model.state.uniqueWordCount = sourceWords.length;
    if (launchMode === 'memory-test') {
        Model.state.mtRound = 1;
        Model.state.mtBaseQueue = sourceWords.map(x => x.i);
        Model.state.studyQueue = [...Model.state.mtBaseQueue]
            .sort(() => Math.random() - 0.5);
        Model.state.totalTestWords = Model.state.studyQueue.length;
    } else {
        Model.state.studyQueue = ROTE_CORE.buildInterleavedQueue(
            sourceWords.map(item => item.i)
        );
    }
    Model.state.initialQueueLength = (launchMode === 'memory-test') ? Model.state.mtBaseQueue.length : Model.state.studyQueue.length;
    View.updateComboBadge();
    const modeSelect = View.getEl('next-display-mode');
    let savedMode = localStorage.getItem('displayMode') || 'all';
    const isRoteLaunch = launchMode === 'rote-learning';

    if (modeSelect) {
        if (isRoteLaunch) {
            modeSelect.options[0].text = '全显预览';
            modeSelect.options[0].style.display = 'none';
            modeSelect.options[1].text = currentLang === 'en'
                ? '拼写强化'
                : '汉字强化';
            modeSelect.options[2].text = currentLang === 'en'
                ? '听力强化'
                : '假名强化';
            modeSelect.options[3].text = '释义强化';
            savedMode = ROTE_CORE.normalizeMode(currentLang, savedMode);
            localStorage.setItem('displayMode', savedMode);
        } else {
            modeSelect.options[0].text = '全显';
            modeSelect.options[0].style.display = '';
            modeSelect.options[1].text = currentLang === 'en' ? '英文' : '汉字';
            modeSelect.options[2].text = currentLang === 'en' ? '音标' : '假名';
            modeSelect.options[3].text = '释义';
        }

        modeSelect.value = savedMode;
        modeSelect.dispatchEvent(new Event('facade-update'));
    }
    View.showPage('study-area'); let c = View.getEl('pixel-matrix'); c.innerHTML=''; View.renderStudyCard('none'); Hardware.vibrate(40);
  },

  buildFilterTestQueue(rawQueue) {
      const savedMode =
          localStorage.getItem('wordOrderMode');

      const orderMode =
          ['weak-first', 'new-first', 'original']
              .includes(savedMode)
              ? savedMode
              : 'weak-first';

      const queue = [...rawQueue];

      if (orderMode === 'original') {
          return queue;
      }

      const newWords = [];
      const weakWords = [];
      const clearedWords = [];

      queue.forEach(idx => {
          const word = Model.db[idx];

          if (!word) {
              return;
          }

          const status =
              Model.getClearState(word);

          if (
              !status ||
              typeof status !== 'object'
          ) {
              newWords.push(idx);
              return;
          }

          const masteredCount = [
              status.kanji,
              status.kana,
              status.meaning
          ].filter(Boolean).length;

          if (status.needsReview === true) {
              weakWords.push(idx);
          } else if (masteredCount === 0) {
              newWords.push(idx);
          } else if (masteredCount === 3) {
              clearedWords.push(idx);
          } else {
              weakWords.push(idx);
          }
      });

      const shuffle = list => {
          return [...list].sort(
              () => Math.random() - 0.5
          );
      };

      if (orderMode === 'new-first') {
          return [
              ...shuffle(newWords),
              ...shuffle(weakWords),
              ...shuffle(clearedWords)
          ];
      }

      return [
          ...shuffle(weakWords),
          ...shuffle(newWords),
          ...shuffle(clearedWords)
      ];
  },

  startFilterTest() {
      let sel = View.getEl('test-range-select'); let cat = sel.value; if (!cat) return;
      let displayMode = View.getEl('test-display-select').value || 'kana';
      let isSkipEnabled = localStorage.getItem('skipMastered') === 'true';

      let sourceWords = Model.db
          .map((w, i) => ({ w, i }))
          .filter(item => {
          let wordLang = item.w.lang || 'ja';

          if (wordLang !== Model.state.currentLangMode) {
              return false;
          }

          let inRange =
              cat === 'all'
                  ? true
                  : Model.checkFilter(item.w, cat);

          if (!inRange) return false;

          if (isSkipEnabled) {
              let st = Model.getClearState(item.w);
              if (typeof st === 'number') st = { kanji: false, kana: false, meaning: false };

              if (displayMode === 'word' && st.kanji) return false;
              if ((displayMode === 'kana' || displayMode === 'audio') && st.kana) return false;
              if (displayMode === 'meaning' && st.meaning) return false;
          }
          return true;
      });
      
      if (sourceWords.length === 0) {
          return showConfirm('此维度已圆满', '当前范围内该模式对应的「维度杠」已全部点亮。是否前往设置关闭「智能跳过」？', () => {
              Nav.switchTab('tab-settings', ' |【環境設定】', document.querySelector('[data-target="tab-settings"]'));
          });
      }
      Hardware.playSound('click'); 
      Model.state.mode = 'filter-test'; Model.state.currentIndex = 0; Model.state.ftState = 'A'; Model.state.ftHint = null; Model.state.ftShowKanaHint = false; Model.state.maxProgressSeen = 0;
      
      const rawQueue =
          sourceWords.map(x => x.i);

      Model.state.studyQueue =
          this.buildFilterTestQueue(rawQueue);
      
      View.updateComboBadge(); View.showPage('study-area'); let c = View.getEl('pixel-matrix'); c.innerHTML=''; View.renderStudyCard('none'); Hardware.vibrate(40);
  },

    processFilterTestResult(isCorrect) {
      if (Model.state.isAnimating) return;
      Model.state.isAnimating = true;

      let w = Model.db[Model.state.studyQueue[Model.state.currentIndex]];
      const wordKey = Model.getWordId(w);
      const clearState = Model.ensureClearState(w);
      const isEnglish = w.lang === 'en';

      let mode = View.getEl('test-display-select').value || 'kana';

      if (isEnglish && mode === 'kana') {
          mode = 'word';
      }

      if (isCorrect) {
          if (mode === 'word') {
              clearState.kanji = true;
          } else if (mode === 'kana' || mode === 'audio') {
              clearState.kana = true;
          } else if (mode === 'meaning') {
              clearState.meaning = true;
          }

          if (
              clearState.kana &&
              clearState.meaning
          ) {
              clearState.kanji = true;
          }

          if (
              clearState.kanji &&
              clearState.meaning
          ) {
              clearState.kana = true;
          }

          if (
              clearState.kanji &&
              clearState.kana
          ) {
              clearState.meaning = true;
          }

          if (
              clearState.kanji &&
              clearState.kana &&
              clearState.meaning
          ) {
              clearState.needsReview =
                  false;
          }
      } else {
          clearState.needsReview =
              true;

          if (mode === 'word') {
              clearState.kanji = false;
          } else if (mode === 'kana' || mode === 'audio') {
              clearState.kana = false;
          } else if (mode === 'meaning') {
              clearState.meaning = false;
          }
      }

      Model.saveClears();
      View.playStudyFeedback(isCorrect ? 'correct' : 'wrong');

      window.setTimeout(() => {
          Model.state.currentIndex++;
          Model.state.ftState = 'A';
          Model.state.ftHint = null;
          Model.state.ftShowKanaHint = false;

          if (Model.state.currentIndex >= Model.state.studyQueue.length) {
              Model.state.isAnimating = false;
              Hardware.playSound('success');
              Hardware.vibrate(1000);
              showToast('恭喜，全部靶向检验完成！');
              View.getEl('btn-exit-study').click();
          } else {
              View.renderStudyCard('next');
          }
      }, isCorrect ? 380 : 320);
  },

  handleSpellConfirm(inputEl, wObj, displayMode) {
      if (Model.state.isAnimating) return;

      const isEnglish = wObj.lang === 'en';
      const isRote = Model.state.mode === 'rote-learning';
      const isEnglishRote =
          isEnglish && isRote;

      let targetClean;
      let inputClean;

      if (isEnglish) {
          targetClean = (wObj.word || '').toLowerCase().trim();
          inputClean = (EnglishInput.buffer || '').toLowerCase().trim();
      } else {
          targetClean = (wObj.kana || '').replace(/[【】\[\]()]/g, '');
          inputClean = RomajiEngine.getFinalText();
      }

      if (!inputClean) return;

      if (inputClean === targetClean) {
          Model.state.isAnimating = true;
          Hardware.playSound('success');
          Hardware.vibrate(50);
          View.playStudyFeedback('correct');

          Model.state.comboCount++;
          View.updateComboBadge();

          if (isRote) {
              View.showRoteFullCard(wObj);
              if (isEnglish) EnglishInput.reset();
              else RomajiEngine.reset();

              setTimeout(() => {
                  Model.state.mtStep = 2;
                  Model.state.isAnimating = false;
                  View.renderRoteLearningUI(wObj, displayMode);
              }, 700);
              return;
          }

          let wWord = View.getEl('w-word');
          let wKana = View.getEl('w-kana');
          let wMeaning = View.getEl('w-meaning');

          if (wWord) {
              wWord.innerText = wObj.word || '';
              wWord.style.display = 'block';
          }

          if (wKana) {
              wKana.innerText = isEnglish
                  ? (wObj.phonetic || '')
                  : (wObj.kana || '');
              wKana.style.display = 'block';
          }

          if (wMeaning) {
              wMeaning.innerText = wObj.meaning || '';
              wMeaning.style.display = 'block';
          }

          View.syncRootsDisplay();
          View.revealStudyAnswer();

          if (Model.state.mode === 'dual-track') {
              setTimeout(() => this.dtAdvanceNext(), 420);
          } else if (Model.state.mode === 'memory-test') {
              if (!isEnglish) {
                  View.getEl('w-kana').innerText = wObj.kana;
                  View.getEl('w-kana').style.display = 'block';
              }
              setTimeout(() => this.mtAdvanceNext(), 600);
          } else {
              if (
                  !isEnglish &&
                  (displayMode === 'word' || displayMode === 'meaning')
              ) {
                  View.getEl('w-kana').innerText = wObj.kana;
              }

              setTimeout(() => {
                  Model.state.mtStep = 2;
                  Model.state.isAnimating = false;
                  View.renderMemoryTestUI(wObj, displayMode);
              }, 500);
          }

          if (isEnglish) EnglishInput.reset();
          return;
      }

      Hardware.playSound('error');
      Hardware.vibrate(60);
      View.playStudyFeedback('wrong');

      inputEl.classList.remove('shake-anim');
      void inputEl.offsetWidth;
      inputEl.classList.add('shake-anim', 'error-state');

      Model.state.comboCount = Math.max(0, Model.state.comboCount - 3);
      View.updateComboBadge();
      Model.state.currentWordFailed = true;

      Model.state.spellFailCount =
          (Model.state.spellFailCount || 0) + 1;

      if (Model.state.spellFailCount >= 2) {
          let activeKbId = Model.state.mode === 'dual-track'
              ? 'dt-spell-keyboard'
              : 'mt-spell-keyboard';
          let hintWrap = View.getEl(activeKbId + '-hint-wrap');
          if (hintWrap) hintWrap.classList.add('show');
      }

      if (isEnglishRote && Model.state.spellFailCount >= 3) {
          Hardware.unlockSpeech();
          Hardware.speakWord(wObj);
      }
  },

  handleDtChoiceClick(btn, isCorrect) {
      if (Model.state.isAnimating) return;
      if (isCorrect) {
          Model.state.isAnimating = true;
          btn.classList.add('correct');
          Hardware.playSound('success');
          Hardware.vibrate(40);
          View.playStudyFeedback('correct');

          Model.state.comboCount++;
          View.updateComboBadge();
          
          let wMeaning = View.getEl('w-meaning');
          if(wMeaning) { wMeaning.style.display = 'block'; View.syncRootsDisplay(); }

          document.getElementById('w-example-box').querySelectorAll('.dt-ex-cn.hidden-translation').forEach(el => { 
    el.style.transform = 'rotateX(90deg)'; el.style.opacity = '0'; 
    setTimeout(() => { 
        el.innerText = el.dataset.text; 
        el.className = 'dt-ex-cn revealed-translation'; 
        el.style.transform = 'rotateX(-90deg)'; 
        void el.offsetWidth; 
        el.style.transform = 'rotateX(0)'; 
        el.style.opacity = '1'; 
        if (localStorage.getItem('useRubyRender') === 'false' && window.MathJax) {
            MathJax.typesetPromise([el]);
        }
    }, 150); 
});
          document.querySelectorAll('.dt-choice-btn').forEach(b => b.style.pointerEvents = 'none'); setTimeout(() => this.dtAdvanceNext(), 600);
      } else { 
          Hardware.playSound('error');
          Hardware.vibrate(50);
          View.playStudyFeedback('wrong');

          btn.classList.remove('shake-anim', 'wrong');
          requestAnimationFrame(() => {
              void btn.offsetWidth; 
              btn.classList.add('shake-anim', 'wrong'); 
          });
          Model.state.comboCount = Math.max(0, Model.state.comboCount - 3); View.updateComboBadge(); 
      }
  },

  handleMtChoiceClick(btn, isCorrect, wObj, displayMode) {
      if (Model.state.isAnimating) return;

      if (!isCorrect) {
          Hardware.playSound('error');
          Hardware.vibrate(50);
          View.playStudyFeedback('wrong');

          btn.classList.remove('shake-anim', 'wrong');
          void btn.offsetWidth;
          btn.classList.add('shake-anim', 'wrong');

          Model.state.comboCount = Math.max(
              0,
              Model.state.comboCount - 3
          );
          View.updateComboBadge();
          Model.state.currentWordFailed = true;
          return;
      }

      Model.state.isAnimating = true;
      btn.classList.add('correct');
      Hardware.playSound('success');
      Hardware.vibrate(40);
      View.playStudyFeedback('correct');

      Model.state.comboCount++;
      View.updateComboBadge();

      const disableChoiceButtons = () => {
          document
              .querySelectorAll('#mt-choice-buttons .dt-choice-btn')
              .forEach(button => {
                  button.style.pointerEvents = 'none';
              });
      };

      if (Model.state.mode === 'memory-test') {
          let round = Model.state.mtRound;
          let step = Model.state.mtStep;

          if (round === 1) {
              View.getEl('w-meaning').innerText = wObj.meaning;
              View.getEl('w-meaning').style.display = 'block';
              View.syncRootsDisplay();
              View.revealStudyElement(View.getEl('w-meaning'));
              disableChoiceButtons();
              setTimeout(() => this.mtAdvanceNext(), 800);
          } else if (round === 2 && step === 1) {
              View.getEl('w-word').innerText = wObj.word;
              View.getEl('w-word').style.display = 'block';
              View.syncRootsDisplay();
              View.revealStudyElement(View.getEl('w-word'));

              setTimeout(() => {
                  Model.state.mtStep = 2;
                  Model.state.isAnimating = false;
                  View.renderMemoryTestUI(wObj, displayMode);
              }, 600);
          } else if (round === 3 && step === 1) {
              View.getEl('w-meaning').innerText = wObj.meaning;
              View.getEl('w-meaning').style.display = 'block';
              View.syncRootsDisplay();
              View.revealStudyElement(View.getEl('w-meaning'));

              setTimeout(() => {
                  Model.state.mtStep = 2;
                  Model.state.isAnimating = false;
                  View.renderMemoryTestUI(wObj, displayMode);
              }, 600);
          } else if (round === 3 && step === 2) {
              View.getEl('w-word').innerText = wObj.word;
              View.getEl('w-word').style.display = 'block';
              View.syncRootsDisplay();
              View.revealStudyElement(View.getEl('w-word'));
              disableChoiceButtons();
              setTimeout(() => this.mtAdvanceNext(), 800);
          }
          return;
      }

      if (Model.state.mode === 'rote-learning') {
          disableChoiceButtons();
          View.showRoteFullCard(wObj);

          if (Model.state.mtStep === 1) {
              setTimeout(() => {
                  Model.state.mtStep = 2;
                  Model.state.isAnimating = false;
                  View.renderRoteLearningUI(wObj, displayMode);
              }, 650);
          } else {
              setTimeout(() => this.mtAdvanceNext(), 850);
          }
      }
  },

  dtAdvanceNext() { Model.state.currentIndex++; if (Model.state.currentIndex >= Model.state.studyQueue.length) { this.finishPendulum(); } else { View.renderStudyCard('next'); } },
  mtAdvanceNext() { 
      if (Model.state.mode === 'memory-test') {
          if (Model.state.currentWordFailed) { let failedIdx = Model.state.studyQueue.shift(); Model.state.studyQueue.push(failedIdx); } else { Model.state.studyQueue.shift(); }
          Model.state.currentWordFailed = false; Model.state.mtStep = 1; Model.state.currentIndex = 0; 
          if (Model.state.studyQueue.length === 0) {
              // 日语 3 轮 / 英语 3 轮（听力杠替代读音杠）
              if (Model.state.mtRound < 3) { 
                  Model.state.mtRound++; 
                  Model.state.studyQueue = [...Model.state.mtBaseQueue].sort(() => Math.random() - 0.5); 
                  Hardware.playSound('success'); Hardware.vibrate(200); 
                  showToast(`第 ${Model.state.mtRound - 1} 轮清空！硬核进阶`); 
                  setTimeout(() => View.renderStudyCard('next'), 500); 
              } 
              else { 
    Model.state.mtBaseQueue.forEach(idx => {
        const word = Model.db[idx];
        const clearState = Model.ensureClearState(word);

        if (!clearState) {
            return;
        }

        clearState.kanji = true;
        clearState.kana = true;
        clearState.meaning = true;
    });
    Model.saveClears(); 
    this.finishPendulum(); 
}
          } else { View.renderStudyCard('next'); }
      } else { if (Model.state.currentWordFailed) { let failedIdx = Model.state.studyQueue[Model.state.currentIndex]; Model.state.studyQueue.push(failedIdx); Model.state.currentWordFailed = false; } Model.state.currentIndex++; Model.state.mtStep = 1; if (Model.state.currentIndex >= Model.state.studyQueue.length) this.finishPendulum(); else View.renderStudyCard('next'); }
  },

    finishPendulum() {
    Hardware.playSound('success'); Hardware.vibrate(1000); let t = new Date().toLocaleDateString('zh-CN');


    let gk = Model.state.currentGroupKey;
    Model.mtGroupClears[gk] = (Model.mtGroupClears[gk] || 0) + 1;
    
    let uniqueIndices = Model.state.mode === 'memory-test' ? Model.state.mtBaseQueue : [...new Set(Model.state.studyQueue)];
    uniqueIndices.forEach(idx => {
        const word = Model.db[idx];
        const clearState = Model.ensureClearState(word);

        if (!clearState) {
            return;
        }

        clearState.kanji = true;
        clearState.kana = true;
        clearState.meaning = true;
    });
    Model.saveClears();

    let exist = Model.records.findIndex(x => x.date === t && x.group === Model.state.currentGroupLabel && x.type === 'pendulum');
    if(exist === -1) { Model.records.unshift({date: t, group: Model.state.currentGroupLabel, type: 'pendulum'}); Model.saveRecords(); }
    showToast("任务完成！该组词汇已全部通关"); View.getEl('btn-exit-study').click();
  },


  toggleBatchMode(forceState) {
      Hardware.playSound('click');
      Hardware.vibrate(20);

      const nextState =
          typeof forceState === 'boolean'
              ? forceState
              : !Model.state.batchMode;

      if (nextState === Model.state.batchMode) {
          return;
      }

      Model.state.batchMode = nextState;
      Model.state.manageMode = false;
      Model.state.selectedSet.clear();

      View.updateWordbankUI();
      View.resetWordbankRenderer();
  },
  createFolder() { 
    Hardware.vibrate(20); 
    showPrompt("请输入新文件夹名称", "", (name) => { 
      if(Model.folders.includes(name)) return showToast("文件夹已存在"); 
      const lang = Model.state.currentLangMode; // 强绑定为当前所处语言
      Model.folders.push(name); 
      Model.folderLangs[name] = lang;
      Model.saveFolders(); 
      Model.saveFolderLangs();
      View.updateWordbankUI(); 
    }); 
  },
  deleteFolder() {
      Hardware.vibrate(20);

      const folderFilter =
          View.getEl('wb-folder-filter');

      const filter = folderFilter.value;

      const builtInEnglishFolders =
          typeof DefaultEnglishWords !== 'undefined'
              ? [
                    ...new Set(
                        DefaultEnglishWords
                            .map(word => word.folder)
                            .filter(Boolean)
                    )
                ]
              : [];

      const builtInFolders = new Set([
          '默认词库',
          ...builtInEnglishFolders
      ]);

      if (
          filter === 'all' ||
          builtInFolders.has(filter) ||
          filter.startsWith('virtual_')
      ) {
          return showToast('内置分类不可删除');
      }

      const folderWords = Model.db.filter(word => {
          return word.folder === filter;
      });

      const folderLang =
          Model.folderLangs[filter] ||
          folderWords.find(word => word.lang)?.lang ||
          Model.state.currentLangMode ||
          'ja';

      const englishFallbackFolder =
          builtInEnglishFolders.find(folder => {
              return Model.folders.includes(folder);
          }) ||
          Model.folders.find(folder => {
              return (
                  folder !== filter &&
                  Model.folderLangs[folder] === 'en'
              );
          }) ||
          '英语词库';

      const mainFallbackFolder =
          folderLang === 'en'
              ? englishFallbackFolder
              : '默认词库';

      showConfirm(
          '删除文件夹',
          `确定要删除「${filter}」吗？里面的 ${folderWords.length} 个单词会自动移至同语言的默认词库「${mainFallbackFolder}」。`,
          () => {
              if (Model.state.batchMode) {
                  this.toggleBatchMode();
              }

              if (!Model.folders.includes('默认词库')) {
                  Model.folders.unshift('默认词库');
              }

              Model.folderLangs['默认词库'] = 'ja';

              const hasEnglishWord =
                  folderWords.some(word => {
                      return (
                          word.lang === 'en' ||
                          (
                              !word.lang &&
                              folderLang === 'en'
                          )
                      );
                  });

              if (hasEnglishWord) {
                  if (
                      !Model.folders.includes(
                          englishFallbackFolder
                      )
                  ) {
                      Model.folders.push(
                          englishFallbackFolder
                      );
                  }

                  Model.folderLangs[
                      englishFallbackFolder
                  ] = 'en';
              }

              Model.db.forEach(word => {
                  if (word.folder !== filter) {
                      return;
                  }

                  const wordLang =
                      word.lang || folderLang;

                  word.lang = wordLang;

                  word.folder =
                      wordLang === 'en'
                          ? englishFallbackFolder
                          : '默认词库';
              });

              Model.folders =
                  Model.folders.filter(folder => {
                      return folder !== filter;
                  });

              delete Model.folderLangs[filter];

              Model.saveFolders();
              Model.saveFolderLangs();
              Model.saveDB();

              folderFilter.value = 'all';

              localStorage.setItem(
                  'lastSelectedFolder',
                  'all'
              );

              folderFilter.dispatchEvent(
                  new Event('facade-update')
              );

              View.updateWordbankUI();
              View.resetWordbankRenderer();

              showToast(
                  '已删除，单词已按语言归档'
              );
          }
      );
  },
    openMoveModal(idx) { 
      if (idx === -2 && Model.state.selectedSet.size === 0) return showToast("未选词"); 
      Model.state.moveTargetIdx = idx; 
      
      const container = View.getEl('move-folder-list');
      container.innerHTML = '';
      
      Model.folders.forEach(folderName => {
          const item = document.createElement('div');
          item.className = 'move-folder-item';
          item.setAttribute('tabindex', '0');
          item.setAttribute('role', 'button');
          item.innerHTML = `
              <span class="material-symbols-rounded folder-icon">folder</span>
              <span class="folder-name">${folderName}</span>
          `;
          
          item.onclick = () => {
              Hardware.playSound('success');
              Hardware.vibrate(40);
              this.executeMove(folderName);
          };
          container.appendChild(item);
      });
      
      window.toggleModal('move-overlay', true); 
  },

  executeMove(destFolder) {
      if (Model.state.moveTargetIdx === -2) { 
          Model.state.selectedSet.forEach(idx => Model.db[idx].folder = destFolder); 
          this.toggleBatchMode(); 
      } else { 
          Model.db[Model.state.moveTargetIdx].folder = destFolder; 
      }
      Model.saveDB(); 
      window.toggleModal('move-overlay', false); 
      View.resetWordbankRenderer(); 
      showToast(`已移至 ${destFolder}`);
  },

batchDelete() { 
    Hardware.playSound('click'); Hardware.vibrate(30); 
    if(Model.state.selectedSet.size === 0) return showToast("请先选择单词"); 
showConfirm('批量删除', '确定要删除选中的所有单词吗？', () => { 
    this.closeDetailIfOpen();
        
        Model.state.selectedSet.forEach(idx => {
            const word = Model.db[idx];
            const wordId = Model.getWordId(word);

            Model.stars = Model.stars.filter(id => id !== wordId);
            delete Model.mtWordClears[wordId];
        });
        Model.saveStars();
        Model.saveClears();
        
        Model.db = Model.db.filter((_, i) => !Model.state.selectedSet.has(i)); 
        Model.saveDB(); 
        this.toggleBatchMode();
        if (document.getElementById('tab-wordbank').classList.contains('active')) {
            Model.state.renderedStartIndex = -1;
            View.renderVirtualGrid();
        }
        showToast("已批量删除"); 
    }); 
},
  editWord(idx) {
    Controller.pendingWordDraft = null;
    Model.editingIdx = idx;

    const word = Model.db[idx];
    const isEnglish = word.lang === 'en';

    const titleEl =
        View.getEl('edit-dialog-title');

    const saveBtn =
        View.getEl('btn-save-edit');

    if (titleEl) {
        titleEl.innerHTML =
            '<span class="material-symbols-rounded">edit_square</span> 编辑单词';
    }

    if (saveBtn) {
        saveBtn.textContent = '保存修改';
    }

    View.getEl('edit-word').value =
        word.word || '';

    View.getEl('edit-kana').value =
        isEnglish
            ? (word.phonetic || '')
            : (word.kana || '');

    View.getEl('edit-type').value =
        word.type || '';

    View.getEl('edit-meaning').value =
        word.meaning || '';

    View.getEl('edit-example').value =
        word.example || '';

    const levelSelect = View.getEl('edit-level');
    if (levelSelect) {
        this.populateWordLevelSelect(
            levelSelect,
            word.lang || 'ja',
            word.level || ''
        );
    }

    const difficultySelect = View.getEl('edit-difficulty');
    if (difficultySelect) {
        difficultySelect.value = String(
            normalizeWordDifficulty(word.difficulty)
        );
        difficultySelect.dispatchEvent(
            new Event('facade-update')
        );
    }

    const tagsInput = View.getEl('edit-tags');
    if (tagsInput) {
        tagsInput.value = normalizeWordTags(word.tags).join('、');
    }

    const rootsInput =
        View.getEl('edit-roots');

    if (rootsInput) {
        rootsInput.value =
            word.roots || '';
    }

    const readingLabel =
        View.getEl('edit-reading-label');

    if (readingLabel) {
        readingLabel.textContent =
            isEnglish
                ? '音标'
                : '假名';
    }

    const rootsGroup =
        View.getEl('edit-roots-group');

    if (rootsGroup) {
        rootsGroup.style.display =
            isEnglish
                ? 'block'
                : 'none';
    }

    window.toggleModal(
        'edit-overlay',
        true
    );
  },
deleteWord(idx) { 
    showConfirm('删除单词', '彻底删除该词？', () => { 
        this.closeDetailIfOpen();
        const word = Model.db[idx];
        const wordId = Model.getWordId(word);

        Model.db.splice(idx, 1);
        Model.saveDB();
        Model.stars = Model.stars.filter(id => id !== wordId);
        delete Model.mtWordClears[wordId];
        Model.saveStars();
        Model.saveClears();
        if (document.getElementById('tab-wordbank').classList.contains('active')) {
            Model.state.renderedStartIndex = -1;
        }
        View.resetWordbankRenderer(); 
        showToast("已删除"); 
    }); 
},
    initializeImportPanel() {
      const langSelect = View.getEl('import-lang-select');
      if (!langSelect) return;

      langSelect.value = Model.state.currentLangMode === 'en' ? 'en' : 'ja';
      langSelect.dispatchEvent(new Event('facade-update'));
      this.updateImportFormatUI();
      this.updateImportFolderOptions();
      this.updateImportMetadataOptions();
  },

  updateImportFormatUI() {
      const lang = View.getEl('import-lang-select')?.value || 'ja';
      const formatText = View.getEl('import-format-text');
      const formatNote = View.getEl('import-format-note');
      const textarea = View.getEl('custom-input');

      if (lang === 'en') {
          if (formatText) formatText.textContent = '单词,音标,词性,释义,例句,词根';
          if (formatNote) formatNote.textContent = '前四项必填；级别、难度和标签使用上方批次设置，例句含逗号时建议使用 Tab 分隔。';
          if (textarea) textarea.placeholder = 'abandon,/əˈbændən/,动词,放弃,They abandoned the plan.,a(去)-bandon(控制)';
      } else {
          if (formatText) formatText.textContent = '单词,假名,词性,释义,例句';
          if (formatNote) formatNote.textContent = '前四项必填；级别、难度和标签使用上方批次设置，例句含逗号时建议使用 Tab 分隔。';
          if (textarea) textarea.placeholder = '勉強,べんきょう,名・サ变,学习,毎日日本語を勉強する。';
      }
  },

  populateWordLevelSelect(
      select,
      lang,
      selectedValue = ''
  ) {
      if (!select) return;

      const normalizedLang = lang === 'en' ? 'en' : 'ja';
      const options = WORD_LEVEL_OPTIONS[normalizedLang];
      const current = normalizeWordLevel(
          selectedValue,
          normalizedLang
      );

      select.innerHTML = '<option value="">未分级</option>' +
          options.map(level => {
              return `<option value="${level}">${level}</option>`;
          }).join('');

      select.value = current;
      select.dispatchEvent(new Event('facade-update'));
  },

  updateImportMetadataOptions() {
      const lang = View.getEl('import-lang-select')?.value || 'ja';
      const levelSelect = View.getEl('import-level-select');

      this.populateWordLevelSelect(
          levelSelect,
          lang,
          levelSelect?.value || ''
      );
  },

  updateImportFolderOptions() {
      const lang = View.getEl('import-lang-select')?.value || 'ja';
      const select = View.getEl('import-folder-select');
      if (!select) return;

      const oldValue = select.value;
      const folders = Model.folders.filter(folder => {
          return (Model.folderLangs[folder] || 'ja') === lang;
      });

      select.innerHTML = '';

      if (folders.length === 0) {
          const option = document.createElement('option');
          option.value = '';
          option.textContent = lang === 'en' ? '暂无英语词库' : '暂无日语词库';
          select.appendChild(option);
          select.disabled = true;
      } else {
          select.disabled = false;
          folders.forEach(folder => {
              const option = document.createElement('option');
              option.value = folder;
              option.textContent = folder;
              select.appendChild(option);
          });
          select.value = folders.includes(oldValue) ? oldValue : folders[0];
      }

      select.dispatchEvent(new Event('facade-update'));
  },

  getImportIdentity(word) {
      const lang = word.lang || Model.folderLangs[word.folder] || 'ja';
      const name = lang === 'en'
          ? String(word.word || '').trim().toLowerCase()
          : String(word.word || '').trim();
      return `${lang}::${word.folder || ''}::${name}`;
  },

  importWords() {
      Hardware.playSound('click');
      Hardware.vibrate(15);

      const text = View.getEl('custom-input')?.value.trim() || '';
      const lang = View.getEl('import-lang-select')?.value || 'ja';
      const folder = View.getEl('import-folder-select')?.value || '';
      const duplicateMode = View.getEl('import-duplicate-mode')?.value || 'skip';
      const batchLevel = normalizeWordLevel(
          View.getEl('import-level-select')?.value || '',
          lang
      );
      const batchDifficulty = normalizeWordDifficulty(
          View.getEl('import-difficulty-select')?.value || 0
      );
      const batchTags = normalizeWordTags(
          View.getEl('import-tags-input')?.value || ''
      );

      if (!text) return showToast('请先粘贴词汇');
      if (!folder) return showToast('当前语言没有可用词库');

      const lines = text.split(/\r?\n/)
          .map((line, index) => ({ text: line.trim(), number: index + 1 }))
          .filter(item => item.text);

      const existingSet = new Set(Model.db.map(word => this.getImportIdentity(word)));
      const inputSet = new Set();
      const entries = [];
      const errors = [];
      let duplicateCount = 0;

      lines.forEach(item => {
          const parts = (item.text.includes('\t')
              ? item.text.split('\t')
              : item.text.split(/[,，]/)
          ).map(part => part.trim());

          if (parts.length < 4) {
              errors.push(`第 ${item.number} 行：只识别到 ${parts.length} 项，至少需要 4 项`);
              return;
          }

          const [word, reading, type, meaning] = parts;
          if (!word) return errors.push(`第 ${item.number} 行：缺少单词`);
          if (!type) return errors.push(`第 ${item.number} 行：缺少词性`);
          if (!meaning) return errors.push(`第 ${item.number} 行：缺少释义`);

          let example = '';
          let roots = '';

          if (lang === 'en') {
              if (parts.length === 5) example = parts[4];
              if (parts.length >= 6) {
                  example = parts.slice(4, -1).join(',');
                  roots = parts[parts.length - 1];
              }
          } else if (parts.length >= 5) {
              example = parts.slice(4).join(',');
          }

          const wordData = normalizeWordEntry({
              word,
              type,
              meaning,
              example,
              folder,
              lang,
              phonetic:
                  lang === 'en'
                      ? reading
                      : '',
              kana:
                  lang === 'ja'
                      ? reading
                      : '',
              roots:
                  lang === 'en'
                      ? roots
                      : '',
              level: batchLevel,
              difficulty: batchDifficulty,
              tags: batchTags,
              builtIn: false,
              isImported: true,
              importedAt: new Date().toISOString(),
              srs: {
                  ease: 2.5,
                  interval: 0,
                  nextReview: Date.now()
              }
          });

          const identity = this.getImportIdentity(wordData);
          const isDuplicate = existingSet.has(identity) || inputSet.has(identity);
          if (isDuplicate) duplicateCount++;
          inputSet.add(identity);
          entries.push({ wordData, identity, isDuplicate });
      });

      const actionableEntries = duplicateMode === 'skip'
          ? entries.filter(entry => !entry.isDuplicate)
          : entries;

      const previewRows = entries.slice(0, 5).map(entry => {
          const word = entry.wordData;
          const reading = lang === 'en' ? (word.phonetic || '无音标') : (word.kana || '无假名');
          const tag = entry.isDuplicate ? '<span style="color:#a86f31;">重复</span>' : '<span style="color:var(--tertiary);">可导入</span>';
          return `<div style="display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid var(--outline);"><span><strong>${escapeHTML(word.word)}</strong>　${escapeHTML(reading)}</span>${tag}</div>`;
      }).join('');

      const errorRows = errors.slice(0, 6).map(error => {
          return `<div style="margin-top:7px;color:var(--accent-red);font-size:.8rem;">${escapeHTML(error)}</div>`;
      }).join('');

      const modeText = {
          skip: '重复词会被跳过',
          overwrite: '重复词会覆盖原内容',
          keep: '重复词会被保留；每个词条拥有独立收藏与掌握进度'
      }[duplicateMode];

      const summary = `
          <div style="text-align:left;line-height:1.7;">
              <div style="padding:14px;border-radius:16px;background:var(--surface);border:1px solid var(--outline);">
                  <strong>共识别 ${lines.length} 行</strong><br>
                  可处理 ${actionableEntries.length} 词 · 重复 ${duplicateCount} · 错误 ${errors.length}<br>
                  <span style="font-size:.82rem;opacity:.72;">${modeText}</span>
              </div>
              <div style="margin-top:12px;">${previewRows || '<span style="opacity:.65;">没有识别到有效词条</span>'}</div>
              ${entries.length > 5 ? `<div style="margin-top:8px;font-size:.78rem;opacity:.6;">另有 ${entries.length - 5} 个有效词条未展示</div>` : ''}
              ${errorRows}
              ${errors.length > 6 ? `<div style="margin-top:7px;color:var(--accent-red);font-size:.8rem;">另有 ${errors.length - 6} 行错误</div>` : ''}
          </div>
      `;

      if (actionableEntries.length === 0) {
          showConfirm('没有可导入的词汇', summary, () => {});
          return;
      }

      showConfirm('确认导入这些词汇？', summary, async () => {
          let restorePoint = null;

          try {
              restorePoint = await this.storePreImportRestorePoint('pre-import-restore');
              const liveMap = new Map();
              Model.db.forEach((word, index) => liveMap.set(this.getImportIdentity(word), index));

              let added = 0;
              let updated = 0;
              let skipped = 0;

              entries.forEach(entry => {
                  const existingIndex = liveMap.has(entry.identity) ? liveMap.get(entry.identity) : -1;

                  if (existingIndex >= 0 && duplicateMode === 'skip') {
                      skipped++;
                      return;
                  }

                  if (existingIndex >= 0 && duplicateMode === 'overwrite') {
                      const oldWord = Model.db[existingIndex];
                      const originalId = Model.getWordId(oldWord);
                      const originalBuiltIn = oldWord.builtIn === true;
                      const { isImported, importedAt, ...fields } = entry.wordData;

                      Object.assign(oldWord, fields, {
                          _id: originalId,
                          builtIn: originalBuiltIn
                      });

                      if (oldWord.isImported === true) oldWord.importedAt = importedAt;
                      updated++;
                      return;
                  }

                  Model.db.push({ ...entry.wordData });
                  if (duplicateMode !== 'keep') liveMap.set(entry.identity, Model.db.length - 1);
                  added++;
              });

              await Model.saveDB();
              View.getEl('custom-input').value = '';
              View.updateWordbankUI();
              View.resetWordbankRenderer();
              await this.updateRestorePointUI();

              Hardware.playSound('success');
              Hardware.vibrate(100);

              const result = [];
              if (added) result.push(`新增 ${added} 词`);
              if (updated) result.push(`覆盖 ${updated} 词`);
              if (skipped) result.push(`跳过 ${skipped} 词`);
              showToast(result.join('，') || '没有需要写入的词汇');
          } catch (error) {
              console.error('[Import] 导入失败', error);
              if (restorePoint) {
                  try {
                      await this.applyBackupPayload(restorePoint);
                      showToast('导入失败，已恢复原数据');
                  } catch (restoreError) {
                      console.error('[Import] 自动恢复失败', restoreError);
                      showToast('导入失败，自动恢复也失败');
                  }
              } else {
                  showToast('导入失败，未修改数据');
              }
              Hardware.playSound('error');
              Hardware.vibrate(50);
          }
      });
  },

  getDefaultLibraryState() {
      const db = Model.getDefaultBuiltInWords().map(word => {
          return cloneDataValue(word);
      });
      const folders = [];
      const folderLangs = {};

      db.forEach(word => {
          const folder = word.folder || (
              word.lang === 'en'
                  ? '四级词汇'
                  : '默认词库'
          );

          word.folder = folder;

          if (!folders.includes(folder)) {
              folders.push(folder);
          }

          folderLangs[folder] =
              word.lang === 'en' ? 'en' : 'ja';
      });

      if (!folders.includes('默认词库')) {
          folders.unshift('默认词库');
          folderLangs['默认词库'] = 'ja';
      }

      return { db, folders, folderLangs };
  },

  refreshAfterDataOperation() {
      Model.state.selectedSet.clear();
      Model.state.batchMode = false;
      Model.state.manageMode = false;
      Model.state.renderedStartIndex = -1;
      const folderFilter = View.getEl('wb-folder-filter');
      if (folderFilter) folderFilter.value = 'all';
      View.renderDashboard();
      View.updateWordbankUI();
      View.resetWordbankRenderer();
      this.updateImportFolderOptions();
  },

  async runSafeDataOperation(kind, action, successMessage, reload = false) {
      let restorePoint = null;

      try {
          restorePoint = await this.storePreImportRestorePoint(kind);
          await action();
          await this.updateRestorePointUI();

          Hardware.playSound('success');
          Hardware.vibrate(120);
          showToast(successMessage);

          if (reload) {
              window.setTimeout(() => location.reload(), 900);
          } else {
              this.refreshAfterDataOperation();
          }
      } catch (error) {
          console.error('[Reset] 数据操作失败', error);

          if (restorePoint) {
              try {
                  await this.applyBackupPayload(restorePoint);
                  showToast('操作失败，已恢复原数据');
              } catch (restoreError) {
                  console.error('[Reset] 自动恢复失败', restoreError);
                  showToast('操作失败，自动恢复也失败');
              }
          } else {
              showToast('操作失败，未修改数据');
          }

          Hardware.playSound('error');
          Hardware.vibrate(50);
      }
  },

  clearLearningProgress() {
      return this.runSafeDataOperation('pre-reset-progress', async () => {
          Model.records = [];
          Model.mtGroupClears = {};
          Model.mtWordClears = {};
          await Promise.all([Model.saveRecords(), Model.saveClears()]);
      }, '学习进度已清空');
  },

  restoreBuiltInLibrary() {
      return this.runSafeDataOperation('pre-remove-imported', async () => {
          const defaults = this.getDefaultLibraryState();
          const wordIds = new Set(
              defaults.db.map(word => Model.getWordId(word))
          );

          Model.db = defaults.db;
          Model.folders = defaults.folders;
          Model.folderLangs = defaults.folderLangs;
          Model.stars = Model.stars.filter(wordId => {
              return wordIds.has(wordId);
          });
          Model.mtWordClears = Object.fromEntries(
              Object.entries(Model.mtWordClears).filter(([wordId]) => {
                  return wordIds.has(wordId);
              })
          );

          await Model.saveAllUserData();
      }, '已恢复内置词库');
  },

  fullResetApp() {
      return this.runSafeDataOperation('pre-full-reset', async () => {
          const defaults = this.getDefaultLibraryState();

          Model.db = defaults.db;
          Model.folders = defaults.folders;
          Model.folderLangs = defaults.folderLangs;
          Model.stars = [];
          Model.records = [];
          Model.mtGroupClears = {};
          Model.mtWordClears = {};
          Model.aiConversations = [];

          new Set([...BACKUP_PREFERENCE_KEYS, 'wordOrderMode']).forEach(key => {
              localStorage.removeItem(key);
          });

          await Model.saveAllUserData();
      }, '应用已恢复初始状态', true);
  },
  
  openDetailModal(idx) { 
      Model.state.detailArray = Model.state.filteredDb.map(item => item.idx).filter(id => id !== -999); 
      Model.state.activeDetailIdx = Model.state.detailArray.indexOf(idx); 
      
      if (Model.state.activeDetailIdx === -1) {
          Model.state.detailArray = [idx];
          Model.state.activeDetailIdx = 0;
      }

      window.toggleModal('detail-overlay', true); 
      this.renderDetailCard('none', true); 
  },
  
  navDetail(dir) { 
      Model.state.activeDetailIdx += dir; 
      let max = Model.state.detailArray.length; 
      if (Model.state.activeDetailIdx < 0) Model.state.activeDetailIdx = max - 1; 
      if (Model.state.activeDetailIdx >= max) Model.state.activeDetailIdx = 0; 
      
      let realIdx = Model.state.detailArray[Model.state.activeDetailIdx];
      let w = Model.db[realIdx];
      if (!w) {
          window.toggleModal('detail-overlay', false);
          if (document.getElementById('tab-wordbank').classList.contains('active')) {
              Model.state.renderedStartIndex = -1;
              View.renderVirtualGrid();
          }
          showToast("单词不存在，已关闭详情");
          return;
      }
      
      Hardware.playSound('click'); Hardware.vibrate(30); 
      this.renderDetailCard(dir > 0 ? 'next' : 'prev', true); 
  },
  
  renderDetailCard(anim, triggerTTS = false) { 
      let realIdx = Model.state.detailArray[Model.state.activeDetailIdx]; 
      let w = Model.db[realIdx]; 
      if (!w) {
          window.toggleModal('detail-overlay', false);
          return;
      }
      // 切卡时自动收起详情卡 AI 面板
let dtAiPanel = View.getEl('dt-ai-inline-panel');
if (dtAiPanel) dtAiPanel.classList.add('hidden');
      let wrapper = View.getEl('dt-anim-wrapper'); 
      wrapper.className = 'detail-anim-wrapper'; 
      void wrapper.offsetWidth; 
      
      if(anim !== 'none') { 
          wrapper.classList.add(anim === 'next' ? 'anim-slide-out-left' : 'anim-slide-out-right'); 
          setTimeout(() => { 
              try {
                  this.updateDetailContent(w, triggerTTS); 
              } catch (err) {
                  console.error('更新详情内容失败', err);
                  wrapper.style.opacity = '1';
                  wrapper.style.transform = 'none';
              } finally {
                  wrapper.className = 'detail-anim-wrapper'; 
                  void wrapper.offsetWidth; 
                  wrapper.classList.add(anim === 'next' ? 'anim-slide-in-right' : 'anim-slide-in-left'); 
              }
          }, 200); 
      } else { 
          this.updateDetailContent(w, triggerTTS); 
      } 
  },

      updateDetailContent(w, triggerTTS = false) {  
      let visuals = View.getCardVisuals(w.type, w.lang); 
      document.querySelector('#detail-card-container .watermark-layer').style.background = visuals.bg; 
 
      View.getEl('dt-watermark').innerHTML = visuals.wm; 
      
      let dtWordEl = View.getEl('dt-word');
      dtWordEl.innerText = w.word; 
      let dtLen = Array.from(w.word || '').length;
      const isEnDetail = w.lang === 'en';
      
      if (isEnDetail) {
          if (dtLen >= 14) dtWordEl.style.fontSize = '1.8rem';
          else if (dtLen >= 11) dtWordEl.style.fontSize = '2.2rem';
          else if (dtLen >= 8) dtWordEl.style.fontSize = '2.8rem';
          else if (dtLen >= 5) dtWordEl.style.fontSize = '3.5rem';
          else dtWordEl.style.fontSize = '4.2rem';
      } else {
          if (dtLen >= 10) dtWordEl.style.fontSize = '1.8rem';
          else if (dtLen >= 7) dtWordEl.style.fontSize = '2.2rem';
          else if (dtLen >= 5) dtWordEl.style.fontSize = '2.6rem';
          else dtWordEl.style.fontSize = '';
      }
      if (isEnDetail) {
          let ph = w.phonetic || '';
          View.getEl('dt-kana').innerHTML = ph ? `<span class="material-symbols-rounded phonetic-speaker" style="font-size: 1.15rem; cursor: pointer;">volume_up</span><span style="display:inline-block; transform:translateY(1px);">${escapeHTML(ph)}</span>` : '';
          View.getEl('dt-kana').style.display = ph ? 'flex' : 'none';
      } else {
          const kana = escapeHTML(w.kana || '');
          const pitch = escapeHTML(
              formatWordPitchDisplay(w.pitch)
          );
          const kanaEl = View.getEl('dt-kana');

          kanaEl.innerHTML = `
              <span class="dt-kana-main">${kana}</span>
              ${pitch ? `<span class="dt-pitch">${pitch}</span>` : ''}
          `;
          kanaEl.style.display = (kana || pitch)
              ? 'flex'
              : 'none';
      }
      View.getEl('dt-type').innerHTML = visuals.tagsHTML; 
      let rootsEl = View.getEl('dt-roots');
      let showRootsPref = localStorage.getItem('showRoots') !== 'false';
      if (rootsEl) {
          rootsEl.innerHTML = (w.lang === 'en' && w.roots && showRootsPref) ? View.renderRoots(w.roots) : '';
          rootsEl.style.display = (w.lang === 'en' && w.roots && showRootsPref) ? 'flex' : 'none';
      }
            const detailMeaning = String(
          w.meaning || ''
      ).trim();

      const detailMeaningEl =
          View.getEl('dt-mean');

      if (detailMeaningEl) {
          detailMeaningEl.textContent =
              detailMeaning;

          detailMeaningEl.classList.remove(
              'is-long'
          );

          detailMeaningEl.style.removeProperty(
              'font-size'
          );

          detailMeaningEl.style.removeProperty(
              'line-height'
          );

          detailMeaningEl.style.removeProperty(
              'letter-spacing'
          );

          const detailMeaningLength =
              Array.from(detailMeaning)
                  .reduce((total, character) => {
                      const weight =
                          /[\x00-\x7F]/.test(character)
                              ? 0.55
                              : 1;

                      return total + weight;
                  }, 0);

          let detailMeaningSize = 1.5;

          if (detailMeaningLength > 46) {
              detailMeaningSize = 0.84;
          } else if (detailMeaningLength > 32) {
              detailMeaningSize = 0.92;
          } else if (detailMeaningLength > 22) {
              detailMeaningSize = 1.02;
          } else if (detailMeaningLength > 14) {
              detailMeaningSize = 1.16;
          } else if (detailMeaningLength > 8) {
              detailMeaningSize = 1.3;
          }

          detailMeaningEl.classList.toggle(
              'is-long',
              detailMeaningLength > 14
          );

          detailMeaningEl.style.setProperty(
              'font-size',
              `${detailMeaningSize}rem`,
              'important'
          );

          detailMeaningEl.style.setProperty(
              'line-height',
              detailMeaningLength > 22
                  ? '1.28'
                  : '1.34',
              'important'
          );

          detailMeaningEl.style.setProperty(
              'letter-spacing',
              detailMeaningLength > 32
                  ? '-0.02em'
                  : '0',
              'important'
          );
      }

      View.renderExampleBox(
          w.example,
          'dt-example-box',
          'normal',
          w
      ); 
      let st = Model.getClearState(w);
      if (typeof st === 'number') st = { kanji: false, kana: false, meaning: false };
      let badge = View.getEl('dt-hanko-badge'); 
      if (badge) { 
          badge.style.display = 'flex'; 
          badge.className = 'card-tri-bar'; 
          badge.style.transform = 'scale(1.5)';
          badge.style.transformOrigin = 'top left';
          badge.innerHTML = `
            <div class="tri-bar-segment bar-y ${st.kanji ? 'active' : ''}"></div>
            <div class="tri-bar-segment bar-r ${st.kana ? 'active' : ''}"></div>
            <div class="tri-bar-segment bar-w ${st.meaning ? 'active' : ''}"></div>
          `;
      } 
      let isStarred = Model.isStarred(w); 
      let starBtn = View.getEl('dt-star-btn'); let starIcon = View.getEl('dt-star-icon'); 
      if (starBtn && starIcon) { 
          if (isStarred) { starBtn.classList.add('active'); starIcon.style.fontVariationSettings = "'FILL' 1"; } 
          else { starBtn.classList.remove('active'); starIcon.style.fontVariationSettings = "'FILL' 0"; } 
      } 
      if (triggerTTS && localStorage.getItem('autoSpeak') !== 'false') { Hardware.speakWord(w); } 
  },

openAISheet(sentence, word, lang, wordIndex = -1) {
    if (!navigator.onLine) { showToast('AI 导师需要联网才能工作哦，请检查网络~'); return; }
    let apiKey = localStorage.getItem('deepseekApiKey');
    if (!apiKey) {
        let self = this;
        Hardware.vibrate(20);
        const promptTitle = document.getElementById('prompt-title');
const promptHelper = document.getElementById('prompt-helper');
const promptIcon = document.getElementById('prompt-icon');
const visibilityBtn = document.getElementById('prompt-visibility');
let input = document.getElementById('prompt-input');

promptTitle.textContent = '配置 DeepSeek API Key';

promptHelper.textContent =
    '密钥会保存在当前设备，并仅用于发送 AI 请求。';
promptHelper.hidden = false;

promptIcon.textContent = 'vpn_key';

input.type = 'password';
input.autocomplete = 'new-password';
input.placeholder = '粘贴 API Key（sk-…）';
input.value = '';

visibilityBtn.hidden = false;
visibilityBtn.title = '显示密钥';
visibilityBtn.setAttribute('aria-label', '显示密钥');

const visibilityIcon =
    visibilityBtn.querySelector('.material-symbols-rounded');

if (visibilityIcon) {
    visibilityIcon.textContent = 'visibility';
}
        window.toggleModal('prompt-overlay', true);
        setTimeout(() => input.focus(), 100);
        document.getElementById('prompt-confirm').onclick = () => { 
            Hardware.vibrate(15);
            let val = input.value.trim(); 
            if(val) { 
                localStorage.setItem('deepseekApiKey', val);
                let settingInput = View.getEl('setting-ai-key');
                if (settingInput) settingInput.value = val;
                window.toggleModal('prompt-overlay', false);
                showToast('API Key 已保存');
                self.openAISheet(sentence, word, lang, wordIndex);
            }
        };
        document.getElementById('prompt-cancel').onclick = () => { Hardware.vibrate(10); window.toggleModal('prompt-overlay', false); };
        return;
    }
        let cacheKey =
        `example-analysis-v3|||${lang}|||${sentence}|||${word}`;
    let chatArea = View.getEl('ai-chat-messages');
    let copyBtn = View.getEl('ai-sheet-copy');
    let inputEl = View.getEl('ai-chat-input');
    if (!chatArea) return;
    window.toggleModal('ai-sheet-overlay', true);
    if (copyBtn) copyBtn.style.display = 'none';
    if (inputEl) inputEl.value = '';
    
    const isEnglish = lang === 'en';

    let systemPrompt = isEnglish
        ? `你是精通英语教学的私人外教。用户正在学习以下英文例句。

目标词汇：${word}
例句：${sentence}

请严格遵守以下语言规则：
1. 你现在只处理英语学习内容。
2. 除中文讲解和中文翻译外，禁止输出日语。
3. 禁止生成日语例句、日语假名、日语注音或日语翻译。
4. 举一反三部分只能生成英语例句和中文翻译。

请严格按以下结构输出，不要添加多余的客套话：

### 🔪 骨架拆解
（用中文简明拆解英文句子的主谓宾、从句和修饰关系。）

### 💡 核心亮点
（用中文讲解英文中的地道表达、固定搭配或语法特点。）

### ✍️ 举一反三
（使用目标词汇 "${word}" 生成2个简短、自然、常用的英语生活例句。每条例句必须单独占一行，并严格写成“英语例句 / 中文翻译”。不要编号，禁止出现日语。）

完成解析后，用中文告诉用户可以继续提问。`
        : `你是精通日语教学的私人外教。用户正在学习以下日语例句。

目标词汇：${word}
例句：${sentence}

请严格遵守以下语言规则：
1. 你现在只处理日语学习内容。
2. 讲解与翻译使用中文。
3. 举一反三部分只能生成日语例句和中文翻译。
4. 日语中包含汉字的词语必须按系统要求标注假名。

请严格按以下结构输出，不要添加多余的客套话：

### 🔪 骨架拆解
（用中文简明拆解日语句子的语法结构和助词作用。）

### 💡 核心亮点
（用中文讲解地道表达、词汇搭配或语法特点。）

### ✍️ 举一反三
（使用目标词汇 "${word}" 生成2个简短、自然、常用的日语生活例句。每条例句必须单独占一行，并严格写成“日语例句 / 中文翻译”。不要编号。）

完成解析后，用中文告诉用户可以继续提问。`;
    
    this.currentChat = {
    systemPrompt: systemPrompt,
    messages: [],
    cacheKey: cacheKey,
    sentence: sentence,
    word: word,
    lang: lang,
    wordIndex: Number.isInteger(wordIndex) ? wordIndex : -1
};
    
    if (this.aiCache[cacheKey]) {
        chatArea.innerHTML = this.aiCache[cacheKey];
        if (copyBtn) copyBtn.style.display = 'flex';
        this._scrollChatToBottom();
        return;
    }

    
    chatArea.innerHTML =
        '<div class="ai-chat-bubble ai-chat-bubble-ai is-thinking">' +
            '<div class="ai-chat-bubble-text">' +
                '<div class="ai-thinking-indicator" role="status" aria-label="AI 正在思考">' +
                    '<span></span><span></span><span></span>' +
                '</div>' +
            '</div>' +
        '</div>';
    this._scrollChatToBottom();
    this._startChatStream(apiKey, chatArea, copyBtn, inputEl);
},

_registerAIActionPayload(payload) {
    const payloadId =
        `ai_action_${Date.now()}_${this.aiActionSerial++}`;

    this.aiActionPayloads[payloadId] = payload;

    return payloadId;
},

_extractAIExamples(text) {
    const source = String(text || '');

    const sectionMatch = source.match(
        /(?:###\s*)?✍️\s*举一反三([\s\S]*)/i
    );

    if (!sectionMatch) {
        return [];
    }

    return sectionMatch[1]
        .split(/\r?\n/)
        .map(line => {
            return line
                .replace(/^\s*(?:[-*•]|\d+[.、)])\s*/, '')
                .replace(/\*\*/g, '')
                .trim();
        })
        .filter(line => {
            return (
                line.includes('/') &&
                !line.startsWith('###') &&
                !line.includes('可以继续')
            );
        })
        .slice(0, 2)
        .map(line => {
            return line.replace(
                /([\u3400-\u4DBF\u4E00-\u9FFF々〆ヶ]+)《[^》]+》/g,
                '$1'
            );
        });
},

_appendAIResponseActions(aiBubble, payload) {
    if (!aiBubble || !payload?.responseText) {
        return;
    }

    const oldActions =
        aiBubble.querySelector('.ai-response-actions');

    if (oldActions) {
        oldActions.remove();
    }

    const actions = [];

    actions.push({
        action: 'quiz',
        icon: 'quiz',
        label: '生成小测'
    });

    if (
        payload.scope === 'sheet' &&
        this._extractAIExamples(
            payload.responseText
        ).length > 0
    ) {
        actions.unshift({
            action: 'save-examples',
            icon: 'bookmark_add',
            label: '保存例句'
        });
    }

    if (payload.responseText) {
        actions.unshift({
            action: 'extract-words',
            icon: 'playlist_add',
            label: '提取词汇'
        });
    }

    const payloadId =
        this._registerAIActionPayload(payload);

    const actionBar =
        document.createElement('div');

    actionBar.className = 'ai-response-actions';

    actionBar.setAttribute(
        'aria-label',
        'AI 回答操作'
    );

    actionBar.innerHTML = actions
        .map(item => {
            return (
                `<button type="button" class="ai-response-action" ` +
                `data-action="${item.action}" ` +
                `data-payload-id="${payloadId}">` +
                    `<span class="material-symbols-rounded">${item.icon}</span>` +
                    `<span>${item.label}</span>` +
                `</button>`
            );
        })
        .join('');

    aiBubble.appendChild(actionBar);
},

handleAIResponseAction(action, payloadId) {
    const payload =
        this.aiActionPayloads[payloadId];

    if (!payload) {
        showToast('这条操作已经失效，请重新打开回答');
        return;
    }

    if (action === 'quiz') {
        this._startAIQuiz(payload.scope);
        return;
    }

    if (action === 'save-examples') {
        this._saveAIExamples(payload);
        return;
    }

    if (action === 'extract-words') {
        this._beginAIWordExtraction(payload);
    }
},

_startAIQuiz(scope) {
    const quizPrompt =
        '请根据刚才讲解的内容给我出3道小测题。一次只出一道，不要立刻公布答案，等我回答后再判断并继续下一题。';

    if (scope === 'sheet') {
        const inputEl = View.getEl('ai-chat-input');

        if (!inputEl) {
            return;
        }

        inputEl.value = quizPrompt;
        this.sendAIMessage();
        return;
    }

    const inputEl = View.getEl('ai-tab-chat-input');

    if (!inputEl) {
        return;
    }

    inputEl.value = quizPrompt;
    this.sendAITabMessage();
},

_saveAIExamples(payload) {
    const examples =
        this._extractAIExamples(
            payload.responseText
        );

    if (examples.length === 0) {
        showToast('没有识别到可保存的例句');
        return;
    }

    let wordIndex = Number(payload.wordIndex);

    if (
        !Number.isInteger(wordIndex) ||
        wordIndex < 0 ||
        !Model.db[wordIndex]
    ) {
        wordIndex = Model.db.findIndex(word => {
            return (
                word.word === payload.word &&
                (word.lang || 'ja') ===
                    (payload.lang || 'ja')
            );
        });
    }

    if (wordIndex < 0) {
        showToast('没有找到对应词条');
        return;
    }

    const word = Model.db[wordIndex];

    const existingExamples = String(
        word.example || ''
    )
        .split('||')
        .map(item => item.trim())
        .filter(Boolean);

    const newExamples = examples.filter(example => {
        return !existingExamples.includes(example);
    });

    if (newExamples.length === 0) {
        showToast('这些例句已经保存过了');
        return;
    }

    word.example = normalizeExampleText(
        [
            ...existingExamples,
            ...newExamples
        ].join(' || '),
        word.lang || 'ja'
    );

    Model.saveDB();
    View.resetWordbankRenderer();

    showToast(
        `已为「${word.word}」保存 ${newExamples.length} 条例句`
    );
},

_resetAIWordCollection() {
    this.aiWordCollection = {
        sourcePayload: null,
        candidates: [],
        drafts: []
    };
},

_closeAIWordCollector() {
    window.toggleModal(
        'ai-word-collector-overlay',
        false
    );

    this._resetAIWordCollection();
},

_showAIWordCollectorStage(stage, message = '') {
    const selectStep =
        View.getEl('ai-word-step-select');

    const previewStep =
        View.getEl('ai-word-step-preview');

    const loadingStep =
        View.getEl('ai-word-step-loading');

    if (selectStep) {
        selectStep.hidden = stage !== 'select';
    }

    if (previewStep) {
        previewStep.hidden = stage !== 'preview';
    }

    if (loadingStep) {
        loadingStep.hidden = stage !== 'loading';
    }

    const loadingText =
        View.getEl('ai-word-loading-text');

    if (loadingText && message) {
        loadingText.textContent = message;
    }
},

_parseAIJSONObject(content) {
    const source = String(content || '')
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

    try {
        return JSON.parse(source);
    } catch (error) {
        const firstBrace = source.indexOf('{');
        const lastBrace = source.lastIndexOf('}');

        if (
            firstBrace === -1 ||
            lastBrace <= firstBrace
        ) {
            throw new Error(
                'AI 没有返回可识别的数据'
            );
        }

        return JSON.parse(
            source.slice(
                firstBrace,
                lastBrace + 1
            )
        );
    }
},

async _requestAIJSON(prompt) {
    const apiKey =
        localStorage.getItem('deepseekApiKey');

    if (!apiKey) {
        throw new Error(
            '请先在设置中配置 DeepSeek API Key'
        );
    }

    const response = await fetch(
        'https://api.deepseek.com/chat/completions',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                stream: false,
                temperature: 0.2
            })
        }
    );

    if (!response.ok) {
        throw new Error(
            `AI 请求失败：${response.status}`
        );
    }

    const data = await response.json();

    const content =
        data.choices?.[0]?.message?.content || '';

    return this._parseAIJSONObject(content);
},

_normalizeAIWordText(word, lang) {
    let value = String(word || '')
        .normalize('NFC')
        .replace(
            /[\u200B-\u200D\u2060\uFEFF]/g,
            ''
        )
        .replace(/《[^》]*》/g, '')
        .replace(/^[\s“”"'‘’「」『』【】()（）]+/, '')
        .replace(/[\s“”"'‘’「」『』【】()（）.,，。!?！？:：;；]+$/, '')
        .trim();

    if (lang === 'en') {
        value = value
            .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'’ -]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    return value;
},

_inferAIWordLang(word, fallback = 'ja') {
    const value = String(word || '');

    if (/[ぁ-ゖァ-ヺ一-龯々〆ヶ]/.test(value)) {
        return 'ja';
    }

    if (/[A-Za-z]/.test(value)) {
        return 'en';
    }

    return fallback === 'en'
        ? 'en'
        : 'ja';
},

async _beginAIWordExtraction(payload) {
    const sourceText = String(
        payload?.responseText || ''
    ).trim();

    if (!sourceText) {
        showToast('这条回答里没有可提取的内容');
        return;
    }

    if (!localStorage.getItem('deepseekApiKey')) {
        showToast('请先在设置中配置 DeepSeek API Key');
        return;
    }

    this._resetAIWordCollection();

    this.aiWordCollection.sourcePayload = payload;

    window.toggleModal(
        'ai-word-collector-overlay',
        true
    );

    this._showAIWordCollectorStage(
        'loading',
        '正在识别回答中的日语和英语词汇…'
    );

    const prompt = `请从下面这段语言学习回答中提取适合加入词库的日语或英语词汇。

规则：
1. 只提取有学习价值的实词、固定搭配或常用短语，不要提取中文翻译、标点、助词、冠词和普通代词。
2. 日语动词尽量使用辞书形，形容词使用基本形；英语使用词典原形。
3. 最多返回12项，去除重复项。
4. lang 只能是 "ja" 或 "en"。
5. 只输出一个 JSON 对象，不要使用 Markdown，不要添加解释。

格式：
{"words":[{"word":"達成する","lang":"ja"},{"word":"achieve","lang":"en"}]}

回答内容：
${sourceText.slice(0, 9000)}`;

    try {
        const result =
            await this._requestAIJSON(prompt);

        const rawWords = Array.isArray(result.words)
            ? result.words
            : [];

        const fallbackLang =
            payload?.lang === 'en'
                ? 'en'
                : 'ja';

        const seen = new Set();
        const candidates = [];

        for (const item of rawWords) {
            const rawWord =
                typeof item === 'string'
                    ? item
                    : item?.word;

            const lang =
                item?.lang === 'en' ||
                item?.lang === 'ja'
                    ? item.lang
                    : this._inferAIWordLang(
                        rawWord,
                        fallbackLang
                    );

            const word =
                this._normalizeAIWordText(
                    rawWord,
                    lang
                );

            if (!word) {
                continue;
            }

            const key =
                `${lang}:${lang === 'en' ? word.toLowerCase() : word}`;

            if (seen.has(key)) {
                continue;
            }

            seen.add(key);

            const existingWord =
                Model.db.find(entry => {
                    const entryLang =
                        entry.lang || 'ja';

                    const entryWord =
                        this._normalizeAIWordText(
                            entry.word,
                            entryLang
                        );

                    return (
                        entryLang === lang &&
                        entryWord === word
                    );
                });

            candidates.push({
                word,
                lang,
                selected: !existingWord,
                existingFolder:
                    existingWord?.folder || ''
            });

            if (candidates.length >= 12) {
                break;
            }
        }

        if (candidates.length === 0) {
            this._closeAIWordCollector();
            showToast('没有识别到适合加入词库的词汇');
            return;
        }

        this.aiWordCollection.candidates =
            candidates;

        this._renderAIWordCandidates();

        this._showAIWordCollectorStage(
            'select'
        );
    } catch (error) {
        console.error('[AI Word Extract]', error);
        this._closeAIWordCollector();
        showToast(
            error?.message ||
            '词汇识别失败，请稍后重试'
        );
    }
},

_renderAIWordCandidates() {
    const list =
        View.getEl('ai-word-candidate-list');

    if (!list) {
        return;
    }

    list.innerHTML =
        this.aiWordCollection.candidates
            .map((candidate, index) => {
                const languageName =
                    candidate.lang === 'en'
                        ? '英语'
                        : '日语';

                const existing =
                    candidate.existingFolder
                        ? `<span class="ai-word-existing">已在「${escapeHTML(candidate.existingFolder)}」</span>`
                        : '';

                return `
                    <label class="ai-word-candidate">
                        <input
                            type="checkbox"
                            data-ai-word-index="${index}"
                            ${candidate.selected ? 'checked' : ''}
                        >

                        <span class="ai-word-checkmark">
                            <span class="material-symbols-rounded">check</span>
                        </span>

                        <span class="ai-word-candidate-copy">
                            <strong>${escapeHTML(candidate.word)}</strong>
                            <small>${languageName}${existing}</small>
                        </span>
                    </label>
                `;
            })
            .join('');

    this._updateAIWordCandidateCount();
},

_updateAIWordCandidateCount() {
    const list =
        View.getEl('ai-word-candidate-list');

    const countEl =
        View.getEl('ai-word-selected-count');

    const nextBtn =
        View.getEl('ai-word-enrich');

    if (!list || !countEl) {
        return;
    }

    const checked =
        list.querySelectorAll(
            'input[type="checkbox"]:checked'
        ).length;

    countEl.textContent =
        `已选 ${checked} / ${this.aiWordCollection.candidates.length}`;

    if (nextBtn) {
        nextBtn.disabled = checked === 0;
    }
},

_toggleAllAIWordCandidates() {
    const list =
        View.getEl('ai-word-candidate-list');

    if (!list) {
        return;
    }

    const checkboxes = Array.from(
        list.querySelectorAll(
            'input[type="checkbox"]'
        )
    );

    const shouldCheck =
        checkboxes.some(checkbox => {
            return !checkbox.checked;
        });

    checkboxes.forEach(checkbox => {
        checkbox.checked = shouldCheck;
    });

    this._updateAIWordCandidateCount();
},

_getSelectedAIWordCandidates() {
    const list =
        View.getEl('ai-word-candidate-list');

    if (!list) {
        return [];
    }

    return Array.from(
        list.querySelectorAll(
            'input[type="checkbox"]:checked'
        )
    )
        .map(checkbox => {
            return this.aiWordCollection.candidates[
                Number(checkbox.dataset.aiWordIndex)
            ];
        })
        .filter(Boolean);
},

async _enrichSelectedAIWords() {
    const selected =
        this._getSelectedAIWordCandidates();

    if (selected.length === 0) {
        showToast('请至少选择一个词汇');
        return;
    }

    this._showAIWordCollectorStage(
        'loading',
        `正在为 ${selected.length} 个词汇补全读音、释义和例句…`
    );

    const requestedWords = selected
        .map(item => {
            return {
                word: item.word,
                lang: item.lang
            };
        });

    const prompt = `请把下面的日语和英语词汇整理成适合中文学习者保存到词库的完整词条。

规则：
1. 严格保留输入顺序，每个输入词对应一个结果。
2. 日语字段：word、lang、kana、type、meaning、example、roots。
3. 英语字段：word、lang、phonetic、type、meaning、example、roots。
4. lang 只能是 "ja" 或 "en"。
5. meaning 使用简洁中文；type 使用中文词性。
6. example 必须是一条自然、常用的目标语言例句，格式严格为“目标语言例句 / 中文翻译”。
7. 英语 roots 提供简洁可靠的词根词缀拆解；无法可靠拆解时写空字符串，不要编造。
8. 日语 roots 一律为空字符串。
9. 无法确认的字段写空字符串。
10. 只输出一个 JSON 对象，不要使用 Markdown，不要添加解释。

格式：
{"items":[{"word":"達成する","lang":"ja","kana":"たっせいする","type":"动词","meaning":"达成；完成","example":"目標を達成するために努力する。 / 为了实现目标而努力。","roots":""},{"word":"achieve","lang":"en","phonetic":"/əˈtʃiːv/","type":"动词","meaning":"达到；实现","example":"She worked hard to achieve her goal. / 她努力实现自己的目标。","roots":"a(去)-chieve(头)"}]}

待整理词汇：
${JSON.stringify(requestedWords)}`;

    try {
        const result =
            await this._requestAIJSON(prompt);

        const rawItems = Array.isArray(result.items)
            ? result.items
            : [];

        const drafts = selected.map(candidate => {
            const matching = rawItems.find(item => {
                const itemLang =
                    item?.lang === 'en'
                        ? 'en'
                        : 'ja';

                return (
                    itemLang === candidate.lang &&
                    this._normalizeAIWordText(
                        item?.word,
                        itemLang
                    ) === candidate.word
                );
            }) || {};

            const rawDraft = {
                word:
                    String(matching.word || candidate.word),
                lang: candidate.lang,
                kana:
                    candidate.lang === 'ja'
                        ? String(matching.kana || '')
                        : '',
                phonetic:
                    candidate.lang === 'en'
                        ? String(matching.phonetic || '')
                        : '',
                type:
                    String(matching.type || ''),
                meaning:
                    String(matching.meaning || ''),
                example:
                    String(matching.example || ''),
                roots:
                    candidate.lang === 'en'
                        ? String(matching.roots || '')
                        : ''
            };

            return this._toAIWordDraft(
                normalizeWordEntry(rawDraft)
            );
        });

        this.aiWordCollection.drafts = drafts;

        this._renderAIWordPreview();

        this._showAIWordCollectorStage(
            'preview'
        );
    } catch (error) {
        console.error('[AI Word Enrich]', error);
        this._showAIWordCollectorStage('select');
        showToast(
            error?.message ||
            '词条补全失败，请稍后重试'
        );
    }
},

_ensureLanguageFolder(lang) {
    const fallback =
        lang === 'en'
            ? '四级词汇'
            : '默认词库';

    let folders = Model.folders.filter(folder => {
        const folderLang =
            Model.folderLangs[folder] ||
            (
                Model.db.some(word => {
                    return (
                        word.folder === folder &&
                        word.lang === 'en'
                    );
                })
                    ? 'en'
                    : 'ja'
            );

        return folderLang === lang;
    });

    if (folders.length === 0) {
        if (!Model.folders.includes(fallback)) {
            Model.folders.push(fallback);
        }

        Model.folderLangs[fallback] = lang;
        Model.saveFolders();
        Model.saveFolderLangs();

        folders = [fallback];
    }

    return folders;
},

_updateAIWordFolderSelect(selectId, lang, visible) {
    const select = View.getEl(selectId);
    const group = select?.closest('.ai-word-folder-group');

    if (!select || !group) {
        return;
    }

    group.hidden = !visible;

    if (!visible) {
        return;
    }

    const folders =
        this._ensureLanguageFolder(lang);

    const lastFolder =
        localStorage.getItem('lastSelectedFolder');

    const preferred =
        folders.includes(lastFolder)
            ? lastFolder
            : (
                folders.includes(
                    lang === 'en'
                        ? '四级词汇'
                        : '默认词库'
                )
                    ? (
                        lang === 'en'
                            ? '四级词汇'
                            : '默认词库'
                    )
                    : folders[0]
            );

    select.innerHTML = folders
        .map(folder => {
            return (
                `<option value="${escapeHTML(folder)}">` +
                    `${escapeHTML(folder)}` +
                '</option>'
            );
        })
        .join('');

    select.value = preferred;

    select.dispatchEvent(
        new Event('facade-update')
    );
},

_toAIWordDraft(entry) {
    const normalized = normalizeWordEntry(entry);

    return {
        word: normalized.word || '',
        lang: normalized.lang === 'en' ? 'en' : 'ja',
        kana:
            normalized.lang === 'ja'
                ? (normalized.kana || '')
                : '',
        phonetic:
            normalized.lang === 'en'
                ? (normalized.phonetic || '')
                : '',
        type: normalized.type || '',
        meaning: normalized.meaning || '',
        example: normalized.example || '',
        roots:
            normalized.lang === 'en'
                ? (normalized.roots || '')
                : '',
        level: normalized.level || '',
        difficulty: normalizeWordDifficulty(normalized.difficulty),
        tags: normalizeWordTags(normalized.tags),
        builtIn: normalized.builtIn === true
    };
},

_renderAIWordQualityHTML(report) {
    let summaryClass = 'is-ok';
    let summaryText = '格式正常';

    if (report.errorCount > 0) {
        summaryClass = 'is-error';
        summaryText = `${report.errorCount} 项必须补全`;
    } else if (report.warningCount > 0) {
        summaryClass = 'is-warning';
        summaryText = `${report.warningCount} 项建议核对`;
    }

    const iconMap = {
        ok: 'check_circle',
        warn: 'error',
        error: 'cancel',
        info: 'info'
    };

    return `
        <div class="ai-word-quality-heading">
            <span>
                <span class="material-symbols-rounded">fact_check</span>
                质量检查
            </span>

            <strong class="ai-word-quality-summary ${summaryClass}">
                ${summaryText}
            </strong>
        </div>

        <div class="ai-word-quality-list">
            ${report.items.map(item => {
                const levelClass =
                    item.level === 'warn'
                        ? 'warning'
                        : item.level;

                return `
                    <div class="ai-word-quality-item is-${levelClass}">
                        <span class="material-symbols-rounded">
                            ${iconMap[item.level] || 'info'}
                        </span>
                        <span>${escapeHTML(item.text)}</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;
},

_updateAIWordSaveState() {
    const saveButton =
        View.getEl('ai-word-save');

    if (!saveButton) {
        return;
    }

    const reports =
        this.aiWordCollection.drafts.map(draft => {
            return getWordEntryQuality(draft);
        });

    const totalErrors = reports.reduce(
        (sum, report) => {
            return sum + report.errorCount;
        },
        0
    );

    saveButton.disabled = totalErrors > 0;
    saveButton.title = totalErrors > 0
        ? '请先补全质量检查中的红色项目'
        : '确认加入词库';
},

_refreshAIWordQualityCard(index) {
    const qualityBox = document.querySelector(
        `[data-ai-quality-index="${index}"]`
    );

    const draft =
        this.aiWordCollection.drafts[index];

    if (!qualityBox || !draft) {
        return;
    }

    qualityBox.innerHTML =
        this._renderAIWordQualityHTML(
            getWordEntryQuality(draft)
        );

    this._updateAIWordSaveState();
},

_updateAIWordDraftField(field, shouldNormalize) {
    const index =
        Number(field.dataset.aiDraftIndex);

    const fieldName =
        field.dataset.aiDraftField;

    const draft =
        this.aiWordCollection.drafts[index];

    if (!draft || !fieldName) {
        return;
    }

    draft[fieldName] =
        fieldName === 'tags'
            ? normalizeWordTags(field.value)
            : fieldName === 'difficulty'
                ? normalizeWordDifficulty(field.value)
                : field.value;

    if (shouldNormalize) {
        const normalizedDraft =
            this._toAIWordDraft(draft);

        this.aiWordCollection.drafts[index] =
            normalizedDraft;

        const card = field.closest(
            '.ai-word-preview-card'
        );

        if (card) {
            card.querySelectorAll(
                '[data-ai-draft-field]'
            ).forEach(input => {
                const name =
                    input.dataset.aiDraftField;

                if (name in normalizedDraft) {
                    input.value =
                        normalizedDraft[name] || '';
                }
            });
        }
    }

    this._refreshAIWordQualityCard(index);
},

_renderAIWordPreview() {
    const list =
        View.getEl('ai-word-preview-list');

    if (!list) {
        return;
    }

    const drafts =
        this.aiWordCollection.drafts.map(draft => {
            return this._toAIWordDraft(draft);
        });

    this.aiWordCollection.drafts = drafts;

    const hasJapanese =
        drafts.some(draft => draft.lang === 'ja');

    const hasEnglish =
        drafts.some(draft => draft.lang === 'en');

    this._updateAIWordFolderSelect(
        'ai-word-folder-ja',
        'ja',
        hasJapanese
    );

    this._updateAIWordFolderSelect(
        'ai-word-folder-en',
        'en',
        hasEnglish
    );

    list.innerHTML = drafts
        .map((draft, index) => {
            const isEnglish =
                draft.lang === 'en';

            const qualityReport =
                getWordEntryQuality(draft);

            const readingField = isEnglish
                ? `
                    <label class="ai-word-field-group">
                        <span>音标</span>
                        <input
                            type="text"
                            data-ai-draft-index="${index}"
                            data-ai-draft-field="phonetic"
                            value="${escapeHTML(draft.phonetic)}"
                            placeholder="如：/əˈtʃiːv/"
                        >
                    </label>
                `
                : `
                    <label class="ai-word-field-group">
                        <span>假名</span>
                        <input
                            type="text"
                            data-ai-draft-index="${index}"
                            data-ai-draft-field="kana"
                            value="${escapeHTML(draft.kana)}"
                            placeholder="如：たっせいする"
                        >
                    </label>
                `;

            const rootsField = isEnglish
                ? `
                    <label class="ai-word-field-group ai-word-field-wide">
                        <span>词根词缀</span>
                        <input
                            type="text"
                            data-ai-draft-index="${index}"
                            data-ai-draft-field="roots"
                            value="${escapeHTML(draft.roots)}"
                            placeholder="无法可靠拆解时可以留空"
                        >
                    </label>
                `
                : '';

            return `
                <article
                    class="ai-word-preview-card"
                    data-ai-preview-index="${index}"
                >
                    <div class="ai-word-preview-heading">
                        <span class="ai-word-language-tag ${isEnglish ? 'is-en' : 'is-ja'}">
                            ${isEnglish ? 'EN' : '日'}
                        </span>
                        <strong>词条 ${index + 1}</strong>
                    </div>

                    <div
                        class="ai-word-quality"
                        data-ai-quality-index="${index}"
                    >
                        ${this._renderAIWordQualityHTML(qualityReport)}
                    </div>

                    <div class="ai-word-preview-grid">
                        <label class="ai-word-field-group">
                            <span>单词</span>
                            <input
                                type="text"
                                data-ai-draft-index="${index}"
                                data-ai-draft-field="word"
                                value="${escapeHTML(draft.word)}"
                            >
                        </label>

                        ${readingField}

                        <label class="ai-word-field-group">
                            <span>词性</span>
                            <input
                                type="text"
                                data-ai-draft-index="${index}"
                                data-ai-draft-field="type"
                                value="${escapeHTML(draft.type)}"
                                placeholder="如：动词"
                            >
                        </label>

                        <label class="ai-word-field-group">
                            <span>级别</span>
                            <select
                                data-ai-draft-index="${index}"
                                data-ai-draft-field="level"
                            >
                                <option value="" ${!draft.level ? 'selected' : ''}>未分级</option>
                                ${(WORD_LEVEL_OPTIONS[draft.lang] || []).map(level => {
                                    return `<option value="${level}" ${draft.level === level ? 'selected' : ''}>${level}</option>`;
                                }).join('')}
                            </select>
                        </label>

                        <label class="ai-word-field-group">
                            <span>难度</span>
                            <select
                                data-ai-draft-index="${index}"
                                data-ai-draft-field="difficulty"
                            >
                                ${Object.entries(DIFFICULTY_LABELS).map(([value, label]) => {
                                    return `<option value="${value}" ${String(draft.difficulty) === value ? 'selected' : ''}>${value === '0' ? label : value + ' · ' + label}</option>`;
                                }).join('')}
                            </select>
                        </label>

                        <label class="ai-word-field-group ai-word-field-wide">
                            <span>标签</span>
                            <input
                                type="text"
                                data-ai-draft-index="${index}"
                                data-ai-draft-field="tags"
                                value="${escapeHTML(normalizeWordTags(draft.tags).join('、'))}"
                                placeholder="如：高频、口语、多义"
                            >
                        </label>

                        <label class="ai-word-field-group ai-word-field-wide">
                            <span>中文释义</span>
                            <textarea
                                rows="2"
                                data-ai-draft-index="${index}"
                                data-ai-draft-field="meaning"
                                placeholder="填写简洁中文释义"
                            >${escapeHTML(draft.meaning)}</textarea>
                        </label>

                        <label class="ai-word-field-group ai-word-field-wide">
                            <span>例句与翻译</span>
                            <textarea
                                rows="3"
                                data-ai-draft-index="${index}"
                                data-ai-draft-field="example"
                                placeholder="目标语言例句 / 中文翻译"
                            >${escapeHTML(draft.example)}</textarea>
                        </label>

                        ${rootsField}
                    </div>
                </article>
            `;
        })
        .join('');

    this._updateAIWordSaveState();
},

_collectAIWordDraftsFromForm() {
    const list =
        View.getEl('ai-word-preview-list');

    if (!list) {
        return [];
    }

    const drafts =
        this.aiWordCollection.drafts.map(draft => {
            return { ...draft };
        });

    list.querySelectorAll(
        '[data-ai-draft-index][data-ai-draft-field]'
    ).forEach(field => {
        const index =
            Number(field.dataset.aiDraftIndex);

        const name =
            field.dataset.aiDraftField;

        if (!drafts[index] || !name) {
            return;
        }

        drafts[index][name] =
            name === 'tags'
                ? normalizeWordTags(field.value)
                : name === 'difficulty'
                    ? normalizeWordDifficulty(field.value)
                    : field.value;
    });

    const normalizedDrafts = drafts.map(draft => {
        return this._toAIWordDraft(
            normalizeWordEntry(draft)
        );
    });

    for (
        let index = 0;
        index < normalizedDrafts.length;
        index++
    ) {
        const report = getWordEntryQuality(
            normalizedDrafts[index]
        );

        if (report.errorCount === 0) {
            continue;
        }

        const firstError = report.items.find(item => {
            return item.level === 'error';
        });

        const fieldName = firstError?.field || 'word';

        const invalidField = list.querySelector(
            `[data-ai-draft-index="${index}"][data-ai-draft-field="${fieldName}"]`
        );

        if (invalidField) {
            invalidField.focus();
        }

        throw new Error(
            `请先处理第 ${index + 1} 个词条的红色项目`
        );
    }

    this.aiWordCollection.drafts =
        normalizedDrafts;

    return normalizedDrafts;
},

_findDuplicateAIWord(draft) {
    const target =
        this._normalizeAIWordText(
            draft.word,
            draft.lang
        );

    return Model.db.find(word => {
        const wordLang =
            word.lang || 'ja';

        return (
            wordLang === draft.lang &&
            this._normalizeAIWordText(
                word.word,
                wordLang
            ) === target
        );
    });
},

async _saveAIWordDrafts() {
    let drafts;

    try {
        drafts =
            this._collectAIWordDraftsFromForm();
    } catch (error) {
        showToast(error.message);
        return;
    }

    const japaneseFolder =
        View.getEl('ai-word-folder-ja')?.value ||
        '默认词库';

    const englishFolder =
        View.getEl('ai-word-folder-en')?.value ||
        '四级词汇';

    const duplicateMode =
        View.getEl('ai-word-duplicate-mode')?.value ||
        'skip';

    const addToStars = Boolean(
        View.getEl('ai-word-add-star')?.checked
    );

    let added = 0;
    let updated = 0;
    let skipped = 0;

    for (const draft of drafts) {
        const folder =
            draft.lang === 'en'
                ? englishFolder
                : japaneseFolder;

        const duplicate =
            this._findDuplicateAIWord(draft);

        if (duplicate && duplicateMode === 'skip') {
            skipped++;
            continue;
        }

        const normalizedWord = normalizeWordEntry({
            word: draft.word,
            type: draft.type,
            meaning: draft.meaning,
            example: draft.example || '',
            roots:
                draft.lang === 'en'
                    ? (draft.roots || '')
                    : '',
            phonetic:
                draft.lang === 'en'
                    ? (draft.phonetic || '')
                    : '',
            kana:
                draft.lang === 'ja'
                    ? (draft.kana || '')
                    : '',
            lang: draft.lang,
            folder,
            level: draft.level || '',
            difficulty: normalizeWordDifficulty(draft.difficulty),
            tags: normalizeWordTags(draft.tags),
            builtIn: draft.builtIn === true,
            isImported: true,
            importedAt: new Date().toISOString(),
            aiGenerated: true,
            aiConfirmedAt: new Date().toISOString(),
            srs: {
                ease: 2.5,
                interval: 0,
                nextReview: Date.now()
            }
        });

        let savedWord = normalizedWord;

        if (duplicate && duplicateMode === 'overwrite') {
            const originalFolder = duplicate.folder;
            const originalId = Model.getWordId(duplicate);
            const originalBuiltIn = duplicate.builtIn === true;

            Object.assign(
                duplicate,
                normalizedWord,
                {
                    _id: originalId,
                    builtIn: originalBuiltIn,
                    folder: originalFolder || folder
                }
            );

            savedWord = duplicate;
            updated++;
        } else {
            ensureStableWordId(normalizedWord, {
                builtInHint: normalizedWord.builtIn === true
            });
            Model.db.push(normalizedWord);
            added++;
        }

        const savedWordId = Model.getWordId(savedWord);

        if (
            addToStars &&
            !Model.stars.includes(savedWordId)
        ) {
            Model.stars.push(savedWordId);
        }
    }

    await Promise.all([
        Model.saveDB(),
        Model.saveStars()
    ]);

    View.renderDashboard();
    View.updateWordbankUI();
    View.resetWordbankRenderer();

    this._closeAIWordCollector();

    const resultParts = [];

    if (added > 0) {
        resultParts.push(`新增 ${added}`);
    }

    if (updated > 0) {
        resultParts.push(`更新 ${updated}`);
    }

    if (skipped > 0) {
        resultParts.push(`跳过 ${skipped}`);
    }

    showToast(
        resultParts.length > 0
            ? `词库已处理：${resultParts.join('，')}`
            : '没有需要保存的词汇'
    );
},

_saveCurrentChat() {
    if (!this.currentChat || this.currentChat.messages.length === 0) return;
    let lastExisting = Model.aiConversations.findIndex(c => c.cacheKey === this.currentChat.cacheKey);
    let conv = {
        id: Date.now(),
        date: new Date().toLocaleDateString('zh-CN') + ' ' + new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'}),
        sentence: this.currentChat.sentence || '',
        word: this.currentChat.word || '',
        lang: this.currentChat.lang || 'ja',
        cacheKey: this.currentChat.cacheKey,
        systemPrompt: this.currentChat.systemPrompt,
        messages: [...this.currentChat.messages]
    };
    if (lastExisting !== -1) {
        Model.aiConversations[lastExisting] = conv;
    } else if (conv.messages.length > 0) {
        Model.aiConversations.unshift(conv);
        if (Model.aiConversations.length > 50) Model.aiConversations = Model.aiConversations.slice(0, 50);
    }
    this._persistConversations();
},

_persistConversations() {
    if (!Model.idbAvailable) {
        localStorage.setItem(
            'aiConversations',
            JSON.stringify(
                Model.aiConversations
            )
        );

        return Promise.resolve();
    }

    return idbKeyval.set(
        'aiConversations',
        Model.aiConversations
    );
},

openAIPresetPicker() {
    const lang =
        Model.state.currentLangMode === 'en'
            ? 'en'
            : 'ja';

    const langLabel =
        View.getEl(
            'ai-preset-language-label'
        );

    if (langLabel) {
        langLabel.textContent =
            lang === 'en'
                ? '当前将使用英语导师'
                : '当前将使用日语导师';
    }

    window.toggleModal(
        'ai-preset-overlay',
        true
    );
},

startAITabPreset(presetId) {
    const preset =
        AI_CHAT_PRESETS[presetId] ||
        AI_CHAT_PRESETS.free;

    const lang =
        Model.state.currentLangMode === 'en'
            ? 'en'
            : 'ja';

    this.aiTabChat.activeIdx = -1;
    this.aiTabChat.messages = [];
    this.aiTabChat.presetId = presetId;
    this.aiTabChat.lang = lang;

    this.aiTabChat.systemPrompt =
        buildAIChatSystemPrompt(
            presetId,
            lang
        );

    this.aiTabChat.cacheKey =
        `free_${presetId}_${Date.now()}`;

    this.aiTabChat.word =
        preset.title;

    this.aiTabChat.sentence = '';

    const listView =
        View.getEl('ai-list-view');

    const chatView =
        View.getEl('ai-chat-view');

    const messagesEl =
        View.getEl(
            'ai-tab-chat-messages'
        );

    const titleEl =
        View.getEl(
            'ai-chat-view-title'
        );

    const inputEl =
        View.getEl(
            'ai-tab-chat-input'
        );

    if (titleEl) {
        titleEl.textContent =
            this.getAITabChatTitle();
    }

    if (messagesEl) {
        messagesEl.innerHTML = '';
    }

    if (inputEl) {
        inputEl.value = '';

        inputEl.placeholder =
            lang === 'en'
                ? '输入英语学习问题…'
                : '输入日语学习问题…';
    }

    if (listView) {
        listView.classList.add(
            'hidden'
        );
    }

    if (chatView) {
        chatView.classList.remove(
            'hidden'
        );
    }

    this.renderAITabWelcome();

    window.toggleModal(
        'ai-preset-overlay',
        false
    );
},

getAITabChatTitle() {
    const preset =
        AI_CHAT_PRESETS[
            this.aiTabChat.presetId
        ];

    if (!preset) {
        return (
            this.aiTabChat.word ||
            '对话'
        );
    }

    const langName =
        this.aiTabChat.lang === 'en'
            ? '英语'
            : '日语';

    return (
        `${preset.title} · ${langName}`
    );
},

renderAITabWelcome() {
    const welcomeEl =
        View.getEl(
            'ai-chat-welcome'
        );

    const modeLabel =
        View.getEl(
            'ai-chat-mode-label'
        );

    const welcomeText =
        View.getEl(
            'ai-chat-welcome-text'
        );

    const quickActions =
        View.getEl(
            'ai-chat-quick-actions'
        );

    const inputEl =
        View.getEl(
            'ai-tab-chat-input'
        );

    if (
        !welcomeEl ||
        !quickActions
    ) {
        return;
    }

    const preset =
        AI_CHAT_PRESETS[
            this.aiTabChat.presetId
        ];

    if (
        !preset ||
        this.aiTabChat.messages.length > 0
    ) {
        welcomeEl.classList.add(
            'hidden'
        );

        quickActions.innerHTML = '';
        return;
    }

    const lang =
        this.aiTabChat.lang === 'en'
            ? 'en'
            : 'ja';

    const langName =
        lang === 'en'
            ? '英语'
            : '日语';

    if (modeLabel) {
        modeLabel.textContent =
            `${preset.title} · ${langName}`;
    }

    if (welcomeText) {
        welcomeText.textContent =
            preset.welcome[lang];
    }

    quickActions.innerHTML = '';

    preset.shortcuts[lang]
        .forEach(text => {
            const button =
                document.createElement(
                    'button'
                );

            button.type = 'button';

            button.className =
                'ai-chat-quick-chip';

            button.textContent = text;

            button.addEventListener(
                'click',
                () => {
                    Hardware.vibrate(12);

                    if (!inputEl) {
                        return;
                    }

                    inputEl.value = text;
                    inputEl.focus();

                    inputEl.dispatchEvent(
                        new Event(
                            'input',
                            {
                                bubbles: true
                            }
                        )
                    );
                }
            );

            quickActions.appendChild(
                button
            );
        });

    welcomeEl.classList.remove(
        'hidden'
    );
},

renderAIHistory() {
    let listEl = View.getEl('ai-history-list');
    let emptyEl = View.getEl('ai-history-empty');
    let chatView = View.getEl('ai-chat-view');
    let listView = View.getEl('ai-list-view');
    if (chatView) chatView.classList.add('hidden');
    if (listView) listView.classList.remove('hidden');
    if (!listEl) return;
    if (Model.aiConversations.length === 0) {
        listEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    let html = '';
    Model.aiConversations.forEach((conv, idx) => {
        let preview = '';
        let msgCount = 0;
        if (conv.messages && conv.messages.length > 0) {
            msgCount = conv.messages.length;
            let lastMsg = conv.messages[conv.messages.length - 1].content || '';
            preview = lastMsg.replace(/###.*?\n/g, '').replace(/\*\*/g, '').replace(/\n/g, ' ').substring(0, 60);
            if (lastMsg.length > 60) preview += '...';
        }
        let isEnglish = conv.lang === 'en';
        let wordDisplay = conv.word || '自由对话';
        html += '<div class="ai-history-card" data-idx="' + idx + '" tabindex="0" role="button">';
html += '<div class="ai-history-card-top">';
html += '<span class="ai-history-lang-tag">' + (isEnglish ? 'EN' : '日') + '</span>';
html += '<span class="ai-history-word">' + escapeHTML(wordDisplay) + '</span>';
html += '<span class="ai-history-msgcount">' + msgCount + ' 条对话</span>';
html += '<button class="ai-history-del-btn" data-idx="' + idx + '" title="删除这条对话" aria-label="删除这条对话"><span class="material-symbols-rounded">delete</span></button>';
html += '</div>';
html += '<div class="ai-history-preview">' + escapeHTML(preview || '点击继续对话。') + '</div>';
html += '<div class="ai-history-date">' + escapeHTML(conv.date) + '</div>';
html += '</div>';
    });
    listEl.innerHTML = html;
    
    listEl.querySelectorAll('.ai-history-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.ai-history-del-btn')) return;
            Hardware.vibrate(15);
            let idx = parseInt(card.dataset.idx);
            Controller.openAIChatFromTab(idx);
        });
    });
    listEl.querySelectorAll('.ai-history-del-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            Hardware.vibrate(20);
            let idx = parseInt(btn.dataset.idx);
            showConfirm('删除对话', '确定要删除这条对话记录吗？', () => {
                Model.aiConversations.splice(idx, 1);
                Controller._persistConversations();
                Controller.renderAIHistory();
                showToast('已删除');
            });
        });
    });
},

openAIHistoryDetail(idx) {
    this.openAIChatFromTab(idx);
},

openAIChatFromTab(idx) {
    let conv = Model.aiConversations[idx];
    if (!conv) return;
    let listView = View.getEl('ai-list-view');
    let chatView = View.getEl('ai-chat-view');
    let messagesEl = View.getEl('ai-tab-chat-messages');
    let titleEl = View.getEl('ai-chat-view-title');
    let inputEl = View.getEl('ai-tab-chat-input');
    if (!messagesEl || !chatView || !listView) return;
    
    this.aiTabChat.activeIdx = idx;

    this.aiTabChat.messages =
        conv.messages
            ? [...conv.messages]
            : [];

    this.aiTabChat.cacheKey =
        conv.cacheKey || '';

    this.aiTabChat.sentence =
        conv.sentence || '';

    this.aiTabChat.lang =
        conv.lang === 'en'
            ? 'en'
            : 'ja';

    const hasPreset =
        !!AI_CHAT_PRESETS[
            conv.presetId
        ];

    const isLegacyFreeChat =
        !conv.presetId &&
        String(
            conv.cacheKey || ''
        ).startsWith('free_');

    this.aiTabChat.presetId =
        hasPreset
            ? conv.presetId
            : (
                isLegacyFreeChat
                    ? 'free'
                    : ''
            );

    const preset =
        AI_CHAT_PRESETS[
            this.aiTabChat.presetId
        ];

    this.aiTabChat.word =
        conv.word ||
        (
            preset
                ? preset.title
                : ''
        );

    this.aiTabChat.systemPrompt =
        conv.systemPrompt ||
        (
            preset
                ? buildAIChatSystemPrompt(
                    this.aiTabChat.presetId,
                    this.aiTabChat.lang
                )
                : ''
        );

    if (titleEl) {
        titleEl.textContent =
            this.getAITabChatTitle();
    }

    if (inputEl) {
        inputEl.value = '';
    }
    
    let html = '';
    let msgs = this.aiTabChat.messages;
if (msgs && msgs.length > 0) {
    msgs.forEach(msg => {
        if (msg.role === 'assistant') {
            let renderText = renderAIMessageHTML(msg.content, conv.word || '');
            html += '<div class="ai-chat-bubble ai-chat-bubble-ai"><div class="ai-chat-bubble-text ai-response-box">' + renderText + '</div></div>';
        } else if (msg.role === 'user') {
            html += '<div class="ai-chat-bubble ai-chat-bubble-user"><div class="ai-chat-bubble-text">' + escapeHTML(msg.content) + '</div></div>';
        }
    });
}
    messagesEl.innerHTML = html;
    this.renderAITabWelcome();
    
    listView.classList.add('hidden');
    chatView.classList.remove('hidden');
    setTimeout(() => {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 100);
},

closeAITabChat() {
    if (this.aiTabChat.activeIdx !== -1) {
        this._saveTabChat();
    }
    this.aiTabChat.activeIdx = -1;
    this.aiTabChat.messages = [];
    this.aiTabChat.systemPrompt = '';
    this.aiTabChat.cacheKey = '';
    this.aiTabChat.sentence = '';
    this.aiTabChat.word = '';
    this.aiTabChat.presetId = '';

    this.aiTabChat.lang =
        Model.state.currentLangMode === 'en'
            ? 'en'
            : 'ja';

    this.renderAIHistory();
},

_saveTabChat() {
    if (this.aiTabChat.activeIdx === -1 || this.aiTabChat.messages.length === 0) return;
    let idx = this.aiTabChat.activeIdx;
    if (idx >= Model.aiConversations.length) return;
    let conv = Model.aiConversations[idx];
    conv.messages =
        [...this.aiTabChat.messages];

    conv.systemPrompt =
        this.aiTabChat.systemPrompt;

    conv.presetId =
        this.aiTabChat.presetId || '';

    conv.word =
        this.aiTabChat.word ||
        conv.word ||
        '';

    conv.lang =
        this.aiTabChat.lang ||
        conv.lang ||
        'ja';

    conv.sentence =
        this.aiTabChat.sentence || '';

    conv.cacheKey =
        this.aiTabChat.cacheKey ||
        conv.cacheKey ||
        '';

    conv.date =
        new Date()
            .toLocaleDateString('zh-CN') +
        ' ' +
        new Date()
            .toLocaleTimeString(
                'zh-CN',
                {
                    hour: '2-digit',
                    minute: '2-digit'
                }
            );
    Model.aiConversations[idx] = conv;
    this._persistConversations();
},

sendAITabMessage() {
    let inputEl = View.getEl('ai-tab-chat-input');
    let messagesEl = View.getEl('ai-tab-chat-messages');
    let sendBtn = View.getEl('ai-tab-chat-send');
    if (!inputEl || !messagesEl) return;
    let text = inputEl.value.trim();
    if (!text) return;
        let apiKey = localStorage.getItem('deepseekApiKey');

    if (!apiKey) {
        const self = this;

        Hardware.vibrate(20);

        const promptTitle =
            document.getElementById('prompt-title');

        const promptHelper =
            document.getElementById('prompt-helper');

        const promptIcon =
            document.getElementById('prompt-icon');

        const visibilityBtn =
            document.getElementById('prompt-visibility');

        const promptInput =
            document.getElementById('prompt-input');

        promptTitle.textContent =
            '配置 DeepSeek API Key';

        promptHelper.textContent =
            '密钥会保存在当前设备，并仅用于发送 AI 请求。';

        promptHelper.hidden = false;

        promptIcon.textContent = 'vpn_key';

        promptInput.type = 'password';
        promptInput.autocomplete = 'new-password';
        promptInput.placeholder =
            '粘贴 API Key（sk-…）';

        promptInput.value = '';

        visibilityBtn.hidden = false;
        visibilityBtn.title = '显示密钥';

        visibilityBtn.setAttribute(
            'aria-label',
            '显示密钥'
        );

        const visibilityIcon =
            visibilityBtn.querySelector(
                '.material-symbols-rounded'
            );

        if (visibilityIcon) {
            visibilityIcon.textContent = 'visibility';
        }

        window.toggleModal(
            'prompt-overlay',
            true
        );

        setTimeout(() => {
            promptInput.focus();
        }, 100);

        document.getElementById(
            'prompt-confirm'
        ).onclick = () => {
            Hardware.vibrate(15);

            const value =
                promptInput.value.trim();

            if (!value) {
                return;
            }

            localStorage.setItem(
                'deepseekApiKey',
                value
            );

            const settingInput =
                View.getEl('setting-ai-key');

            if (settingInput) {
                settingInput.value = value;
            }

            window.toggleModal(
                'prompt-overlay',
                false
            );

            showToast('API Key 已保存');

            /*
             * 输入框里的消息仍然保留，
             * 保存密钥后自动重新执行发送。
             */
            self.sendAITabMessage();
        };

        document.getElementById(
            'prompt-cancel'
        ).onclick = () => {
            Hardware.vibrate(10);

            window.toggleModal(
                'prompt-overlay',
                false
            );
        };

        return;
    }

    inputEl.value = '';
    if (sendBtn) sendBtn.disabled = true;
    
    this.aiTabChat.messages.push({
        role: 'user',
        content: text
    });

    this.renderAITabWelcome();
    
    let userBubble =
        document.createElement('div');
    userBubble.className = 'ai-chat-bubble ai-chat-bubble-user';
    userBubble.innerHTML = '<div class="ai-chat-bubble-text">' + escapeHTML(text) + '</div>';
    messagesEl.appendChild(userBubble);
    
    let aiBubble = document.createElement('div');
    aiBubble.className =
        'ai-chat-bubble ai-chat-bubble-ai is-thinking';

    aiBubble.innerHTML =
        '<div class="ai-chat-bubble-text">' +
            '<div class="ai-thinking-indicator" role="status" aria-label="AI 正在思考">' +
                '<span></span><span></span><span></span>' +
            '</div>' +
        '</div>';
    messagesEl.appendChild(aiBubble);
    this._scrollTabChatToBottom();
    
    let messagesToSend = [
    {
        role: 'system',
        content: this.aiTabChat.lang === 'ja'
    ? withJapaneseRubyInstruction(
        this.aiTabChat.systemPrompt
    )
    : this.aiTabChat.systemPrompt
    },
            ...this.aiTabChat.messages
];
    this._streamTabChatResponse(apiKey, aiBubble, sendBtn);
},

async _streamTabChatResponse(apiKey, aiBubble, sendBtn) {
    let messagesToSend = [
    {
        role: 'system',
        content: this.aiTabChat.lang === 'ja'
    ? withJapaneseRubyInstruction(
        this.aiTabChat.systemPrompt
    )
    : this.aiTabChat.systemPrompt
    },
            ...this.aiTabChat.messages
];
    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ model: 'deepseek-chat', messages: messagesToSend, stream: true })
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                aiBubble.innerHTML = '<div class="ai-chat-bubble-text" style="text-align:center; color:var(--accent-red);"><span class="material-symbols-rounded" style="font-size:2rem; opacity:0.5; display:block; margin-bottom:8px;">key_off</span>API Key 无效或余额不足</div>';
                if (sendBtn) sendBtn.disabled = false;
                return;
            }
            throw new Error('网络请求失败');
        }
        
        aiBubble.classList.remove(
            'is-thinking',
            'is-complete'
        );

        aiBubble.classList.add(
            'is-streaming'
        );

        let fullText = '';

        let textDiv =
            document.createElement('div');

        textDiv.className =
            'ai-chat-bubble-text ai-response-box';

        aiBubble.innerHTML = '';
        aiBubble.appendChild(textDiv);
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        
        while (true) {
            const { done, value } =
                await reader.read();

            if (done) {
                break;
            }

            let chunkStr =
                decoder.decode(
                    value,
                    { stream: true }
                );

            let lines =
                chunkStr.split('\n');

            for (let line of lines) {
                line = line.trim();

                if (
                    line.startsWith('data: ') &&
                    line !== 'data: [DONE]'
                ) {
                    try {
                        let data =
                            JSON.parse(
                                line.slice(6)
                            );

                        let chunk =
                            data.choices[0]
                                .delta.content;

                        if (chunk) {
                            fullText += chunk;

                            textDiv.innerHTML =
                                renderAIMessageHTML(
                                    fullText,
                                    this.aiTabChat.word || ''
                                );

                            this._scrollTabChatToBottom();
                        }
                    } catch (e) {}
                }
            }
        }

        /*
         * 主 AI 对话结束后，
         * 使用完整文本再渲染一次。
         */
        textDiv.innerHTML =
            renderAIMessageHTML(
                fullText,
                this.aiTabChat.word || ''
            );

        this._scrollTabChatToBottom();
        
        aiBubble.classList.remove(
            'is-streaming'
        );

        aiBubble.classList.add(
            'is-complete'
        );

        this.aiTabChat.messages.push({
            role: 'assistant',
            content: fullText
        });

        this._appendAIResponseActions(
            aiBubble,
            {
                scope: 'tab',
                presetId: this.aiTabChat.presetId,
                lang: this.aiTabChat.lang,
                messages: [...this.aiTabChat.messages],
                responseText: fullText
            }
        );

        this._saveTabChat();

        if (sendBtn) {
            sendBtn.disabled = false;
        }
    } catch (err) {
        aiBubble.classList.remove(
            'is-thinking',
            'is-streaming'
        );

        aiBubble.innerHTML =
            '<div class="ai-chat-bubble-text" style="text-align:center; color:var(--accent-red);">连接失败</div>';

        if (sendBtn) {
            sendBtn.disabled = false;
        }
    }
},

_scrollTabChatToBottom() {
    let chatArea = View.getEl('ai-tab-chat-messages');
    if (chatArea) {
        setTimeout(() => { chatArea.scrollTop = chatArea.scrollHeight; }, 50);
    }
},

_scrollChatToBottom() {
    let chatArea = View.getEl('ai-chat-messages');
    if (chatArea) {
        setTimeout(() => { chatArea.scrollTop = chatArea.scrollHeight; }, 50);
    }
},

sendAIMessage() {
    let inputEl = View.getEl('ai-chat-input');
    let chatArea = View.getEl('ai-chat-messages');
    let sendBtn = View.getEl('ai-chat-send');
    if (!inputEl || !chatArea) return;
    let text = inputEl.value.trim();
    if (!text) return;
    let apiKey = localStorage.getItem('deepseekApiKey');
    if (!apiKey) return;
    
    inputEl.value = '';
    if (sendBtn) sendBtn.disabled = true;
    
    this.currentChat.messages.push({ role: 'user', content: text });
    let userBubble = document.createElement('div');
    userBubble.className = 'ai-chat-bubble ai-chat-bubble-user';
    userBubble.innerHTML = '<div class="ai-chat-bubble-text">' + escapeHTML(text) + '</div>';
    chatArea.appendChild(userBubble);
    
    let aiBubble = document.createElement('div');
    aiBubble.className =
        'ai-chat-bubble ai-chat-bubble-ai is-thinking';

    aiBubble.innerHTML =
        '<div class="ai-chat-bubble-text">' +
            '<div class="ai-thinking-indicator" role="status" aria-label="AI 正在思考">' +
                '<span></span><span></span><span></span>' +
            '</div>' +
        '</div>';
    chatArea.appendChild(aiBubble);
    this._scrollChatToBottom();
    
    let messagesToSend = [
    {
        role: 'system',
        content: withJapaneseRubyInstruction(this.currentChat.systemPrompt)
    },
    ...this.currentChat.messages
];
    this._streamChatResponse(apiKey, aiBubble, sendBtn);
},

_startChatStream(apiKey, chatArea, copyBtn, inputEl) {
    let messagesToSend = [{ role: 'system', content: this.currentChat.systemPrompt }];
    let aiBubble = chatArea.querySelector('.ai-chat-bubble-ai');
    if (!aiBubble) {
        aiBubble =
            document.createElement('div');

        aiBubble.className =
            'ai-chat-bubble ai-chat-bubble-ai is-thinking';

        aiBubble.innerHTML =
            '<div class="ai-chat-bubble-text">' +
                '<div class="ai-thinking-indicator" role="status" aria-label="AI 正在思考">' +
                    '<span></span><span></span><span></span>' +
                '</div>' +
            '</div>';

        chatArea.appendChild(aiBubble);
    }
    this._streamChatResponse(apiKey, aiBubble, null, copyBtn, inputEl);
},

async _streamChatResponse(
    apiKey,
    aiBubble,
    sendBtn,
    copyBtn,
    inputEl
) {
    const systemPrompt =
        this.currentChat.lang === 'ja'
            ? withJapaneseRubyInstruction(
                this.currentChat.systemPrompt
            )
            : this.currentChat.systemPrompt;

    let messagesToSend = [
        {
            role: 'system',
            content: systemPrompt
        },
        ...this.currentChat.messages
    ];
    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({ model: 'deepseek-chat', messages: messagesToSend, stream: true })
        });
        
        if (!response.ok) {
            if (response.status === 401) {
    aiBubble.innerHTML = '<div class="ai-chat-bubble-text" style="text-align:center; color:var(--accent-red);"><span class="material-symbols-rounded" style="font-size:2rem; opacity:0.5; display:block; margin-bottom:8px;">key_off</span>API Key 无效或余额不足<button id="ai-rekey-btn" class="btn-outline" style="margin-top:12px; width:auto; display:inline-flex; padding:10px 20px; border-color:var(--tertiary) !important; color:var(--tertiary) !important;"><span class="material-symbols-rounded">vpn_key</span> 重新输入 Key</button></div>';
    this._scrollChatToBottom();
    setTimeout(() => {
        let btn = document.getElementById('ai-rekey-btn');
        if (btn) btn.onclick = () => {
            let self = this;
            Hardware.vibrate(15);
            const promptTitle = document.getElementById('prompt-title');
const promptHelper = document.getElementById('prompt-helper');
const promptIcon = document.getElementById('prompt-icon');
const visibilityBtn = document.getElementById('prompt-visibility');
let pInput = document.getElementById('prompt-input');

promptTitle.textContent = '重新输入 API Key';

promptHelper.textContent =
    '新密钥会替换当前设备中保存的旧密钥。';
promptHelper.hidden = false;

promptIcon.textContent = 'vpn_key';

pInput.type = 'password';
pInput.autocomplete = 'new-password';
pInput.placeholder = '粘贴新的 API Key（sk-…）';
pInput.value = '';

visibilityBtn.hidden = false;
visibilityBtn.title = '显示密钥';
visibilityBtn.setAttribute('aria-label', '显示密钥');

const visibilityIcon =
    visibilityBtn.querySelector('.material-symbols-rounded');

if (visibilityIcon) {
    visibilityIcon.textContent = 'visibility';
}
            window.toggleModal('prompt-overlay', true);
            setTimeout(() => pInput.focus(), 100);
            document.getElementById('prompt-confirm').onclick = () => { 
                Hardware.vibrate(15);
                let val = pInput.value.trim(); 
                if(val) { 
                    localStorage.setItem('deepseekApiKey', val);
                    let sInput = View.getEl('setting-ai-key');
                    if (sInput) sInput.value = val;
                    window.toggleModal('prompt-overlay', false);
                    showToast('API Key 已更新，请重新点击 AI 解析');
                }
            };
            document.getElementById('prompt-cancel').onclick = () => { Hardware.vibrate(10); window.toggleModal('prompt-overlay', false); };
        };
    }, 100);
    if (sendBtn) sendBtn.disabled = false;
    return;
}
            throw new Error('网络请求失败: 错误码 ' + response.status);
        }
        
        aiBubble.classList.remove(
            'is-thinking',
            'is-complete'
        );

        aiBubble.classList.add(
            'is-streaming'
        );

        let fullText = '';

        let textDiv =
            document.createElement('div');

        textDiv.className =
            'ai-chat-bubble-text ai-response-box';

        aiBubble.innerHTML = '';
        aiBubble.appendChild(textDiv);
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            let chunkStr = decoder.decode(value, {stream: true});
            let lines = chunkStr.split('\n');
            for (let line of lines) {
                line = line.trim();
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                        let data = JSON.parse(line.slice(6));
                        let chunk = data.choices[0].delta.content;
                        if (chunk) {
                            fullText += chunk;
                            textDiv.innerHTML = renderAIMessageHTML(fullText, this.currentChat.word || '');
this._scrollChatToBottom();
                        }
                    } catch (e) {}
                }
            }
        }

        /*
         * 例句继续追问结束后，
         * 使用完整文本再渲染一次。
         */
        textDiv.innerHTML =
            renderAIMessageHTML(
                fullText,
                this.currentChat.word || ''
            );

        this._scrollChatToBottom();
        
        aiBubble.classList.remove(
            'is-streaming'
        );

        aiBubble.classList.add(
            'is-complete'
        );

        this.currentChat.messages.push({
            role: 'assistant',
            content: fullText
        });

        this._appendAIResponseActions(
            aiBubble,
            {
                scope: 'sheet',
                word: this.currentChat.word || '',
                wordIndex: this.currentChat.wordIndex,
                lang: this.currentChat.lang || 'ja',
                messages: [...this.currentChat.messages],
                responseText: fullText
            }
        );
        
                if (this.currentChat.cacheKey && this.currentChat.messages.length === 1) {
            let chatArea = View.getEl('ai-chat-messages');
            if (chatArea) {
                Controller.aiCache[this.currentChat.cacheKey] = chatArea.innerHTML;
            }
        }
        if (copyBtn) copyBtn.style.display = 'flex';
        if (sendBtn) sendBtn.disabled = false;

    } catch (err) {
        aiBubble.classList.remove(
            'is-thinking',
            'is-streaming'
        );

        aiBubble.innerHTML =
            '<div class="ai-chat-bubble-text" style="text-align:center; color:var(--accent-red);">' +
                '<span class="material-symbols-rounded" style="font-size:2rem; opacity:0.5; display:block; margin-bottom:8px;">wifi_off</span>' +
                '连接失败：' +
                escapeHTML(err.message) +
            '</div>';

        if (sendBtn) {
            sendBtn.disabled = false;
        }
    }
},

async callDeepSeekStream(
    sentence,
    word,
    lang,
    apiKey,
    container,
    cacheKey,
    copyBtn
) {
    const isEnglish = lang === 'en';

    const prompt = isEnglish
        ? `你是精通英语教学的私人外教。请解析以下英文例句。

目标词汇：${word}
例句：${sentence}

语言规则：
1. 除中文讲解和中文翻译外，只能输出英语。
2. 禁止输出日语、日语假名或日语例句。
3. 举一反三只能生成英语例句和中文翻译。

请严格按以下结构输出：

### 🔪 骨架拆解
（用中文简明拆解英文句子的语法结构。）

### 💡 核心亮点
（用中文指出英文中的地道表达、搭配或语法特点。）

### ✍️ 举一反三
（使用目标词汇 "${word}" 生成2个简短、常用的英语生活例句。每条例句单独占一行，并严格写成“英语例句 / 中文翻译”。不要编号，禁止出现日语。）`
        : `你是精通日语教学的私人外教。请解析以下日语例句。

目标词汇：${word}
例句：${sentence}

语言规则：
1. 讲解和翻译使用中文。
2. 举一反三只能生成日语例句和中文翻译。
3. 日语汉字必须按系统规则标注假名。

请严格按以下结构输出：

### 🔪 骨架拆解
（用中文简明拆解日语句子的语法结构。）

### 💡 核心亮点
（用中文指出地道表达、搭配或语法特点。）

### ✍️ 举一反三
（使用目标词汇 "${word}" 生成2个简短、常用的日语生活例句。每条例句单独占一行，并严格写成“日语例句 / 中文翻译”。不要编号。）`;
    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [
        {
            role: 'user',
            content: isEnglish
                ? prompt
                : withJapaneseRubyInstruction(prompt)
        }
    ],
    stream: true
})
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                container.innerHTML = '<div style="text-align:center; padding: 40px 20px; color: var(--accent-red);"><span class="material-symbols-rounded" style="font-size:3rem; opacity:0.5;">key_off</span><div style="font-weight:800; margin-top:16px;">API Key 无效或余额不足</div><button id="ai-goto-settings" class="btn-outline" style="margin-top:20px; width:auto; display:inline-flex; padding:12px 28px; border-color:var(--tertiary) !important; color:var(--tertiary) !important;"><span class="material-symbols-rounded">settings</span> 前往设置修改</button></div>';
                setTimeout(() => {
                    let btn = document.getElementById('ai-goto-settings');
                    if (btn) btn.onclick = () => {
                        window.toggleModal('ai-sheet-overlay', false);
                        Nav.switchTab('tab-settings', 'settings|環境設定', document.querySelector('[data-target="tab-settings"]'));
                    };
                }, 100);
                return;
            }
            throw new Error('网络请求失败: 错误码 ' + response.status);
        }
        
        container.innerHTML = '<div class="ai-response-box"></div>';
        let box = container.querySelector('.ai-response-box');
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            let chunkStr = decoder.decode(value, {stream: true});
            let lines = chunkStr.split('\n');
            for (let line of lines) {
                line = line.trim();
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                        let data = JSON.parse(line.slice(6));
                        let chunk = data.choices[0].delta.content;
                        if (chunk) {
                            fullText += chunk;
                            box.innerHTML = renderAIMessageHTML(fullText, word || '');
container.scrollTop = container.scrollHeight;
                        }
                    } catch (e) {}
                }
            }
        }

        /*
         * 流式输出结束后，
         * 使用完整文本再渲染一次。
         *
         * 防止最后一个注音刚好跨越两个数据片段，
         * 导致页面停留在半完成状态。
         */
        box.innerHTML =
            renderAIMessageHTML(
                fullText,
                word || ''
            );

        container.scrollTop =
            container.scrollHeight;

        if (cacheKey && fullText) {
            Controller.aiCache[cacheKey] =
                container.innerHTML;
        }
        if (copyBtn) {
            copyBtn.style.display = 'flex';
        }
    } catch (err) {
        container.innerHTML = '<div style="text-align:center; padding: 40px 20px; color: var(--accent-red);"><span class="material-symbols-rounded" style="font-size:3rem; opacity:0.5;">wifi_off</span><div style="font-weight:800; margin-top:16px;">连接失败</div><div style="opacity:0.7; margin-top:8px;">' + escapeHTML(err.message) + '</div></div>';
    }
}
};

/* ==========================================
   第二、三轮增强：智能错题、结构化 AI 小测、
   可撤销删除、七天回收站与分组设置页
   ========================================== */
(() => {
    const WRONG_BOOK_KEY = 'wrongBook_v1';
    const AI_QUIZ_HISTORY_KEY = 'aiQuizHistory_v1';
    const RECYCLE_BIN_KEY = 'recycleBin_v1';
    const TRASH_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

    const WRONG_DIMENSION_LABELS = Object.freeze({
        spell: '拼写',
        listening: '听力',
        reading: '读音',
        meaning: '释义',
        usage: '用法',
        grammar: '语法'
    });

    const deepClone = value => {
        if (typeof structuredClone === 'function') {
            try {
                return structuredClone(value);
            } catch (error) {}
        }

        return JSON.parse(JSON.stringify(value));
    };

    const makeId = prefix => {
        if (
            typeof crypto !== 'undefined' &&
            typeof crypto.randomUUID === 'function'
        ) {
            return `${prefix}_${crypto.randomUUID()}`;
        }

        return (
            `${prefix}_${Date.now().toString(36)}_` +
            Math.random().toString(36).slice(2, 10)
        );
    };

    const ensureWordId = word => {
        return ensureStableWordId(word, {
            builtInHint: word?.builtIn === true
        });
    };

    const normalizeAnswer = value => {
        return String(value ?? '')
            .normalize('NFKC')
            .trim()
            .toLowerCase()
            .replace(/[\s\u3000]+/g, ' ')
            .replace(
                /[。．.!！?？,，;；:'"“”‘’()（）\[\]【】]/g,
                ''
            );
    };

    const formatRelativeDate = value => {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '时间未知';
        }

        const elapsed = Date.now() - date.getTime();

        if (elapsed < 60 * 1000) {
            return '刚刚';
        }

        if (elapsed < 60 * 60 * 1000) {
            return `${Math.floor(elapsed / 60000)} 分钟前`;
        }

        if (elapsed < 24 * 60 * 60 * 1000) {
            return `${Math.floor(elapsed / 3600000)} 小时前`;
        }

        return `${Math.floor(elapsed / 86400000)} 天前`;
    };

    let actionToastTimer = null;
    let actionToastCallback = null;

    window.showActionToast = (
        message,
        actionLabel = '',
        callback = null,
        duration = 5500
    ) => {
        const toast = document.getElementById('action-toast');
        const messageEl = document.getElementById(
            'action-toast-message'
        );
        const actionBtn = document.getElementById(
            'action-toast-action'
        );

        if (!toast || !messageEl || !actionBtn) {
            showToast(message);
            return;
        }

        if (actionToastTimer) {
            window.clearTimeout(actionToastTimer);
            actionToastTimer = null;
        }

        actionToastCallback =
            typeof callback === 'function'
                ? callback
                : null;

        messageEl.textContent = message;
        actionBtn.textContent = actionLabel;
        actionBtn.hidden = !actionLabel || !actionToastCallback;
        toast.classList.add('show');

        actionToastTimer = window.setTimeout(() => {
            toast.classList.remove('show');
            actionToastCallback = null;
            actionToastTimer = null;
        }, duration);
    };

    Model.wrongBook = Model.wrongBook || {};
    Model.aiQuizHistory = Model.aiQuizHistory || [];
    Model.recycleBin = Model.recycleBin || [];
    Model.state.isWrongBookPractice = false;

    Model.saveWrongBook = function() {
        return this.writeStorageValue(
            WRONG_BOOK_KEY,
            this.wrongBook
        );
    };

    Model.saveAIQuizHistory = function() {
        return this.writeStorageValue(
            AI_QUIZ_HISTORY_KEY,
            this.aiQuizHistory
        );
    };

    Model.saveRecycleBin = function() {
        return this.writeStorageValue(
            RECYCLE_BIN_KEY,
            this.recycleBin
        );
    };

    Model.cleanupRecycleBin = function() {
        const now = Date.now();
        const oldLength = this.recycleBin.length;

        this.recycleBin = this.recycleBin.filter(item => {
            const expiresAt = Number(item.expiresAt) || 0;
            return !expiresAt || expiresAt > now;
        });

        if (this.recycleBin.length !== oldLength) {
            this.saveRecycleBin();
        }
    };

    Model.getWrongRecord = function(word, create = false) {
        if (!word) {
            return null;
        }

        const wordId = ensureWordId(word);

        if (!this.wrongBook[wordId] && create) {
            this.wrongBook[wordId] = {
                wordId,
                word: word.word || '',
                lang: word.lang || 'ja',
                folder: word.folder || '',
                totalWrong: 0,
                totalCorrect: 0,
                dimensions: {
                    spell: 0,
                    listening: 0,
                    reading: 0,
                    meaning: 0,
                    usage: 0,
                    grammar: 0
                },
                sourceCounts: {
                    study: 0,
                    filter: 0,
                    aiQuiz: 0
                },
                recentAnswers: [],
                correctStreak: 0,
                lastWrongAt: '',
                lastCorrectAt: '',
                status: 'new'
            };
        }

        const record = this.wrongBook[wordId] || null;

        if (!record) {
            return null;
        }

        record.wordId = wordId;
        record.word = word.word || record.word || '';
        record.lang = word.lang || record.lang || 'ja';
        record.folder = word.folder || record.folder || '';
        record.totalWrong = Number(record.totalWrong) || 0;
        record.totalCorrect = Number(record.totalCorrect) || 0;
        record.correctStreak = Number(record.correctStreak) || 0;
        record.status = record.status || 'new';
        record.dimensions = {
            spell: 0,
            listening: 0,
            reading: 0,
            meaning: 0,
            usage: 0,
            grammar: 0,
            ...(record.dimensions || {})
        };
        record.sourceCounts = {
            study: 0,
            filter: 0,
            aiQuiz: 0,
            ...(record.sourceCounts || {})
        };
        record.recentAnswers = Array.isArray(record.recentAnswers)
            ? record.recentAnswers
            : [];

        return record;
    };

    Model.recordStudyResult = function({
        word,
        dimension = 'meaning',
        correct = false,
        userAnswer = '',
        correctAnswer = '',
        source = 'study',
        question = ''
    }) {
        if (
            !word ||
            localStorage.getItem('wrongBookEnabled') === 'false'
        ) {
            return;
        }

        const safeDimension = Object.prototype.hasOwnProperty.call(
            WRONG_DIMENSION_LABELS,
            dimension
        )
            ? dimension
            : 'meaning';

        const existing = this.getWrongRecord(word, false);

        if (correct && !existing) {
            return;
        }

        const record = existing || this.getWrongRecord(word, true);
        const now = new Date().toISOString();

        if (correct) {
            record.totalCorrect++;
            record.correctStreak++;
            record.lastCorrectAt = now;

            if (record.correctStreak >= 3) {
                record.status = 'resolved';
            } else {
                record.status = 'reinforcing';
            }
        } else {
            record.totalWrong++;
            record.correctStreak = 0;
            record.lastWrongAt = now;
            record.status =
                record.totalWrong >= 3
                    ? 'repeated'
                    : 'new';
            record.dimensions[safeDimension] =
                (record.dimensions[safeDimension] || 0) + 1;
            record.sourceCounts[source] =
                (record.sourceCounts[source] || 0) + 1;
        }

        record.recentAnswers.unshift({
            at: now,
            correct: Boolean(correct),
            dimension: safeDimension,
            userAnswer: String(userAnswer || ''),
            correctAnswer: String(correctAnswer || ''),
            source,
            question: String(question || '')
        });

        record.recentAnswers = record.recentAnswers.slice(0, 20);
        this.saveWrongBook();
    };

    Model.addRecycleItem = function(kind, payload, label, batchId = '') {
        const now = Date.now();
        const item = {
            id: makeId('trash'),
            batchId,
            kind,
            label: String(label || '已删除项目'),
            deletedAt: new Date(now).toISOString(),
            expiresAt: now + TRASH_RETENTION_MS,
            payload: deepClone(payload)
        };

        this.recycleBin.unshift(item);
        this.recycleBin = this.recycleBin.slice(0, 300);
        this.saveRecycleBin();
        return item;
    };

    const originalModelInit = Model.init.bind(Model);
    Model.init = async function() {
        await originalModelInit();

        this.wrongBook =
            (await this.readStorageValue(WRONG_BOOK_KEY)) || {};
        this.aiQuizHistory =
            (await this.readStorageValue(AI_QUIZ_HISTORY_KEY)) || [];
        this.recycleBin =
            (await this.readStorageValue(RECYCLE_BIN_KEY)) || [];

        if (!Array.isArray(this.aiQuizHistory)) {
            this.aiQuizHistory = [];
        }

        if (!Array.isArray(this.recycleBin)) {
            this.recycleBin = [];
        }

        if (
            !this.wrongBook ||
            typeof this.wrongBook !== 'object' ||
            Array.isArray(this.wrongBook)
        ) {
            this.wrongBook = {};
        }

        let dbChanged = false;
        this.db.forEach(word => {
            if (!word._id) {
                ensureWordId(word);
                dbChanged = true;
            }
        });

        const validWordIds = new Set(
            this.db.map(word => ensureWordId(word))
        );

        Object.entries(this.wrongBook).forEach(([wordId, record]) => {
            if (validWordIds.has(wordId)) {
                return;
            }

            const matchedWord = this.db.find(word => {
                if (!record || typeof record !== 'object') {
                    return false;
                }

                return (
                    String(word.word || '') === String(record.word || '') &&
                    (word.lang || 'ja') === (record.lang || 'ja') &&
                    (
                        !record.folder ||
                        word.folder === record.folder
                    )
                );
            });

            if (matchedWord) {
                const nextId = this.getWordId(matchedWord);

                if (!this.wrongBook[nextId]) {
                    this.wrongBook[nextId] = {
                        ...record,
                        wordId: nextId
                    };
                }
            }

            delete this.wrongBook[wordId];
        });

        this.cleanupRecycleBin();

        if (dbChanged) {
            await this.saveDB();
        }

        await Promise.all([
            this.saveWrongBook(),
            this.saveAIQuizHistory(),
            this.saveRecycleBin()
        ]);
    };

    const originalSaveDB = Model.saveDB.bind(Model);
    Model.saveDB = function() {
        this.db.forEach(word => ensureWordId(word));
        return originalSaveDB();
    };

    const originalSaveAllUserData =
        Model.saveAllUserData.bind(Model);
    Model.saveAllUserData = async function() {
        await originalSaveAllUserData();
        await Promise.all([
            this.saveWrongBook(),
            this.saveAIQuizHistory(),
            this.saveRecycleBin()
        ]);
    };

    const originalCheckFilter = Model.checkFilter.bind(Model);
    Model.checkFilter = function(word, filterName) {
        const record = this.getWrongRecord(word, false);
        const hasActiveWrong = Boolean(
            record &&
            record.totalWrong > 0 &&
            record.status !== 'resolved'
        );

        if (filterName === 'virtual_wrong_all') {
            return hasActiveWrong;
        }

        if (filterName === 'virtual_wrong_spell') {
            return hasActiveWrong && record.dimensions.spell > 0;
        }

        if (filterName === 'virtual_wrong_listening') {
            return hasActiveWrong && record.dimensions.listening > 0;
        }

        if (filterName === 'virtual_wrong_reading') {
            return hasActiveWrong && record.dimensions.reading > 0;
        }

        if (filterName === 'virtual_wrong_meaning') {
            return hasActiveWrong && record.dimensions.meaning > 0;
        }

        if (filterName === 'virtual_wrong_ai') {
            return hasActiveWrong && record.sourceCounts.aiQuiz > 0;
        }

        if (filterName === 'virtual_wrong_repeated') {
            return record?.status === 'repeated';
        }

        if (filterName === 'virtual_wrong_resolved') {
            return record?.status === 'resolved';
        }

        return originalCheckFilter(word, filterName);
    };

    const originalUpdateFilteredDb =
        Model.updateFilteredDb.bind(Model);
    Model.updateFilteredDb = function(searchQuery, currentFilter) {
        originalUpdateFilteredDb(searchQuery, currentFilter);

        if (!String(currentFilter).startsWith('virtual_wrong_')) {
            return;
        }

        const hint = this.state.filteredDb.find(item => item.idx === -999);
        const words = this.state.filteredDb.filter(item => item.idx !== -999);
        const weight = {
            repeated: 4,
            new: 3,
            reinforcing: 2,
            resolved: 1
        };

        words.sort((a, b) => {
            const aRecord = this.getWrongRecord(a.w, false) || {};
            const bRecord = this.getWrongRecord(b.w, false) || {};
            const statusDiff =
                (weight[bRecord.status] || 0) -
                (weight[aRecord.status] || 0);

            if (statusDiff) {
                return statusDiff;
            }

            return (
                (bRecord.totalWrong || 0) -
                (aRecord.totalWrong || 0)
            );
        });

        this.state.filteredDb = hint ? [hint, ...words] : words;
    };

    const ensureWrongBookOptions = () => {
        const select = View.getEl('wb-folder-filter');

        if (!select) {
            return;
        }

        const options = [
            ['智能错题本', 'virtual_wrong_all'],
            ['错题 · 拼写', 'virtual_wrong_spell'],
            ['错题 · 听力', 'virtual_wrong_listening'],
            ['错题 · 读音', 'virtual_wrong_reading'],
            ['错题 · 释义', 'virtual_wrong_meaning'],
            ['错题 · AI 小测', 'virtual_wrong_ai'],
            ['错题 · 反复出错', 'virtual_wrong_repeated'],
            ['错题 · 已解决', 'virtual_wrong_resolved']
        ];

        const insertBefore = Array.from(select.options).find(option => {
            return option.value === 'virtual_cleared';
        });

        options.forEach(([label, value]) => {
            if (select.querySelector(`option[value="${value}"]`)) {
                return;
            }

            const option = new Option(label, value);

            if (insertBefore) {
                select.insertBefore(option, insertBefore);
            } else {
                select.add(option);
            }
        });
    };

    const updateWrongToolbar = () => {
        const select = View.getEl('wb-folder-filter');
        const toolbar = View.getEl('wrongbook-toolbar');
        const count = View.getEl('wrongbook-count');

        if (!select || !toolbar || !count) {
            return;
        }

        const isWrong = String(select.value).startsWith('virtual_wrong_');
        toolbar.hidden = !isWrong;

        if (!isWrong) {
            return;
        }

        const amount = Model.db.filter(word => {
            return (
                (word.lang || 'ja') === Model.state.currentLangMode &&
                Model.checkFilter(word, select.value)
            );
        }).length;

        count.textContent = `${amount} 词`;
    };

    const originalUpdateWordbankUI = View.updateWordbankUI.bind(View);
    View.updateWordbankUI = function() {
        const result = originalUpdateWordbankUI();
        ensureWrongBookOptions();
        updateWrongToolbar();
        return result;
    };

    const renderWrongSummary = word => {
        const container = View.getEl('dt-wrong-summary');

        if (!container) {
            return;
        }

        const record = Model.getWrongRecord(word, false);

        if (!record || record.totalWrong <= 0) {
            container.hidden = true;
            container.innerHTML = '';
            return;
        }

        const statusText = {
            new: '新错题',
            repeated: '反复出错',
            reinforcing: '正在巩固',
            resolved: '已解决'
        }[record.status] || '待巩固';

        const dimensionText = Object.entries(record.dimensions)
            .filter(([, amount]) => amount > 0)
            .map(([dimension, amount]) => {
                return `${WRONG_DIMENSION_LABELS[dimension] || dimension} ${amount}`;
            })
            .join(' · ');

        const latestWrong = record.recentAnswers.find(item => {
            return !item.correct;
        });

        container.hidden = false;
        container.innerHTML = `
            <div class="dt-wrong-summary-head">
                <span class="material-symbols-rounded">error_med</span>
                <strong>${escapeHTML(statusText)}</strong>
                <span>${record.totalWrong} 次错误</span>
            </div>
            <div class="dt-wrong-summary-body">
                <div>${escapeHTML(dimensionText || '暂无维度明细')}</div>
                ${
                    latestWrong?.userAnswer
                        ? `<small>最近错误答案：${escapeHTML(latestWrong.userAnswer)}</small>`
                        : ''
                }
            </div>
        `;
    };

    const originalUpdateDetailContent =
        Controller.updateDetailContent.bind(Controller);
    Controller.updateDetailContent = function(word, triggerTTS = false) {
        const result = originalUpdateDetailContent(word, triggerTTS);

        /* 重新带上词条对象，确保英语 AI 解析不会回退到日语。 */
        View.renderExampleBox(
            word.example,
            'dt-example-box',
            'normal',
            word
        );

        renderWrongSummary(word);
        return result;
    };

    const resolveStudyDimension = (
        word,
        interaction,
        displayMode = ''
    ) => {
        const isEnglish = word?.lang === 'en';

        if (interaction === 'spell') {
            if (
                isEnglish &&
                Model.state.mode === 'memory-test' &&
                Model.state.mtRound === 2
            ) {
                return 'listening';
            }

            if (
                isEnglish &&
                Model.state.mode === 'rote-learning' &&
                displayMode === 'kana'
            ) {
                return 'listening';
            }

            return isEnglish ? 'spell' : 'reading';
        }

        if (Model.state.mode === 'dual-track') {
            return 'meaning';
        }

        if (displayMode === 'meaning') {
            return interaction === 'choice'
                ? isEnglish
                    ? 'spell'
                    : 'reading'
                : 'meaning';
        }

        if (displayMode === 'kana') {
            return Model.state.mtStep === 1
                ? isEnglish
                    ? 'listening'
                    : 'reading'
                : 'meaning';
        }

        return interaction === 'choice'
            ? 'meaning'
            : isEnglish
                ? 'spell'
                : 'reading';
    };

    const correctAnswerFor = (word, dimension) => {
        if (!word) {
            return '';
        }

        if (dimension === 'meaning') {
            return word.meaning || '';
        }

        if (dimension === 'reading') {
            return word.kana || '';
        }

        return word.word || '';
    };

    const originalFilterResult =
        Controller.processFilterTestResult.bind(Controller);
    Controller.processFilterTestResult = function(isCorrect) {
        const word = Model.db[
            Model.state.studyQueue[Model.state.currentIndex]
        ];
        let mode = View.getEl('test-display-select')?.value || 'kana';

        if (word?.lang === 'en' && mode === 'kana') {
            mode = 'word';
        }

        const dimension = {
            word: word?.lang === 'en' ? 'spell' : 'reading',
            kana: word?.lang === 'en' ? 'spell' : 'reading',
            audio: 'listening',
            meaning: 'meaning'
        }[mode] || 'meaning';

        const result = originalFilterResult(isCorrect);

        Model.recordStudyResult({
            word,
            dimension,
            correct: isCorrect,
            userAnswer: isCorrect ? '自评正确' : '自评错误',
            correctAnswer: correctAnswerFor(word, dimension),
            source: 'filter',
            question: '筛选检验'
        });

        return result;
    };

    const originalSpellConfirm =
        Controller.handleSpellConfirm.bind(Controller);
    Controller.handleSpellConfirm = function(inputEl, word, displayMode) {
        if (!word || Model.state.isAnimating) {
            return originalSpellConfirm(inputEl, word, displayMode);
        }

        const isEnglish = word.lang === 'en';
        const target = isEnglish
            ? String(word.word || '').toLowerCase().trim()
            : String(word.kana || '').replace(/[【】\[\]()]/g, '');
        const answer = isEnglish
            ? String(EnglishInput.buffer || '').toLowerCase().trim()
            : RomajiEngine.getFinalText();

        const result = originalSpellConfirm(inputEl, word, displayMode);

        if (answer) {
            const dimension = resolveStudyDimension(
                word,
                'spell',
                displayMode
            );

            Model.recordStudyResult({
                word,
                dimension,
                correct: answer === target,
                userAnswer: answer,
                correctAnswer: target,
                source: 'study',
                question: '键盘拼写'
            });
        }

        return result;
    };

    const originalDtChoice =
        Controller.handleDtChoiceClick.bind(Controller);
    Controller.handleDtChoiceClick = function(button, isCorrect) {
        const word = Model.db[
            Model.state.studyQueue[Model.state.currentIndex]
        ];
        const answer =
            button?.querySelector('span:last-child')?.textContent ||
            button?.textContent ||
            '';
        const result = originalDtChoice(button, isCorrect);

        Model.recordStudyResult({
            word,
            dimension: 'meaning',
            correct: isCorrect,
            userAnswer: answer,
            correctAnswer: word?.meaning || '',
            source: 'study',
            question: '往复测验释义选择'
        });

        return result;
    };

    const originalMtChoice =
        Controller.handleMtChoiceClick.bind(Controller);
    Controller.handleMtChoiceClick = function(
        button,
        isCorrect,
        word,
        displayMode
    ) {
        const dimension = resolveStudyDimension(
            word,
            'choice',
            displayMode
        );
        const answer =
            button?.querySelector('span:last-child')?.textContent ||
            button?.textContent ||
            '';
        const result = originalMtChoice(
            button,
            isCorrect,
            word,
            displayMode
        );

        Model.recordStudyResult({
            word,
            dimension,
            correct: isCorrect,
            userAnswer: answer,
            correctAnswer: correctAnswerFor(word, dimension),
            source: 'study',
            question: '循环强记或三轮通关选择题'
        });

        return result;
    };

    Controller.startWrongBookPractice = function() {
        const filter =
            View.getEl('wb-folder-filter')?.value ||
            'virtual_wrong_all';
        const words = Model.db
            .map((word, index) => ({ word, index }))
            .filter(item => {
                return (
                    (item.word.lang || 'ja') ===
                        Model.state.currentLangMode &&
                    Model.checkFilter(item.word, filter)
                );
            });

        if (words.length === 0) {
            showToast('当前错题分类里没有可练习的词');
            return;
        }

        words.sort((a, b) => {
            const aRecord = Model.getWrongRecord(a.word, false) || {};
            const bRecord = Model.getWrongRecord(b.word, false) || {};
            return (
                (bRecord.totalWrong || 0) -
                (aRecord.totalWrong || 0)
            );
        });

        const selected = words.slice(0, 20);
        Model.state.mode = 'dual-track';
        Model.state.isWrongBookPractice = true;
        Model.state.currentIndex = 0;
        Model.state.dtWordAppearanceMap = {};
        Model.state.currentWordFailed = false;
        Model.state.comboCount = 0;
        Model.state.maxProgressSeen = 0;
        Model.state.uniqueWordCount = selected.length;
        Model.state.currentGroupKey = 'wrongbook-practice';
        Model.state.currentGroupLabel = '错题专项';
        Model.state.studyQueue = [];

        selected.forEach(item => {
            Model.state.studyQueue.push(item.index, item.index);
        });

        Model.state.studyQueue.sort(() => Math.random() - 0.5);
        Model.state.initialQueueLength = Model.state.studyQueue.length;
        View.updateComboBadge();
        View.showPage('study-area');

        const matrix = View.getEl('pixel-matrix');
        if (matrix) {
            matrix.innerHTML = '';
        }

        View.renderStudyCard('none');
        Hardware.vibrate(40);
    };

    const originalFinishPendulum =
        Controller.finishPendulum.bind(Controller);
    Controller.finishPendulum = function() {
        if (!Model.state.isWrongBookPractice) {
            return originalFinishPendulum();
        }

        Model.state.isWrongBookPractice = false;
        showToast('错题专项完成，连续答对会逐步移出错题本');
        View.getEl('btn-exit-study')?.click();
    };

    /* ---------- 结构化 AI 小测 ---------- */
    Controller.aiQuizState = {
        sourcePayload: null,
        title: '',
        questions: [],
        currentIndex: 0,
        answers: [],
        selectedOption: '',
        startedAt: 0,
        completedAt: 0
    };

    Controller._resetAIQuizState = function() {
        this.aiQuizState = {
            sourcePayload: null,
            title: '',
            questions: [],
            currentIndex: 0,
            answers: [],
            selectedOption: '',
            startedAt: 0,
            completedAt: 0
        };
    };

    Controller._showAIQuizStage = function(stage) {
        const map = {
            loading: 'ai-quiz-loading',
            question: 'ai-quiz-question-stage',
            result: 'ai-quiz-result-stage'
        };

        Object.entries(map).forEach(([name, id]) => {
            const element = View.getEl(id);
            if (element) {
                element.hidden = name !== stage;
            }
        });
    };

    Controller._mapAIQuizTypeToDimension = function(question) {
        if (question.type === 'spell') {
            return question.lang === 'ja' ? 'reading' : 'spell';
        }

        if (question.type === 'meaning') {
            return 'meaning';
        }

        if (question.type === 'usage') {
            return 'usage';
        }

        return 'grammar';
    };

    Controller._findAIQuizWord = function(question) {
        if (!question.word) {
            return null;
        }

        const lang =
            question.lang === 'en' || question.lang === 'ja'
                ? question.lang
                : /[A-Za-z]/.test(question.word)
                    ? 'en'
                    : 'ja';
        const target = String(question.word).trim().toLowerCase();

        return (
            Model.db.find(word => {
                return (
                    (word.lang || 'ja') === lang &&
                    String(word.word || '').trim().toLowerCase() === target
                );
            }) || null
        );
    };

    Controller._startAIQuiz = async function(payload) {
        const sourceText = String(payload?.responseText || '').trim();

        if (!sourceText) {
            showToast('这条回答暂时无法生成小测');
            return;
        }

        this._resetAIQuizState();
        this.aiQuizState.sourcePayload = payload;
        this.aiQuizState.startedAt = Date.now();
        window.toggleModal('ai-quiz-overlay', true);
        this._showAIQuizStage('loading');

        const languageRule =
            payload?.lang === 'en'
                ? '题目可以包含英语，讲解使用中文，禁止出现日语。'
                : payload?.lang === 'ja'
                    ? '题目可以包含日语，讲解使用中文。'
                    : '根据原回答内容选择英语或日语，讲解使用中文。';

        const prompt = `
请根据下面的语言学习内容生成3道结构化小测题。

要求：
1. ${languageRule}
2. 题型从 spell、meaning、usage、grammar 中选择。
3. spell 使用 text；其他题型优先使用 choice。
4. choice 必须提供4个选项，answer 必须与其中一个选项完全一致。
5. word 填写题目对应的词典原形；纯语法题可以留空。
6. lang 只能是 en、ja 或空字符串。
7. explanation 使用简短中文。
8. 只输出 JSON，不要 Markdown，不要额外说明。

格式：
{"title":"本次小测","questions":[{"type":"meaning","word":"plan","lang":"en","prompt":"plan 的正确释义是？","answerMode":"choice","options":["计划；打算","飞机","平原","种植"],"answer":"计划；打算","explanation":"plan 作名词表示计划，作动词表示打算。"}]}

学习内容：
${sourceText.slice(0, 9000)}
        `.trim();

        try {
            const result = await this._requestAIJSON(prompt);
            const questions = (Array.isArray(result.questions)
                ? result.questions
                : [])
                .slice(0, 3)
                .map((item, index) => {
                    const answerMode =
                        item?.answerMode === 'text' ? 'text' : 'choice';
                    let options = answerMode === 'choice'
                        ? [...new Set(
                              (Array.isArray(item?.options)
                                  ? item.options
                                  : [])
                                  .map(option => String(option || '').trim())
                                  .filter(Boolean)
                          )].slice(0, 4)
                        : [];
                    const answer = String(item?.answer || '').trim();

                    if (
                        answerMode === 'choice' &&
                        answer &&
                        !options.includes(answer)
                    ) {
                        options.unshift(answer);
                    }

                    return {
                        id: makeId(`quiz_${index}`),
                        type: ['spell', 'meaning', 'usage', 'grammar'].includes(
                            item?.type
                        )
                            ? item.type
                            : 'meaning',
                        word: String(item?.word || '').trim(),
                        lang:
                            item?.lang === 'en' || item?.lang === 'ja'
                                ? item.lang
                                : '',
                        prompt: String(item?.prompt || '').trim(),
                        answerMode,
                        options: options.slice(0, 4),
                        answer,
                        explanation: String(item?.explanation || '').trim()
                    };
                })
                .filter(question => question.prompt && question.answer);

            if (questions.length === 0) {
                throw new Error('AI 没有生成有效题目');
            }

            this.aiQuizState.title = String(result.title || '本次小测');
            this.aiQuizState.questions = questions;
            this.aiQuizState.currentIndex = 0;
            this._renderAIQuizQuestion();
            this._showAIQuizStage('question');
        } catch (error) {
            console.error('[AI Quiz]', error);
            this._closeAIQuiz();
            showToast(error?.message || '小测生成失败，请稍后重试');
        }
    };

    Controller._renderAIQuizQuestion = function() {
        const state = this.aiQuizState;
        const question = state.questions[state.currentIndex];

        if (!question) {
            this._completeAIQuiz();
            return;
        }

        state.selectedOption = '';

        const progress = View.getEl('ai-quiz-progress');
        const title = View.getEl('ai-quiz-title');
        const type = View.getEl('ai-quiz-type');
        const prompt = View.getEl('ai-quiz-prompt');
        const word = View.getEl('ai-quiz-word');
        const options = View.getEl('ai-quiz-options');
        const inputWrap = View.getEl('ai-quiz-input-wrap');
        const input = View.getEl('ai-quiz-input');
        const feedback = View.getEl('ai-quiz-feedback');
        const submit = View.getEl('ai-quiz-submit');
        const next = View.getEl('ai-quiz-next');

        if (progress) {
            progress.textContent = `${state.currentIndex + 1} / ${state.questions.length}`;
        }
        if (title) {
            title.textContent = state.title;
        }
        if (type) {
            const dimension = this._mapAIQuizTypeToDimension(question);
            type.textContent = WRONG_DIMENSION_LABELS[dimension] || '小测';
        }
        if (prompt) {
            prompt.textContent = question.prompt;
        }
        if (word) {
            word.textContent = question.word;
            word.hidden = !question.word;
        }
        if (feedback) {
            feedback.hidden = true;
            feedback.className = 'ai-quiz-feedback';
            feedback.innerHTML = '';
        }
        if (submit) {
            submit.hidden = false;
            submit.disabled = false;
        }
        if (next) {
            next.hidden = true;
        }

        if (question.answerMode === 'choice') {
            if (inputWrap) {
                inputWrap.hidden = true;
            }
            if (options) {
                options.hidden = false;
                options.innerHTML = question.options
                    .map(option => {
                        return `
                            <button
                                type="button"
                                class="ai-quiz-option"
                                data-quiz-option="${escapeHTML(option)}"
                            >${escapeHTML(option)}</button>
                        `;
                    })
                    .join('');

                options
                    .querySelectorAll('.ai-quiz-option')
                    .forEach(button => {
                        button.addEventListener('click', () => {
                            options
                                .querySelectorAll('.ai-quiz-option')
                                .forEach(item => {
                                    item.classList.toggle(
                                        'selected',
                                        item === button
                                    );
                                });
                            state.selectedOption =
                                button.dataset.quizOption || '';
                        });
                    });
            }
        } else {
            if (options) {
                options.hidden = true;
                options.innerHTML = '';
            }
            if (inputWrap) {
                inputWrap.hidden = false;
            }
            if (input) {
                input.value = '';
                input.disabled = false;
                setTimeout(() => input.focus(), 80);
            }
        }
    };

    Controller._submitAIQuizAnswer = function() {
        const state = this.aiQuizState;
        const question = state.questions[state.currentIndex];

        if (!question) {
            return;
        }

        const input = View.getEl('ai-quiz-input');
        const userAnswer =
            question.answerMode === 'choice'
                ? state.selectedOption
                : String(input?.value || '').trim();

        if (!userAnswer) {
            showToast('请先作答');
            return;
        }

        const isCorrect =
            normalizeAnswer(userAnswer) === normalizeAnswer(question.answer);
        const matchedWord = this._findAIQuizWord(question);
        const dimension = this._mapAIQuizTypeToDimension(question);

        if (
            matchedWord &&
            localStorage.getItem('aiQuizRecord') !== 'false'
        ) {
            Model.recordStudyResult({
                word: matchedWord,
                dimension,
                correct: isCorrect,
                userAnswer,
                correctAnswer: question.answer,
                source: 'aiQuiz',
                question: question.prompt
            });
        }

        state.answers.push({
            questionId: question.id,
            type: question.type,
            dimension,
            word: question.word,
            lang: question.lang,
            prompt: question.prompt,
            userAnswer,
            correctAnswer: question.answer,
            explanation: question.explanation,
            isCorrect,
            matchedWordId: matchedWord?._id || ''
        });

        const feedback = View.getEl('ai-quiz-feedback');
        const submit = View.getEl('ai-quiz-submit');
        const next = View.getEl('ai-quiz-next');
        const options = View.getEl('ai-quiz-options');

        if (feedback) {
            feedback.hidden = false;
            feedback.className =
                `ai-quiz-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`;
            feedback.innerHTML = `
                <strong>${isCorrect ? '回答正确' : '回答错误'}</strong>
                ${
                    isCorrect
                        ? ''
                        : `<div>正确答案：${escapeHTML(question.answer)}</div>`
                }
                <p>${escapeHTML(question.explanation || '')}</p>
            `;
        }

        if (options) {
            options.querySelectorAll('.ai-quiz-option').forEach(button => {
                button.disabled = true;
                const option = button.dataset.quizOption || '';
                button.classList.toggle(
                    'is-answer',
                    normalizeAnswer(option) === normalizeAnswer(question.answer)
                );
                button.classList.toggle(
                    'is-wrong',
                    !isCorrect &&
                        normalizeAnswer(option) === normalizeAnswer(userAnswer)
                );
            });
        }

        if (input) {
            input.disabled = true;
        }
        if (submit) {
            submit.hidden = true;
        }
        if (next) {
            next.hidden = false;
            next.textContent =
                state.currentIndex >= state.questions.length - 1
                    ? '查看结果'
                    : '下一题';
        }
    };

    Controller._advanceAIQuiz = function() {
        const input = View.getEl('ai-quiz-input');
        if (input) {
            input.disabled = false;
        }

        this.aiQuizState.currentIndex++;

        if (
            this.aiQuizState.currentIndex >=
            this.aiQuizState.questions.length
        ) {
            this._completeAIQuiz();
            return;
        }

        this._renderAIQuizQuestion();
    };

    Controller._completeAIQuiz = function() {
        const state = this.aiQuizState;
        state.completedAt = Date.now();

        const correctCount = state.answers.filter(answer => {
            return answer.isCorrect;
        }).length;
        const wrongAnswers = state.answers.filter(answer => {
            return !answer.isCorrect;
        });
        const missingWords = wrongAnswers.filter(answer => {
            return answer.word && !answer.matchedWordId;
        });

        Model.aiQuizHistory.unshift({
            id: makeId('ai_quiz'),
            title: state.title,
            createdAt: new Date().toISOString(),
            durationMs: Math.max(0, state.completedAt - state.startedAt),
            total: state.answers.length,
            correct: correctCount,
            answers: deepClone(state.answers)
        });
        Model.aiQuizHistory = Model.aiQuizHistory.slice(0, 100);
        Model.saveAIQuizHistory();

        const score = View.getEl('ai-quiz-result-score');
        const weakList = View.getEl('ai-quiz-weak-list');
        const importButton = View.getEl('ai-quiz-import-missing');

        if (score) {
            score.textContent = `${correctCount} / ${state.answers.length}`;
        }

        if (weakList) {
            weakList.innerHTML = wrongAnswers.length
                ? wrongAnswers
                      .map(answer => {
                          const label =
                              WRONG_DIMENSION_LABELS[answer.dimension] ||
                              answer.dimension;
                          return `
                            <div class="ai-quiz-weak-item">
                                <div>
                                    <strong>${escapeHTML(answer.word || '语法题')}</strong>
                                    <span>${escapeHTML(label)}</span>
                                    ${
                                        answer.word && !answer.matchedWordId
                                            ? '<span class="ai-quiz-missing-tag">未入词库</span>'
                                            : ''
                                    }
                                </div>
                                <small>${escapeHTML(answer.prompt)}</small>
                            </div>
                          `;
                      })
                      .join('')
                : '<div class="ai-quiz-perfect">全部答对，表现很稳！</div>';
        }

        if (importButton) {
            importButton.hidden = missingWords.length === 0;
        }

        this._showAIQuizStage('result');
        updateSettingsStats();
    };

    Controller._openWrongBookFromQuiz = function() {
        this._closeAIQuiz();
        const navItem = document.querySelector(
            '.nav-item[data-target="tab-wordbank"]'
        );
        Nav.switchTab(
            'tab-wordbank',
            'grid_view|全景語彙',
            navItem
        );
        const filter = View.getEl('wb-folder-filter');

        if (filter) {
            filter.value = 'virtual_wrong_all';
            filter.dispatchEvent(new Event('facade-update'));
            filter.dispatchEvent(new Event('change'));
        }
    };

    Controller._importMissingAIQuizWords = function() {
        const missing = this.aiQuizState.answers
            .filter(answer => {
                return !answer.isCorrect && answer.word && !answer.matchedWordId;
            })
            .map(answer => {
                const lang =
                    answer.lang === 'en' || answer.lang === 'ja'
                        ? answer.lang
                        : /[A-Za-z]/.test(answer.word)
                            ? 'en'
                            : 'ja';
                return {
                    word: String(answer.word).trim(),
                    lang,
                    selected: true,
                    existingFolder: ''
                };
            })
            .filter((item, index, list) => {
                return (
                    item.word &&
                    list.findIndex(other => {
                        return other.lang === item.lang && other.word === item.word;
                    }) === index
                );
            });

        if (!missing.length) {
            showToast('没有需要加入的词汇');
            return;
        }

        this._closeAIQuiz();
        this._resetAIWordCollection();
        this.aiWordCollection.candidates = missing;
        this._renderAIWordCandidates();
        window.toggleModal('ai-word-collector-overlay', true);
        this._showAIWordCollectorStage('select');
    };

    Controller._closeAIQuiz = function() {
        window.toggleModal('ai-quiz-overlay', false);
    };

    const originalHandleAIAction =
        Controller.handleAIResponseAction.bind(Controller);
    Controller.handleAIResponseAction = function(action, payloadId) {
        const payload = this.aiActionPayloads[payloadId];

        if (action === 'quiz') {
            if (!payload) {
                showToast('这条操作已经失效，请重新打开回答');
                return;
            }

            this._startAIQuiz(payload);
            return;
        }

        return originalHandleAIAction(action, payloadId);
    };

    /* ---------- 回收站 ---------- */
    const removeWordFromActiveData = (word, index) => {
        const wordId = ensureWordId(word);
        const snapshot = {
            word: deepClone(word),
            originalIndex: index,
            starred: Model.stars.includes(wordId),
            clearState: deepClone(Model.mtWordClears[wordId] || null),
            wrongRecord: deepClone(Model.wrongBook[wordId] || null)
        };

        Model.db.splice(index, 1);
        Model.stars = Model.stars.filter(item => item !== wordId);
        delete Model.mtWordClears[wordId];
        delete Model.wrongBook[wordId];
        return snapshot;
    };

    const persistAfterWordDelete = async () => {
        await Promise.all([
            Model.saveDB(),
            Model.saveStars(),
            Model.saveClears(),
            Model.saveWrongBook(),
            Model.saveRecycleBin()
        ]);
        View.updateWordbankUI();
        View.resetWordbankRenderer();
        updateSettingsStats();
        Controller.renderRecycleBin();
    };

    Controller.restoreTrashItem = async function(itemId, silent = false) {
        const index = Model.recycleBin.findIndex(item => item.id === itemId);

        if (index < 0) {
            if (!silent) {
                showToast('这条内容已经不在回收站中');
            }
            return false;
        }

        const item = Model.recycleBin[index];

        if (item.kind === 'word') {
            const snapshot = item.payload;
            const word = deepClone(snapshot.word);

            if (word.builtIn === true) {
                const canonical = Model.builtInWords.find(entry => {
                    return (
                        Model.getWordIdentity(entry, true) ===
                        Model.getWordIdentity(word, true)
                    );
                });

                if (canonical) {
                    word._id = Model.getWordId(canonical);
                    word.builtIn = true;
                }
            }

            ensureWordId(word);

            if (Model.db.some(existing => existing._id === word._id)) {
                Model.recycleBin.splice(index, 1);
                await Model.saveRecycleBin();
                return false;
            }

            const targetIndex = Math.min(
                Math.max(Number(snapshot.originalIndex) || 0, 0),
                Model.db.length
            );
            Model.db.splice(targetIndex, 0, word);

            const wordId = Model.getWordId(word);

            if (snapshot.starred && !Model.stars.includes(wordId)) {
                Model.stars.push(wordId);
            }

            if (snapshot.clearState) {
                Model.mtWordClears[wordId] = deepClone(snapshot.clearState);
            }

            if (snapshot.wrongRecord) {
                Model.wrongBook[word._id] = deepClone(snapshot.wrongRecord);
            }
        } else if (item.kind === 'conversation') {
            const targetIndex = Math.min(
                Math.max(Number(item.payload.originalIndex) || 0, 0),
                Model.aiConversations.length
            );
            Model.aiConversations.splice(
                targetIndex,
                0,
                deepClone(item.payload.conversation)
            );
            this._persistConversations();
        } else if (item.kind === 'example') {
            const payload = item.payload;
            const word =
                Model.db.find(entry => entry._id === payload.wordId) ||
                Model.db.find(entry => {
                    return (
                        entry.word === payload.word &&
                        (entry.lang || 'ja') === (payload.lang || 'ja')
                    );
                });

            if (word) {
                const examples = String(word.example || '')
                    .split('||')
                    .map(example => example.trim())
                    .filter(Boolean);
                const targetIndex = Math.min(
                    Math.max(Number(payload.originalIndex) || 0, 0),
                    examples.length
                );
                examples.splice(targetIndex, 0, payload.example);
                word.example = examples.join(' || ');
            }
        }

        Model.recycleBin.splice(index, 1);
        await Model.saveAllUserData();
        View.updateWordbankUI();
        View.resetWordbankRenderer();
        this.renderRecycleBin();
        this.renderAIHistory();
        updateSettingsStats();

        if (!silent) {
            showToast('已恢复');
        }

        return true;
    };

    Controller.restoreTrashBatch = async function(itemIds) {
        for (const itemId of itemIds) {
            await this.restoreTrashItem(itemId, true);
        }

        showToast('已撤销删除');
    };

    Controller.permanentlyDeleteTrashItem = async function(itemId) {
        Model.recycleBin = Model.recycleBin.filter(item => item.id !== itemId);
        await Model.saveRecycleBin();
        this.renderRecycleBin();
        updateSettingsStats();
        showToast('已永久删除');
    };

    Controller.deleteWord = async function(index) {
        const word = Model.db[index];

        if (!word) {
            return;
        }

        this.closeDetailIfOpen();
        const snapshot = removeWordFromActiveData(word, index);
        const trash = Model.addRecycleItem(
            'word',
            snapshot,
            word.word
        );
        await persistAfterWordDelete();
        showActionToast(
            `已移入回收站：${word.word}`,
            '撤销',
            () => this.restoreTrashBatch([trash.id])
        );
    };

    Controller.batchDelete = async function() {
        if (Model.state.selectedSet.size === 0) {
            showToast('请先选择单词');
            return;
        }

        this.closeDetailIfOpen();
        const batchId = makeId('trash_batch');
        const selected = [...Model.state.selectedSet]
            .sort((a, b) => b - a);
        const trashIds = [];

        selected.forEach(index => {
            const word = Model.db[index];
            if (!word) {
                return;
            }

            const snapshot = removeWordFromActiveData(word, index);
            const trash = Model.addRecycleItem(
                'word',
                snapshot,
                word.word,
                batchId
            );
            trashIds.push(trash.id);
        });

        Model.state.selectedSet.clear();
        Model.state.batchMode = false;
        Model.state.manageMode = false;
        document
            .querySelectorAll('.wb-manage-overlay')
            .forEach(element => element.classList.remove('active'));
        await persistAfterWordDelete();

        showActionToast(
            `已将 ${trashIds.length} 个词移入回收站`,
            '撤销',
            () => this.restoreTrashBatch([...trashIds].reverse())
        );
    };

    Controller.deleteExample = async function(word, exampleIndex) {
        if (!word) {
            return;
        }

        const examples = String(word.example || '')
            .split('||')
            .map(example => example.trim())
            .filter(Boolean);
        const example = examples[exampleIndex];

        if (!example) {
            return;
        }

        examples.splice(exampleIndex, 1);
        word.example = examples.join(' || ');
        const trash = Model.addRecycleItem(
            'example',
            {
                wordId: ensureWordId(word),
                word: word.word,
                lang: word.lang || 'ja',
                example,
                originalIndex: exampleIndex
            },
            `${word.word} 的例句`
        );
        await Model.saveDB();
        this.updateDetailContent(word, false);
        this.renderRecycleBin();
        showActionToast(
            '已删除一条例句',
            '撤销',
            () => this.restoreTrashBatch([trash.id])
        );
    };

    const originalRenderExampleBox =
        View.renderExampleBox.bind(View);
    View.renderExampleBox = function(
        exampleString,
        boxId,
        mode = 'normal',
        word = null
    ) {
        const result = originalRenderExampleBox(
            exampleString,
            boxId,
            mode,
            word
        );

        if (boxId !== 'dt-example-box' || !word) {
            return result;
        }

        const box = this.getEl(boxId);
        if (!box) {
            return result;
        }

        box
            .querySelectorAll('.ex-item')
            .forEach((item, index) => {
                if (
                    item.querySelector(
                        '.example-delete-btn'
                    )
                ) {
                    return;
                }

                const actionRow =
                    item.querySelector('.dt-ex-jp');

                if (!actionRow) {
                    return;
                }

                actionRow.classList.add(
                    'has-example-actions'
                );

                const button =
                    document.createElement('button');

                button.type = 'button';
                button.className = 'example-delete-btn';
                button.title = '删除这条例句';
                button.setAttribute(
                    'aria-label',
                    '删除这条例句'
                );
                button.innerHTML =
                    '<span class="material-symbols-rounded">delete_outline</span>';

                button.addEventListener('click', event => {
                    event.stopPropagation();
                    Hardware.vibrate(15);
                    Controller.deleteExample(word, index);
                });

                const sparkleButton =
                    actionRow.querySelector(
                        '.ai-sparkle-icon'
                    );

                if (sparkleButton) {
                    sparkleButton.insertAdjacentElement(
                        'afterend',
                        button
                    );
                } else {
                    actionRow.appendChild(button);
                }
            });

        return result;
    };

    Controller.renderRecycleBin = function() {
        Model.cleanupRecycleBin();

        const list = View.getEl('recycle-bin-list');
        const empty = View.getEl('recycle-bin-empty');
        const count = View.getEl('recycle-bin-count');
        const clearButton = View.getEl('btn-clear-recycle-bin');

        if (count) {
            count.textContent = `${Model.recycleBin.length} 项`;
        }

        if (clearButton) {
            clearButton.disabled = Model.recycleBin.length === 0;
        }

        if (!list || !empty) {
            return;
        }

        if (Model.recycleBin.length === 0) {
            list.innerHTML = '';
            empty.hidden = false;
            return;
        }

        empty.hidden = true;
        list.innerHTML = Model.recycleBin
            .map(item => {
                const kindLabel = {
                    word: '词汇',
                    conversation: 'AI 对话',
                    example: '例句'
                }[item.kind] || '项目';
                const daysLeft = Math.max(
                    1,
                    Math.ceil((item.expiresAt - Date.now()) / 86400000)
                );

                return `
                    <article class="recycle-item" data-trash-id="${item.id}">
                        <div class="recycle-item-icon">
                            <span class="material-symbols-rounded">${
                                item.kind === 'conversation'
                                    ? 'forum'
                                    : item.kind === 'example'
                                        ? 'format_quote'
                                        : 'dictionary'
                            }</span>
                        </div>
                        <div class="recycle-item-copy">
                            <div class="recycle-item-title">${escapeHTML(item.label)}</div>
                            <div class="recycle-item-meta">
                                ${kindLabel} · ${formatRelativeDate(item.deletedAt)} · ${daysLeft} 天后清理
                            </div>
                        </div>
                        <div class="recycle-item-actions">
                            <button type="button" data-trash-action="restore">恢复</button>
                            <button type="button" data-trash-action="delete" class="danger">永久删除</button>
                        </div>
                    </article>
                `;
            })
            .join('');
    };

    Controller.clearRecycleBin = function() {
        if (!Model.recycleBin.length) {
            showToast('回收站已经是空的');
            return;
        }

        showConfirm(
            '清空回收站？',
            '回收站中的词汇、例句和 AI 对话将无法恢复。',
            async () => {
                Model.recycleBin = [];
                await Model.saveRecycleBin();
                this.renderRecycleBin();
                updateSettingsStats();
                showToast('回收站已清空');
            }
        );
    };

    Controller.renderAIHistory = function() {
        const list = View.getEl('ai-history-list');
        const empty = View.getEl('ai-history-empty');
        const chatView = View.getEl('ai-chat-view');
        const listView = View.getEl('ai-list-view');

        if (chatView) {
            chatView.classList.add('hidden');
        }
        if (listView) {
            listView.classList.remove('hidden');
        }
        if (!list) {
            return;
        }

        if (!Model.aiConversations.length) {
            list.innerHTML = '';
            if (empty) {
                empty.style.display = 'block';
            }
            return;
        }

        if (empty) {
            empty.style.display = 'none';
        }

        list.innerHTML = Model.aiConversations
            .map((conversation, index) => {
                const messages = Array.isArray(conversation.messages)
                    ? conversation.messages
                    : [];
                const lastMessage = messages.at(-1)?.content || '';
                const preview = lastMessage
                    .replace(/###.*?\n/g, '')
                    .replace(/\*\*/g, '')
                    .replace(/\n/g, ' ')
                    .slice(0, 60);

                return `
                    <div class="ai-history-card" data-idx="${index}" tabindex="0" role="button">
                        <div class="ai-history-card-top">
                            <span class="ai-history-lang-tag">${conversation.lang === 'en' ? 'EN' : '日'}</span>
                            <span class="ai-history-word">${escapeHTML(conversation.word || '自由对话')}</span>
                            <span class="ai-history-msgcount">${messages.length} 条对话</span>
                            <button class="ai-history-del-btn" data-idx="${index}" title="移入回收站" aria-label="移入回收站">
                                <span class="material-symbols-rounded">delete</span>
                            </button>
                        </div>
                        <div class="ai-history-preview">${escapeHTML(preview || '点击继续对话。')}</div>
                        <div class="ai-history-date">${escapeHTML(conversation.date || '')}</div>
                    </div>
                `;
            })
            .join('');

        list.querySelectorAll('.ai-history-card').forEach(card => {
            card.addEventListener('click', event => {
                if (event.target.closest('.ai-history-del-btn')) {
                    return;
                }
                Hardware.vibrate(15);
                this.openAIChatFromTab(Number(card.dataset.idx));
            });
        });

        list.querySelectorAll('.ai-history-del-btn').forEach(button => {
            button.addEventListener('click', async event => {
                event.stopPropagation();
                const index = Number(button.dataset.idx);
                const conversation = Model.aiConversations[index];

                if (!conversation) {
                    return;
                }

                Model.aiConversations.splice(index, 1);
                const trash = Model.addRecycleItem(
                    'conversation',
                    {
                        conversation,
                        originalIndex: index
                    },
                    conversation.word || '自由对话'
                );
                this._persistConversations();
                this.renderAIHistory();
                this.renderRecycleBin();
                updateSettingsStats();
                showActionToast(
                    'AI 对话已移入回收站',
                    '撤销',
                    () => this.restoreTrashBatch([trash.id])
                );
            });
        });
    };

    /* ---------- 备份兼容 ---------- */
    const originalBuildBackup =
        Controller.buildBackupPayload.bind(Controller);
    Controller.buildBackupPayload = function(kind = 'manual') {
        const payload = originalBuildBackup(kind);
        payload.backupVersion = Math.max(Number(payload.backupVersion) || 0, 7);
        payload.data.wrongBook = deepClone(Model.wrongBook);
        payload.data.aiQuizHistory = deepClone(Model.aiQuizHistory);
        payload.data.recycleBin = deepClone(Model.recycleBin);
        return payload;
    };

    const originalNormalizeBackup =
        Controller.normalizeBackupPayload.bind(Controller);
    Controller.normalizeBackupPayload = function(rawData) {
        const payload = originalNormalizeBackup(rawData);
        const source = rawData?.data || rawData || {};
        payload.data.wrongBook =
            source.wrongBook && typeof source.wrongBook === 'object'
                ? source.wrongBook
                : {};
        payload.data.aiQuizHistory = Array.isArray(source.aiQuizHistory)
            ? source.aiQuizHistory
            : [];
        payload.data.recycleBin = Array.isArray(source.recycleBin)
            ? source.recycleBin
            : [];
        return payload;
    };

    const originalApplyBackup =
        Controller.applyBackupPayload.bind(Controller);
    Controller.applyBackupPayload = async function(payload) {
        await originalApplyBackup(payload);
        Model.wrongBook = deepClone(payload.data.wrongBook || {});
        Model.aiQuizHistory = deepClone(payload.data.aiQuizHistory || []);
        Model.recycleBin = deepClone(payload.data.recycleBin || []);
        await Promise.all([
            Model.saveWrongBook(),
            Model.saveAIQuizHistory(),
            Model.saveRecycleBin()
        ]);
        this.renderRecycleBin();
        updateSettingsStats();
    };

    /* ---------- 设置页分组 ---------- */
    const showSettingsSection = sectionName => {
        const home = View.getEl('settings-home');
        const sections = document.querySelectorAll('.settings-section');

        if (home) {
            home.hidden = Boolean(sectionName);
        }

        sections.forEach(section => {
            section.hidden = section.dataset.settingsSection !== sectionName;
        });

        if (sectionName === 'library') {
            Controller.renderRecycleBin();
        }

        updateSettingsStats();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const updateOnlineStatus = () => {
        const status = View.getEl('settings-online-status');
        const detail = View.getEl('settings-online-status-detail');
        const text = navigator.onLine ? '在线' : '离线';

        if (status) {
            status.textContent = text;
            status.dataset.state = navigator.onLine ? 'online' : 'offline';
        }

        if (detail) {
            detail.textContent = text;
        }
    };

    function updateSettingsStats() {
        const wrongCount = View.getEl('settings-wrong-count');
        const quizCount = View.getEl('settings-quiz-count');
        const trashCount = View.getEl('settings-trash-count');

        if (wrongCount) {
            wrongCount.textContent = Object.values(Model.wrongBook).filter(
                record => record.totalWrong > 0 && record.status !== 'resolved'
            ).length;
        }

        if (quizCount) {
            quizCount.textContent = Model.aiQuizHistory.length;
        }

        if (trashCount) {
            trashCount.textContent = Model.recycleBin.length;
        }

        updateOnlineStatus();
    }

    const originalNavSwitch = Nav.switchTab.bind(Nav);
    Nav.switchTab = function(targetId, titleData, navItemEl) {
        const result = originalNavSwitch(targetId, titleData, navItemEl);
        if (targetId === 'tab-settings') {
            showSettingsSection('');
        }
        return result;
    };

    const originalControllerInit = Controller.init.bind(Controller);
    Controller.init = async function() {
        await originalControllerInit();

        ensureWrongBookOptions();
        updateWrongToolbar();
        this.renderRecycleBin();
        updateSettingsStats();

        const actionButton = View.getEl('action-toast-action');
        if (actionButton) {
            actionButton.addEventListener('click', () => {
                const callback = actionToastCallback;
                actionToastCallback = null;
                View.getEl('action-toast')?.classList.remove('show');
                if (actionToastTimer) {
                    window.clearTimeout(actionToastTimer);
                    actionToastTimer = null;
                }
                callback?.();
            });
        }

        View.getEl('btn-start-wrongbook')?.addEventListener('click', () => {
            Hardware.unlockSpeech();
            this.startWrongBookPractice();
        });

        View.getEl('wb-folder-filter')?.addEventListener('change', () => {
            updateWrongToolbar();
        });

        const quizBindings = {
            'ai-quiz-close': () => this._closeAIQuiz(),
            'ai-quiz-submit': () => this._submitAIQuizAnswer(),
            'ai-quiz-next': () => this._advanceAIQuiz(),
            'ai-quiz-done': () => this._closeAIQuiz(),
            'ai-quiz-retry': () =>
                this._startAIQuiz(this.aiQuizState.sourcePayload),
            'ai-quiz-open-wrongbook': () =>
                this._openWrongBookFromQuiz(),
            'ai-quiz-import-missing': () =>
                this._importMissingAIQuizWords()
        };

        Object.entries(quizBindings).forEach(([id, handler]) => {
            View.getEl(id)?.addEventListener('click', handler);
        });

        View.getEl('ai-quiz-input')?.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (!View.getEl('ai-quiz-submit')?.hidden) {
                    this._submitAIQuizAnswer();
                }
            }
        });

        document
            .querySelectorAll('[data-open-settings-section]')
            .forEach(button => {
                button.addEventListener('click', () => {
                    Hardware.playSound('click');
                    Hardware.vibrate(15);

                    showSettingsSection(
                        button.dataset.openSettingsSection
                    );
                });
            });

        document
            .querySelectorAll('[data-settings-back]')
            .forEach(button => {
                button.addEventListener('click', () => {
                    Hardware.playSound('click');
                    Hardware.vibrate(10);

                    showSettingsSection('');
                });
            });

        View.getEl('recycle-bin-list')?.addEventListener('click', event => {
            const button = event.target.closest('[data-trash-action]');
            const item = event.target.closest('[data-trash-id]');

            if (!button || !item) {
                return;
            }

            const itemId = item.dataset.trashId;
            if (button.dataset.trashAction === 'restore') {
                this.restoreTrashItem(itemId);
            } else {
                this.permanentlyDeleteTrashItem(itemId);
            }
        });

        View.getEl('btn-clear-recycle-bin')?.addEventListener('click', () => {
            this.clearRecycleBin();
        });

        const clearAIButton = View.getEl('btn-settings-clear-ai-history');
        if (clearAIButton) {
            clearAIButton.addEventListener('click', () => {
                if (!Model.aiConversations.length) {
                    showToast('暂无 AI 对话记录');
                    return;
                }

                showConfirm(
                    '清空 AI 对话？',
                    '所有对话会移入回收站，可在 7 天内恢复。',
                    async () => {
                        const batchId = makeId('conversation_batch');
                        const ids = [];
                        [...Model.aiConversations]
                            .reverse()
                            .forEach((conversation, reverseIndex) => {
                                const originalIndex =
                                    Model.aiConversations.length -
                                    1 -
                                    reverseIndex;
                                const item = Model.addRecycleItem(
                                    'conversation',
                                    { conversation, originalIndex },
                                    conversation.word || '自由对话',
                                    batchId
                                );
                                ids.push(item.id);
                            });
                        Model.aiConversations = [];
                        this._persistConversations();
                        this.renderAIHistory();
                        this.renderRecycleBin();
                        updateSettingsStats();
                        showActionToast(
                            `已将 ${ids.length} 条对话移入回收站`,
                            '撤销',
                            () => this.restoreTrashBatch(ids.reverse())
                        );
                    }
                );
            });
        }

        const wrongBookToggle = View.getEl('setting-wrongbook-enabled');
        if (wrongBookToggle) {
            wrongBookToggle.checked =
                localStorage.getItem('wrongBookEnabled') !== 'false';
            wrongBookToggle.addEventListener('change', event => {
                localStorage.setItem(
                    'wrongBookEnabled',
                    event.target.checked
                );
                showToast(
                    event.target.checked
                        ? '已开启错题记录'
                        : '已暂停记录新错题'
                );
            });
        }

        const quizRecordToggle = View.getEl('setting-ai-quiz-record');
        if (quizRecordToggle) {
            quizRecordToggle.checked =
                localStorage.getItem('aiQuizRecord') !== 'false';
            quizRecordToggle.addEventListener('change', event => {
                localStorage.setItem('aiQuizRecord', event.target.checked);
                showToast(
                    event.target.checked
                        ? 'AI 小测会写入学习记录'
                        : 'AI 小测仅保留结果，不影响错题本'
                );
            });
        }

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    };
})();


/* ==========================================
   第四轮：批量导入加入 AI 智能补全
   ========================================== */
(() => {
    const AI_IMPORT_BATCH_SIZE = 20;
    const AI_IMPORT_MAX_WORDS = 100;

    const originalInitializeImportPanel =
        Controller.initializeImportPanel.bind(Controller);

    const originalUpdateImportFormatUI =
        Controller.updateImportFormatUI.bind(Controller);

    const originalImportWords =
        Controller.importWords.bind(Controller);

    const originalCloseAIWordCollector =
        Controller._closeAIWordCollector.bind(Controller);

    const originalSaveAIWordDrafts =
        Controller._saveAIWordDrafts.bind(Controller);

    const originalControllerInit =
        Controller.init.bind(Controller);

    Controller.importMode =
        localStorage.getItem('importMode') === 'ai'
            ? 'ai'
            : 'manual';

    Controller.aiImportState = {
        lang: 'ja',
        folder: '',
        duplicateMode: 'skip',
        addToStars: false,
        level: '',
        difficulty: 0,
        tags: [],
        totalInput: 0,
        skippedExisting: 0,
        invalidLines: [],
        candidates: [],
        successes: [],
        failed: [],
        running: false
    };

    Controller.initializeImportPanel = function() {
        originalInitializeImportPanel();
        this.setImportMode(this.importMode, false);
    };

    Controller.setImportMode = function(
        mode,
        announce = true
    ) {
        const nextMode =
            mode === 'ai'
                ? 'ai'
                : 'manual';

        this.importMode = nextMode;
        localStorage.setItem('importMode', nextMode);

        document
            .querySelectorAll('[data-import-mode]')
            .forEach(button => {
                const active =
                    button.dataset.importMode === nextMode;

                button.classList.toggle('active', active);
                button.setAttribute(
                    'aria-pressed',
                    String(active)
                );
            });

        const starOption =
            View.getEl('import-ai-star-option');

        const inputNote =
            View.getEl('ai-import-input-note');

        if (starOption) {
            starOption.hidden = nextMode !== 'ai';
        }

        if (inputNote) {
            inputNote.hidden = nextMode !== 'ai';
        }

        this.updateImportFormatUI();

        if (announce) {
            showToast(
                nextMode === 'ai'
                    ? '已切换到 AI 智能补全'
                    : '已切换到普通导入'
            );
        }
    };

    Controller.updateImportFormatUI = function() {
        if (this.importMode !== 'ai') {
            originalUpdateImportFormatUI();

            const description =
                View.getEl('import-section-desc');

            const duplicateLabel =
                View.getEl('import-duplicate-label');

            const buttonLabel =
                View.getEl('btn-import-label');

            const buttonIcon =
                View.getEl('btn-import')
                    ?.querySelector('.material-symbols-rounded');

            if (description) {
                description.textContent =
                    '先检查可导入词、重复词与错误行，再确认写入。';
            }

            if (duplicateLabel) {
                duplicateLabel.textContent =
                    '遇到同词库内的重复词';
            }

            if (buttonLabel) {
                buttonLabel.textContent = '检查并导入';
            }

            if (buttonIcon) {
                buttonIcon.textContent = 'fact_check';
            }

            return;
        }

        const lang =
            View.getEl('import-lang-select')?.value || 'ja';

        const formatText =
            View.getEl('import-format-text');

        const formatNote =
            View.getEl('import-format-note');

        const textarea =
            View.getEl('custom-input');

        const description =
            View.getEl('import-section-desc');

        const duplicateLabel =
            View.getEl('import-duplicate-label');

        const buttonLabel =
            View.getEl('btn-import-label');

        const buttonIcon =
            View.getEl('btn-import')
                ?.querySelector('.material-symbols-rounded');

        if (description) {
            description.textContent =
                '每行只输入一个单词，AI 会补全读音、词性、释义、例句与其他信息。';
        }

        if (duplicateLabel) {
            duplicateLabel.textContent =
                '遇到词库中已经存在的词';
        }

        if (formatText) {
            formatText.textContent =
                lang === 'en'
                    ? '每行一个英语单词或常用短语'
                    : '每行一个日语单词或常用短语';
        }

        if (formatNote) {
            formatNote.textContent =
                lang === 'en'
                    ? '例如：abandon、ability、take part in。英语会自动统一为词典形式。'
                    : '例如：計画、努力する、役に立つ。动词和形容词建议输入基本形。';
        }

        if (textarea) {
            textarea.placeholder =
                lang === 'en'
                    ? 'abandon\nability\ntake part in'
                    : '計画\n努力する\n役に立つ';
        }

        if (buttonLabel) {
            buttonLabel.textContent = '让 AI 补全';
        }

        if (buttonIcon) {
            buttonIcon.textContent = 'auto_fix_high';
        }
    };

    Controller.importWords = function() {
        if (this.importMode === 'ai') {
            return this._startAIImport();
        }

        return originalImportWords();
    };

    Controller._parseAIImportInput = function(
        text,
        lang
    ) {
        const invalidLines = [];
        const seen = new Set();
        const words = [];

        const rawLines = String(text || '')
            .split(/\r?\n/)
            .map((line, index) => ({
                line,
                number: index + 1
            }));

        for (const item of rawLines) {
            let value = String(item.line || '')
                .replace(
                    /^\s*(?:[-*•·]+|\d+[.)、．])\s*/,
                    ''
                )
                .trim();

            if (!value) {
                continue;
            }

            value = this._normalizeAIWordText(
                value,
                lang
            );

            const validLanguage =
                lang === 'en'
                    ? (
                        /[A-Za-z]/.test(value) &&
                        !/[ぁ-ゖァ-ヺ一-龯々〆ヶ]/u.test(value)
                    )
                    : /[ぁ-ゖァ-ヺ一-龯々〆ヶ]/u.test(value);

            if (!value || !validLanguage) {
                invalidLines.push({
                    number: item.number,
                    value: String(item.line || '').trim(),
                    reason:
                        lang === 'en'
                            ? '不像有效英语词汇'
                            : '不像有效日语词汇'
                });

                continue;
            }

            if (value.length > 80) {
                invalidLines.push({
                    number: item.number,
                    value,
                    reason: '内容过长'
                });

                continue;
            }

            const key =
                `${lang}:` +
                (lang === 'en'
                    ? value.toLowerCase()
                    : value);

            if (seen.has(key)) {
                continue;
            }

            seen.add(key);
            words.push({
                word: value,
                lang
            });
        }

        return {
            words: words.slice(0, AI_IMPORT_MAX_WORDS),
            invalidLines,
            truncatedCount:
                Math.max(0, words.length - AI_IMPORT_MAX_WORDS),
            rawNonEmptyCount:
                rawLines.filter(item => item.line.trim()).length
        };
    };

    Controller._findExistingAIImportWord = function(
        candidate
    ) {
        const target =
            this._normalizeAIWordText(
                candidate.word,
                candidate.lang
            );

        return Model.db.find(entry => {
            const entryLang = entry.lang || 'ja';

            return (
                entryLang === candidate.lang &&
                this._normalizeAIWordText(
                    entry.word,
                    entryLang
                ) === target
            );
        }) || null;
    };

    Controller._buildAIImportPrompt = function(
        candidates,
        lang
    ) {
        const batchLevel = candidates[0]?.level || '';
        const batchDifficulty = normalizeWordDifficulty(
            candidates[0]?.difficulty
        );
        const batchTags = normalizeWordTags(
            candidates[0]?.tags
        );

        const languageRules =
            lang === 'en'
                ? `
英语字段要求：
- word：严格保留输入词的词典形式，不要翻译。
- phonetic：使用常见 IPA，并用 / / 包裹；无法确认时留空。
- type：使用中文词性；多词性使用“・”分隔。
- meaning：使用简洁中文，多义项使用“；”分隔。
- roots：只写可靠、简洁的词根词缀；不确定时留空，禁止编造。
- example：一条自然常用的英语例句，严格写成“英语例句 / 中文翻译”。
- kana：必须为空字符串。`
                : `
日语字段要求：
- word：严格保留输入词的基本形，不要翻译。
- kana：只写对应假名读音，不要括号或注音符号。
- type：使用中文词性；多词性使用“・”分隔；サ变词可写“名词・サ变动词する”。
- meaning：使用简洁中文，多义项使用“；”分隔。
- example：一条自然常用的日语例句，严格写成“日语例句 / 中文翻译”。
- phonetic 和 roots：必须为空字符串。`;

        return `请把下面的${lang === 'en' ? '英语' : '日语'}词汇补全成适合中文学习者保存到词库的完整词条。

通用规则：
1. 严格保持输入顺序，每个输入词必须对应一个结果，不能遗漏、合并或增加词汇。
2. lang 必须统一为 "${lang}"。
3. 所有字段都必须存在；无法可靠确认的字段写空字符串。
4. level 固定为 "${batchLevel}"，不要自行改成其他考试级别。
5. difficulty 使用 1～5；批次预设为 ${batchDifficulty || 0}，当预设为 0 时请按实际学习难度估计。
6. tags 最多 3 个简短中文标签；优先保留批次标签 ${JSON.stringify(batchTags)}，并可补充必要标签。
7. 只输出一个 JSON 对象，不要使用 Markdown，不要添加解释。
8. 输出格式必须是：
{"items":[{"word":"","lang":"${lang}","kana":"","phonetic":"","type":"","meaning":"","example":"","roots":"","level":"","difficulty":0,"tags":[]}]}
${languageRules}

待补全词汇：
${JSON.stringify(candidates.map(item => ({
            word: item.word,
            lang: item.lang
        })))}`;
    };

    Controller._requestAIImportBatch = async function(
        candidates
    ) {
        if (!Array.isArray(candidates) || candidates.length === 0) {
            return {
                successes: [],
                failed: []
            };
        }

        const lang = candidates[0].lang;
        const prompt =
            this._buildAIImportPrompt(candidates, lang);

        try {
            const result =
                await this._requestAIJSON(prompt);

            const rawItems =
                Array.isArray(result.items)
                    ? result.items
                    : [];

            const itemMap = new Map();

            rawItems.forEach(item => {
                const itemLang =
                    item?.lang === 'en'
                        ? 'en'
                        : 'ja';

                const key =
                    `${itemLang}:` +
                    this._normalizeAIWordText(
                        item?.word,
                        itemLang
                    );

                if (!itemMap.has(key)) {
                    itemMap.set(key, item);
                }
            });

            const successes = [];
            const failed = [];

            candidates.forEach((candidate, index) => {
                const key =
                    `${candidate.lang}:` +
                    this._normalizeAIWordText(
                        candidate.word,
                        candidate.lang
                    );

                let matching = itemMap.get(key);

                if (
                    !matching &&
                    rawItems.length === candidates.length
                ) {
                    const positional = rawItems[index];
                    const positionalLang =
                        positional?.lang === 'en'
                            ? 'en'
                            : 'ja';

                    if (positionalLang === candidate.lang) {
                        matching = positional;
                    }
                }

                if (!matching) {
                    failed.push({
                        ...candidate,
                        reason: 'AI 未返回对应词条'
                    });
                    return;
                }

                const rawDraft = {
                    word: candidate.word,
                    lang: candidate.lang,
                    kana:
                        candidate.lang === 'ja'
                            ? String(matching.kana || '')
                            : '',
                    phonetic:
                        candidate.lang === 'en'
                            ? String(matching.phonetic || '')
                            : '',
                    type: String(matching.type || ''),
                    meaning: String(matching.meaning || ''),
                    example: String(matching.example || ''),
                    roots:
                        candidate.lang === 'en'
                            ? String(matching.roots || '')
                            : '',
                    level: candidate.level || '',
                    difficulty:
                        candidate.difficulty > 0
                            ? candidate.difficulty
                            : normalizeWordDifficulty(
                                  matching.difficulty
                              ),
                    tags:
                        candidate.tags?.length
                            ? candidate.tags
                            : normalizeWordTags(matching.tags),
                    builtIn: false
                };

                successes.push(
                    this._toAIWordDraft(
                        normalizeWordEntry(rawDraft)
                    )
                );
            });

            return {
                successes,
                failed
            };
        } catch (error) {
            return {
                successes: [],
                failed: candidates.map(candidate => ({
                    ...candidate,
                    reason:
                        error?.message || '请求失败'
                }))
            };
        }
    };

    Controller._setAIImportCollectorContext = function() {
        const title =
            View.getEl('ai-word-collector-title-text');

        const subtitle =
            View.getEl('ai-word-collector-subtitle');

        const icon =
            View.getEl('ai-word-collector-icon');

        const backLabel =
            View.getEl('ai-word-back-label');

        const progress =
            View.getEl('ai-import-loading-progress');

        if (title) {
            title.textContent = 'AI 智能导入';
        }

        if (subtitle) {
            subtitle.textContent =
                `每批最多 ${AI_IMPORT_BATCH_SIZE} 个，完成后先预览再保存`;
        }

        if (icon) {
            icon.textContent = 'auto_fix_high';
        }

        if (backLabel) {
            backLabel.textContent = '返回导入';
        }

        if (progress) {
            progress.hidden = false;
        }
    };

    Controller._resetAIImportCollectorContext = function() {
        const title =
            View.getEl('ai-word-collector-title-text');

        const subtitle =
            View.getEl('ai-word-collector-subtitle');

        const icon =
            View.getEl('ai-word-collector-icon');

        const backLabel =
            View.getEl('ai-word-back-label');

        const progress =
            View.getEl('ai-import-loading-progress');

        const failureBox =
            View.getEl('ai-import-failure-box');

        const previewNote =
            View.getEl('ai-import-preview-note');

        if (title) {
            title.textContent = '从回答加入词库';
        }

        if (subtitle) {
            subtitle.textContent =
                '先选择词汇，再由 AI 补全并预览';
        }

        if (icon) {
            icon.textContent = 'playlist_add';
        }

        if (backLabel) {
            backLabel.textContent = '返回选择';
        }

        if (progress) {
            progress.hidden = true;
        }

        if (failureBox) {
            failureBox.hidden = true;
        }

        if (previewNote) {
            previewNote.hidden = true;
        }
    };

    Controller._updateAIImportProgress = function(
        done,
        total,
        label
    ) {
        const progressLabel =
            View.getEl('ai-import-progress-label');

        const progressCount =
            View.getEl('ai-import-progress-count');

        const progressBar =
            View.getEl('ai-import-progress-bar');

        const loadingText =
            View.getEl('ai-word-loading-text');

        const safeTotal = Math.max(1, total);
        const percent = Math.min(
            100,
            Math.max(0, done / safeTotal * 100)
        );

        if (progressLabel) {
            progressLabel.textContent =
                label || '正在补全';
        }

        if (progressCount) {
            progressCount.textContent =
                `${Math.min(done, total)} / ${total}`;
        }

        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }

        if (loadingText) {
            loadingText.textContent =
                done >= total
                    ? 'AI 补全完成，正在整理预览…'
                    : `正在补全第 ${Math.floor(done / AI_IMPORT_BATCH_SIZE) + 1} 批词汇…`;
        }
    };

    Controller._renderAIImportFailures = function(
        stage = 'loading'
    ) {
        const failed =
            this.aiImportState.failed || [];

        const failureBox =
            View.getEl('ai-import-failure-box');

        const failureTitle =
            View.getEl('ai-import-failure-title-text');

        const failureList =
            View.getEl('ai-import-failure-list');

        const previewNote =
            View.getEl('ai-import-preview-note');

        const previewTitle =
            View.getEl('ai-import-preview-note-title');

        const previewText =
            View.getEl('ai-import-preview-note-text');

        if (failureBox) {
            failureBox.hidden =
                stage !== 'loading' || failed.length === 0;
        }

        if (failureTitle) {
            failureTitle.textContent =
                `${failed.length} 个词汇补全失败`;
        }

        if (failureList) {
            failureList.innerHTML = failed
                .slice(0, 30)
                .map(item => {
                    return `<span title="${escapeHTML(item.reason || '')}">${escapeHTML(item.word)}</span>`;
                })
                .join('');
        }

        if (previewNote) {
            previewNote.hidden =
                stage !== 'preview' || failed.length === 0;
        }

        if (previewTitle) {
            previewTitle.textContent =
                `${failed.length} 个词汇尚未补全`;
        }

        if (previewText) {
            const names = failed
                .slice(0, 6)
                .map(item => item.word)
                .join('、');

            previewText.textContent =
                names +
                (failed.length > 6
                    ? ` 等 ${failed.length} 个词`
                    : '') +
                '。已完成的词条可以先检查，也可以只重试这些失败词。';
        }
    };

    Controller._applyAIImportPreviewSettings = function() {
        const state = this.aiImportState;
        const folderSelect =
            View.getEl(
                state.lang === 'en'
                    ? 'ai-word-folder-en'
                    : 'ai-word-folder-ja'
            );

        if (folderSelect) {
            const hasFolder = Array.from(
                folderSelect.options
            ).some(option => option.value === state.folder);

            if (hasFolder) {
                folderSelect.value = state.folder;
                folderSelect.dispatchEvent(
                    new Event('facade-update')
                );
            }
        }

        const duplicateSelect =
            View.getEl('ai-word-duplicate-mode');

        if (duplicateSelect) {
            duplicateSelect.value = state.duplicateMode;
            duplicateSelect.dispatchEvent(
                new Event('facade-update')
            );
        }

        const starInput =
            View.getEl('ai-word-add-star');

        if (starInput) {
            starInput.checked = state.addToStars;
        }
    };

    Controller._startAIImport = async function() {
        Hardware.playSound('click');
        Hardware.vibrate(18);

        if (this.aiImportState.running) {
            return;
        }

        if (!localStorage.getItem('deepseekApiKey')) {
            showToast('请先在设置中配置 DeepSeek API Key');
            return;
        }

        const text =
            View.getEl('custom-input')?.value || '';

        const lang =
            View.getEl('import-lang-select')?.value || 'ja';

        const folder =
            View.getEl('import-folder-select')?.value || '';

        const duplicateMode =
            View.getEl('import-duplicate-mode')?.value || 'skip';

        const addToStars = Boolean(
            View.getEl('import-ai-add-star')?.checked
        );

        const level = normalizeWordLevel(
            View.getEl('import-level-select')?.value || '',
            lang
        );

        const difficulty = normalizeWordDifficulty(
            View.getEl('import-difficulty-select')?.value || 0
        );

        const tags = normalizeWordTags(
            View.getEl('import-tags-input')?.value || ''
        );

        if (!text.trim()) {
            showToast('请先输入要补全的单词');
            return;
        }

        if (!folder) {
            showToast('当前语言没有可用词库');
            return;
        }

        const parsed =
            this._parseAIImportInput(text, lang);

        if (parsed.words.length === 0) {
            showToast(
                lang === 'en'
                    ? '没有识别到有效英语词汇'
                    : '没有识别到有效日语词汇'
            );
            return;
        }

        let skippedExisting = 0;
        const candidates = [];

        for (const candidate of parsed.words) {
            const existing =
                this._findExistingAIImportWord(candidate);

            if (existing && duplicateMode === 'skip') {
                skippedExisting++;
                continue;
            }

            candidates.push({
                ...candidate,
                level,
                difficulty,
                tags,
                builtIn: false,
                existingFolder: existing?.folder || ''
            });
        }

        if (candidates.length === 0) {
            showToast(
                `识别到的 ${parsed.words.length} 个词都已存在，已按设置跳过`
            );
            return;
        }

        this.aiImportState = {
            lang,
            folder,
            duplicateMode,
            addToStars,
            level,
            difficulty,
            tags,
            totalInput: parsed.rawNonEmptyCount,
            skippedExisting,
            invalidLines: parsed.invalidLines,
            truncatedCount: parsed.truncatedCount,
            candidates,
            successes: [],
            failed: [],
            running: true
        };

        this._resetAIWordCollection();

        this.aiWordCollection.sourcePayload = {
            scope: 'import',
            lang,
            folder,
            duplicateMode,
            addToStars,
            level,
            difficulty,
            tags
        };

        window.toggleModal(
            'ai-word-collector-overlay',
            true
        );

        this._setAIImportCollectorContext();

        this._showAIWordCollectorStage(
            'loading',
            `准备为 ${candidates.length} 个词汇补全信息…`
        );

        const loadingNote =
            View.getEl('ai-word-loading-note');

        if (loadingNote) {
            const notes = [];

            if (skippedExisting > 0) {
                notes.push(`已提前跳过 ${skippedExisting} 个重复词`);
            }

            if (parsed.invalidLines.length > 0) {
                notes.push(`忽略 ${parsed.invalidLines.length} 行无效内容`);
            }

            if (parsed.truncatedCount > 0) {
                notes.push(`超过上限的 ${parsed.truncatedCount} 个词暂未处理`);
            }

            loadingNote.textContent =
                notes.length > 0
                    ? notes.join(' · ')
                    : `系统会自动分为 ${Math.ceil(candidates.length / AI_IMPORT_BATCH_SIZE)} 批处理`;
        }

        this._updateAIImportProgress(
            0,
            candidates.length,
            '正在准备'
        );

        await this._runAIImportCandidates(
            candidates,
            false
        );
    };

    Controller._runAIImportCandidates = async function(
        candidates,
        isRetry = false
    ) {
        const total = candidates.length;
        let processed = 0;
        const runSuccesses = [];
        const runFailures = [];

        this.aiImportState.running = true;

        this._showAIWordCollectorStage(
            'loading',
            isRetry
                ? `正在重试 ${total} 个失败词…`
                : `正在补全 ${total} 个词汇…`
        );

        this._renderAIImportFailures('none');

        for (
            let start = 0;
            start < candidates.length;
            start += AI_IMPORT_BATCH_SIZE
        ) {
            const batch = candidates.slice(
                start,
                start + AI_IMPORT_BATCH_SIZE
            );

            const batchNumber =
                Math.floor(start / AI_IMPORT_BATCH_SIZE) + 1;

            const batchTotal =
                Math.ceil(candidates.length / AI_IMPORT_BATCH_SIZE);

            this._updateAIImportProgress(
                processed,
                total,
                `第 ${batchNumber} / ${batchTotal} 批`
            );

            const result =
                await this._requestAIImportBatch(batch);

            runSuccesses.push(...result.successes);
            runFailures.push(...result.failed);

            processed += batch.length;

            this._updateAIImportProgress(
                processed,
                total,
                `第 ${batchNumber} / ${batchTotal} 批`
            );
        }

        const successMap = new Map();

        [
            ...(isRetry
                ? this.aiImportState.successes
                : []),
            ...runSuccesses
        ].forEach(draft => {
            const key =
                `${draft.lang}:` +
                this._normalizeAIWordText(
                    draft.word,
                    draft.lang
                );

            successMap.set(key, draft);
        });

        this.aiImportState.successes =
            Array.from(successMap.values());

        this.aiImportState.failed = runFailures;
        this.aiImportState.running = false;

        if (this.aiImportState.successes.length === 0) {
            const loadingText =
                View.getEl('ai-word-loading-text');

            if (loadingText) {
                loadingText.textContent =
                    '这次没有成功补全任何词汇';
            }

            this._renderAIImportFailures('loading');
            return;
        }

        this.aiWordCollection.drafts =
            this.aiImportState.successes.map(draft => ({
                ...draft
            }));

        this._renderAIWordPreview();
        this._applyAIImportPreviewSettings();
        this._renderAIImportFailures('preview');

        this._showAIWordCollectorStage('preview');

        showToast(
            this.aiImportState.failed.length > 0
                ? `已补全 ${this.aiImportState.successes.length} 个，${this.aiImportState.failed.length} 个待重试`
                : `已补全 ${this.aiImportState.successes.length} 个词汇，请检查后保存`
        );
    };

    Controller._retryAIImportFailures = async function() {
        if (this.aiImportState.running) {
            return;
        }

        const failed =
            (this.aiImportState.failed || [])
                .map(item => ({
                    word: item.word,
                    lang: item.lang
                }));

        if (failed.length === 0) {
            showToast('没有需要重试的词汇');
            return;
        }

        this._setAIImportCollectorContext();
        this._updateAIImportProgress(
            0,
            failed.length,
            '正在准备重试'
        );

        await this._runAIImportCandidates(
            failed,
            true
        );
    };

    Controller._closeAIWordCollector = function() {
        originalCloseAIWordCollector();
        this._resetAIImportCollectorContext();
        this.aiImportState.running = false;
    };

    Controller._saveAIWordDrafts = async function() {
        const wasAIImport =
            this.aiWordCollection?.sourcePayload?.scope === 'import';

        await originalSaveAIWordDrafts();

        const overlay =
            View.getEl('ai-word-collector-overlay');

        if (
            wasAIImport &&
            overlay &&
            !overlay.classList.contains('active')
        ) {
            const textarea =
                View.getEl('custom-input');

            if (textarea) {
                textarea.value = '';
            }

            this.aiImportState = {
                lang: 'ja',
                folder: '',
                duplicateMode: 'skip',
                addToStars: false,
                level: '',
                difficulty: 0,
                tags: [],
                totalInput: 0,
                skippedExisting: 0,
                invalidLines: [],
                candidates: [],
                successes: [],
                failed: [],
                running: false
            };
        }
    };

    Controller.init = async function() {
        await originalControllerInit();

        document
            .querySelectorAll('[data-import-mode]')
            .forEach(button => {
                button.addEventListener('click', () => {
                    Hardware.playSound('click');
                    Hardware.vibrate(12);
                    this.setImportMode(
                        button.dataset.importMode
                    );
                });
            });

        View.getEl('ai-import-retry')
            ?.addEventListener('click', () => {
                Hardware.vibrate(15);
                this._retryAIImportFailures();
            });

        View.getEl('ai-import-preview-retry')
            ?.addEventListener('click', () => {
                Hardware.vibrate(15);
                this._retryAIImportFailures();
            });

        View.getEl('ai-word-back')
            ?.addEventListener(
                'click',
                event => {
                    if (
                        this.aiWordCollection
                            ?.sourcePayload
                            ?.scope === 'import'
                    ) {
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        Hardware.vibrate(10);
                        this._closeAIWordCollector();
                    }
                },
                true
            );

        this.setImportMode(
            this.importMode,
            false
        );
    };
})();


/* ==========================================
   第五轮：词库级别、难度、标签与数据检查
   ========================================== */
(() => {
    const getFilterStorageKey = (name, lang) => {
        return `wordbank_${name}_${lang === 'en' ? 'en' : 'ja'}`;
    };

    const syncWordbankMetadataFilters = () => {
        const lang = Model.state.currentLangMode === 'en' ? 'en' : 'ja';
        const levelSelect = View.getEl('wb-level-filter');
        const difficultySelect = View.getEl('wb-difficulty-filter');

        if (levelSelect) {
            const saved = localStorage.getItem(
                getFilterStorageKey('level', lang)
            ) || '';

            levelSelect.innerHTML =
                '<option value="">全部级别</option>' +
                (WORD_LEVEL_OPTIONS[lang] || [])
                    .map(level => {
                        return `<option value="${level}">${level}</option>`;
                    })
                    .join('') +
                '<option value="__unassigned__">未分级</option>';

            levelSelect.value = Array.from(levelSelect.options)
                .some(option => option.value === saved)
                    ? saved
                    : '';

            levelSelect.dispatchEvent(
                new Event('facade-update')
            );
        }

        if (difficultySelect) {
            const saved = localStorage.getItem(
                getFilterStorageKey('difficulty', lang)
            ) || '';

            difficultySelect.value = Array.from(
                difficultySelect.options
            ).some(option => option.value === saved)
                ? saved
                : '';

            difficultySelect.dispatchEvent(
                new Event('facade-update')
            );
        }
    };

    const originalUpdateWordbankUI =
        View.updateWordbankUI.bind(View);

    View.updateWordbankUI = function() {
        const result = originalUpdateWordbankUI();
        syncWordbankMetadataFilters();
        return result;
    };

    const originalUpdateFilteredDb =
        Model.updateFilteredDb.bind(Model);

    Model.updateFilteredDb = function(
        searchQuery,
        currentFilter
    ) {
        originalUpdateFilteredDb(
            searchQuery,
            currentFilter
        );

        const levelFilter =
            View.getEl('wb-level-filter')?.value || '';
        const difficultyFilter =
            View.getEl('wb-difficulty-filter')?.value || '';

        const hint = this.state.filteredDb.find(item => {
            return item.idx === -999;
        });

        const words = this.state.filteredDb.filter(item => {
            if (item.idx === -999) {
                return false;
            }

            const lang = item.w.lang === 'en' ? 'en' : 'ja';
            const level = normalizeWordLevel(item.w.level, lang);
            const difficulty = normalizeWordDifficulty(
                item.w.difficulty
            );

            const levelMatches =
                !levelFilter ||
                (levelFilter === '__unassigned__'
                    ? !level
                    : level === levelFilter);

            const difficultyMatches =
                !difficultyFilter ||
                (difficultyFilter === '__unassigned__'
                    ? difficulty === 0
                    : difficulty === Number(difficultyFilter));

            return levelMatches && difficultyMatches;
        });

        this.state.filteredDb = hint
            ? [hint, ...words]
            : words;
    };

    const decorateWordbankCards = () => {
        const grid = View.getEl('wb-grid');

        const columns =
            Number.parseInt(
                grid?.dataset.cols || '3',
                10
            ) || 3;

        document
            .querySelectorAll('.wb-card[data-idx]')
            .forEach(card => {
                const index =
                    Number(card.dataset.idx);

                if (
                    !Number.isInteger(index) ||
                    index < 0
                ) {
                    return;
                }

                const word = Model.db[index];

                const wordNode =
                    card.querySelector(
                        '.wb-c-word'
                    );

                if (!word || !wordNode) {
                    return;
                }

                const isEnglish =
                    word.lang === 'en';

                const wordLength =
                    Array.from(
                        String(word.word || '')
                    ).length;

                const readingText =
                    isEnglish
                        ? word.phonetic
                        : word.kana;

                const readingLength =
                    Array.from(
                        String(
                            readingText || ''
                        )
                    ).length;

                card.classList.toggle(
                    'is-english-word',
                    isEnglish
                );

                card.classList.toggle(
                    'is-word-long',
                    wordLength >
                        (isEnglish ? 10 : 4)
                );

                card.classList.toggle(
                    'is-word-very-long',
                    wordLength >
                        (isEnglish ? 15 : 6)
                );

                card.classList.toggle(
                    'is-reading-long',
                    readingLength >
                        (isEnglish ? 14 : 8)
                );

                let meta =
                    card.querySelector(
                        '.wb-meta-row'
                    );

                if (!meta) {
                    meta =
                        document.createElement(
                            'div'
                        );

                    meta.className =
                        'wb-meta-row';

                    wordNode
                        .insertAdjacentElement(
                            'afterend',
                            meta
                        );
                }

                const html =
                    getWordMetadataHTML(
                        word,
                        {
                            compact: true,
                            showUnassigned: false,
                            specialTagLimit:
                                columns === 2
                                    ? 1
                                    : 0
                        }
                    );

                meta.innerHTML = html;
                meta.hidden = !html;

                const pitchNode =
                    card.querySelector(
                        '.wb-c-pitch'
                    );

                if (
                    pitchNode &&
                    !isEnglish
                ) {
                    pitchNode.textContent =
                        formatWordPitchDisplay(
                            word.pitch
                        );
                }
            });
    };

    const originalRenderVirtualGrid =
        View.renderVirtualGrid.bind(View);

    View.renderVirtualGrid = function() {
        const result = originalRenderVirtualGrid();
        decorateWordbankCards();
        return result;
    };

    const originalUpdateDetailContent =
        Controller.updateDetailContent.bind(Controller);

    Controller.updateDetailContent = function(
        word,
        triggerTTS = false
    ) {
        const result = originalUpdateDetailContent(
            word,
            triggerTTS
        );

        const meta = View.getEl('dt-meta');

        if (meta) {
            meta.innerHTML = getWordMetadataHTML(word, {
                showUnassigned: true,
                includeTags: true,
                specialTagLimit: 2
            });
        }

        return result;
    };

    Controller.renderVocabularyAudit = function(report) {
        const resultBox = View.getEl('library-audit-result');
        const summary = View.getEl('library-audit-summary');
        const issueList = View.getEl('library-audit-issues');

        if (!resultBox || !summary || !issueList) {
            return;
        }

        resultBox.hidden = false;
        resultBox.dataset.state = report.passed
            ? (report.warnings.length ? 'warning' : 'ok')
            : 'error';

        summary.innerHTML = `
            <div class="library-audit-score">
                <span class="material-symbols-rounded">
                    ${report.passed ? 'verified' : 'error_med'}
                </span>
                <div>
                    <strong>
                        ${report.passed ? '没有阻断问题' : `${report.errors.length} 个必须修复的问题`}
                    </strong>
                    <small>
                        共 ${report.total} 词 · 日语 ${report.japanese} · 英语 ${report.english} · 内置 ${report.builtIn} · 提醒 ${report.warnings.length}
                    </small>
                </div>
            </div>
        `;

        const visibleIssues = report.issues.slice(0, 100);

        issueList.innerHTML = visibleIssues.length
            ? visibleIssues.map(issue => {
                return `
                    <div class="library-audit-issue is-${issue.severity}">
                        <span class="material-symbols-rounded">
                            ${issue.severity === 'error' ? 'cancel' : 'error'}
                        </span>
                        <div>
                            <strong>${escapeHTML(issue.word)}</strong>
                            <small>第 ${issue.index + 1} 条 · ${escapeHTML(issue.message)}</small>
                        </div>
                    </div>
                `;
            }).join('')
            : `
                <div class="library-audit-perfect">
                    <span class="material-symbols-rounded">task_alt</span>
                    当前词库通过完整检查，可以继续扩充。
                </div>
            `;

        if (report.issues.length > 100) {
            issueList.insertAdjacentHTML(
                'beforeend',
                `<div class="library-audit-more">另有 ${report.issues.length - 100} 条问题，请在浏览器控制台查看完整报告。</div>`
            );
        }
    };

    Controller.runVocabularyAudit = function() {
        const report = validateVocabularyData(Model.db);
        this.renderVocabularyAudit(report);

        console.groupCollapsed(
            `[词库检查] ${report.errors.length} 错误 / ${report.warnings.length} 提醒`
        );
        console.table(report.issues);
        console.groupEnd();

        showToast(
            report.passed
                ? (report.warnings.length
                    ? `检查完成：${report.warnings.length} 条提醒`
                    : '词库检查通过')
                : `发现 ${report.errors.length} 个必须修复的问题`
        );
    };

    const originalControllerInit =
        Controller.init.bind(Controller);

    Controller.init = async function() {
        await originalControllerInit();

        syncWordbankMetadataFilters();
        this.updateImportMetadataOptions();

        const bindFilter = (id, name) => {
            const select = View.getEl(id);

            if (!select || select.dataset.metaFilterReady === 'true') {
                return;
            }

            select.dataset.metaFilterReady = 'true';
            select.addEventListener('change', () => {
                const lang = Model.state.currentLangMode === 'en'
                    ? 'en'
                    : 'ja';

                localStorage.setItem(
                    getFilterStorageKey(name, lang),
                    select.value
                );

                View.resetWordbankRenderer();
            });
        };

        bindFilter('wb-level-filter', 'level');
        bindFilter('wb-difficulty-filter', 'difficulty');

        View.getEl('btn-run-library-audit')
            ?.addEventListener('click', () => {
                Hardware.vibrate(15);
                this.runVocabularyAudit();
            });

        View.getEl('edit-level')?.addEventListener('change', event => {
            event.target.dispatchEvent(new Event('facade-update'));
        });

        View.getEl('edit-difficulty')?.addEventListener('change', event => {
            event.target.dispatchEvent(new Event('facade-update'));
        });

        decorateWordbankCards();
    };
})();



/* ==========================================
   JLPT 200 词测试包：导入、状态与一键移除
   ========================================== */
(() => {
    const JLPT_TEST_FORMAT = 'zhongri-jlpt-test-bundle';
    const JLPT_TEST_LEVELS = Object.freeze(['N5', 'N3', 'N1']);
    const JLPT_TEST_FOLDER_SUFFIX = ' 测试词库';
    const JLPT_TEST_MAX_FILE_SIZE = 20 * 1024 * 1024;

    const cloneTestValue = value => {
        return cloneDataValue(value);
    };

    const isJLPTTestWord = word => {
        return Boolean(
            word &&
            (
                word.isTestWord === true ||
                word.testBundleId === JLPT_TEST_FORMAT
            )
        );
    };

    const getJLPTTestIdentity = word => {
        const lang = word?.lang === 'en' ? 'en' : 'ja';
        const headword = normalizeHeadword(
            word?.word || '',
            lang
        ).toLowerCase();
        const reading = lang === 'ja'
            ? normalizeKanaText(word?.kana || '')
            : normalizePhoneticText(word?.phonetic || '');

        return `${lang}::${headword}::${reading}`;
    };

    const countJLPTTestLevels = words => {
        const counts = {
            N5: 0,
            N3: 0,
            N1: 0
        };

        words.forEach(word => {
            if (
                Object.prototype.hasOwnProperty.call(
                    counts,
                    word.level
                )
            ) {
                counts[word.level]++;
            }
        });

        return counts;
    };

    const formatJLPTTestDate = value => {
        if (!value) {
            return '未知时间';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '未知时间';
        }

        return date.toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const removeJLPTTestProgress = async wordIds => {
        const idSet = wordIds instanceof Set
            ? wordIds
            : new Set(wordIds || []);

        if (idSet.size === 0) {
            return;
        }

        Model.stars = Model.stars.filter(wordId => {
            return !idSet.has(String(wordId || ''));
        });

        idSet.forEach(wordId => {
            delete Model.mtWordClears[wordId];

            if (
                Model.wrongBook &&
                typeof Model.wrongBook === 'object'
            ) {
                delete Model.wrongBook[wordId];
            }
        });

        const saves = [
            Model.saveStars(),
            Model.saveClears()
        ];

        if (typeof Model.saveWrongBook === 'function') {
            saves.push(Model.saveWrongBook());
        }

        await Promise.all(saves);
    };

    Controller.getJLPTTestWords = function() {
        return Model.db.filter(isJLPTTestWord);
    };

    Controller.updateJLPTTestPackageUI = function() {
        const status = View.getEl('jlpt-test-package-status');
        const summary = View.getEl('jlpt-test-package-summary');
        const removeButton = View.getEl(
            'btn-remove-jlpt-test-package'
        );
        const testWords = this.getJLPTTestWords();
        const counts = countJLPTTestLevels(testWords);
        const importedAt = testWords
            .map(word => word.testImportedAt || word.importedAt || '')
            .filter(Boolean)
            .sort()
            .at(-1) || '';

        if (status) {
            status.textContent = testWords.length
                ? `已导入 ${testWords.length} 词`
                : '未导入';
            status.classList.toggle(
                'is-ready',
                testWords.length > 0
            );
            status.classList.toggle(
                'is-empty',
                testWords.length === 0
            );
        }

        if (removeButton) {
            removeButton.disabled = testWords.length === 0;
        }

        if (!summary) {
            return;
        }

        if (testWords.length === 0) {
            summary.innerHTML = `
                <div>
                    <span>当前状态</span>
                    <strong>尚未导入测试词库</strong>
                </div>
                <div>
                    <span>测试范围</span>
                    <strong>N5 · N3 · N1</strong>
                </div>
            `;
            return;
        }

        summary.innerHTML = `
            <div>
                <span>级别分布</span>
                <strong>
                    N5 ${counts.N5} ·
                    N3 ${counts.N3} ·
                    N1 ${counts.N1}
                </strong>
            </div>
            <div>
                <span>最近导入</span>
                <strong>${escapeHTML(formatJLPTTestDate(importedAt))}</strong>
            </div>
        `;
    };

    Controller.normalizeJLPTTestPackage = function(rawData) {
        if (
            !rawData ||
            rawData.format !== JLPT_TEST_FORMAT ||
            !Array.isArray(rawData.packs)
        ) {
            throw new Error(
                '这不是钟日词库构建器生成的 JLPT 测试包'
            );
        }

        const rawWords = rawData.packs.flatMap(pack => {
            return Array.isArray(pack?.words)
                ? pack.words
                : [];
        });

        if (rawWords.length === 0) {
            throw new Error('测试包中没有词条');
        }

        const importedAt = new Date().toISOString();
        const seenIds = new Set();
        const words = [];
        let rejectedCount = 0;
        let duplicateCount = 0;

        rawWords.forEach(rawWord => {
            if (!rawWord || typeof rawWord !== 'object') {
                rejectedCount++;
                return;
            }

            const rawId = String(rawWord._id || '').trim();
            const level = normalizeWordLevel(
                rawWord.level,
                'ja'
            );

            if (
                !rawId ||
                !JLPT_TEST_LEVELS.includes(level)
            ) {
                rejectedCount++;
                return;
            }

            if (seenIds.has(rawId)) {
                duplicateCount++;
                return;
            }

            const normalized = normalizeWordEntry({
                ...cloneTestValue(rawWord),
                _id: rawId,
                lang: 'ja',
                level,
                folder: `${level}${JLPT_TEST_FOLDER_SUFFIX}`,
                builtIn: false,
                isImported: true,
                importedAt,
                isTestWord: true,
                testBundleId: JLPT_TEST_FORMAT,
                testBundleVersion:
                    Number(rawData.version) || 1,
                testGeneratedAt:
                    rawData.generatedAt || '',
                testImportedAt: importedAt,
                sourceLicense:
                    rawData.license?.name || '',
                sourceAuthor:
                    rawData.license?.author || '',
                sourceUrl:
                    rawData.license?.source || ''
            });

            normalized._id = rawId;
            normalized.builtIn = false;
            normalized.isTestWord = true;
            normalized.testBundleId = JLPT_TEST_FORMAT;
            normalized.testBundleVersion =
                Number(rawData.version) || 1;
            normalized.testGeneratedAt =
                rawData.generatedAt || '';
            normalized.testImportedAt = importedAt;
            normalized.sourceLicense =
                rawData.license?.name || '';
            normalized.sourceAuthor =
                rawData.license?.author || '';
            normalized.sourceUrl =
                rawData.license?.source || '';

            delete normalized._origin;

            if (
                !normalized.word ||
                !normalized.meaning
            ) {
                rejectedCount++;
                return;
            }

            seenIds.add(rawId);
            words.push(normalized);
        });

        if (words.length === 0) {
            throw new Error(
                '测试包中没有可导入的有效词条'
            );
        }

        return {
            format: JLPT_TEST_FORMAT,
            version: Number(rawData.version) || 1,
            generatedAt: rawData.generatedAt || '',
            declaredWordCount:
                Number(rawData.wordCount) || rawWords.length,
            license:
                rawData.license &&
                typeof rawData.license === 'object'
                    ? cloneTestValue(rawData.license)
                    : null,
            testPlan:
                rawData.testPlan &&
                typeof rawData.testPlan === 'object'
                    ? cloneTestValue(rawData.testPlan)
                    : null,
            words,
            rejectedCount,
            duplicateCount
        };
    };

    Controller.getJLPTTestImportPreview = function(bundle) {
        const nonTestWords = Model.db.filter(word => {
            return !isJLPTTestWord(word);
        });
        const nonTestIds = new Set(
            nonTestWords.map(word => Model.getWordId(word))
        );
        const nonTestIdentities = new Set(
            nonTestWords.map(getJLPTTestIdentity)
        );
        let idCollisions = 0;
        let wordCollisions = 0;

        bundle.words.forEach(word => {
            if (nonTestIds.has(word._id)) {
                idCollisions++;
                return;
            }

            if (
                nonTestIdentities.has(
                    getJLPTTestIdentity(word)
                )
            ) {
                wordCollisions++;
            }
        });

        return {
            idCollisions,
            wordCollisions,
            importableCount: Math.max(
                0,
                bundle.words.length -
                    idCollisions -
                    wordCollisions
            )
        };
    };

    Controller.renderJLPTTestPackageSummary = function(
        bundle,
        preview
    ) {
        const counts = countJLPTTestLevels(bundle.words);
        const frequencyCounts = {
            高频: 0,
            中频: 0,
            低频: 0,
            未设置: 0
        };

        bundle.words.forEach(word => {
            const key = ['高频', '中频', '低频'].includes(
                word.frequency
            )
                ? word.frequency
                : '未设置';
            frequencyCounts[key]++;
        });

        const licenseName =
            bundle.license?.name || '未注明';
        const author =
            bundle.license?.author || '未注明';

        return `
            <div class="jlpt-test-confirm-summary">
                <div>
                    <span>有效词条</span>
                    <strong>${bundle.words.length}</strong>
                </div>
                <div>
                    <span>预计导入</span>
                    <strong>${preview.importableCount}</strong>
                </div>
                <div>
                    <span>级别</span>
                    <strong>
                        N5 ${counts.N5} ·
                        N3 ${counts.N3} ·
                        N1 ${counts.N1}
                    </strong>
                </div>
                <div>
                    <span>频率</span>
                    <strong>
                        高 ${frequencyCounts.高频} ·
                        中 ${frequencyCounts.中频} ·
                        低 ${frequencyCounts.低频}
                    </strong>
                </div>
            </div>
            <div style="
                margin-top: 12px;
                font-size: .78rem;
                line-height: 1.7;
                opacity: .72;
            ">
                格式：${escapeHTML(bundle.format)} v${bundle.version}<br>
                许可：${escapeHTML(licenseName)} · 作者 ${escapeHTML(author)}
            </div>
            ${
                preview.idCollisions ||
                preview.wordCollisions ||
                bundle.rejectedCount ||
                bundle.duplicateCount
                    ? `
                        <div style="
                            margin-top: 12px;
                            color: var(--accent-red);
                            font-size: .78rem;
                            line-height: 1.7;
                        ">
                            将跳过：ID 冲突 ${preview.idCollisions}、
                            现有同词 ${preview.wordCollisions}、
                            无效 ${bundle.rejectedCount}、
                            包内重复 ${bundle.duplicateCount}。
                        </div>
                    `
                    : ''
            }
        `;
    };

    Controller.applyJLPTTestPackage = async function(bundle) {
        const oldTestWords = this.getJLPTTestWords();
        const oldTestIds = new Set(
            oldTestWords.map(word => Model.getWordId(word))
        );
        const remainingWords = Model.db.filter(word => {
            return !isJLPTTestWord(word);
        });
        const occupiedIds = new Set(
            remainingWords.map(word => Model.getWordId(word))
        );
        const occupiedIdentities = new Set(
            remainingWords.map(getJLPTTestIdentity)
        );
        const importedIds = new Set();
        let skippedId = 0;
        let skippedWord = 0;

        bundle.words.forEach(word => {
            if (occupiedIds.has(word._id)) {
                skippedId++;
                return;
            }

            const identity = getJLPTTestIdentity(word);

            if (occupiedIdentities.has(identity)) {
                skippedWord++;
                return;
            }

            const copy = cloneTestValue(word);
            remainingWords.push(copy);
            occupiedIds.add(copy._id);
            occupiedIdentities.add(identity);
            importedIds.add(copy._id);
        });

        Model.db = remainingWords;

        const staleIds = new Set(
            [...oldTestIds].filter(wordId => {
                return !importedIds.has(wordId);
            })
        );

        await removeJLPTTestProgress(staleIds);

        const usedFolders = new Set(
            Model.db.map(word => word.folder).filter(Boolean)
        );

        JLPT_TEST_LEVELS.forEach(level => {
            const folder = `${level}${JLPT_TEST_FOLDER_SUFFIX}`;

            if (usedFolders.has(folder)) {
                if (!Model.folders.includes(folder)) {
                    Model.folders.push(folder);
                }

                Model.folderLangs[folder] = 'ja';
                return;
            }

            Model.folders = Model.folders.filter(item => {
                return item !== folder;
            });
            delete Model.folderLangs[folder];
        });

        await Promise.all([
            Model.saveDB(),
            Model.saveFolders(),
            Model.saveFolderLangs()
        ]);

        return {
            imported: importedIds.size,
            skippedId,
            skippedWord,
            replaced: oldTestWords.length
        };
    };

    Controller.importJLPTTestPackage = async function(file) {
        if (!file) {
            return;
        }

        if (file.size > JLPT_TEST_MAX_FILE_SIZE) {
            Hardware.playSound('error');
            Hardware.vibrate(50);
            showToast('测试包文件过大');
            return;
        }

        try {
            const rawData = JSON.parse(await file.text());
            const bundle = this.normalizeJLPTTestPackage(rawData);
            const preview = this.getJLPTTestImportPreview(bundle);

            if (preview.importableCount === 0) {
                Hardware.playSound('error');
                Hardware.vibrate(50);
                showToast('测试包中的词条均与现有词库冲突');
                return;
            }

            const summary = this.renderJLPTTestPackageSummary(
                bundle,
                preview
            );

            showConfirm(
                '导入 JLPT 测试词库？',
                `
                    ${summary}
                    <div style="
                        margin-top: 14px;
                        color: var(--accent-red);
                        font-size: .8rem;
                        line-height: 1.7;
                    ">
                        已存在的测试词库会被本次测试包替换。
                        现有内置词与个人词汇不会被覆盖，
                        操作前会自动保存恢复点。
                    </div>
                `,
                async () => {
                    let restorePoint = null;

                    try {
                        showToast('正在导入测试词库…');
                        restorePoint = await this.storePreImportRestorePoint(
                            'pre-jlpt-test-import'
                        );
                        const result = await this.applyJLPTTestPackage(
                            bundle
                        );

                        await this.updateRestorePointUI();
                        this.refreshAfterDataOperation();
                        this.updateJLPTTestPackageUI();

                        Hardware.playSound('success');
                        Hardware.vibrate(100);

                        const details = [];
                        details.push(`导入 ${result.imported} 词`);

                        if (result.skippedId) {
                            details.push(`跳过 ID 冲突 ${result.skippedId}`);
                        }

                        if (result.skippedWord) {
                            details.push(`跳过现有同词 ${result.skippedWord}`);
                        }

                        showToast(details.join('，'));
                    } catch (error) {
                        console.error(
                            '[JLPT Test] 测试包导入失败',
                            error
                        );

                        if (restorePoint) {
                            try {
                                await this.applyBackupPayload(
                                    restorePoint
                                );
                                showToast('导入失败，已恢复原数据');
                            } catch (restoreError) {
                                console.error(
                                    '[JLPT Test] 自动恢复失败',
                                    restoreError
                                );
                                showToast('导入失败，自动恢复也失败');
                            }
                        } else {
                            showToast('导入失败，未修改数据');
                        }

                        Hardware.playSound('error');
                        Hardware.vibrate(50);
                    }
                }
            );
        } catch (error) {
            console.error(
                '[JLPT Test] 无法读取测试包',
                error
            );
            Hardware.playSound('error');
            Hardware.vibrate(50);
            showToast(
                error?.message || '无法读取测试包'
            );
        }
    };

    Controller.removeJLPTTestPackage = async function() {
        const testWords = this.getJLPTTestWords();

        if (testWords.length === 0) {
            showToast('当前没有测试词库');
            this.updateJLPTTestPackageUI();
            return;
        }

        const counts = countJLPTTestLevels(testWords);

        showConfirm(
            '移除 JLPT 测试词库？',
            `
                <div style="text-align:left;line-height:1.75;">
                    将移除 ${testWords.length} 个测试词：<br>
                    N5 ${counts.N5} · N3 ${counts.N3} · N1 ${counts.N1}
                </div>
                <div style="
                    margin-top: 14px;
                    color: var(--accent-red);
                    font-size: .82rem;
                    line-height: 1.7;
                ">
                    同时清理这些测试词的收藏、掌握状态和错题记录。
                    现有内置词、个人词汇及其他学习记录不会受影响。
                    操作前会自动保存恢复点。
                </div>
            `,
            async () => {
                const testIds = new Set(
                    testWords.map(word => Model.getWordId(word))
                );

                await this.runSafeDataOperation(
                    'pre-remove-jlpt-test',
                    async () => {
                        Model.db = Model.db.filter(word => {
                            return !isJLPTTestWord(word);
                        });

                        await removeJLPTTestProgress(testIds);

                        const usedFolders = new Set(
                            Model.db
                                .map(word => word.folder)
                                .filter(Boolean)
                        );

                        JLPT_TEST_LEVELS.forEach(level => {
                            const folder =
                                `${level}${JLPT_TEST_FOLDER_SUFFIX}`;

                            if (!usedFolders.has(folder)) {
                                Model.folders = Model.folders.filter(
                                    item => item !== folder
                                );
                                delete Model.folderLangs[folder];
                            }
                        });

                        await Promise.all([
                            Model.saveDB(),
                            Model.saveFolders(),
                            Model.saveFolderLangs()
                        ]);
                    },
                    `已移除 ${testWords.length} 个测试词`
                );

                this.updateJLPTTestPackageUI();
            }
        );
    };

    const originalControllerInitForJLPTTest =
        Controller.init.bind(Controller);

    Controller.init = async function() {
        await originalControllerInitForJLPTTest();

        const importButton = View.getEl(
            'btn-import-jlpt-test-package'
        );
        const removeButton = View.getEl(
            'btn-remove-jlpt-test-package'
        );
        const fileInput = View.getEl(
            'file-import-jlpt-test-package'
        );

        if (
            importButton &&
            fileInput &&
            importButton.dataset.jlptTestReady !== 'true'
        ) {
            importButton.dataset.jlptTestReady = 'true';
            importButton.addEventListener('click', () => {
                Hardware.playSound('click');
                Hardware.vibrate(15);
                fileInput.click();
            });

            fileInput.addEventListener('change', event => {
                const file = event.target.files?.[0];

                if (file) {
                    this.importJLPTTestPackage(file);
                }

                event.target.value = '';
            });
        }

        if (
            removeButton &&
            removeButton.dataset.jlptTestReady !== 'true'
        ) {
            removeButton.dataset.jlptTestReady = 'true';
            removeButton.addEventListener('click', () => {
                Hardware.playSound('click');
                Hardware.vibrate(15);
                this.removeJLPTTestPackage();
            });
        }

                this.updateJLPTTestPackageUI();
    };
})();


/* ==========================================
   完整词库压力测试：兼容 200 词包与完整 JSON 包
   ========================================== */
(() => {
    const SAMPLE_PACKAGE_FORMAT =
        'zhongri-jlpt-test-bundle';

    const FULL_PACKAGE_FORMAT =
        'zhongri-wordbank-bundle';

    const ACCEPTED_PACKAGE_FORMATS = new Set([
        SAMPLE_PACKAGE_FORMAT,
        FULL_PACKAGE_FORMAT
    ]);

    const PACKAGE_LEVELS = Object.freeze([
        'N5',
        'N4',
        'N3',
        'N2',
        'N1',
        'CET-4',
        'CET-6'
    ]);

    const ACTIVE_FOLDER_SUFFIX =
        ' 压力测试词库';

    const MANAGED_FOLDER_SUFFIXES = Object.freeze([
        ' 测试词库',
        ACTIVE_FOLDER_SUFFIX
    ]);

    const MAX_PACKAGE_FILE_SIZE =
        80 * 1024 * 1024;

    const IMPORT_CHUNK_SIZE = 250;

    const clonePackageValue = value => {
        return cloneDataValue(value);
    };

    const yieldToBrowser = () => {
        return new Promise(resolve => {
            setTimeout(resolve, 0);
        });
    };

    const isManagedPackageWord = word => {
        return Boolean(
            word &&
            (
                word.isTestWord === true ||
                ACCEPTED_PACKAGE_FORMATS.has(
                    String(word.testBundleId || '')
                )
            )
        );
    };

    const getPackageIdentity = word => {
        const lang =
            word?.lang === 'en' ? 'en' : 'ja';

        const headword = normalizeHeadword(
            word?.word || '',
            lang
        ).toLowerCase();

        const reading = lang === 'ja'
            ? normalizeKanaText(word?.kana || '')
            : normalizePhoneticText(
                word?.phonetic || ''
            );

        return `${lang}::${headword}::${reading}`;
    };

    const countPackageLevels = words => {
        const counts = Object.fromEntries(
            PACKAGE_LEVELS.map(level => [
                level,
                0
            ])
        );

        words.forEach(word => {
            if (
                Object.prototype.hasOwnProperty.call(
                    counts,
                    word.level
                )
            ) {
                counts[word.level]++;
            }
        });

        return counts;
    };

    const formatPackageDate = value => {
        if (!value) {
            return '未知时间';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '未知时间';
        }

        return date.toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const removePackageProgress =
        async wordIds => {
            const idSet =
                wordIds instanceof Set
                    ? wordIds
                    : new Set(wordIds || []);

            if (idSet.size === 0) {
                return;
            }

            Model.stars =
                Model.stars.filter(wordId => {
                    return !idSet.has(
                        String(wordId || '')
                    );
                });

            idSet.forEach(wordId => {
                delete Model.mtWordClears[wordId];

                if (
                    Model.wrongBook &&
                    typeof Model.wrongBook ===
                        'object'
                ) {
                    delete Model.wrongBook[wordId];
                }
            });

            const saves = [
                Model.saveStars(),
                Model.saveClears()
            ];

            if (
                typeof Model.saveWrongBook ===
                'function'
            ) {
                saves.push(
                    Model.saveWrongBook()
                );
            }

            await Promise.all(saves);
        };

    Controller.setJLPTTestPackageProgress =
        function(
            percent,
            text,
            visible = true
        ) {
            const box = View.getEl(
                'jlpt-test-package-progress'
            );

            const bar = View.getEl(
                'jlpt-test-package-progress-bar'
            );

            const label = View.getEl(
                'jlpt-test-package-progress-text'
            );

            const value = View.getEl(
                'jlpt-test-package-progress-value'
            );

            const safePercent = Math.max(
                0,
                Math.min(
                    100,
                    Math.round(
                        Number(percent) || 0
                    )
                )
            );

            if (box) {
                box.hidden = !visible;
            }

            if (bar) {
                bar.style.width =
                    `${safePercent}%`;
            }

            if (label) {
                label.textContent =
                    text || '准备中…';
            }

            if (value) {
                value.textContent =
                    `${safePercent}%`;
            }
        };

    Controller.updateJLPTTestPackageUI =
        function() {
            const status = View.getEl(
                'jlpt-test-package-status'
            );

            const summary = View.getEl(
                'jlpt-test-package-summary'
            );

            const removeButton = View.getEl(
                'btn-remove-jlpt-test-package'
            );

            const packageWords =
                Model.db.filter(
                    isManagedPackageWord
                );

            const counts =
                countPackageLevels(
                    packageWords
                );

            const japaneseCount =
                packageWords.filter(word => {
                    return (
                        word.lang || 'ja'
                    ) === 'ja';
                }).length;

            const englishCount =
                packageWords.length -
                japaneseCount;

            const latestWord = [
                ...packageWords
            ].sort((left, right) => {
                return String(
                    right.testImportedAt ||
                    right.importedAt ||
                    ''
                ).localeCompare(
                    String(
                        left.testImportedAt ||
                        left.importedAt ||
                        ''
                    )
                );
            })[0];

            const importedAt = latestWord
                ? (
                    latestWord.testImportedAt ||
                    latestWord.importedAt ||
                    ''
                )
                : '';

            const packageName =
                latestWord?.testBundleId ===
                FULL_PACKAGE_FORMAT
                    ? '完整压力测试包'
                    : '200 词测试包';

            if (status) {
                status.textContent =
                    packageWords.length
                        ? `已导入 ${packageWords.length.toLocaleString()} 词`
                        : '未导入';

                status.classList.toggle(
                    'is-ready',
                    packageWords.length > 0
                );

                status.classList.toggle(
                    'is-empty',
                    packageWords.length === 0
                );
            }

            if (removeButton) {
                removeButton.disabled =
                    packageWords.length === 0;
            }

            if (!summary) {
                return;
            }

            if (packageWords.length === 0) {
                summary.innerHTML = `
                    <div>
                        <span>当前状态</span>
                        <strong>尚未导入测试词库</strong>
                    </div>
                    <div>
                        <span>支持文件</span>
                        <strong>200 词包 · 完整 JSON 包</strong>
                    </div>
                `;

                return;
            }

            const englishSummary =
                englishCount
                    ? (
                        ` · 四级 ${counts['CET-4']}` +
                        ` · 六级 ${counts['CET-6']}`
                    )
                    : '';

            summary.innerHTML = `
                <div>
                    <span>${escapeHTML(packageName)}</span>
                    <strong>
                        日语 ${japaneseCount.toLocaleString()}
                        ${
                            englishCount
                                ? ` · 英语 ${englishCount.toLocaleString()}`
                                : ''
                        }
                    </strong>
                </div>

                <div>
                    <span>级别分布</span>
                    <strong>
                        N5 ${counts.N5} ·
                        N4 ${counts.N4} ·
                        N3 ${counts.N3} ·
                        N2 ${counts.N2} ·
                        N1 ${counts.N1}
                        ${englishSummary}
                    </strong>
                </div>

                <div>
                    <span>最近导入</span>
                    <strong>
                        ${escapeHTML(
                            formatPackageDate(
                                importedAt
                            )
                        )}
                    </strong>
                </div>

                <div>
                    <span>保存方式</span>
                    <strong>独立压力测试词库</strong>
                </div>
            `;
        };

    Controller.normalizeJLPTTestPackage =
        async function(
            rawData,
            onProgress = () => {}
        ) {
            if (
                !rawData ||
                !ACCEPTED_PACKAGE_FORMATS.has(
                    rawData.format
                ) ||
                !Array.isArray(rawData.packs)
            ) {
                throw new Error(
                    '请选择构建器导出的 200 词包或完整 JSON 词库包'
                );
            }

            const rawWords = [];

            rawData.packs.forEach(pack => {
                if (
                    Array.isArray(pack?.words)
                ) {
                    rawWords.push(
                        ...pack.words
                    );
                }
            });

            if (rawWords.length === 0) {
                throw new Error(
                    '词库包中没有词条'
                );
            }

            const importedAt =
                new Date().toISOString();

            const seenIds = new Set();
            const words = [];

            let rejectedCount = 0;
            let duplicateCount = 0;

            for (
                let start = 0;
                start < rawWords.length;
                start += IMPORT_CHUNK_SIZE
            ) {
                const end = Math.min(
                    rawWords.length,
                    start + IMPORT_CHUNK_SIZE
                );

                for (
                    let index = start;
                    index < end;
                    index++
                ) {
                    const rawWord =
                        rawWords[index];

                    if (
                        !rawWord ||
                        typeof rawWord !==
                            'object'
                    ) {
                        rejectedCount++;
                        continue;
                    }

                    const rawId = String(
                        rawWord._id || ''
                    ).trim();

                    const lang =
                        rawWord.lang === 'en'
                            ? 'en'
                            : 'ja';

                    const level =
                        normalizeWordLevel(
                            rawWord.level,
                            lang
                        );

                    if (
                        !rawId ||
                        !PACKAGE_LEVELS.includes(
                            level
                        )
                    ) {
                        rejectedCount++;
                        continue;
                    }

                    if (seenIds.has(rawId)) {
                        duplicateCount++;
                        continue;
                    }

                    const normalized =
                        normalizeWordEntry({
                            ...clonePackageValue(
                                rawWord
                            ),
                            _id: rawId,
                            lang,
                            level,
                            folder:
                                `${level}${ACTIVE_FOLDER_SUFFIX}`,
                            builtIn: false,
                            isImported: true,
                            importedAt,
                            isTestWord: true,
                            testBundleId:
                                rawData.format,
                            testBundleVersion:
                                Number(
                                    rawData.version
                                ) || 1,
                            testGeneratedAt:
                                rawData.generatedAt ||
                                '',
                            testImportedAt:
                                importedAt,
                            sourceLicense:
                                rawData.license
                                    ?.name || '',
                            sourceAuthor:
                                rawData.license
                                    ?.author || '',
                            sourceUrl:
                                rawData.license
                                    ?.source || ''
                        });

                    normalized._id = rawId;
                    normalized.builtIn = false;
                    normalized.isImported = true;
                    normalized.isTestWord = true;
                    normalized.testBundleId =
                        rawData.format;

                    normalized.testBundleVersion =
                        Number(
                            rawData.version
                        ) || 1;

                    normalized.testGeneratedAt =
                        rawData.generatedAt || '';

                    normalized.testImportedAt =
                        importedAt;

                    normalized.sourceLicense =
                        rawData.license?.name || '';

                    normalized.sourceAuthor =
                        rawData.license?.author || '';

                    normalized.sourceUrl =
                        rawData.license?.source || '';

                    delete normalized._origin;

                    if (
                        !normalized.word ||
                        !normalized.meaning
                    ) {
                        rejectedCount++;
                        continue;
                    }

                    seenIds.add(rawId);
                    words.push(normalized);
                }

                onProgress(
                    12 +
                        (
                            end /
                            rawWords.length
                        ) * 48,
                    `正在整理词条 ${end.toLocaleString()} / ${rawWords.length.toLocaleString()}`
                );

                await yieldToBrowser();
            }

            if (words.length === 0) {
                throw new Error(
                    '词库包中没有可导入的有效词条'
                );
            }

            return {
                format: rawData.format,
                version:
                    Number(
                        rawData.version
                    ) || 1,
                generatedAt:
                    rawData.generatedAt || '',
                declaredWordCount:
                    Number(
                        rawData.wordCount
                    ) || rawWords.length,
                license:
                    rawData.license &&
                    typeof rawData.license ===
                        'object'
                        ? clonePackageValue(
                            rawData.license
                        )
                        : null,
                testPlan:
                    rawData.testPlan &&
                    typeof rawData.testPlan ===
                        'object'
                        ? clonePackageValue(
                            rawData.testPlan
                        )
                        : null,
                words,
                rejectedCount,
                duplicateCount
            };
        };

    Controller.renderJLPTTestPackageSummary =
        function(bundle, preview) {
            const counts =
                countPackageLevels(
                    bundle.words
                );

            const frequencyCounts = {
                高频: 0,
                中频: 0,
                低频: 0,
                未设置: 0
            };

            const japaneseCount =
                bundle.words.filter(word => {
                    return (
                        word.lang || 'ja'
                    ) === 'ja';
                }).length;

            const englishCount =
                bundle.words.length -
                japaneseCount;

            bundle.words.forEach(word => {
                const key = [
                    '高频',
                    '中频',
                    '低频'
                ].includes(word.frequency)
                    ? word.frequency
                    : '未设置';

                frequencyCounts[key]++;
            });

            const licenseName =
                bundle.license?.name ||
                '未注明';

            const author =
                bundle.license?.author ||
                '未注明';

            const packageName =
                bundle.format ===
                FULL_PACKAGE_FORMAT
                    ? '完整压力测试包'
                    : '200 词测试包';

            return `
                <div class="jlpt-test-confirm-summary">
                    <div>
                        <span>文件类型</span>
                        <strong>${escapeHTML(packageName)}</strong>
                    </div>

                    <div>
                        <span>有效词条</span>
                        <strong>${bundle.words.length.toLocaleString()}</strong>
                    </div>

                    <div>
                        <span>预计导入</span>
                        <strong>${preview.importableCount.toLocaleString()}</strong>
                    </div>

                    <div>
                        <span>语言</span>
                        <strong>
                            日语 ${japaneseCount.toLocaleString()}
                            ${
                                englishCount
                                    ? ` · 英语 ${englishCount.toLocaleString()}`
                                    : ''
                            }
                        </strong>
                    </div>

                    <div>
                        <span>JLPT 级别</span>
                        <strong>
                            N5 ${counts.N5} ·
                            N4 ${counts.N4} ·
                            N3 ${counts.N3} ·
                            N2 ${counts.N2} ·
                            N1 ${counts.N1}
                        </strong>
                    </div>

                    <div>
                        <span>频率</span>
                        <strong>
                            高 ${frequencyCounts.高频} ·
                            中 ${frequencyCounts.中频} ·
                            低 ${frequencyCounts.低频}
                        </strong>
                    </div>
                </div>

                <div style="
                    margin-top: 12px;
                    font-size: .78rem;
                    line-height: 1.7;
                    opacity: .72;
                ">
                    格式：${escapeHTML(bundle.format)} v${bundle.version}<br>
                    许可：${escapeHTML(licenseName)} · 作者 ${escapeHTML(author)}
                </div>

                ${
                    preview.idCollisions ||
                    preview.wordCollisions ||
                    bundle.rejectedCount ||
                    bundle.duplicateCount
                        ? `
                            <div style="
                                margin-top: 12px;
                                color: var(--accent-red);
                                font-size: .78rem;
                                line-height: 1.7;
                            ">
                                将跳过：
                                ID 冲突 ${preview.idCollisions}、
                                现有同词 ${preview.wordCollisions}、
                                无效 ${bundle.rejectedCount}、
                                包内重复 ID ${bundle.duplicateCount}。
                            </div>
                        `
                        : ''
                }
            `;
        };

    Controller.applyJLPTTestPackage =
        async function(
            bundle,
            onProgress = () => {}
        ) {
            const oldPackageWords =
                Model.db.filter(
                    isManagedPackageWord
                );

            const oldPackageIds = new Set(
                oldPackageWords.map(word => {
                    return Model.getWordId(word);
                })
            );

            const remainingWords =
                Model.db.filter(word => {
                    return !isManagedPackageWord(
                        word
                    );
                });

            const occupiedIds = new Set(
                remainingWords.map(word => {
                    return Model.getWordId(word);
                })
            );

            const existingIdentities =
                new Set(
                    remainingWords.map(
                        getPackageIdentity
                    )
                );

            const importedIds = new Set();

            let skippedId = 0;
            let skippedWord = 0;

            for (
                let start = 0;
                start < bundle.words.length;
                start += IMPORT_CHUNK_SIZE
            ) {
                const end = Math.min(
                    bundle.words.length,
                    start + IMPORT_CHUNK_SIZE
                );

                for (
                    let index = start;
                    index < end;
                    index++
                ) {
                    const word =
                        bundle.words[index];

                    if (
                        occupiedIds.has(
                            word._id
                        )
                    ) {
                        skippedId++;
                        continue;
                    }

                    const identity =
                        getPackageIdentity(word);

                    if (
                        existingIdentities.has(
                            identity
                        )
                    ) {
                        skippedWord++;
                        continue;
                    }

                    const copy =
                        clonePackageValue(word);

                    remainingWords.push(copy);
                    occupiedIds.add(copy._id);
                    importedIds.add(copy._id);
                }

                onProgress(
                    62 +
                        (
                            end /
                            bundle.words.length
                        ) * 25,
                    `正在加入词库 ${end.toLocaleString()} / ${bundle.words.length.toLocaleString()}`
                );

                await yieldToBrowser();
            }

            Model.db = remainingWords;

            const staleIds = new Set(
                [...oldPackageIds].filter(
                    wordId => {
                        return !importedIds.has(
                            wordId
                        );
                    }
                )
            );

            await removePackageProgress(
                staleIds
            );

            const usedFolders = new Map();

            Model.db.forEach(word => {
                if (word.folder) {
                    usedFolders.set(
                        word.folder,
                        word.lang === 'en'
                            ? 'en'
                            : 'ja'
                    );
                }
            });

            PACKAGE_LEVELS.forEach(level => {
                MANAGED_FOLDER_SUFFIXES.forEach(
                    suffix => {
                        const folder =
                            `${level}${suffix}`;

                        if (
                            usedFolders.has(
                                folder
                            )
                        ) {
                            if (
                                !Model.folders.includes(
                                    folder
                                )
                            ) {
                                Model.folders.push(
                                    folder
                                );
                            }

                            Model.folderLangs[folder] =
                                usedFolders.get(
                                    folder
                                );

                            return;
                        }

                        Model.folders =
                            Model.folders.filter(
                                item => {
                                    return (
                                        item !== folder
                                    );
                                }
                            );

                        delete Model.folderLangs[
                            folder
                        ];
                    }
                );
            });

            onProgress(
                92,
                '正在保存到设备…'
            );

            await yieldToBrowser();

            await Promise.all([
                Model.saveDB(),
                Model.saveFolders(),
                Model.saveFolderLangs()
            ]);

            onProgress(
                100,
                '导入完成'
            );

            return {
                imported: importedIds.size,
                skippedId,
                skippedWord,
                replaced:
                    oldPackageWords.length
            };
        };

    Controller.importJLPTTestPackage =
        async function(file) {
            if (!file) {
                return;
            }

            if (
                file.size >
                MAX_PACKAGE_FILE_SIZE
            ) {
                Hardware.playSound('error');
                Hardware.vibrate(50);

                showToast(
                    '词库包超过 80MB，暂不支持导入'
                );

                return;
            }

            try {
                this.setJLPTTestPackageProgress(
                    3,
                    '正在读取 JSON 文件…'
                );

                const rawText =
                    await file.text();

                this.setJLPTTestPackageProgress(
                    8,
                    '正在解析词库结构…'
                );

                await yieldToBrowser();

                const rawData =
                    JSON.parse(rawText);

                const bundle =
                    await this
                        .normalizeJLPTTestPackage(
                            rawData,
                            (
                                percent,
                                text
                            ) => {
                                this.setJLPTTestPackageProgress(
                                    percent,
                                    text
                                );
                            }
                        );

                const preview =
                    this.getJLPTTestImportPreview(
                        bundle
                    );

                if (
                    preview.importableCount === 0
                ) {
                    this.setJLPTTestPackageProgress(
                        0,
                        '',
                        false
                    );

                    Hardware.playSound('error');
                    Hardware.vibrate(50);

                    showToast(
                        '词库包中的词条均与现有词库冲突'
                    );

                    return;
                }

                const summary =
                    this.renderJLPTTestPackageSummary(
                        bundle,
                        preview
                    );

                this.setJLPTTestPackageProgress(
                    0,
                    '',
                    false
                );

                showConfirm(
                    bundle.format ===
                        FULL_PACKAGE_FORMAT
                        ? '导入完整压力测试词库？'
                        : '导入 200 词测试包？',
                    `
                        ${summary}

                        <div style="
                            margin-top: 14px;
                            color: var(--accent-red);
                            font-size: .8rem;
                            line-height: 1.7;
                        ">
                            已存在的测试词库会被本次文件替换。
                            现有内置词与个人词汇不会被覆盖，
                            操作前会自动保存恢复点。
                        </div>
                    `,
                    async () => {
                        let restorePoint = null;

                        try {
                            this.setJLPTTestPackageProgress(
                                61,
                                '正在准备写入词库…'
                            );

                            restorePoint =
                                await this
                                    .storePreImportRestorePoint(
                                        'pre-wordbank-stress-import'
                                    );

                            const result =
                                await this
                                    .applyJLPTTestPackage(
                                        bundle,
                                        (
                                            percent,
                                            text
                                        ) => {
                                            this.setJLPTTestPackageProgress(
                                                percent,
                                                text
                                            );
                                        }
                                    );

                            await this
                                .updateRestorePointUI();

                            this.refreshAfterDataOperation();
                            this.updateJLPTTestPackageUI();

                            Hardware.playSound(
                                'success'
                            );

                            Hardware.vibrate(100);

                            const details = [];

                            details.push(
                                `导入 ${result.imported.toLocaleString()} 词`
                            );

                            if (result.skippedId) {
                                details.push(
                                    `跳过 ID 冲突 ${result.skippedId}`
                                );
                            }

                            if (
                                result.skippedWord
                            ) {
                                details.push(
                                    `跳过现有同词 ${result.skippedWord}`
                                );
                            }

                            showToast(
                                details.join('，')
                            );

                            setTimeout(() => {
                                this.setJLPTTestPackageProgress(
                                    0,
                                    '',
                                    false
                                );
                            }, 1600);
                        } catch (error) {
                            console.error(
                                '[Wordbank Stress Test] 词库包导入失败',
                                error
                            );

                            if (restorePoint) {
                                try {
                                    await this
                                        .applyBackupPayload(
                                            restorePoint
                                        );

                                    this.refreshAfterDataOperation();
                                    this.updateJLPTTestPackageUI();

                                    showToast(
                                        '导入失败，已恢复原数据'
                                    );
                                } catch (
                                    restoreError
                                ) {
                                    console.error(
                                        '[Wordbank Stress Test] 自动恢复失败',
                                        restoreError
                                    );

                                    showToast(
                                        '导入失败，自动恢复也失败'
                                    );
                                }
                            } else {
                                showToast(
                                    '导入失败，未修改数据'
                                );
                            }

                            this.setJLPTTestPackageProgress(
                                0,
                                '',
                                false
                            );

                            Hardware.playSound(
                                'error'
                            );

                            Hardware.vibrate(50);
                        }
                    }
                );
            } catch (error) {
                console.error(
                    '[Wordbank Stress Test] 无法读取词库包',
                    error
                );

                this.setJLPTTestPackageProgress(
                    0,
                    '',
                    false
                );

                Hardware.playSound('error');
                Hardware.vibrate(50);

                showToast(
                    error?.message ||
                    '无法读取词库包'
                );
            }
        };

    Controller.removeJLPTTestPackage =
        async function() {
            const packageWords =
                Model.db.filter(
                    isManagedPackageWord
                );

            if (
                packageWords.length === 0
            ) {
                showToast(
                    '当前没有压力测试词库'
                );

                this.updateJLPTTestPackageUI();
                return;
            }

            const counts =
                countPackageLevels(
                    packageWords
                );

            showConfirm(
                '移除压力测试词库？',
                `
                    <div style="
                        text-align: left;
                        line-height: 1.75;
                    ">
                        将移除
                        ${packageWords.length.toLocaleString()}
                        个测试词：<br>

                        N5 ${counts.N5} ·
                        N4 ${counts.N4} ·
                        N3 ${counts.N3} ·
                        N2 ${counts.N2} ·
                        N1 ${counts.N1}
                    </div>

                    <div style="
                        margin-top: 14px;
                        color: var(--accent-red);
                        font-size: .82rem;
                        line-height: 1.7;
                    ">
                        同时清理这些测试词的收藏、
                        掌握状态和错题记录。
                        现有内置词、个人词汇及其他学习记录不会受影响。
                        操作前会自动保存恢复点。
                    </div>
                `,
                async () => {
                    const packageIds =
                        new Set(
                            packageWords.map(
                                word => {
                                    return Model
                                        .getWordId(
                                            word
                                        );
                                }
                            )
                        );

                    await this.runSafeDataOperation(
                        'pre-remove-wordbank-stress-test',
                        async () => {
                            Model.db =
                                Model.db.filter(
                                    word => {
                                        return !isManagedPackageWord(
                                            word
                                        );
                                    }
                                );

                            await removePackageProgress(
                                packageIds
                            );

                            const usedFolders =
                                new Set(
                                    Model.db
                                        .map(word => {
                                            return word.folder;
                                        })
                                        .filter(Boolean)
                                );

                            PACKAGE_LEVELS.forEach(
                                level => {
                                    MANAGED_FOLDER_SUFFIXES.forEach(
                                        suffix => {
                                            const folder =
                                                `${level}${suffix}`;

                                            if (
                                                !usedFolders.has(
                                                    folder
                                                )
                                            ) {
                                                Model.folders =
                                                    Model.folders.filter(
                                                        item => {
                                                            return (
                                                                item !==
                                                                folder
                                                            );
                                                        }
                                                    );

                                                delete Model.folderLangs[
                                                    folder
                                                ];
                                            }
                                        }
                                    );
                                }
                            );

                            await Promise.all([
                                Model.saveDB(),
                                Model.saveFolders(),
                                Model.saveFolderLangs()
                            ]);
                        },
                        `已移除 ${packageWords.length.toLocaleString()} 个测试词`
                    );

                    this.updateJLPTTestPackageUI();
                }
            );
        };

    const originalControllerInitForStressTest =
        Controller.init.bind(Controller);

    Controller.init = async function() {
        await originalControllerInitForStressTest();

        this.updateJLPTTestPackageUI();

        this.setJLPTTestPackageProgress(
            0,
            '',
            false
        );
    };
})();

window.onload = () => {
    const visibilityBtn =
        document.getElementById('prompt-visibility');

    const input =
        document.getElementById('prompt-input');

    if (visibilityBtn && input) {
        visibilityBtn.addEventListener('click', () => {
            Hardware.vibrate(10);

            const shouldShow =
                input.type === 'password';

            input.type =
                shouldShow ? 'text' : 'password';

            const icon =
                visibilityBtn.querySelector(
                    '.material-symbols-rounded'
                );

            if (icon) {
                icon.textContent =
                    shouldShow
                        ? 'visibility_off'
                        : 'visibility';
            }

            visibilityBtn.title =
                shouldShow ? '隐藏密钥' : '显示密钥';

            visibilityBtn.setAttribute(
                'aria-label',
                shouldShow ? '隐藏密钥' : '显示密钥'
            );

            input.focus();

            try {
                input.setSelectionRange(
                    input.value.length,
                    input.value.length
                );
            } catch (error) {}
        });
    }

    Controller.init();
};
