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
import * as commandLineArgs from 'command-line-args'
import * as commandLineUsage from 'command-line-usage'
import fetch from 'node-fetch'
import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const optionList = [
  { name: 'user', alias: 'u', type: String, defaultValue: '+447111111111' },
  { name: 'password', alias: 'p', type: String, defaultValue: 'test' },
  {
    name: 'server',
    alias: 's',
    type: String,
    defaultValue: 'http://localhost:4040'
  },
  {
    name: 'code',
    alias: 'c',
    type: Boolean
  },
  { name: 'help', type: Boolean, description: 'Show this menu' }
]

const options = commandLineArgs(optionList)

if (options.help) {
  const usage = commandLineUsage([
    {
      header: 'OpenCRVS AUTH service script',
      content: 'Request token from an OpenCRVS auth server'
    },
    { header: 'Options', optionList }
  ])

  // eslint-disable-next-line no-console
  console.log(usage)
  process.exit(0)
}

;(async () => {
  try {
    const authRes = await fetch(`${options.server}/authenticate`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mobile: options.user,
        password: options.password
      })
    })

    if (authRes.status !== 200) {
      throw new Error(`Received ${authRes.status} when trying to authenticate`)
    }

    const authResJson = await authRes.json()

    let code = '000000'
    if (options.code) {
      code = await new Promise<string>((resolve) => {
        rl.question('Enter your auth code: ', (answer) => {
          resolve(answer)
        })
      })
    }

    const verifyRes = await fetch(`${options.server}/verifyCode`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code,
        nonce: authResJson.nonce
      })
    })

    if (verifyRes.status !== 200) {
      throw new Error(`Received ${verifyRes.status} when trying to verify code`)
    }

    const verifyResJson = await verifyRes.json()

    // eslint-disable-next-line no-console
    console.log('Token:\n')
    // eslint-disable-next-line no-console
    console.log(verifyResJson.token, '\n')
    process.exit(0)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
    process.exit(1)
  }
})()
