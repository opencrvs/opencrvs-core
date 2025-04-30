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
import commandLineArgs from 'command-line-args'
import commandLineUsage from 'command-line-usage'
import { join } from 'path'

const optionList = [
  { name: 'userId', type: String, defaultValue: '1' },
  { name: 'role', type: String, defaultValue: 'admin' },
  {
    name: 'expiresIn',
    type: Number,
    defaultValue: 9999999,
    description: 'Delta value from {bold now} in seconds'
  },
  {
    name: 'issuer',
    type: String,
    defaultValue: 'opencrvs:auth-service'
  },
  {
    name: 'audience',
    type: String,
    multiple: true,
    defaultValue: [
      'opencrvs:auth-user',
      'opencrvs:user-mgnt-user',
      'opencrvs:hearth-user',
      'opencrvs:gateway-user',
      'opencrvs:config-user'
    ]
  },
  { name: 'help', type: Boolean, description: 'Show this menu' }
]

const options = commandLineArgs(optionList)

if (options.help) {
  const usage = commandLineUsage([
    {
      header: 'OpenCRVS JWT Token Generator',
      content: 'Generate JWT tokens for tests'
    },
    { header: 'Options', optionList }
  ])
  // eslint-disable-next-line no-console
  console.log(usage)
  process.exit(0)
}

process.env.CONFIG_TOKEN_EXPIRY = options.expiresIn
process.env.CERT_PRIVATE_KEY_PATH = join(__dirname, '../test/cert.key')
process.env.CERT_PUBLIC_KEY_PATH = join(__dirname, '../test/cert.key.pub')

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createToken } = require('@auth/features/authenticate/service')

createToken(
  options.userId,
  options.role,
  options.audience,
  options.issuer
).then((token: string) =>
  // eslint-disable-next-line no-console
  console.log(token)
)
