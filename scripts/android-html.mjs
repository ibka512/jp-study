export const FONT_LINK_TAGS = [
  '<link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;700;800&family=Noto+Serif+JP:wght@600;900&family=Nunito:wght@700;800&display=swap" rel="stylesheet">',
  '<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0" rel="stylesheet" />'
];
const LOCAL_FONTS_TAG = '<link href="vendor/fonts/fonts.css" rel="stylesheet">';

export const IDB_KEYVAL_REMOTE_URL =
  'https://cdn.jsdelivr.net/npm/idb-keyval@6.2.2/dist/umd.js';
export const IDB_KEYVAL_SHA384 =
  'WotV0hDwz0BelkTLz9FqRezk+eN54lVOKmyOw6HIcWwvJIu8unb2UFl4mE2Ssfxw';
const IDB_KEYVAL_REMOTE_TAG = `<script
  src="${IDB_KEYVAL_REMOTE_URL}"
  integrity="sha384-${IDB_KEYVAL_SHA384}"
  crossorigin="anonymous"
></script>`;
const IDB_KEYVAL_LOCAL_TAG = '<script src="vendor/idb-keyval.umd.js"></script>';

const VIEWPORT_REMOTE = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
const VIEWPORT_NATIVE = '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">';

const replaceOnce = (text, search, replacement, label) => {
  if (!text.includes(search)) {
    throw new Error(`未找到「${label}」的原始写法，无法安全生成 Android 资源`);
  }
  return text.replace(search, replacement);
};

/** Adapt the current HTML before performing any external downloads. */
export const adaptAndroidHtml = source => {
  let html = replaceOnce(source, FONT_LINK_TAGS[0], LOCAL_FONTS_TAG, '界面字体');
  // Icons are bundled for the website and already copied into the native bundle.
  if (html.includes(FONT_LINK_TAGS[1])) {
    html = html.replace(FONT_LINK_TAGS[1], '<link rel="stylesheet" href="vendor/material-symbols.css">');
  }
  if (!html.includes('href="vendor/material-symbols.css"')) {
    throw new Error('缺少本地图标字体入口，无法安全生成 Android 资源');
  }
  html = replaceOnce(html, IDB_KEYVAL_REMOTE_TAG, IDB_KEYVAL_LOCAL_TAG, 'idb-keyval');
  // 网页端用 preconnect 抢跑跨域握手；离线包不发这些请求，直接去掉。
  html = html.replace(/[ \t]*<link\b[^>]*\brel=["']preconnect["'][^>]*>\s*\n?/g, '');
  // Web and native now share safe-area support; retain older HTML compatibility.
  if (!html.includes(VIEWPORT_NATIVE)) {
    html = replaceOnce(html, VIEWPORT_REMOTE, VIEWPORT_NATIVE, '全屏视口');
  }

  const styles = [...html.matchAll(/<link\b[^>]*\bhref=(["'])(?:\.\/)?style\.css(?:\?[^"']*)?\1[^>]*>/g)];
  if (styles.length !== 1) {
    throw new Error('必须有且只有一个 style.css 链接，无法安全注入原生样式表');
  }
  html = html.replace(styles[0][0], `${styles[0][0]}\n<link rel="stylesheet" href="native-app.css">`);
  if (/fonts\.googleapis\.com|cdn\.jsdelivr\.net\/npm\/idb-keyval/.test(html)) {
    throw new Error('Android 首页仍包含必须本地化的远程运行时资源');
  }
  return html;
};
