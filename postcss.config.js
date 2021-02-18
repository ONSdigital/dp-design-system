var cssnano = require('cssnano');
var plugins = [require('tailwindcss'), require('autoprefixer')];

if (process.env.NODE_ENV === 'production') {
  plugins.push(cssnano({ preset: 'default' }));
}

module.exports = { plugins: plugins };
