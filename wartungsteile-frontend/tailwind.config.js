/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E88E5",
        secondary: "#FF6B35",
        light: "#F8F9FA",
        dark: "#4A5568",
      },
    },
  },
  plugins: [],
}