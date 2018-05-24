const {
  styles,
  theme
} = require('./styleguide.styles')


const path = require('path')

module.exports = {
  components: 'src/components/**/*.{ts,tsx}',
  propsParser: require('react-docgen-typescript').parse,
  styleguideDir: './lib',
  webpackConfig: require('react-scripts-ts/config/webpack.config.dev.js'),
  styleguideComponents: {
    Wrapper: path.join(__dirname, 'src/components/ThemeWrapper')
  },
  styles,
  theme
};
