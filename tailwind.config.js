/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1', // Indigo-500
        accent: '#ec4899',  // Pink-500
        success: '#10b981', // Green-500
        warning: '#f59e0b', // Amber-500
        danger: '#ef4444',  // Red-500
        cyan : '#06b6d9',    
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 15px rgba(99, 102, 241, 0.5)',
      },
      animation: {
        fade: 'fadeIn 0.5s ease-in-out',
        bounceSlow: 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),      // 🧩 for beautiful form styling
    require('@tailwindcss/typography'), // 📰 for better text layout
    require('@tailwindcss/aspect-ratio') // 📸 useful for responsive media
  ],
}
