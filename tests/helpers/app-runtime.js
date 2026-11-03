'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Execute the complete application, including its init/save wrappers. Only the
// browser and storage boundaries are faked; no application methods are replaced.
function createStorage() {
    return { local: new Map(), idb: new Map(), failReads: false, failWrites: false };
}

function loadApp(storage = createStorage(), root = path.resolve(__dirname, '../..')) {
    const events = [];
    const context = vm.createContext({
        console, structuredClone, setTimeout, clearTimeout, TextDecoder,
        crypto: require('node:crypto').webcrypto,
        navigator: {},
        localStorage: {
            getItem: key => storage.local.get(key) ?? null,
            setItem: (key, value) => storage.local.set(key, String(value)),
            removeItem: key => storage.local.delete(key)
        },
        idbKeyval: {
            async get(key) {
                if (storage.failReads) throw new Error('IndexedDB unavailable');
                return structuredClone(storage.idb.get(key));
            },
            async set(key, value) {
                if (storage.failWrites) throw new Error('IndexedDB write failed');
                storage.idb.set(key, structuredClone(value));
            },
            async del(key) { storage.idb.delete(key); }
        },
        CustomEvent: class { constructor(type) { this.type = type; } },
        addEventListener() {},
        dispatchEvent(event) { events.push(event.type); },
        matchMedia: () => ({ matches: false }),
        document: {
            getElementById: () => null,
            querySelector: () => null,
            querySelectorAll: () => [],
            addEventListener() {},
            createElement() {
                const listeners = {};
                return {
                    dataset: {},
                    addEventListener(type, callback) { listeners[type] = callback; },
                    remove() {},
                    listeners
                };
            },
            head: {
                appendChild(script) {
                    run(script.src);
                    script.listeners.load();
                }
            }
        }
    });
    context.window = context;
    function run(file) {
        vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
    }
    for (const file of [
        'data.js', 'english-data.js', 'wordbanks/assets.js', 'wordbank-loader.js',
        'core-utils.js', 'haptics.js', 'rote-learning-core.js',
        'vendor/ts-fsrs.umd.js', 'fsrs-scheduler.js', 'notification-planner.js', 'app.js'
    ]) run(file);
    return { ...vm.runInContext('({ Model, Controller })', context), storage, events };
}

module.exports = { createStorage, loadApp };
