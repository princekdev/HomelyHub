/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff3f0",
          100: "#ffe4dc",
          200: "#ffc7b8",
          300: "#ff9d85",
          400: "#ff6b4a",
          500: "#f6402a", // primary HomelyHub coral-red
          600: "#e02a1f",
          700: "#b81e18",
          800: "#931c19",
          900: "#791b1a",
        },
        ink: {
          50: "#f6f7f8",
          100: "#eceef0",
          200: "#d5d9de",
          300: "#b1b8c2",
          400: "#8791a0",
          500: "#697384",
          600: "#545c6c",
          700: "#454b58",
          800: "#3b404b",
          900: "#22252c",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(15, 23, 42, 0.08)",
        cardHover: "0 12px 28px rgba(15, 23, 42, 0.14)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
