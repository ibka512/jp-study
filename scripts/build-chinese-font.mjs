#!/usr/bin/env node
/**
 * 构建中文细明体（LXGW Neo ZhiSong，基于 IPAex 明朝、贴近新细明体风格）项目静态子集字体。
 *
 * 扫描 UI 源码与全部双语词库中实际出现的汉字、中文标点与基础 ASCII，
 * 调用 `uv run --with fonttools --with brotli pyftsubset` 生成离线
 * `vendor/zh-ming-subset.woff2`。
 *
 * 用法：node scripts/build-chinese-font.mjs [/path/to/LXGWNeoZhiSong.ttf]
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RELEASE_URL =
  'https://github.com/lxgw/LxgwNeoZhiSong/releases/download/v1.071/LXGWNeoZhiSong.ttf';
const OUT_WOFF2 = path.join(ROOT, 'vendor', 'zh-ming-subset.woff2');

const scanFiles = [
  'index.html',
  'app.js',
  'native-app.js',
  'root-review.js',
  ...readdirSync(path.join(ROOT, 'wordbanks'))
    .filter(name => name.endsWith('.js'))
    .sort()
    .map(name => path.join('wordbanks', name))
];

const chars = new Set();
for (let cp = 0x20; cp <= 0x7e; cp++) {
  chars.add(String.fromCharCode(cp));
}
for (const ch of '—·…“”‘’《》【】「」『』、。，；：！？（）～￥×÷±•・') {
  chars.add(ch);
}

for (const rel of scanFiles) {
  const text = readFileSync(path.join(ROOT, rel), 'utf8');
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (
      (cp >= 0x4e00 && cp <= 0x9fff) ||
      (cp >= 0x3400 && cp <= 0x4dbf) ||
      (cp >= 0x3000 && cp <= 0x303f) ||
      (cp >= 0xff00 && cp <= 0xffef)
    ) {
      chars.add(ch);
    }
  }
}

const charsPath = path.join(tmpdir(), `zhongri-lxgw-chars-${Date.now()}.txt`);
writeFileSync(charsPath, [...chars].sort().join(''), 'utf8');

let sourceTtf = process.argv[2];
let downloadedTemp = false;
if (!sourceTtf) {
  sourceTtf = path.join(tmpdir(), `LXGWNeoZhiSong-${Date.now()}.ttf`);
  console.log(`正在下载 LXGWNeoZhiSong.ttf ...`);
  execFileSync('curl', ['-L', '-s', '-o', sourceTtf, RELEASE_URL], { stdio: 'inherit' });
  downloadedTemp = true;
}

try {
  execFileSync(
    'uv',
    [
      'run',
      '--with', 'fonttools',
      '--with', 'brotli',
      'pyftsubset',
      sourceTtf,
      `--text-file=${charsPath}`,
      '--flavor=woff2',
      '--layout-features=kern,liga,ccmp,palt',
      '--no-hinting',
      '--desubroutinize',
      `--output-file=${OUT_WOFF2}`
    ],
    { stdio: 'inherit' }
  );
  console.log(`细明体（LXGW Neo ZhiSong）子集已生成：${OUT_WOFF2}（${chars.size} 个字符）`);
} finally {
  try { unlinkSync(charsPath); } catch (_) {}
  if (downloadedTemp) {
    try { unlinkSync(sourceTtf); } catch (_) {}
  }
}
