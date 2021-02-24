const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const {generateHTML} = require('./lib/generateHTML')

module.exports = function (config) {
  config.addPlugin(eleventyNavigationPlugin);
  config.addPlugin(syntaxHighlight)

  config.setBrowserSyncConfig({
    files: ['dist/**/*'],
    open: false,
  });

  config.addPassthroughCopy({ 'src/assets/images': './assets/images' });
  config.addNunjucksShortcode("generateHTML", generateHTML)

  return {
    dir: {
      input: 'src/views',
      includes: 'partials',
      layouts: 'layouts',
      output: 'dist',
      data: 'data',
    },
  };
};
