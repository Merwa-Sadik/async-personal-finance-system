/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        navy: '#1e3a5f',
        'navy-dark': '#16304f',
      },
    },
  },
  plugins: [],
}
