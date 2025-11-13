const colors = require("tailwindcss/colors");
const plugin = require("tailwindcss/plugin");

function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgba(var(${variable}), ${opacityValue})`;
  };
}
const baseFontSize = 16; // Define your base font size in pixels

const pxToEm = px => `${px / baseFontSize}rem`;

module.exports = {
  content: ["./src/**/*.{html,ts}"],
  important: ":root",
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': "1720px"
    },
    extend: {
      colors: {
        current: "currentColor",
        transparent: "transparent",

        "contrast-black": "black",
        "contrast-white": "white",
        gray: {
          light: "rgba(158, 158, 158, 0.1)",
          DEFAULT: "rgb(158, 158, 158)",
        },
        red: {
          light: "rgba(244, 67, 54, 0.1)",
          DEFAULT: "rgb(244, 67, 54)",
        },
        orange: {
          light: "rgba(255, 152, 0, 0.1)",
          DEFAULT: "rgb(255, 152, 0)",
        },
        "deep-orange": {
          light: "rgba(255, 87, 34, 0.1)",
          DEFAULT: "rgb(255, 87, 34)",
        },
        amber: {
          light: "rgba(255, 193, 7, 0.1)",
          DEFAULT: "rgb(255, 193, 7)",
        },
        green: {
          light: "rgba(76, 175, 80, 0.1)",
          DEFAULT: "rgb(76, 175, 80)",
        },
        teal: {
          light: "rgba(0, 150, 136, 0.1)",
          DEFAULT: "rgb(0, 150, 136)",
        },
        cyan: {
          light: "rgba(0, 188, 212, 0.1)",
          DEFAULT: "rgb(0, 188, 212)",
        },
        purple: {
          light: "rgba(156, 39, 176, 0.1)",
          DEFAULT: "rgb(156, 39, 176)",
        },
        "deep-purple": {
          light: "rgba(103, 58, 183, 0.1)",
          DEFAULT: "rgb(103, 58, 183)",
        },
        pink: {
          light: "rgba(233, 30, 99, 0.1)",
          DEFAULT: "rgb(233, 30, 99)",
        },
        primary: withOpacityValue("--color-primary"),
        accent: withOpacityValue("--color-accent"),
        warn: withOpacityValue("--color-warn"),
        "bg-page": "var(--bg-page)",
        "gray-100": "var(--gray-100)",
        "gray-200": "var(--gray-200)",
        "gray-300": "var(--gray-300)",
        "black-primary": "var(--black-primary)",
        "black-secondary": "var(--black-secondary)",
        "blue-primary": "var(--blue-primary)",
        "blue-secondary": "var(--blue-secondary)",
        "orange-primary": "var(--orange-primary)",
        "yellow-primary": "var(--yellow-primary)",
        "green-primary": "var(--green-primary)",
        "red-primary": "var(--red-primary)",
        "gray-light": "var(--gray-light)",
        "gray-light-100": "var(--gray-light-100)",
      },
      spacing: {
        gutter: "var(--padding-gutter)",
        '4c': pxToEm(4),
        '8c': pxToEm(8),
        '10c': pxToEm(10),
        '12c': pxToEm(12),
        '11c': pxToEm(11),
        '14c': pxToEm(14),
        '16c': pxToEm(16),
        '18c': pxToEm(18),
        '20c': pxToEm(20),
        '24c': pxToEm(24),
        '26c': pxToEm(26),
        '28c': pxToEm(28),
        '30c': pxToEm(30),
        '32c': pxToEm(32),
        '38c': pxToEm(38),
        '40c': pxToEm(40),
        '50c': pxToEm(50),
        '52c': pxToEm(52),
        '64c': pxToEm(64),
        '72c': pxToEm(72),
        '80c': pxToEm(80),
        '91c': pxToEm(91),
        '290c': pxToEm(290),
      },
      backgroundColor: (theme) => ({
        ...theme("colors"),
        base: "var(--background-base)",
        foreground: withOpacityValue("--background-foreground-rgb"),
        "app-bar": "var(--background-app-bar)",
        hover: "var(--background-hover)",
      }),
      borderColor: (theme) => ({
        ...theme("colors"),
        DEFAULT: "var(--foreground-divider)",
        divider: "var(--foreground-divider)",
      }),
      borderRadius: {
        none: "0px",
        xs: "calc(var(--border-radius) * 0.25)",
        sm: "calc(var(--border-radius) * 0.5)",
        DEFAULT: "var(--border-radius)",
        md: "calc(var(--border-radius) * 1.25)",
        lg: "calc(var(--border-radius) * 1.5)",
        xl: "calc(var(--border-radius) * 1.75)",
        "2xl": "calc(var(--border-radius) * 2)",
        full: "9999px",
        button: "var(--button-border-radius)",
      },
      boxShadow: {
        b: "0 10px 30px 0 rgba(82,63,104,.06)",
      },
      fontFamily: {
        sans: [
          "Merriweather Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          '"Noto Sans"',
          "sans-serif",
          '"Apple ColorDef Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto ColorDef Emoji"',
        ],
        serif: ["Georgia", "Cambria", '"Times New Roman"', "Times", "serif"],
        mono: [
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
      fontSize: {
        "2xs": "0.625rem",
        "8": pxToEm(8),
        "10": pxToEm(10),
        "12": pxToEm(12),
        "14": pxToEm(14),
        "16": pxToEm(16),
        "18": pxToEm(18),
        "20": pxToEm(20),
        "22": pxToEm(22),
        "24": pxToEm(24),
        "26": pxToEm(26),
        "28": pxToEm(28),
        "30": pxToEm(30),
        "32": pxToEm(32),
        "34": pxToEm(34),
        "44": pxToEm(44),
      },
      fontWeight: {
        100: 100,
        200: 200,
        300: 300,
        400: 400,
        500: 500,
        600: 600,
        700: 700,
        800: 800,
        900: 900,
      },
      lineHeight: {
        "16": pxToEm(16),
        "18": pxToEm(18),
        "20": pxToEm(20),
        "22": pxToEm(22),
        "24": pxToEm(24),
        "26": pxToEm(26),
      },
      margin: (theme, { negative }) => ({
        ...negative({
          gutter: "var(--padding-gutter)",
        }),
      }),
      textColor: (theme) => ({
        ...theme("colors"),
        black: "var(--text-color)",
        white: "var(--text-color-light)",
        secondary: "var(--text-secondary)",
        hint: "var(--text-hint)",
        "primary-contrast": "rgb(var(--color-primary-contrast))",
        "accent-contrast": "rgb(var(--color-accent-contrast))",
        "warn-contrast": "rgb(var(--color-warn-contrast))",
        "red-contrast": "#FFF",
        "green-contrast": "#FFF",
        "amber-contrast": "#000",
        "orange-contrast": "#000",
        "deep-orange-contrast": "#FFF",
        "purple-contrast": "#FFF",
        "deep-purple-contrast": "#FFF",
        "cyan-contrast": "#FFF",
        "teal-contrast": "#FFF",
        "gray-contrast": "#FFF",
        "light-green-contrast": "#000",
      }),
      placeholderColor: {
        black: "var(--text-color)",
        white: "var(--text-color-light)",
        secondary: "var(--text-secondary)",
      },
      maxWidth: {
        "3xs": "16rem",
        "2xs": "18rem",
        "24": pxToEm(24),

      },
      maxHeight: {
        "3xs": "16rem",
        "2xs": "18rem",
        "24": pxToEm(24),
      },
      minHeight: {
        '170': pxToEm(170),
        '200': pxToEm(200),
        '290': pxToEm(290),
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".icon-xs": {
          "font-size": "1rem",
          height: "1rem",
          width: "1rem",
          "line-height": "1rem",
        },
        ".icon-sm": {
          "font-size": "1.25rem",
          height: "1.25rem",
          width: "1.25rem",
          "line-height": "1.25rem",
        },
        ".icon-base": {
          "font-size": "1.5rem",
          height: "1.5rem",
          width: "1.5rem",
          "line-height": "1.5rem",
        },
        ".icon-lg": {
          "font-size": "1.75rem",
          height: "1.75rem",
          width: "1.75rem",
          "line-height": "1.75rem",
        },
        ".icon-xl": {
          "font-size": "2rem",
          height: "2rem",
          width: "2rem",
          "line-height": "2rem",
        },
        ".icon-2xl": {
          "font-size": "2.25rem",
          height: "2.25rem",
          width: "2.25rem",
          "line-height": "2.25rem",
        },
        ".icon-3xl": {
          "font-size": "2.5rem",
          height: "2.5rem",
          width: "2.5rem",
          "line-height": "2.5rem",
        },
        ".icon-4xl": {
          "font-size": "2.75rem",
          height: "2.75rem",
          width: "2.75rem",
          "line-height": "2.75rem",
        },
        ".icon-5xl": {
          "font-size": "3rem",
          height: "3rem",
          width: "3rem",
          "line-height": "3rem",
        },
      });
    }),
  ],
  corePlugins: {
    container: false,
  },
};
