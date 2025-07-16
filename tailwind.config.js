/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // tailwind.config.js

  // ... (keep the beginning of the file the same)
  theme: {
    extend: {
      colors: {
        // Dark Theme Palette (KEEP ALL OF THIS)
        primary: "#8ab4f8",
        "primary-dark": "#669df6",
        secondary: "#fbbc04",
        background: "#202124",
        surface: "#2d2e30",
        "surface-light": "#3c4043",
        "surface-dark": "#1f2023",
        "text-primary": "#e8eaed",
        "text-secondary": "#9aa0a6",
        success: "#81c995",
        error: "#f28b82",

        // NEW: Light Mode Palette for the Dashboard Page
        "light-background": "#f0f2f5", // A soft, off-white/light gray
        "light-text-subtle": "#b0b8c4", // Faint text for the "Your Courses" title
      },
      boxShadow: {
        // Keep this section
        card: "0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)",
        "card-hover":
          "0 1px 3px rgba(0, 0, 0, 0.2), 0 2px 6px 2px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [],
};
