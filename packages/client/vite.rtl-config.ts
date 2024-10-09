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
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    /*
     * https://github.com/storybookjs/storybook/issues/18920
     * the issue occurs because of util.js which is a
     * transitive depedency of storybook. I think it might
     * be a good idea to separate components and storybook
     * in that case because possibly storybook is getting
     * included in components bundle
     */
    define: {
      'process.env': {},
      APP_VERSION: JSON.stringify(process.env.npm_package_version)
    },
    plugins: [react(), tsconfigPaths()],
    test: {
      environment: 'jsdom',
      setupFiles: './src/setupRTLTests.ts',
      include: ['**/*.test-rtl.ts?(x)'],
      globals: true,
      coverage: {
        reporter: ['text', 'json', 'html']
      }
    }
  }
})
