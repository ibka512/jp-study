const CACHE_NAME = 'pendulum-v77'; // 建议更新缓存版本号
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './style.css',
  './data.js',
  './app.js',
  // 🚀 修复点：强制预缓存核心数据库依赖，防止首次离线时应用崩溃
  'https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js'
];

// 安装并强制缓存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // 强制跳过等待，立即激活
});

// 激活并清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // 立即接管页面
});

// 核心：拦截请求并动态缓存外部 CDN 资源
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 1. 如果缓存里有，直接秒开返回（包括断网时）
      if (response) {
        return response;
      }
      
      // 2. 如果缓存没有，就走网络请求
      let fetchRequest = event.request.clone();
      return fetch(fetchRequest).then((networkResponse) => {
        // 确保请求成功，并且是我们需要的资源（排除浏览器插件等请求）
        if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
          return networkResponse;
        }

        // 3. 把新请求到的外部字体、JS 存入缓存，下次断网就能用了
        let responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // 修改部分：严格限制动态缓存的范围
          const url = new URL(event.request.url);
          const isSameOrigin = url.origin === location.origin;
          const isAllowedCDN = url.hostname.includes('cdn.jsdelivr.net'); // 允许 MathJax 的 CDN

          // 注意：不要缓存 POST 请求或 Chrome 扩展程序的请求，且必须是同源或白名单CDN
          if (event.request.method === 'GET' && 
              !event.request.url.startsWith('chrome-extension') && 
              (isSameOrigin || isAllowedCDN)) {
            cache.put(event.request, responseToCache);
          }
        });

        return networkResponse;
      }).catch(() => {
        console.log('网络断开，且未找到缓存资源');
        // 🚀 修复点：增加兜底返回，防止断网且无缓存时浏览器直接抛出底层错误导致白屏或卡死
        return new Response('目前处于离线状态，且该资源未缓存。', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
        });
      });
    })
  );
});
