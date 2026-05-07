/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff', // fallback white
        card: '#f9f9f9',
        'card-hover': '#f1f1f1',
        'muted-foreground': '#888888',
        border: '#e5e7eb',
        primary: '#2563eb',
        accent: '#f59e42',
        secondary: '#10b981',
      },
    },
  },
  plugins: [],
};
