// metro.config.js
// Web builds (EXPO_WEB_BUILD=1) need explicit Firebase subpath resolution
// because Metro's exports-field support is limited.
// Native (iOS/Android) builds use Metro's default resolver — don't touch it.

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs   = require('fs');

const config = getDefaultConfig(__dirname);

if (process.env.EXPO_WEB_BUILD === '1') {
  // ── Web build only ──────────────────────────────────────
  config.resolver.unstable_enablePackageExports = true;
  config.resolver.unstable_conditionNames = ['browser', 'require', 'default'];

  // Explicitly map firebase/* subpaths to their browser entry points
  // so Metro doesn't need to parse the package.json exports field.
  const FIREBASE_SUBPATHS = ['app', 'auth', 'firestore', 'storage'];
  const extraNodeModules  = { ...config.resolver.extraNodeModules };

  for (const sub of FIREBASE_SUBPATHS) {
    const dir     = path.join(__dirname, 'node_modules', 'firebase', sub);
    const pkgFile = path.join(dir, 'package.json');

    if (!fs.existsSync(dir)) continue;

    if (fs.existsSync(pkgFile)) {
      const pkg   = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
      const entry = pkg.browser || pkg.main || pkg.module;
      if (entry) {
        const resolved = path.resolve(dir, entry);
        if (fs.existsSync(resolved)) {
          extraNodeModules[`firebase/${sub}`] = resolved;
          continue;
        }
      }
    }

    const idx = path.join(dir, 'index.js');
    if (fs.existsSync(idx)) extraNodeModules[`firebase/${sub}`] = idx;
  }

  config.resolver.extraNodeModules = extraNodeModules;
}

module.exports = config;
