/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17202a',
        line: '#d8dee6',
        surface: '#f7f8fa',
        brand: '#256f7a',
        mint: '#2f9e75',
        amber: '#b7791f',
        plum: '#7f4f8b',
      },
      boxShadow: {
        panel: '0 12px 32px rgba(23, 32, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
