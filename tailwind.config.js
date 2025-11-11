/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Important: Use class-based strategy to avoid conflicts with Ionic
  important: '#root',
  theme: {
    extend: {
      // Add custom colors if needed, preserve Ionic variables
      colors: {
        // Ionic color palette can be accessed via CSS variables
        // Example: 'var(--ion-color-primary)'
      },
    },
  },
  // Disable preflight to avoid conflicts with Ionic's base styles
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
