'use strict';

const fs = require('node:fs');
const assert = require('node:assert/strict');
const test = require('node:test');

test('实际首页适配为离线 Android 资源，并保留网页样式缓存版本', async () => {
    const { adaptAndroidHtml } = await import('../scripts/android-html.mjs');
    const source = fs.readFileSync('index.html', 'utf8');
    const html = adaptAndroidHtml(source);
    const style = source.match(/href="(style\.css[^"]*)"/)[1];
    assert.ok(html.includes(`href="${style}"`));
    assert.equal((html.match(/href="native-app\.css"/g) || []).length, 1);
    assert.ok(html.indexOf(`href="${style}"`) < html.indexOf('href="native-app.css"'));
    assert.match(html, /viewport-fit=cover/);
    assert.match(html, /src="vendor\/idb-keyval\.umd\.js"/);
    assert.match(html, /href="vendor\/fonts\/fonts\.css"/);
    assert.match(html, /href="vendor\/material-symbols\.css"/);
    const iconCss = fs.readFileSync('vendor/material-symbols.css', 'utf8');
    const iconFile = iconCss.match(/url\('([^']+)'\)/)[1];
    assert.equal(fs.readFileSync(`vendor/${iconFile}`).subarray(0, 4).toString(), 'wOF2');
    assert.doesNotMatch(html, /fonts\.googleapis\.com|cdn\.jsdelivr\.net\/npm\/idb-keyval/);
});

test('样式查询版本变更或省略，不影响原生样式注入', async () => {
    const { adaptAndroidHtml } = await import('../scripts/android-html.mjs');
    const source = fs.readFileSync('index.html', 'utf8');
    for (const href of ['style.css?v=next-release', 'style.css', './style.css?v=42']) {
        const input = source.replace(/href="style\.css[^"]*"/, `href="${href}"`);
        const html = adaptAndroidHtml(input);
        assert.ok(html.includes(`href="${href}"`));
        assert.equal((html.match(/href="native-app\.css"/g) || []).length, 1);
    }
});

test('样式入口缺失或重复时明确失败', async () => {
    const { adaptAndroidHtml } = await import('../scripts/android-html.mjs');
    const source = fs.readFileSync('index.html', 'utf8');
    const missing = source.replace(/<link[^>]+href="style\.css[^>]+>/, '');
    assert.throws(() => adaptAndroidHtml(missing), /style\.css/);
    assert.throws(() => adaptAndroidHtml(source + '<link href="style.css">'), /style\.css/);
});


test('网页已包含安全区域或使用旧视口时，原生构建均只保留一个 viewport-fit', async () => {
    const { adaptAndroidHtml } = await import('../scripts/android-html.mjs');
    const source = fs.readFileSync('index.html', 'utf8');
    for (const input of [source, source.replace(', viewport-fit=cover', '')]) {
        const html = adaptAndroidHtml(input);
        assert.equal((html.match(/viewport-fit=cover/g) || []).length, 1);
    }
});
