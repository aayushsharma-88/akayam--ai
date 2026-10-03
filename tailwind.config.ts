import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // AKAYAM Design System Colors
        'bg-base': '#080A0F',
        'bg-surface': '#0E1117',
        'bg-card': '#141820',
        'bg-elevated': '#1E2535',
        'bg-input': '#111520',
        // Accents
        'akayam-cyan': '#60D4F5',
        'akayam-blue': '#4B8FEB',
        'akayam-violet': '#8B5CF6',
        'akayam-magenta': '#D946EF',
        'akayam-yellow': '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'rainbow-rotate': 'rainbow-rotate 8s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'drift': 'drift 4s ease-in-out infinite',
        'wing-flap': 'wing-flap 0.8s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fade-in 0.35s ease forwards',
        'fade-in-scale': 'fade-in-scale 0.25s ease forwards',
        'slide-in-right': 'slide-in-right 0.3s ease forwards',
        'slide-in-left': 'slide-in-left 0.3s ease forwards',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        'rainbow-rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'drift': {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(6px, -4px) rotate(5deg)' },
          '50%': { transform: 'translate(0, -8px) rotate(0deg)' },
          '75%': { transform: 'translate(-6px, -4px) rotate(-5deg)' },
          '100%': { transform: 'translate(0, 0) rotate(0deg)' },
        },
        'wing-flap': {
          '0%, 100%': { transform: 'scaleX(1)' },
          '50%': { transform: 'scaleX(0.6)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'fade-in': {
          'from': { opacity: '0', transform: 'translateY(8px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-scale': {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          'from': { opacity: '0', transform: 'translateX(20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          'from': { opacity: '0', transform: 'translateX(-20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #60D4F5, #4B8FEB, #8B5CF6, #D946EF)',
        'gradient-conic': 'conic-gradient(from 0deg, #60D4F5, #4B8FEB, #8B5CF6, #D946EF, #F59E0B, #60D4F5)',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(96, 212, 245, 0.2)',
        'glow-violet': '0 0 20px rgba(139, 92, 246, 0.2)',
        'glow-magenta': '0 0 20px rgba(217, 70, 239, 0.2)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.5)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}

export default config
