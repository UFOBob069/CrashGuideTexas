// Build script for Vercel:
// 1. Builds the Expo web app to dist/
// 2. Moves Expo output to dist/app/
// 3. Copies the marketing landing page to dist/index.html

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..');
const DIST    = path.join(ROOT, 'dist');
const APP_DIR = path.join(DIST, 'app');

// ── 1. Build Expo for web ──────────────────────────────────
console.log('Building Expo web app…');
execSync('npx expo export --platform web', { stdio: 'inherit', cwd: ROOT });

// dist/ now contains the Expo web build (index.html, _expo/, assets/, etc.)

// ── 2. Move Expo output into dist/app/ ────────────────────
console.log('Moving Expo build to dist/app/…');
fs.mkdirSync(APP_DIR, { recursive: true });

for (const entry of fs.readdirSync(DIST)) {
  if (entry === 'app') continue;                       // skip the dir we just made
  fs.renameSync(path.join(DIST, entry), path.join(APP_DIR, entry));
}

// ── 3. Copy landing page to dist/index.html ───────────────
console.log('Copying landing page…');
fs.copyFileSync(path.join(ROOT, 'public', 'index.html'), path.join(DIST, 'index.html'));

console.log('Web build complete ✓');
