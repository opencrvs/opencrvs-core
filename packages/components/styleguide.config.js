module.exports = {
  components: 'src/components/**/*.{ts,tsx}',
  propsParser: require('react-docgen-typescript').parse,
  styleguideDir: './lib',
  webpackConfig: require('react-scripts-ts/config/webpack.config.dev.js')
};
