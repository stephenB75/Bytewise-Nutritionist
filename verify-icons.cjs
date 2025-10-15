/**
 * Icon Verification Script
 * Tests if all app icons are loading properly and provides detailed feedback
 */

const fs = require('fs');
const path = require('path');

console.log('=== BYTEWISE NUTRITIONIST ICON VERIFICATION ===\n');

// Required icon files for PWA
const requiredIcons = [
  { file: 'public/favicon.ico', description: 'Browser favicon' },
  { file: 'public/icon-192.png', description: 'PWA icon 192x192' },
  { file: 'public/icon-512.png', description: 'PWA icon 512x512' },
  { file: 'public/apple-touch-icon.png', description: 'iOS home screen icon' },
  { file: 'public/apple-icon.png', description: 'iOS app icon' },
  { file: 'manifest.json', description: 'PWA manifest file' }
];

// Check file existence and permissions
console.log('1. CHECKING ICON FILE EXISTENCE AND PERMISSIONS:\n');

let allIconsPresent = true;
requiredIcons.forEach(icon => {
  try {
    const stats = fs.statSync(icon.file);
    const permissions = stats.mode.toString(8).slice(-3);
    console.log(`✅ ${icon.file} - ${icon.description}`);
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB | Permissions: ${permissions}\n`);
  } catch (error) {
    console.log(`❌ ${icon.file} - ${icon.description}`);
    console.log(`   ERROR: ${error.message}\n`);
    allIconsPresent = false;
  }
});

// Check manifest.json configuration
console.log('2. CHECKING MANIFEST.JSON CONFIGURATION:\n');

try {
  const manifestContent = fs.readFileSync('manifest.json', 'utf8');
  const manifest = JSON.parse(manifestContent);
  
  console.log(`App Name: ${manifest.name}`);
  console.log(`Short Name: ${manifest.short_name}`);
  console.log(`Start URL: ${manifest.start_url}`);
  console.log(`Display Mode: ${manifest.display}\n`);
  
  console.log('Icons Configuration:');
  manifest.icons.forEach((icon, index) => {
    console.log(`  ${index + 1}. ${icon.src} (${icon.sizes}) - ${icon.type} - ${icon.purpose || 'any'}`);
  });
  
  console.log('\nShortcuts Configuration:');
  if (manifest.shortcuts) {
    manifest.shortcuts.forEach((shortcut, index) => {
      console.log(`  ${index + 1}. ${shortcut.name} - ${shortcut.url}`);
      if (shortcut.icons && shortcut.icons.length > 0) {
        console.log(`     Icon: ${shortcut.icons[0].src}`);
      }
    });
  }
  
} catch (error) {
  console.log(`❌ Error reading manifest.json: ${error.message}`);
  allIconsPresent = false;
}

// Check index.html icon references
console.log('\n3. CHECKING INDEX.HTML ICON REFERENCES:\n');

try {
  const indexContent = fs.readFileSync('index.html', 'utf8');
  
  // Extract icon-related link tags
  const iconMatches = indexContent.match(/<link[^>]*(?:icon|apple-touch-icon|manifest)[^>]*>/g) || [];
  
  console.log('Found icon references in index.html:');
  iconMatches.forEach((match, index) => {
    console.log(`  ${index + 1}. ${match}`);
  });
  
  // Check for specific required references
  const hasManifest = indexContent.includes('rel="manifest"');
  const hasFavicon = indexContent.includes('rel="icon"');
  const hasAppleIcon = indexContent.includes('rel="apple-touch-icon"');
  
  console.log(`\nRequired references:`);
  console.log(`  Manifest: ${hasManifest ? '✅' : '❌'}`);
  console.log(`  Favicon: ${hasFavicon ? '✅' : '❌'}`);
  console.log(`  Apple Touch Icon: ${hasAppleIcon ? '✅' : '❌'}`);
  
} catch (error) {
  console.log(`❌ Error reading index.html: ${error.message}`);
  allIconsPresent = false;
}

// Icon validation recommendations
console.log('\n4. RECOMMENDATIONS:\n');

if (allIconsPresent) {
  console.log('✅ All required icons are present!');
  console.log('\nTo test icon loading:');
  console.log('1. Open the app in a browser');
  console.log('2. Check the browser tab for favicon');
  console.log('3. Try installing the PWA (look for install prompt)');
  console.log('4. On mobile, add to home screen');
  console.log('5. Check browser dev tools console for any icon loading errors');
} else {
  console.log('❌ Some icons are missing or have issues');
  console.log('\nFix recommendations:');
  console.log('1. Ensure all icon files exist in the public directory');
  console.log('2. Check file permissions (should be 644)');
  console.log('3. Verify manifest.json syntax');
  console.log('4. Test with different browsers');
}

console.log('\n5. NEXT STEPS:\n');
console.log('- Clear browser cache and hard refresh');
console.log('- Test on different devices (iOS, Android, Desktop)');
console.log('- Check browser dev tools for any loading errors');
console.log('- Test PWA installation process');

console.log('\n=== VERIFICATION COMPLETE ===');