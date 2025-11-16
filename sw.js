const CACHE_NAME = 'hera-wishlist-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  // add icons if present
  './https://files.catbox.moe/d5zlzh.jpg',
  './https://files.catbox.moe/d5zlzh.jpg'
];

// install
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(()=> self.skipWaiting())
  );
});

// activate
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      if(k !== CACHE_NAME) return caches.delete(k);
    }))).then(()=> self.clients.claim())
  );
});

// fetch strategy: cache-first for app assets, network fallback
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(resp => {
        // optionally cache new GET responses (only basic)
        return resp;
      }).catch(()=> {
        // fallback for navigation requests: serve index.html from cache
        if(e.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
