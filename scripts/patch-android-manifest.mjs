import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const manifestPath = resolve(root, 'android/app/src/main/AndroidManifest.xml');
const EXACT_ALARM_PERMISSION =
  '<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />';
const MARKER = 'zhongri-android-security';

let content;
try {
  content = await readFile(manifestPath, 'utf8');
} catch {
  throw new Error('未找到 AndroidManifest.xml，无法应用安全配置');
}

if (content.includes('android:allowBackup="true"')) {
  content = content.replace(
    'android:allowBackup="true"',
    'android:allowBackup="false"'
  );
} else if (!content.includes('android:allowBackup="false"')) {
  throw new Error('未找到 android:allowBackup，Capacitor 模板可能已变化');
}

if (!content.includes(EXACT_ALARM_PERMISSION)) {
  const closingTag = '</manifest>';
  if (!content.includes(closingTag)) {
    throw new Error('AndroidManifest.xml 缺少 </manifest>');
  }
  content = content.replace(
    closingTag,
    `    <!-- ${MARKER} -->\n    ${EXACT_ALARM_PERMISSION}\n${closingTag}`
  );
}

await writeFile(manifestPath, content);
console.log('已关闭系统自动备份并声明精确提醒权限');
