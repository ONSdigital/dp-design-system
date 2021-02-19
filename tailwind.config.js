const {
  general,
  supporting,
  census,
  neutral,
} = require('./src/views/data/colours');

const colors = { ...general, ...supporting, ...census, ...neutral };

module.exports = {
  purge: ['./src/**/*.njk'],
  darkMode: false,
  theme: {
    colors: colors,
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
