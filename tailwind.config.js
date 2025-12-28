/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        github: {
          dark: '#0d1117',
          darkAlt: '#161b22',
          border: '#30363d',
          green: '#2ea44f',
          blue: '#58a6ff',
        }
      }
    },
  },
  plugins: [],
}
