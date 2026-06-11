/**
 * Post-build script: Splits next-on-pages monolithic _worker.js into
 * per-route Cloudflare Pages Functions.
 *
 * Each route becomes its own Worker (< 2MB), well under 3MB free limit.
 *
 * Usage: after `npx @cloudflare/next-on-pages@1`, run:
 *   node scripts/split-worker.mjs
 */

import { readFileSync, writeFileSync, existsSync, cpSync, rmSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const STATIC_DIR = '.vercel/output/static';
const WORKER_DIR = join(STATIC_DIR, '_worker.js');
const DIST_DIR = join(STATIC_DIR, '__next-on-pages-dist__');
const FUNCTIONS_DIR = join(STATIC_DIR, 'functions');

// Route → .func.js entrypoint mapping
const ROUTES = [
  { func: '/[locale]',          entry: '__next-on-pages-dist__/functions/[locale].func.js' },
  { func: '/[locale]/goals',    entry: '__next-on-pages-dist__/functions/[locale]/goals.func.js' },
  { func: '/[locale]/grow',     entry: '__next-on-pages-dist__/functions/[locale]/grow.func.js' },
  { func: '/[locale]/login',    entry: '__next-on-pages-dist__/functions/[locale]/login.func.js' },
  { func: '/[locale]/profile',  entry: '__next-on-pages-dist__/functions/[locale]/profile.func.js' },
  { func: '/[locale]/register', entry: '__next-on-pages-dist__/functions/[locale]/register.func.js' },
  { func: '/[locale]/setup',    entry: '__next-on-pages-dist__/functions/[locale]/setup.func.js' },
  { func: '/api/auth/login',    entry: '__next-on-pages-dist__/functions/api/auth/login.func.js' },
  { func: '/api/auth/me',       entry: '__next-on-pages-dist__/functions/api/auth/me.func.js' },
  { func: '/api/auth/register', entry: '__next-on-pages-dist__/functions/api/auth/register.func.js' },
  { func: '/api/checkout',      entry: '__next-on-pages-dist__/functions/api/checkout.func.js' },
  { func: '/api/oracle',        entry: '__next-on-pages-dist__/functions/api/oracle.func.js' },
  { func: '/api/sync/pull',     entry: '__next-on-pages-dist__/functions/api/sync/pull.func.js' },
  { func: '/api/sync/push',     entry: '__next-on-pages-dist__/functions/api/sync/push.func.js' },
];

// Template for a Pages Function wrapper.
// Each wrapper: sets up globals → imports the .func.js → calls handler.
function wrapperTemplate(relPath) {
  return `import { Buffer } from 'node:buffer';
import { AsyncLocalStorage } from 'node:async_hooks';

// ── Global setup ──────────────────────────────────────────────────
globalThis.Buffer ??= Buffer;
if (!globalThis.AsyncLocalStorage) {
  globalThis.AsyncLocalStorage = AsyncLocalStorage;
  initGlobals();
}
function initGlobals() {
  const alsStore = new Map();
  const envALS = new AsyncLocalStorage();
  const reqCtxALS = new AsyncLocalStorage();

  globalThis.process ??= {
    env: new Proxy(alsStore, {
      ownKeys: () => [...alsStore.keys()],
      getOwnPropertyDescriptor: (_, p) => ({ configurable: true, enumerable: true, value: alsStore.get(p) }),
      get: (_, p) => alsStore.get(p),
      set: (_, p, v) => (alsStore.set(p, v), true),
    }),
  };

  globalThis[Symbol.for('__cloudflare-request-context__')] ??= new Proxy(
    {}, { get: (_, p) => globalThis.__cfReqCtxStore?.get(p) }
  );

  if (!globalThis.__nextOnPagesRoutesIsolation) {
    globalThis.__nextOnPagesRoutesIsolation = {
      _map: new Map(),
      getProxyFor(path) {
        let p = this._map.get(path);
        if (p) return p;
        p = new Proxy(globalThis, {
          get: (t, prop) => this._map.has(prop) ? this._map.get(prop) : Reflect.get(t, prop),
          set: (t, prop, v) => {
            const r = new Set(['_nextOriginalFetch', 'fetch', '__incrementalCache']);
            return r.has(prop) ? Reflect.set(t, prop, v) : (this._map.set(prop, v), true);
          },
        });
        this._map.set(path, p);
        return p;
      },
    };
  }

  const origDP = Object.defineProperty;
  globalThis.Object.defineProperty ??= (...args) => {
    const [obj, prop] = args;
    if (prop === '__import_unsupported' && typeof obj === 'object' && obj !== null && '__import_unsupported' in obj)
      return origDP(...args);
    return origDP(...args);
  };

  const OrigAC = globalThis.AbortController;
  if (!globalThis.__acPatched) {
    globalThis.AbortController = class extends OrigAC {
      constructor() {
        try { super(); } catch (e) {
          if (e instanceof Error && e.message.includes('Disallowed operation')) {
            return Object.setPrototypeOf({
              signal: { aborted: false, reason: null, onabort: () => {}, throwIfAborted: () => {} },
              abort() {},
            }, AbortController.prototype);
          }
          throw e;
        }
      }
    };
    globalThis.__acPatched = true;
  }

  globalThis.__envALS = envALS;
  globalThis.__reqCtxALS = reqCtxALS;
}

// ── Lazy-load handler module ──────────────────────────────────────
let _handler;
async function getHandler() {
  if (!_handler) _handler = import('${relPath}');
  return _handler;
}

// ── Cloudflare Pages onRequest ────────────────────────────────────
export async function onRequest(context) {
  const { request, env, ctx } = context;
  const envALS = globalThis.__envALS;
  const reqCtxALS = globalThis.__reqCtxALS;

  if (!envALS) initGlobals();

  return envALS.run({ ...env, NODE_ENV: 'production' }, async () => {
    globalThis.__cfReqCtxStore = { env, ctx, cf: request.cf };
    return reqCtxALS.run({ env, ctx, cf: request.cf }, async () => {
      try {
        const mod = await getHandler();
        return mod.default(request, ctx);
      } catch (err) {
        console.error('Handler error:', err);
        return new Response('Internal Server Error', { status: 500 });
      }
    });
  });
}
`;
}

// Convert route pattern to Pages Functions file path
function routeFilePath(route) {
  // /[locale] → functions/[locale].js
  // /api/oracle → functions/api/oracle.js
  const p = join(FUNCTIONS_DIR, route.slice(1)) + '.js';
  return p;
}

// Compute relative import path from wrapper → .func.js
// Wrapper is at:  functions/{route}.js
// Target is at:   __next-on-pages-dist__/functions/{route}.func.js
// Need to go up from functions/ to root, then into __next-on-pages-dist__
function importPath(route) {
  const depth = route.slice(1).split('/').filter(Boolean).length; // path segment count
  const up = Array(depth).fill('..').join('/');
  return `${up}/__next-on-pages-dist__/functions${route}.func.js`;
}

// ── Main ────────────────────────────────────────────────────────────
function main() {
  console.log('⚡ Splitting Worker into per-route Pages Functions...');

  if (!existsSync(WORKER_DIR)) {
    console.error(`❌ Build output not found at ${WORKER_DIR}. Run next-on-pages first.`);
    process.exit(1);
  }

  const distFrom = join(WORKER_DIR, '__next-on-pages-dist__');
  if (!existsSync(distFrom)) {
    console.error(`❌ ${distFrom} not found.`);
    process.exit(1);
  }

  // 1. Move __next-on-pages-dist__/ to output root
  if (existsSync(DIST_DIR)) rmSync(DIST_DIR, { recursive: true });
  console.log('  Moving __next-on-pages-dist__ to output root...');
  cpSync(distFrom, DIST_DIR, { recursive: true });

  // 2. Delete _worker.js/
  console.log('  Removing monolithic _worker.js/...');
  rmSync(WORKER_DIR, { recursive: true });

  // 3. Create functions/ directory structure
  if (existsSync(FUNCTIONS_DIR)) rmSync(FUNCTIONS_DIR, { recursive: true });
  mkdirSync(FUNCTIONS_DIR, { recursive: true });

  for (const r of ROUTES) {
    const fp = routeFilePath(r.func);
    const d = dirname(fp);
    if (!existsSync(d)) mkdirSync(d, { recursive: true });
  }

  // 4. Write route wrappers
  for (const r of ROUTES) {
    const fp = routeFilePath(r.func);
    const ip = importPath(r.func);
    const content = wrapperTemplate(ip);
    writeFileSync(fp, content, 'utf-8');
    console.log(`    ✓ ${r.func}`);
  }

  console.log('\n✅ Done! Each route is now a separate Pages Function.');
}

main();
