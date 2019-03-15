const { styles, theme } = require('./styleguide.styles')

const path = require('path')

module.exports = {
  components: 'src/components/**/*.{ts,tsx}',
  propsParser: require('react-docgen-typescript').parse,
  styleguideDir: './lib',
  assetsDir: './static',
  skipComponentsWithoutExample: true,
  webpackConfig: require('react-scripts-ts/config/webpack.config.dev.js'),
  styleguideComponents: {
    Wrapper: path.join(__dirname, 'src/components/styleguide/ThemeWrapper')
  },
  getComponentPathLine(componentPath) {
    const name = path.basename(componentPath, '.tsx')
    const dir = path.dirname(componentPath)
    const exportDirectory = dir
      .split('src/components/')
      .slice(1)[0]
      .split('/')[0]
    return `import {${name}} from '@opencrvs/components/lib/${exportDirectory}';`
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
      name: 'Files',
      components: './src/components/files/**/*.tsx'
    },
    {
      name: 'Charts',
      components: './src/components/charts/**/*.tsx'
    },
    {
      name: 'Other',
      components: './src/components/*.tsx'
    }
  ],
  styles,
  theme
}
