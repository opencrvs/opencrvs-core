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
import { join } from 'path'
import * as fetch from 'jest-fetch-mock'

// eslint-disable-next-line import/no-relative-parent-imports
import { IDatabaseConnector } from '../src/database'

jest.setMock('node-fetch', { default: fetch })

const database: { [key: string]: string } = {}

const mock: IDatabaseConnector = {
  set: jest.fn().mockImplementation(async (key, value) => {
    database[key] = value
  }),
  setex: jest.fn().mockImplementation(async (key, ttl, value) => {
    database[key] = value
  }),
  get: jest.fn().mockImplementation(async (key) => {
    return database[key] || null
  }),
  del: jest.fn().mockImplementation(async (key) => {
    const keyExists = !!database[key]
    delete database[key]
    return keyExists ? 1 : 0
  }),
  start: jest.fn(),
  stop: jest.fn()
}

jest.setMock('src/database', mock)

process.env.CERT_PRIVATE_KEY_PATH = join(__dirname, './cert.key')
process.env.CERT_PUBLIC_KEY_PATH = join(__dirname, './cert.key.pub')
