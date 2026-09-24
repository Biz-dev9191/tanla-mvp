/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aurora: {
          primary: "#2B4C7E",
          "primary-hover": "#223D66",
          "primary-light": "#EAF0F8",
          neutral: {
            900: "#1A1D21",
            700: "#374151",
            500: "#6B7280",
            300: "#D1D5DB",
            200: "#E5E7EB",
            100: "#F5F6F8",
            0: "#FFFFFF",
          },
          accent: "#F2994A",
          "accent-light": "#FEF5EC",
          success: "#1E8E5A",
          "success-light": "#E8F5EF",
          warning: "#C7551A",
          "warning-light": "#FAEEE8",
          error: "#B3261E",
          "error-light": "#F9ECEB",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        aurora: "0 1px 3px 0 rgba(26, 29, 33, 0.06), 0 1px 2px 0 rgba(26, 29, 33, 0.04)",
        "aurora-md": "0 4px 6px -1px rgba(26, 29, 33, 0.08), 0 2px 4px -1px rgba(26, 29, 33, 0.04)",
        "aurora-lg": "0 10px 15px -3px rgba(26, 29, 33, 0.08), 0 4px 6px -2px rgba(26, 29, 33, 0.03)",
      },
    },
  },
  plugins: [],
};
