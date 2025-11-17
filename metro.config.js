const { getDefaultConfig } = require('expo/metro-config');
// const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Temporarily disable NativeWind to bypass aspect-ratio parse error
module.exports = config;
// module.exports = withNativeWind(config, { input: './global.css' });
