/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep green-black base — near-black with a calm green undertone.
        ink: '#0c120d',
        coal: '#101711',
        graphite: '#18211a',
        // Refined matcha green system (no neon).
        matcha: '#8aa05f', // primary — soft ceremonial green
        'matcha-deep': '#5e7242', // richer mid green
        'matcha-soft': '#b9c79a', // muted highlight
        // Warm cream / off-white.
        cream: '#f4f1ea',
        sand: '#e7e1d3',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: [
          '"General Sans"',
          'Satoshi',
          'var(--font-inter)',
          'Inter',
          'sans-serif',
        ],
      },
      letterSpacing: {
        widest2: '0.35em',
      },
      transitionTimingFunction: {
        cinema: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};