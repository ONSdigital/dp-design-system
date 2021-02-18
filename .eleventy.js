const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');

module.exports = function (config) {
  config.addPlugin(eleventyNavigationPlugin);
  
  config.setBrowserSyncConfig({
    files: ['dist/**/*'],
    open: false,
  });
    
  config.addPassthroughCopy({ 'src/assets/images': './assets/images' });

  return {
    dir: {
      input: 'src/views',
      includes: 'partials',
      layouts: 'layouts',
      output: 'dist',
    },
  };
};
