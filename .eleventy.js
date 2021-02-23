const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');

module.exports = function (config) {
  config.addPlugin(eleventyNavigationPlugin);

  config.setBrowserSyncConfig({
    files: ['dist/**/*'],
    open: false,
  });

  config.addPassthroughCopy({ 'src/img': './assets/images' });

  config.addCollection('styles', (collection) => {
    const styles = collection
      .getAllSorted()
      .filter((item) => item.url && item.inputPath.includes('styles'));

    return styles;
  });

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
