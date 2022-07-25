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
require('dotenv').config()

import { join } from 'path'
import { writeFileSync, readFileSync } from 'fs'
import { networkInterfaces, NetworkInterfaceInfo } from 'os'
import * as ngrok from 'ngrok'

function getNetworkAddress() {
  const interfaces = networkInterfaces()
  return []
    .concat(...Object.values(interfaces))
    .filter(
      (iface: NetworkInterfaceInfo) =>
        'IPv4' === iface.family && !iface.internal
    )[0]
}

if (!process.env.AUTH_TOKEN) {
  console.log('Make sure you have AUTH_TOKEN defined in .env file')
  console.log('You can get it by logging into https://ngrok.com')
  process.exit(1)
}

const iface = getNetworkAddress()

if (!iface) {
  console.log(
    'Couldn\'t detect your network address. Please replace "localhost" references config.js files in client and login manually.'
  )
} else {
  console.log('Detect a network address', iface.address)
  console.log('Updating config.js files...')

  const clientConfig = readFileSync(
    join(__dirname, '../client/public/config.js')
  )

  writeFileSync(
    join(__dirname, '../client/public/config.js'),
    clientConfig.toString().replace(/localhost/g, iface.address)
  )
}

async function init() {
  const url = await ngrok.connect({
    proto: 'http', // http|tcp|tls, defaults to http
    addr: 3000, // port or network address, defaults to 80
    authtoken: process.env.AUTH_TOKEN, // your authtoken from ngrok.com
    region: 'eu'
  })

  const loginConfig = readFileSync(join(__dirname, '../login/public/config.js'))

  writeFileSync(
    join(__dirname, '../login/public/config.js'),
    loginConfig
      .toString()
      .replace(/localhost/g, iface.address)
      .replace(/(CLIENT_APP_URL: ).*,/, `$1 '${url}',`)
  )

  const clientConfig = readFileSync(
    join(__dirname, '../client/public/config.js')
  )

  writeFileSync(
    join(__dirname, '../client/public/config.js'),
    clientConfig
      .toString()
      .replace(/(API_GATEWAY_URL: ).*,/, `$1 '/gateway/',`)
      .replace(/(COUNTRY_CONFIG_URL: ).*,/, `$1 '/countryconfig',`)
  )

  console.log('Proxy is running:', url)
}

init()
