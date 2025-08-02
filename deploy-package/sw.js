// ByteWise PWA Service Worker
const CACHE_NAME = 'bytewise-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).catch(() => {
          // If both cache and network fail, show offline page
          if (event.request.destination === 'document') {
            return caches.match('./offline.html');
          }
        });
      })
  );
});