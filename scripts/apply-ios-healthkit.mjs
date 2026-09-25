import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const plistPath = join(root, 'ios/App/App/Info.plist');
const entitlementsPath = join(root, 'ios/App/App/App.entitlements');
const entitlementsSource = join(root, 'native/healthkit/App.entitlements');
const pbxprojPath = join(root, 'ios/App/App.xcodeproj/project.pbxproj');

// The app only reads steps, active calories and distance. App Store Connect still rejects builds
// without the update string because the HealthKit plugin links write APIs, so both keys are required;
// reviewers check this text against what the app does, so it must not claim writes.
const healthUsage = {
  NSHealthShareUsageDescription:
    'ByteWise reads your steps, active calories, and walking distance from Apple Health to show your daily activity next to your nutrition.',
  NSHealthUpdateUsageDescription:
    'ByteWise does not write or change any data in Apple Health. It only reads your steps, active calories, and walking distance to show your daily activity next to your nutrition.',
};

if (!existsSync(plistPath)) {
  process.exit(0);
}

let plist = readFileSync(plistPath, 'utf8');
for (const [key, text] of Object.entries(healthUsage)) {
  if (plist.includes(`<key>${key}</key>`)) {
    plist = plist.replace(
      new RegExp(`(<key>${key}</key>\\s*<string>)[^<]*(</string>)`),
      `$1${text}$2`,
    );
  } else {
    plist = plist.replace(
      '</dict>\n</plist>',
      `\t<key>${key}</key>\n\t<string>${text}</string>\n</dict>\n</plist>`,
    );
  }
}

// Name under the home-screen icon; the full "Bytewise Nutritionist" name belongs to the App Store listing.
plist = plist.replace(
  /(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/,
  '$1Bytewise$2',
);

// App Store settings: 64-bit only, and HTTPS-only encryption skips the export compliance prompt.
plist = plist.replace('<string>armv7</string>', '<string>arm64</string>');
if (!plist.includes('ITSAppUsesNonExemptEncryption')) {
  plist = plist.replace(
    '<key>LSRequiresIPhoneOS</key>',
    '<key>ITSAppUsesNonExemptEncryption</key>\n        <false/>\n        <key>LSRequiresIPhoneOS</key>',
  );
}

// iOS 27 SDK flags apps without a UIScene lifecycle (Xcode halts on launch); the Main storyboard
// still hosts Capacitor's bridge view controller, now loaded by the scene.
if (!plist.includes('UIApplicationSceneManifest')) {
  plist = plist.replace(
    '<key>UIMainStoryboardFile</key>',
    [
      '<key>UIApplicationSceneManifest</key>',
      '\t<dict>',
      '\t\t<key>UIApplicationSupportsMultipleScenes</key>',
      '\t\t<false/>',
      '\t\t<key>UISceneConfigurations</key>',
      '\t\t<dict>',
      '\t\t\t<key>UIWindowSceneSessionRoleApplication</key>',
      '\t\t\t<array>',
      '\t\t\t\t<dict>',
      '\t\t\t\t\t<key>UISceneConfigurationName</key>',
      '\t\t\t\t\t<string>Default Configuration</string>',
      '\t\t\t\t\t<key>UISceneDelegateClassName</key>',
      '\t\t\t\t\t<string>$(PRODUCT_MODULE_NAME).SceneDelegate</string>',
      '\t\t\t\t\t<key>UISceneStoryboardFile</key>',
      '\t\t\t\t\t<string>Main</string>',
      '\t\t\t\t</dict>',
      '\t\t\t</array>',
      '\t\t</dict>',
      '\t</dict>',
      '\t<key>UIMainStoryboardFile</key>',
    ].join('\n'),
  );
}
writeFileSync(plistPath, plist);

// Lives in AppDelegate.swift so no Xcode project file reference is needed.
const appDelegatePath = join(root, 'ios/App/App/AppDelegate.swift');
const sceneDelegateSource = `
class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        if let url = connectionOptions.urlContexts.first?.url {
            _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, open: url, options: [:])
        }
        if let userActivity = connectionOptions.userActivities.first {
            _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
        }
    }

    // With scenes, iOS delivers deep links (e.g. auth callbacks) here instead of to AppDelegate.
    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        for context in URLContexts {
            _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, open: context.url, options: [:])
        }
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
    }
}
`;
if (existsSync(appDelegatePath)) {
  const appDelegate = readFileSync(appDelegatePath, 'utf8');
  if (!appDelegate.includes('class SceneDelegate')) {
    writeFileSync(appDelegatePath, `${appDelegate.trimEnd()}\n${sceneDelegateSource}`);
  }
}

if (existsSync(entitlementsSource)) {
  copyFileSync(entitlementsSource, entitlementsPath);
}

// `cap add ios` ships Capacitor's placeholder icon; replace it with the ByteWise icon
// (1024x1024, no alpha, which App Store Connect requires).
const appIconSource = join(root, 'native/ios/AppIcon-1024.png');
const appIconDir = join(root, 'ios/App/App/Assets.xcassets/AppIcon.appiconset');
if (existsSync(appIconSource) && existsSync(appIconDir)) {
  copyFileSync(appIconSource, join(appIconDir, 'AppIcon-512@2x.png'));
  writeFileSync(
    join(appIconDir, 'Contents.json'),
    `${JSON.stringify({
      images: [{ filename: 'AppIcon-512@2x.png', idiom: 'universal', platform: 'ios', size: '1024x1024' }],
      info: { author: 'xcode', version: 1 },
    }, null, 2)}\n`,
  );
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
