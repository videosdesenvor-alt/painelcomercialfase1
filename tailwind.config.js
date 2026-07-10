/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base surfaces (warm near-black → charcoal)
        base: '#0B0B0C',
        surface: '#131315',
        elevated: '#1A1A1D',
        card: '#202024',
        hair: 'rgba(255,255,255,0.07)',
        // Brand orange (vermilion) ramp
        ember: {
          DEFAULT: '#FF4C24',
          soft: '#FF6A3D',
          deep: '#E8380F',
          glow: '#FF7A45',
        },
        // Secondary chart accent (pink/magenta like the reference)
        magenta: '#FF2D7E',
        violet: '#8B5CF6',
        cyan: '#38BDF8',
        // Semantic
        positive: '#34D399',
        warning: '#FBBF24',
        danger: '#F5544F',
        // Text
        ink: '#F5F5F4',
        'ink-sub': '#A6A6AD',
        'ink-mute': '#6B6B72',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
        '3xl': '24px',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,76,36,0.35), 0 8px 40px -8px rgba(255,76,36,0.45)',
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 48px -24px rgba(0,0,0,0.8)',
        lift: '0 20px 60px -20px rgba(0,0,0,0.9)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'aurora-drift': {
          '0%,100%': { transform: 'translate(-4%, -2%) scale(1)' },
          '50%': { transform: 'translate(4%, 3%) scale(1.12)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(255,76,36,0.5)' },
          '70%': { boxShadow: '0 0 0 10px rgba(255,76,36,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255,76,36,0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        aurora: 'aurora-drift 14s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
      },
    },
  },
  plugins: [],
}
