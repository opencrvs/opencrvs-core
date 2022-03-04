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

const path = require('path')

module.exports = async ({ config }) => {
  // styles
  config?.module?.rules?.push({
    test: /\.(sass|scss)$/,
    use: ['resolve-url-loader'],
    include: path.resolve(__dirname, '../')
  })
  // fonts
  config?.module?.rules?.push({
    test: /\.(png|woff|woff2|eot|ttf|svg)$/,
    use: [
      {
        loader: 'file-loader',
        query: {
          name: '[name].[ext]'
        }
      }
    ],
    include: path.resolve(__dirname, '../')
  })

  return config
}
