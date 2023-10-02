/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { mergeConfig } from 'vite'
import remarkGfm from 'remark-gfm'
import type { StorybookConfig } from '@storybook/react-vite'
import BRAND_BLUE from './theme'

const viteFinal = async (config: Record<string, any>) => {
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
const config: StorybookConfig = {
  viteFinal,
  stories: [
    '../@(src|stories)/**/*.stories.mdx',
    '../@(src|stories)/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm]
          }
        }
      }
    }
  ],
  staticDirs: ['../public'],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  docs: {
    autodocs: true
  }
}
export default config
