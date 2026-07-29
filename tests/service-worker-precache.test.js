'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');
const manifest = require('../wordbanks/assets.js');

test('首次安装会预缓存全部词库分片', async () => {
    const listeners = {};
    const cachedAssets = [];
    const workerGlobal = {
        registration: {
            scope: 'https://example.test/app/'
        },
        location: {
            origin: 'https://example.test'
        },
        clients: {
            claim: async () => {},
            matchAll: async () => []
        },
        skipWaiting() {},
        addEventListener(type, listener) {
            listeners[type] = listener;
        },
        ZhongriWordbankAssets: manifest
    };
    const context = {
        URL,
        Response,
        console,
        self: workerGlobal,
        importScripts(asset) {
            assert.equal(asset, './wordbanks/assets.js');
        },
        caches: {
            async open() {
                return {
                    async addAll(assets) {
                        cachedAssets.push(...assets);
                    },
                    async add() {},
                    async put() {},
                    async match() {
                        return null;
                    }
                };
            },
            async keys() {
                return [];
            },
            async delete() {
                return true;
            },
            async match() {
                return null;
            }
        },
        async fetch() {
            throw new Error('install 测试不应访问网络');
        }
    };

    vm.runInNewContext(
        fs.readFileSync('sw.js', 'utf8'),
        context,
        { filename: 'sw.js' }
    );

    let installPromise;
    listeners.install({
        waitUntil(promise) {
            installPromise = promise;
        }
    });
    await installPromise;

    manifest.WORD_BANK_ASSETS.forEach(asset => {
        assert.ok(
            cachedAssets.includes(asset),
            `${asset} 应在首次安装时进入缓存`
        );
    });
});
