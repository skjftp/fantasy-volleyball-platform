/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2', 
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
  safelist: [
    // Ensure commonly used classes are always included
    'bg-red-600',
    'bg-red-700', 
    'bg-red-800',
    'text-red-600',
    'text-red-100',
    'border-red-600',
    'hover:bg-red-700',
    'bg-primary-600',
    'bg-primary-700',
    'text-primary-600',
    'text-primary-100',
  ]
}