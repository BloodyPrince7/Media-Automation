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
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' }
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(-3deg)' },
          '50%': { transform: 'translateY(-10px) rotate(-1deg)' }
        },
        'float-alt': {
          '0%, 100%': { transform: 'translateY(0px) rotate(2.5deg)' },
          '50%': { transform: 'translateY(-12px) rotate(4deg)' }
        },
        'float-smooth': {
          '0%, 100%': { transform: 'translateY(0px) rotate(2deg)' },
          '50%': { transform: 'translateY(-8px) rotate(0.5deg)' }
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px) rotate(-2.5deg)' },
          '50%': { transform: 'translateY(-9px) rotate(-4deg)' }
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' }
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.97) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' }
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(4deg)' }
        },
        'pulse-radar': {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '50%': { transform: 'scale(1.25)', opacity: '0' },
          '100%': { transform: 'scale(0.95)', opacity: '0' }
        }
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        'marquee-fast': 'marquee 18s linear infinite',
        'marquee-reverse': 'marquee-reverse 28s linear infinite',
        'float-slow': 'float-slow 5s ease-in-out infinite',
        'float-alt': 'float-alt 6s ease-in-out infinite',
        'float-smooth': 'float-smooth 5.5s ease-in-out infinite',
        'float-reverse': 'float-reverse 6.5s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'spin-reverse': 'spin-reverse 25s linear infinite',
        'pop-in': 'pop-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-radar': 'pulse-radar 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    },
  },
  plugins: [],
}
