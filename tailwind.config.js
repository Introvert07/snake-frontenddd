/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        retro: '#0f0', // Neon green for hacker feel
      }
    },
  },
  plugins: [],
}