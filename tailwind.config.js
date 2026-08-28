/**
 * Shiour Gavriel — Tailwind config.
 * Palette inspirée du flyer : marine profond + doré/moutarde sur fond crème,
 * esprit affiche (contrairement au style plus épuré de Cap Expertises).
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sg: {
          navy: "#12233F",
          "navy-700": "#0B1830",
          "navy-300": "#1D3A63",
          gold: "#C99A3D",
          "gold-ink": "#6B4E14",
          "gold-light": "#E7C77A",
          cream: "#F4ECD8",
          paper: "#FBF7EE",
          ink: "#1C1B17",
          "ink-muted": "#5B5646",
          muted: "#7A7462",
          border: "#E3D9BE",
          "on-navy": "#F7F3E8",
          "on-navy-muted": "#C7CEDB",
          flag: "#1E4C9A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "Times New Roman", "serif"],
        body: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        "sg-sm": "8px",
        "sg-md": "12px",
        "sg-lg": "16px",
        "sg-xl": "22px",
        "sg-pill": "100px",
      },
      boxShadow: {
        "sg-card": "0 1px 2px rgba(28,27,23,.06), 0 24px 50px -28px rgba(18,35,63,.35)",
        "sg-cta": "0 10px 24px -12px rgba(201,154,61,.85)",
      },
      backgroundImage: {
        "sg-hero-navy": "radial-gradient(125% 130% at 82% -10%, #1D3A63 0%, #12233F 48%, #0B1830 100%)",
      },
      maxWidth: { "sg-container": "1160px" },
      spacing: { "sg-gutter": "24px" },
    },
  },
  plugins: [],
};
