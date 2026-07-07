/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The vibrant orange Green from the buttons/highlights
        primaryGreen: '#F97316', 
        // A slightly darker green for hover states (makes buttons feel tactile)
        primaryGreenDark: '#EA580C',
        // The Deep, almost black Navy for text
        darkNavy: '#0F172A',     
        // PURE WHITE background for that clean, defined look
        lightBg: '#FFFFFF',      
        // A very subtle gray for borders to keep it clean
        borderColor: '#E2E8F0',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        // A cleaner, softer shadow for the cards
        'clean': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}