import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * 状态栏适配：让安卓状态栏使用深色图标（应用背景是浅色），
 * 并让状态栏区域与应用顶部的米色背景融为一体。
 * 只修改自动生成的安卓工程，找不到目标时只警告、不中断构建。
 */

const root = resolve(import.meta.dirname, '..');
const stylesPath = resolve(root, 'android/app/src/main/res/values/styles.xml');
const MARKER = 'zhongri-statusbar-fit';

let content;
try {
  content = await readFile(stylesPath, 'utf8');
} catch {
  console.warn('未找到安卓主题文件，跳过状态栏适配');
  process.exit(0);
}

if (content.includes(MARKER)) {
  console.log('状态栏适配已存在，跳过');
  process.exit(0);
}

const appThemeMatch = content.match(/<style\s+name="AppTheme"[^>]*>/);
if (!appThemeMatch) {
  console.warn('未找到 AppTheme 主题，跳过状态栏适配');
  process.exit(0);
}

const insert =
  `\n        <!-- ${MARKER} -->` +
  `\n        <item name="android:windowLightStatusBar">true</item>` +
  `\n        <item name="android:statusBarColor">#f1ece4</item>`;

content = content.replace(appThemeMatch[0], appThemeMatch[0] + insert);
await writeFile(stylesPath, content);
console.log('已写入状态栏适配（深色图标 + 米色状态栏）');
