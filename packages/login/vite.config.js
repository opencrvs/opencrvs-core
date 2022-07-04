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

import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import VitePluginHtmlEnv from 'vite-plugin-html-env'
import tsconfigPaths from 'vite-tsconfig-paths'

process.env.VITE_APP_COUNTRY_CONFIG_URL =
  process.env.COUNTRY_CONFIG_URL || 'http://localhost:3040'

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: 'build',
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  plugins: [tsconfigPaths(), VitePluginHtmlEnv(), reactRefresh()]
})
