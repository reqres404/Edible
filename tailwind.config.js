/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#141B41",
        secondary: "#98B9F2",
        deep: "#1F1B3A",
        light: {
          100: "#D6C7FF",
          200: "#A8B5DB",
          300: "#9CA4AB",
        },
        dark: {
          100: "#221F3D",
          200: "#0F0D23",
        },
        accent: "#AB8BFF",
        offwhite:"#f0f4f7",
      },
    },
  },
  plugins: [],
};

// --bg-dark: oklch(0.1 0.055 257);
// --bg: oklch(0.15 0.055 257);
// --bg-light: oklch(0.2 0.055 257);
// --text: oklch(0.96 0.1 257);
// --text-muted: oklch(0.76 0.1 257);
// --highlight: oklch(0.5 0.11 257);
// --border: oklch(0.4 0.11 257);
// --border-muted: oklch(0.3 0.11 257);
// --primary: oklch(0.76 0.11 257);
// --secondary: oklch(0.76 0.11 77);
// --danger: oklch(0.7 0.11 30);
// --warning: oklch(0.7 0.11 100);
// --success: oklch(0.7 0.11 160);
// --info: oklch(0.7 0.11 260);