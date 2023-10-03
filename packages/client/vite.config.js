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

  const noTreeshakingForEvalPlugin = () => {
    return {
      name: 'no-treeshaking-for-eval',
      // hotfix for #5679
      transform(code) {
        if (code.match(/eval\( | getConditionalActionsForField/))
          return { moduleSideEffects: 'no-treeshake' }
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

  const VitePWAPlugin = () => {
    return VitePWA({
      strategies: 'injectManifest',
      injectManifest: {
        globDirectory: 'build/',
        globPatterns: ['**/*.{json,ico,ttf,html,js}'],
        globIgnores: ['**/config.js'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        swDest: 'build/src-sw.js'
      },
      srcDir: 'src/',
      filename: 'src-sw.ts',
      devOptions: {
        enabled: false,
        type: 'module',
        navigateFallback: 'index.html'
      }
    })
  }

  return {
    /*
     * https://github.com/storybookjs/storybook/issues/18920
     * the issue occurs because of util.js which is a
     * transitive depedency of storybook. I think it might
     * be a good idea to separate components and storybook
     * in that case because possibly storybook is getting
     * included in components bundle
     */
    define: { 'process.env': {} },
    // This changes the output dir from dist to build
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
    plugins: [htmlPlugin(), react(), tsconfigPaths(), VitePWAPlugin()],
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
