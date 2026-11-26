'use strict';

/**
 * 图标字体回归检查。
 *
 * 复用 scripts/build-icon-font.mjs 的图标提取逻辑（涵盖静态标签、动态赋值、
 * 模板三元表达式和选择器图标映射），并额外断言几个关键动态图标与变体轴。
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.join(__dirname, '..');
const manifest = require('../vendor/material-symbols-icons.json');

test('图标字体子集覆盖全部静态与动态图标，并保留 FILL 变体轴', async () => {
    const { collectIconNames } = await import('../scripts/build-icon-font.mjs');

    assert.ok(Array.isArray(manifest.icons), '图标清单应包含 icons 数组');
    assert.ok(manifest.icons.length > 0, '图标清单不能为空');

    const icons = await collectIconNames(ROOT);
    assert.ok(icons.length > 0, '未能从源码中提取到图标名');

    const available = new Set(manifest.icons);
    const missing = icons.filter(name => !available.has(name));

    assert.deepEqual(
        missing,
        [],
        `以下图标不在子集字体中，需要执行 node scripts/build-icon-font.mjs 重新构建：${missing.join(', ')}`
    );

    for (const criticalDynamicIcon of [
        'light_mode',
        'dark_mode',
        'tune',
        'headphones',
        'record_voice_over',
        'translate',
        'verified',
        'cancel',
        'dictionary',
        'format_quote'
    ]) {
        assert.ok(
            available.has(criticalDynamicIcon),
            `关键动态图标 ${criticalDynamicIcon} 必须包含在子集清单中`
        );
    }

    assert.match(
        String(manifest.variant || ''),
        /FILL 0\.\.1/,
        '图标字体必须保留 FILL 0..1 变体轴以支持实心收藏/选中图标'
    );

    const fontPath = path.join(ROOT, manifest.fontFile || 'vendor/material-symbols-rounded.woff2');
    const fontBuffer = fs.readFileSync(fontPath);
    const fontSize = fontBuffer.length;

    assert.equal(fontBuffer.subarray(0, 4).toString('ascii'), 'wOF2', '字体文件应为有效 WOFF2');
    assert.ok(
        fontSize < 120 * 1024,
        `图标字体大小 ${(fontSize / 1024).toFixed(1)} KB 超出预期，可能误提交了完整字体`
    );

    console.log(
        `图标字体检查通过：源码引用 ${icons.length} 个，清单 ${manifest.icons.length} 个，` +
        `字体 ${(fontSize / 1024).toFixed(1)} KB`
    );
});
