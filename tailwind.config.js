/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./contexts/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        orange: '#FF6B35',
        cream: '#FFF8F0',
      },
    },
  },
  corePlugins: {
    // Disabilita le utility aspect-ratio non supportate da react-native-css-interop
    aspectRatio: false,
  },
  plugins: [],
}
