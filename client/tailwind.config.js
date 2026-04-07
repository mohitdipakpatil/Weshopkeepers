/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#0F172A', 800: '#1E293B', 700: '#334155' },
        electric: { DEFAULT: '#3B82F6', dark: '#2563EB', light: '#60A5FA' },
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68,-0.55,0.265,1.55)',
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        bounceIn: { from: { transform: 'scale(0)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
      },
    },
  },
  plugins: [],
};
