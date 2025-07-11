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
        // Warm, friendly colors
        background: '#FFFFFF',
        card: '#F8F9FA',
        primary: '#4CAF50', // Warm green
        secondary: '#2196F3', // Gentle blue
        accent: '#FF9800', // Warm orange
        success: '#4CAF50', // Friendly green
        warning: '#FF9800', // Warm orange
        error: '#F44336', // Soft red
        text: {
          primary: '#212121',
          secondary: '#757575',
          light: '#9E9E9E'
        },
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121'
        }
      },
      borderRadius: {
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.08)',
        card: '0 4px 12px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
} 