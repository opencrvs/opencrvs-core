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
import { defineConfig, HttpProxy, loadEnv, ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa'
import dns from 'node:dns'
import { IncomingMessage, ServerResponse } from 'node:http'

// fixes issue where Cypress was not able to resolve Vite's localhost
// https://github.com/cypress-io/cypress/issues/25397#issuecomment-1775454875
dns.setDefaultResultOrder('ipv4first')

// https://vitejs.dev/config/
export default defineConfig(({ mode }): any => {
  const env = loadEnv(mode, 'env')

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
  const vitePWAPlugin = () => {
    return VitePWA({
      strategies: 'generateSW',
      injectManifest: {
        globDirectory: 'build/',
        globIgnores: ['**/config.js'],
        globPatterns: ['**/*.{json,ico,ttf,html,js}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        swDest: 'build/service-worker.js'
      },
      registerType: 'autoUpdate',
      workbox: {
        cacheId: 'ocrvs-login',
        runtimeCaching: [
          {
            urlPattern: /config\.js/,
            handler: 'NetworkFirst'
          }
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/__.*$/]
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
      sourcemap: true,
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
    },
    define: {
      APP_VERSION: JSON.stringify(process.env.npm_package_version)
    },
    server: {
      proxy: {
        '/api/countryconfig/': {
          target: 'http://localhost:3040',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/countryconfig/, '')
        },
        '/health/ready': {
          target: 'http://localhost:3040',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/health\/ready/, '/ping'),
          configure: (proxy: HttpProxy.Server, _options: ProxyOptions) => {
            proxy.on(
              'proxyRes',
              (
                proxyRes: IncomingMessage,
                req: IncomingMessage,
                res: ServerResponse<IncomingMessage>
              ) => {
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
              }
            )

            proxy.on(
              'error',
              (
                _err: Error,
                req: IncomingMessage,
                res: ServerResponse<IncomingMessage>
              ) => {
                if (req.url === '/health/ready') {
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
            )
          }
        }
      }
    },
    logLevel: 'error'
  }
})
