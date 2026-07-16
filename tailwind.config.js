/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* Superfícies e texto vêm de CSS variables (ver index.css) e trocam
           entre claro/escuro. Os canais RGB ficam separados por espaço para
           o Tailwind poder aplicar opacidade: bg-surface/80 etc. */
        base: 'rgb(var(--base) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        elevated: 'rgb(var(--elevated) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        // Bordas e preenchimentos sutis (já incluem alpha próprio)
        hair: 'var(--hair)',
        'hair-strong': 'var(--hair-strong)',
        overlay: 'var(--overlay)',
        'overlay-2': 'var(--overlay-2)',
        // Laranja da marca (fixo nos dois temas)
        ember: {
          DEFAULT: '#FD4E17', // Laranja Primário (172 C)
          soft: '#FF7A21', // Laranja Secundário (1575 C)
          deep: '#D8400E',
          glow: '#FF7A21',
        },
        // Secondary chart accent (pink/magenta like the reference)
        magenta: '#FF2D7E',
        violet: '#8B5CF6',
        cyan: '#38BDF8',
        // Semantic
        positive: '#34D399',
        warning: '#FBBF24',
        danger: '#F5544F',
        // Texto (troca por tema)
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-sub': 'rgb(var(--ink-sub) / <alpha-value>)',
        'ink-mute': 'rgb(var(--ink-mute) / <alpha-value>)',
      },
      // Fonte única da marca: Manrope. As chaves display/mono continuam
      // existindo (as classes font-display / font-mono seguem válidas),
      // mas todas resolvem para Manrope.
      fontFamily: {
        display: ['Manrope', 'system-ui', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
        '3xl': '24px',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(253,78,23,0.35), 0 8px 40px -8px rgba(253,78,23,0.45)',
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
          '0%': { boxShadow: '0 0 0 0 rgba(253,78,23,0.5)' },
          '70%': { boxShadow: '0 0 0 10px rgba(253,78,23,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(253,78,23,0)' },
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
