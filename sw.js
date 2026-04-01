const CACHE_NAME = 'pendulum-v19';  // 版本升级，确保旧缓存被清除
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './style.css',
  './data.js',
  './app.js'
];

// 离线时显示的简单 HTML 页面（作为 fallback）
const OFFLINE_PAGE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
<title>钟摆日语 - 离线提示</title>
<style>
  body {
    font-family: system-ui, -apple-system, "PingFang SC", sans-serif;
    background: #faf9f7;
    color: #1e1b18;
    text-align: center;
    padding: 2rem;
    margin: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 100vh;
  }
  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  p {
    opacity: 0.7;
    margin-bottom: 2rem;
  }
  button {
    background: #8b7967;
    color: white;
    border: none;
    border-radius: 28px;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0,0,0,0.12);
  }
  button:active {
    transform: scale(0.96);
  }
</style>
</head>
<body>
<div class="icon">📴</div>
<h1>当前无网络连接</h1>
<p>请检查网络后刷新页面，或尝试重新打开应用。</p>
<button onclick="location.reload()">重新加载</button>
</body>
</html>`;

// 安装并强制缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 使用 addAll 同时缓存所有指定资源
      return cache.addAll(ASSETS).catch(err => {
        console.warn('缓存部分资源失败', err);
        // 即使部分失败，也尝试继续
      });
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

// 核心：拦截请求并动态缓存外部资源，支持离线回退
self.addEventListener('fetch', (event) => {
  // 仅处理 GET 请求，忽略非 GET 方法（如 POST）
  if (event.request.method !== 'GET') {
    return;
  }

  // 对于浏览器扩展或非 HTTP 请求，直接放行
  const url = new URL(event.request.url);
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 如果缓存中有响应，直接返回（快速响应）
      if (cachedResponse) {
        return cachedResponse;
      }

      // 否则发起网络请求
      return fetch(event.request).then((networkResponse) => {
        // 确保响应有效且状态为 200（成功），或者 304（未修改）也可以处理
        // 注意：304 响应没有 body，不能直接缓存，但我们可以认为它等同于缓存中的版本，这里不处理 304 的缓存
        if (networkResponse && networkResponse.status === 200) {
          // 克隆响应，因为响应流只能使用一次
          const responseToCache = networkResponse.clone();
          // 将新资源存入缓存（仅限于 GET 请求且不是浏览器扩展请求）
          caches.open(CACHE_NAME).then((cache) => {
            // 可以缓存跨域资源，但需要注意响应类型
            cache.put(event.request, responseToCache);
          }).catch(err => console.warn('缓存写入失败', err));
        }
        // 返回网络响应
        return networkResponse;
      }).catch(() => {
        // 网络请求失败（无网络），返回离线页面作为 fallback
        // 尝试匹配 index.html 或者直接返回离线提示页面
        return caches.match('./index.html').then(cachedIndex => {
          if (cachedIndex) {
            return cachedIndex;
          }
          // 如果没有缓存 index.html，返回一个简单的离线提示页面
          return new Response(OFFLINE_PAGE, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        });
      });
    })
  );
});
