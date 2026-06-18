/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#C9A84C', light: '#E8C96B' },
        dark: { DEFAULT: '#0E0B08', 2: '#1A1510', 3: '#241E15' },
        cream: '#F5EDD8',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
