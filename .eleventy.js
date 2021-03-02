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
  config.addPassthroughCopy({ 'src/js': '/js'})
  config.addPassthroughCopy({ 'src/img': './assets/images' });

  config.addNunjucksShortcode("generateHTML", generateHTML)

  config.addCollection('styles', (collection) => {
    const styles = collection
      .getAllSorted()
      .filter((item) => item.url && item.inputPath.includes('styles'));

    return styles;
  });

  config.addCollection('components', (collection) => {
    const components = collection
      .getAllSorted()
      .filter(item => item.url && item.inputPath.includes('components'));
    
    return components;
  })

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
