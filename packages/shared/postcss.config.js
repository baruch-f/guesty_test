module.exports = {
  plugins: [
    require('tailwindcss')({
      config: require.resolve('./tailwind.config.js')
    }),
    require('autoprefixer')
  ]
};