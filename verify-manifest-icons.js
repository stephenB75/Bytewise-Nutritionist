/**
 * Manifest Icon Verification Script
 * Verifies all icons referenced in manifest.json exist and are accessible
 */

import fs from 'fs';
import path from 'path';

const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const publicDir = 'public';

let allValid = true;
let missingFiles = [];

console.log('🔍 Verifying Manifest Icons and Screenshots...\n');

// Check main icons
manifest.icons.forEach((icon, index) => {
  const iconPath = path.join(publicDir, icon.src);
  const exists = fs.existsSync(iconPath);
  const status = exists ? '✅' : '❌';
  
  console.log(`${status} Icon ${index + 1}: ${icon.src} (${icon.sizes}) - ${exists ? 'EXISTS' : 'MISSING'}`);
  
  if (!exists) {
    allValid = false;
    missingFiles.push(icon.src);
  } else {
    // Check file size to ensure it's not corrupted
    const stats = fs.statSync(iconPath);
    if (stats.size < 100) {
      console.log(`   ⚠️  WARNING: ${icon.src} is very small (${stats.size} bytes) - may be corrupted`);
    }
  }
});

console.log('\n📸 Checking Screenshots...\n');

// Check screenshots
if (manifest.screenshots) {
  manifest.screenshots.forEach((screenshot, index) => {
    const screenshotPath = path.join(publicDir, screenshot.src);
    const exists = fs.existsSync(screenshotPath);
    const status = exists ? '✅' : '❌';
    
    console.log(`${status} Screenshot ${index + 1}: ${screenshot.src} (${screenshot.sizes}) - ${exists ? 'EXISTS' : 'MISSING'}`);
    
    if (!exists) {
      allValid = false;
      missingFiles.push(screenshot.src);
    }
  });
}

console.log('\n🔗 Checking Shortcut Icons...\n');

// Check shortcut icons
if (manifest.shortcuts) {
  manifest.shortcuts.forEach((shortcut, index) => {
    if (shortcut.icons) {
      shortcut.icons.forEach((icon) => {
        const iconPath = path.join(publicDir, icon.src);
        const exists = fs.existsSync(iconPath);
        const status = exists ? '✅' : '❌';
        
        console.log(`${status} Shortcut "${shortcut.name}": ${icon.src} - ${exists ? 'EXISTS' : 'MISSING'}`);
        
        if (!exists) {
          allValid = false;
          missingFiles.push(icon.src);
        }
      });
    }
  });
}

console.log('\n' + '='.repeat(60));

if (allValid) {
  console.log('🎉 SUCCESS: All manifest icons and screenshots are present!');
  console.log('📋 Files verified:');
  
  const allFiles = [];
  manifest.icons.forEach(icon => allFiles.push(icon.src));
  if (manifest.screenshots) manifest.screenshots.forEach(screenshot => allFiles.push(screenshot.src));
  if (manifest.shortcuts) {
    manifest.shortcuts.forEach(shortcut => {
      if (shortcut.icons) shortcut.icons.forEach(icon => allFiles.push(icon.src));
    });
  }
  
  allFiles.forEach(file => console.log(`   ✓ ${file}`));
  
  console.log('\n🚀 Your manifest.json is ready for production deployment!');
  console.log('💡 If you\'re seeing errors in production, the issue is likely:');
  console.log('   • Files not uploaded to production server');
  console.log('   • Server not configured to serve static files');
  console.log('   • CDN/cache not updated with new files');
  
} else {
  console.log('❌ ISSUES FOUND: Some manifest resources are missing!');
  console.log('📝 Missing files:');
  missingFiles.forEach(file => console.log(`   • ${file}`));
  console.log('\n🔧 To fix: Add the missing files to your public directory');
}

console.log('\n📊 Summary:');
console.log(`   • Icons: ${manifest.icons.length} defined`);
console.log(`   • Screenshots: ${manifest.screenshots ? manifest.screenshots.length : 0} defined`);  
console.log(`   • Shortcuts: ${manifest.shortcuts ? manifest.shortcuts.length : 0} defined`);
console.log(`   • Total files checked: ${allValid ? 'All present' : `${missingFiles.length} missing`}`);