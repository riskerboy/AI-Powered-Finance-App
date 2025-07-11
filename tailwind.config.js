/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F1117',
        card: '#1A1C23',
        accent: '#FFB800',
        purple: '#B22CFF',
        blue: '#1D8FFF',
        green: '#00A67E',
        red: '#FF3EA5',
        white: '#FFFFFF',
        gray: {
          100: '#E4E4E7',
          400: '#9CA3AF',
          700: '#374151',
        },
        gradientStart: '#FFB800', // For gradients
        gradientEnd: '#FF3EA5',   // For gradients
      },
      borderRadius: {
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },
      boxShadow: {
        card: '0 4px 24px 0 rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
} 