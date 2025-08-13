/**
 * ByteWise Service Worker
 * 
 * Handles offline functionality, caching, and background sync
 * Optimized for iOS PWA installation
 */

const CACHE_NAME = 'bytewise-v1.2.4';
const STATIC_CACHE = 'bytewise-static-v1.2.4';
const DYNAMIC_CACHE = 'bytewise-dynamic-v1.2.4';
const API_CACHE = 'bytewise-api-v1.2.4';

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  // Add critical CSS and JS files here when available
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/user/profile',
  '/api/meals/recent',
  '/api/nutrition/usda'
];

// URL validation function
function isValidCacheableRequest(request) {
  try {
    const url = new URL(request.url);
    
    // Block chrome-extension and similar schemes
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }
    
    // Block extension URLs
    if (url.href.includes('extension') || 
        url.href.includes('chrome://') ||
        url.href.includes('moz://')) {
      return false;
    }
    
    // Only allow same origin or known trusted domains
    const trustedDomains = [
      self.location.hostname,
      'bytewisenutritionist.com',
      'supabase.co',
      'localhost'
    ];
    
    return trustedDomains.some(domain => 
      url.hostname === domain || url.hostname.endsWith('.' + domain)
    );
  } catch (error) {
    return false;
  }
}

// Install event - cache static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_FILES);
      }),
      caches.open(API_CACHE).then((cache) => {
        return Promise.resolve();
      })
    ])
  );
  
  // Force activation of new service worker
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== API_CACHE &&
              cacheName.startsWith('bytewise-')) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients
  return self.clients.claim();
});

// Fetch event - handle requests with caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Parse URL safely and immediately filter problematic requests
  let url;
  try {
    url = new URL(request.url);
    
    // Immediately skip any non-http/https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return;
    }
    
    // Skip all extension-related requests before they reach the cache
    if (url.protocol.includes('chrome-extension') || 
        url.protocol.includes('moz-extension') ||
        url.href.includes('chrome-extension') ||
        url.href.includes('moz-extension') ||
        url.href.includes('extension') ||
        url.hostname.includes('extension')) {
      return;
    }
    
  } catch (error) {
    // Skip invalid URLs completely
    return;
  }
  
  // Skip external domains (fonts, CDNs, APIs)
  const externalDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com', 
    'cdn.jsdelivr.net',
    'api.stripe.com',
    'js.stripe.com'
  ];
  
  if (externalDomains.some(domain => url.hostname.includes(domain))) {
    return;
  }
  
  // Additional safety check - only handle same-origin requests or known safe domains
  if (url.origin !== self.location.origin && 
      !url.hostname.includes('bytewisenutritionist.com') &&
      !url.hostname.includes('supabase.co') &&
      !url.hostname.includes('localhost')) {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  // Additional safety check - silently skip extension requests
  if (request.url.includes('chrome-extension') || 
      request.url.includes('moz-extension') ||
      request.url.includes('extension') ||
      !request.url.startsWith('http')) {
    // Skip silently to prevent console errors
    return fetch(request).catch(() => new Response('', { status: 204 }));
  }
  
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Static files - Cache First
    if (STATIC_FILES.some(file => url.pathname === file || url.pathname.endsWith(file))) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 2: API requests - Network First with fallback
    if (url.pathname.startsWith('/api/')) {
      return await networkFirstWithFallback(request, API_CACHE);
    }
    
    // Strategy 3: Images and assets - Cache First
    if (request.destination === 'image' || 
        url.pathname.includes('/icons/') ||
        url.pathname.includes('/screenshots/') ||
        url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
      return await cacheFirst(request, DYNAMIC_CACHE);
    }
    
    // Strategy 4: Other requests - Network First
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('[SW] Fetch error:', error);
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      const cache = await caches.open(STATIC_CACHE);
      return await cache.match('/') || new Response('Offline', { status: 503 });
    }
    
    return new Response('Network Error', { 
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Cache First strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }
  
  console.log('[SW] Cache miss, fetching:', request.url);
  const response = await fetch(request);
  
  if (response.ok && isValidCacheableRequest(request)) {
    try {
      cache.put(request, response.clone());
    } catch (error) {
      console.log('[SW] Failed to cache request (unsupported scheme):', request.url);
    }
  }
  
  return response;
}

// Network First strategy
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response.ok && isValidCacheableRequest(request)) {
      const cache = await caches.open(cacheName);
      try {
        cache.put(request, response.clone());
      } catch (error) {
        console.log('[SW] Failed to cache request (unsupported scheme):', request.url);
      }
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

// Network First with intelligent fallback for API requests
async function networkFirstWithFallback(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response.ok && isValidCacheableRequest(request)) {
      const cache = await caches.open(cacheName);
      try {
        cache.put(request, response.clone());
      } catch (error) {
        console.log('[SW] Failed to cache request (unsupported scheme):', request.url);
      }
      return response;
    }
    
    // If network response is not ok, try cache
    throw new Error(`HTTP ${response.status}`);
    
  } catch (error) {
    console.log('[SW] API network failed, trying cache:', request.url);
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      console.log('[SW] Returning cached API response');
      return cached;
    }
    
    // Return meaningful offline response for API requests
    return new Response(JSON.stringify({
      error: 'offline',
      message: 'Data not available offline',
      cached: false
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Background sync for meal logging
self.addEventListener('sync', (event) => {
  if (event.tag === 'meal-sync') {
    console.log('[SW] Background sync: meal-sync');
    event.waitUntil(syncMealData());
  }
});

async function syncMealData() {
  try {
    // Get pending meal data from IndexedDB or localStorage
    const pendingMeals = await getPendingMeals();
    
    for (const meal of pendingMeals) {
      try {
        const response = await fetch('/api/meals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(meal)
        });
        
        if (response.ok) {
          await removePendingMeal(meal.id);
          console.log('[SW] Synced meal:', meal.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync meal:', meal.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Helper functions for background sync
async function getPendingMeals() {
  // This would integrate with your actual storage solution
  return [];
}

async function removePendingMeal(mealId) {
  // This would remove the meal from your storage
  console.log('[SW] Removing synced meal:', mealId);
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received');
  
  const options = {
    body: event.data ? event.data.text() : 'Time to log your meal!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'meal-reminder',
    renotify: true,
    actions: [
      {
        action: 'log',
        title: 'Log Meal',
        icon: '/icons/action-log.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('ByteWise Reminder', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'log') {
    event.waitUntil(
      clients.openWindow('/calculator')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[SW] ByteWise Service Worker loaded successfully');