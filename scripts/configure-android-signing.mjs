import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * 发布签名配置：为自动生成的安卓工程追加签名设置。
 * 密钥库路径与密码全部通过环境变量读取，不会写入任何文件，
 * 也不会进入代码仓库。
 */

const root = resolve(import.meta.dirname, '..');
const gradlePath = resolve(root, 'android/app/build.gradle');
const MARKER = 'zhongri-release-signing';

let content;
try {
  content = await readFile(gradlePath, 'utf8');
} catch {
  console.warn('未找到安卓构建文件，跳过发布签名配置');
  process.exit(0);
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
            release {
                signingConfig signingConfigs.release
            }
        }
    }
}
`;

await writeFile(gradlePath, content + block);
console.log('已追加发布签名配置（密钥信息仅从环境变量读取）');
