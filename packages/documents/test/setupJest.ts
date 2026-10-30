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

/*
 * Each test file gets a bucket of its own in the RustFS that global-setup.ts
 * starts, so files that run in parallel do not see each other's objects. Tests
 * that need the bucket create it with ensureDefaultBucket.
 */
process.env.S3_BUCKET = `test-${randomUUID()}`
