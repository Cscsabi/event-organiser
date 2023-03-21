/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Segoe UI"', "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
