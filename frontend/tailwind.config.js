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
        // Classical Ivory & Gold Academic Palette
        academic: {
          bg: '#FFFEFA',
          secondary: '#F8F6F0',
          card: '#FFFFFF',
          panel: '#FBF9F3',
          text: '#202020',
          secondaryText: '#555555',
          mutedText: '#77736A',
          gold: {
            DEFAULT: '#B8A16A',
            light: '#D8C9A8',
            hover: '#A38C57',
            subtle: '#F4F0E6',
            dark: '#8C7748',
          },
          border: '#D8C9A8',
          divider: '#E8E0D0',
          inputBorder: '#D9D2C3',
          hover: '#F4F0E6',
        },
        // Core Layout Surfaces
        canvas: {
          DEFAULT: '#FFFEFA',
          subtle: '#F8F6F0',
          muted: '#FBF9F3',
        },
        sidebar: {
          DEFAULT: '#FFFFFF',
          hover: '#F4F0E6',
          active: '#F4F0E6',
          border: '#E8E0D0',
          text: '#202020',
          muted: '#77736A',
        },
        card: {
          DEFAULT: '#FFFFFF',
          hover: '#FBF9F3',
          border: '#D8C9A8',
        },
        // Override standard Tailwind palettes to Classical Ivory & Gold
        slate: {
          50: '#FBF9F3',
          100: '#F8F6F0',
          200: '#E8E0D0',
          300: '#D8C9A8',
          400: '#77736A',
          500: '#555555',
          600: '#3D3A35',
          700: '#2D2B27',
          800: '#202020',
          900: '#181818',
          950: '#101010',
        },
        indigo: {
          50: '#FAF7F0',
          100: '#F4F0E6',
          200: '#E8D8BA',
          300: '#D8C9A8',
          400: '#C7B282',
          500: '#B8A16A',
          600: '#B8A16A',
          700: '#A38C57',
          800: '#8C7748',
          900: '#735F35',
          950: '#4D3E1F',
        },
        // Brand & Role Accents (aligned to classical scheme)
        brand: {
          gold: {
            DEFAULT: '#B8A16A',
            light: '#D8C9A8',
            dark: '#8C7748',
            subtle: '#F4F0E6',
          },
          indigo: {
            DEFAULT: '#B8A16A',
            light: '#D8C9A8',
            dark: '#A38C57',
            subtle: '#F4F0E6',
          },
          teal: {
            DEFAULT: '#3F7655',
            light: '#538D6B',
            hover: '#326044',
            subtle: '#EEF6F1',
          },
          slate: {
            DEFAULT: '#202020',
            secondary: '#555555',
            muted: '#77736A',
          },
        },
        // Semantic Status Accents
        status: {
          success: {
            DEFAULT: '#3F7655',
            subtle: '#EEF6F1',
            border: '#C1DFCD',
            text: '#3F7655',
          },
          warning: {
            DEFAULT: '#A87928',
            subtle: '#FAF4E8',
            border: '#EED9B2',
            text: '#A87928',
          },
          error: {
            DEFAULT: '#B44747',
            subtle: '#FDF0F0',
            border: '#ECC6C6',
            text: '#B44747',
          },
          info: {
            DEFAULT: '#657C91',
            subtle: '#EFF4F8',
            border: '#C6D5E2',
            text: '#657C91',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'Cormorant Garamond', 'serif'],
        heading: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        cinzel: ['Cinzel', 'serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
      },
      boxShadow: {
        'card': '0 8px 24px rgba(90, 75, 45, 0.06)',
        'card-hover': '0 12px 30px rgba(90, 75, 45, 0.10)',
        'dropdown': '0 14px 28px rgba(90, 75, 45, 0.08), 0 4px 10px rgba(90, 75, 45, 0.04)',
        'modal': '0 24px 48px -12px rgba(40, 30, 15, 0.18), 0 8px 20px rgba(90, 75, 45, 0.08)',
        'gold-glow': '0 0 20px -2px rgba(184, 161, 106, 0.35)',
        'glass': '0 8px 24px rgba(90, 75, 45, 0.06)',
        'glass-hover': '0 12px 32px rgba(90, 75, 45, 0.10)',
        'glass-sm': '0 4px 16px rgba(90, 75, 45, 0.04)',
        'glass-lg': '0 18px 42px rgba(90, 75, 45, 0.12)',
      }
    },
  },
  plugins: [],
}
