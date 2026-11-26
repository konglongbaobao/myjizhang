/* 我的记账本 · PWA 缓存
   页面采用「网络优先 + 缓存兜底」：每次启动先尝试拉取最新版页面，
   成功后写回缓存；离线或网络失败时才用缓存。避免手机端因旧缓存长期
   停留在旧版同步解析逻辑（曾导致「云端同步格式不正确」误报）。
   缓存版本随每次构建自动生成，旧缓存会在 activate 时清理。 */
'use strict';
const CACHE = 'ledger-static-mwxegevo';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e && e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 跨域（GitHub API 等）不拦截

  // 页面导航 / HTML：网络优先，保证手机端尽快拿到新版解析逻辑
  const isDoc = req.mode === 'navigate' || (req.headers && req.headers.get && /text\/html/.test(req.headers.get('accept') || ''));
  if (isDoc) {
    e.respondWith(
      fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy));
        }
        return res;
      }).catch(() => caches.match('./index.html').then(hit => hit || caches.match('./')))
    );
    return;
  }

  // 静态资源：缓存优先，缺失时联网补缓存
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }))
  );
});
