/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Derived from Vutto's live palette (see ASSUMPTIONS.md).
        ink: { DEFAULT: '#222222', soft: '#444444', muted: '#767676' },
        brand: {
          DEFAULT: '#0050FF',
          600: '#0047E0',
          700: '#003BC0',
          light: '#3478F5',
          50: '#EEF3FF',
          100: '#DCE7FF',
        },
        accent: { DEFAULT: '#FF8B2B', soft: '#FFF8F3', 600: '#F57714' },
        success: { DEFAULT: '#12AA00', soft: '#E9F8E6' },
        danger: { DEFAULT: '#FF2929', soft: '#FFECEC' },
        pink: { DEFAULT: '#D23657' },
        cream: '#F0EFEB',
        surface: '#F5F5F5',
        line: { DEFAULT: '#EBEBEB', strong: '#DEDEDE' },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '1.25rem',
        '2.5xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(17,24,39,0.04), 0 4px 12px rgba(17,24,39,0.05)',
        card: '0 2px 8px rgba(17,24,39,0.06), 0 12px 28px rgba(17,24,39,0.06)',
        lifted: '0 12px 40px rgba(0,80,255,0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(18,170,0,0.5)' },
          '70%': { boxShadow: '0 0 0 10px rgba(18,170,0,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(18,170,0,0)' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'pulse-ring': 'pulse-ring 1.8s infinite',
      },
    },
  },
  plugins: [],
};
