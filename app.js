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
const PENDING_STORAGE_PREFIX = 'zhongriPendingStorage_v1:';

const CORE_UTILS = globalThis.ZhongriCoreUtils;
const HAPTICS = globalThis.ZhongriHaptics;
const WORD_BANK_LOADER = globalThis.ZhongriWordbankLoader;
const SETTINGS_STORE = globalThis.ZhongriSettingsStore;
const STUDY_CARD_VM = globalThis.ZhongriStudyCardViewModel;
const RELEASE_INFO = globalThis.ZhongriReleaseInfo || Object.freeze({
    version: '未知版本',
    build: '本地缓存',
    publishedAt: null
});
const ROTE_CORE = globalThis.RoteLearningCore;


if (!CORE_UTILS) {
    throw new Error('钟日公共工具模块加载失败');
}

if (!HAPTICS) {
    throw new Error('钟日触感模块加载失败');
}

if (!ROTE_CORE) {
    throw new Error('循环强记核心模块加载失败');
}

if (!SETTINGS_STORE) {
    throw new Error('钟日偏好存储模块加载失败');
}

if (!STUDY_CARD_VM) {
    throw new Error('钟日学习卡片视图模型模块加载失败');
}

const {
    cloneDataValue,
    escapeHTML,
    escapeRegExp,
    hashStableText,
    normalizeEntryText
} = CORE_UTILS;

const BACKUP_PREFERENCE_KEYS = SETTINGS_STORE.getBackupKeys();

const normalizeFolderName = value => {
    return normalizeEntryText(value);
};

const isValidFolderName = value => {
    if (typeof value !== 'string') {
        return false;
    }

    const normalized = normalizeFolderName(value);

    return Boolean(
        normalized &&
        normalized.length <= 80 &&
        !/[<>|\u0000-\u001F\u007F]/.test(normalized)
    );
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
        ['ナ形', '形容动词'],
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

        const normalizedReading = normalizeEntryText(normalized.kana || '').toLowerCase();
        const identity =
            lang === 'ja' && normalizedReading
                ? `${lang}::${normalizeHeadword(normalized.word, lang).toLowerCase()}::${normalizedReading}`
                : `${lang}::${normalizeHeadword(normalized.word, lang).toLowerCase()}`;

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
                '词根仅供辅助，建议人工核对',
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
const isMotionReduced = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.dataset.input === 'keyboard';

document.addEventListener('pointerdown', event => {
    if (event.isTrusted) document.documentElement.dataset.input = 'pointer';
}, { capture: true, passive: true });
document.addEventListener('keydown', () => {
    document.documentElement.dataset.input = 'keyboard';
}, { capture: true });

let previousFocusElement = null;

const syncModalAccessibility = (overlay, isOpen) => {
    if (!overlay) return;

    overlay.setAttribute('role', 'dialog');

    if (!overlay.hasAttribute('aria-labelledby') &&
        !overlay.hasAttribute('aria-label')) {
        const heading = overlay.querySelector('h2, h3');

        if (heading) {
            if (!heading.id) {
                heading.id = `${overlay.id || 'modal'}-title`;
            }

            heading
                .querySelectorAll('.material-symbols-rounded')
                .forEach(icon => icon.setAttribute('aria-hidden', 'true'));
            overlay.setAttribute('aria-labelledby', heading.id);
        } else {
            overlay.setAttribute(
                'aria-label',
                overlay.id === 'detail-overlay'
                    ? '单词详情'
                    : '对话框'
            );
        }
    }

    if (isOpen) {
        overlay.removeAttribute('inert');
        overlay.setAttribute('aria-hidden', 'false');
        overlay.setAttribute('aria-modal', 'true');
    } else {
        /*
         * 关闭的抽屉仍保留在 DOM 中以支持动画和快速复用。
         * inert 同时移除其点击、键盘焦点与无障碍树暴露，
         * 防止 Tab 键进入屏幕外的控件。
         */
        overlay.setAttribute('inert', '');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.removeAttribute('aria-modal');
    }
};

document
    .querySelectorAll('.modal-overlay')
    .forEach(overlay => {
        syncModalAccessibility(
            overlay,
            overlay.classList.contains('active')
        );
    });

window.toggleModal = (id, show) => {
    let el = document.getElementById(id);
    if (!el) return;

    if (show) {
        // 1. 焦点借出：仅在当前没有任何弹窗开启时记录焦点
        if (document.querySelectorAll('.modal-overlay.active').length === 0) {
            previousFocusElement = document.activeElement;
        }
        syncModalAccessibility(el, true);
        el.classList.add('active');
        
        // 2. 焦点入场：延迟等待 CSS 动画生效后，自动聚焦弹窗内第一个可交互元素
        setTimeout(() => {
            let focusable = Array.from(el.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
                                 .filter(node => node.offsetParent !== null);
            
            if (el.classList.contains('active') && focusable.length > 0 && !el.contains(document.activeElement)) {
                focusable[0].focus();
            }
        }, 100);
        
    } else {
        el.classList.remove('active');
        syncModalAccessibility(el, false);
        
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
    if (!t) return;
    t.innerText = msg;
    t.classList.add('show');
    if (window._toastTimer) clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
};

window.showConfirm = (title, msg, onConfirm, { confirmLabel = '确定', danger = false } = {}) => {
    document.getElementById('dialog-title').innerHTML = title;
    document.getElementById('dialog-msg').innerHTML = msg;
    const confirm = document.getElementById('dialog-confirm');
    confirm.textContent = confirmLabel;
    confirm.classList.toggle('ui-danger-action', danger);
    confirm.onclick = () => { Hardware.haptic(danger ? 'delete' : 'confirm'); window.toggleModal('dialog-overlay', false); onConfirm(); };
    const cancel = document.getElementById('dialog-cancel');
    cancel.onclick = () => { Hardware.haptic('sheetClose'); window.toggleModal('dialog-overlay', false); };
    window.toggleModal('dialog-overlay', true);
    if (danger) cancel.focus({ preventScroll: true });
};

window.showPrompt = (title, defaultVal, onConfirm) => {
    const titleEl = document.getElementById('prompt-title');
    const helperEl = document.getElementById('prompt-helper');
    const iconEl = document.getElementById('prompt-icon');
    const input = document.getElementById('prompt-input');

    titleEl.textContent = title;
    helperEl.hidden = true;
    helperEl.textContent = '';

    iconEl.textContent = 'edit';

    input.type = 'text';
    input.autocomplete = 'off';
    input.placeholder = '请输入内容';
    input.value = defaultVal || '';

    window.toggleModal('prompt-overlay', true);

    setTimeout(() => {
        input.focus();
        input.select();
    }, 100);

    document.getElementById('prompt-confirm').onclick = () => {
        Hardware.haptic('confirm');

        const val = input.value.trim();

        if (val) {
            window.toggleModal('prompt-overlay', false);
            onConfirm(val);
        }
    };

    document.getElementById('prompt-cancel').onclick = () => {
        Hardware.haptic('sheetClose');
        window.toggleModal('prompt-overlay', false);
    };
};

/* Explicit Lifecycle Hook Bus — Replaces nested monkey-patch chains */
const ZhongriHooks = (() => {
    const listeners = new Map();
    return Object.freeze({
        on(eventName, handler) {
            if (typeof handler !== 'function') return () => {};
            let set = listeners.get(eventName);
            if (!set) {
                set = new Set();
                listeners.set(eventName, set);
            }
            set.add(handler);
            return () => set.delete(handler);
        },
        emit(eventName, payload) {
            const set = listeners.get(eventName);
            if (!set || set.size === 0) return;
            set.forEach(handler => handler(payload));
        }
    });
})();
window.ZhongriHooks = ZhongriHooks;

const Nav = {
    _spring: {
        pos: 0,
        target: 0,
        vel: 0,
        pillPos: 0,
        pillTarget: 0,
        pillVel: 0,
        pillMin: 0,
        pillMax: 0,
        axis: 'x',
        stiffness: 440,
        damping: 27,
        pillStiffness: 390,
        pillDamping: 30,
        rafId: null,
        lastTime: 0,
        initialized: false
    },
    _scrub: {
        active: false,
        isScrubbing: false,
        pointerId: null,
        startX: 0,
        startY: 0,
        lastX: 0,
        lastTime: 0,
        vx: 0,
        navRect: null,
        clientLeft: 0,
        ribbonW: 34,
        pillW: 104,
        slotTargets: [],
        pillTargets: [],
        previewIdx: -1
    },
    _getRibbonMetrics(nav, ribbon, pill, items) {
        const style = window.getComputedStyle(nav);
        const isVertical = style.flexDirection === 'column';
        const axis = isVertical ? 'y' : 'x';
        let slotTargets;
        let pillTargets;
        if (isVertical) {
            const ribbonH = ribbon.offsetHeight || 24;
            pillTargets = items.map(el => Math.round(el.offsetTop));
            slotTargets = items.map(el => Math.round(el.offsetTop + (el.offsetHeight - ribbonH) / 2));
        } else {
            // 移动端悬浮展开胶囊岛：未选中 48px / 选中 104px，共享胶囊色块与顶边丝带同轴精确落点
            const padLeft = Number.parseFloat(style.paddingLeft) || 6;
            const gap = Number.parseFloat(style.columnGap || style.gap) || 6;
            const inactiveW = 48;
            const activeW = (pill && pill.offsetWidth) || 104;
            const ribbonW = ribbon.offsetWidth || 34;
            pillTargets = items.map((_, idx) => Math.round(padLeft + idx * (inactiveW + gap)));
            slotTargets = pillTargets.map(px => Math.round(px + activeW / 2 - ribbonW / 2));
        }
        return { isVertical, axis, slotTargets, pillTargets };
    },
    _nearestSlotIndex(pos, slotTargets) {
        let bestIdx = 0;
        let bestDist = Infinity;
        for (let i = 0; i < slotTargets.length; i++) {
            const dist = Math.abs(pos - slotTargets[i]);
            if (dist < bestDist) {
                bestDist = dist;
                bestIdx = i;
            }
        }
        return bestIdx;
    },
    _applyRibbonTransform(ribbon, pos, axis, vel = 0, options = {}) {
        const { maxStretch = 0.85, velScale = 1050, allowStretch = true } = options;
        if (axis === 'y') {
            ribbon.style.transform = `translate3d(0, ${pos.toFixed(2)}px, 0)`;
        } else {
            ribbon.style.transform = `translate3d(${pos.toFixed(2)}px, 0, 0)`;
        }
        const inner = ribbon.firstElementChild;
        if (!inner) return;
        if (!allowStretch || Math.abs(vel) < 12) {
            inner.style.transform = 'scale(1, 1)';
            return;
        }
        const stretch = 1 + Math.min(maxStretch, Math.abs(vel) / velScale);
        const squeeze = 1 - Math.min(0.18, (stretch - 1) * 0.2);
        inner.style.transform = axis === 'y'
            ? `scale(${squeeze.toFixed(3)}, ${stretch.toFixed(3)})`
            : `scale(${stretch.toFixed(3)}, ${squeeze.toFixed(3)})`;
    },
    _applyPillTransform(pill, pos, axis, vel = 0, options = {}) {
        if (!pill) return;
        const { maxStretch = 0.1, velScale = 3600, allowStretch = true } = options;
        let renderPos = pos;
        const s = this._spring;
        if (axis === 'x' && s.pillMax > s.pillMin) {
            // 软限幅保护：即便剧烈甩动也不越出悬浮岛外框 6px 内边距
            renderPos = Math.max(s.pillMin - 4, Math.min(s.pillMax + 4, pos));
        }
        const translate = axis === 'y'
            ? `translate3d(0, ${renderPos.toFixed(2)}px, 0)`
            : `translate3d(${renderPos.toFixed(2)}px, 0, 0)`;
        if (!allowStretch || Math.abs(vel) < 18) {
            pill.style.transform = translate;
            return;
        }
        const stretch = 1 + Math.min(maxStretch, Math.abs(vel) / velScale);
        const squeeze = 1 - Math.min(0.045, (stretch - 1) * 0.4);
        const scale = axis === 'y'
            ? `scale(${squeeze.toFixed(3)}, ${stretch.toFixed(3)})`
            : `scale(${stretch.toFixed(3)}, ${squeeze.toFixed(3)})`;
        pill.style.transform = `${translate} ${scale}`;
    },
    _stopSpring(ribbon, pill) {
        const s = this._spring;
        if (s.rafId !== null) {
            cancelAnimationFrame(s.rafId);
            s.rafId = null;
        }
        if (ribbon) {
            ribbon.style.willChange = '';
            if (ribbon.firstElementChild) ribbon.firstElementChild.style.willChange = '';
        }
        if (pill) {
            pill.style.willChange = '';
        }
    },
    _startSpring(ribbon, pill) {
        const s = this._spring;
        if (s.rafId !== null) return;
        ribbon.style.willChange = 'transform';
        if (ribbon.firstElementChild) ribbon.firstElementChild.style.willChange = 'transform';
        if (pill) pill.style.willChange = 'transform';
        s.lastTime = 0;

        const tick = (now) => {
            if (!ribbon.isConnected) {
                this._stopSpring(ribbon, pill);
                return;
            }
            // 首帧按 16.7ms 稳定起步（避免切页 DOM 渲染耗时导致首帧跳变）；切后台超过 1.5s 直接落位
            const rawDt = s.lastTime === 0
                ? (1 / 60)
                : Math.max(0.001, (now - s.lastTime) / 1000);
            s.lastTime = now;
            if (rawDt > 1.5) {
                s.pos = s.target;
                s.vel = 0;
                s.pillPos = s.pillTarget;
                s.pillVel = 0;
                this._applyRibbonTransform(ribbon, s.pos, s.axis, 0, { allowStretch: false });
                this._applyPillTransform(pill, s.pillPos, s.axis, 0, { allowStretch: false });
                this._stopSpring(ribbon, pill);
                return;
            }
            let remaining = Math.min(0.1, rawDt);
            const maxStep = 1 / 240;
            while (remaining > 0) {
                const dt = Math.min(remaining, maxStep);
                const ribAccel = s.stiffness * (s.target - s.pos) - s.damping * s.vel;
                s.vel += ribAccel * dt;
                s.pos += s.vel * dt;

                const pillAccel = s.pillStiffness * (s.pillTarget - s.pillPos) - s.pillDamping * s.pillVel;
                s.pillVel += pillAccel * dt;
                s.pillPos += s.pillVel * dt;
                remaining -= dt;
            }

            const ribbonSettled = Math.abs(s.target - s.pos) < 0.25 && Math.abs(s.vel) < 2.5;
            const pillSettled = !pill || (Math.abs(s.pillTarget - s.pillPos) < 0.25 && Math.abs(s.pillVel) < 2.5);

            if (ribbonSettled && pillSettled) {
                s.pos = s.target;
                s.vel = 0;
                s.pillPos = s.pillTarget;
                s.pillVel = 0;
                this._applyRibbonTransform(ribbon, s.pos, s.axis, 0, { allowStretch: false });
                this._applyPillTransform(pill, s.pillPos, s.axis, 0, { allowStretch: false });
                this._stopSpring(ribbon, pill);
                return;
            }

            this._applyRibbonTransform(ribbon, s.pos, s.axis, s.vel);
            this._applyPillTransform(pill, s.pillPos, s.axis, s.pillVel);
            s.rafId = requestAnimationFrame(tick);
        };

        s.rafId = requestAnimationFrame(tick);
    },
    syncRibbon(animate = false, options = {}) {
        const nav = document.getElementById('bottom-nav');
        const ribbon = document.getElementById('nav-ribbon');
        const pill = document.getElementById('nav-pill');
        if (!nav || !ribbon) return;
        const items = Array.from(nav.querySelectorAll('.nav-item'));
        const activeIdx = items.findIndex(el => el.classList.contains('active'));
        if (activeIdx < 0) return;

        const { axis, slotTargets, pillTargets } = this._getRibbonMetrics(nav, ribbon, pill, items);
        const target = slotTargets[activeIdx];
        const pillTarget = pillTargets[activeIdx];
        const s = this._spring;
        const axisChanged = s.initialized && s.axis !== axis;
        s.axis = axis;
        s.target = target;
        s.pillTarget = pillTarget;
        s.pillMin = pillTargets[0];
        s.pillMax = pillTargets[pillTargets.length - 1];

        const canAnimate = animate
            && s.initialized
            && !axisChanged
            && !isMotionReduced()
            && typeof requestAnimationFrame === 'function';

        if (!canAnimate) {
            this._stopSpring(ribbon, pill);
            s.pos = target;
            s.vel = 0;
            s.pillPos = pillTarget;
            s.pillVel = 0;
            s.initialized = true;
            this._applyRibbonTransform(ribbon, target, axis, 0, { allowStretch: false });
            this._applyPillTransform(pill, pillTarget, axis, 0, { allowStretch: false });
        } else {
            // 保留中途打断时的瞬时速度，或注入跟手松手时的指尖动量（色块与丝带双层协同）
            s.stiffness = options.stiffness || 440;
            s.damping = options.damping || 27;
            s.pillStiffness = options.pillStiffness || 390;
            s.pillDamping = options.pillDamping || 30;
            if (typeof options.initialVelocity === 'number' && Number.isFinite(options.initialVelocity)) {
                const clampedVel = Math.max(-2400, Math.min(2400, options.initialVelocity));
                s.vel = clampedVel;
                s.pillVel = clampedVel;
            }
            const ribbonDone = Math.abs(s.target - s.pos) < 0.25 && Math.abs(s.vel) < 2.5;
            const pillDone = !pill || (Math.abs(s.pillTarget - s.pillPos) < 0.25 && Math.abs(s.pillVel) < 2.5);
            if (ribbonDone && pillDone) {
                this._stopSpring(ribbon, pill);
                s.pos = target;
                s.vel = 0;
                s.pillPos = pillTarget;
                s.pillVel = 0;
                this._applyRibbonTransform(ribbon, target, axis, 0, { allowStretch: false });
                this._applyPillTransform(pill, pillTarget, axis, 0, { allowStretch: false });
            } else {
                this._startSpring(ribbon, pill);
            }
        }

        const markReady = () => {
            ribbon.classList.add('is-ready');
            if (pill) pill.classList.add('is-ready');
        };
        if (!ribbon.classList.contains('is-ready') || (pill && !pill.classList.contains('is-ready'))) {
            if (typeof requestAnimationFrame === 'function') {
                requestAnimationFrame(markReady);
            } else {
                markReady();
            }
        }
    },
    bindScrubGesture() {
        const nav = document.getElementById('bottom-nav');
        const ribbon = document.getElementById('nav-ribbon');
        const pill = document.getElementById('nav-pill');
        if (!nav || !ribbon) return;

        const finishScrub = (e, cancelled) => {
            const drag = this._scrub;
            if (!drag.active || (e && drag.pointerId !== null && e.pointerId !== drag.pointerId)) return;
            drag.active = false;
            const wasScrubbing = drag.isScrubbing;
            drag.isScrubbing = false;
            nav.classList.remove('is-scrubbing');
            try {
                if (drag.pointerId !== null && nav.hasPointerCapture?.(drag.pointerId)) {
                    nav.releasePointerCapture(drag.pointerId);
                }
            } catch (_) {}
            drag.pointerId = null;

            if (!wasScrubbing) return;
            const items = Array.from(nav.querySelectorAll('.nav-item'));
            if (items.length === 0 || drag.slotTargets.length !== items.length) {
                this.syncRibbon(true);
                return;
            }

            // 手指停顿超过 75ms 后抬起则清零惯性，避免定格瞄准后误抛
            const stale = (performance.now() - drag.lastTime) > 75;
            const releaseVx = (cancelled || stale) ? 0 : Math.max(-2200, Math.min(2200, drag.vx));
            const s = this._spring;
            const projected = cancelled
                ? s.pos
                : s.pos + Math.max(-1600, Math.min(1600, releaseVx)) * 0.06;
            const finalIdx = this._nearestSlotIndex(projected, drag.slotTargets);
            const currentIdx = items.findIndex(el => el.classList.contains('active'));
            const finalBtn = items[finalIdx];

            if (!cancelled && finalBtn && finalIdx !== currentIdx) {
                Hardware.haptic('navigation');
                this.switchTab(
                    finalBtn.getAttribute('data-target'),
                    finalBtn.getAttribute('data-title'),
                    finalBtn,
                    { skipRibbonSync: true }
                );
            }

            this.syncRibbon(true, {
                initialVelocity: releaseVx,
                damping: cancelled ? 27 : 25,
                pillDamping: cancelled ? 30 : 27.5
            });
        };

        nav.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            const items = Array.from(nav.querySelectorAll('.nav-item'));
            const { isVertical, slotTargets, pillTargets } = this._getRibbonMetrics(nav, ribbon, pill, items);
            if (isVertical || slotTargets.length < 2) return;

            const now = performance.now();
            const drag = this._scrub;
            drag.active = true;
            drag.isScrubbing = false;
            drag.pointerId = e.pointerId;
            drag.startX = e.clientX;
            drag.startY = e.clientY;
            drag.lastX = e.clientX;
            drag.lastTime = now;
            drag.vx = 0;
            drag.navRect = nav.getBoundingClientRect();
            drag.clientLeft = nav.clientLeft || 0;
            drag.ribbonW = ribbon.offsetWidth || 34;
            drag.pillW = (pill && pill.offsetWidth) || 104;
            drag.slotTargets = slotTargets;
            drag.pillTargets = pillTargets;
            drag.previewIdx = items.findIndex(el => el.classList.contains('active'));
        });

        window.addEventListener('pointermove', (e) => {
            const drag = this._scrub;
            if (!drag.active || e.pointerId !== drag.pointerId) return;

            const dx = e.clientX - drag.startX;
            const dy = e.clientY - drag.startY;
            if (!drag.isScrubbing) {
                if (Math.abs(dx) <= 8 || Math.abs(dx) <= Math.abs(dy) * 1.15) return;
                drag.isScrubbing = true;
                nav.classList.add('is-scrubbing');
                this._stopSpring(ribbon, pill);
                ribbon.style.willChange = 'transform';
                if (ribbon.firstElementChild) ribbon.firstElementChild.style.willChange = 'transform';
                if (pill) pill.style.willChange = 'transform';
                const itemsNow = Array.from(nav.querySelectorAll('.nav-item'));
                drag.previewIdx = itemsNow.findIndex(el => el.classList.contains('active'));
                try { nav.setPointerCapture?.(e.pointerId); } catch (_) {}
            }

            const now = performance.now();
            const dt = Math.max(4, now - drag.lastTime);
            const instVx = ((e.clientX - drag.lastX) / dt) * 1000;
            drag.vx = drag.vx * 0.55 + instVx * 0.45;
            drag.lastX = e.clientX;
            drag.lastTime = now;

            const pointerLocalX = e.clientX - (drag.navRect.left + drag.clientLeft);
            const minT = drag.slotTargets[0];
            const maxT = drag.slotTargets[drag.slotTargets.length - 1];
            let raw = pointerLocalX - drag.ribbonW / 2;
            if (raw < minT) {
                raw = minT + (raw - minT) * 0.22;
            } else if (raw > maxT) {
                raw = maxT + (raw - maxT) * 0.22;
            }
            // 保留顶边平直区间余量，橡皮筋阻尼不滑入两端半圆弧
            raw = Math.max(minT - 10, Math.min(maxT + 10, raw));

            const minP = drag.pillTargets[0];
            const maxP = drag.pillTargets[drag.pillTargets.length - 1];
            let pillRaw = pointerLocalX - drag.pillW / 2;
            if (pillRaw < minP) {
                pillRaw = minP + (pillRaw - minP) * 0.2;
            } else if (pillRaw > maxP) {
                pillRaw = maxP + (pillRaw - maxP) * 0.2;
            }
            pillRaw = Math.max(minP - 4, Math.min(maxP + 4, pillRaw));

            const s = this._spring;
            s.axis = 'x';
            s.pos = raw;
            s.vel = drag.vx;
            s.pillPos = pillRaw;
            s.pillVel = drag.vx;
            s.pillMin = minP;
            s.pillMax = maxP;
            s.initialized = true;
            this._applyRibbonTransform(ribbon, raw, 'x', drag.vx, {
                maxStretch: 0.65,
                velScale: 1400,
                allowStretch: !isMotionReduced()
            });
            this._applyPillTransform(pill, pillRaw, 'x', drag.vx, {
                maxStretch: 0.08,
                velScale: 4200,
                allowStretch: !isMotionReduced()
            });

            const nearestIdx = this._nearestSlotIndex(raw, drag.slotTargets);
            if (nearestIdx !== drag.previewIdx) {
                drag.previewIdx = nearestIdx;
                const items = Array.from(nav.querySelectorAll('.nav-item'));
                const targetBtn = items[nearestIdx];
                if (targetBtn) {
                    Hardware.haptic('key');
                    this.switchTab(
                        targetBtn.getAttribute('data-target'),
                        targetBtn.getAttribute('data-title'),
                        targetBtn,
                        { skipRibbonSync: true }
                    );
                }
            }
        }, { passive: true });

        window.addEventListener('pointerup', (e) => finishScrub(e, false), { passive: true });
        window.addEventListener('pointercancel', (e) => finishScrub(e, true), { passive: true });
    },
    init() {
        document.querySelectorAll('.nav-item').forEach(item => {
            // 1. 响应手指按下：实现“即刻反馈”，单次触发 navigation 触感避免与 click 冲突互相打断
            item.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                Hardware.haptic('navigation');
                Hardware.playSound('click', { haptic: false });
                let targetId = e.currentTarget.getAttribute('data-target');
                let titleData = e.currentTarget.getAttribute('data-title');
                this.switchTab(targetId, titleData, e.currentTarget);
            });
            
            // 2. 保留 click 用于兼容：拦截真实的物理抬手点击(防重复执行)，但放行代码级别的虚拟点击(如使用电脑键盘左右方向键切换 Tab)
            item.addEventListener('click', (e) => {
                // 触摸/鼠标已在 pointerdown 中响应；键盘生成的 click
                // detail 为 0，必须保留，确保 Enter/Space 可以切换页面。
                if (e.isTrusted && e.detail !== 0) return;
                Hardware.haptic('navigation');
                Hardware.playSound('click', { haptic: false });
                let targetId = e.currentTarget.getAttribute('data-target');
                let titleData = e.currentTarget.getAttribute('data-title');
                this.switchTab(targetId, titleData, e.currentTarget);
            });
        });

        this.bindScrubGesture();
        this.syncRibbon(false);
        window.addEventListener('resize', () => this.syncRibbon(false), { passive: true });
    },
    _entranceAnim: null,
    switchTab(targetId, titleData, navItemEl, options = {}) {
        if (Model.state.batchMode || Model.state.manageMode) {
            Model.state.batchMode = false;
            Model.state.manageMode = false;
            Model.state.selectedSet.clear();
            
            View.updateWordbankUI(); 
            Model.state.renderedStartIndex = -1; 
        }

        const nav = document.getElementById('bottom-nav');
        const navItems = nav ? Array.from(nav.querySelectorAll('.nav-item')) : [];
        const prevIdx = navItems.findIndex(el => el.classList.contains('active'));
        const nextIdx = navItemEl
            ? navItems.indexOf(navItemEl)
            : navItems.findIndex(el => el.dataset.target === targetId);
        const dir = (prevIdx >= 0 && nextIdx >= 0 && prevIdx !== nextIdx)
            ? (nextIdx > prevIdx ? 1 : -1)
            : 0;

        const previous = prevIdx >= 0 ? navItems[prevIdx] : document.querySelector('.nav-item.active');
        const changed = previous?.dataset.target !== targetId;
        if (this._entranceAnim) {
            this._entranceAnim.cancel();
            this._entranceAnim = null;
        }
        window.ZhongriPopovers?.closeAll();

        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.remove('active');
            el.removeAttribute('aria-current');
        });
        if (navItemEl) {
            navItemEl.classList.add('active');
            navItemEl.setAttribute('aria-current', 'page');
        }
        if (!options.skipRibbonSync) {
            this.syncRibbon(changed);
        }

        document.querySelectorAll('.tab-content').forEach(el => {
            el.classList.add('hidden');
            el.classList.remove('active');
        });
        
        let targetEl = document.getElementById(targetId);
        if (targetEl) {
            targetEl.classList.remove('hidden');
            void targetEl.offsetWidth; 
            targetEl.classList.add('active');
            if (changed && !isMotionReduced() && typeof targetEl.animate === 'function') {
                const isVertical = nav && window.getComputedStyle(nav).flexDirection === 'column';
                let fromTransform = 'translate3d(0, 6px, 0)';
                if (dir !== 0) {
                    fromTransform = isVertical
                        ? `translate3d(0, ${dir * 12}px, 0)`
                        : `translate3d(${dir * 16}px, 0, 0)`;
                }
                this._entranceAnim = targetEl.animate([
                    { opacity: 0, transform: fromTransform },
                    { opacity: 1, transform: 'translate3d(0, 0, 0)' }
                ], { duration: 210, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
            }
        }

        if (titleData) {
            let [icon, text] = titleData.split('|');
            let titleEl = document.getElementById('app-global-title');
            if(titleEl) titleEl.innerHTML = `<span class="material-symbols-rounded header-title-icon" aria-hidden="true">${icon}</span><span>${text}</span>`;
        }

        if (targetId === 'tab-home') {
            View.renderDashboard();
        } else if (targetId === 'tab-wordbank') {
            if(Model.state.renderedStartIndex === -1) {
                View.resetWordbankRenderer();
            } else {
                View.renderVirtualGrid();
            }
        }
        
        ZhongriHooks.emit('nav:switch', { targetId, titleData, navItemEl });
        window.dispatchEvent(new Event('scroll')); 
    }
};

