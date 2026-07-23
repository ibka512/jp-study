import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');

const runtimeEntries = [
  'index.html',
  'manifest.json',
  'logo.png',
  'style.css',
  'ui-system.css',
  'native-app.css',
  'sw.js',
  'data.js',
  'english-data.js',
  'wordbank-loader.js',
  'release-info.js',
  'core-utils.js',
  'haptics.js',
  'rote-learning-core.js',
  'fsrs-scheduler.js',
  'notification-planner.js',
  'app.js',
  'native-app.js',
  'root-review.js',
  'vendor',
  'wordbanks',
  'reports'
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of runtimeEntries) {
  await cp(resolve(root, entry), resolve(dist, entry), {
    recursive: true
  });
}

console.log('Capacitor Web 资源已生成到 dist/');
