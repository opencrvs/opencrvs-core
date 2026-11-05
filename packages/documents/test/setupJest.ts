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
import { randomUUID } from 'crypto'
import { join } from 'path'
import * as fetch from 'jest-fetch-mock'

jest.setMock('node-fetch', { default: fetch })

process.env.CERT_PUBLIC_KEY_PATH = join(__dirname, './cert.key.pub')
process.env.NODE_ENV = 'TEST'

// The store of this Jest project, which global-setup.ts started
process.env.S3_ENDPOINT = process.env[`S3_ENDPOINT_${globalThis.S3_STORE}`]
process.env.S3_PUBLIC_ENDPOINT = process.env.S3_ENDPOINT

/*
 * envalid freezes the settings it reads, so the tests get a copy of them that
 * they may change.
 */
jest.mock('@documents/s3/constants', () => {
  const actual = jest.requireActual('@documents/s3/constants')
  return { ...actual, env: { ...actual.env } }
})

/*
 * Each test gets a bucket of its own in the store that global-setup.ts starts,
 * so no test sees the objects of another, whether it runs before it or in
 * parallel with it. Tests that need the bucket create it with
 * ensureDefaultBucket.
 */
beforeEach(() => {
  const { env } = jest.requireMock<{ env: { S3_BUCKET: string } }>(
    '@documents/s3/constants'
  )
  env.S3_BUCKET = `test-${randomUUID()}`
})
