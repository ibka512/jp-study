import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * 状态栏适配：让安卓状态栏使用深色图标（应用背景是浅色），
 * 并让状态栏区域与应用顶部的米色背景融为一体。
 * 只修改自动生成的安卓工程。模板结构变化时直接失败，避免生成一个
 * 看似成功、实际没有应用主题修复的 APK。
 */

const root = resolve(import.meta.dirname, '..');
const stylesPath = resolve(root, 'android/app/src/main/res/values/styles.xml');
const RUNTIME_MARKER = 'zhongri-system-bars-runtime';
const LAUNCH_MARKER = 'zhongri-system-bars-launch';
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let content;
try {
  content = await readFile(stylesPath, 'utf8');
} catch {
  throw new Error('未找到安卓主题文件，无法完成状态栏适配');
}

if (content.includes(RUNTIME_MARKER) && content.includes(LAUNCH_MARKER)) {
  console.log('状态栏适配已存在，跳过');
  process.exit(0);
}

const insertIntoStyle = (source, styleName, marker) => {
  if (source.includes(marker)) return source;
  const pattern = new RegExp(
    `<style\\s+name="${escapeRegExp(styleName)}"[^>]*>`
  );
  const match = source.match(pattern);
  if (!match) {
    throw new Error(`未找到 ${styleName} 主题，Capacitor 模板可能已变化`);
  }
  const insert =
  `\n        <!-- ${marker} -->` +
  `\n        <item name="android:windowLightStatusBar">true</item>` +
  `\n        <item name="android:statusBarColor">#f1ece4</item>` +
  `\n        <item name="android:navigationBarColor">#f1ece4</item>` +
  `\n        <item name="android:windowLightNavigationBar">true</item>`;
  return source.replace(match[0], match[0] + insert);
};

content = insertIntoStyle(content, 'AppTheme.NoActionBar', RUNTIME_MARKER);
content = insertIntoStyle(content, 'AppTheme.NoActionBarLaunch', LAUNCH_MARKER);
await writeFile(stylesPath, content);
console.log('已写入运行期与启动期系统栏主题');
