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

import type { ViteFinal } from '@storybook/builder-vite'
const { mergeConfig } = require('vite')

const BRAND_BLUE =
  '#0058E0' /* See `theme.ts`. Cannot be imported from there due to 'Cannot use import statement outside a module' */

const viteFinal: ViteFinal = async (config) => {
  // return the customized config
  return mergeConfig(config, {
    // customize the Vite config here
    resolve: {
      alias: {
        crypto: 'crypto-js'
      }
    },
    build: {
      minify: false,
      sourcemap: false
    }
  })
}

const config = {
  viteFinal,
  typescript: {
    reactDocgen: 'react-docgen'
  },
  stories: [
    '../(src|stories)/**/*.stories.mdx',
    '../(src|stories)/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  core: { builder: '@storybook/builder-vite' },
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  staticDirs: ['../public'],
  framework: '@storybook/react',

  managerHead: (head: string) => {
    return `${head}
    <link rel="icon" href="favicon.png" />
    <style type="text/css">
      #storybook-explorer-tree .sidebar-item[data-selected=false] svg {
        color: ${BRAND_BLUE};
      }
    </style>
    `
  }
}

module.exports = config
