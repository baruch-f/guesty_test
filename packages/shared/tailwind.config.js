// packages/shared/tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    '../host/src/**/*.{js,jsx,ts,tsx}',
    '../remote-users/src/**/*.{js,jsx,ts,tsx}',
    '../remote-statistic/src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef9ff',
          100: '#d9f0ff',
          200: '#b3e0ff',
          300: '#84ccff',
          400: '#3ea6ff',
          500: '#007fff',
          600: '#0063d4',
          700: '#004ca6',
          800: '#003b82',
          900: '#002e66'
        },
        neutral: {
          900: '#111827',
          700: '#374151',
          500: '#6b7280',
          200: '#e5e7eb'
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 10px 25px -15px rgba(15, 23, 42, 0.35)'
      },
      borderRadius: {
        xl: '0.875rem'
      }
    }
  },
  plugins: []
};