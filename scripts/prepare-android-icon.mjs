import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

await mkdir('assets', { recursive: true });

await sharp('logo.png')
  .resize(1024, 1024, {
    fit: 'contain',
    background: '#f8f3ea',
    kernel: sharp.kernel.lanczos3
  })
  .png({ compressionLevel: 9 })
  .toFile('assets/icon-only.png');

const metadata = await sharp('assets/icon-only.png').metadata();
if (metadata.width !== 1024 || metadata.height !== 1024) {
  throw new Error('Android 图标未生成到 1024×1024');
}

console.log('Android 图标源文件已准备：1024×1024');
