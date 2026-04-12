/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/ui/index.html",
    "./src/ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#003d9b',
        primary_container: '#0052cc',
        surface: '#f9f9ff',
        surface_container_low: '#f0f3ff',
        surface_container: '#e6e9f5',
        surface_container_high: '#dee1f0',
        surface_container_highest: '#d6e3ff',
        surface_container_lowest: '#ffffff',
        on_surface: '#091c35',
        outline_variant: 'rgba(9, 28, 53, 0.15)',
        error: '#ba1a1a',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        'ambient': '0px 12px 32px rgba(9, 28, 53, 0.06)',
      }
    },
  },
  plugins: [],
}
