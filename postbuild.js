#!/usr/bin/env node

/**
 * Post-build script to ensure static files are in the correct location for production
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, 'client', 'dist');
const TARGET_DIR = path.join(__dirname, 'server', 'public');

// Create target directory if it doesn't exist
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
  console.log(`Created directory: ${TARGET_DIR}`);
}

// Copy all files from client/dist to server/public
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${src} -> ${dest}`);
  }
}

if (fs.existsSync(SOURCE_DIR)) {
  console.log(`Copying built files from ${SOURCE_DIR} to ${TARGET_DIR}`);
  copyRecursiveSync(SOURCE_DIR, TARGET_DIR);
  console.log('Post-build copy completed successfully!');
} else {
  console.error(`Source directory ${SOURCE_DIR} does not exist. Run 'npm run build' first.`);
  process.exit(1);
}