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
import type { StorybookConfig } from '@storybook/react-vite'
import { join, dirname } from 'path'

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')))
}

const viteFinal = async (config: Record<string, any>) => {
  // return the customized config
  return mergeConfig(config, {
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
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-a11y')
  ],
  staticDirs: ['../public', '../static'],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {}
  },
  docs: {
    autodocs: true
  }
}
export default config
