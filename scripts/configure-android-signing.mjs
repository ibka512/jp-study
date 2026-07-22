import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * 稳定签名配置：为自动生成的安卓工程追加签名设置。
 * 密钥库路径与密码全部通过环境变量读取，不会写入任何文件，
 * 也不会进入代码仓库。Debug 与 Release 使用同一个持久密钥，确保
 * GitHub 产物之间可以覆盖安装。
 */

const root = resolve(import.meta.dirname, '..');
const gradlePath = resolve(root, 'android/app/build.gradle');
const MARKER = 'zhongri-release-signing';
const REQUIRED_ENV = [
  'ANDROID_KEYSTORE_PATH',
  'ANDROID_KEYSTORE_PASSWORD',
  'ANDROID_KEY_ALIAS',
  'ANDROID_KEY_PASSWORD'
];

const missing = REQUIRED_ENV.filter(name => !process.env[name]);
if (missing.length) {
  throw new Error(`缺少 Android 签名环境变量：${missing.join(', ')}`);
}

let content;
try {
  content = await readFile(gradlePath, 'utf8');
} catch {
  throw new Error('未找到安卓构建文件，无法配置发布签名');
}

if (content.includes(MARKER)) {
  console.log('发布签名配置已存在，跳过');
  process.exit(0);
}

const block = `

// === ${MARKER}（由云端构建自动追加，请勿手动修改） ===
if (System.getenv('ANDROID_KEYSTORE_PATH')) {
    android {
        signingConfigs {
            release {
                storeFile file(System.getenv('ANDROID_KEYSTORE_PATH'))
                storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD')
                keyAlias System.getenv('ANDROID_KEY_ALIAS')
                keyPassword System.getenv('ANDROID_KEY_PASSWORD')
            }
        }
        buildTypes {
            debug {
                signingConfig signingConfigs.release
            }
            release {
                signingConfig signingConfigs.release
            }
        }
    }
}
`;

await writeFile(gradlePath, content + block);
console.log('已为 Debug 与 Release 配置同一持久签名');
