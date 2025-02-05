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
      },
      fontFamily: {
        nerko: ['"Nerko One"', "cursive"],
      },
    },
  },
  daisyui: {
    themes: ["winter"],
  },
  plugins: [
    require('daisyui'),
  ],
};
