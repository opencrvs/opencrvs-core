const { styles, theme } = require('./styleguide.styles')

const path = require('path')

module.exports = {
  components: 'src/components/**/*.{ts,tsx}',
  propsParser: require('react-docgen-typescript').parse,
  styleguideDir: './lib',
  skipComponentsWithoutExample: true,
  webpackConfig: require('react-scripts-ts/config/webpack.config.dev.js'),
  styleguideComponents: {
    Wrapper: path.join(__dirname, 'src/components/styleguide/ThemeWrapper')
  },
  sections: [
    {
      name: 'Buttons',
      components: './src/components/buttons/**/*.tsx'
    },
    {
      name: 'Forms',
      components: './src/components/forms/**/*.tsx'
    },
    {
      name: 'Typography',
      components: './src/components/typography/**/*.tsx'
    },
    {
      name: 'Interface',
      components: './src/components/interface/**/*.tsx',
      sections: [
        {
          name: 'Icons',
          components: './src/components/icons/**/*.tsx'
        }
      ]
    },
    {
      name: 'Other',
      components: './src/components/*.tsx'
    }
  ],
  styles,
  theme
}
