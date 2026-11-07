#!/usr/bin/env node
/**
 * 构建图标字体子集。
 *
 * 从源码里提取实际引用的 Material Symbols 图标名，向 Google Fonts 请求
 * 只包含这些图标的 woff2，替换 vendor/material-symbols-rounded.woff2，
 * 并生成清单 vendor/material-symbols-icons.json 供测试校验。
 *
 * 用法：node scripts/build-icon-font.mjs [--dry-run]
 *
 * 需要网络。图标集合变化后重新执行一次即可。
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FONT_PATH = path.join(ROOT, 'vendor', 'material-symbols-rounded.woff2');
const MANIFEST_PATH = path.join(ROOT, 'vendor', 'material-symbols-icons.json');
const ICON_ATTR = 'material-symbols-rounded';
const GOOGLE_CSS = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded';
const USER_AGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const dryRun = process.argv.includes('--dry-run');

const SOURCE_FILES = ['index.html', 'app.js', 'native-app.js', 'root-review.js'];

/** 紧跟在 material-symbols-rounded 标记之后的图标文本（允许附加其他 class） */
const INLINE_PATTERN = new RegExp(`${ICON_ATTR}[^>]*>\\s*([a-z][a-z0-9_]{1,30})\\s*<`, 'g');
/** 运行时改写图标内容的写法：icon.textContent = 'auto_fix_high' */
const ASSIGN_PATTERN = /\b(?:icon|buttonIcon|el|node)\w*\.textContent\s*=\s*'([a-z][a-z0-9_]{1,30})'/g;

async function collectIconNames() {
    const names = new Set();

    for (const file of SOURCE_FILES) {
        let source;
        try {
            source = await readFile(path.join(ROOT, file), 'utf8');
        } catch {
            continue;
        }

        // 只在本文件包含图标标记时才扫描赋值写法，避免误收普通文本
        if (source.includes(ICON_ATTR)) {
            for (const match of source.matchAll(INLINE_PATTERN)) {
                names.add(match[1]);
            }
        }
        for (const match of source.matchAll(ASSIGN_PATTERN)) {
            names.add(match[1]);
        }
    }

    return [...names].sort();
}

async function fetchSubsetFont(icons) {
    const iconQuery = icons.join(',');
    const url =
        `${GOOGLE_CSS}:opsz,wght,FILL,GRAD@24,500,0,0` +
        `&icon_names=${encodeURIComponent(iconQuery)}&display=block`;

    const cssResponse = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!cssResponse.ok) {
        throw new Error(
            `Google Fonts 拒绝了图标列表（HTTP ${cssResponse.status}）。` +
            '请检查是否有拼错的图标名。'
        );
    }

    const css = await cssResponse.text();
    const fontUrl = css.match(/src:\s*url\((https:\/\/[^)]+)\)/)?.[1];
    if (!fontUrl) {
        throw new Error('未能从 Google Fonts 返回的 CSS 中解析出字体地址');
    }

    const fontResponse = await fetch(fontUrl, { headers: { 'User-Agent': USER_AGENT } });
    if (!fontResponse.ok) {
        throw new Error(`字体下载失败（HTTP ${fontResponse.status}）`);
    }

    return Buffer.from(await fontResponse.arrayBuffer());
}

async function main() {
    const icons = await collectIconNames();
    if (!icons.length) {
        throw new Error('没有从源码中提取到任何图标名，请检查提取规则');
    }

    console.log(`提取到 ${icons.length} 个图标：`);
    console.log(`  ${icons.join(' ')}`);

    let previousSize = 0;
    try {
        previousSize = (await readFile(FONT_PATH)).length;
    } catch {
        /* 首次构建时字体可能不存在 */
    }

    if (dryRun) {
        console.log('\n--dry-run：仅列出图标，不下载字体');
        return;
    }

    const font = await fetchSubsetFont(icons);
    await writeFile(FONT_PATH, font);

    const manifest = {
        generatedAt: new Date().toISOString(),
        family: 'Material Symbols Rounded',
        variant: 'opsz 24 / wght 500 / FILL 0 / GRAD 0',
        fontFile: 'vendor/material-symbols-rounded.woff2',
        source: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded',
        icons
    };
    await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

    const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
    const change = previousSize
        ? `${font.length <= previousSize ? '-' : '+'}${
              Math.abs((1 - font.length / previousSize) * 100).toFixed(0)
          }%`
        : null;

    console.log(`\n字体写入 ${path.relative(ROOT, FONT_PATH)}`);
    console.log(`  ${kb(previousSize)} -> ${kb(font.length)}${change ? `  (${change})` : ''}`);
    console.log(`清单写入 ${path.relative(ROOT, MANIFEST_PATH)}`);
}

await main();
