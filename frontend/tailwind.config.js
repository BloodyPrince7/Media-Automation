/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        doooing: {
          cream: '#fef7e6',
          canvas: '#fbf6ea',
          blue: '#6a6afe',
          pink: '#ff6a91',
          green: '#6CEBB0',
          coral: '#f9665f',
          yellow: '#ffe400',
          cyan: '#9BD4D7',
          mint: '#8ee8b3',
          dark: '#111116',
          ink: '#1e1e24'
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'neo': '4px 4px 0px #111116',
        'neo-lg': '6px 6px 0px #111116',
        'neo-xl': '8px 8px 0px #111116',
        'neo-blue': '5px 5px 0px #6a6afe',
        'neo-pink': '5px 5px 0px #ff6a91',
        'neo-yellow': '5px 5px 0px #ffe400',
      }
    },
  },
  plugins: [],
}
