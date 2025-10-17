// Bytewise Nutrition Tracker - Service Worker
// Provides offline functionality and caching for PWA experience

const CACHE_NAME = 'bytewise-v1.2.0';
const STATIC_CACHE = 'bytewise-static-v1';
const DYNAMIC_CACHE = 'bytewise-dynamic-v1';
const API_CACHE = 'bytewise-api-v1';

// Critical resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg'
];

// API endpoints to cache for offline functionality
const API_ENDPOINTS = [
  '/api/auth/user',
  '/api/version',
  '/api/foods',
  '/api/usda/search'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch(err => {
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE && 
                     cacheName !== API_CACHE;
            })
            .map(cacheName => {
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static assets
  if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.endsWith(asset))) {
    event.respondWith(handleStaticRequest(request));
    return;
  }
  
  // Handle other requests (CSS, JS, images)
  event.respondWith(handleDynamicRequest(request));
});

// Cache-first strategy for static assets
async function handleStaticRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    
    // Return offline fallback for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Bytewise - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; color: #334155; }
            .offline { max-width: 400px; margin: 2rem auto; }
            .icon { font-size: 4rem; margin-bottom: 1rem; }
            .title { font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; }
            .message { margin-bottom: 2rem; color: #64748b; }
            .retry { background: #7dd3fc; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="offline">
            <div class="icon">🍎</div>
            <div class="title">Bytewise</div>
            <div class="message">You're offline. Please check your connection and try again.</div>
            <button class="retry" onclick="location.reload()">Retry</button>
          </div>
        </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    
    throw error;
  }
}

// Network-first strategy for API requests with fallback
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful API responses
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    
    // Try to return cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline indicator for critical API calls
    if (request.url.includes('/api/auth/user')) {
      return new Response(JSON.stringify({ offline: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Stale-while-revalidate strategy for dynamic content
async function handleDynamicRequest(request) {
  // Skip caching for non-http requests (chrome-extension, etc.)
  if (!request.url.startsWith('http')) {
    return fetch(request);
  }
  
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    // Only cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Handle background sync for offline actions
self.addEventListener('sync', event => {
  
  if (event.tag === 'meal-sync') {
    event.waitUntil(syncOfflineMeals());
  }
});

// Sync offline meal logs when connection is restored
async function syncOfflineMeals() {
  try {
    // Get offline meal data from IndexedDB if implemented
    // Implementation would depend on offline storage strategy
  } catch (error) {
  }
}

// Handle push notifications (future enhancement)
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'New nutrition insight available!',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    tag: 'bytewise-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Bytewise', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

