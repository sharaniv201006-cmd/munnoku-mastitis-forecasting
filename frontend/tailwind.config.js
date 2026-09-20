/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#047857', // Deep green
          light: '#059669',
          dark: '#065f46'
        },
        risk: {
          high: '#dc2626', // Red
          moderate: '#d97706', // Amber
          low: '#16a34a' // Green
        }
      }
    },
  },
  plugins: [],
}
