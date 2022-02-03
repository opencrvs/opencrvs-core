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
module.exports = function (app) {
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
