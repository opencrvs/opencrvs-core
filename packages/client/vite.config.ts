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
import { createRequire } from 'node:module'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa'
import dns from 'node:dns'

// Vite 8 loads the config as ESM, where `require` is not defined globally.
const require = createRequire(import.meta.url)

// fixes issue where Cypress was not able to resolve Vite's localhost
// https://github.com/cypress-io/cypress/issues/25397#issuecomment-1775454875
dns.setDefaultResultOrder('ipv4first')

/**
 * Peer addresses and the dev-server port are env-driven so that several local
 * environments (git worktrees) can run side by side on one machine, each on its
 * own port block. Every default below is the historical hardcoded value, so an
 * unset environment behaves exactly as before.
 */
const withoutTrailingSlash = (url: string) => url.replace(/\/+$/, '')

const CLIENT_PORT = Number(process.env.CLIENT_PORT ?? 3000)
const GATEWAY_URL = withoutTrailingSlash(
  process.env.GATEWAY_URL ?? 'http://localhost:7070'
)
const COUNTRY_CONFIG_URL = withoutTrailingSlash(
  process.env.COUNTRY_CONFIG_URL ?? 'http://localhost:3040'
)
const LOGIN_URL = withoutTrailingSlash(
  process.env.LOGIN_URL ?? 'http://localhost:3020'
)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, 'env')

  const loginRedirectPlugin = () => ({
    name: 'login-redirect',
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/login')) {
          const suffix = req.url.replace(/^\/login/, '') || '/'
          res.writeHead(302, { Location: `${LOGIN_URL}${suffix}` })
          res.end()
          return
        }
        next()
      })
    }
  })

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
        transformMixedEsModules: true,
        defaultIsModuleExports: true
      },
      sourcemap: true
    },
    resolve: {
      alias: {
        crypto: require.resolve('crypto-js'),
        '@opencrvs/commons/build/dist/authentication':
          '@opencrvs/commons/authentication'
      },
      /*
       * react-signature-canvas ships a UMD build that must share the app's
React instance. Without dedupe, Vite 8 can bundle a second React copy.
       */
      dedupe: ['react', 'react-dom']
    },
    plugins: [
      loginRedirectPlugin(),
      htmlPlugin(),
      react(),
      tsconfigPaths({
        projects: ['./tsconfig.build.json']
      }),
      VitePWAPlugin()
    ],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/setupConfig.ts', './src/setupTests.ts'],
      testTimeout: 60000,
      hookTimeout: 60000,
      globals: true
    },
    server: {
      port: CLIENT_PORT,
      // to get the manifest.json and images from country-config during development time
      proxy: {
        '/manifest.json': {
          target: `${COUNTRY_CONFIG_URL}/static/`,
          changeOrigin: true
        },
        '/images/': {
          target: `${COUNTRY_CONFIG_URL}/static/`,
          changeOrigin: true
        },
        '/api/countryconfig/': {
          target: COUNTRY_CONFIG_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/countryconfig/, '')
        },
        '/api/': {
          target: GATEWAY_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        '/health/ready': {
          target: COUNTRY_CONFIG_URL,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/health\/ready/, '/ping'),
          configure: (proxy, _options) => {
            proxy.on('proxyRes', (proxyRes, req, res) => {
              if (req.url === '/health/ready') {
                // Transform the response to health check format
                if (proxyRes.statusCode === 200) {
                  res.writeHead(200, { 'Content-Type': 'application/json' })
                  res.end(
                    JSON.stringify({
                      status: 'ok',
                      checks: {
                        countryconfig: { status: 'ok' }
                      }
                    })
                  )
                } else {
                  res.writeHead(500, { 'Content-Type': 'application/json' })
                  res.end(
                    JSON.stringify({
                      status: 'error',
                      checks: {
                        countryconfig: {
                          status: 'error',
                          error: 'Country config service unavailable'
                        }
                      }
                    })
                  )
                }
              }
            })

            proxy.on('error', (_err, req, res) => {
              if (req.url === '/health/ready' && 'writeHead' in res) {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                res.end(
                  JSON.stringify({
                    status: 'error',
                    checks: {
                      countryconfig: {
                        status: 'error',
                        error: 'Country config service unavailable'
                      }
                    }
                  })
                )
              }
            })
          }
        }
      }
    },
    logLevel: 'error'
  }
})
