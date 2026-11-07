'use strict';

/**
 * 图标字体回归检查。
 *
 * 字体是按源码里用到的图标裁出来的子集，所以只要有人新增了图标却没重新构建字体，
 * 页面上就会把图标名当英文显示出来。这个测试用来卡住这种情况。
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const manifest = require('../vendor/material-symbols-icons.json');

const SOURCE_FILES = ['index.html', 'app.js', 'native-app.js', 'root-review.js'];
const INLINE_PATTERN = /material-symbols-rounded[^>]*>\s*([a-z][a-z0-9_]{1,30})\s*</g;
const ASSIGN_PATTERN = /\b(?:icon|buttonIcon|el|node)\w*\.textContent\s*=\s*'([a-z][a-z0-9_]{1,30})'/g;

function collectIconNames() {
    const names = new Set();

    for (const file of SOURCE_FILES) {
        const fullPath = path.join(ROOT, file);
        if (!fs.existsSync(fullPath)) {
            continue;
        }

        const source = fs.readFileSync(fullPath, 'utf8');
        for (const match of source.matchAll(INLINE_PATTERN)) {
            names.add(match[1]);
        }
        for (const match of source.matchAll(ASSIGN_PATTERN)) {
            names.add(match[1]);
        }
    }

    return [...names];
}

assert.ok(Array.isArray(manifest.icons), '图标清单应包含 icons 数组');
assert.ok(manifest.icons.length > 0, '图标清单不能为空');

const icons = collectIconNames();
assert.ok(icons.length > 0, '未能从源码中提取到图标名');

const available = new Set(manifest.icons);
const missing = icons.filter(name => !available.has(name));

assert.deepEqual(
    missing,
    [],
    `以下图标不在子集字体中，需要执行 node scripts/build-icon-font.mjs 重新构建：${missing.join(', ')}`
);

const fontPath = path.join(ROOT, manifest.fontFile || 'vendor/material-symbols-rounded.woff2');
const fontSize = fs.statSync(fontPath).size;

assert.ok(
    fontSize < 120 * 1024,
    `图标字体大小 ${(fontSize / 1024).toFixed(1)} KB 超出预期，可能误提交了完整字体`
);

console.log(
    `图标字体检查通过：源码引用 ${icons.length} 个，清单 ${manifest.icons.length} 个，` +
    `字体 ${(fontSize / 1024).toFixed(1)} KB`
);
