#!/usr/bin/env node
/**
 * 构建图标字体子集。
 *
 * 从源码里提取实际引用的 Material Symbols 图标名（含静态标签、动态赋值、
 * 模板三元表达式与选择器图标映射表），向 Google Fonts 请求仅包含这些图标且
 * 保留 FILL (0..1) 变体轴的 woff2，替换 vendor/material-symbols-rounded.woff2，
 * 并生成清单 vendor/material-symbols-icons.json 供测试校验。
 *
 * 用法：node scripts/build-icon-font.mjs [--dry-run]
 */

import { readFile, writeFile } from 'node:fs/promises';
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

export const SOURCE_FILES = ['index.html', 'app.js', 'native-app.js', 'root-review.js'];

const ICON_NAME_RE = /^[a-z][a-z0-9_]{1,30}$/;

/** 1. 静态图标标签：<span class="... material-symbols-rounded ...">icon_name</span> */
const INLINE_PATTERN = new RegExp(`${ICON_ATTR}[^>]*>\\s*([a-z][a-z0-9_]{1,30})\\s*<`, 'g');
/** 2. 运行时文本赋值（支持 textContent / innerText 以及三元 / 或运算表达式） */
const ASSIGN_LINE_PATTERN = /\b(?:icon|buttonIcon|manageIcon|el|node)\w*\.(?:textContent|innerText)\s*=\s*([^;]+)/g;
/** 3. 模板表达式内嵌在 material-symbols-rounded 标签里 */
const TEMPLATE_ICON_PATTERN = new RegExp(`${ICON_ATTR}[^>]*>\\s*\\$\\{([^}]+)\\}\\s*<`, 'g');
/** 4. 对象字面量 icon: '...' 或跨行三元 icon: cond\n ? 'a'\n : 'b' */
const ICON_PROP_PATTERN = /\bicon\s*:\s*([^,};]+)/g;
/** 5. 命名图标映射对象：displayIconMap / genericIconMap */
const ICON_MAP_BLOCK_PATTERN = /\b(?:displayIconMap|genericIconMap)\s*=\s*\{([\s\S]*?)\};/g;
/** 6. 词库/范围选择器元信息表：['group', 'label', 'icon_name', ...] */
const PICKER_TUPLE_PATTERN = /\[\s*'(?:quick|wrong|progress|folders|library|favorite|review|weak)'\s*,\s*(?:'[^']*'|[^,\]]+)\s*,\s*([^,\]]+)/g;
/** 7. 导航 data-title="icon|标题" */
const DATA_TITLE_PATTERN = /data-title="([a-z][a-z0-9_]{1,30})\|/g;
/** 8. 变量声明 const icon = ...;（含三元/回退图标如 'tune' / 'hearing_disabled'） */
const CONST_ICON_PATTERN = /\bconst icon\s*=\s*([^;]+);/g;

const NON_ICON_TOKENS = new Set([
    'all', 'en', 'ja', 'word', 'kana', 'meaning', 'audio', 'spell', 'skip',
    'overwrite', 'keep', 'default', 'normal', 'active', 'hidden', 'none',
    'warning', 'ok', 'true', 'false', 'example', 'conversation', 'study',
    'filter', 'pending', 'resolved', 'kanji', 'span'
]);

function addQuotedIconLiterals(expression, names, allowErrorIcon = false) {
    for (const match of expression.matchAll(/'([a-z][a-z0-9_]{1,30})'/g)) {
        const candidate = match[1];
        if (!ICON_NAME_RE.test(candidate)) continue;
        if (NON_ICON_TOKENS.has(candidate)) continue;
        if (candidate === 'error' && !allowErrorIcon) continue;
        names.add(candidate);
    }
}

export function extractIconNamesFromSource(source) {
    const names = new Set();

    if (source.includes(ICON_ATTR)) {
        for (const match of source.matchAll(INLINE_PATTERN)) {
            names.add(match[1]);
        }
        for (const match of source.matchAll(TEMPLATE_ICON_PATTERN)) {
            addQuotedIconLiterals(match[1], names, true);
        }
    }

    for (const match of source.matchAll(ASSIGN_LINE_PATTERN)) {
        addQuotedIconLiterals(match[1], names, false);
    }

    for (const match of source.matchAll(ICON_PROP_PATTERN)) {
        addQuotedIconLiterals(match[1], names, false);
    }

    for (const match of source.matchAll(ICON_MAP_BLOCK_PATTERN)) {
        for (const val of match[1].matchAll(/:\s*'([a-z][a-z0-9_]{1,30})'/g)) {
            names.add(val[1]);
        }
    }

    for (const match of source.matchAll(PICKER_TUPLE_PATTERN)) {
        addQuotedIconLiterals(match[1], names, false);
    }

    for (const match of source.matchAll(DATA_TITLE_PATTERN)) {
        names.add(match[1]);
    }

    for (const match of source.matchAll(CONST_ICON_PATTERN)) {
        addQuotedIconLiterals(match[1], names, false);
    }

    return names;
}

export async function collectIconNames(rootDir = ROOT) {
    const names = new Set();

    for (const file of SOURCE_FILES) {
        let source;
        try {
            source = await readFile(path.join(rootDir, file), 'utf8');
        } catch {
            continue;
        }
        for (const name of extractIconNamesFromSource(source)) {
            names.add(name);
        }
    }

    return [...names].sort();
}

async function fetchSubsetFont(icons) {
    const iconQuery = icons.join(',');
    const url =
        `${GOOGLE_CSS}:opsz,wght,FILL,GRAD@24,500..600,0..1,0` +
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
        variant: 'opsz 24 / wght 500..600 / FILL 0..1 / GRAD 0',
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

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    await main();
}
