#!/usr/bin/env node
/**
 * 词库字段瘦身。
 *
 * 词库文件里每条词都重复内嵌了完全相同的来源元数据，还有一批恒定字段，
 * 这些都能在 wordbanks/finalize.js 收尾阶段补出来。本脚本把它们从词条里
 * 提取到文件头注释，只保留真正逐条不同的字段。
 *
 * 幂等：已提走来源信息的文件会保留原有注释，重复执行不会继续缩小体积。
 *
 * 用法：node scripts/slim-wordbanks.mjs [--dry-run]
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BANK_DIR = path.join(ROOT, 'wordbanks');

/** 全库一致、因此可以从词条里提走的来源信息 */
const PROVENANCE_FIELDS = ['sourceName', 'sourceVersion', 'sourceLevels', 'dataVersion'];

/** 能由 finalize.js 补出来的恒定字段及其中性值 */
const DEFAULT_FIELDS = { builtIn: true, difficulty: 0 };

const dryRun = process.argv.includes('--dry-run');

/** 判断某个字段值是否是"可以交给收尾阶段补"的中性值 */
function isNeutral(key, value) {
    if (key === 'lang') return typeof value === 'string' && value.length > 0;
    if (key === 'tags') return Array.isArray(value) && value.length === 0;
    return key in DEFAULT_FIELDS && value === DEFAULT_FIELDS[key];
}

/** 拆出文件头注释、变量名与词条数组 */
function parseChunk(source) {
    const headerMatch = source.match(/^\s*\/\*\*[\s\S]*?\*\/\s*/);
    const header = headerMatch ? headerMatch[0].trim() : '';
    const body = headerMatch ? source.slice(headerMatch[0].length) : source;

    const start = body.indexOf('[');
    const end = body.lastIndexOf(']');
    if (start === -1 || end === -1) {
        throw new Error('无法在文件中定位词条数组');
    }

    return {
        header,
        variable: body.match(/^(\w+)\.push\(/m)?.[1] || 'DefaultWords',
        words: JSON.parse(body.slice(start, end + 1))
    };
}

/** 从词条里提取来源信息，生成文件头注释 */
function buildProvenanceHeader(words, language, chunkName) {
    const lines = [];

    for (const field of PROVENANCE_FIELDS) {
        // 只比较有值的那部分词条：早期导入的批次常常一半有值一半为 null
        const values = new Set(
            words
                .map(word => word[field])
                .filter(value => value !== null && value !== undefined)
                .map(value => JSON.stringify(value))
        );
        if (values.size !== 1) continue;
        lines.push(` *   ${field}: ${[...values][0]}`);
    }

    if (!lines.length) return '';

    return [
        '/**',
        ` * 钟日 - ${language === 'ja' ? '日语' : '英语'}词库分片 ${chunkName}`,
        ' *',
        ' * 以下来源信息全库一致，已从每条词条中提取；运行时不需要这些字段。',
        ...lines,
        ' */'
    ].join('\n');
}

function slimWords(words) {
    let removed = 0;
    const slim = words.map(word => {
        const next = {};
        for (const [key, value] of Object.entries(word)) {
            if (PROVENANCE_FIELDS.includes(key) || isNeutral(key, value)) {
                removed++;
                continue;
            }
            next[key] = value;
        }
        return next;
    });
    return { slim, removed };
}

async function main() {
    const files = (await readdir(BANK_DIR))
        .filter(name => /^(ja|en)-\d+\.js$/.test(name))
        .sort();

    if (!files.length) throw new Error('未找到词库分片文件');

    let beforeBytes = 0;
    let afterBytes = 0;
    let removedTotal = 0;

    for (const name of files) {
        const fullPath = path.join(BANK_DIR, name);
        const source = await readFile(fullPath, 'utf8');
        const language = name.slice(0, 2);
        const { header, variable, words } = parseChunk(source);

        const { slim, removed } = slimWords(words);
        const provenance = buildProvenanceHeader(words, language, name.replace('.js', ''));
        // 已经瘦过的文件保留原注释，保证重复执行结果稳定
        const keptHeader = provenance || header;
        const body = `${variable}.push(...${JSON.stringify(slim)});\n`;
        const output = keptHeader ? `${keptHeader}\n\n${body}` : body;

        beforeBytes += Buffer.byteLength(source);
        afterBytes += Buffer.byteLength(output);
        removedTotal += removed;

        if (!dryRun && output !== source) {
            await writeFile(fullPath, output);
        }

        console.log(
            `${name.padEnd(12)} ${String(words.length).padStart(5)} 条  ` +
            `${(Buffer.byteLength(source) / 1024).toFixed(0).padStart(5)} KB -> ` +
            `${(Buffer.byteLength(output) / 1024).toFixed(0).padStart(5)} KB  ` +
            `去掉 ${removed} 个字段`
        );
    }

    const saving = (1 - afterBytes / beforeBytes) * 100;
    console.log(
        `\n合计 ${(beforeBytes / 1024 / 1024).toFixed(2)} MB -> ` +
        `${(afterBytes / 1024 / 1024).toFixed(2)} MB  (-${saving.toFixed(0)}%)  ` +
        `共移除 ${removedTotal} 个冗余字段`
    );
    if (dryRun) console.log('（--dry-run：未写入文件）');
}

await main();
