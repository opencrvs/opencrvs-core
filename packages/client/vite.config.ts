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
import dns from 'node:dns'

// fixes issue where Cypress was not able to resolve Vite's localhost
// https://github.com/cypress-io/cypress/issues/25397#issuecomment-1775454875
dns.setDefaultResultOrder('ipv4first')

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, 'env')

  const noTreeshakingForEvalPlugin = () => {
    return {
      name: 'no-treeshaking-for-eval',
      // hotfix for #5679
      transform(code: string) {
        if (code.match(/eval\( | getConditionalActionsForField/))
          return { moduleSideEffects: 'no-treeshake' as const }
      }
    }
  }

  const htmlPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html: string) {
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
        enabled: true,
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
    define: {
      global: {},
      'process.env': {},
      APP_VERSION: JSON.stringify(process.env.npm_package_version)
    },
    // This changes the output dir from dist to build
    build: {
      outDir: 'build',
      rollupOptions: {
        plugins: [noTreeshakingForEvalPlugin()]
      },
      commonjsOptions: {
        transformMixedEsModules: true
      },
      sourcemap: true
    },
    resolve: {
      alias: {
        crypto: require.resolve('crypto-js'),
        '@opencrvs/commons/build/dist/authentication':
          '@opencrvs/commons/authentication'
      }
    },
    plugins: [
      htmlPlugin(),
      react({
        babel: {
          plugins: [
            [
              'babel-plugin-styled-components',
              {
                displayName: true,
                fileName: false
              }
            ]
          ]
        }
      }),
      tsconfigPaths(),
      VitePWAPlugin()
    ],
    test: {
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      testTimeout: 60000,
      hookTimeout: 60000,
      globals: true
    },
    server: {
      // to get the manifest.json and images from country-config during development time
      proxy: {
        '/manifest.json': {
          target: 'http://localhost:3040/static/',
          changeOrigin: true
        },
        '/images/': {
          target: 'http://localhost:3040/static/',
          changeOrigin: true
        },
        '/api/countryconfig/': {
          target: 'http://localhost:3040',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/countryconfig/, '')
        },
        '/api/': {
          target: 'http://localhost:7070',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
