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
import { encodeScope, TokenUserType } from '@opencrvs/commons'
import { server } from '@events/server'
import { env } from '@events/environment'
import { mswServer } from '@events/tests/msw'
import { createTestToken, setupTestCase } from '@events/tests/utils'

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

function createUploadFormData() {
  const formData = new FormData()
  formData.append(
    'file',
    new Blob(['test file content'], { type: 'image/jpeg' }),
    'test.jpg'
  )
  formData.append('transactionId', 'abc123')
  formData.append('path', 'test-event')
  return formData
}

describe('POST /attachments', () => {
  test('returns UNAUTHORIZED when no authorization header is provided', async () => {
    const res = await fetch(`${url}/attachments`, {
      method: 'POST',
      body: createUploadFormData()
    })

    expect(res.status).toBe(401)
  })

  test('returns FORBIDDEN when token does not have attachment.upload scope', async () => {
    const { user } = await setupTestCase()

    mswServer.use(
      http.post(`${env.USER_MANAGEMENT_URL}/getUser`, () =>
        HttpResponse.json({
          primaryOfficeId: user.primaryOfficeId,
          role: user.role,
          signature: user.signature
        })
      )
    )

    const token = createTestToken({
      userId: user.id,
      scopes: [encodeScope({ type: 'record.read' })],
      userType: TokenUserType.enum.user,
      role: user.role
    })

    const res = await fetch(`${url}/attachments`, {
      method: 'POST',
      headers: {
        Authorization: token
      },
      body: createUploadFormData()
    })

    expect(res.status).toBe(403)
  })

  test('successfully uploads a file when token has attachment.upload scope', async () => {
    const { user } = await setupTestCase()
    const expectedFileUrl = 'test-event/abc123.jpg'

    mswServer.use(
      http.post(`${env.USER_MANAGEMENT_URL}/getUser`, () =>
        HttpResponse.json({
          primaryOfficeId: user.primaryOfficeId,
          role: user.role,
          signature: user.signature
        })
      ),
      http.post(`${env.DOCUMENTS_URL}/files`, () => {
        return HttpResponse.text(expectedFileUrl)
      })
    )

    const token = createTestToken({
      userId: user.id,
      scopes: [encodeScope({ type: 'attachment.upload' })],
      userType: TokenUserType.enum.user,
      role: user.role
    })

    const res = await fetch(`${url}/attachments`, {
      method: 'POST',
      headers: {
        Authorization: token
      },
      body: createUploadFormData()
    })

    expect(res.status).toBe(200)
    const body = (await res.json()) as string
    expect(body).toStrictEqual({ result: { data: { json: expectedFileUrl } } })
  })

  test('returns error when required fields are missing', async () => {
    const { user } = await setupTestCase()

    mswServer.use(
      http.post(`${env.USER_MANAGEMENT_URL}/getUser`, () =>
        HttpResponse.json({
          primaryOfficeId: user.primaryOfficeId,
          role: user.role,
          signature: user.signature
        })
      )
    )

    const token = createTestToken({
      userId: user.id,
      scopes: [encodeScope({ type: 'attachment.upload' })],
      userType: TokenUserType.enum.user,
      role: user.role
    })

    // Send form data without the file field
    const formData = new FormData()
    formData.append('transactionId', 'abc123')

    const res = await fetch(`${url}/attachments`, {
      method: 'POST',
      headers: {
        Authorization: token
      },
      body: formData
    })

    expect(res.status).toBe(400)
  })
})
