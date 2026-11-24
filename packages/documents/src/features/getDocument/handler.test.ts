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
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { MINIO_BUCKET } from '../../minio/constants'

const signFileUrlMock = jest.fn().mockReturnValue('https://signed-url')

jest.mock('../../minio/sign', () => ({
  signFileUrl: (...args: unknown[]) => signFileUrlMock(...args)
}))

describe('createPreSignedUrl', () => {
  let server: any
  const token = jwt.sign({ scope: [] }, readFileSync('./test/cert.key'), {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:documents-user',
    subject: '123123'
  })

  beforeEach(async () => {
    signFileUrlMock.mockClear()
    server = await createServer()
  })

  it('keeps bucket prefix in FullDocumentPath', async () => {
    const res = await server.server.inject({
      method: 'GET',
      url: `/presigned-url/${MINIO_BUCKET}/eventId/imageId.png`,
      headers: { authorization: `Bearer ${token}` }
    })

    expect(res.statusCode).toBe(200)
    expect(signFileUrlMock).toHaveBeenCalledWith(
      `/${MINIO_BUCKET}/eventId/imageId.png`
    )
  })

  it('prepends bucket to DocumentPath (eventId/imageId)', async () => {
    const res = await server.server.inject({
      method: 'GET',
      url: `/presigned-url/eventId/imageId.png`,
      headers: { authorization: `Bearer ${token}` }
    })

    expect(res.statusCode).toBe(200)
    expect(signFileUrlMock).toHaveBeenCalledWith(
      `/${MINIO_BUCKET}/eventId/imageId.png`
    )
  })
})
