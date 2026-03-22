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
          50:  '#eef1f8',
          100: '#d4dbed',
          200: '#a9b8db',
          300: '#7e94c8',
          400: '#5371b5',
          500: '#2850a0',
          600: '#1f3d80',
          700: '#1a2e60',
          800: '#1a2744',
          900: '#111b30',
        },
        gold: {
          100: '#f5edd8',
          200: '#ecdbb1',
          300: '#e8d5a8',
          400: '#d4b97e',
          500: '#c8a96e',
          600: '#b08d52',
          700: '#8c6e3a',
        },
        cream: {
          50:  '#faf7f2',
          100: '#f3ede2',
          200: '#e8dece',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 20px 40px -8px rgba(26, 39, 68, 0.18), 0 8px 16px -4px rgba(26, 39, 68, 0.1)',
        'drawer': '−32px 0 64px -8px rgba(26, 39, 68, 0.22)',
      },
    },
  },
  plugins: [],
}
