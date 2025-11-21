module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // "nativewind/babel", // Temporarily disabled
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
          },
          extensions: ['.tsx', '.ts', '.jsx', '.js', '.json']
        },
      ],
    ],
  };
};
