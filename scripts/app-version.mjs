#!/usr/bin/env node
/**
 * package.json "version" + "buildNumber" are the single source of the app version.
 *
 *   node scripts/app-version.mjs               copy them into the iOS project
 *   node scripts/app-version.mjs bump [kind]   kind: patch (default) | minor | major | build
 *
 * Every bump raises the build number, which App Store Connect requires for each upload.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkgPath = join(root, 'package.json');
const pbxprojPath = join(root, 'ios/App/App.xcodeproj/project.pbxproj');

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const [command, kind = 'patch'] = process.argv.slice(2);

if (command === 'bump') {
  const [major, minor, patch] = pkg.version.split('.').map(Number);
  if (kind === 'major') pkg.version = `${major + 1}.0.0`;
  else if (kind === 'minor') pkg.version = `${major}.${minor + 1}.0`;
  else if (kind === 'patch') pkg.version = `${major}.${minor}.${patch + 1}`;
  else if (kind !== 'build') {
    console.error(`Unknown bump kind "${kind}". Use patch, minor, major or build.`);
    process.exit(1);
  }
  pkg.buildNumber = (Number(pkg.buildNumber) || 0) + 1;
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
} else if (command) {
  console.error(`Unknown command "${command}". Use no argument or "bump".`);
  process.exit(1);
}

if (existsSync(pbxprojPath)) {
  const pbxproj = readFileSync(pbxprojPath, 'utf8')
    .replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${pkg.version};`)
    .replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${pkg.buildNumber};`);
  writeFileSync(pbxprojPath, pbxproj);
}

console.log(`App version ${pkg.version} (build ${pkg.buildNumber})`);
