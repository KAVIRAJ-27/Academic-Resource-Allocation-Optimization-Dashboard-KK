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
        dark: {
          bg: '#080A0F',
          card: '#11141C',
          secondary: '#171A23',
          border: '#1E2330',
          hover: '#222838',
          text: '#F3F4F6',
          muted: '#9CA3AF',
        },
        brand: {
          teal: {
            DEFAULT: '#0D9488',
            light: '#14B8A6',
            hover: '#0F766E',
            glow: 'rgba(20, 184, 166, 0.25)',
          },
          purple: {
            DEFAULT: '#8B5CF6',
            light: '#A78BFA',
            dark: '#6D28D9',
          },
          blue: {
            DEFAULT: '#3B82F6',
            light: '#60A5FA',
            dark: '#1D4ED8',
          },
          orange: {
            DEFAULT: '#F97316',
            light: '#FB923C',
            dark: '#C2410C',
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.4)',
        'card-glow': '0 0 25px -5px rgba(20, 184, 166, 0.15)',
        'dropdown': '0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 4px 10px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
