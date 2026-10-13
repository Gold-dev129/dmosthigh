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
          yellow: '#FFE600',
          yellowHover: '#E5CF00',
          yellowLight: '#FFF566',
          black: '#0A0A0A',
          blackPure: '#000000',
          darkCard: '#121212',
          darkBorder: '#262626',
          muted: '#8E8E93',
          gray: '#1C1C1E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Impact', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.05em',
        widest: '0.25em',
      }
    },
  },
  plugins: [],
}
