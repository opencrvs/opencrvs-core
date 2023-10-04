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
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa'

process.env.VITE_APP_COUNTRY_CONFIG_URL =
  process.env.COUNTRY_CONFIG_URL || 'http://localhost:3040'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, 'env')

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
  const vitePWAPlugin = () => {
    return VitePWA({
      strategies: 'generateSW',
      injectManifest: {
        cacheId: 'ocrvs-login',
        globDirectory: 'build/',
        globIgnores: ['**/config.js'],
        globPatterns: ['**/*.{json,ico,ttf,html,js}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/__.*$/],
        swDest: 'build/service-worker.js'
      },
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /config\.js/,
            handler: 'NetworkFirst'
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  }
  return {
    // This changes the out put dir from dist to build
    build: {
      outDir: 'build',
      commonjsOptions: {
        transformMixedEsModules: true
      }
    },
    plugins: [htmlPlugin(), react(), tsconfigPaths(), vitePWAPlugin()],
    test: {
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      testTimeout: 60000,
      hookTimeout: 60000,
      globals: true,
      coverage: {
        reporter: ['text', 'json', 'html']
      }
    }
  }
})
