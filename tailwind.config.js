/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fpt-blue': {
          DEFAULT: '#0651A0',
          light: '#008DDE',
        },
        'fpt-orange': {
          DEFAULT: '#F37124',
          light: '#FF8C42',
        },
      },
    },
  },
  plugins: [],
}

