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
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#367AFF', // Main brand color from Figma
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        figma: {
          primary: '#367AFF',     // Main brand color
          text: '#232323',        // Primary text color
          textGray: '#969696',    // Secondary text color  
          textLight: '#9A9A9A',   // Light text color
          textMuted: '#6C6C6C',   // Muted text color
          border: '#D9D9D9',      // Border color
          white: '#FFFFFF',       // White
          black: '#000000',       // Black
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

