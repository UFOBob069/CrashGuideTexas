// metro.config.js
// Firebase v9+ uses the package.json `exports` field for subpath imports
// (firebase/auth, firebase/firestore, etc.). Metro's support for this is
// version-dependent, so we explicitly resolve each Firebase subpackage to
// its concrete entry-point file using `extraNodeModules` instead.

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs   = require('fs');

const config = getDefaultConfig(__dirname);

// Keep the exports flag on as a hint for other packages
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['browser', 'require', 'default'];

// ── Explicit Firebase subpath resolution ──────────────────
const FIREBASE_SUBPATHS = ['app', 'auth', 'firestore', 'storage'];
const extraNodeModules  = { ...config.resolver.extraNodeModules };

for (const sub of FIREBASE_SUBPATHS) {
  const dir     = path.join(__dirname, 'node_modules', 'firebase', sub);
  const pkgFile = path.join(dir, 'package.json');

  if (!fs.existsSync(dir)) continue;

  if (fs.existsSync(pkgFile)) {
    const pkg   = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
    // Prefer browser bundle > main > module
    const entry = pkg.browser || pkg.main || pkg.module;
    if (entry) {
      const resolved = path.resolve(dir, entry);
      if (fs.existsSync(resolved)) {
        extraNodeModules[`firebase/${sub}`] = resolved;
        continue;
      }
    }
  }

  // Fallback: bare index.js
  const idx = path.join(dir, 'index.js');
  if (fs.existsSync(idx)) extraNodeModules[`firebase/${sub}`] = idx;
}

config.resolver.extraNodeModules = extraNodeModules;

module.exports = config;
