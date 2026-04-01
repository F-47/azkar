/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          950: '#052e16',
          900: '#0a3d1e',
          800: '#14532d',
          700: '#1a6b3c',
          600: '#16a34a',
          500: '#22c55e',
        },
        gold: {
          400: '#d4a843',
          300: '#e2bc60',
          200: '#f0d080',
        },
        cream: {
          50: '#fdfbf5',
          100: '#f9f5e8',
          200: '#f0e8cc',
        },
      },
      fontFamily: {
        arabic: ['Amiri', 'Noto Naskh Arabic', 'serif'],
      },
    },
  },
  plugins: [],
}
