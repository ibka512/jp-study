#!/usr/bin/env node
/**
 * Auto-synchronizes local shell assets from index.html (Single Source of Truth)
 * into sw.js LOCAL_ASSETS and NETWORK_FIRST_ASSETS.
 *
 * Eliminates manual dual-sync drift (DP8 reverse coupling A_{4,8}, A_{6,8}).
 *
 * Usage:
 *   node scripts/sync-shell-assets.mjs          # update sw.js in place
 *   node scripts/sync-shell-assets.mjs --check  # verify sync without editing
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const htmlPath = resolve(root, 'index.html');
const swPath = resolve(root, 'sw.js');
const checkOnly = process.argv.includes('--check');

const html = readFileSync(htmlPath, 'utf8');

const rawResources = [
  ...html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)="([^"]+)"/g)
]
  .map(match => match[1])
  .filter(url => !url.startsWith('https:') && !url.startsWith('http:') && !url.includes('${'));

const uniqueLocalResources = [];
const seen = new Set();
for (const res of rawResources) {
  const normalized = `./${res.replace(/^\.\//, '')}`;
  if (!seen.has(normalized)) {
    seen.add(normalized);
    uniqueLocalResources.push(normalized);
  }
}

// Preserve order: core shell files + HTML resources (excluding wordbanks/assets.js which is spread explicitly)
const localAssets = ['./', './index.html'];
for (const asset of uniqueLocalResources) {
  if (!localAssets.includes(asset)) {
    localAssets.push(asset);
  }
}

// Network-first assets exclude static images and data.js/english-data.js stubs, keeping dynamic shell code fresh
const STATIC_CACHE_FIRST_SKIP = new Set(['./', './logo.png', './data.js', './english-data.js']);
const networkFirstAssets = localAssets.filter(asset => !STATIC_CACHE_FIRST_SKIP.has(asset));

const formatLocalBlock = () => {
  const lines = [];
  for (const asset of localAssets) {
    lines.push(`  '${asset}',`);
    if (asset === './wordbanks/assets.js') {
      lines.push('  ...self.ZhongriWordbankAssets.WORD_BANK_ASSETS.filter(');
      lines.push("    asset => asset !== './wordbanks/assets.js'");
      lines.push('  ),');
    }
  }
  if (lines.length > 0 && lines[lines.length - 1].endsWith(',')) {
    lines[lines.length - 1] = lines[lines.length - 1].slice(0, -1);
  }
  return `// @sync-shell-assets:local:start\n${lines.join('\n')}\n  // @sync-shell-assets:local:end`;
};

const formatNetworkFirstBlock = () => {
  const lines = networkFirstAssets.map((asset, index) => {
    const comma = index < networkFirstAssets.length - 1 ? ',' : '';
    return `  '${asset}'${comma}`;
  });
  return `// @sync-shell-assets:network-first:start\n${lines.join('\n')}\n  // @sync-shell-assets:network-first:end`;
};

const swContent = readFileSync(swPath, 'utf8');
const localPattern = /\/\/ @sync-shell-assets:local:start[\s\S]*?\/\/ @sync-shell-assets:local:end/;
const netPattern = /\/\/ @sync-shell-assets:network-first:start[\s\S]*?\/\/ @sync-shell-assets:network-first:end/;

if (!localPattern.test(swContent) || !netPattern.test(swContent)) {
  console.error('sw.js 缺少 @sync-shell-assets 标记块，无法自动同步。');
  process.exit(1);
}

const nextSwContent = swContent
  .replace(localPattern, formatLocalBlock())
  .replace(netPattern, formatNetworkFirstBlock());

if (checkOnly) {
  if (nextSwContent !== swContent) {
    console.error('sw.js 资产清单与 index.html 不同步，请运行: npm run sync:assets');
    process.exit(1);
  }
  console.log(`sw.js 资产清单校验通过：共 ${localAssets.length} 项本地资源与 index.html 完全一致`);
  process.exit(0);
}

if (nextSwContent !== swContent) {
  writeFileSync(swPath, nextSwContent, 'utf8');
  console.log(`已自动同步 sw.js 资产清单（共 ${localAssets.length} 项本地资源）`);
} else {
  console.log(`sw.js 资产清单已是最新（共 ${localAssets.length} 项本地资源）`);
}
