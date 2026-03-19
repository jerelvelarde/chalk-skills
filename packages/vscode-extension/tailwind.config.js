/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/webview/**/*.{tsx,ts,jsx,js}'],
  theme: {
    extend: {
      colors: {
        // Phase colors
        'phase-foundation': { DEFAULT: '#64748b', light: '#94a3b8' },
        'phase-design': { DEFAULT: '#8b5cf6', light: '#a78bfa' },
        'phase-architecture': { DEFAULT: '#06b6d4', light: '#22d3ee' },
        'phase-engineering': { DEFAULT: '#f59e0b', light: '#fbbf24' },
        'phase-development': { DEFAULT: '#22c55e', light: '#4ade80' },
        'phase-launch': { DEFAULT: '#f97316', light: '#fb923c' },
        'phase-reference': { DEFAULT: '#6366f1', light: '#818cf8' },
        // Rarity colors
        'rarity-common': { DEFAULT: '#9ca3af', glow: '#d1d5db' },
        'rarity-rare': { DEFAULT: '#3b82f6', glow: '#60a5fa' },
        'rarity-epic': { DEFAULT: '#a855f7', glow: '#c084fc' },
        // Game UI
        'xp-bar': '#fbbf24',
        'xp-bg': '#1e1b2e',
        'card-bg': '#1a1a2e',
        'card-border': '#2a2a4a',
        'surface': '#0f0f1a',
        'surface-light': '#1a1a2e',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'badge-unlock': 'badge-unlock 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'badge-unlock': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      backgroundImage: {
        'holographic': 'linear-gradient(135deg, #ff006620, #00ff8820, #0066ff20, #ff006620)',
      },
    },
  },
  plugins: [],
};
