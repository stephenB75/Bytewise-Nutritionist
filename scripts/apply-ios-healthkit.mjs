import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const plistPath = join(root, 'ios/App/App/Info.plist');
const entitlementsPath = join(root, 'ios/App/App/App.entitlements');
const entitlementsSource = join(root, 'native/healthkit/App.entitlements');
const pbxprojPath = join(root, 'ios/App/App.xcodeproj/project.pbxproj');

// The app only reads steps, active calories and distance (all @capgo/capacitor-health 7.x supports),
// so there is no write/update permission; reviewers check this text against what the app does.
const shareKey = 'NSHealthShareUsageDescription';
const updateKey = 'NSHealthUpdateUsageDescription';
const shareText =
  'ByteWise reads your steps, active calories, and walking distance from Apple Health to show your daily activity next to your nutrition.';

if (!existsSync(plistPath)) {
  process.exit(0);
}

let plist = readFileSync(plistPath, 'utf8');
plist = plist.replace(new RegExp(`\\s*<key>${updateKey}</key>\\s*<string>[^<]*</string>`), '');
if (plist.includes(shareKey)) {
  plist = plist.replace(
    new RegExp(`(<key>${shareKey}</key>\\s*<string>)[^<]*(</string>)`),
    `$1${shareText}$2`,
  );
} else {
  plist = plist.replace(
    '</dict>\n</plist>',
    `        <key>${shareKey}</key>\n        <string>${shareText}</string>\n</dict>\n</plist>`,
  );
}

// App Store settings: 64-bit only, and HTTPS-only encryption skips the export compliance prompt.
plist = plist.replace('<string>armv7</string>', '<string>arm64</string>');
if (!plist.includes('ITSAppUsesNonExemptEncryption')) {
  plist = plist.replace(
    '<key>LSRequiresIPhoneOS</key>',
    '<key>ITSAppUsesNonExemptEncryption</key>\n        <false/>\n        <key>LSRequiresIPhoneOS</key>',
  );
}
writeFileSync(plistPath, plist);

if (existsSync(entitlementsSource)) {
  copyFileSync(entitlementsSource, entitlementsPath);
}

if (existsSync(pbxprojPath)) {
  let project = readFileSync(pbxprojPath, 'utf8');
  if (!project.includes('CODE_SIGN_ENTITLEMENTS')) {
    project = project.replaceAll(
      'ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;\n\t\t\t\tCODE_SIGN_STYLE = Automatic;',
      'ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;\n\t\t\t\tCODE_SIGN_ENTITLEMENTS = App/App.entitlements;\n\t\t\t\tCODE_SIGN_STYLE = Automatic;',
    );
  }
  // Xcode 27 can't build for anything below iOS 15.
  project = project.replaceAll('IPHONEOS_DEPLOYMENT_TARGET = 14.0;', 'IPHONEOS_DEPLOYMENT_TARGET = 15.0;');
  writeFileSync(pbxprojPath, project);
}
