// metro.config.js
// Enables package.json `exports` field resolution so Firebase v9+
// subpath imports (firebase/auth, firebase/firestore, etc.) resolve correctly.

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow Metro to resolve Firebase v9+ subpath imports (firebase/auth, etc.)
// which use the package.json `exports` field.
config.resolver.unstable_enablePackageExports = true;

// Include 'browser' so Firebase picks its browser-optimised bundle
// (Metro defaults to ['require','default'] which skips the browser condition).
config.resolver.unstable_conditionNames = ['browser', 'require', 'default'];

module.exports = config;
