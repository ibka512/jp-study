import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';

/**
 * 安卓打包适配（只修改 dist/ 输出，不碰网页版源码）：
 * 1. 把在线加载的界面字体、图标字体下载到本地，APK 离线也能正常显示；
 * 2. 把在线加载的 idb-keyval 下载到本地，APK 首次离线打开也能运行；
 * 3. 注入全屏视口（viewport-fit=cover）与原生安全区样式，避免内容被状态栏挡住。
 *
 * 这些资源是 APK 离线可用性的必要条件；任何一步失败都会中断构建。
 */

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const indexPath = join(dist, 'index.html');

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const FONT_LINK_TAGS = [
  '<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@600;900&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">',
  '<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0" rel="stylesheet" />'
];
const LOCAL_FONTS_TAG = '<link href="vendor/fonts/fonts.css" rel="stylesheet">';

const IDB_KEYVAL_REMOTE_URL = 'https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js';
const IDB_KEYVAL_REMOTE_TAG = `<script src="${IDB_KEYVAL_REMOTE_URL}"></script>`;
const IDB_KEYVAL_LOCAL_TAG = '<script src="vendor/idb-keyval.umd.js"></script>';

const VIEWPORT_REMOTE = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
const VIEWPORT_NATIVE = '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">';

const STYLE_LINK = '<link rel="stylesheet" href="style.css?v=smart-reminder-v1">';
const STYLE_LINK_WITH_NATIVE = `${STYLE_LINK}\n<link rel="stylesheet" href="native-app.css">`;

const fetchChecked = async url => {
  const response = await fetch(url, { headers: { 'User-Agent': BROWSER_UA } });
  if (!response.ok) {
    throw new Error(`下载失败（${response.status}）：${url}`);
  }
  return response;
};

const replaceOnce = (text, search, replacement, label) => {
  if (!text.includes(search)) {
    throw new Error(`未找到「${label}」的原始写法，无法安全生成 Android 资源`);
  }
  return text.replace(search, replacement);
};

const localizeFonts = async () => {
  const fontsDir = join(dist, 'vendor', 'fonts');
  await mkdir(fontsDir, { recursive: true });

  let totalBytes = 0;
  let fileCount = 0;
  const cssParts = [];

  for (const tag of FONT_LINK_TAGS) {
    const stylesheetUrl = tag.match(/href="([^"]+)"/)[1];
    const cssText = await (await fetchChecked(stylesheetUrl)).text();
    const fontUrls = [
      ...new Set(
        [...cssText.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)]
          .map(match => match[1])
      )
    ];
    if (!fontUrls.length) {
      throw new Error(`字体样式表没有返回可下载的字体文件：${stylesheetUrl}`);
    }

    let rewritten = cssText;
    for (const fontUrl of fontUrls) {
      const buffer = Buffer.from(await (await fetchChecked(fontUrl)).arrayBuffer());
      const fileName = `font-${createHash('sha1').update(fontUrl).digest('hex').slice(0, 10)}.woff2`;
      await writeFile(join(fontsDir, fileName), buffer);
      rewritten = rewritten.split(fontUrl).join(fileName);
      totalBytes += buffer.length;
      fileCount += 1;
    }
    cssParts.push(rewritten);
  }

  await writeFile(join(fontsDir, 'fonts.css'), cssParts.join('\n'));
  return { fileCount, totalBytes };
};

const localizeIdbKeyval = async () => {
  const buffer = Buffer.from(await (await fetchChecked(IDB_KEYVAL_REMOTE_URL)).arrayBuffer());
  await mkdir(join(dist, 'vendor'), { recursive: true });
  await writeFile(join(dist, 'vendor', 'idb-keyval.umd.js'), buffer);
  return buffer.length;
};

let html = await readFile(indexPath, 'utf8');

const { fileCount, totalBytes } = await localizeFonts();
html = replaceOnce(html, FONT_LINK_TAGS[0], LOCAL_FONTS_TAG, '界面字体');
html = replaceOnce(html, FONT_LINK_TAGS[1], '', '图标字体');
console.log(`字体已内置：${fileCount} 个字体文件，约 ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);

const size = await localizeIdbKeyval();
html = replaceOnce(html, IDB_KEYVAL_REMOTE_TAG, IDB_KEYVAL_LOCAL_TAG, 'idb-keyval');
console.log(`idb-keyval 已内置（${(size / 1024).toFixed(1)} KB）`);

html = replaceOnce(html, VIEWPORT_REMOTE, VIEWPORT_NATIVE, '全屏视口');
html = replaceOnce(html, STYLE_LINK, STYLE_LINK_WITH_NATIVE, '原生样式表');

if (/fonts\.googleapis\.com|cdn\.jsdelivr\.net\/npm\/idb-keyval/.test(html)) {
  throw new Error('Android 首页仍包含必须本地化的远程运行时资源');
}

await writeFile(indexPath, html);
console.log('dist/ 安卓适配完成');
