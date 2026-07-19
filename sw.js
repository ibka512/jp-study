importScripts('./wordbanks/assets.js');

const CACHE_NAME = 'zhongri-wordbank-8efadd87a042';
const LOCAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './style.css',
  './data.js',
  './english-data.js',
  ...WORD_BANK_ASSETS,
  './rote-learning-core.js',
  './app.js'
];

const OPTIONAL_EXTERNAL_ASSETS = [
  'https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js',
  'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@600;900&family=Noto+Sans+JP:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0'
];

// 安装并强制缓存
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await cache.addAll(LOCAL_ASSETS);

      await Promise.allSettled(
        OPTIONAL_EXTERNAL_ASSETS.map(asset => cache.add(asset))
      );
    })
  );
  self.skipWaiting();
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
  self.clients.claim().then(() => {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'SW_UPDATED' });
      });
    });
  });
});

// 拦截请求并动态缓存外部 CDN 资源
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) { return cachedResponse; }
      
      const fetchRequest = event.request.clone();
      return fetch(fetchRequest).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
          return networkResponse;
        }

        let responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          const url = new URL(event.request.url);
          const isSameOrigin = url.origin === location.origin;
          const isAllowedCDN = url.hostname.includes('cdn.jsdelivr.net') || 
                     url.hostname.includes('fonts.googleapis.com') || 
                     url.hostname.includes('fonts.gstatic.com'); 

          if (event.request.method === 'GET' && 
              !event.request.url.startsWith('chrome-extension') && 
              (isSameOrigin || isAllowedCDN)) {
            cache.put(event.request, responseToCache);
          }
        });

        return networkResponse;
      }).catch(() => {
        console.log('网络断开，且未找到缓存资源');
        return new Response('离线模式无法获取此资源', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});
