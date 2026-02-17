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

import { http, HttpResponse } from 'msw'
import { SCOPES } from '@opencrvs/commons'
import { server } from '@events/server'
import { env } from '@events/environment'
import { mswServer } from '@events/tests/msw'
import { createTestToken } from '@events/tests/utils'

let serverInstance: ReturnType<typeof server>
let url: string

beforeAll(async () => {
  serverInstance = server()
  await new Promise<void>((resolve) => {
    const listener = serverInstance.listen(0, () => {
      const address = listener.address()
      const port = typeof address === 'object' && address?.port
      url = `http://localhost:${port}`
      resolve()
    })
  })
})

afterAll(() => {
  serverInstance.close()
})

describe('POST /attachments', () => {
  test('returns 401 when no authorization header is provided', async () => {
    const res = await fetch(`${url}/attachments`, {
      method: 'POST'
    })

    expect(res.status).toBe(401)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe('Unauthorized')
  })

  test('returns 403 when token does not have attachment.upload scope', async () => {
    const token = createTestToken({
      userId: 'test-user',
      scopes: [SCOPES.RECORD_READ]
    })

    const res = await fetch(`${url}/attachments`, {
      method: 'POST',
      headers: {
        Authorization: token
      }
    })

    expect(res.status).toBe(403)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe('Forbidden')
  })

  test('successfully uploads a file when token has attachment.upload scope', async () => {
    const expectedFileUrl = '/ocrvs/test-event/abc123.jpg'

    mswServer.use(
      http.post(`${env.DOCUMENTS_URL}/files`, () => {
        return HttpResponse.text(expectedFileUrl)
      })
    )

    const token = createTestToken({
      userId: 'test-user',
      scopes: [SCOPES.ATTACHMENT_UPLOAD]
    })

    const formData = new FormData()
    formData.append(
      'file',
      new Blob(['test file content'], { type: 'image/jpeg' }),
      'test.jpg'
    )
    formData.append('transactionId', 'abc123')
    formData.append('path', 'test-event')

    const res = await fetch(`${url}/attachments`, {
      method: 'POST',
      headers: {
        Authorization: token
      },
      body: formData
    })

    expect(res.status).toBe(200)
    const body = (await res.json()) as { fileUrl: string }
    expect(body).toEqual({ fileUrl: expectedFileUrl })
  })

  test('returns 500 when documents service fails', async () => {
    mswServer.use(
      http.post(`${env.DOCUMENTS_URL}/files`, () => {
        return HttpResponse.json(
          { error: 'Internal server error' },
          // @ts-expect-error - MSW does not have a type for this
          { status: 500 }
        )
      })
    )

    const token = createTestToken({
      userId: 'test-user',
      scopes: [SCOPES.ATTACHMENT_UPLOAD]
    })

    const formData = new FormData()
    formData.append(
      'file',
      new Blob(['test file content'], { type: 'image/jpeg' }),
      'test.jpg'
    )
    formData.append('transactionId', 'abc123')

    const res = await fetch(`${url}/attachments`, {
      method: 'POST',
      headers: {
        Authorization: token
      },
      body: formData
    })

    expect(res.status).toBe(500)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe('File upload failed')
  })
})
