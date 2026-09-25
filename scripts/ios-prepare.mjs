#!/usr/bin/env node
/**
 * One-shot iOS prep: build web assets, ensure ios platform exists, sync, apply HealthKit entitlements.
 */
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iosDir = join(root, 'ios');

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd: root, stdio: 'inherit' });
}

run('npm run build');

if (!existsSync(iosDir)) {
  console.log('\nNo ios/ folder — adding Capacitor iOS platform…');
  run('npx cap add ios');
}

run('npx cap sync ios');
run('node scripts/apply-ios-healthkit.mjs');
run('node scripts/app-version.mjs');

console.log('\n✅ iOS project ready. Open Xcode with: npm run ios:open\n');
