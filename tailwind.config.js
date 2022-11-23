module.exports = {
  purge: ["./src/**/*.jsx"],
  darkMode: false,
  theme: {
    transitionTimingFunction: {
      "scale-cub": "cubic-bezier(.25,.1,.3,1.6)",
    },
    extend: {},
    minWidth: {
      "1/2": "50%",
      "3/4": "75%",
    },
    screens: {
      sm: "300px",
      //@media (min-width: 640px) { /* ... */ }

      md: "768px",
      //@media (min-width: 768px) { /* ... */ }

      lg: "1024px",
      //@media (min-width: 1024px) { /* ... */ }

      xl: "1280px",
      //@media (min-width: 1280px) { /* ... */ }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
