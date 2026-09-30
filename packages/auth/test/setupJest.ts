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
import fetch from 'jest-fetch-mock'

jest.setMock('node-fetch', { __esModule: true, default: fetch })

const database: { [key: string]: string } = {}

const mock = {
  start: jest.fn(),
  stop: jest.fn(),
  redis: {
    set: jest.fn().mockImplementation(async (key, value) => {
      database[key] = value
    }),
    setEx: jest.fn().mockImplementation(async (key, ttl, value) => {
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
    // GETDEL: returns the value and removes the key, or null if absent.
    // Read and delete stay in one synchronous body so that, as with the real
    // command, no caller can observe the value between the two.
    getDel: jest.fn().mockImplementation(async (key) => {
      const value = database[key] ?? null
      delete database[key]
      return value
    })
  }
}

jest.setMock('src/database', mock)

process.env.CERT_PRIVATE_KEY_PATH = join(__dirname, './cert.key')
process.env.CERT_PUBLIC_KEY_PATH = join(__dirname, './cert.key.pub')
