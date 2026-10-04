#!/usr/bin/env node
/**
 * Point this repo at .githooks so pre-push runs ios:prepare before GitHub pushes.
 */
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const hooksDir = join(root, '.githooks');

if (!existsSync(hooksDir)) {
  process.exit(0);
}

try {
  execSync('git rev-parse --is-inside-work-tree', { cwd: root, stdio: 'ignore' });
} catch {
  process.exit(0);
}

try {
  execSync('git config core.hooksPath .githooks', { cwd: root, stdio: 'ignore' });
  execSync('chmod +x .githooks/pre-push', { cwd: root, stdio: 'ignore' });
} catch {
  // Non-fatal in CI / read-only checkouts
}
