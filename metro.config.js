const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
// const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add path alias resolver for @/* imports
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    '@': __dirname,
  },
};

// Temporarily disable NativeWind to bypass aspect-ratio parse error
module.exports = config;
// module.exports = withNativeWind(config, { input: './global.css' });
