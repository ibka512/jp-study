importScripts('./wordbanks/assets.js');

const CACHE_PREFIX = 'zhongri-';
const CACHE_NAME = 'zhongri-shell-v3';
const LOCAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './style.css',
  './data.js',
  './english-data.js',
  ...WORD_BANK_ASSETS,
  './release-info.js',
  './core-utils.js',
  './haptics.js',
  './rote-learning-core.js',
  './app.js',
  './root-review.js'
];

const OPTIONAL_EXTERNAL_ASSETS = [
  'https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@600;900&family=Noto+Sans+JP:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0'
];

const toAbsoluteUrl = asset => new URL(asset, self.registration.scope).href;
const PRECACHE_URLS = new Set(LOCAL_ASSETS.map(toAbsoluteUrl));
const NETWORK_FIRST_ASSETS = new Set([
  './index.html',
  './manifest.json',
  './style.css',
  './release-info.js',
  './core-utils.js',
  './haptics.js',
  './rote-learning-core.js',
  './app.js',
  './root-review.js'
].map(toAbsoluteUrl));

const isCacheableResponse = response => {
  return Boolean(
    response &&
    response.status === 200 &&
    (response.type === 'basic' || response.type === 'cors')
  );
};

async function networkFirst(request, cacheKey = request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      await cache.put(cacheKey, response.clone());
    }
    return response;
  } catch (_error) {
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('离线模式无法获取此资源', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

async function staleWhileRevalidate(request, event) {
  const cachedResponse = await caches.match(request);

  const refresh = fetch(request).then(async response => {
    if (isCacheableResponse(response)) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  if (cachedResponse) {
    event.waitUntil(refresh);
    return cachedResponse;
  }

  const response = await refresh;
  if (response) {
    return response;
  }

  return new Response('离线模式无法获取此资源', {
    status: 503,
    statusText: 'Service Unavailable'
  });
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(LOCAL_ASSETS);
    await Promise.allSettled(
      OPTIONAL_EXTERNAL_ASSETS.map(asset => cache.add(asset))
    );
  })());
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const cacheKeys = await caches.keys();
    const staleZhongriCaches = cacheKeys.filter(key => {
      return key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME;
    });
    const hadPreviousVersion = staleZhongriCaches.length > 0;

    await Promise.all(
      staleZhongriCaches.map(key => caches.delete(key))
    );
    await self.clients.claim();

    if (hadPreviousVersion) {
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client => {
        client.postMessage({ type: 'SW_UPDATED' });
      });
    }
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isAllowedCDN =
    requestUrl.hostname === 'cdn.jsdelivr.net' ||
    requestUrl.hostname === 'fonts.googleapis.com' ||
    requestUrl.hostname === 'fonts.gstatic.com';

  if (event.request.mode === 'navigate') {
    const indexUrl = toAbsoluteUrl('./index.html');
    event.respondWith(networkFirst(event.request, indexUrl));
    return;
  }

  if (isSameOrigin && NETWORK_FIRST_ASSETS.has(requestUrl.href)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (isSameOrigin && PRECACHE_URLS.has(requestUrl.href)) {
    event.respondWith(staleWhileRevalidate(event.request, event));
    return;
  }

  if (isAllowedCDN) {
    event.respondWith(staleWhileRevalidate(event.request, event));
  }
});
