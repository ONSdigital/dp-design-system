const {
  general,
  supporting,
  census,
  neutral,
} = require('./src/views/data/colours');

const colors = { ...general, ...supporting, ...census, ...neutral };

module.exports = {
  purge: ['./src/**/*.njk', './src/js/*.js'],
  darkMode: false,
  theme: {
    colors: colors,
  },
  variants: {
    extend: {
      inset: ['active'],
    },
  },
};