/* Unified Spring & 1:1 Drag Motion for All Segmented Controls & Toggle Switches */
const SliderMotion = {
    _states: new WeakMap(),
    _containers: new Set(),
    _resizeObserver: null,
    _initialized: false,
    _getItems(container) {
        return Array.from(container.children).filter(
            el => el.classList && (el.classList.contains('segmented-option') || el.classList.contains('lang-pill-btn'))
        );
    },
    _ensureState(container) {
        let st = this._states.get(container);
        if (st) return st;
        let thumb = Array.from(container.children).find(el => el.classList && el.classList.contains('seg-thumb'));
        if (!thumb && typeof document.createElement === 'function') {
            thumb = document.createElement('span');
            thumb.className = 'seg-thumb';
            thumb.setAttribute('aria-hidden', 'true');
            container.insertBefore(thumb, container.firstChild);
        }
        container.classList.add('has-seg-thumb');
        st = {
            thumb,
            x: 0,
            w: 0,
            targetX: 0,
            targetW: 0,
            vx: 0,
            vw: 0,
            minX: 0,
            maxX: 0,
            stiffness: 430,
            damping: 29,
            rafId: null,
            lastTime: 0,
            initialized: false,
            suppressClickUntil: 0,
            pendingVelocity: null
        };
        this._states.set(container, st);
        this._containers.add(container);
        if (this._resizeObserver) {
            this._resizeObserver.observe(container);
        }
        this._bindSegmentedScrub(container, st);
        return st;
    },
    _applyThumb(st, x, w, vx = 0, allowStretch = true) {
        const { thumb } = st;
        if (!thumb) return;
        let renderX = x;
        if (st.maxX > st.minX) {
            renderX = Math.max(st.minX - 2.5, Math.min(st.maxX + 2.5, x));
        }
        thumb.style.width = `${Math.max(0, w).toFixed(2)}px`;
        if (!allowStretch || Math.abs(vx) < 20) {
            thumb.style.transform = `translate3d(${renderX.toFixed(2)}px, 0, 0)`;
            return;
        }
        const sx = 1 + Math.min(0.065, Math.abs(vx) / 4000);
        const sy = 1 - Math.min(0.03, (sx - 1) * 0.45);
        thumb.style.transform = `translate3d(${renderX.toFixed(2)}px, 0, 0) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
    },
    _stopSpring(st) {
        if (st.rafId !== null) {
            cancelAnimationFrame(st.rafId);
            st.rafId = null;
        }
        if (st.thumb) st.thumb.style.willChange = '';
    },
    _startSpring(container, st) {
        if (st.rafId !== null || !st.thumb) return;
        st.thumb.style.willChange = 'transform, width';
        st.lastTime = 0;

        const tick = (now) => {
            if (!container.isConnected || !st.thumb.isConnected) {
                this._stopSpring(st);
                return;
            }
            const rawDt = st.lastTime === 0
                ? (1 / 60)
                : Math.max(0.001, (now - st.lastTime) / 1000);
            st.lastTime = now;
            if (rawDt > 1.5) {
                st.x = st.targetX;
                st.w = st.targetW;
                st.vx = 0;
                st.vw = 0;
                this._applyThumb(st, st.x, st.w, 0, false);
                this._stopSpring(st);
                return;
            }
            let remaining = Math.min(0.1, rawDt);
            const maxStep = 1 / 240;
            while (remaining > 0) {
                const dt = Math.min(remaining, maxStep);
                const ax = st.stiffness * (st.targetX - st.x) - st.damping * st.vx;
                st.vx += ax * dt;
                st.x += st.vx * dt;

                const aw = st.stiffness * (st.targetW - st.w) - (st.damping + 3) * st.vw;
                st.vw += aw * dt;
                st.w += st.vw * dt;
                remaining -= dt;
            }

            const settled = Math.abs(st.targetX - st.x) < 0.25
                && Math.abs(st.vx) < 2.5
                && Math.abs(st.targetW - st.w) < 0.25
                && Math.abs(st.vw) < 2.5;

            if (settled) {
                st.x = st.targetX;
                st.w = st.targetW;
                st.vx = 0;
                st.vw = 0;
                this._applyThumb(st, st.x, st.w, 0, false);
                this._stopSpring(st);
                return;
            }

            this._applyThumb(st, st.x, st.w, st.vx, true);
            st.rafId = requestAnimationFrame(tick);
        };

        st.rafId = requestAnimationFrame(tick);
    },
    syncContainer(container, animate = false, options = {}) {
        if (!container) return;
        const st = this._ensureState(container);
        const items = this._getItems(container);
        if (items.length === 0) return;

        const targetEl = options.targetEl || items.find(el => el.classList.contains('active')) || items[0];
        if (!targetEl) return;

        const targetW = targetEl.offsetWidth || 0;
        if (container.offsetWidth === 0 || targetW === 0) {
            st.initialized = false;
            return;
        }

        const targetX = targetEl.offsetLeft;
        const firstX = items[0].offsetLeft;
        const lastX = items[items.length - 1].offsetLeft;
        st.minX = firstX;
        st.maxX = lastX;
        st.targetX = targetX;
        st.targetW = targetW;

        const canAnimate = animate
            && st.initialized
            && !isMotionReduced()
            && typeof requestAnimationFrame === 'function';

        if (!canAnimate) {
            this._stopSpring(st);
            st.x = targetX;
            st.w = targetW;
            st.vx = 0;
            st.vw = 0;
            st.initialized = true;
            this._applyThumb(st, targetX, targetW, 0, false);
        } else {
            st.stiffness = options.stiffness || 430;
            st.damping = options.damping || 29;
            const injectedVel = typeof options.initialVelocity === 'number'
                ? options.initialVelocity
                : st.pendingVelocity;
            st.pendingVelocity = null;
            if (typeof injectedVel === 'number' && Number.isFinite(injectedVel)) {
                st.vx = Math.max(-2200, Math.min(2200, injectedVel));
            }
            const done = Math.abs(st.targetX - st.x) < 0.25
                && Math.abs(st.vx) < 2.5
                && Math.abs(st.targetW - st.w) < 0.25
                && Math.abs(st.vw) < 2.5;
            if (done) {
                this._stopSpring(st);
                st.x = targetX;
                st.w = targetW;
                st.vx = 0;
                st.vw = 0;
                this._applyThumb(st, targetX, targetW, 0, false);
            } else {
                this._startSpring(container, st);
            }
        }

        if (st.thumb && !st.thumb.classList.contains('is-ready')) {
            if (typeof requestAnimationFrame === 'function') {
                requestAnimationFrame(() => st.thumb.classList.add('is-ready'));
            } else {
                st.thumb.classList.add('is-ready');
            }
        }
    },
    syncAll(animate = false) {
        this._containers.forEach(container => this.syncContainer(container, animate));
    },
    _bindSegmentedScrub(container, st) {
        const drag = {
            active: false,
            isScrubbing: false,
            pointerId: null,
            startX: 0,
            startY: 0,
            lastX: 0,
            lastTime: 0,
            vx: 0,
            rect: null,
            clientLeft: 0,
            slots: [],
            previewIdx: -1
        };

        const nearestSlot = (centerX, slots) => {
            let best = 0;
            let bestDist = Infinity;
            for (let i = 0; i < slots.length; i++) {
                const dist = Math.abs(centerX - slots[i].center);
                if (dist < bestDist) {
                    bestDist = dist;
                    best = i;
                }
            }
            return best;
        };

        const clearPreview = (items) => {
            items.forEach(el => el.classList.remove('is-scrub-target'));
        };

        container.addEventListener('click', (e) => {
            if (performance.now() < st.suppressClickUntil) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);

        container.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            const items = this._getItems(container);
            if (items.length < 2 || container.offsetWidth === 0) return;
            if (items.some(el => el.disabled)) return;

            const now = performance.now();
            drag.active = true;
            drag.isScrubbing = false;
            drag.pointerId = e.pointerId;
            drag.startX = e.clientX;
            drag.startY = e.clientY;
            drag.lastX = e.clientX;
            drag.lastTime = now;
            drag.vx = 0;
            drag.rect = container.getBoundingClientRect();
            drag.clientLeft = container.clientLeft || 0;
            drag.slots = items.map(el => ({
                el,
                left: el.offsetLeft,
                width: el.offsetWidth,
                center: el.offsetLeft + el.offsetWidth / 2
            }));
            drag.previewIdx = Math.max(0, items.findIndex(el => el.classList.contains('active')));
        });

        const finishScrub = (e, cancelled) => {
            if (!drag.active || (e && drag.pointerId !== null && e.pointerId !== drag.pointerId)) return;
            drag.active = false;
            const wasScrubbing = drag.isScrubbing;
            drag.isScrubbing = false;
            container.classList.remove('is-scrubbing');
            try {
                if (drag.pointerId !== null && container.hasPointerCapture?.(drag.pointerId)) {
                    container.releasePointerCapture(drag.pointerId);
                }
            } catch (_) {}
            drag.pointerId = null;

            const items = this._getItems(container);
            clearPreview(items);
            if (!wasScrubbing || drag.slots.length === 0) return;

            st.suppressClickUntil = performance.now() + 260;
            const stale = (performance.now() - drag.lastTime) > 75;
            const releaseVx = (cancelled || stale) ? 0 : Math.max(-2000, Math.min(2000, drag.vx));
            const curCenter = st.x + st.w / 2;
            const projectedCenter = cancelled
                ? curCenter
                : curCenter + Math.max(-1400, Math.min(1400, releaseVx)) * 0.055;
            const finalIdx = nearestSlot(projectedCenter, drag.slots);
            const activeIdx = items.findIndex(el => el.classList.contains('active'));
            const targetBtn = drag.slots[finalIdx]?.el;

            if (!cancelled && targetBtn && finalIdx !== activeIdx) {
                st.pendingVelocity = releaseVx;
                // 暂时放行我们主动触发的合成点击，再恢复拦截残余物理 click
                const prevSuppress = st.suppressClickUntil;
                st.suppressClickUntil = 0;
                targetBtn.click();
                st.suppressClickUntil = prevSuppress;
                this.syncContainer(container, true, {
                    targetEl: targetBtn,
                    initialVelocity: releaseVx,
                    damping: 26
                });
            } else {
                this.syncContainer(container, true, {
                    initialVelocity: cancelled ? 0 : releaseVx,
                    damping: 27
                });
            }
        };

        window.addEventListener('pointermove', (e) => {
            if (!drag.active || e.pointerId !== drag.pointerId) return;
            const dx = e.clientX - drag.startX;
            const dy = e.clientY - drag.startY;

            if (!drag.isScrubbing) {
                if (Math.abs(dx) <= 7 || Math.abs(dx) <= Math.abs(dy) * 1.15) return;
                drag.isScrubbing = true;
                container.classList.add('is-scrubbing');
                this._stopSpring(st);
                if (st.thumb) st.thumb.style.willChange = 'transform, width';
                try { container.setPointerCapture?.(e.pointerId); } catch (_) {}
            }

            const now = performance.now();
            const dt = Math.max(4, now - drag.lastTime);
            const instVx = ((e.clientX - drag.lastX) / dt) * 1000;
            drag.vx = drag.vx * 0.55 + instVx * 0.45;
            drag.lastX = e.clientX;
            drag.lastTime = now;

            const localX = e.clientX - (drag.rect.left + drag.clientLeft);
            const idx = nearestSlot(localX, drag.slots);
            const targetW = drag.slots[idx].width;
            const minX = drag.slots[0].left;
            const maxX = drag.slots[drag.slots.length - 1].left;
            let rawX = localX - targetW / 2;
            if (rawX < minX) rawX = minX + (rawX - minX) * 0.2;
            else if (rawX > maxX) rawX = maxX + (rawX - maxX) * 0.2;
            rawX = Math.max(minX - 2.5, Math.min(maxX + 2.5, rawX));

            st.minX = minX;
            st.maxX = maxX;
            st.x = rawX;
            st.w = st.w ? (st.w * 0.72 + targetW * 0.28) : targetW;
            st.vx = drag.vx;
            st.initialized = true;
            this._applyThumb(st, st.x, st.w, drag.vx, !isMotionReduced());

            if (idx !== drag.previewIdx) {
                drag.previewIdx = idx;
                drag.slots.forEach((slot, i) => slot.el.classList.toggle('is-scrub-target', i === idx));
                const slotEl = drag.slots[idx]?.el;
                if (slotEl && slotEl.getAttribute('data-haptic') !== 'none') {
                    Hardware.haptic('key');
                }
            }
        }, { passive: true });

        window.addEventListener('pointerup', (e) => finishScrub(e, false), { passive: true });
        window.addEventListener('pointercancel', (e) => finishScrub(e, true), { passive: true });
    },
    _initSwitchDrag() {
        const wraps = document.querySelectorAll('.tactile-switch-wrap, .native-reminder-toggle, .native-reminder-mini-toggle');
        wraps.forEach(label => {
            const input = label.querySelector('input[type="checkbox"]');
            const track = label.querySelector('.tactile-slider, .native-switch, .native-mini-switch');
            if (!input || !track || track.dataset.dragBound === '1') return;
            track.dataset.dragBound = '1';

            let suppressClickUntil = 0;
            const drag = {
                active: false,
                isDragging: false,
                pointerId: null,
                startX: 0,
                startY: 0,
                baseX: 0,
                previewOn: false
            };

            label.addEventListener('click', (e) => {
                if (performance.now() < suppressClickUntil) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, true);

            track.addEventListener('pointerdown', (e) => {
                if (input.disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
                drag.active = true;
                drag.isDragging = false;
                drag.pointerId = e.pointerId;
                drag.startX = e.clientX;
                drag.startY = e.clientY;
                drag.baseX = input.checked ? 20 : 0;
                drag.previewOn = input.checked;
            });

            const finishSwitchDrag = (e, cancelled) => {
                if (!drag.active || (e && drag.pointerId !== null && e.pointerId !== drag.pointerId)) return;
                drag.active = false;
                const wasDragging = drag.isDragging;
                drag.isDragging = false;
                try {
                    if (drag.pointerId !== null && track.hasPointerCapture?.(drag.pointerId)) {
                        track.releasePointerCapture(drag.pointerId);
                    }
                } catch (_) {}
                drag.pointerId = null;

                track.classList.remove('is-dragging', 'is-drag-on', 'is-drag-off');
                track.style.removeProperty('--drag-x');
                if (!wasDragging) return;

                suppressClickUntil = performance.now() + 260;
                if (!cancelled && drag.previewOn !== input.checked) {
                    input.checked = drag.previewOn;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            };

            window.addEventListener('pointermove', (e) => {
                if (!drag.active || e.pointerId !== drag.pointerId) return;
                const dx = e.clientX - drag.startX;
                const dy = e.clientY - drag.startY;
                if (!drag.isDragging) {
                    if (Math.abs(dx) <= 6 || Math.abs(dx) <= Math.abs(dy) * 1.2) return;
                    drag.isDragging = true;
                    track.classList.add('is-dragging');
                    try { track.setPointerCapture?.(e.pointerId); } catch (_) {}
                }

                // 拖动时拇指宽 23px，可滑区间 [0, 17]（23+17=40），超出带轻量橡皮筋阻力
                const maxThumbX = 17;
                let raw = (drag.baseX ? maxThumbX : 0) + dx;
                if (raw < 0) raw = raw * 0.22;
                else if (raw > maxThumbX) raw = maxThumbX + (raw - maxThumbX) * 0.22;
                raw = Math.max(-2, Math.min(maxThumbX + 2, raw));

                track.style.setProperty('--drag-x', `${raw.toFixed(2)}px`);
                const nowOn = raw >= maxThumbX / 2;
                track.classList.toggle('is-drag-on', nowOn);
                track.classList.toggle('is-drag-off', !nowOn);

                if (nowOn !== drag.previewOn) {
                    drag.previewOn = nowOn;
                    if (label.getAttribute('data-haptic') !== 'none' && input.getAttribute('data-haptic') !== 'none') {
                        Hardware.haptic('key');
                    }
                }
            }, { passive: true });

            window.addEventListener('pointerup', (e) => finishSwitchDrag(e, false), { passive: true });
            window.addEventListener('pointercancel', (e) => finishSwitchDrag(e, true), { passive: true });
        });
    },
    init() {
        if (this._initialized) return;
        this._initialized = true;
        if (typeof ResizeObserver === 'function') {
            this._resizeObserver = new ResizeObserver(entries => {
                entries.forEach(entry => {
                    if (entry.contentRect.width > 0) {
                        this.syncContainer(entry.target, false);
                    }
                });
            });
        }
        document.querySelectorAll('.header-lang-switch, .segmented-control').forEach(container => {
            this._ensureState(container);
            this.syncContainer(container, false);
        });
        this._initSwitchDrag();
        window.addEventListener('resize', () => this.syncAll(false), { passive: true });
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
                Hardware.haptic('sheetOpen');
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

                if (!overlay?.id || sheet.querySelector('[data-sheet-close]')) {
                    return;
                }

                const button =
                    document.createElement('button');

                button.type = 'button';
                button.className = 'sheet-collapse-btn';
                button.title = '关闭';
                button.setAttribute('aria-label', '关闭');
                button.innerHTML = `
                    <span class="material-symbols-rounded">
                        close
                    </span>
                `;

                button.addEventListener('click', event => {
                    event.stopPropagation();
                    Hardware.haptic('sheetClose');
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

                    sheet.style.transform = '';
                    overlay.style.opacity = '';
                };

                /*
                 * 没有达到关闭距离时，
                 * 让抽屉与遮罩同步弹回原位。
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
                    sheet.style.transform = 'translate3d(0, 0, 0)';
                    overlay.style.opacity = '';

                    finishTimer = window.setTimeout(() => {
                        sheet.classList.remove('is-settling');
                        sheet.style.transform = '';
                        finishTimer = null;
                    }, 260);
                };

                /*
                 * 完整执行抽屉退出动画（使用 --ease-sheet，避免 ease-in 粘滞），
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

                    sheet.style.transform = `translate3d(0, ${dismissDistance}px, 0)`;
                    overlay.style.opacity = '0';

                    Hardware.haptic('sheetClose');

                    finishTimer = window.setTimeout(() => {
                        window.toggleModal(
                            overlay.id,
                            false
                        );

                        finishTimer =
                            window.setTimeout(() => {
                                clearMotionState();
                            }, 380);
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
                     * 1. 下拉距离足够；
                     * 2. 下拉距离超过 24 像素且甩出速度 > 0.35 px/ms。
                     */
                    const shouldClose =
                        currentY > closeThreshold ||
                        (
                            currentY > 24 &&
                            velocity > 0.35
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

                        if (dragging) {
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

                        sheet.style.transform = 'translate3d(0, 0, 0)';

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
                         * 向下时 1:1 跟手；向上越界时呈递增阻尼（rubber-band），
                         * 最多平滑上移 22 像素。
                         */
                        currentY = rawDistance < 0
                            ? -22 * (1 - Math.exp(rawDistance / 90))
                            : rawDistance;

                        sheet.style.transform = `translate3d(0, ${currentY}px, 0)`;

                        const sheetSpan = Math.max(
                            sheet.offsetHeight || 320,
                            240
                        );
                        const dragRatio = currentY > 0
                            ? Math.min(currentY / sheetSpan, 1)
                            : 0;
                        overlay.style.opacity = String(
                            Math.max(0.25, 1 - dragRatio * 0.65)
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
            overwrite: 'sync',
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
        "wa":"わ","wo":"を","nn":"ん","n'":"ん","n ":"ん","-":"ー",
        "kya":"きゃ","kyu":"きゅ","kyo":"きょ","gya":"ぎゃ","gyu":"ぎゅ","gyo":"ぎょ",
        "sha":"しゃ","sya":"しゃ","shu":"しゅ","syu":"しゅ","sho":"しょ","syo":"しょ","she":"しぇ","sye":"しぇ",
        "ja":"じゃ","zya":"じゃ","jya":"じゃ","ju":"じゅ","zyu":"じゅ","jyu":"じゅ","jo":"じょ","zyo":"じょ","jyo":"じょ","je":"じぇ","zye":"じぇ","jye":"じぇ",
        "cha":"ちゃ","tya":"ちゃ","cya":"ちゃ","chu":"ちゅ","tyu":"ちゅ","cyu":"ちゅ","cho":"ちょ","tyo":"ちょ","cyo":"ちょ","che":"ちぇ","tye":"ちぇ","cye":"ちぇ",
        "nya":"にゃ","nyu":"にゅ","nyo":"にょ","hya":"ひゃ","hyu":"ひゅ","hyo":"ひょ",
        "bya":"びゃ","byu":"びゅ","byo":"びょ","pya":"ぴゃ","pyu":"ぴゅ","pyo":"ぴょ",
        "mya":"みゃ","myu":"みゅ","myo":"みょ","rya":"りゃ","ryu":"りゅ","ryo":"りょ",
        "fa":"ふぁ","fi":"ふぃ","fe":"ふぇ","fo":"ふぉ","fyu":"ふゅ",
        "wi":"うぃ","we":"うぇ","wha":"うぁ","whi":"うぃ","whe":"うぇ","who":"うぉ",
        "thi":"てぃ","tha":"てゃ","thu":"てゅ","the":"てぇ","tho":"てょ",
        "dhi":"でぃ","dha":"でゃ","dhu":"でゅ","dhe":"でぇ","dho":"でょ",
        "tsa":"つぁ","tsi":"つぃ","tse":"つぇ","tso":"つぉ",
        "va":"ゔぁ","vi":"ゔぃ","vu":"ゔ","ve":"ゔぇ","vo":"ゔぉ",
        "xa":"ぁ","xi":"ぃ","xu":"ぅ","xe":"ぇ","xo":"ぉ","xtu":"っ","xtsu":"っ","xya":"ゃ","xyu":"ゅ","xyo":"ょ",
        "la":"ぁ","li":"ぃ","lu":"ぅ","le":"ぇ","lo":"ぉ","ltu":"っ","ltsu":"っ","lya":"ゃ","lyu":"ゅ","lyo":"ょ"
    },
    reset() { this.raw = ''; this.buffer = ''; this.mode = 'hiragana'; },
    toggleMode() { this.mode = this.mode === 'hiragana' ? 'katakana' : 'hiragana'; Hardware.haptic('selection'); },
    toKatakana(hira) { return hira.replace(/[\u3041-\u3096]/g, m => String.fromCharCode(m.charCodeAt(0) + 0x60)); },
    toHiragana(text) { return String(text || '').replace(/[\u30A1-\u30F6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60)); },
    hasPrefix(prefix) { return Object.keys(this.map).some(k => k.startsWith(prefix)); },
    input(char) {
        if (char === 'Backspace') {
            if (this.buffer.length > 0) this.buffer = this.buffer.slice(0, -1);
            else if (this.raw.length > 0) this.raw = this.raw.slice(0, -1);
            Hardware.haptic('key'); return;
        }
        const lower = String(char || '').toLowerCase();
        if (!/^[a-z'-]$/.test(lower)) return;
        Hardware.haptic('key');
        this.buffer += lower;

        let safety = 0;
        while (this.buffer.length > 0 && safety++ < 8) {
            // 促音规则
            if (this.buffer.length >= 2 && this.buffer[0] === this.buffer[1] && !"aeiouyn'-".includes(this.buffer[0])) {
                this.raw += this.mode === 'hiragana' ? "っ" : "ッ";
                this.buffer = this.buffer.slice(1);
                continue;
            }
            // 拨音规则（n 后接非元音/y/n/撇号）
            if (this.buffer.length >= 2 && this.buffer[0] === 'n' && this.buffer[1] !== 'n' && !"aeiouy'-".includes(this.buffer[1])) {
                this.raw += this.mode === 'hiragana' ? "ん" : "ン";
                this.buffer = this.buffer.slice(1);
                continue;
            }
            // 最长匹配合成
            let matched = false;
            for (let i = Math.min(4, this.buffer.length); i > 0; i--) {
                let chunk = this.buffer.slice(0, i);
                if (this.map[chunk]) {
                    let kana = this.map[chunk];
                    this.raw += this.mode === 'hiragana' ? kana : this.toKatakana(kana);
                    this.buffer = this.buffer.slice(i);
                    matched = true;
                    break;
                }
            }
            if (matched) continue;
            // 若当前缓冲不是任何合法罗马音前缀，丢弃无法匹配的首字符避免永久卡死
            if (!this.hasPrefix(this.buffer)) {
                this.buffer = this.buffer.slice(1);
                continue;
            }
            break;
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
  builtInLoadOrder: [],
  userWords: [],
  wordOverrides: {},
  builtInIdSet: new Set(),
  folders: ["默认词库"],
  folderLangs: { "默认词库": "ja" },
  stars: [],
  records: [],
  fsrsCards: {},
  fsrsReviewLogs: [],
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
    fsrsReviewItems: [], fsrsAnswerRevealed: false,
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
              kanji: Boolean(stored.kanji ?? stored.word),
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
      const readRaw = lang => (
          WORD_BANK_LOADER && typeof WORD_BANK_LOADER.getLanguageRawWords === 'function'
              ? WORD_BANK_LOADER.getLanguageRawWords(lang)
              : (lang === 'en'
                  ? (typeof DefaultEnglishWords !== 'undefined' ? DefaultEnglishWords : [])
                  : (typeof DefaultWords !== 'undefined' ? DefaultWords : []))
      );
      const sources = {
          ja: readRaw('ja'),
          en: readRaw('en')
      };
      const languages = this.builtInLoadOrder.length
          ? this.builtInLoadOrder
          : ['ja', 'en'].filter(language => sources[language].length);

      languages.forEach(language => {
          const sourceWords = sources[language] || [];
          const defaultFolder =
              WORD_BANK_LOADER && typeof WORD_BANK_LOADER.getDefaultFolderForLanguage === 'function'
                  ? WORD_BANK_LOADER.getDefaultFolderForLanguage(language)
                  : (language === 'en' ? '四级词汇' : '默认词库');

          sourceWords.forEach(word => {
              const entry = normalizeWordEntry({
                  ...cloneDataValue(word),
                  lang: language,
                  folder: word.folder || defaultFolder,
                  builtIn: true
              });

              ensureStableWordId(entry, {
                  builtInHint: true
              });

              words.push(entry);
          });
      });

      return words;
  },

  refreshBuiltInWords() {
      this.builtInWords = this.getDefaultBuiltInWords();
      this.builtInIdSet = new Set(
          this.builtInWords.map(word => this.getWordId(word))
      );
  },

  async ensureBuiltInLanguage(language, { rebuild = true } = {}) {
      const normalizedLanguage = language === 'en' ? 'en' : 'ja';

      if (!WORD_BANK_LOADER) {
          throw new Error('词库加载器初始化失败');
      }

      await WORD_BANK_LOADER.loadLanguage(normalizedLanguage);

      if (!this.builtInLoadOrder.includes(normalizedLanguage)) {
          this.builtInLoadOrder.push(normalizedLanguage);
      }

      this.refreshBuiltInWords();
      if (rebuild) {
          this.rebuildCombinedDB();
      }
  },

  async ensureAllBuiltInLanguages() {
      for (const language of ['ja', 'en']) {
          await this.ensureBuiltInLanguage(language);
      }
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

      // 确保按需载入另一语种词库后，其内置文件夹立即注册到 folders / folderLangs
      if (Array.isArray(this.folders) && this.folderLangs && typeof this.folderLangs === 'object') {
          this.db.forEach(word => {
              const folder = normalizeEntryText(
                  word.folder || (word.lang === 'en' ? '四级词汇' : '默认词库')
              );
              if (!folder) return;
              if (!this.folders.includes(folder)) {
                  this.folders.push(folder);
              }
              if (!this.folderLangs[folder]) {
                  this.folderLangs[folder] = word.lang === 'en' ? 'en' : 'ja';
              }
          });
      }
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
      if (window.__zhongriInitialWordbankPromise) {
          await window.__zhongriInitialWordbankPromise;
      }

      const initialLanguage =
          localStorage.getItem('langMode') === 'en'
              ? 'en'
              : 'ja';

      this.state.currentLangMode = initialLanguage;
      await this.ensureBuiltInLanguage(initialLanguage, {
          rebuild: false
      });
      await this.loadData();
  },

  idbAvailable: true,

  async readStorageValue(key) {
      // A fallback write is newer than IndexedDB until a later successful save.
      // Keep it authoritative across restarts; reads do not mutate either copy.
      const pending = localStorage.getItem(PENDING_STORAGE_PREFIX + key);
      if (pending !== null) {
          return JSON.parse(pending);
      }

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
              localStorage.removeItem(PENDING_STORAGE_PREFIX + key);
              return;
          } catch (error) {
              console.warn(
                  `[Storage] 写入 ${key} 失败，尝试本地备用存储`,
                  error
              );
          }
      }

      localStorage.setItem(
          PENDING_STORAGE_PREFIX + key,
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
          this.saveFsrs()
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

          // The other language may not have been loaded yet. Only explicit
          // deletion may remove an unresolved reference (as with clear states).
          if (targetIds.length === 0 && key) {
              targetIds = [key];
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

          const normalized = {
              ...cloneDataValue(value),
              kanji: Boolean(
                  value.kanji ?? value.word ?? false
              ),
              kana: Boolean(value.kana ?? false),
              meaning: Boolean(value.meaning ?? false),
              needsReview: Boolean(value.needsReview)
          };
          delete normalized.word;
          return normalized;
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
          storedFsrsCards,
          storedFsrsReviewLogs
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
          this.readStorageValue('fsrsCards_v1'),
          this.readStorageValue('fsrsReviewLogs_v1')
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
          // 旧版把全部内置词直接写入同一数据库。迁移前须补齐两种语言，
          // 否则未加载语言的内置词会被错误地当作自定义词。
          await this.ensureAllBuiltInLanguages();
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
      this.fsrsCards = storedFsrsCards && typeof storedFsrsCards === 'object' && !Array.isArray(storedFsrsCards)
          ? cloneDataValue(storedFsrsCards)
          : {};
      this.fsrsReviewLogs = Array.isArray(storedFsrsReviewLogs)
          ? cloneDataValue(storedFsrsReviewLogs).slice(-500)
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
      // Recalculate only loaded built-ins; retain edits/deletions belonging to
      // languages which are still lazy-loaded.
      const overrides = Object.fromEntries(
          Object.entries(this.wordOverrides).filter(([wordId]) => {
              return !canonicalMap.has(wordId);
          })
      );

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
      return this.writeStorageValue('myFolders_v3', this.folders);
  },
  saveFolderLangs() {
      return this.writeStorageValue('myFolderLangs', this.folderLangs);
  },
  saveStars() {
      return this.writeStorageValue('starredWords', this.stars);
  },
  saveRecords() {
      const result = this.writeStorageValue('studyRecords', this.records);
      Promise.resolve(result).then(() => ZhongriHooks.emit('study:data-changed'), () => {});
      return result;
  },
  saveFsrs() {
      const result = Promise.all([
          this.writeStorageValue('fsrsCards_v1', this.fsrsCards),
          this.writeStorageValue('fsrsReviewLogs_v1', this.fsrsReviewLogs.slice(-500))
      ]);
      Promise.resolve(result).then(() => ZhongriHooks.emit('study:data-changed'), () => {});
      return result;
  },
  recordFsrsReview({ word, dimension, rating = 'good', source = 'study', now = new Date() } = {}) {
      if (!word || !globalThis.ZhongriFsrsScheduler) return null;
      const language = word.lang || 'ja';
      const normalizedDimension = globalThis.ZhongriFsrsScheduler.dimensionFor(language, dimension);
      const cardKey = globalThis.ZhongriFsrsScheduler.key(this.getWordId(word), language, normalizedDimension);
      const previous = this.fsrsCards[cardKey] || null;
      const result = globalThis.ZhongriFsrsScheduler.review(previous, rating, now);
      this.fsrsCards[cardKey] = result.card;
      this.fsrsReviewLogs.push({
          key: cardKey,
          wordId: this.getWordId(word),
          lang: language,
          dimension: normalizedDimension,
          source,
          rating: result.log.rating,
          review: result.log.review,
          due: result.card.due
      });
      this.saveFsrs().catch(error => console.warn('[FSRS] 保存失败', error));
      return result;
  },
  getDueFsrsCards(now = new Date(), language = this.getCurrentLang()) {
      const dueKeys = globalThis.ZhongriFsrsScheduler
          ? globalThis.ZhongriFsrsScheduler.getDueCards(this.fsrsCards, now)
          : [];
      return dueKeys.map(key => {
          const parts = key.split(':');
          const word = this.getWordById(parts[1]);
          return word && (word.lang || 'ja') === language
              ? { key, word, dimension: parts.slice(2).join(':') }
              : null;
      }).filter(Boolean);
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
      return Promise.all([
          this.writeStorageValue('mtGroupClears_v3', this.mtGroupClears),
          this.writeStorageValue('mtWordClears_v3', this.mtWordClears)
      ]);
  },
  
    updateFilteredDb(searchQuery, currentFilter) {
      this.state.filteredDb = this.db.map((w, idx) => ({w, idx})).filter(item => {
          if ((item.w.lang || 'ja') !== Model.state.currentLangMode) return false;
          let matchFolder = currentFilter === 'all' ? true : this.checkFilter(item.w, currentFilter);
          let matchSearch = !searchQuery ||
                            item.w.word.toLowerCase().includes(searchQuery) ||
                            (item.w.kana || '').toLowerCase().includes(searchQuery) ||
                            (item.w.phonetic || '').toLowerCase().includes(searchQuery) ||
                            item.w.meaning.toLowerCase().includes(searchQuery);
          return matchFolder && matchSearch;
      });
      ZhongriHooks.emit('wordbank:filtered', { searchQuery, currentFilter });
  },


  splitKanaByMora(kanaStr) {
      let tokens = kanaStr.replace(/[【】\[\]()]/g, '').match(/([ぁ-んァ-ン][ゃゅょャュョぁぃぅぇぉァィゥェォ]?|[っッんンー])/g);
      return tokens || kanaStr.split('');
  },
  
  parseLocalDate(value) {
      if (value instanceof Date) {
          return Number.isNaN(value.getTime()) ? null : new Date(value.getFullYear(), value.getMonth(), value.getDate());
      }
      const text = String(value || '').trim();
      const match = text.match(/^(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})/);
      if (match) {
          return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      }
      const parsed = new Date(text);
      return Number.isNaN(parsed.getTime()) ? null : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  },

  calculateStats() {
      const dateMap = new Map();
      this.records
          .filter(r => r && r.type === 'daily_punch' && r.date)
          .forEach(r => {
              const d = this.parseLocalDate(r.date);
              if (!d) return;
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              if (!dateMap.has(key)) dateMap.set(key, d);
          });
      const uniqueDates = [...dateMap.values()].sort((a, b) => b.getTime() - a.getTime());
      const totalDays = uniqueDates.length;
      let streak = 0;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      for (let i = 0; i < uniqueDates.length; i++) {
          const d = uniqueDates[i];
          const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
          if (diff < 0) continue;
          if (streak === 0 && diff > 1) break;
          if (streak > 0) {
              const prevD = uniqueDates[i - 1];
              if (Math.round((prevD.getTime() - d.getTime()) / 86400000) > 1) break;
          }
          streak++;
      }
      return { totalDays, streak };
  }
};

const Hardware = {
  audioCtx: null, jaVoiceCache: null, enVoiceCache: null, chargeOsc: null, chargeGain: null, _currentAudio: null,
  init() {
    HAPTICS.install();
    try {
        if (window.speechSynthesis) {
          let loadVoice = () => { this.jaVoiceCache = window.speechSynthesis.getVoices().find(v => v.lang.includes('ja') || v.lang.includes('JP')); };
          loadVoice();
          if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = loadVoice;
        }
    } catch(e) {}
  },
  haptic(type, options) {
    return HAPTICS.trigger(type, options);
  },
  hapticChargeTick(progress) {
    return typeof HAPTICS.triggerChargeTick === 'function'
      ? HAPTICS.triggerChargeTick(progress)
      : HAPTICS.trigger('tap');
  },
  vibrate(pattern, options) {
    return HAPTICS.triggerLegacy(pattern, options);
  },
  playSound(type, { haptic = true } = {}) {
    if (haptic) {
        const scenario = typeof haptic === 'string'
            ? haptic
            : (type === 'success' || type === 'error' ? type : 'tap');
        this.haptic(scenario);
    }
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
getSpeechRate(isSentence = false, engine = 'azure') {
    const raw = Number.parseFloat(localStorage.getItem('ttsRate') || '1');
    const multiplier = Number.isFinite(raw) && raw >= 0.5 && raw <= 1.5 ? raw : 1;
    const base = engine === 'local'
        ? (isSentence ? 0.8 : 0.85)
        : (isSentence ? 0.82 : 0.9);
    return Math.min(1.5, Math.max(0.55, Number((base * multiplier).toFixed(2))));
},

fallbackLocalTTS(text, isSentence = false, onComplete = null, lang = 'ja-JP') {
    if (!window.speechSynthesis) {
        if (onComplete) onComplete();
        return;
    }
    
    setTimeout(() => {
        let msg = new SpeechSynthesisUtterance(text);
        msg.lang = lang;
        msg.rate = this.getSpeechRate(isSentence, 'local');
        
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
        : ((w.kana || w.word || '').replace(/[【】\[\]()]/g, '').split(/[\/／]/)[0]);
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


 if (
    engine === 'local' ||
    (engine === 'youdao' && isSentence) ||
    (typeof navigator !== 'undefined' && navigator.onLine === false)
 ) {
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
    audio.playbackRate = this.getSpeechRate(isSentence, 'youdao');
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
    audio.playbackRate = this.getSpeechRate(isSentence, 'azure');
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
  
  COLOR_PALETTES: Object.freeze({
    washi: Object.freeze({
      label: '和纸朱印',
      themeColor: { lightJa: '#1b3b5a', lightEn: '#1b4d3e', dark: '#151311' }
    }),
    terracotta: Object.freeze({
      label: '陶土日轮',
      themeColor: { lightJa: '#a63e26', lightEn: '#213a56', dark: '#171311' }
    }),
    swiss: Object.freeze({
      label: '瑞士印刷',
      themeColor: { lightJa: '#161616', lightEn: '#161616', dark: '#101010' }
    })
  }),

  normalizeColorPalette(value) {
    return Object.prototype.hasOwnProperty.call(this.COLOR_PALETTES, value)
      ? value
      : 'washi';
  },

  applyColorPalette(palette, { persist = true, toast = false } = {}) {
    const normalized = this.normalizeColorPalette(palette);
    if (document.body) {
      document.body.setAttribute('data-palette', normalized);
    }
    if (persist) {
      SETTINGS_STORE.set('colorPalette', normalized);
    }
    document.querySelectorAll('.palette-card[data-palette-option]').forEach(card => {
      const isSelected = card.dataset.paletteOption === normalized;
      card.classList.toggle('active', isSelected);
      card.setAttribute('aria-checked', String(isSelected));
    });
    const pill = this.getEl('settings-palette-pill');
    if (pill) {
      pill.textContent = this.COLOR_PALETTES[normalized].label;
    }
    this.syncThemeUI();
    if (toast) {
      showToast(`已切换配色：${this.COLOR_PALETTES[normalized].label}`);
    }
    return normalized;
  },

  syncThemeUI() {
    const isDark =
        document.body.getAttribute('data-theme') === 'dark';
    const nextLabel = isDark
        ? '切换到日间模式'
        : '切换到夜间模式';

    document.querySelectorAll('.theme-toggle-btn').forEach(button => {
        button.setAttribute('aria-label', nextLabel);
        button.setAttribute('title', nextLabel);
        button.setAttribute('aria-pressed', String(isDark));
    });

    document.querySelectorAll('.theme-icon').forEach(icon => {
        icon.innerText = isDark ? 'light_mode' : 'dark_mode';
    });

    const themeColor = document.querySelector(
        'meta[name="theme-color"]'
    );
    if (themeColor) {
        const palette = this.normalizeColorPalette(
            document.body.getAttribute('data-palette')
        );
        const colors = this.COLOR_PALETTES[palette].themeColor;
        themeColor.content = isDark
            ? colors.dark
            : (document.body.getAttribute('data-lang') === 'en' ? colors.lightEn : colors.lightJa);
    }
  },

  toggleTheme(e) {
    const isDark =
        document.body.getAttribute('data-theme') === 'dark';
    const toggleAction = () => {
        if (isDark) {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }

        this.syncThemeUI();
    };
    if (!document.startViewTransition || isMotionReduced()) {
        toggleAction();
        return;
    }
    const transition = document.startViewTransition(toggleAction);
    transition.ready?.catch(() => {});
    transition.updateCallbackDone?.catch(() => {});
    transition.finished?.catch(() => {});

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

  syncMaskedVisuals() {
      ['w-word', 'w-kana', 'w-meaning'].forEach(id => {
          const el = this.getEl(id);
          if (!el) return;
          const text = (el.innerText || el.textContent || '').trim();
          const masked = STUDY_CARD_VM.isMaskedText(text);
          el.classList.toggle('is-masked', masked);
          if (el.dataset) {
              el.dataset.masked = masked ? 'true' : 'false';
          }
      });
  },

  applyDeclarativeCardViewModel(vm, w, visuals) {
      const wordEl = this.getEl('w-word');
      const kanaEl = this.getEl('w-kana');
      const meaningEl = this.getEl('w-meaning');
      const typeEl = this.getEl('w-type');
      const rootsEl = this.getEl('w-roots');
      const exampleEl = this.getEl('w-example-box');
      const blindAudioUi = this.getEl('mt-blind-audio-ui');
      const hintBtn = this.getEl('btn-mt-show-hint');

      wordEl.innerText = vm.wordText;
      wordEl.style.fontSize = vm.wordFontSize;
      kanaEl.innerText = vm.readingText;
      meaningEl.innerText = vm.meaningText;

      typeEl.innerHTML = visuals.tagsHTML;
      typeEl.style.display = vm.showType ? 'flex' : 'none';

      if (rootsEl) {
          if (vm.showRoots) {
              rootsEl.innerHTML = this.renderRoots(w.roots, vm.maskRootText, vm.maskRootMeaning);
              rootsEl.style.display = 'flex';
          } else {
              rootsEl.style.display = 'none';
          }
          rootsEl.className = 'roots-row';
      }

      this.renderExampleBox(w.example, 'w-example-box', 'normal', w);
      exampleEl.className = 'dt-example-box';
      const hasExampleContent = Boolean(exampleEl.innerHTML.trim());
      exampleEl.style.display = (vm.showExample && hasExampleContent) ? '' : 'none';
      exampleEl.toggleAttribute('aria-hidden', !(vm.showExample && hasExampleContent));

      ['word', 'kana', 'type', 'meaning'].forEach(k => {
          const el = this.getEl(`w-${k}`);
          if (!el) return;
          el.className =
              k === 'word'
                  ? 'word-main'
                  : k === 'type'
                      ? 'type-row'
                      : `${k}-row`;
          el.removeAttribute('aria-hidden');
      });

      if (wordEl.dataset) wordEl.dataset.masked = vm.isMaskedWord ? 'true' : 'false';
      if (kanaEl.dataset) kanaEl.dataset.masked = vm.isMaskedReading ? 'true' : 'false';
      if (meaningEl.dataset) meaningEl.dataset.masked = vm.isMaskedMeaning ? 'true' : 'false';
      wordEl.classList.toggle('is-masked', vm.isMaskedWord);
      kanaEl.classList.toggle('is-masked', vm.isMaskedReading);
      meaningEl.classList.toggle('is-masked', vm.isMaskedMeaning);

      blindAudioUi.classList.toggle('hidden', !vm.showBlindAudio);
      if (hintBtn && !vm.showBlindHint) {
          hintBtn.style.display = 'none';
      }
      wordEl.style.display = vm.showWordRow ? 'block' : 'none';
      kanaEl.style.display = vm.showReadingRow ? 'block' : 'none';
      meaningEl.style.display = vm.showMeaningRow ? 'block' : 'none';
      this.getEl('btn-speaker').style.display = vm.showSpeaker ? 'block' : 'none';

      const isStarred = Model.isStarred(w);
      this.getEl('star-icon').style.fontVariationSettings =
          isStarred ? "'FILL' 1" : "'FILL' 0";
      this.getEl('star-btn').classList.toggle('active', isStarred);
      this.getEl('star-btn').setAttribute('aria-pressed', String(isStarred));
      this.getEl('star-btn').style.display = vm.showStar ? 'block' : 'none';
  },

  syncRootsDisplay() {
      this.syncMaskedVisuals();
      let rootsEl = this.getEl('w-roots');
      if (!rootsEl || rootsEl.style.display === 'none') return;
      
      let wWord = this.getEl('w-word');
      let wMean = this.getEl('w-meaning');
      
      let wordVis = wWord && wWord.style.display !== 'none' && !wWord.innerText.includes('■');
      let meanVis = wMean && wMean.style.display !== 'none' && !wMean.innerText.includes('■');

      rootsEl.querySelectorAll('.r-text').forEach(n => {
          n.textContent = wordVis ? (n.dataset.real || '■■■') : '■■■';
      });
      rootsEl.querySelectorAll('.r-mean').forEach(n => {
          n.textContent = meanVis ? (n.dataset.real || '■■■') : '■■■';
      });
  },



  getCardVisuals(typeStr, lang) {
    if (!typeStr) {
        return {
            bg: 'var(--surface-elevated)',
            strip: 'linear-gradient(90deg, var(--primary), var(--primary))',
            border: 'var(--outline-strong)',
            wm: '',
            tagsHTML: '',
            cats: [],
            isMulti: false
        };
    }

    const POS_PALETTE = {
        noun: { key: 'noun', bg: 'var(--pos-noun-bg)', accent: 'var(--pos-noun-accent)' },
        verb: { key: 'verb', bg: 'var(--pos-verb-bg)', accent: 'var(--pos-verb-accent)' },
        adj: { key: 'adj', bg: 'var(--pos-adj-bg)', accent: 'var(--pos-adj-accent)' },
        'adj-na': { key: 'adj-na', bg: 'var(--pos-adj-na-bg)', accent: 'var(--pos-adj-na-accent)' },
        adv: { key: 'adv', bg: 'var(--pos-adv-bg)', accent: 'var(--pos-adv-accent)' },
        pronoun: { key: 'pronoun', bg: 'var(--pos-pronoun-bg)', accent: 'var(--pos-pronoun-accent)' },
        func: { key: 'func', bg: 'var(--pos-func-bg)', accent: 'var(--pos-func-accent)' },
        other: { key: 'other', bg: 'var(--pos-other-bg)', accent: 'var(--pos-other-accent)' }
    };

    const resolvePosCat = (rawType) => {
        const t = String(rawType || '').trim();
        const lower = t.toLowerCase();
        if (t.includes('形容动词') || t.includes('形动') || t.includes('ナ形')) return POS_PALETTE['adj-na'];
        if (t.includes('形容词') || t.includes('形') || lower === 'adj' || lower === 'adjective') return POS_PALETTE.adj;
        if (
            t.includes('助动词') ||
            t.includes('助词') ||
            t.includes('介词') ||
            t.includes('前置词') ||
            t.includes('连词') ||
            t.includes('接续') ||
            t.includes('接続') ||
            lower === 'prep' ||
            lower === 'conj'
        ) {
            return POS_PALETTE.func;
        }
        if (t.includes('动词') || t === '动' || /[段変变動自他サ]/.test(t) || lower === 'v' || lower === 'verb') return POS_PALETTE.verb;
        if (t.includes('代词') || t.includes('代') || lower === 'pron' || lower === 'pronoun') return POS_PALETTE.pronoun;
        if (t.includes('名词') || t.includes('名') || lower === 'n' || lower === 'noun') return POS_PALETTE.noun;
        if (t.includes('副词') || t.includes('副') || lower === 'adv' || lower === 'adverb') return POS_PALETTE.adv;
        return POS_PALETTE.other;
    };

    const buildSplitBg = (colors) => {
        if (colors.length === 0) return 'var(--surface-container)';
        if (colors.length === 1) return colors[0];
        const count = colors.length;
        const feather = count >= 3 ? 0.65 : 0.8;
        const stops = [];
        for (let i = 0; i < count; i++) {
            const start = (i / count) * 100;
            const end = ((i + 1) / count) * 100;
            const sPct = i === 0 ? 0 : +(start + feather).toFixed(2);
            const ePct = i === count - 1 ? 100 : +(end - feather).toFixed(2);
            stops.push(`${colors[i]} ${sPct}%`, `${colors[i]} ${ePct}%`);
        }
        return `linear-gradient(132deg, ${stops.join(', ')})`;
    };

    const buildSegmentedStrip = (accents) => {
        if (accents.length === 0) return 'linear-gradient(90deg, var(--primary), var(--primary))';
        if (accents.length === 1) return `linear-gradient(90deg, ${accents[0]}, ${accents[0]})`;
        const count = accents.length;
        const stops = [];
        for (let i = 0; i < count; i++) {
            const start = +((i / count) * 100).toFixed(2);
            const end = +(((i + 1) / count) * 100).toFixed(2);
            stops.push(`${accents[i]} ${start}% ${end}%`);
        }
        return `linear-gradient(90deg, ${stops.join(', ')})`;
    };

    /*
     * 显示层统一兼容中日双语多种词性分隔符，
     * 单词性呈现独立和纸矿物色，多词性呈现斜切拼色与顶部拼色色带。
     */
    let tags = String(typeStr)
        .split(/[・/／、,，;；|＋+&＆]+/)
        .map(type => type.trim())
        .filter(Boolean);
    if (tags.length === 0) {
        tags = [String(typeStr).trim()];
    }

    let wm = '';
    if (lang === 'en') {
        const getEnglishWatermark = type => {
            if (type.includes('名词') || type === '名') return 'n.';
            if (type.includes('动词') || type === '动') return 'v.';
            if (type.includes('形容词') && !type.includes('形容动词')) return 'adj.';
            if (type.includes('副词')) return 'adv.';
            if (type.includes('介词')) return 'prep.';
            if (type.includes('连词') || type.includes('连接')) return 'conj.';
            if (type.includes('代词')) return 'pron.';
            return type.charAt(0);
        };
        const watermarkItems = [...new Set(tags.map(getEnglishWatermark).filter(Boolean))].slice(0, 2);
        wm = watermarkItems.length > 1
            ? `<span class="wm-multi">${escapeHTML(watermarkItems.join('・'))}</span>`
            : escapeHTML(watermarkItems[0] || '');
    } else {
        const wmSet = new Set();
        if (typeStr.includes('自他')) { wmSet.add('が'); wmSet.add('を'); }
        else {
            if (typeStr.includes('自')) wmSet.add('が');
            if (typeStr.includes('他')) wmSet.add('を');
        }
        if (typeStr.includes('形动') || typeStr.includes('形容动词') || typeStr.includes('ナ形')) wmSet.add('な');
        if (typeStr.includes('名')) wmSet.add('の');
        const wmArray = Array.from(wmSet).slice(0, 2);
        wm = wmArray.length > 1 ? `<span class="wm-multi">${wmArray.join('・')}</span>` : wmArray.join('');
    }

    const uniqueCats = [];
    const seenKeys = new Set();
    const tagsHTML = tags.map(tag => {
        const cat = resolvePosCat(tag);
        if (!seenKeys.has(cat.key)) {
            seenKeys.add(cat.key);
            uniqueCats.push(cat);
        }
        return (
            `<span class="type-capsule" ` +
            `style="background: ${cat.bg}; color: ${cat.accent}; border-color: color-mix(in srgb, ${cat.accent} 34%, transparent);">` +
            `${escapeHTML(tag)}` +
            `</span>`
        );
    }).join('');

    const bgColors = uniqueCats.map(c => c.bg);
    const accentColors = uniqueCats.map(c => c.accent);
    const bg = buildSplitBg(bgColors);
    const strip = buildSegmentedStrip(accentColors);
    const border = accentColors[0]
        ? `color-mix(in srgb, ${accentColors[0]} 26%, var(--outline))`
        : 'var(--outline)';

    return {
        bg,
        strip,
        border,
        wm,
        tagsHTML,
        cats: uniqueCats.map(c => c.key),
        isMulti: uniqueCats.length >= 2
    };
  },

  applyCardVisuals(cardEl, visuals) {
    if (!cardEl || !visuals) return;
    cardEl.style.background = visuals.bg;
    cardEl.style.setProperty('--card-pos-bg', visuals.bg);
    cardEl.style.setProperty('--card-pos-strip', visuals.strip);
    cardEl.style.setProperty('--card-pos-border', visuals.border);
    cardEl.classList.toggle('is-multi-pos', Boolean(visuals.isMulti));
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
    } else if (mode === 'fsrs-review') {
        const total = Model.state.fsrsReviewItems?.length || Model.state.studyQueue.length || 0;
        if (total <= 10) {
            totalPixels = total;
            displayCurrent = Model.state.currentIndex;
        } else {
            totalPixels = 10;
            displayCurrent = Math.floor((Model.state.currentIndex / total) * 10);
        }
    }
    
    if (displayCurrent > totalPixels) displayCurrent = totalPixels;

    let baseCount = Model.state.studyQueue.length;
    if (mode === 'memory-test') {
        baseCount = Model.state.mtBaseQueue.length;
    } else if (mode === 'rote-learning' || mode === 'pendulum' || mode === 'dual-track') {
        baseCount = Model.state.uniqueWordCount;
    }
    
    if (baseCount > 100 || mode === 'rote-learning' || mode === 'memory-test' || mode === 'fsrs-review') {
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

          const rawEntries = [];

          Model.folders.forEach(folder => {
              if (
                  (
                      Model.folderLangs[folder] ||
                      'ja'
                  ) !== currentLang
              ) {
                  return;
              }

              rawEntries.push({
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

          rawEntries.push(
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
          const CHUNK_GROUPS = 50;

          const populatedEntries = rawEntries
              .map(entry => {
                  const words = Model.db.filter(word => {
                      return (
                          (word.lang || 'ja') === currentLang &&
                          Model.checkFilter(word, entry.cat)
                      );
                  });
                  return { ...entry, words };
              })
              .filter(entry => entry.words.length > 0);

          if (populatedEntries.length === 0) {
              container.classList.add('is-empty');
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

          let activeCat = populatedEntries[0].cat;
          let activeChunk = 0;

          if (selectedGroup.startsWith('group|')) {
              const parts = selectedGroup.split('|');
              const selCat = parts[1];
              const selIdx = Number(parts[2]) || 0;
              if (populatedEntries.some(e => e.cat === selCat)) {
                  activeCat = selCat;
                  activeChunk = Math.floor(selIdx / CHUNK_GROUPS);
              }
          }

          const tabsBar = document.createElement('div');
          tabsBar.className = 'group-range-tabs';
          tabsBar.setAttribute('role', 'tablist');
          tabsBar.setAttribute('aria-label', '选择范围分类');

          const chunksBar = document.createElement('div');
          chunksBar.className = 'group-range-chunks';
          chunksBar.setAttribute('aria-label', '快捷区段跳转');

          const sectionHost = document.createElement('div');
          sectionHost.className = 'group-range-host';

          const renderActiveView = () => {
              const entry =
                  populatedEntries.find(e => e.cat === activeCat) ||
                  populatedEntries[0];
              const words = entry.words;
              const totalGroups = Math.min(
                  1001,
                  Math.ceil(words.length / GROUP_STEP)
              );
              const totalChunks = Math.ceil(totalGroups / CHUNK_GROUPS);
              if (activeChunk >= totalChunks) activeChunk = 0;

              tabsBar.querySelectorAll('.group-range-tab').forEach(btn => {
                  const isAct = btn.dataset.cat === entry.cat;
                  btn.classList.toggle('active', isAct);
                  btn.setAttribute('aria-selected', String(isAct));
              });

              chunksBar.innerHTML = '';
              if (totalChunks > 1) {
                  chunksBar.hidden = false;
                  for (let c = 0; c < totalChunks; c++) {
                      const firstGroup = c * CHUNK_GROUPS;
                      const lastGroup = Math.min(
                          totalGroups - 1,
                          (c + 1) * CHUNK_GROUPS - 1
                      );
                      const firstStart =
                          ROTE_CORE.getGroupRange(firstGroup, words.length).start + 1;
                      const lastEnd =
                          ROTE_CORE.getGroupRange(lastGroup, words.length).end;
                      const chip = document.createElement('button');
                      chip.type = 'button';
                      chip.className = `group-range-chunk${c === activeChunk ? ' active' : ''}`;
                      chip.textContent = `${firstStart}–${lastEnd}`;
                      chip.setAttribute('aria-pressed', String(c === activeChunk));
                      chip.addEventListener('click', () => {
                          Hardware.playSound('click');
                          Hardware.vibrate(10);
                          activeChunk = c;
                          renderActiveView();
                      });
                      chunksBar.appendChild(chip);
                  }
              } else {
                  chunksBar.hidden = true;
              }

              sectionHost.innerHTML = '';

              const section = document.createElement('section');
              section.className = `group-range-section is-${entry.tone}`;

              const heading = document.createElement('div');
              heading.className = 'group-range-section-head';
              heading.innerHTML = `
                  <span
                      class="group-range-section-icon material-symbols-rounded"
                      aria-hidden="true"
                  >
                      ${entry.icon}
                  </span>
                  <span class="group-range-section-title">
                      ${escapeHTML(entry.text)}
                  </span>
                  <span class="group-range-section-count">
                      ${words.length} 词
                  </span>
              `;

              const grid = document.createElement('div');
              grid.className = 'group-range-section-grid';

              const startGroup = activeChunk * CHUNK_GROUPS;
              const endGroup = Math.min(totalGroups, startGroup + CHUNK_GROUPS);

              for (let groupIndex = startGroup; groupIndex < endGroup; groupIndex++) {
                  const range = ROTE_CORE.getGroupRange(groupIndex, words.length);
                  const startIndex = range.start;
                  const endIndex = range.end;

                  const groupValue = `group|${entry.cat}|${groupIndex}`;
                  const selected = selectedGroup === groupValue;
                  const clearCount = Model.mtGroupClears[groupValue] || 0;

                  const button = document.createElement('div');
                  button.className =
                      `bs-option group-range-option ` +
                      `${selected ? 'selected' : ''}`;
                  button.setAttribute('tabindex', '0');
                  button.setAttribute('role', 'button');
                  button.setAttribute('aria-pressed', selected ? 'true' : 'false');

                  let badgeHTML = '';
                  if (
                      entry.cat !== 'virtual_uncleared' &&
                      (clearCount > 0 || entry.cat === 'virtual_cleared')
                  ) {
                      let badgeClass = 'hanko-bronze';
                      if (clearCount >= 10 || entry.cat === 'virtual_cleared') {
                          badgeClass = 'hanko-diamond';
                      } else if (clearCount >= 5) {
                          badgeClass = 'hanko-gold';
                      } else if (clearCount >= 3) {
                          badgeClass = 'hanko-silver';
                      }
                      badgeHTML = `<span class="hanko-badge ${badgeClass}" aria-hidden="true"></span>`;
                  }

                  const rangeTitle =
                      words.length <= GROUP_SIZE
                          ? `全部 ${words.length} 词`
                          : `第 ${startIndex + 1}–${endIndex} 词`;

                  button.innerHTML = `
                      <span class="group-range-icon material-symbols-rounded" aria-hidden="true">view_module</span>
                      <span class="group-range-copy">
                          <strong>${rangeTitle}</strong>
                          <small>${endIndex - startIndex} 个词</small>
                      </span>
                      ${badgeHTML}
                      <span class="group-range-check material-symbols-rounded" aria-hidden="true">check</span>
                  `;

                  const displayText = `${entry.text} (第 ${startIndex + 1}-${endIndex} 词)`;

                  const choose = () => {
                      Hardware.playSound('click');
                      Hardware.vibrate(15);

                      Model.state.currentGroupKey = groupValue;
                      Model.state.currentGroupLabel = displayText;

                      const textElement = this.getEl('custom-group-text');
                      if (textElement) {
                          textElement.innerText = displayText;
                      }

                      localStorage.setItem('lastCustomGroupVal', groupValue);
                      localStorage.setItem('lastCustomGroupTxt', displayText);

                      this.renderStudyScope();
                      window.toggleModal('group-select-overlay', false);
                  };

                  button.addEventListener('click', choose);
                  button.addEventListener('keydown', event => {
                      if (event.key !== 'Enter' && event.key !== ' ') {
                          return;
                      }
                      event.preventDefault();
                      choose();
                  });

                  grid.appendChild(button);
              }

              section.appendChild(heading);
              section.appendChild(grid);
              sectionHost.appendChild(section);
          };

          populatedEntries.forEach(entry => {
              const tab = document.createElement('button');
              tab.type = 'button';
              tab.className = 'group-range-tab';
              tab.dataset.cat = entry.cat;
              tab.setAttribute('role', 'tab');
              tab.innerHTML = `
                  <span class="material-symbols-rounded" aria-hidden="true">${entry.icon}</span>
                  <span>${escapeHTML(entry.text)}</span>
                  <small>${entry.words.length}</small>
              `;
              tab.addEventListener('click', () => {
                  Hardware.playSound('click');
                  Hardware.vibrate(10);
                  activeCat = entry.cat;
                  activeChunk = 0;
                  renderActiveView();
              });
              tabsBar.appendChild(tab);
          });

          container.appendChild(tabsBar);
          container.appendChild(chunksBar);
          container.appendChild(sectionHost);
          renderActiveView();
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
            ? '完成选择'
            : '选择词条';
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
    if (searchInput) {
        searchInput.placeholder = Model.state.currentLangMode === 'en' ? '搜索英文、音标或释义...' : '搜索汉字、假名或释义...';
        const clearBtn = this.getEl('wb-search-clear');
        if (clearBtn) clearBtn.hidden = !searchInput.value.trim();
    }
    
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

    ZhongriHooks.emit('wordbank:ui-updated');


    const groupOverlay =
        this.getEl('group-select-overlay');

    if (
        groupOverlay?.classList.contains('active')
    ) {
        this.renderGroupRangePicker();
    }
  },

  renderStudyScope() {
    const groupSummary = this.getEl('group-study-summary');
    if (groupSummary) {
        const { sourceWords, groupLabel } = Controller.getStudyGroup();
        this.getEl('custom-group-text').textContent = groupLabel;
        groupSummary.textContent = sourceWords.length
            ? `${sourceWords.length} 个词 · 浏览、往复和强记会重复呈现词条`
            : '此分组暂无词条';
    }

    const filterSummary = this.getEl('filter-study-summary');
    const range = this.getEl('test-range-select');
    if (filterSummary && range?.value) {
        const count = Controller.getFilterTestWords().length;
        filterSummary.textContent = `${range.selectedOptions[0]?.text || '所选范围'} · ${count.toLocaleString('zh-CN')} 词`;
    }
  },

  renderDashboard() {
    // 英语模式下显示三杠（听力杠替代读音杠），标签文字动态切换
    const currentLang = Model.getCurrentLang();
    const kanaRow = this.getEl('prog-row-kana');
    if (kanaRow) {
        // 保持 CSS 的三列网格；此前写入 flex 会让中间的进度轨道被压缩掉。
        kanaRow.hidden = false;
        kanaRow.style.removeProperty('display');
    }
    const kanaBarLabel = document.getElementById('kana-bar-label');
    if (kanaBarLabel) kanaBarLabel.innerText = currentLang === 'en' ? '听力' : '读音';

    let stats = Model.calculateStats();
    const dueItems = Model.getDueFsrsCards ? Model.getDueFsrsCards(new Date(), Model.getCurrentLang()) : [];
    const dueCountEl = this.getEl('fsrs-due-count');
    const dueDetailEl = this.getEl('fsrs-due-detail');
    const streakTextEl = this.getEl('fsrs-streak-text');
    if (dueCountEl) dueCountEl.innerText = dueItems.length;
    if (streakTextEl) streakTextEl.innerText = `连续 ${stats.streak || 0} 天`;
    if (dueDetailEl) {
        const groups = dueItems.reduce((map, item) => {
            map[item.dimension] = (map[item.dimension] || 0) + 1;
            return map;
        }, {});
        const labels = { kanji: '拼写', spelling: '拼写', reading: '读音', listening: '听力', meaning: '释义' };
        const summary = Object.entries(groups).map(([dimension, count]) => `<span class="fsrs-due-chip">${escapeHTML(labels[dimension] || dimension)}<strong>${count}</strong></span>`).join('');
        dueDetailEl.innerHTML = summary || '<span class="fsrs-empty-copy"><span class="material-symbols-rounded">task_alt</span>今天没有到期项目，继续保持节奏</span>';
    }
    const fsrsStartButton = this.getEl('btn-start-fsrs-review');
    this.getEl('stats-panel')?.classList.toggle('has-due', dueItems.length > 0);
    if (fsrsStartButton) {
        fsrsStartButton.disabled = dueItems.length === 0;
        fsrsStartButton.innerHTML = dueItems.length
            ? '<span>开始复习</span>'
            : '<span>暂无到期复习</span>';
    }
    this.renderBookSelector();
    this.renderStudyScope();

    let clearedWordsCount = 0, kanjiCount = 0, kanaCount = 0, meaningCount = 0;
    
    // Build word → lang lookup for accurate counting
    const wordLangMap = {};
    Model.db.forEach(w => { wordLangMap[Model.getWordId(w)] = w.lang || 'ja'; });
    
Object.entries(Model.mtWordClears).forEach(([wordKey, st]) => {
        if (st && typeof st === 'object') {
            if (!Object.prototype.hasOwnProperty.call(wordLangMap, wordKey)) return;
            const lang = wordLangMap[wordKey];
            if (lang !== Model.state.currentLangMode) return;
            const norm = (lang === 'en' && st.word !== undefined)
                ? { kanji: Boolean(st.kanji ?? st.word), kana: Boolean(st.kana), meaning: Boolean(st.meaning) }
                : st;
            if (norm.kanji && norm.kana && norm.meaning) clearedWordsCount++;
            if (norm.kanji) kanjiCount++;
            if (norm.kana) kanaCount++;
            if (norm.meaning) meaningCount++;
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

        const setSubProgress = (id, percent) => {
            const bar = this.getEl(id);
            if (!bar) return;

            bar.style.width = `${percent}%`;
            // 0.1% 在手机上不到 1px，保留一个最小可见长度提示已有进度。
            bar.classList.toggle('has-progress', Number(percent) > 0);
        };

        setSubProgress('prog-bar-kanji', pKanji);
        setSubProgress('prog-bar-kana', pKana);
        setSubProgress('prog-bar-meaning', pMeaning);
        
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

    let lastTestDisplay = localStorage.getItem('lastTestDisplay') || (Model.state.currentLangMode === 'en' ? 'audio' : 'kana');
    if (Model.state.currentLangMode === 'en' && lastTestDisplay === 'kana') {
        lastTestDisplay = 'audio';
        localStorage.setItem('lastTestDisplay', 'audio');
    }
    if (displaySel && Array.from(displaySel.options).some(o => o.value === lastTestDisplay)) {
        displaySel.value = lastTestDisplay;
        displaySel.dispatchEvent(new Event('facade-update'));
    }

    const nowDate = new Date();
    const todayKey = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}-${String(nowDate.getDate()).padStart(2, '0')}`;
    let btn = this.getEl('btn-long-press');
    if (btn) {
        let isPunched = Model.records.some(r => {
            if (!r || r.type !== 'daily_punch') return false;
            const parsed = Model.parseLocalDate(r.date);
            if (!parsed) return false;
            const key = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
            return key === todayKey;
        });
        if(isPunched) {
            btn.className = 'btn-long-press done';
            btn.innerHTML = `<span class="lp-text"><span class="material-symbols-rounded" style="font-size:1.6rem;">task_alt</span> 今日已完成</span>`;
        } else {
            btn.className = 'btn-long-press';
            btn.innerHTML = `<div class="lp-bg"></div><span class="lp-text"><span class="material-symbols-rounded" style="font-size:1.6rem;">fingerprint</span> 长按打卡</span>`;
        }
    }
    this.renderCheckinLedger();
  },

  renderCheckinLedger() {
    const grid = this.getEl('checkin-stamp-grid');
    const summaryEl = this.getEl('checkin-ledger-summary');
    if (!grid) return;

    const toKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const stampedDates = new Set();

    (Model.records || []).forEach(r => {
        if (!r || (r.type !== 'daily_punch' && r.type !== 'pendulum') || !r.date) return;
        const parsed = Model.parseLocalDate(r.date);
        if (parsed) stampedDates.add(toKey(parsed));
    });
    (Model.fsrsReviewLogs || []).forEach(log => {
        if (!log?.review) return;
        const parsed = Model.parseLocalDate(log.review);
        if (parsed) stampedDates.add(toKey(parsed));
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayKey = toKey(today);
    // Align 28-day grid (4 full weeks) so columns match 日..六 cleanly
    const endDow = today.getDay();
    const totalCells = 28;
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (21 + endDow));

    let recentStamped = 0;
    const cells = [];
    for (let i = 0; i < totalCells; i++) {
        const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
        const key = toKey(d);
        const isFuture = d.getTime() > today.getTime();
        const isToday = key === todayKey;
        const isStamped = !isFuture && stampedDates.has(key);
        if (isStamped) recentStamped++;
        const dayNum = d.getDate();
        const label = `${d.getMonth() + 1}月${dayNum}日${isStamped ? ' · 已落印' : (isToday ? ' · 今日' : '')}`;
        cells.push(
            `<span class="checkin-stamp-cell${isStamped ? ' is-stamped' : ''}${isToday ? ' is-today' : ''}${isFuture ? ' is-future' : ''}" role="listitem" title="${label}" aria-label="${label}">${dayNum}</span>`
        );
    }
    grid.innerHTML = cells.join('');
    if (summaryEl) {
        summaryEl.textContent = `近 28 天 ${recentStamped} 印`;
    }
  },

  renderBookSelector() {
      document.querySelectorAll('.book-card[data-lang]').forEach(card => {
          const language = card.dataset.lang === 'en' ? 'en' : 'ja';
          const isActive = language === Model.state.currentLangMode;
          const isLoaded = Model.builtInLoadOrder.includes(language);
          const words = Model.db.filter(word => (word.lang || 'ja') === language);
          const wordIds = new Set(words.map(word => Model.getWordId(word)));
          let mastered = 0;
          Object.entries(Model.mtWordClears).forEach(([wordId, state]) => {
              if (wordIds.has(wordId) && state && typeof state === 'object' && state.kanji && state.kana && state.meaning) mastered++;
          });
          const percent = words.length ? Math.round(mastered / words.length * 100) : 0;
          const count = card.querySelector('[data-book-count]');
          const progress = card.querySelector('[data-book-progress]');
          const progressCopy = card.querySelector('[data-book-progress-copy]');
          const status = card.querySelector('[data-book-status]');

          card.classList.toggle('active', isActive);
          card.setAttribute('aria-pressed', String(isActive));
          if (count) count.textContent = isLoaded ? `${words.length} 词 · 已掌握 ${mastered}` : '点击后载入词书';
          if (progress) progress.style.width = `${isLoaded ? percent : 0}%`;
          if (progressCopy) progressCopy.textContent = isLoaded ? `学习进度 ${percent}%` : '学习记录会安全保留';
          if (status) status.textContent = isActive ? '当前使用' : '选择';
      });
      document.querySelectorAll('.lang-pill-btn[data-lang]').forEach(btn => {
          const isActive = btn.dataset.lang === Model.state.currentLangMode;
          btn.classList.toggle('active', isActive);
          btn.setAttribute('aria-pressed', String(isActive));
      });
      const shouldAnimateLangThumb = Boolean(this._bookSelectorRendered);
      this._bookSelectorRendered = true;
      document.querySelectorAll('.header-lang-switch').forEach(group => {
          SliderMotion.syncContainer(group, shouldAnimateLangThumb);
      });
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
      testSel.dispatchEvent(new Event('facade-update'));
      this.renderStudyScope();
  },

    renderStudyCard(anim = 'none') {
    let idx = Model.state.studyQueue[Model.state.currentIndex];
    let w = Model.db[idx];

    if (!Number.isInteger(idx) || !w) {
        Model.state.isAnimating = false;
        showToast('当前学习词条无法读取，请重新选择词组');
        this.getEl('btn-exit-study')?.click();
        return;
    }

    const wordLanguage = w.lang === 'en' ? 'en' : 'ja';
    this.getEl('w-word').lang = wordLanguage;
    this.getEl('w-kana').lang = wordLanguage;

    let mode = this.getEl('next-display-mode').value;
    
    let isMemTest = (Model.state.mode === 'memory-test');
    let isRote = (Model.state.mode === 'rote-learning');
    let isFilterTest = (Model.state.mode === 'filter-test');
    let isFsrsReview = (Model.state.mode === 'fsrs-review');
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
    this.applyCardVisuals(card, visuals);
    const flashWmLayer = card.querySelector('.watermark-layer');
    if (flashWmLayer) flashWmLayer.style.background = visuals.bg;
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
            if (isFsrsReview && !Model.state.fsrsAnswerRevealed) {
                const item =
                    Model.state.fsrsReviewItems?.[Model.state.currentIndex];
                const labels = {
                    kanji: '拼写',
                    spelling: '拼写',
                    reading: '读音',
                    listening: '听力',
                    meaning: '释义'
                };
                announcer.innerText =
                    `请回忆${labels[item?.dimension] || '答案'}，按空格揭晓。`;
                return;
            }
            const isEn = w.lang === 'en';
            if (isEn) {
                announcer.innerText = `Current word: ${w.word}. Meaning: ${w.meaning}.`;
            } else {
                let cleanKana = (w.kana || '').replace(/[【】\[\]()]/g, '');
                announcer.innerText = `当前单词：${w.word}。假名：${cleanKana}。`;
            }
        }
    };

    if (anim !== 'none' && !isMotionReduced()) {
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
                isFilterTest,
                isFsrsReview
            );

            triggerSRAnnouncement();

            card.classList.remove(exitClass);
            void card.offsetWidth;
            card.classList.add(enterClass);

            window.setTimeout(() => {
                card.classList.remove(enterClass);
                Model.state.isAnimating = false;
            }, 140);
        }, 100);
    } else {
        this.updateCardContent(
            w,
            visuals,
            mode,
            forceRoteFull,
            isMemTest,
            isRote,
            isFilterTest,
            isFsrsReview
        );

        triggerSRAnnouncement();
        Model.state.isAnimating = false;
    }
  },


    updateCardContent(w, visuals, mode, forceRoteFull, isMemTest, isRote, isFilterTest, isFsrsReview) {
    const isEnglish = w.lang === 'en';
    
    // 动态修改提示按钮的文案
    let hintBtn = this.getEl('btn-mt-show-hint');
    if (hintBtn) {
        hintBtn.innerText = isEnglish ? '听不清？点击朗读例句' : '听不清？显示假名';
        hintBtn.style.display = '';
    }

    this.getEl('mt-blind-audio-ui').classList.add('hidden');
    this.getEl('capsule-fsrs-review')?.classList.add('hidden');

    this.getEl('w-word').style.display = 'block';
    this.getEl('w-kana').style.display = 'block';
    this.getEl('w-meaning').style.display = 'block';
    this.getEl('w-type').style.display = 'flex';
    this.getEl('w-example-box').style.display = 'block';


    let mask = (str) => '■'.repeat(Array.from(str || '').length);
    let maskFixed = "■■■"; 

    if (isFsrsReview) {
        const item =
            Model.state.fsrsReviewItems?.[Model.state.currentIndex];
        const vm = STUDY_CARD_VM.buildFsrsCardViewModel({
            word: w,
            dimension: item?.dimension || 'meaning',
            isRevealed: Model.state.fsrsAnswerRevealed === true,
            isEnglish,
            showRootsPref: SETTINGS_STORE.getBool('showRoots')
        });

        this.applyDeclarativeCardViewModel(vm, w, visuals);
        this.getEl('capsule-pendulum').classList.add('hidden');
        this.getEl('capsule-filter-test').classList.add('hidden');
        this.getEl('capsule-filter-judge').classList.add('hidden');
        this.getEl('dual-track-ui').classList.add('hidden');
        this.getEl('memory-test-ui').classList.add('hidden');
        this.getEl('capsule-fsrs-review').classList.remove('hidden');
        this.getEl('btn-display-mode-trigger').style.display = 'none';
        this.syncRootsDisplay();
        this.updatePixelMatrix();
        if (vm.autoSpeakOnRender) {
            window.setTimeout(() => Hardware.speakWord(w), 80);
        }
        return;
    }

    if (isFilterTest) {
        const st = Model.state.ftState;
        const vm = STUDY_CARD_VM.buildFilterTestCardViewModel({
            word: w,
            displayMode: this.getEl('test-display-select').value || 'kana',
            ftState: st,
            ftHint: Model.state.ftHint,
            showKanaHint: Model.state.ftShowKanaHint,
            isEnglish,
            showRootsPref: SETTINGS_STORE.getBool('showRoots')
        });

        this.applyDeclarativeCardViewModel(vm, w, visuals);
        if (vm.autoSpeakOnRender) {
            Hardware.speakWord(w);
        }

        this.getEl('capsule-pendulum').classList.add('hidden');
        this.getEl('dual-track-ui').classList.add('hidden');
        this.getEl('memory-test-ui').classList.add('hidden');
        this.getEl('btn-display-mode-trigger').style.display = 'none';

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
        starBtn.setAttribute('aria-pressed', String(isStarred));
        starBtn.setAttribute(
            'aria-label',
            isStarred ? '取消收藏' : '收藏单词'
        );
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
        
        safeJpPart = safeJpPart.replace(/\$\\overset\{([^\}]+)\}\{([^\}]+)\}\$/g, '<ruby>$2<rt>$1</rt></ruby>');

        let safeCnPart = escapeHTML(cnPart);
        const wordLang = targetWordObj?.lang === 'en' ? 'en' : 'ja';
        let jpBoxHTML = `<div class="dt-ex-jp" data-speak="${escapeHTML(pureJpText)}"><span class="material-symbols-rounded ex-speaker" aria-hidden="true">volume_up</span><span class="example-text" lang="${wordLang}">${safeJpPart}</span></div>`;

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
    exBox.style.display = '';
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
          const wordLang = wObj.lang || 'ja';
          let pool = Model.db.filter(x => (x.lang || 'ja') === wordLang && x.folder === wObj.folder && x.type === wObj.type && x.word !== wObj.word && x.meaning !== targetMeaning);
          if (pool.length < 3) pool = Model.db.filter(x => (x.lang || 'ja') === wordLang && x.word !== wObj.word && x.meaning !== targetMeaning);
          pool = pool.sort(() => Math.random() - 0.5);
          const seenChoices = new Set([String(targetMeaning || '').trim()]);
          let choices = [{ text: targetMeaning, correct: true }];
          for (const x of pool) {
              if (choices.length >= 4) break;
              const txt = String(x.meaning || '').trim();
              if (!txt || seenChoices.has(txt)) continue;
              seenChoices.add(txt);
              choices.push({ text: txt, correct: false });
          }
          choices.sort(() => Math.random() - 0.5);
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

      pool = pool.sort(() => Math.random() - 0.5);
      const seenTexts = new Set([String(targetText || '').trim()]);
      let choices = [{ text: targetText, correct: true }];
      for (const x of pool) {
          if (choices.length >= 4) break;
          const candidateText = String(isMeaning ? x.meaning : x.word || '').trim();
          if (!candidateText || seenTexts.has(candidateText)) continue;
          seenTexts.add(candidateText);
          choices.push({ text: candidateText, correct: false });
      }
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

          pool = pool.sort(() => Math.random() - 0.5);
          const seenTexts = new Set([String(targetText || '').trim()]);
          let choices = [{ text: targetText, correct: true }];
          for (const x of pool) {
              if (choices.length >= 4) break;
              const candidateText = String(isMeaning ? x.meaning : x.word || '').trim();
              if (!candidateText || seenTexts.has(candidateText)) continue;
              seenTexts.add(candidateText);
              choices.push({ text: candidateText, correct: false });
          }
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
          Hardware.haptic('hint');
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
              else if (key === 'Enter') { btn.innerHTML = '<span>确认</span><span class="kbd-hint">Enter</span>'; btn.className = 'qwerty-key qwerty-key-confirm'; }
              else btn.innerText = key;
              
              btn.setAttribute('tabindex', '0');
              btn.setAttribute('role', 'button');
              
              btn.onpointerdown = (e) => { 
                  e.preventDefault(); 
                  inputEl.classList.remove('error-state', 'shake-anim');
                  if (key === 'Kana') { RomajiEngine.toggleMode(); btn.innerText = RomajiEngine.mode === 'hiragana' ? 'あ/ア' : 'ア/あ'; return; }
                  if (key === 'Enter') { Controller.handleSpellConfirm(inputEl, wObj, displayMode); return; }
                                    if (isEnglishKb) {
                      Hardware.haptic('key');
                      
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
      const resultCount = Model.state.filteredDb.length;
      const countEl = this.getEl('wb-result-count');
      const contextEl = this.getEl('wb-result-context');
      if (countEl) countEl.innerText = resultCount.toLocaleString('zh-CN');
      if (contextEl) {
          contextEl.innerText = resultCount
              ? (Model.state.batchMode
                  ? '轻触卡片进行选择'
                  : '轻触卡片查看详情')
              : '没有符合条件的词条';
      }
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
    if(!grid || !container) return false;

        const colsStr = this.getEl('wb-col-select').value;
    const requestedCols =
        Number.parseInt(colsStr, 10) || 3;

    grid.setAttribute(
        'data-cols',
        String(requestedCols)
    );

    const gridStyle = window.getComputedStyle(grid);
    const computedColumns = gridStyle.gridTemplateColumns;

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

    const columnsStatus = this.getEl('wb-actual-columns');
    if (columnsStatus) {
        columnsStatus.textContent = cols === requestedCols
            ? `当前显示 ${cols} 列`
            : `当前屏幕显示 ${cols} 列 · 偏好 ${requestedCols} 列`;
    }

    const blurMode =
        this.getEl('wb-blur-select').value; 
    
    const filteredData = Model.state.filteredDb;

    if (filteredData.length === 0) {
        grid.innerHTML = `<div class="wordbank-empty">
            <strong>没有匹配的词条</strong>
            <span>试试其他关键词，或调整上方筛选。</span>
        </div>`;
        Model.state.renderedStartIndex = -1;
        Model.state.renderedEndIndex = -1;
        grid.style.paddingTop = '0px'; grid.style.paddingBottom = '0px';
        return true;
    }

    // Use the rendered track size: responsive CSS changes both rows and gaps.
    const rowHeight =
        (Number.parseFloat(gridStyle.gridAutoRows) || 196) +
        (Number.parseFloat(gridStyle.rowGap) || 0);

    const totalRows = Math.ceil(filteredData.length / cols);
    const rect = container.getBoundingClientRect();
    const gridTop = window.scrollY + rect.top;
    this.wordbankLayout = { cols, rowHeight, gridTop, width: rect.width };
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

    if (Model.state.renderedStartIndex === startIndex && Model.state.renderedEndIndex === endIndex) {
        return false;
    }
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
      let isChecked = false;

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
        st = { kanji: Boolean(st.kanji ?? st.word), kana: Boolean(st.kana), meaning: Boolean(st.meaning) };
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
          topRightHTML = `<button type="button" class="wb-c-star btn-wb-star ${starClass}" aria-label="${starFilled ? '取消收藏' : '收藏单词'}" aria-pressed="${Boolean(starFilled)}"><span class="material-symbols-rounded" aria-hidden="true" style="font-variation-settings: 'FILL' ${starFilled};">star</span></button>`;
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
        ${cols !== 4 && !Model.state.batchMode ? `<button type="button" class="wb-c-speaker btn-wb-speak" aria-label="朗读单词"><span class="material-symbols-rounded" aria-hidden="true">volume_up</span></button>` : ''}
        <div class="wb-c-word ${blurW}" lang="${isEnglishWord ? 'en' : 'ja'}"><span class="wb-blur-trigger">${safeWord}</span></div>
        ${isEnglishWord ? `<div class="wb-c-kana ${blurK}" lang="en"><span class="wb-blur-trigger">${escapeHTML(w.phonetic || '')}</span></div>` : `<div class="wb-c-kana ${blurK}" lang="ja"><span class="wb-blur-trigger">${safeKana}</span>${pitchHTML}</div>`}
        <div class="wb-c-mean ${blurM}"><span class="wb-blur-trigger">${safeMean}</span></div>`;

      renderFingerprint = [
          idx,
          cols,
          blurMode,
          Model.state.batchMode,
          isChecked,
          starFilled,
          st.kanji,
          st.kana,
          st.meaning,
          w.word || '',
          w.kana || '',
          w.phonetic || '',
          w.type || '',
          w.meaning || '',
          w.pitch || '',
          w.level || '',
          w.frequency || '',
          w.difficulty || '',
          JSON.stringify(w.specialTags || [])
      ].join('|');


      let card;

      if (index < existingCards.length) {
          card = existingCards[index];
          card.classList.toggle(
              'is-selected',
              isChecked
          );
          if (card.dataset.fingerprint !== renderFingerprint) {
              this.applyCardVisuals(card, visuals);
              card.dataset.idx = idx;
              card.dataset.fingerprint = renderFingerprint;
              card.innerHTML = contentHTML;
          }
      } else {
          card = document.createElement('div');
          card.className =
              'wb-card' +
              (isChecked
                  ? ' is-selected'
                  : '');
          this.applyCardVisuals(card, visuals);
          card.dataset.idx = idx;
          card.dataset.fingerprint = renderFingerprint;
          card.style.opacity = '1';
          card.innerHTML = contentHTML;
          grid.appendChild(card);
      }

      card.removeAttribute('aria-pressed');
      card.removeAttribute('aria-checked');

      card.setAttribute('tabindex', '0');
      card.setAttribute(
          'role',
          Model.state.batchMode
              ? 'checkbox'
              : 'group'
      );
      card.setAttribute(
          'aria-label',
          Model.state.batchMode
              ? '选择单词卡片'
              : '单词卡片，点击或按回车查看详细释义'
      );

      if (Model.state.batchMode) {
          card.setAttribute(
              'aria-checked',
              String(isChecked)
          );
      }

    });

    while (grid.children.length > neededCount) {
        grid.removeChild(grid.lastChild);
    }


    let sentinel = this.getEl('wb-scroll-sentinel');
    if (sentinel) sentinel.style.display = 'none';
    return true;
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

const Controller = {
  initExtensions: [],
  registerInitExtension(name, callback) {
      if (
          !name ||
          typeof callback !== 'function' ||
          this.initExtensions.some(extension => extension.name === name)
      ) {
          return;
      }

      this.initExtensions.push({ name, callback });
  },
  async runInitExtensions() {
      for (const extension of this.initExtensions) {
          await extension.callback.call(this);
      }
  },
  pendingWordDraft: null,
  async init() {
    BottomSheet.init(); 
    Nav.init();
    SliderMotion.init();
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
    
    if(localStorage.getItem('theme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }
    View.applyColorPalette(SETTINGS_STORE.get('colorPalette'), { persist: false });
    
    let autoSpeak = localStorage.getItem('autoSpeak') !== 'false'; 
    let autoSpeakCheck = View.getEl('setting-auto-speak');
    if(autoSpeakCheck) autoSpeakCheck.checked = autoSpeak;

    let hapticsCheck = View.getEl('setting-haptics-enabled');
    if (hapticsCheck) hapticsCheck.checked = HAPTICS.isEnabled();

    let hapticsIntensitySel = View.getEl('setting-haptics-intensity');
    if (hapticsIntensitySel) {
        hapticsIntensitySel.value = HAPTICS.getIntensity ? HAPTICS.getIntensity() : 'standard';
        hapticsIntensitySel.dispatchEvent(new Event('facade-update'));
    }

    let hapticsCompatCheck = View.getEl('setting-haptics-compat');
    let hapticsCompatRow = View.getEl('setting-haptics-compat-row');
    if (hapticsCompatCheck) hapticsCompatCheck.checked = HAPTICS.isCompatMode();
    if (hapticsCompatRow && HAPTICS.getDiagnostics?.().isNative) {
        hapticsCompatRow.hidden = true;
    }
    
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

    let savedTTS = localStorage.getItem('ttsEngine') || 'azure';
    let ttsSelect = View.getEl('setting-tts-engine');
    if(ttsSelect) {
        ttsSelect.value = savedTTS;
        ttsSelect.dispatchEvent(new Event('facade-update')); 
    }

    let savedTTSRate = localStorage.getItem('ttsRate') || '1';
    let ttsRateSelect = View.getEl('setting-tts-rate');
    if (ttsRateSelect) {
        ttsRateSelect.value = ['0.75', '1', '1.25'].includes(savedTTSRate) ? savedTTSRate : '1';
        ttsRateSelect.dispatchEvent(new Event('facade-update'));
    }


let savedMode = localStorage.getItem('displayMode') || 'all'; View.getEl('next-display-mode').value = savedMode;

  const appVersion = View.getEl('settings-app-version');
  const appPublished = View.getEl('settings-app-published');
  if (appVersion) {
      appVersion.textContent = `${RELEASE_INFO.version} · ${RELEASE_INFO.build}`;
  }
  if (appPublished) {
      const publishedAt = new Date(RELEASE_INFO.publishedAt);
      appPublished.textContent = Number.isNaN(publishedAt.getTime())
          ? '当前缓存版本'
          : new Intl.DateTimeFormat('zh-CN', {
              dateStyle: 'medium',
              timeStyle: 'short'
          }).format(publishedAt);
  }

  let updatePromptShown = false;
  const promptForUpdate = () => {
      if (updatePromptShown) return;
      updatePromptShown = true;
      showConfirm('版本更新', '应用已有新版本，是否立即刷新以体验最新功能？', () => {
          window.location.reload();
      });
  };

  window.addEventListener('zhongri-update-ready', promptForUpdate);
  if (window.__zhongriUpdateReady) promptForUpdate();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        promptForUpdate();
      }
    });
  }

  await this.runInitExtensions();
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
        container.getBoundingClientRect().width ||
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
                // A rotation can emit scroll before the resize debounce finishes.
                // Keep the previous geometry until the resize handler restores its anchor.
                const layout = View.wordbankLayout;
                if (!layout || Math.abs(container.getBoundingClientRect().width - layout.width) < 1) {
                    View.renderVirtualGrid();
                }
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
                    container.getBoundingClientRect().width ||
                    window.innerWidth
                );

                const widthChanged =
                    Math.abs(
                        nextLayoutWidth -
                        lastLayoutWidth
                    ) >= 1;

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

                const savedScrollY = window.scrollY;
                const previous = View.wordbankLayout;
                const relativeY = previous ? savedScrollY - previous.gridTop : -1;
                const anchorIndex = relativeY >= 0
                    ? Math.floor(relativeY / previous.rowHeight) * previous.cols
                    : null;
                const rowOffset = relativeY >= 0 ? relativeY % previous.rowHeight : 0;

                Model.state.renderedStartIndex =
                    -1;

                Model.state.renderedEndIndex =
                    -1;

                View.renderVirtualGrid();

                window.requestAnimationFrame(() => {
                    const next = View.wordbankLayout;
                    const targetY = anchorIndex !== null && next
                        ? next.gridTop + Math.floor(anchorIndex / next.cols) * next.rowHeight +
                            Math.min(rowOffset, next.rowHeight - 1)
                        : savedScrollY;
                    window.scrollTo({ top: targetY, behavior: 'instant' });
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
      let ticking = false;

      const updateHeaderStatus = () => {
          header.classList.toggle('scrolled', window.scrollY > 10);
          ticking = false;
      };

      window.addEventListener('scroll', () => {
          if (ticking) return;
          ticking = true;
          window.requestAnimationFrame(updateHeaderStatus);
      }, { passive: true });
      updateHeaderStatus();
  },



  closeDetailIfOpen() {
      if (document.getElementById('detail-overlay').classList.contains('active')) {
          Hardware.vibrate(10);
          window.toggleModal('detail-overlay', false);
          if (document.getElementById('tab-wordbank').classList.contains('active')) {
              View.resetWordbankRenderer();
          }
      }
  },

  bindEvents() {
    document.querySelectorAll('.modal-overlay').forEach(ov => { 
        ov.addEventListener('click', (e) => { 
            if(e.target === ov) {
                Hardware.vibrate(10);
                window.toggleModal(ov.id, false); 
                if (ov.id === 'detail-overlay' && document.getElementById('tab-wordbank').classList.contains('active')) { View.resetWordbankRenderer(); }
            }
        }); 
    });
    
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => { 
        btn.addEventListener('click', (e) => { Hardware.playSound('click', { haptic: 'toggle' }); View.toggleTheme(e); }); 
    });
    
    View.getEl('btn-exit-study').addEventListener('click', () => {
        Hardware.haptic('sheetClose');
        Hardware.stopAllAudio();
        Model.state.studySessionId = (Model.state.studySessionId || 0) + 1;
        Model.state.isAnimating = false;
        Model.state.isWrongBookPractice = false;
        Model.state.mode = 'none';
        View.showPage('tab-home');
        View.renderDashboard();
        if (document.getElementById('tab-wordbank')?.classList.contains('active')) {
            View.updateWordbankUI();
            View.resetWordbankRenderer();
        }
    });

    // 📚 词书切换核心事件（支持设置页书架与顶栏快速切换）
    const handleLanguageSwitch = async (targetLang, activeTrigger) => {
        if (targetLang === Model.state.currentLangMode || this._bookSwitching) {
            Hardware.vibrate(10);
            return;
        }

        const shelf = document.querySelector('.book-shelf');
        const cards = Array.from(document.querySelectorAll('.book-card[data-lang], .lang-pill-btn[data-lang]'));
        const bookCard = document.querySelector(`.book-card[data-lang="${targetLang}"]`);
        this._bookSwitching = true;
        Hardware.playSound('click');
        Hardware.vibrate(15);
        activeTrigger?.setAttribute('aria-busy', 'true');
        bookCard?.classList.add('is-loading');
        shelf?.classList.add('is-switching');
        const langGroup = activeTrigger?.closest?.('.header-lang-switch');
        if (langGroup) {
            SliderMotion.syncContainer(langGroup, true, { targetEl: activeTrigger });
        }
        cards.forEach(item => { item.disabled = true; });

        try {
            await Model.ensureBuiltInLanguage(targetLang);
            Model.state.currentLangMode = targetLang;
            localStorage.setItem('langMode', targetLang);
            document.body.setAttribute('data-lang', targetLang);
            View.syncThemeUI();

            // 切换后强制清空跨语言选择，防止数据串线
            const selFilter = View.getEl('wb-folder-filter');
            if (selFilter) selFilter.value = 'all';
            localStorage.setItem('lastSelectedFolder', 'all');
            localStorage.removeItem('lastCustomGroupVal');
            localStorage.removeItem('lastCustomGroupTxt');
            Model.state.currentGroupKey = '';
            Model.state.currentGroupLabel = '';

            View.updateWordbankUI();
            View.resetWordbankRenderer();
            View.renderDashboard();
            window.dispatchEvent(
                new CustomEvent('zhongri-study-data-changed')
            );
            Hardware.playSound('success');
            Hardware.vibrate(35);
            showToast(`已切换至${targetLang === 'en' ? '英语' : '日语'}词书`);
        } catch (error) {
            console.error('[Wordbank] 词库切换加载失败', error);
            Hardware.playSound('error');
            Hardware.vibrate(45);
            showToast('词书载入失败，请检查网络后重试');
        } finally {
            this._bookSwitching = false;
            activeTrigger?.removeAttribute('aria-busy');
            bookCard?.classList.remove('is-loading');
            shelf?.classList.remove('is-switching');
            cards.forEach(item => { item.disabled = false; });
            View.renderBookSelector();
        }
    };

    document.querySelectorAll('.book-card[data-lang], .lang-pill-btn[data-lang]').forEach(trigger => {
        trigger.addEventListener('click', () => {
            handleLanguageSwitch(trigger.getAttribute('data-lang'), trigger);
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
    View.getEl('btn-start-fsrs-review')?.addEventListener('click', () => { Hardware.unlockSpeech(); this.startFsrsReview(); });
    View.getEl('fsrs-reveal-answer')?.addEventListener('click', () => this.revealFsrsAnswer());
    for (const id of ['test-range-select', 'test-display-select']) {
        View.getEl(id)?.addEventListener('change', () => View.renderStudyScope());
    }
    View.getEl('btn-test-range-trigger').addEventListener('click', () => { Hardware.haptic('sheetOpen'); BottomSheet.open(View.getEl('test-range-select'), document.createElement('span')); });
    View.getEl('btn-test-display-trigger').addEventListener('click', () => { Hardware.haptic('sheetOpen'); BottomSheet.open(View.getEl('test-display-select'), document.createElement('span')); });

    View.getEl('ft-forget').addEventListener('click', () => { Hardware.playSound('error', { haptic: 'error' }); this.processFilterTestResult(false); });
    View.getEl('ft-blur').addEventListener('click', () => { 
        Hardware.playSound('click', { haptic: 'hint' });
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
        Hardware.playSound('click', { haptic: 'cardFlip' });

        Model.state.ftState = 'C';
        View.renderStudyCard('none');

        requestAnimationFrame(() => {
            View.revealStudyAnswer();
        });
    });
    View.getEl('ft-correct').addEventListener('click', () => { Hardware.playSound('success', { haptic: 'correct' }); this.processFilterTestResult(true); });
    View.getEl('ft-wrong').addEventListener('click', () => { Hardware.playSound('error', { haptic: 'error' }); this.processFilterTestResult(false); });

    View.getEl('btn-prev').addEventListener('click', () => { if(Model.state.isAnimating) return; Hardware.unlockSpeech(); if(Model.state.currentIndex > 0) { Model.state.currentIndex--; Hardware.playSound('click', { haptic: 'cardFlip' }); View.renderStudyCard('prev'); } });
    View.getEl('btn-next').addEventListener('click', () => { if(Model.state.isAnimating) return; Hardware.unlockSpeech(); if(Model.state.currentIndex < Model.state.studyQueue.length-1) { Model.state.currentIndex++; Hardware.playSound('click', { haptic: 'cardFlip' }); View.renderStudyCard('next'); } });
    View.getEl('btn-finish').addEventListener('click', () => this.finishPendulum());
    
    /* ---------- Unified Non-Modal Popover Manager (P0) ---------- */
    const PopoverManager = (() => {
        const entries = [];
        let outsideBound = false;

        const closeEntry = entry => {
            if (!entry) return false;
            if (entry.type === 'details') {
                if (!entry.el.open) return false;
                entry.el.open = false;
                return true;
            }
            if (entry.panel.hidden) return false;
            entry.panel.hidden = true;
            entry.trigger?.setAttribute('aria-expanded', 'false');
            entry.trigger?.classList.remove('popover-active');
            return true;
        };

        const closeAll = (exceptEl = null) => {
            let closedAny = false;
            entries.forEach(entry => {
                const key = entry.type === 'details' ? entry.el : entry.panel;
                if (exceptEl && key === exceptEl) return;
                if (closeEntry(entry)) closedAny = true;
            });
            return closedAny;
        };

        const bindOutside = () => {
            if (outsideBound) return;
            outsideBound = true;
            document.addEventListener('pointerdown', event => {
                const target = event.target;
                entries.forEach(entry => {
                    if (entry.type === 'details') {
                        if (entry.el.open && !entry.el.contains(target)) {
                            entry.el.open = false;
                        }
                        return;
                    }
                    if (
                        !entry.panel.hidden &&
                        !entry.panel.contains(target) &&
                        !entry.trigger?.contains(target)
                    ) {
                        closeEntry(entry);
                    }
                });
            });
        };

        return {
            registerPopover(trigger, panel, onBeforeOpen = null) {
                if (!trigger || !panel) return;
                bindOutside();
                const entry = { type: 'popover', trigger, panel };
                entries.push(entry);
                trigger.addEventListener('click', event => {
                    event.stopPropagation();
                    const willOpen = panel.hidden;
                    Hardware.playSound('click', { haptic: willOpen ? 'sheetOpen' : 'sheetClose' });
                    closeAll(panel);
                    if (willOpen) {
                        onBeforeOpen?.();
                        panel.hidden = false;
                        trigger.setAttribute('aria-expanded', 'true');
                        trigger.classList.add('popover-active');
                    } else {
                        closeEntry(entry);
                    }
                });
            },
            registerDetails(detailsEl) {
                if (!detailsEl) return;
                bindOutside();
                entries.push({ type: 'details', el: detailsEl });
                detailsEl.addEventListener('toggle', () => {
                    if (detailsEl.open) {
                        closeAll(detailsEl);
                    }
                });
            },
            closeAll
        };
    })();
    window.ZhongriPopovers = PopoverManager;

    PopoverManager.registerDetails(document.querySelector('.wordbank-management'));

    let displayTrigger = View.getEl('btn-display-mode-trigger');
    let displayPopover = View.getEl('display-mode-popover');
    if (displayTrigger && displayPopover) {
        const renderDisplayModeOptions = () => {
            const selectEl = View.getEl('next-display-mode');
            const listEl = View.getEl('display-mode-options');
            if (!selectEl || !listEl) return;
            listEl.innerHTML = '';
            const isEn = Model.state.currentLangMode === 'en';
            const labelMap = isEn
                ? { all: '全显', word: '仅显单词', kana: '仅显音标', meaning: '仅显释义' }
                : { all: '全显', word: '仅显汉字', kana: '仅显假名', meaning: '仅显释义' };
            Array.from(selectEl.options).forEach(opt => {
                if (isEn && opt.value === 'kana') return;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `popover-menu-item${selectEl.value === opt.value ? ' selected' : ''}`;
                btn.setAttribute('role', 'menuitemradio');
                btn.setAttribute('aria-checked', String(selectEl.value === opt.value));
                btn.innerHTML = `<span>${escapeHTML(labelMap[opt.value] || opt.text)}</span><span class="material-symbols-rounded popover-check" aria-hidden="true">check</span>`;
                btn.addEventListener('click', () => {
                    Hardware.playSound('click');
                    Hardware.vibrate(10);
                    selectEl.value = opt.value;
                    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                    PopoverManager.closeAll();
                });
                listEl.appendChild(btn);
            });
        };
        PopoverManager.registerPopover(displayTrigger, displayPopover, renderDisplayModeOptions);
    }

    /* ---------- Inline Segmented Controls Bidirectional Sync (P1) ---------- */
    document.querySelectorAll('.segmented-control[data-segmented-for]').forEach(group => {
        const selectEl = View.getEl(group.dataset.segmentedFor);
        if (!selectEl) return;
        const buttons = Array.from(group.querySelectorAll('.segmented-option[data-value]'));
        const syncFromSelect = (animate = false) => {
            const val = selectEl.value;
            buttons.forEach(btn => {
                const isAct = btn.dataset.value === val;
                btn.classList.toggle('active', isAct);
                btn.setAttribute('aria-checked', String(isAct));
            });
            SliderMotion.syncContainer(group, animate);
        };
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (selectEl.value === btn.dataset.value) return;
                selectEl.value = btn.dataset.value;
                selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                syncFromSelect(true);
            });
        });
        selectEl.addEventListener('change', () => syncFromSelect(true));
        selectEl.addEventListener('facade-update', () => syncFromSelect(false));
        syncFromSelect(false);
    });

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

    let hapticsCheck = View.getEl('setting-haptics-enabled');
    if (hapticsCheck) {
        hapticsCheck.addEventListener('change', event => {
            HAPTICS.setEnabled(event.target.checked);
            if (event.target.checked) {
                Hardware.haptic('toggle', { force: true });
            }
            showToast(
                event.target.checked
                    ? '已开启场景化触感反馈'
                    : '已关闭触感反馈'
            );
        });
    }

    let hapticsIntensityTrigger = View.getEl('setting-haptics-intensity');
    if (hapticsIntensityTrigger) {
        hapticsIntensityTrigger.addEventListener('change', event => {
            const level = HAPTICS.setIntensity ? HAPTICS.setIntensity(event.target.value) : event.target.value;
            if (HAPTICS.isEnabled()) {
                Hardware.haptic('selection', { force: true });
            }
            const names = { light: '轻柔', standard: '标准', strong: '强烈' };
            showToast(`触感强度已设为「${names[level] || '标准'}」`);
        });
    }

    document.querySelectorAll('[data-haptic-preview]').forEach(chip => {
        chip.addEventListener('click', () => {
            const scenario = chip.dataset.hapticPreview || 'tap';
            const accepted = Hardware.haptic(scenario, { force: true });
            chip.classList.remove('is-pulsing');
            void chip.offsetWidth;
            chip.classList.add('is-pulsing');
            setTimeout(() => chip.classList.remove('is-pulsing'), 260);
            if (!accepted) {
                showToast('当前浏览器不支持或拦截了震动请求');
            }
        });
    });

    let hapticsCompatCheck = View.getEl('setting-haptics-compat');
    if (hapticsCompatCheck) {
        hapticsCompatCheck.addEventListener('change', event => {
            HAPTICS.setCompatMode(event.target.checked);
            if (HAPTICS.isEnabled()) {
                Hardware.haptic('toggle', { force: true });
            }
            showToast(
                event.target.checked
                    ? '已开启浏览器短震动兼容模式'
                    : '已恢复标准震动模式'
            );
        });
    }


    document.querySelectorAll('.palette-card[data-palette-option]').forEach(card => {
        card.addEventListener('click', () => {
            const targetPalette = card.dataset.paletteOption;
            if (!targetPalette) return;
            Hardware.playSound('click', { haptic: 'selection' });
            const applyAction = () => View.applyColorPalette(targetPalette, { persist: true, toast: true });
            if (!document.startViewTransition || isMotionReduced()) {
                applyAction();
                return;
            }
            const transition = document.startViewTransition(applyAction);
            transition.ready?.catch(() => {});
            transition.updateCallbackDone?.catch(() => {});
            transition.finished?.catch(() => {});
        });
    });

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
            View.renderStudyScope();
            showToast(e.target.checked ? "已开启智能跳过已亮维度" : "已关闭智能跳过已亮维度");
        });
    }

    let ttsSelectTrigger = View.getEl('setting-tts-engine');
if (ttsSelectTrigger) {
    ttsSelectTrigger.addEventListener('change', (e) => {
        Hardware.playSound('click', { haptic: 'selection' });
        localStorage.setItem('ttsEngine', e.target.value);
        let names = { 'local': '系统自带', 'youdao': '网易有道', 'azure': '微软语音' };
        showToast(`已切换至 ${names[e.target.value]} 发音`);
    });
}

    let ttsRateTrigger = View.getEl('setting-tts-rate');
    if (ttsRateTrigger) {
        ttsRateTrigger.addEventListener('change', (e) => {
            Hardware.playSound('click', { haptic: 'selection' });
            localStorage.setItem('ttsRate', e.target.value);
            const rateNames = { '0.75': '0.75× 慢速', '1': '1.0× 标准语速', '1.25': '1.25× 较快' };
            showToast(`已设为 ${rateNames[e.target.value] || '1.0× 标准语速'}`);
        });
    }


let testVibrateBtn = View.getEl('btn-test-vibrate');
if (testVibrateBtn) {
    testVibrateBtn.addEventListener('click', () => {
        // 先同步触发震动，避免 AudioContext 初始化干扰手势上下文
        const accepted = Hardware.haptic(
            'diagnostic',
            { force: true }
        );
        Hardware.playSound('click', { haptic: false });
        const diag = HAPTICS.getDiagnostics ? HAPTICS.getDiagnostics() : { engine: 'web', compatMode: false };
        const statusEl = View.getEl('haptics-test-status');

        if (accepted) {
            if (diag.engine === 'native') {
                showToast('原生触感引擎已触发两次强震动');
                if (statusEl) {
                    statusEl.hidden = false;
                    statusEl.dataset.state = 'ok';
                    statusEl.textContent = '原生引擎已触发两次强震动。若无震感，请检查系统「声音与振动 → 触摸反馈」或是否处于省电/勿扰模式。';
                }
            } else if (diag.engine === 'ios-switch') {
                showToast('已尝试触发 iOS 触感反馈');
                if (statusEl) {
                    statusEl.hidden = false;
                    statusEl.dataset.state = 'ok';
                    statusEl.textContent = '已通过 Safari 触感开关通道触发。若无震感，请确认系统「设置 → 声音与触感 → 系统触感反馈」已开启。';
                }
            } else if (diag.compatMode) {
                showToast('已发送两次兼容强震动');
                if (statusEl) {
                    statusEl.hidden = false;
                    statusEl.dataset.state = 'ok';
                    statusEl.textContent = '已用 >1 秒脉冲截断（兼容模式）发送两次强震动，浏览器已接收。若仍完全无感，说明系统级静音、勿扰、省电模式或「触摸反馈」关闭屏蔽了浏览器震动。';
                }
            } else {
                showToast('浏览器已发送两次强震动请求');
                if (statusEl) {
                    statusEl.hidden = false;
                    statusEl.dataset.state = 'hint';
                    statusEl.textContent = '浏览器已接收震动请求。若手机未震动：① 请确认未处于静音 / 勿扰 / 省电模式，且系统「触摸反馈」已开；② 部分新版 Android Chrome / Edge 存在 ≤1 秒震动失效问题，可开启上方「浏览器短震动兼容」后再试。';
                }
            }
        } else {
            showToast('当前浏览器不支持或拦截了震动请求');
            if (statusEl) {
                statusEl.hidden = false;
                statusEl.dataset.state = 'warn';
                statusEl.textContent = diag.hasVibrateApi
                    ? '浏览器拦截了本次震动请求（可能未获得有效点击激活或被浏览器隐私策略屏蔽）。'
                    : '当前浏览器未提供 Vibration API（桌面端或部分内置浏览器不支持），请使用 Android Chrome / Edge 或安装安卓客户端。';
            }
        }
    });
}

    let searchInput = View.getEl('wb-search-input');
    let searchClearBtn = View.getEl('wb-search-clear');
    const syncSearchClear = () => {
        if (searchClearBtn && searchInput) {
            searchClearBtn.hidden = !searchInput.value.trim();
        }
    };
    if (searchInput) {
        syncSearchClear();
        searchInput.addEventListener('input', () => {
            syncSearchClear();
            if (Model.state.batchMode) Controller.toggleBatchMode();
            View.resetWordbankRenderer();
        });
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                searchInput.blur();
            }
        });
    }
    if (searchClearBtn && searchInput) {
        searchClearBtn.addEventListener('click', () => {
            Hardware.playSound('click');
            Hardware.vibrate(10);
            searchInput.value = '';
            syncSearchClear();
            searchInput.dispatchEvent(new Event('input'));
            searchInput.focus();
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
    let punchTimer = null; let chargeTickTimer = null; let isLpPressing = false;
    const clearPunch = () => {
        if (punchTimer) clearTimeout(punchTimer);
        if (chargeTickTimer) clearTimeout(chargeTickTimer);
        punchTimer = null; chargeTickTimer = null; isLpPressing = false;
        if (lpBtn) lpBtn.classList.remove('pressing');
        Hardware.stopChargeSound();
    };
    if (lpBtn) {
        lpBtn.addEventListener('pointerdown', (e) => {
            if (lpBtn.classList.contains('done') || isLpPressing) return;
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            isLpPressing = true;
            Hardware.unlockSpeech();
            try { lpBtn.setPointerCapture(e.pointerId); } catch (err) {}
            lpBtn.classList.add('pressing');
            Hardware.playChargeSound();

            // 渐进加速短促心跳蓄力：220ms -> 95ms，力度 8ms -> 20ms，至 1500ms 咚咚咚落印
            const startedAt = Date.now();
            const scheduleChargePulse = () => {
                if (!isLpPressing) return;
                const elapsed = Date.now() - startedAt;
                if (elapsed >= 1420) return;
                const progress = Math.min(1, elapsed / 1500);
                Hardware.hapticChargeTick(progress);
                const nextGap = Math.round(220 - progress * 125);
                chargeTickTimer = setTimeout(scheduleChargePulse, nextGap);
            };
            scheduleChargePulse();

            punchTimer = setTimeout(() => {
                clearPunch();
                Hardware.playDingDong();
                Hardware.haptic('celebration');
                let t = new Date().toLocaleDateString('zh-CN');
                Model.records.push({ date: t, type: 'daily_punch' });
                Model.saveRecords();
                View.renderDashboard();
                showToast('打卡成功！能量满点');
            }, 1500);
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
                    const storageKey = Model.state.mode === 'rote-learning' ? 'roteDisplayMode' : 'displayMode';
                    localStorage.setItem(storageKey, e.target.value);
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
        const wordObj =
            Model.db[Model.state.studyQueue[Model.state.currentIndex]];
        const wordId = Model.getWordId(wordObj);
        const index = Model.stars.indexOf(wordId);
        const isStarred = index === -1;
        const button = e.currentTarget;
        const icon = View.getEl('star-icon');

        Hardware.playSound('click', { haptic: isStarred ? 'star' : 'selection' });

        if (!isStarred) {
            Model.stars.splice(index, 1);
            button.classList.remove('active');
            icon.style.fontVariationSettings = "'FILL' 0";
        } else {
            Model.stars.push(wordId);
            button.classList.add('active');
            icon.style.fontVariationSettings = "'FILL' 1";
            window.createStarParticles(button);
        }

        button.setAttribute('aria-pressed', String(isStarred));
        button.setAttribute(
            'aria-label',
            isStarred ? '取消收藏' : '收藏单词'
        );
        Model.saveStars();
    });

    let dtStarBtn = View.getEl('dt-star-btn');
    if (dtStarBtn) {
        dtStarBtn.addEventListener('click', (e) => {
            const realIdx =
                Model.state.detailArray[Model.state.activeDetailIdx];
            const word = Model.db[realIdx];
            const wordId = Model.getWordId(word);
            const starIndex = Model.stars.indexOf(wordId);
            const isStarred = starIndex === -1;
            const starButton = e.currentTarget;
            const icon = View.getEl('dt-star-icon');

            Hardware.playSound('click', { haptic: isStarred ? 'star' : 'selection' });

            if (!isStarred) {
                Model.stars.splice(starIndex, 1);
                starButton.classList.remove('active');
                icon.style.fontVariationSettings = "'FILL' 0";
            } else {
                Model.stars.push(wordId);
                starButton.classList.add('active');
                icon.style.fontVariationSettings = "'FILL' 1";
                window.createStarParticles(starButton);
            }

            starButton.setAttribute('aria-pressed', String(isStarred));
            starButton.setAttribute(
                'aria-label',
                isStarred ? '取消收藏' : '收藏单词'
            );
            Model.saveStars();
            Model.state.renderedStartIndex = -1;
        });
    }

        document.addEventListener('click', (e) => { 
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

            Hardware.playSound('click', { haptic: 'cardFlip' });
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
                Hardware.haptic('tap'); 
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
                Hardware.haptic('tap');
            }
        }
    });


    let pressTimer = null; let isPressing = false; let startX = 0; let startY = 0; let startScrollY = 0; let suppressCardClickUntil = 0;
    const clearPressCard = (card) => { if(pressTimer) clearTimeout(pressTimer); pressTimer = null; isPressing = false; if(card) card.classList.remove('pressing'); };
    const onPointerDownCard = (e) => { if(e.pointerType === 'mouse' && e.button !== 0) return; let card = e.target.closest('.wb-card'); if (!card || e.target.closest('button, .wb-checkbox, .wb-c-speaker, .btn-wb-star')) return; if (Model.state.batchMode) return; startX = e.clientX; startY = e.clientY; startScrollY = window.scrollY; isPressing = true; card.classList.add('pressing'); pressTimer = setTimeout(() => { if(isPressing && Math.abs(window.scrollY - startScrollY) < 10) { suppressCardClickUntil = Date.now() + 700; Hardware.playSound('click', { haptic: 'longPress' }); Controller.openDetailModal(parseInt(card.dataset.idx)); clearPressCard(card); } }, 500); };
    const onPointerMoveCard = (e) => { if(!isPressing) return; if(Math.abs(e.clientX - startX) > 25 || Math.abs(e.clientY - startY) > 25) { let card = e.target.closest('.wb-card'); clearPressCard(card); } };
    const onPointerUpCard = (e) => { let card = e.target.closest('.wb-card'); clearPressCard(card); };
    let grid = View.getEl('wb-grid'); grid.addEventListener('pointerdown', onPointerDownCard); grid.addEventListener('pointermove', onPointerMoveCard); grid.addEventListener('pointerup', onPointerUpCard); grid.addEventListener('pointercancel', onPointerUpCard);
    grid.addEventListener('contextmenu', (e) => { if(e.target.closest('.wb-card') && !e.target.closest('.btn-wb-star')) e.preventDefault(); });
    grid.addEventListener('keydown', (e) => {
      const card = e.target.closest('.wb-card');
      if (!card || e.target !== card || !['Enter', ' '].includes(e.key)) return;

      const idx = parseInt(card.dataset.idx);

      e.preventDefault();

      if (Model.state.batchMode) {
          card.click();
          return;
      }

      Hardware.haptic('sheetOpen');
      Controller.openDetailModal(idx);
    });
    grid.addEventListener('click', (e) => {
      let card = e.target.closest('.wb-card'); if (!card) return; let idx = parseInt(card.dataset.idx);
      if (e.target.closest('.btn-wb-star')) {
          const word = Model.db[idx];
          const wordId = Model.getWordId(word);
          const starIndex = Model.stars.indexOf(wordId);
          const isStarred = starIndex === -1;
          const starButton = e.target.closest('.btn-wb-star');
          const icon = starButton.querySelector('.material-symbols-rounded');

          Hardware.playSound('click', { haptic: isStarred ? 'star' : 'selection' });

          if (!isStarred) {
              Model.stars.splice(starIndex, 1);
              starButton.classList.remove('active');
              icon.style.fontVariationSettings = "'FILL' 0";
          } else {
              Model.stars.push(wordId);
              starButton.classList.add('active');
              icon.style.fontVariationSettings = "'FILL' 1";
              window.createStarParticles(starButton);
          }

          starButton.setAttribute('aria-pressed', String(isStarred));
          starButton.setAttribute(
              'aria-label',
              isStarred ? '取消收藏' : '收藏单词'
          );
          Model.saveStars();
          if (View.getEl('wb-folder-filter')?.value === 'virtual_starred') {
              View.resetWordbankRenderer();
          }
          return;
      }
      if (e.target.closest('.btn-wb-speak') || e.target.closest('.wb-c-speaker')) { Hardware.unlockSpeech(); Hardware.speakWord(Model.db[idx], e.target.closest('.btn-wb-speak') || e.target.closest('.wb-c-speaker')); Hardware.haptic('tap'); return; }
      if (Model.state.batchMode) {
          e.stopPropagation();

          if (Model.state.selectedSet.has(idx)) {
              Model.state.selectedSet.delete(idx);
          } else {
              Model.state.selectedSet.add(idx);
          }

          const isSelected =
              Model.state.selectedSet.has(idx);

          Hardware.playSound('click', { haptic: 'selection' });

          card.classList.toggle(
              'is-selected',
              isSelected
          );
          card.setAttribute(
              'aria-checked',
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
          return;
      }

      if (
          e.target.closest('.blur-text') ||
          Date.now() < suppressCardClickUntil
      ) {
          return;
      }

      Hardware.playSound('click', { haptic: 'sheetOpen' });
      Controller.openDetailModal(idx);
    });

    View.getEl('wb-manage-toggle').addEventListener('click', event => {
        const menu = event.currentTarget.closest('details');
        menu.open = false;
        menu.querySelector('summary').focus();
        this.toggleBatchMode();
    });
    View.getEl('btn-batch-cancel').addEventListener(
        'click',
        () => this.toggleBatchMode(false)
    );
    View.getEl('btn-new-word')?.addEventListener('click', event => {
        const menu = event.currentTarget.closest('details');
        if (menu) menu.open = false;
        this.openNewWordModal();
    });
    View.getEl('btn-new-folder').addEventListener('click', event => {
        const menu = event.currentTarget.closest('details');
        if (menu) menu.open = false;
        this.createFolder();
    });
    View.getEl('btn-del-folder').addEventListener('click', event => {
        const menu = event.currentTarget.closest('details');
        if (menu) menu.open = false;
        this.deleteFolder();
    });
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
    View.getEl('import-folder-select')?.addEventListener('change', () => this.updateImportTargetSummary());
    View.getEl('import-lang-select').addEventListener('change', () => {
        this.updateImportFormatUI();
        this.updateImportFolderOptions();
        this.updateImportMetadataOptions();
    });
    const viewSettingsTrigger = View.getEl('btn-view-settings');
    const viewSettingsPopover = View.getEl('view-settings-popover');
    if (viewSettingsTrigger && viewSettingsPopover) {
        const syncViewSettingsPopover = () => {
            const colVal = View.getEl('wb-col-select')?.value || '3';
            const blurVal = View.getEl('wb-blur-select')?.value || 'all';
            viewSettingsPopover.querySelectorAll('.vs-col-btn').forEach(b => {
                b.classList.toggle('selected', b.dataset.val === colVal);
            });
            viewSettingsPopover.querySelectorAll('.vs-blur-btn').forEach(b => {
                b.classList.toggle('selected', b.dataset.val === blurVal);
            });
        };
        viewSettingsPopover.querySelectorAll('.vs-col-btn').forEach(b => {
            b.addEventListener('click', () => {
                Hardware.playSound('click');
                Hardware.vibrate(10);
                View.getEl('wb-col-select').value = b.dataset.val;
                syncViewSettingsPopover();
                View.resetWordbankRenderer();
            });
        });
        viewSettingsPopover.querySelectorAll('.vs-blur-btn').forEach(b => {
            b.addEventListener('click', () => {
                Hardware.playSound('click');
                Hardware.vibrate(10);
                View.getEl('wb-blur-select').value = b.dataset.val;
                syncViewSettingsPopover();
                View.resetWordbankRenderer();
            });
        });
        window.ZhongriPopovers?.registerPopover(
            viewSettingsTrigger,
            viewSettingsPopover,
            syncViewSettingsPopover
        );
    }
    View.getEl('btn-reset-progress').addEventListener('click', () => {
        Hardware.vibrate(20);
        showConfirm(
            '清空学习进度？',
            '词库、收藏和设置都会保留；掌握度、通关与学习记录将归零。',
            () => this.clearLearningProgress(),
            { confirmLabel: '清空进度', danger: true }
        );
    });
    View.getEl('btn-remove-imported').addEventListener('click', () => {
        Hardware.vibrate(20);
        showConfirm(
            '移除个人导入和自建词库？',
            '个人导入词汇和自建词库将被移除，内置日语与英语词库会重新载入。',
            () => this.restoreBuiltInLibrary(),
            { confirmLabel: '移除并恢复', danger: true }
        );
    });
    View.getEl('btn-reset').addEventListener('click', () => {
        Hardware.vibrate(30);
        showConfirm(
            '完全重置应用？',
            '<strong style="color: var(--accent-red);">此操作会删除词库改动、收藏、学习记录、错题和偏好设置。</strong><br><br>执行前会自动建立恢复点。',
            () => this.fullResetApp(),
            { confirmLabel: '完全重置', danger: true }
        );
    });
    View.getEl('detail-close').addEventListener('click', () => { Hardware.haptic('sheetClose'); window.toggleModal('detail-overlay', false); if (document.getElementById('tab-wordbank').classList.contains('active')) { View.resetWordbankRenderer(); } });
    View.getEl('detail-edit')?.addEventListener('click', () => {
        Hardware.playSound('click', { haptic: 'sheetOpen' });
        const realIdx = Model.state.detailArray[Model.state.activeDetailIdx];
        if (typeof realIdx === 'number' && Model.db[realIdx]) {
            this.editWord(realIdx);
        }
    });
    View.getEl('detail-prev').addEventListener('click', () => this.navDetail(-1)); View.getEl('detail-next').addEventListener('click', () => this.navDetail(1));
    this.bindDetailCardSwipe();

    View.getEl('btn-summary-home')?.addEventListener('click', () => {
        Hardware.playSound('click', { haptic: 'sheetClose' });
        window.toggleModal('study-summary-overlay', false);
    });
    View.getEl('study-summary-overlay')?.addEventListener('click', event => {
        if (event.target === event.currentTarget) {
            window.toggleModal('study-summary-overlay', false);
        }
    });
    View.getEl('btn-summary-practice-weak')?.addEventListener('click', () => {
        const indices = this._lastSummaryAction?.weakIndices || [];
        window.toggleModal('study-summary-overlay', false);
        if (indices.length) {
            Hardware.unlockSpeech();
            this.startWeakWordsPractice(indices);
        }
    });
    View.getEl('btn-summary-next-group')?.addEventListener('click', () => {
        const next = this._lastSummaryAction?.nextGroup;
        window.toggleModal('study-summary-overlay', false);
        if (next) {
            Hardware.unlockSpeech();
            Model.state.currentGroupKey = next.groupKey;
            Model.state.currentGroupLabel = next.groupLabel;
            localStorage.setItem('lastCustomGroupVal', next.groupKey);
            localStorage.setItem('lastCustomGroupTxt', next.groupLabel);
            const groupText = View.getEl('custom-group-text');
            if (groupText) groupText.innerText = next.groupLabel;
            this.startPendulum(next.launchMode || 'pendulum');
        }
    });
    View.getEl('study-summary-weak-list')?.addEventListener('click', event => {
        const chip = event.target.closest('[data-summary-word-idx]');
        if (!chip) return;
        const idx = Number.parseInt(chip.dataset.summaryWordIdx, 10);
        const w = Model.db[idx];
        if (!w) return;
        Hardware.vibrate(12);
        Hardware.speakWord(w);
    });
    View.getEl('btn-save-edit').addEventListener('click', () => {
        Hardware.haptic('confirm');

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

            const detailOverlay = document.getElementById('detail-overlay');
            if (detailOverlay?.classList.contains('active')) {
                const activeRealIdx = Model.state.detailArray[Model.state.activeDetailIdx];
                if (activeRealIdx === Model.editingIdx || Model.db[activeRealIdx] === word) {
                    this.updateDetailContent(word, false);
                }
            }

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
        Hardware.haptic('sheetClose');
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

        
        const activeModal = [...document.querySelectorAll('.modal-overlay.active, #root-review-overlay.active')]
            .reduce((top, modal) => {
                const z = Number.parseInt(getComputedStyle(modal).zIndex, 10) || 0;
                const topZ = top ? Number.parseInt(getComputedStyle(top).zIndex, 10) || 0 : 0;
                return !top || z >= topZ ? modal : top;
            }, null);

        if (e.key === 'Escape' && activeModal) {
            if (activeModal.id === 'root-review-overlay') return;
            e.preventDefault();
            const close = activeModal.querySelector(
                '[data-sheet-close], #prompt-cancel, #dialog-cancel, #btn-cancel-edit, #btn-cancel-move, #detail-close, #btn-summary-home'
            );
            if (close) close.click();
            else window.toggleModal(activeModal.id, false);
            return;
        }

        // 🟢 WCAG 焦点陷阱 (Focus Trap) - 必须置于最顶层防线之前
        if (e.key === 'Tab') {
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
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT' || document.activeElement.isContentEditable)) {
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

        // 🟢 全局通用快捷键：Esc 优先关闭轻量非模态小窗，再退出学习区
        if (key === 'Escape') {
            if (window.ZhongriPopovers?.closeAll()) {
                return;
            }
            if (!View.getEl('study-area').classList.contains('hidden')) {
                View.getEl('btn-exit-study').click();
                return;
            }
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
        let isAnyModalOpen = document.querySelectorAll('.modal-overlay.active, #root-review-overlay.active').length > 0;
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

        // 🔵 首页（学习）特定快捷键
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
            if (mode === 'fsrs-review' && /^[1-4]$/.test(key)) {
                e.preventDefault();
                if (Model.state.fsrsAnswerRevealed) {
                    ['again', 'hard', 'good', 'easy'][Number(key) - 1] && Controller.applyFsrsRating(['again', 'hard', 'good', 'easy'][Number(key) - 1]);
                }
                return;
            }
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
                if (
                    mode === 'fsrs-review' &&
                    !Model.state.fsrsAnswerRevealed
                ) {
                    Controller.revealFsrsAnswer();
                    return;
                }
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
      return SETTINGS_STORE.collectBackupPreferences();
  },

  applyBackupPreferences(preferences) {
      SETTINGS_STORE.applyBackupPreferences(preferences);
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
              fsrsCards: cloneValue(Model.fsrsCards),
              fsrsReviewLogs: cloneValue(Model.fsrsReviewLogs)
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
                  fsrsCards:
                      rawData.data.fsrsCards &&
                      typeof rawData.data.fsrsCards === 'object' &&
                      !Array.isArray(rawData.data.fsrsCards)
                          ? rawData.data.fsrsCards
                          : null,
                  fsrsReviewLogs:
                      Array.isArray(rawData.data.fsrsReviewLogs)
                          ? rawData.data.fsrsReviewLogs
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
                      rawData.mtWordClears || {}
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

      const invalidFolder =
          payload.data.folders.find(folder => {
              return !isValidFolderName(folder);
          });

      if (invalidFolder !== undefined) {
          throw new Error(
              '备份中的词库名称包含不支持的字符或长度超过 80 个字符'
          );
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
      // Persist the cleared state through the same fallback path so an older
      // restore point cannot reappear when IndexedDB becomes available again.
      await Model.writeStorageValue(PRE_IMPORT_RESTORE_KEY, null);

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

      await Model.ensureAllBuiltInLanguages();

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

      Model.fsrsCards = data.fsrsCards && typeof data.fsrsCards === 'object' && !Array.isArray(data.fsrsCards)
          ? JSON.parse(JSON.stringify(data.fsrsCards))
          : {};
      Model.fsrsReviewLogs = Array.isArray(data.fsrsReviewLogs)
          ? JSON.parse(JSON.stringify(data.fsrsReviewLogs)).slice(-500)
          : [];

      this.applyBackupPreferences(
          payload.preferences
      );

      await Model.runDataMigrations();
      await Model.saveAllUserData();
  },

  async exportBackup() {
      await Model.ensureAllBuiltInLanguages();
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

    getStudyGroup() {
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

    const groupLabel = groupRange.hasWords
        ? `${categoryLabel}（第 ${groupRange.labelStart}–${groupRange.labelEnd} 词）`
        : categoryLabel;

    return { currentLang, groupKey, groupLabel, sourceWords };
    },

    beginStudySession({ mode, label = '', totalWords = 0, groupKey = '' } = {}) {
        Model.state.sessionMetrics = {
            mode,
            label,
            groupKey,
            startedAt: Date.now(),
            totalWords,
            attempts: 0,
            correctCount: 0,
            weakWordIndices: new Set()
        };
    },

    trackSessionOutcome(wordOrIdx, isCorrect) {
        const m = Model.state.sessionMetrics;
        if (!m) return;
        m.attempts++;
        if (isCorrect) {
            m.correctCount++;
        } else {
            const idx = typeof wordOrIdx === 'number'
                ? wordOrIdx
                : Model.db.indexOf(wordOrIdx);
            if (idx >= 0) m.weakWordIndices.add(idx);
        }
    },

    getNextGroupInfo(groupKey, launchMode = 'pendulum') {
        if (!groupKey || typeof groupKey !== 'string') return null;
        const [prefix, catName, indexText] = groupKey.split('|');
        const groupIndex = Number.parseInt(indexText, 10);
        if (prefix !== 'group' || !catName || !Number.isInteger(groupIndex) || groupIndex < 0) return null;

        const currentLang = Model.state.currentLangMode;
        const groupWords = Model.db
            .map((w, i) => ({ w, i }))
            .filter(item => (item.w.lang || 'ja') === currentLang && Model.checkFilter(item.w, catName));
        const nextIndex = groupIndex + 1;
        const nextRange = ROTE_CORE.getGroupRange(nextIndex, groupWords.length);
        if (!nextRange.hasWords) return null;

        const virtualLabels = {
            virtual_cleared: '完全通关',
            virtual_uncleared: '所有未通关',
            virtual_miss_kanji: currentLang === 'en' ? '未掌握拼写' : '未了解汉字',
            virtual_miss_kana: currentLang === 'en' ? '未掌握听力' : '未了解读音',
            virtual_miss_meaning: '未了解释义',
            virtual_starred: '收藏'
        };
        const categoryLabel = catName === 'default' ? '默认词库' : (virtualLabels[catName] || catName);
        return {
            groupKey: `group|${catName}|${nextIndex}`,
            groupLabel: `${categoryLabel}（第 ${nextRange.labelStart}–${nextRange.labelEnd} 词）`,
            launchMode
        };
    },

    startWeakWordsPractice(indices) {
        const valid = [...new Set(indices)].filter(i => Number.isInteger(i) && Model.db[i]);
        if (!valid.length) {
            showToast('本轮没有需要强化的薄弱词');
            return;
        }
        Model.state.studySessionId = (Model.state.studySessionId || 0) + 1;
        Model.state.isAnimating = false;
        Model.state.mode = 'dual-track';
        Model.state.isWrongBookPractice = true;
        Model.state.currentIndex = 0;
        Model.state.dtWordAppearanceMap = {};
        Model.state.currentWordFailed = false;
        Model.state.comboCount = 0;
        Model.state.maxProgressSeen = 0;
        Model.state.uniqueWordCount = valid.length;
        Model.state.studyQueue = [];
        valid.forEach(idx => {
            Model.state.dtWordAppearanceMap[idx] = 2;
            Model.state.studyQueue.push(idx, idx);
        });
        Model.state.studyQueue.sort(() => Math.random() - 0.5);
        Model.state.initialQueueLength = Model.state.studyQueue.length;
        this.beginStudySession({
            mode: 'dual-track',
            label: '本轮薄弱词专项',
            totalWords: valid.length,
            groupKey: ''
        });
        View.updateComboBadge();
        View.showPage('study-area');
        const matrix = View.getEl('pixel-matrix');
        if (matrix) matrix.innerHTML = '';
        View.renderStudyCard('none');
        Hardware.vibrate(40);
    },

    showStudySummary({ mode = '', title = '本轮学习完成', subtitle = '', totalWords = 0, groupKey = '', allowNextGroup = false } = {}) {
        const overlay = View.getEl('study-summary-overlay');
        if (!overlay) return;
        const m = Model.state.sessionMetrics || { startedAt: Date.now(), attempts: 0, correctCount: 0, weakWordIndices: new Set() };
        const elapsedSec = Math.max(1, Math.round((Date.now() - (m.startedAt || Date.now())) / 1000));
        const durationText = elapsedSec >= 60
            ? `${Math.floor(elapsedSec / 60)}分${String(elapsedSec % 60).padStart(2, '0')}秒`
            : `${elapsedSec} 秒`;
        const count = totalWords || m.totalWords || 0;
        const accuracyText = m.attempts > 0
            ? `${Math.round((m.correctCount / m.attempts) * 100)}%`
            : '已通关';
        const accuracyLabel = m.attempts > 0 ? '本轮正确率' : '本轮状态';
        const weakIndices = [...(m.weakWordIndices || [])].filter(i => Model.db[i]);

        const titleEl = View.getEl('study-summary-title');
        const subtitleEl = View.getEl('study-summary-subtitle');
        const metricsEl = View.getEl('study-summary-metrics');
        const weakWrap = View.getEl('study-summary-weak-wrap');
        const weakList = View.getEl('study-summary-weak-list');
        const weakBtn = View.getEl('btn-summary-practice-weak');
        const nextBtn = View.getEl('btn-summary-next-group');

        if (titleEl) titleEl.textContent = title;
        if (subtitleEl) subtitleEl.textContent = subtitle || m.label || '已记录今日学习进度';
        if (metricsEl) {
            metricsEl.innerHTML = `
                <div class="study-summary-metric">
                    <span class="study-summary-metric-val">${count}</span>
                    <span class="study-summary-metric-label">本轮词汇</span>
                </div>
                <div class="study-summary-metric">
                    <span class="study-summary-metric-val">${accuracyText}</span>
                    <span class="study-summary-metric-label">${accuracyLabel}</span>
                </div>
                <div class="study-summary-metric">
                    <span class="study-summary-metric-val">${durationText}</span>
                    <span class="study-summary-metric-label">学习用时</span>
                </div>
            `;
        }

        if (weakWrap && weakList) {
            if (weakIndices.length > 0) {
                weakWrap.hidden = false;
                weakList.innerHTML = weakIndices.slice(0, 12).map(idx => {
                    const w = Model.db[idx];
                    const sub = w.lang === 'en' ? (w.phonetic || '') : (w.kana || '');
                    return `<button type="button" class="study-summary-weak-chip" data-summary-word-idx="${idx}" title="点击听发音"><strong>${escapeHTML(w.word || '')}</strong>${sub ? `<span>${escapeHTML(sub)}</span>` : ''}</button>`;
                }).join('');
            } else {
                weakWrap.hidden = true;
                weakList.innerHTML = '';
            }
        }

        const nextGroup = allowNextGroup ? this.getNextGroupInfo(groupKey || m.groupKey, mode || m.mode) : null;
        this._lastSummaryAction = { weakIndices, nextGroup };

        if (weakBtn) {
            weakBtn.hidden = weakIndices.length === 0;
            const span = weakBtn.querySelector('span:last-child');
            if (span) span.textContent = `只练薄弱词（${weakIndices.length}）`;
        }
        if (nextBtn) {
            nextBtn.hidden = !nextGroup;
            nextBtn.classList.toggle('ui-primary-action', weakIndices.length === 0);
            nextBtn.classList.toggle('btn-outline', weakIndices.length > 0);
        }

        window.toggleModal('study-summary-overlay', true);
    },

    startPendulum(launchMode = 'pendulum') {
    const { currentLang, groupKey, groupLabel, sourceWords } = this.getStudyGroup();
    if (!sourceWords.length) {
        return showToast('所选范围内暂无词汇哦');
    }

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
    this.beginStudySession({ mode: launchMode, label: groupLabel, totalWords: sourceWords.length, groupKey });
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
    Model.state.studySessionId = (Model.state.studySessionId || 0) + 1;
    Model.state.isAnimating = false;
    Model.state.isWrongBookPractice = false;
    Model.state.initialQueueLength = (launchMode === 'memory-test') ? Model.state.mtBaseQueue.length : Model.state.studyQueue.length;
    View.updateComboBadge();
    const modeSelect = View.getEl('next-display-mode');
    const isRoteLaunch = launchMode === 'rote-learning';
    let savedMode = isRoteLaunch
        ? (localStorage.getItem('roteDisplayMode') || localStorage.getItem('displayMode') || 'word')
        : (localStorage.getItem('displayMode') || 'all');

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
            localStorage.setItem('roteDisplayMode', savedMode);
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
    View.showPage('study-area'); let c = View.getEl('pixel-matrix'); c.innerHTML=''; View.renderStudyCard('none'); Hardware.haptic('confirm');
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

  getFilterTestWords() {
      const cat = View.getEl('test-range-select')?.value;
      if (!cat) return [];
      let displayMode = View.getEl('test-display-select').value || 'kana';
      let isSkipEnabled = localStorage.getItem('skipMastered') === 'true';

      return Model.db
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
      
  },

  startFilterTest() {
      const sourceWords = this.getFilterTestWords();
      if (sourceWords.length === 0) {
          return showConfirm('此维度已圆满', '当前范围内该模式对应的「维度杠」已全部点亮。是否前往设置关闭「智能跳过」？', () => {
              Nav.switchTab('tab-settings', 'settings|应用设置', document.querySelector('[data-target="tab-settings"]'));
          });
      }
      Hardware.playSound('click'); 
      Model.state.studySessionId = (Model.state.studySessionId || 0) + 1; Model.state.isAnimating = false; Model.state.isWrongBookPractice = false; Model.state.mode = 'filter-test'; Model.state.currentIndex = 0; Model.state.ftState = 'A'; Model.state.ftHint = null; Model.state.ftShowKanaHint = false; Model.state.maxProgressSeen = 0;
      
      const rawQueue =
          sourceWords.map(x => x.i);

      Model.state.studyQueue =
          this.buildFilterTestQueue(rawQueue);
      this.beginStudySession({
          mode: 'filter-test',
          label: '靶向检验',
          totalWords: Model.state.studyQueue.length,
          groupKey: ''
      });
      
      View.updateComboBadge(); View.showPage('study-area'); let c = View.getEl('pixel-matrix'); c.innerHTML=''; View.renderStudyCard('none'); Hardware.haptic('confirm');
  },

    startFsrsReview() {
        const items = Model.getDueFsrsCards(new Date(), Model.getCurrentLang());
        if (!items.length) {
            showToast('今天没有到期复习，继续保持节奏');
            return;
        }
        Model.state.studySessionId = (Model.state.studySessionId || 0) + 1;
        Model.state.isAnimating = false;
        Model.state.isWrongBookPractice = false;
        Model.state.mode = 'fsrs-review';
        Model.state.studyQueue = items.map(item => Model.db.indexOf(item.word));
        Model.state.fsrsReviewItems = items;
        Model.state.fsrsAnswerRevealed = false;
        Model.state.currentIndex = 0;
        Model.state.initialQueueLength = items.length;
        this.beginStudySession({
            mode: 'fsrs-review',
            label: '到期间隔复习',
            totalWords: items.length,
            groupKey: ''
        });
        View.getEl('capsule-pendulum')?.classList.add('hidden');
        View.getEl('capsule-filter-test')?.classList.add('hidden');
        View.getEl('capsule-filter-judge')?.classList.add('hidden');
        View.getEl('capsule-fsrs-review')?.classList.remove('hidden');
        View.getEl('keyboard-hint-bar')?.classList.remove('hidden');
        const fsrsMatrix = View.getEl('pixel-matrix');
        if (fsrsMatrix) fsrsMatrix.innerHTML = '';
        View.showPage('study-area');
        View.renderStudyCard('none');
        this.renderFsrsReviewControls();
        Hardware.haptic('confirm');
    },

    renderFsrsReviewControls() {
        const item = Model.state.fsrsReviewItems?.[Model.state.currentIndex];
        const container = View.getEl('fsrs-rating-buttons');
        if (!item || !container) return;
        const card = Model.fsrsCards[item.key] || null;
        const preview = ZhongriFsrsScheduler.preview(card, new Date());
        const options = [
            ['again', '再来', '完全想不起，或回答错误'],
            ['hard', '困难', '想起来了，但很费劲、不稳定'],
            ['good', '认识', '正确想起，难度适中'],
            ['easy', '太简单', '一看到就想起，几乎没有难度']
        ];
        const labels = { kanji: '拼写', spelling: '拼写', reading: '读音', listening: '听力', meaning: '释义' };
        View.getEl('fsrs-review-dimension').innerText = `复习${labels[item.dimension] || item.dimension}`;
        View.getEl('fsrs-review-progress').innerText = `${Model.state.currentIndex + 1} / ${Model.state.fsrsReviewItems.length}`;
        const isRevealed = Model.state.fsrsAnswerRevealed === true;
        const revealButton = View.getEl('fsrs-reveal-answer');
        const tip = View.getEl('fsrs-review-tip');
        revealButton?.classList.toggle('hidden', isRevealed);
        container.classList.toggle('hidden', !isRevealed);
        container.setAttribute('aria-hidden', String(!isRevealed));
        if (tip) {
            tip.innerText = isRevealed
                ? '按实际回忆难度评分，系统会安排下次复习。'
                : '先在心里作答，再揭晓答案。';
        }
        container.innerHTML = options.map(([rating, title, optionTip], index) => `<button type="button" class="fsrs-rating-btn" data-rating="${rating}"><strong>${title}</strong><small>${optionTip}</small><em>${preview[rating].label} · ${index + 1}</em></button>`).join('');
        container.onclick = event => {
            const button = event.target.closest('.fsrs-rating-btn');
            if (button) this.applyFsrsRating(button.dataset.rating);
        };
    },

    revealFsrsAnswer() {
        if (
            Model.state.mode !== 'fsrs-review' ||
            Model.state.fsrsAnswerRevealed
        ) {
            return;
        }
        Model.state.fsrsAnswerRevealed = true;
        Hardware.playSound('click', { haptic: 'cardFlip' });
        View.renderStudyCard('none');
        this.renderFsrsReviewControls();
        View.getEl('fsrs-rating-buttons')
            ?.querySelector('.fsrs-rating-btn')
            ?.focus({ preventScroll: true });
    },

    applyFsrsRating(rating) {
        if (
            Model.state.mode !== 'fsrs-review' ||
            Model.state.isAnimating ||
            !Model.state.fsrsAnswerRevealed
        ) return;
        const item = Model.state.fsrsReviewItems?.[Model.state.currentIndex];
        if (!item) return;
        Model.state.isAnimating = true;
        const sessionId = Model.state.studySessionId || 0;
        Model.recordFsrsReview({ word: item.word, dimension: item.dimension, rating, source: 'fsrs-review' });
        this.trackSessionOutcome(item.word, rating !== 'again');
        const fsrsHapticMap = { again: 'error', hard: 'hint', good: 'correct', easy: 'easy' };
        Hardware.playSound(rating === 'again' ? 'error' : 'success', {
            haptic: fsrsHapticMap[rating] || 'correct'
        });
        window.setTimeout(() => {
            if ((Model.state.studySessionId || 0) !== sessionId || Model.state.mode !== 'fsrs-review') return;
            Model.state.isAnimating = false;
            Model.state.currentIndex++;
            if (Model.state.currentIndex >= Model.state.fsrsReviewItems.length) {
                const reviewedCount = Model.state.fsrsReviewItems.length;
                Hardware.playSound('success', { haptic: 'celebration' });
                View.getEl('btn-exit-study')?.click();
                this.showStudySummary({
                    mode: 'fsrs-review',
                    title: '今日复习完成',
                    subtitle: 'FSRS 记忆曲线已按本次回忆质量更新',
                    totalWords: reviewedCount
                });
            } else {
                Model.state.fsrsAnswerRevealed = false;
                View.renderStudyCard('next');
                this.renderFsrsReviewControls();
            }
        }, 220);
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

      const sessionId = Model.state.studySessionId || 0;
      window.setTimeout(() => {
          if ((Model.state.studySessionId || 0) !== sessionId || Model.state.mode !== 'filter-test') return;
          Model.state.currentIndex++;
          Model.state.ftState = 'A';
          Model.state.ftHint = null;
          Model.state.ftShowKanaHint = false;

          if (Model.state.currentIndex >= Model.state.studyQueue.length) {
              const testedCount = Model.state.studyQueue.length;
              Model.state.isAnimating = false;
              Hardware.playSound('success', { haptic: 'celebration' });
              View.getEl('btn-exit-study').click();
              this.showStudySummary({
                  mode: 'filter-test',
                  title: '靶向检验完成',
                  subtitle: '已同步更新三维掌握度与复习计划',
                  totalWords: testedCount
              });
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

      let isSpellMatch = false;
      if (isEnglish) {
          targetClean = (wObj.word || '').toLowerCase().trim();
          inputClean = (EnglishInput.buffer || '').toLowerCase().trim();
          if (!inputClean) return;
          isSpellMatch = inputClean === targetClean;
      } else {
          const rawTarget = String(wObj.kana || wObj.word || '').replace(/[【】\[\]()（）\s]/g, '');
          inputClean = RomajiEngine.getFinalText().trim();
          if (!inputClean) return;
          const normInput = RomajiEngine.toHiragana(inputClean);
          const candidates = rawTarget
              .split(/[\/／・,，;；]/)
              .map(part => RomajiEngine.toHiragana(part.replace(/[\u4E00-\u9FFF々〆ヶ]/g, '')))
              .filter(Boolean);
          isSpellMatch = candidates.length > 0
              ? candidates.includes(normInput)
              : normInput === RomajiEngine.toHiragana(rawTarget);
      }

      const sessionId = Model.state.studySessionId || 0;

      if (isSpellMatch) {
          Model.state.isAnimating = true;
          Model.state.comboCount++;
          const isComboMilestone = Model.state.comboCount >= 3 && (Model.state.comboCount % 3 === 0 || Model.state.comboCount % 5 === 0);
          Hardware.playSound('success', { haptic: isComboMilestone ? 'combo' : 'correct' });
          View.playStudyFeedback('correct');
          View.updateComboBadge();

          if (isRote) {
              View.showRoteFullCard(wObj);
              if (isEnglish) EnglishInput.reset();
              else RomajiEngine.reset();

              setTimeout(() => {
                  if ((Model.state.studySessionId || 0) !== sessionId || Model.state.mode !== 'rote-learning') return;
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
              setTimeout(() => {
                  if ((Model.state.studySessionId || 0) !== sessionId) return;
                  this.dtAdvanceNext();
              }, 420);
          } else if (Model.state.mode === 'memory-test') {
              if (!isEnglish) {
                  View.getEl('w-kana').innerText = wObj.kana;
                  View.getEl('w-kana').style.display = 'block';
              }
              setTimeout(() => {
                  if ((Model.state.studySessionId || 0) !== sessionId) return;
                  this.mtAdvanceNext();
              }, 600);
          } else {
              if (
                  !isEnglish &&
                  (displayMode === 'word' || displayMode === 'meaning')
              ) {
                  View.getEl('w-kana').innerText = wObj.kana;
              }

              setTimeout(() => {
                  if ((Model.state.studySessionId || 0) !== sessionId) return;
                  Model.state.mtStep = 2;
                  Model.state.isAnimating = false;
                  View.renderMemoryTestUI(wObj, displayMode);
              }, 500);
          }

          if (isEnglish) EnglishInput.reset();
          return;
      }

      Hardware.playSound('error', { haptic: 'error' });
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
          Model.state.comboCount++;
          const isComboMilestone = Model.state.comboCount >= 3 && (Model.state.comboCount % 3 === 0 || Model.state.comboCount % 5 === 0);
          Hardware.playSound('success', { haptic: isComboMilestone ? 'combo' : 'correct' });
          View.playStudyFeedback('correct');
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
    }, 150); 
});
          const sessionId = Model.state.studySessionId || 0;
          document.querySelectorAll('.dt-choice-btn').forEach(b => b.style.pointerEvents = 'none');
          setTimeout(() => {
              if ((Model.state.studySessionId || 0) !== sessionId) return;
              this.dtAdvanceNext();
          }, 600);
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
      Model.state.comboCount++;
      const isComboMilestone = Model.state.comboCount >= 3 && (Model.state.comboCount % 3 === 0 || Model.state.comboCount % 5 === 0);
      Hardware.playSound('success', { haptic: isComboMilestone ? 'combo' : 'correct' });
      View.playStudyFeedback('correct');
      View.updateComboBadge();

      const disableChoiceButtons = () => {
          document
              .querySelectorAll('#mt-choice-buttons .dt-choice-btn')
              .forEach(button => {
                  button.style.pointerEvents = 'none';
              });
      };

      const sessionId = Model.state.studySessionId || 0;

      if (Model.state.mode === 'memory-test') {
          let round = Model.state.mtRound;
          let step = Model.state.mtStep;
          const isEnglishMt = wObj?.lang === 'en';

          if (round === 1) {
              View.getEl('w-meaning').innerText = wObj.meaning;
              View.getEl('w-meaning').style.display = 'block';
              View.syncRootsDisplay();
              View.revealStudyElement(View.getEl('w-meaning'));
              disableChoiceButtons();
              setTimeout(() => {
                  if ((Model.state.studySessionId || 0) !== sessionId) return;
                  this.mtAdvanceNext();
              }, 800);
          } else if (round === 2 && step === 1) {
              View.getEl('w-word').innerText = wObj.word;
              View.getEl('w-word').style.display = 'block';
              View.syncRootsDisplay();
              View.revealStudyElement(View.getEl('w-word'));

              setTimeout(() => {
                  if ((Model.state.studySessionId || 0) !== sessionId) return;
                  Model.state.mtStep = 2;
                  Model.state.isAnimating = false;
                  View.renderMemoryTestUI(wObj, displayMode);
              }, 600);
          } else if (round === 3 && step === 1) {
              View.getEl('w-meaning').innerText = wObj.meaning;
              View.getEl('w-meaning').style.display = 'block';
              View.syncRootsDisplay();
              View.revealStudyElement(View.getEl('w-meaning'));
              disableChoiceButtons();

              if (isEnglishMt) {
                  setTimeout(() => {
                      if ((Model.state.studySessionId || 0) !== sessionId) return;
                      this.mtAdvanceNext();
                  }, 700);
              } else {
                  setTimeout(() => {
                      if ((Model.state.studySessionId || 0) !== sessionId) return;
                      Model.state.mtStep = 2;
                      Model.state.isAnimating = false;
                      View.renderMemoryTestUI(wObj, displayMode);
                  }, 600);
              }
          } else if (round === 3 && step === 2) {
              View.getEl('w-word').innerText = wObj.word;
              View.getEl('w-word').style.display = 'block';
              View.syncRootsDisplay();
              View.revealStudyElement(View.getEl('w-word'));
              disableChoiceButtons();
              setTimeout(() => {
                  if ((Model.state.studySessionId || 0) !== sessionId) return;
                  this.mtAdvanceNext();
              }, 800);
          }
          return;
      }

      if (Model.state.mode === 'rote-learning') {
          disableChoiceButtons();
          View.showRoteFullCard(wObj);

          if (Model.state.mtStep === 1) {
              setTimeout(() => {
                  if ((Model.state.studySessionId || 0) !== sessionId) return;
                  Model.state.mtStep = 2;
                  Model.state.isAnimating = false;
                  View.renderRoteLearningUI(wObj, displayMode);
              }, 650);
          } else {
              setTimeout(() => {
                  if ((Model.state.studySessionId || 0) !== sessionId) return;
                  this.mtAdvanceNext();
              }, 850);
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
                  Hardware.playSound('success', { haptic: 'success' });
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
    Hardware.playSound('success', { haptic: 'celebration' });
    const finishedMode = Model.state.mode;
    const groupKey = Model.state.currentGroupKey;
    const groupLabel = Model.state.currentGroupLabel;

    if (Model.state.isWrongBookPractice) {
        const practicedCount = Model.state.uniqueWordCount || [...new Set(Model.state.studyQueue)].length;
        Model.state.isWrongBookPractice = false;
        View.getEl('btn-exit-study')?.click();
        this.showStudySummary({
            mode: finishedMode,
            title: '薄弱词强化完成',
            subtitle: '连续答对会逐步移出错题本',
            totalWords: practicedCount,
            allowNextGroup: false
        });
        return;
    }

    let t = new Date().toLocaleDateString('zh-CN');
    Model.mtGroupClears[groupKey] = (Model.mtGroupClears[groupKey] || 0) + 1;

    let uniqueIndices = finishedMode === 'memory-test' ? Model.state.mtBaseQueue : [...new Set(Model.state.studyQueue)];
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

    let exist = Model.records.findIndex(x => x.date === t && x.group === groupLabel && x.type === 'pendulum');
    if(exist === -1) { Model.records.unshift({date: t, group: groupLabel, type: 'pendulum'}); Model.saveRecords(); }
    View.getEl('btn-exit-study').click();
    this.showStudySummary({
        mode: finishedMode,
        title: '本组词汇已通关',
        subtitle: groupLabel || '已记录今日通关印章',
        totalWords: uniqueIndices.length,
        groupKey,
        allowNextGroup: true
    });
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
      const folderName = normalizeFolderName(name);
      if (!isValidFolderName(folderName)) {
          return showToast('文件夹名称不能包含 <、>、| 或控制字符，且最多 80 个字符');
      }
      if(Model.folders.includes(folderName)) return showToast("文件夹已存在");
      const lang = Model.state.currentLangMode; // 强绑定为当前所处语言
      Model.folders.push(folderName);
      Model.folderLangs[folderName] = lang;
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
          `确定要删除「${escapeHTML(filter)}」吗？里面的 ${folderWords.length} 个单词会自动移至同语言的默认词库「${escapeHTML(mainFallbackFolder)}」。`,
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
          },
          { confirmLabel: '删除文件夹', danger: true }
      );
  },
    openMoveModal(idx) { 
      if (idx === -2 && Model.state.selectedSet.size === 0) return showToast("未选词"); 
      Model.state.moveTargetIdx = idx; 
      
      const container = View.getEl('move-folder-list');
      container.innerHTML = '';

      const sourceIndexes = idx === -2
          ? Array.from(Model.state.selectedSet)
          : [idx];
      const sourceLanguages = new Set(
          sourceIndexes
              .map(sourceIdx => Model.db[sourceIdx]?.lang || 'ja')
              .filter(Boolean)
      );

      if (sourceLanguages.size !== 1) {
          showToast('不能同时移动不同语言的词条');
          return;
      }

      const [sourceLanguage] = sourceLanguages;
      const targetFolders = Model.folders.filter(folderName => {
          return Model.getFolderLang(folderName) === sourceLanguage;
      });

      targetFolders.forEach(folderName => {
          const item = document.createElement('button');
          item.type = 'button';
          item.className = 'move-folder-item';

              const icon = document.createElement('span');
              icon.className =
                  'material-symbols-rounded folder-icon';
              icon.textContent = 'folder';

              const folderNameElement =
                  document.createElement('span');
              folderNameElement.className = 'folder-name';
              folderNameElement.textContent = folderName;

              item.append(icon, folderNameElement);
          
          item.onclick = () => {
              Hardware.playSound('success');
              Hardware.vibrate(40);
              this.executeMove(folderName);
          };
          container.appendChild(item);
      });

      if (targetFolders.length === 0) {
          const empty = document.createElement('p');
          empty.className = 'move-folder-empty';
          empty.textContent = '当前词书还没有可用文件夹';
          container.appendChild(empty);
      }
      
      window.toggleModal('move-overlay', true); 
  },

  executeMove(destFolder) {
      const sourceIndexes = Model.state.moveTargetIdx === -2
          ? Array.from(Model.state.selectedSet)
          : [Model.state.moveTargetIdx];
      const destinationLanguage = Model.getFolderLang(destFolder);
      const isValidDestination =
          Model.folders.includes(destFolder) &&
          sourceIndexes.every(idx => {
              const word = Model.db[idx];
              return word && (word.lang || 'ja') === destinationLanguage;
          });

      if (!isValidDestination) {
          showToast('目标文件夹与词条语言不一致');
          return;
      }

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
  openNewWordModal() {
    window.ZhongriPopovers?.closeAll();
    const lang = Model.state.currentLangMode === 'en' ? 'en' : 'ja';
    const isEnglish = lang === 'en';
    const currentFilter = View.getEl('wb-folder-filter')?.value || 'all';
    const defaultFolder =
        Model.folders.find(f => (Model.folderLangs[f] || 'ja') === lang) || '默认词库';
    const targetFolder =
        currentFilter !== 'all' &&
        !String(currentFilter).startsWith('virtual_') &&
        Model.folders.includes(currentFilter)
            ? currentFilter
            : defaultFolder;

    Model.editingIdx = -1;
    Controller.pendingWordDraft = { lang, folder: targetFolder };

    const titleEl = View.getEl('edit-dialog-title');
    const saveBtn = View.getEl('btn-save-edit');
    if (titleEl) {
        titleEl.innerHTML =
            '<span class="material-symbols-rounded">edit_square</span> 新建词条';
    }
    if (saveBtn) {
        saveBtn.textContent = '加入词库';
    }

    View.getEl('edit-word').value = '';
    View.getEl('edit-kana').value = '';
    View.getEl('edit-type').value = isEnglish ? 'n.' : '名';
    View.getEl('edit-meaning').value = '';
    View.getEl('edit-example').value = '';

    const levelSelect = View.getEl('edit-level');
    if (levelSelect) {
        this.populateWordLevelSelect(levelSelect, lang, '');
    }
    const difficultySelect = View.getEl('edit-difficulty');
    if (difficultySelect) {
        difficultySelect.value = '0';
        difficultySelect.dispatchEvent(new Event('facade-update'));
    }
    const tagsInput = View.getEl('edit-tags');
    if (tagsInput) tagsInput.value = '';
    const rootsInput = View.getEl('edit-roots');
    if (rootsInput) rootsInput.value = '';

    const readingLabel = View.getEl('edit-reading-label');
    if (readingLabel) {
        readingLabel.textContent = isEnglish ? '音标' : '假名';
    }
    const rootsGroup = View.getEl('edit-roots-group');
    if (rootsGroup) {
        rootsGroup.style.display = isEnglish ? 'block' : 'none';
    }

    Hardware.playSound('click');
    Hardware.vibrate(15);
    window.toggleModal('edit-overlay', true);
    setTimeout(() => {
        View.getEl('edit-word')?.focus({ preventScroll: true });
    }, 80);
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
          if (formatNote) formatNote.textContent = '前四项必填；级别、难度和标签使用下方导入选项设置，例句含逗号时建议使用 Tab 分隔。';
          if (textarea) textarea.placeholder = 'abandon,/əˈbændən/,动词,放弃,They abandoned the plan.,a(去)-bandon(控制)';
      } else {
          if (formatText) formatText.textContent = '单词,假名,词性,释义,例句';
          if (formatNote) formatNote.textContent = '前四项必填；级别、难度和标签使用下方导入选项设置，例句含逗号时建议使用 Tab 分隔。';
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

  updateImportTargetSummary() {
      const summary = View.getEl('import-target-summary');
      if (!summary) return;
      const language = View.getEl('import-lang-select')?.selectedOptions[0]?.text;
      const folder = View.getEl('import-folder-select')?.selectedOptions[0]?.text;
      summary.textContent = [language, folder].filter(Boolean).join(' · ');
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
      this.updateImportTargetSummary();
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

      const overwrite = duplicateMode === 'overwrite';
      const newCount = overwrite
          ? new Set(entries.map(entry => entry.identity).filter(id => !existingSet.has(id))).size
          : actionableEntries.length;
      const updateCount = overwrite ? actionableEntries.length - newCount : 0;
      const importLabel = updateCount
          ? `导入 ${newCount} 词，覆盖 ${updateCount} 项`
          : `导入 ${newCount} 词`;

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
      }, { confirmLabel: importLabel });
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
          Model.fsrsCards = {};
          Model.fsrsReviewLogs = [];
          Model.wrongBook = {};
          await Promise.all([
              Model.saveRecords(),
              Model.saveClears(),
              Model.saveFsrs(),
              typeof Model.saveWrongBook === 'function' ? Model.saveWrongBook() : Promise.resolve()
          ]);
      }, '学习进度已清空');
  },

  restoreBuiltInLibrary() {
      return this.runSafeDataOperation('pre-remove-imported', async () => {
          await Model.ensureAllBuiltInLanguages();
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
          if (Model.wrongBook && typeof Model.wrongBook === 'object') {
              Model.wrongBook = Object.fromEntries(
                  Object.entries(Model.wrongBook).filter(([wordId]) => wordIds.has(wordId))
              );
          }
          if (Model.fsrsCards && typeof Model.fsrsCards === 'object') {
              Model.fsrsCards = Object.fromEntries(
                  Object.entries(Model.fsrsCards).filter(([key]) => {
                      const parts = String(key).split(':');
                      return parts.length >= 2 && wordIds.has(parts[1]);
                  })
              );
          }
          if (Array.isArray(Model.recycleBin)) {
              Model.recycleBin = Model.recycleBin.filter(item => item?.payload?.word?.builtIn === true);
          }

          await Model.saveAllUserData();
      }, '已恢复内置词库');
  },

  fullResetApp() {
      return this.runSafeDataOperation('pre-full-reset', async () => {
          await Model.ensureAllBuiltInLanguages();
          const defaults = this.getDefaultLibraryState();

          Model.db = defaults.db;
          Model.folders = defaults.folders;
          Model.folderLangs = defaults.folderLangs;
          Model.stars = [];
          Model.records = [];
          Model.mtGroupClears = {};
          Model.mtWordClears = {};
          Model.fsrsCards = {};
          Model.fsrsReviewLogs = [];
          Model.wrongBook = {};
          Model.recycleBin = [];

          new Set([
              ...BACKUP_PREFERENCE_KEYS,
              'wordOrderMode',
              'roteDisplayMode',
              'wrongBookEnabled',
              'wordbank_level_ja',
              'wordbank_level_en',
              'wordbank_difficulty_ja',
              'wordbank_difficulty_en',
              'nativeStudyReminderSettingsV2',
              'nativeStudyReminderEnabled',
              'nativeStudyReminderTime'
          ]).forEach(key => {
              localStorage.removeItem(key);
          });

          Object.keys(localStorage)
              .filter(key => key.startsWith('zhongri-root-review-v1:'))
              .forEach(key => localStorage.removeItem(key));

          await Model.saveAllUserData();
      }, '应用已恢复初始状态', true);
  },
  
  openDetailModal(idx) { 
      Model.state.detailArray = Model.state.filteredDb.map(item => item.idx);
      Model.state.activeDetailIdx = Model.state.detailArray.indexOf(idx); 
      
      if (Model.state.activeDetailIdx === -1) {
          Model.state.detailArray = [idx];
          Model.state.activeDetailIdx = 0;
      }

      window.toggleModal('detail-overlay', true); 
      this.renderDetailCard('none', true); 
  },

  bindDetailCardSwipe() {
      const card = View.getEl('detail-card-container');
      const wrapper = View.getEl('dt-anim-wrapper');
      if (!card || !wrapper || card.dataset.swipeBound === 'true') return;
      card.dataset.swipeBound = 'true';

      let pointerId = null;
      let startX = 0;
      let startY = 0;
      let lastX = 0;
      let lastTime = 0;
      let velocityX = 0;
      let locked = null; // 'h' | 'v' | null

      const resetWrapper = (animate = true) => {
          if (animate && !isMotionReduced()) {
              wrapper.style.transition = 'transform 0.22s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.22s cubic-bezier(0.23, 1, 0.32, 1)';
          } else {
              wrapper.style.transition = 'none';
          }
          wrapper.style.transform = '';
          wrapper.style.opacity = '';
          if (animate) {
              setTimeout(() => { wrapper.style.transition = ''; }, 240);
          }
      };

      card.addEventListener('pointerdown', (e) => {
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          if (Model.state.detailArray.length <= 1) return;
          if (e.target.closest('button, input, textarea, select, a, .ex-item, .dt-wrong-summary')) return;
          pointerId = e.pointerId;
          startX = lastX = e.clientX;
          startY = e.clientY;
          lastTime = performance.now();
          velocityX = 0;
          locked = null;
      });

      card.addEventListener('pointermove', (e) => {
          if (pointerId === null || e.pointerId !== pointerId) return;
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;

          if (!locked) {
              if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.35) {
                  locked = 'h';
                  try { card.setPointerCapture(pointerId); } catch (_) {}
                  wrapper.style.transition = 'none';
              } else if (Math.abs(dy) > 12 && Math.abs(dy) >= Math.abs(dx)) {
                  locked = 'v';
                  pointerId = null;
                  return;
              } else {
                  return;
              }
          }

          if (locked === 'h') {
              const now = performance.now();
              const dt = Math.max(1, now - lastTime);
              velocityX = (e.clientX - lastX) / dt;
              lastX = e.clientX;
              lastTime = now;
              const clamped = Math.max(-140, Math.min(140, dx));
              wrapper.style.transform = `translate3d(${clamped}px, 0, 0)`;
              wrapper.style.opacity = String(Math.max(0.66, 1 - Math.abs(clamped) / 360));
          }
      });

      const finishSwipe = (e) => {
          if (pointerId === null || e.pointerId !== pointerId) return;
          const dx = e.clientX - startX;
          const wasHorizontal = locked === 'h';
          pointerId = null;
          locked = null;
          if (!wasHorizontal) return;

          const shouldNavigate =
              Math.abs(dx) > 56 ||
              (Math.abs(velocityX) > 0.35 && Math.abs(dx) > 20);

          if (shouldNavigate) {
              wrapper.style.transition = '';
              wrapper.style.transform = '';
              wrapper.style.opacity = '';
              this.navDetail(dx < 0 ? 1 : -1);
          } else {
              resetWrapper(true);
          }
      };

      card.addEventListener('pointerup', finishSwipe);
      card.addEventListener('pointercancel', (e) => {
          if (pointerId === null || e.pointerId !== pointerId) return;
          pointerId = null;
          const wasH = locked === 'h';
          locked = null;
          if (wasH) resetWrapper(true);
      });
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
      
      Hardware.playSound('click', { haptic: 'cardFlip' });
      this.renderDetailCard(dir > 0 ? 'next' : 'prev', true); 
  },
  
  renderDetailCard(anim, triggerTTS = false) { 
      let realIdx = Model.state.detailArray[Model.state.activeDetailIdx]; 
      let w = Model.db[realIdx]; 
      if (!w) {
          window.toggleModal('detail-overlay', false);
          return;
      }
      const wrapper = View.getEl('dt-anim-wrapper');
      const current = window.getComputedStyle(wrapper);
      const start = { opacity: current.opacity, transform: current.transform };
      this.detailCardAnimation?.cancel();
      this.detailCardAnimation = null;
      wrapper.className = 'detail-anim-wrapper';

      if (anim !== 'none' && !isMotionReduced() && typeof wrapper.animate === 'function') {
          const direction = anim === 'next' ? -1 : 1;
          const options = { easing: 'cubic-bezier(0.23, 1, 0.32, 1)' };
          const exit = wrapper.animate([
              start,
              { opacity: 0, transform: `translateX(${direction * 8}px)` }
          ], { ...options, duration: 100 });
          this.detailCardAnimation = exit;
          exit.finished.then(() => {
              this.updateDetailContent(w, triggerTTS);
              this.detailCardAnimation = wrapper.animate([
                  { opacity: 0, transform: `translateX(${-direction * 8}px)` },
                  { opacity: 1, transform: 'translateX(0)' }
              ], { ...options, duration: 140 });
          }).catch(error => {
              if (error.name !== 'AbortError') console.error('更新详情内容失败', error);
          });
      } else {
          this.updateDetailContent(w, triggerTTS);
      }
  },

      updateDetailContent(w, triggerTTS = false) {  
      let visuals = View.getCardVisuals(w.type, w.lang); 
      const detailCard = View.getEl('detail-card-container');
      View.applyCardVisuals(detailCard, visuals);
      const dtWmLayer = detailCard?.querySelector('.watermark-layer');
      if (dtWmLayer) dtWmLayer.style.background = visuals.bg; 
 
      View.getEl('dt-watermark').innerHTML = visuals.wm; 
      
      let dtWordEl = View.getEl('dt-word');
      dtWordEl.innerText = w.word; 
      let dtLen = Array.from(w.word || '').length;
      const isEnDetail = w.lang === 'en';
      dtWordEl.lang = isEnDetail ? 'en' : 'ja';
      View.getEl('dt-kana').lang = dtWordEl.lang;
      
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
          starBtn.setAttribute('aria-pressed', String(isStarred));
          starBtn.setAttribute(
              'aria-label',
              isStarred ? '取消收藏' : '收藏单词'
          );
      } 
      if (triggerTTS && localStorage.getItem('autoSpeak') !== 'false') { Hardware.speakWord(w); } 
      ZhongriHooks.emit('detail:updated', { word: w, triggerTTS });
  },

};

/* ==========================================
   第二、三轮增强：智能错题、
   可撤销删除、七天回收站与分组设置页
   ========================================== */
(() => {
    const WRONG_BOOK_KEY = 'wrongBook_v1';
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

    const setActionToastAccessibility = (toast, actionBtn, isOpen) => {
        if (!toast || !actionBtn) return;

        if (isOpen) {
            toast.removeAttribute('inert');
            toast.setAttribute('aria-hidden', 'false');
            return;
        }

        actionBtn.hidden = true;
        toast.setAttribute('inert', '');
        toast.setAttribute('aria-hidden', 'true');
    };

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
        setActionToastAccessibility(toast, actionBtn, true);
        toast.classList.add('show');

        actionToastTimer = window.setTimeout(() => {
            toast.classList.remove('show');
            setActionToastAccessibility(toast, actionBtn, false);
            actionToastCallback = null;
            actionToastTimer = null;
        }, duration);
    };

    Model.wrongBook = Model.wrongBook || {};
    Model.recycleBin = Model.recycleBin || [];
    Model.state.isWrongBookPractice = false;

    Model.saveWrongBook = function() {
        return this.writeStorageValue(
            WRONG_BOOK_KEY,
            this.wrongBook
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
        if (word && typeof Controller.trackSessionOutcome === 'function') {
            Controller.trackSessionOutcome(word, Boolean(correct));
        }
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
        this.recycleBin =
            (await this.readStorageValue(RECYCLE_BIN_KEY)) || [];

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

            // An unmatched word may belong to an unloaded language. Retain the
            // record unless it was actually remapped to a known word.
            if (matchedWord) {
                delete this.wrongBook[wordId];
            }
        });

        this.cleanupRecycleBin();

        if (dbChanged) {
            await this.saveDB();
        }

        await Promise.all([
            this.saveWrongBook(),
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

        if (filterName === 'virtual_wrong_repeated') {
            return record?.status === 'repeated';
        }

        if (filterName === 'virtual_wrong_resolved') {
            return record?.status === 'resolved';
        }

        return originalCheckFilter(word, filterName);
    };

    ZhongriHooks.on('wordbank:filtered', ({ currentFilter } = {}) => {
        if (!String(currentFilter).startsWith('virtual_wrong_')) {
            return;
        }

        const words = Model.state.filteredDb;
        const weight = {
            repeated: 4,
            new: 3,
            reinforcing: 2,
            resolved: 1
        };

        words.sort((a, b) => {
            const aRecord = Model.getWrongRecord(a.w, false) || {};
            const bRecord = Model.getWrongRecord(b.w, false) || {};
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
    });

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

    ZhongriHooks.on('wordbank:ui-updated', () => {
        ensureWrongBookOptions();
        updateWrongToolbar();
    });

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

    ZhongriHooks.on('detail:updated', ({ word } = {}) => {
        if (word) renderWrongSummary(word);
    });

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

        if (Model.state.mode === 'memory-test') {
            const round = Model.state.mtRound;
            const step = Model.state.mtStep;
            if (round === 1) return 'meaning';
            if (round === 2) return isEnglish ? 'listening' : (step === 1 ? 'listening' : 'reading');
            if (round === 3) return step === 1 ? 'meaning' : (isEnglish ? 'spell' : 'reading');
        }

        if (Model.state.mode === 'rote-learning' && ROTE_CORE?.getStep) {
            const descriptor = ROTE_CORE.getStep(
                isEnglish ? 'en' : 'ja',
                displayMode || 'word',
                Model.state.mtStep || 1
            );
            if (descriptor?.dimension) {
                return descriptor.dimension;
            }
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
            word: word?.lang === 'en' ? 'spelling' : 'kanji',
            kana: word?.lang === 'en' ? 'spelling' : 'reading',
            audio: word?.lang === 'en' ? 'listening' : 'reading',
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

        // FSRS 只在一次筛选检验完成后记录一次；“忘记/错误”=Again，
        // “认识/正确”=Good。“模糊”仍然只是当前题目的提示步骤，
        // 不在这里提前推进长期复习卡片。
        Model.recordFsrsReview({
            word,
            dimension,
            rating: isCorrect ? 'good' : 'again',
            source: 'filter'
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
            : String(word.kana || word.word || '').replace(/[【】\[\]()（）\s]/g, '');
        const answer = isEnglish
            ? String(EnglishInput.buffer || '').toLowerCase().trim()
            : RomajiEngine.getFinalText().trim();

        let isCorrectSpell = false;
        if (answer) {
            if (isEnglish) {
                isCorrectSpell = answer === target;
            } else {
                const normAnswer = RomajiEngine.toHiragana(answer);
                const candidates = target
                    .split(/[\/／・,，;；]/)
                    .map(part => RomajiEngine.toHiragana(part.replace(/[\u4E00-\u9FFF々〆ヶ]/g, '')))
                    .filter(Boolean);
                isCorrectSpell = candidates.length > 0
                    ? candidates.includes(normAnswer)
                    : normAnswer === RomajiEngine.toHiragana(target);
            }
        }

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
                correct: isCorrectSpell,
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
        Model.state.studySessionId = (Model.state.studySessionId || 0) + 1;
        Model.state.isAnimating = false;
        Model.state.mode = 'dual-track';
        Model.state.isWrongBookPractice = true;
        Model.state.currentIndex = 0;
        Model.state.dtWordAppearanceMap = {};
        Model.state.currentWordFailed = false;
        Model.state.comboCount = 0;
        Model.state.maxProgressSeen = 0;
        Model.state.uniqueWordCount = selected.length;
        Model.state.studyQueue = [];

        selected.forEach(item => {
            Model.state.dtWordAppearanceMap[item.index] = 2;
            Model.state.studyQueue.push(item.index, item.index);
        });

        Model.state.studyQueue.sort(() => Math.random() - 0.5);
        Model.state.initialQueueLength = Model.state.studyQueue.length;
        this.beginStudySession({
            mode: 'dual-track',
            label: '智能错题专项',
            totalWords: selected.length,
            groupKey: ''
        });
        View.updateComboBadge();
        View.showPage('study-area');

        const matrix = View.getEl('pixel-matrix');
        if (matrix) {
            matrix.innerHTML = '';
        }

        View.renderStudyCard('none');
        Hardware.vibrate(40);
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

    const splitNormalizedExamples = (exampleStr) => {
        let str = String(exampleStr || '').trim();
        if (!str) return [];
        if (str.includes('||') && !str.includes('/')) {
            str = str.replace(/\|\|/g, '/');
        }
        return str
            .split('||')
            .map(example => example.trim())
            .filter(Boolean);
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
        let restoredExampleWord = null;

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

            if (Model.state.batchMode) {
                Model.state.batchMode = false;
                Model.state.manageMode = false;
                Model.state.selectedSet.clear();
            }
            if (document.getElementById('edit-overlay')?.classList.contains('active')) {
                window.toggleModal('edit-overlay', false);
            }
            if (document.getElementById('detail-overlay')?.classList.contains('active')) {
                window.toggleModal('detail-overlay', false);
            }

            if (word.folder && !Model.folders.includes(word.folder)) {
                Model.folders.push(word.folder);
                Model.folderLangs[word.folder] = word.lang === 'en' ? 'en' : 'ja';
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
                const examples = splitNormalizedExamples(word.example);
                const targetIndex = Math.min(
                    Math.max(Number(payload.originalIndex) || 0, 0),
                    examples.length
                );
                examples.splice(targetIndex, 0, payload.example);
                word.example = examples.join(' || ');
                restoredExampleWord = word;
            }
        }

        Model.recycleBin.splice(index, 1);
        await Model.saveAllUserData();
        View.updateWordbankUI();
        View.resetWordbankRenderer();
        this.renderRecycleBin();
        updateSettingsStats();

        if (restoredExampleWord) {
            const detailOverlay = document.getElementById('detail-overlay');
            if (detailOverlay?.classList.contains('active')) {
                const activeRealIdx = Model.state.detailArray[Model.state.activeDetailIdx];
                const activeDetailWord = Model.db[activeRealIdx];
                if (
                    activeDetailWord &&
                    (
                        activeDetailWord === restoredExampleWord ||
                        activeDetailWord._id === restoredExampleWord._id
                    )
                ) {
                    this.updateDetailContent(activeDetailWord, false);
                }
            }
        }

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

        const examples = splitNormalizedExamples(word.example);
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
        await Promise.all([
            Model.saveDB(),
            Model.saveRecycleBin()
        ]);
        this.updateDetailContent(word, false);
        this.renderRecycleBin();
        updateSettingsStats();
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

                actionRow.appendChild(button);
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
                    example: '例句'
                }[item.kind] || '项目';
                const daysLeft = Math.max(
                    1,
                    Math.ceil((item.expiresAt - Date.now()) / 86400000)
                );

                return `
                    <article class="recycle-item" data-trash-id="${escapeHTML(item.id)}">
                        <div class="recycle-item-icon">
                            <span class="material-symbols-rounded">${
                                item.kind === 'example'
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
            '回收站中的词汇和例句将无法恢复。',
            async () => {
                Model.recycleBin = [];
                await Model.saveRecycleBin();
                this.renderRecycleBin();
                updateSettingsStats();
                showToast('回收站已清空');
            },
            { confirmLabel: '清空回收站', danger: true }
        );
    };

    /* ---------- 备份兼容 ---------- */
    const originalBuildBackup =
        Controller.buildBackupPayload.bind(Controller);
    Controller.buildBackupPayload = function(kind = 'manual') {
        const payload = originalBuildBackup(kind);
        payload.backupVersion = Math.max(Number(payload.backupVersion) || 0, 7);
        payload.data.wrongBook = deepClone(Model.wrongBook);
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
        Model.recycleBin = deepClone(payload.data.recycleBin || []);
        await Promise.all([
            Model.saveWrongBook(),
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
        const trashCount = View.getEl('settings-trash-count');

        if (wrongCount) {
            const currentLang = Model.state.currentLangMode || 'ja';
            wrongCount.textContent = Model.db.filter(word => {
                if ((word.lang || 'ja') !== currentLang) return false;
                const record = Model.getWrongRecord(word, false);
                return Boolean(record && record.totalWrong > 0 && record.status !== 'resolved');
            }).length;
        }

        if (trashCount) {
            trashCount.textContent = Model.recycleBin.length;
        }

        updateOnlineStatus();
    }

    ZhongriHooks.on('nav:switch', ({ targetId } = {}) => {
        if (targetId === 'tab-settings') {
            showSettingsSection('');
        }
    });

    Controller.registerInitExtension('wrongbook-and-settings', async function() {
        ensureWrongBookOptions();
        updateWrongToolbar();
        this.renderRecycleBin();
        updateSettingsStats();

        const actionButton = View.getEl('action-toast-action');
        if (actionButton) {
            actionButton.addEventListener('click', () => {
                const callback = actionToastCallback;
                actionToastCallback = null;
                const toast = View.getEl('action-toast');
                toast?.classList.remove('show');
                setActionToastAccessibility(
                    toast,
                    actionButton,
                    false
                );
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

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    });
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

    ZhongriHooks.on('wordbank:ui-updated', () => {
        syncWordbankMetadataFilters();
    });

    ZhongriHooks.on('wordbank:filtered', () => {
        const levelFilter =
            View.getEl('wb-level-filter')?.value || '';
        const difficultyFilter =
            View.getEl('wb-difficulty-filter')?.value || '';

        Model.state.filteredDb = Model.state.filteredDb.filter(item => {
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
    });

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

                const englishWordThresholds = columns >= 4
                    ? { long: 5, veryLong: 8 }
                    : columns === 3
                        ? { long: 6, veryLong: 9 }
                        : { long: 10, veryLong: 15 };

                card.classList.toggle(
                    'is-word-long',
                    wordLength >
                        (isEnglish
                            ? englishWordThresholds.long
                            : 4)
                );

                card.classList.toggle(
                    'is-word-very-long',
                    wordLength >
                        (isEnglish
                            ? englishWordThresholds.veryLong
                            : 6)
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
        const didRender = originalRenderVirtualGrid();
        if (didRender !== false) {
            decorateWordbankCards();
        }
        return didRender;
    };

    ZhongriHooks.on('detail:updated', ({ word } = {}) => {
        const meta = View.getEl('dt-meta');
        if (meta && word) {
            meta.innerHTML = getWordMetadataHTML(word, {
                showUnassigned: true,
                includeTags: true,
                specialTagLimit: 2
            });
        }
    });

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

    Controller.runVocabularyAudit = async function() {
        try {
            await Model.ensureAllBuiltInLanguages();
        } catch (error) {
            console.warn('[词库检查] 未能载入全部语种，将检查当前已载入词汇', error);
        }
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

    Controller.registerInitExtension('wordbank-metadata', async function() {
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
    });
})();


/* ===== 原生智能学习提醒数据桥 ===== */
(() => {
    if (window.ZhongriReminderData) return;

    const planner = window.ZhongriNotificationPlanner;
    const studyRecordTypes = new Set(['daily_punch', 'pendulum']);
    const toDateKey = value => {
        if (!value) return '';
        if (planner?.dateKey) {
            const direct = planner.dateKey(value);
            if (direct) return direct;
        }

        const match = String(value).match(
            /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/
        );
        if (!match) return '';
        return [
            match[1],
            match[2].padStart(2, '0'),
            match[3].padStart(2, '0')
        ].join('-');
    };

    const dispatchReminderDataChanged = () => {
        window.dispatchEvent(
            new CustomEvent('zhongri-study-data-changed')
        );
    };

    ZhongriHooks.on('study:data-changed', dispatchReminderDataChanged);

    window.ZhongriReminderData = Object.freeze({
        getSnapshot() {
            const language = Model.getCurrentLang();
            const cards = Object.entries(Model.fsrsCards || {})
                .map(([key, card]) => {
                    const parts = key.split(':');
                    const word = Model.getWordById(parts[1]);
                    if (
                        !word ||
                        (word.lang || 'ja') !== language ||
                        !card?.due
                    ) {
                        return null;
                    }
                    return {
                        due: card.due,
                        dimension: parts.slice(2).join(':')
                    };
                })
                .filter(Boolean);

            const studyDates = new Set();
            (Model.records || []).forEach(record => {
                if (!studyRecordTypes.has(record?.type)) return;
                const key = toDateKey(record.date);
                if (key) studyDates.add(key);
            });
            (Model.fsrsReviewLogs || []).forEach(log => {
                const key = toDateKey(log?.review);
                if (key) studyDates.add(key);
            });

            return {
                language,
                cards,
                studyDates: [...studyDates],
                streak: Number(Model.calculateStats?.().streak || 0)
            };
        },
        startReview() {
            document
                .getElementById('btn-start-fsrs-review')
                ?.click();
        }
    });
})();



window.onload = () => {
    window.ZhongriAppReady = Promise.resolve(Controller.init());
};


/* Progressive disclosure accordions: interruptible height transitions. */
(() => {
    document.querySelectorAll('.home-progress-details, .checkin-ledger-details').forEach(details => {
        const summary = details.querySelector('summary');
        const content = details.querySelector('.home-sub-progress-group, .checkin-ledger-body');
        if (!summary || !content) return;
        let animation = null;
        let targetOpen = details.open;
        const clear = () => {
            content.style.removeProperty('overflow');
            animation = null;
        };
        summary.addEventListener('click', event => {
            if (isMotionReduced() || event.detail === 0 || typeof content.animate !== 'function') {
                if (animation) {
                    animation.onfinish = null;
                    animation.cancel();
                    clear();
                }
                targetOpen = !details.open;
                return;
            }
            event.preventDefault();
            const startHeight = details.open ? content.getBoundingClientRect().height : 0;
            targetOpen = !targetOpen;
            if (animation) {
                animation.onfinish = null;
                animation.cancel();
            }
            details.open = true;
            content.style.overflow = 'hidden';
            animation = content.animate([
                { height: startHeight + 'px', opacity: targetOpen ? 0.6 : 1 },
                { height: (targetOpen ? content.scrollHeight : 0) + 'px', opacity: targetOpen ? 1 : 0 }
            ], { duration: 180, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
            animation.onfinish = () => {
                details.open = targetOpen;
                clear();
            };
        });
    });
})();
