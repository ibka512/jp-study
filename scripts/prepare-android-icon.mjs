import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

// 说明：sharp 由 @capacitor/assets 自带（其内部依赖），无需单独声明安装。

await mkdir('assets', { recursive: true });

// 传统图标：Logo 放在米色底上
await sharp('logo.png')
  .resize(1024, 1024, {
    fit: 'contain',
    background: '#f8f3ea',
    kernel: sharp.kernel.lanczos3
  })
  .png({ compressionLevel: 9 })
  .toFile('assets/icon-only.png');

// 自适应图标前景：透明底，Logo 缩小到安全区内
const foregroundLogo = await sharp('logo.png')
  .resize(660, 660, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    kernel: sharp.kernel.lanczos3
  })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: 1024,
    height: 1024,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  }
})
  .composite([{ input: foregroundLogo, gravity: 'center' }])
  .png()
  .toFile('assets/icon-foreground.png');

// 自适应图标背景：与图标底色一致的纯色
await sharp({
  create: { width: 1024, height: 1024, channels: 3, background: '#f8f3ea' }
})
  .png()
  .toFile('assets/icon-background.png');

// 启动画面：米色底（与应用背景一致）+ 居中 Logo
const splashLogo = await sharp('logo.png')
  .resize(900, 900, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    kernel: sharp.kernel.lanczos3
  })
  .png()
  .toBuffer();

await sharp({
  create: { width: 2732, height: 2732, channels: 3, background: '#f1ece4' }
})
  .composite([{ input: splashLogo, gravity: 'center' }])
  .png({ compressionLevel: 9 })
  .toFile('assets/splash.png');

const metadata = await sharp('assets/icon-only.png').metadata();
if (metadata.width !== 1024 || metadata.height !== 1024) {
  throw new Error('Android 图标未生成到 1024×1024');
}

console.log('Android 图标与启动画面源文件已准备（图标 1024×1024 / 启动画面 2732×2732）');
