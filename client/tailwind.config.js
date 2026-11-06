/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          main: '#0B0B12',
          sidebar: '#11111B',
          card: '#171725',
          cardHover: '#1E1E30',
          input: '#12121E',
        },
        border: {
          subtle: '#232338',
          accent: '#33334F',
        },
        brand: {
          purple: '#8B5CF6',
          purpleLight: '#A78BFA',
          purpleDark: '#6D28D9',
          purpleGlow: 'rgba(139, 92, 246, 0.15)',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        },
        text: {
          main: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft-purple': '0 4px 20px -2px rgba(139, 92, 246, 0.15)',
        'card': '0 4px 12px 0 rgba(0, 0, 0, 0.35)',
      }
    },
  },
  plugins: [],
}

