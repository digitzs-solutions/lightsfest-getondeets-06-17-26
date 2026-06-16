/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#cd2bee',
        'primary-dark': '#a61cbd',
        'bg-light': '#f8f6f8',
        'bg-dark': '#1f1022',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(205, 43, 238, 0.3)',
        'float': '0 10px 30px -10px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        'DEFAULT': '1rem',
        'lg': '1.5rem',
        'xl': '2.5rem',
        '2xl': '3.5rem',
        '3xl': '5rem',
      },
      dropShadow: {
        'glow': '0 0 20px rgba(205, 43, 238, 0.5)',
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
