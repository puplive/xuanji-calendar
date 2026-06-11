#!/usr/bin/env node

/**
 * Build script for Cloudflare Pages static deployment.
 *
 * 1. Temporarily moves Next.js API routes + middleware aside
 *    (not compatible with output: 'export')
 * 2. Builds static site
 * 3. Restores API routes and middleware
 * 4. Copies Pages Functions + _redirects to output
 */

import { execSync } from 'node:child_process';
import { existsSync, cpSync, writeFileSync, renameSync } from 'node:fs';

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

const HIDABLE = [
  { src: 'src/app/api', bak: '.api-backup' },
  { src: 'src/middleware.ts', bak: '.middleware-backup.ts' },
];
const hidden = [];

try {
  // 1. Hide files incompatible with static export
  console.log('\n--- Hiding incompatible files ---');
  for (const { src, bak } of HIDABLE) {
    if (existsSync(src)) {
      renameSync(src, bak);
      hidden.push({ src, bak });
      console.log(`  hid ${src}`);
    }
  }

  // 2. Build static site
  console.log('\n--- Building static site ---');
  run('npx next build');

  // 3. Copy Pages Functions to output
  console.log('\n--- Copying Pages Functions to output ---');
  if (existsSync('out')) {
    cpSync('functions', 'out/functions', { recursive: true });
  }

  // 4. Write _redirects for root → /en
  writeFileSync('out/_redirects', '/ /en 302\n', 'utf-8');
  console.log('✓ out/_redirects created');

  console.log('\n✅ Build complete! Deploy out/ to Cloudflare Pages.');
} catch (err) {
  console.error('\n❌ Build failed:', err.message);
  process.exitCode = 1;
} finally {
  // Always restore hidden files
  for (const { src, bak } of hidden) {
    if (existsSync(bak)) {
      renameSync(bak, src);
      console.log(`  restored ${src}`);
    }
  }
}
