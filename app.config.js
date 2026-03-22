// app.config.js takes precedence over app.json.
// We use it to strip native-only plugins from web builds so that
// `expo export --platform web` doesn't try to resolve iOS/Android plugins.

module.exports = ({ config }) => {
  const isWebBuild = process.env.EXPO_WEB_BUILD === '1';

  return {
    ...config,
    plugins: isWebBuild
      ? [
          // Web-safe plugins only
          'expo-camera',
          'expo-image-picker',
          'expo-location',
        ]
      : config.plugins, // use the full list from app.json for native builds
  };
};
