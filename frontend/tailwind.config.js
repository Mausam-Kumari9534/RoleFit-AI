/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F0F9FF',        // Sky Background
          surface: '#FFFFFF',   // White surface
          sky: '#BAE6FD',       // Sky
          primary: '#0284C7',   // Primary Blue
          primaryHover: '#0369a1',
          text: '#0F172A',      // Primary text
          secondary: '#475569', // Secondary text
          border: '#E2E8F0',    // Borders
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
