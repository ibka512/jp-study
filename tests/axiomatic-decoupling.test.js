'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');

const SettingsStore = require('../settings-store.js');
const StudyCardViewModel = require('../study-card-viewmodel.js');
const WordbankLoader = require('../wordbank-loader.js');

const createMockStorage = () => {
    const map = new Map();
    return {
        getItem: key => (map.has(key) ? map.get(key) : null),
        setItem: (key, value) => map.set(key, String(value)),
        removeItem: key => map.delete(key)
    };
};

test('DP2 SettingsStore: 声明式 Schema 隔离备份键，忽略未注册脏键', () => {
    const store = createMockStorage();
    SettingsStore.set('theme', 'dark', store);
    SettingsStore.set('colorPalette', 'terracotta', store);
    SettingsStore.set('showRoots', false, store);
    SettingsStore.set('wbCols', '4', store); // backup: false
    store.setItem('rogueTempKey', 'should-not-backup');

    const collected = SettingsStore.collectBackupPreferences(store);
    assert.equal(collected.theme, 'dark');
    assert.equal(collected.colorPalette, 'terracotta');
    assert.equal(collected.showRoots, 'false');
    assert.equal(Object.prototype.hasOwnProperty.call(collected, 'wbCols'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(collected, 'rogueTempKey'), false);

    const target = createMockStorage();
    assert.equal(SettingsStore.get('colorPalette', target), 'washi');
    const applied = SettingsStore.applyBackupPreferences(
        { theme: 'light', colorPalette: 'swiss', langMode: 'en', rogueKey: 'nope' },
        target
    );
    assert.equal(applied, 3);
    assert.equal(SettingsStore.get('theme', target), 'light');
    assert.equal(SettingsStore.get('colorPalette', target), 'swiss');
    assert.equal(SettingsStore.get('langMode', target), 'en');
    assert.equal(target.getItem('rogueKey'), null);
    assert.equal(SettingsStore.getBool('autoSpeak', target), true);
});

test('DP1 WordbankLoader: 双语快照与默认词夹按语言独立派生、互不污染', () => {
    assert.equal(WordbankLoader.getDefaultFolderForLanguage('ja'), '默认词库');
    assert.equal(WordbankLoader.getDefaultFolderForLanguage('en'), '四级词汇');

    const prevJa = globalThis.DefaultWords;
    const prevEn = globalThis.DefaultEnglishWords;
    try {
        globalThis.DefaultWords = [{ word: '気', folder: '默认词库' }];
        globalThis.DefaultEnglishWords = [
            { word: 'abandon', folder: '四级词汇' },
            { word: 'abstract', folder: '六级词汇' }
        ];

        const jaSnap = WordbankLoader.getLanguageSnapshot('ja');
        const enSnap = WordbankLoader.getLanguageSnapshot('en');

        assert.deepEqual([...jaSnap.builtInFolders], ['默认词库']);
        assert.deepEqual([...enSnap.builtInFolders], ['四级词汇', '六级词汇']);
        assert.equal(jaSnap.wordCount, 1);
        assert.equal(enSnap.wordCount, 2);
    } finally {
        globalThis.DefaultWords = prevJa;
        globalThis.DefaultEnglishWords = prevEn;
    }
});

test('DP4/DP5 StudyCardViewModel: FSRS 与筛选检验产出纯声明式视图模型，零 DOM 依赖', () => {
    const jpWord = {
        word: '季節',
        kana: '【きせつ】',
        meaning: '季节。',
        example: '季節の変わり目 / 季节交替'
    };

    const hiddenMeaning = StudyCardViewModel.buildFsrsCardViewModel({
        word: jpWord,
        dimension: 'meaning',
        isRevealed: false,
        isEnglish: false
    });
    assert.equal(hiddenMeaning.wordText, '季節');
    assert.equal(hiddenMeaning.readingText, 'きせつ');
    assert.equal(hiddenMeaning.meaningText, '■■■');
    assert.equal(hiddenMeaning.isMaskedMeaning, true);
    assert.equal(hiddenMeaning.isMaskedWord, false);
    assert.equal(hiddenMeaning.showExample, false);

    const listeningPrompt = StudyCardViewModel.buildFsrsCardViewModel({
        word: jpWord,
        dimension: 'listening',
        isRevealed: false,
        isEnglish: false
    });
    assert.equal(listeningPrompt.showBlindAudio, true);
    assert.equal(listeningPrompt.showWordRow, false);
    assert.equal(listeningPrompt.autoSpeakOnRender, true);

    const revealed = StudyCardViewModel.buildFsrsCardViewModel({
        word: jpWord,
        dimension: 'listening',
        isRevealed: true,
        isEnglish: false
    });
    assert.equal(revealed.showBlindAudio, false);
    assert.equal(revealed.showExample, true);
    assert.equal(revealed.showSpeaker, true);
    assert.equal(revealed.isMaskedMeaning, false);

    const enWord = {
        word: 'abandon',
        phonetic: '/əˈbændən/',
        meaning: '放弃',
        roots: 'a(去)-ban(禁止)-don(给予)'
    };
    const ftEn = StudyCardViewModel.buildFilterTestCardViewModel({
        word: enWord,
        displayMode: 'kana',
        ftState: 'A',
        isEnglish: true,
        showRootsPref: true
    });
    assert.equal(ftEn.normalizedDisplayMode, 'word');
    assert.equal(ftEn.isMaskedWord, false);
    assert.equal(ftEn.isMaskedMeaning, true);
    assert.equal(ftEn.showRoots, true);
    assert.equal(ftEn.maskRootText, false);
    assert.equal(ftEn.maskRootMeaning, true);
});

test('DP8 Shell Assets: sw.js 资产清单与 index.html 保持自动同步零漂移', () => {
    const root = path.resolve(__dirname, '..');
    const output = execFileSync(
        process.execPath,
        [path.join(root, 'scripts/sync-shell-assets.mjs'), '--check'],
        { cwd: root, encoding: 'utf8' }
    );
    assert.match(output, /校验通过/);
});
