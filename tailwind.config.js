/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14110f',
        paper: '#efe6d0',
        ember: '#b46a3a',
        jade: '#5c7a6a',
        dusk: '#2e4057',
      },
      boxShadow: {
        glow: '0 0 40px rgba(212, 169, 95, 0.18)',
      },
      backgroundImage: {
        grain:
          'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.09), transparent 30%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.05), transparent 20%), linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0))',
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        body: ['"Trebuchet MS"', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.45', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.04)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
