import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = path => readFile(resolve(root, path), 'utf8');
const [manifest, styles, gradle, html] = await Promise.all([
  read('android/app/src/main/AndroidManifest.xml'),
  read('android/app/src/main/res/values/styles.xml'),
  read('android/app/build.gradle'),
  read('android/app/src/main/assets/public/index.html')
]);

const requireMatch = (source, pattern, message) => {
  if (!pattern.test(source)) throw new Error(message);
};

requireMatch(manifest, /android:allowBackup="false"/, 'Android 自动备份仍处于开启状态');
requireMatch(
  manifest,
  /android\.permission\.SCHEDULE_EXACT_ALARM/,
  '缺少精确提醒权限'
);
requireMatch(styles, /zhongri-system-bars-runtime/, '运行期系统栏主题未应用');
requireMatch(styles, /zhongri-system-bars-launch/, '启动期系统栏主题未应用');
requireMatch(gradle, /versionCode\s+(?!1\b)\d+/, 'Android versionCode 没有更新');
requireMatch(gradle, /versionName\s+"(?!1\.0")/, 'Android versionName 没有更新');
requireMatch(html, /vendor\/fonts\/fonts\.css/, 'Android 包未使用本地字体');
requireMatch(html, /vendor\/idb-keyval\.umd\.js/, 'Android 包未使用本地 idb-keyval');

if (/fonts\.googleapis\.com|cdn\.jsdelivr\.net\/npm\/idb-keyval/.test(html)) {
  throw new Error('Android 首页仍包含必须本地化的远程资源');
}

if (process.env.REQUIRE_ANDROID_SIGNING === 'true') {
  requireMatch(gradle, /zhongri-release-signing/, '缺少持久 Android 签名配置');
  requireMatch(
    gradle,
    /debug\s*\{[\s\S]*?signingConfig\s+signingConfigs\.release/,
    'Debug APK 没有使用持久签名'
  );
}

console.log('Android 工程安全、版本、离线资源与签名检查通过');
