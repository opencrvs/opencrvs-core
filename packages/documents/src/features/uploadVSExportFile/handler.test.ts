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
import { createServer } from '@documents/server'
import { ensureDefaultBucket } from '../../s3/client'
import { env } from '../../s3/constants'
import { getObject } from '../../../test/s3'

describe('verify document uploader handler', () => {
  let server: any

  beforeAll(async () => {
    await ensureDefaultBucket()
  })

  beforeEach(async () => {
    server = await createServer()
  })

  it('returns ok for valid request', async () => {
    const res = await server.server.inject({
      method: 'POST',
      url: '/upload-vs-export',
      payload: 'name,count\nbirths,2\n',
      headers: { 'content-type': 'text/csv' }
    })

    expect(res.statusCode).toBe(200)
    const { refUrl } = JSON.parse(res.payload)
    const key = refUrl.slice(`/${env.S3_BUCKET}/`.length)
    expect(await getObject(key)).toMatchObject({
      contentType: 'text/csv',
      body: 'name,count\nbirths,2\n'
    })
  })
})
