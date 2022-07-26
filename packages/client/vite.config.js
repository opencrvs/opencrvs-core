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
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

process.env.VITE_APP_COUNTRY_CONFIG_URL =
  process.env.COUNTRY_CONFIG_URL || 'http://localhost:3040'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, 'env')

  const noTreeshakingForEvalPlugin = () => {
    return {
      name: 'no-treeshaking-for-eval',
      transform(code) {
        if (code.match(/eval\(/)) return { moduleSideEffects: 'no-treeshake' }
      }
    }
  }

  const htmlPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(/%(.*?)%/g, function (_, p1) {
          return env[p1]
        })
      }
    }
  }
  return {
    // This changes the out put dir from dist to build
    build: {
      outDir: 'build',
      rollupOptions: {
        plugins: [noTreeshakingForEvalPlugin()]
      },
      commonjsOptions: {
        transformMixedEsModules: true
      }
    },
    resolve: {
      alias: {
        crypto: 'crypto-js'
      }
    },
    plugins: [htmlPlugin(), react(), tsconfigPaths()]
  }
})
