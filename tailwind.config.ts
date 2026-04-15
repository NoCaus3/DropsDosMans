import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rust: "#cd412b",
        twitch: "#9146ff",
        twitchLight: "#cba8ff",
        green: "#a1cd44",
        ink: {
          900: "#0a0b0b",
          950: "#0f0f0d",
          800: "#1a1c1c",
        },
        muted: {
          DEFAULT: "#ababab",
          dim: "#9c9c9c",
          soft: "#d8d8d8",
        },
        line: "rgba(171,171,171,.2)",
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Poppins", "sans-serif"],
      },
      maxWidth: {
        container: "1140px",
      },
      boxShadow: {
        card: "0 10px 20px rgba(0,0,0,.2)",
      },
    },
  },
  plugins: [],
};
export default config;
