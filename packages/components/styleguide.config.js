/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
const { styles, theme } = require('./styleguide.styles')

const path = require('path')

function getWebpackConfig() {
  const webpackConfig = require('./config/webpack.config.dev.js')
  if (!webpackConfig.devServer) {
    webpackConfig.devServer = {}
  }
  webpackConfig.devServer.disableHostCheck = true
  return webpackConfig
}

module.exports = {
  components: 'src/components/**/*.{ts,tsx}',
  propsParser: require('react-docgen-typescript').parse,
  styleguideDir: './lib',
  assetsDir: './static',
  skipComponentsWithoutExample: true,
  webpackConfig: getWebpackConfig(),
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
