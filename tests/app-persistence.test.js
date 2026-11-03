'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { createStorage, loadApp } = require('./helpers/app-runtime');

for (const [editedLanguage, startupLanguage] of [['en', 'ja'], ['ja', 'en']]) {
    test(`${editedLanguage} 数据在 ${startupLanguage} 重启、编辑保存及再次切换后保留`, async () => {
        const storage = createStorage();
        let { Model } = loadApp(storage);
        await Model.init();
        await Model.ensureAllBuiltInLanguages();
        const words = Model.db.filter(word => word.lang === editedLanguage);
        const edited = words[0];
        const deletedId = words[1]._id;
        edited.meaning = '审计回归自定义释义';
        Model.stars.push(edited._id);
        Model.recordStudyResult({ word: edited, correct: false });
        Model.db = Model.db.filter(word => word._id !== deletedId);
        await Model.saveAllUserData();
        storage.local.set('langMode', startupLanguage);

        ({ Model } = loadApp(storage));
        await Model.init();
        assert.deepEqual(Array.from(Model.builtInLoadOrder), [startupLanguage], '仍按语言延迟加载');
        assert.ok(Model.stars.includes(edited._id), '重启不能清空未加载语言的收藏');
        assert.equal(Model.wrongBook[edited._id]?.totalWrong, 1, '重启不能清空错题');
        Model.db.find(word => word.lang === startupLanguage).meaning = '另一语言的正常编辑';
        await Model.saveDB();

        ({ Model } = loadApp(storage));
        await Model.init();
        await Model.ensureBuiltInLanguage(editedLanguage);
        assert.equal(Model.getWordById(edited._id).meaning, '审计回归自定义释义');
        assert.equal(Model.getWordById(deletedId), null, '删除标记不能因另一语言保存而丢失');
        assert.ok(Model.stars.includes(edited._id));
        assert.equal(Model.wrongBook[edited._id]?.totalWrong, 1);
    });
}

test('降级写入在重启和主存储恢复后仍为最新值，并可继续正常保存', async () => {
    const storage = createStorage();
    let { Model } = loadApp(storage);
    await Model.writeStorageValue('studyRecords', [{ revision: 1 }]);
    storage.failWrites = true;
    await Model.writeStorageValue('studyRecords', [{ revision: 2 }]);
    storage.failWrites = false;
    ({ Model } = loadApp(storage));
    assert.equal((await Model.readStorageValue('studyRecords'))[0].revision, 2);
    await Model.writeStorageValue('studyRecords', [{ revision: 3 }]);
    ({ Model } = loadApp(storage));
    assert.equal((await Model.readStorageValue('studyRecords'))[0].revision, 3);
    assert.equal(storage.idb.get('studyRecords')[0].revision, 3);
});

test('各类保存与 AI 对话共用失败降级规则，旧 localStorage 数据继续可读', async () => {
    const storage = createStorage();
    const { Model, Controller } = loadApp(storage);
    storage.local.set('legacy', JSON.stringify({ retained: true }));
    assert.equal((await Model.readStorageValue('legacy')).retained, true);
    Model.folders = ['回归词库'];
    Model.folderLangs = { '回归词库': 'en' };
    Model.stars = ['user-1'];
    Model.records = [{ type: 'daily_punch', date: '2026/11/3' }];
    Model.mtWordClears = { 'user-1': { meaning: true } };
    Model.aiConversations = [{ messages: [{ role: 'user', content: 'hello' }] }];
    storage.failWrites = true;
    await Promise.all([
        Model.saveFolders(), Model.saveFolderLangs(), Model.saveStars(),
        Model.saveRecords(), Model.saveClears(), Controller._persistConversations()
    ]);
    const fresh = loadApp(storage).Model;
    assert.equal((await fresh.readStorageValue('myFolders_v3'))[0], '回归词库');
    assert.equal((await fresh.readStorageValue('myFolderLangs'))['回归词库'], 'en');
    assert.equal((await fresh.readStorageValue('starredWords'))[0], 'user-1');
    assert.equal((await fresh.readStorageValue('studyRecords'))[0].type, 'daily_punch');
    assert.equal((await fresh.readStorageValue('mtWordClears_v3'))['user-1'].meaning, true);
    assert.equal((await fresh.readStorageValue('aiConversations'))[0].messages[0].content, 'hello');
});

test('初始化探测失败的会话写入，在下次正常启动读取时仍保留', async () => {
    const storage = createStorage();
    let { Model } = loadApp(storage);
    await Model.writeStorageValue('probe-regression', { revision: 1 });
    Model.idbAvailable = false;
    await Model.writeStorageValue('probe-regression', { revision: 2 });
    ({ Model } = loadApp(storage));
    assert.equal((await Model.readStorageValue('probe-regression')).revision, 2);
    storage.failWrites = true;
    await Model.writeStorageValue('probe-regression', { revision: 3 });
    assert.equal((await Model.readStorageValue('probe-regression')).revision, 3);
    storage.failWrites = false;
    await Model.writeStorageValue('probe-regression', { revision: 4 });
    assert.equal((await loadApp(storage).Model.readStorageValue('probe-regression')).revision, 4);
});

test('备用存储中的恢复点清除后，主存储恢复不会让旧恢复点复活', async () => {
    const storage = createStorage();
    const { Model, Controller } = loadApp(storage);
    const key = 'preImportRestorePoint_v1';
    await Model.writeStorageValue(key, { data: { db: [] } });
    storage.failWrites = true;
    await Controller.removePreImportRestorePoint();
    storage.failWrites = false;
    const fresh = loadApp(storage).Model;
    assert.equal(await fresh.readStorageValue(key), null);
    await fresh.writeStorageValue(key, null);
    assert.equal(await loadApp(storage).Model.readStorageValue(key), null);
});

test('完整备份导入往返保留双语覆盖、收藏、错题及 FSRS', async () => {
    const { Model, Controller } = loadApp();
    await Model.init();
    await Model.ensureAllBuiltInLanguages();
    const word = Model.db.find(item => item.lang === 'en');
    word.meaning = '备份回归释义';
    Model.stars.push(word._id);
    Model.recordStudyResult({ word, correct: false });
    Model.recordFsrsReview({ word, dimension: 'meaning' });
    await Model.saveAllUserData();
    const backup = Controller.buildBackupPayload();
    const fresh = loadApp();
    await fresh.Model.init();
    const payload = fresh.Controller.normalizeBackupPayload(JSON.parse(JSON.stringify(backup)));
    fresh.Controller.validateBackupPayload(payload);
    await fresh.Controller.applyBackupPayload(payload);
    const restarted = loadApp(fresh.storage).Model;
    await restarted.init();
    await restarted.ensureAllBuiltInLanguages();
    assert.equal(restarted.getWordById(word._id).meaning, '备份回归释义');
    assert.ok(restarted.stars.includes(word._id));
    assert.equal(restarted.wrongBook[word._id].totalWrong, 1);
    assert.equal(restarted.fsrsCards[`en:${word._id}:meaning`].reps, 1);
});
