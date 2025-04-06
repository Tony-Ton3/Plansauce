/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        text: "#02080a",
        background: "#f3fbfd",
        primary: "#26bede",
        secondary: "#9085ec",
        accent: "#8e5fe7",
        brand: {
          yellow: "#fcc700",
          orange: "#ff8905",
          black: "#000000",
          gray: "#433f3b",
          pink: "#f42f98",
        },
      },
      fontFamily: {
        nerko: ['"Nerko One"', "cursive"],
      },
    },
  },
  daisyui: {
    themes: ["winter"],
  },
  plugins: [require("daisyui")],
};
