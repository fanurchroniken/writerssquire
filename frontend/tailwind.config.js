/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // WriterSquire Brand Colors
        'ink-blue': {
          DEFAULT: '#1A365D',
          dark: '#0F2439',
          light: '#2D4A6B',
        },
        'parchment': {
          DEFAULT: '#F7F5F3',
          light: '#FEFEFE',
        },
        'sage': {
          DEFAULT: '#4A7C59',
          light: '#6B9B7A',
        },
        'amber': {
          DEFAULT: '#D4A574',
          light: '#E5C19A',
        },
        'charcoal': {
          DEFAULT: '#2D3748',
          light: '#4A5568',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Source Serif Pro', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
