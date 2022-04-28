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
const proxy = require('http-proxy-middleware')
const https = require('https')
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (d) => {
        data += d.toString()
      })

      res.on('end', () => resolve(data))
    })

    req.on('error', reject)

    req.end()
  })
}

function replaceBody(res, transformFn) {
  const send = res.send
  res.send = async function (string) {
    let body = string instanceof Buffer ? string.toString() : string
    body = await transformFn(body)
    send.call(this, body)
  }
}

module.exports = function (app) {
  if (process.env.PROXY) {
    app.use((req, res, next) => {
      const isIndexHTMLPath = !req.path.includes('.')
      if (isIndexHTMLPath) {
        replaceBody(res, (body) => {
          return body.replace('http://localhost:3040', '')
        })
      }
      if (req.path === '/client-config.js') {
        replaceBody(res, async () => {
          const config = await makeRequest({
            hostname: 'countryconfig.farajaland-qa.opencrvs.org',
            path: '/client-config.js',
            method: 'GET',
            headers: {
              'Content-Type': 'application/javascript; charset=utf-8'
            }
          })

          return config.replace(
            'https://login.farajaland-qa.opencrvs.org',
            'http://localhost:3020/'
          )
        })
      }
      next()
    })
  }

  app.use(
    '/gateway',
    proxy({
      target: 'http://localhost:7070',
      changeOrigin: true,
      pathRewrite: {
        '^/gateway': '/'
      }
    })
  )
  app.use(
    '/countryconfig',
    proxy({
      target: 'http://localhost:3040/bgd',
      changeOrigin: true,
      pathRewrite: {
        '^/countryconfig': '/'
      }
    })
  )
}
