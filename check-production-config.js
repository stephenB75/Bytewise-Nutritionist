// Check what configuration is actually embedded in production build
const fs = require('fs');

console.log('🔍 Checking Production Build Configuration');
console.log('==========================================');

// Check if main bundle exists
const bundlePath = 'dist/public/assets/index-Cs2qUUen.js';
if (!fs.existsSync(bundlePath)) {
    console.log('❌ Production bundle not found');
    process.exit(1);
}

console.log('✅ Production bundle found');

// Read bundle and check for configuration
const bundle = fs.readFileSync(bundlePath, 'utf8');

// Check for Supabase configuration
const hasSupabaseUrl = bundle.includes('ykgqcftrfvjblmqzbqvr.supabase.co');
const hasSupabaseKey = bundle.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
const hasUsdaKey = bundle.includes('z4YPCZm0HAL1SLXe9sRhXXRG8meDjQDBkGqE7hqY');

console.log('Configuration Check:');
console.log('✅ Supabase URL embedded:', hasSupabaseUrl);
console.log('✅ Supabase Key embedded:', hasSupabaseKey);
console.log('✅ USDA API Key embedded:', hasUsdaKey);

// Check for error handling
const hasErrorHandling = bundle.includes('console.error') || bundle.includes('catch');
const hasConfigFallback = bundle.includes('FALLBACK_CONFIG');

console.log('✅ Error handling present:', hasErrorHandling);
console.log('✅ Config fallback present:', hasConfigFallback);

// Check bundle size
const sizeKB = Math.round(bundle.length / 1024);
console.log(`📦 Bundle size: ${sizeKB}KB`);

if (hasSupabaseUrl && hasSupabaseKey && hasUsdaKey) {
    console.log('✅ Production configuration is properly embedded');
} else {
    console.log('❌ Production configuration missing');
}

console.log('\n🌐 Testing HTML file...');
const htmlPath = 'dist/public/index.html';
const html = fs.readFileSync(htmlPath, 'utf8');

if (html.includes('ByteWise')) {
    console.log('✅ HTML file contains app title');
} else {
    console.log('❌ HTML file missing app title');
}

if (html.includes('index-Cs2qUUen.js')) {
    console.log('✅ HTML references correct JS bundle');
} else {
    console.log('❌ HTML bundle reference incorrect');
}