/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.{ejs,html}",
    "./public/**/*.{js,css}"
  ],
  theme: {
    extend: {
      colors: {
        forest: { 50:'#f2f9f2', 100:'#e0f2df', 200:'#bde4ba', 300:'#8fce8a', 400:'#5cb356', 500:'#3a9134', 600:'#2d7429', 700:'#255e22', 800:'#1f4b1d', 900:'#183d17',950:'#0e2410' },
        harvest: { 50:'#fffbeb', 100:'#fef3c7', 200:'#fde68a', 300:'#fcd34d', 400:'#fbbf24', 500:'#f59e0b', 600:'#d97706', 700:'#b45309', 800:'#92400e', 900:'#78350f' },
        terra:   { 50:'#fff7ed', 100:'#ffedd5', 200:'#fed7aa', 300:'#fdba74', 400:'#fb923c', 500:'#f97316', 600:'#ea580c', 700:'#c2410c', 800:'#9a3412', 900:'#7c2d12' },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        fadeUpOrder: 'fadeUpOrder .4s ease forwards',
      },
      keyframes: {
        fadeUpOrder: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    }
  },
  plugins: [],
}

