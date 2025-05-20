/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0066CC",
        secondary: "#FF8800",
        light: "#F8F9FA",
        dark: "#4A5568",
      },
    },
  },
  plugins: [],
}