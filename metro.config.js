// metro.config.js
// Enables package.json `exports` field resolution so Firebase v9+
// subpath imports (firebase/auth, firebase/firestore, etc.) resolve correctly.

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;

module.exports = config;
