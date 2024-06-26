/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        "3xl":
          "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px",
        "4xl":
          "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px",
      },
      colors: {
        "grey":"#858585",
        "blue0":"#353647",
        "blue1":"#303141",
        "blue2":"#5a65ca",
        "blue3":"#343546",
        "blue4":"#414256",
        "blue5":"#343543",
        "color1":"#b92b27",
        "color2":"#1565C0",
      }
    },
  },
  plugins: [],
};
