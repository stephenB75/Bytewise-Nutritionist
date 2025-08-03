// PWA Test Script - Verify service worker and manifest
console.log('🔍 Testing PWA functionality...');

// Test 1: Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('✅ Service Worker registered:', registration.scope);
      
      // Test cache functionality
      caches.keys().then(cacheNames => {
        console.log('📦 Available caches:', cacheNames);
      });
    })
    .catch(error => {
      console.error('❌ Service Worker registration failed:', error);
    });
} else {
  console.log('❌ Service Worker not supported');
}

// Test 2: Manifest Validation
fetch('/manifest.json')
  .then(response => response.json())
  .then(manifest => {
    console.log('✅ Manifest loaded:', manifest.name);
    
    // Validate required fields
    const required = ['name', 'start_url', 'display', 'icons'];
    const missing = required.filter(field => !manifest[field]);
    
    if (missing.length === 0) {
      console.log('✅ Manifest is valid');
    } else {
      console.warn('⚠️ Missing manifest fields:', missing);
    }
  })
  .catch(error => {
    console.error('❌ Manifest load failed:', error);
  });

// Test 3: Install Prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('✅ Install prompt available');
  deferredPrompt = e;
});

// Test 4: App Installation Status
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('✅ App is installed and running in standalone mode');
} else {
  console.log('ℹ️ App is running in browser mode');
}

// Test 5: Offline Capability
window.addEventListener('online', () => console.log('🌐 Back online'));
window.addEventListener('offline', () => console.log('📱 Offline mode active'));

console.log('🏁 PWA tests completed');