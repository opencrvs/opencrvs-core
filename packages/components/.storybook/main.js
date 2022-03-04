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

const custom = require('./webpack.config')
const path = require('path')
module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-create-react-app'
  ],
  framework: '@storybook/react',
  webpackFinal: async (config) => {
    return {
      ...config,
      // module: { ...config.module, rules: custom.module?.rules }
      module: {
        ...config.module,
        rules: [
          ...config.module.rules,
          {
            test: /\.(png|woff|woff2|eot|ttf|svg)$/,
            use: [
              {
                loader: 'file-loader',
                query: {
                  name: '[name].[ext]'
                }
              }
            ],
            include: path.resolve(__dirname, '../')
          }
        ]
        // }
        // }
        // webpackFinal: async (config) => {
        //   config.plugins.push(...);
        //   return config
      }
    }
  }
}

// module.exports = async ({ config, mode }) => {
//   config.plugins.push(...)
//   return config;
// }
