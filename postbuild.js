const fs = require('fs');
const path = require('path');

// Ensure production HTML has correct icon references
const htmlPath = path.join(__dirname, 'dist', 'public', 'index.html');
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Check if already has precomposed icons
  if (!html.includes('apple-touch-icon-precomposed')) {
    // Replace the Apple touch icon section
    const oldSection = `  <!-- Apple Touch Icons for iOS -->
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />
  <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" />
  <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-touch-icon-120x120.png" />`;
    
    const newSection = `  <!-- Apple Touch Icons for iOS - Precomposed first for better compatibility -->
  <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png?v=1.4" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=1.4" />
  <link rel="apple-touch-icon-precomposed" sizes="152x152" href="/apple-touch-icon-152x152-precomposed.png?v=1.4" />
  <link rel="apple-touch-icon-precomposed" sizes="120x120" href="/apple-touch-icon-120x120-precomposed.png?v=1.4" />
  <link rel="apple-touch-icon-precomposed" sizes="76x76" href="/apple-touch-icon-76x76-precomposed.png?v=1.4" />
  <link rel="apple-touch-icon" sizes="192x192" href="/apple-touch-icon-192x192.png?v=1.4" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png?v=1.4" />
  <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png?v=1.4" />
  <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png?v=1.4" />
  <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png?v=1.4" />
  <link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png?v=1.4" />`;
    
    html = html.replace(oldSection, newSection);
    fs.writeFileSync(htmlPath, html);
    console.log('✅ Production HTML updated with correct icon references');
  }
}

// Copy all icon files to production
const srcIconsDir = path.join(__dirname, 'public');
const destIconsDir = path.join(__dirname, 'dist', 'public');

if (fs.existsSync(destIconsDir)) {
  // Copy Apple touch icons
  const iconFiles = fs.readdirSync(srcIconsDir).filter(f => f.startsWith('apple-touch-icon'));
  iconFiles.forEach(file => {
    const src = path.join(srcIconsDir, file);
    const dest = path.join(destIconsDir, file);
    fs.copyFileSync(src, dest);
  });
  
  // Ensure icons folder exists
  const destIconsFolder = path.join(destIconsDir, 'icons');
  if (!fs.existsSync(destIconsFolder)) {
    fs.mkdirSync(destIconsFolder);
  }
  
  // Copy all icons to icons folder
  const iconsFolder = path.join(srcIconsDir, 'icons');
  if (fs.existsSync(iconsFolder)) {
    const icons = fs.readdirSync(iconsFolder).filter(f => f.endsWith('.png'));
    icons.forEach(file => {
      const src = path.join(iconsFolder, file);
      const dest = path.join(destIconsFolder, file);
      fs.copyFileSync(src, dest);
    });
  }
  
  // Copy manifest and favicon
  ['manifest.json', 'favicon.ico'].forEach(file => {
    const src = path.join(srcIconsDir, file);
    const dest = path.join(destIconsDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  });
  
  console.log(`✅ Copied ${iconFiles.length} Apple touch icons to production`);
}
