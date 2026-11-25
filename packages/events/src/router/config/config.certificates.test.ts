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
import { encodeScope } from '@opencrvs/commons'
import { env } from '@events/environment'
import { mswServer } from '@events/tests/msw'
import { verifySignedByCore } from '@events/tests/request-signing'
import { createTestClient, setupTestCase } from '@events/tests/utils'

const certificates = [
  { id: 'birth-certificate', event: 'birth' },
  { id: 'birth-certified-copy', event: 'birth' },
  { id: 'death-certificate', event: 'death' }
]

function serveCertificates() {
  const requests: Request[] = []
  mswServer.use(
    http.get(`${env.COUNTRY_CONFIG_URL}/certificates`, ({ request }) => {
      requests.push(request.clone())
      return HttpResponse.json(certificates)
    })
  )
  return requests
}

describe('config.certificates', () => {
  test('returns every certificate to a user who may print any of them', async () => {
    const { user } = await setupTestCase()
    serveCertificates()
    const client = createTestClient(user, [
      encodeScope({ type: 'record.print-certified-copies' })
    ])

    expect(await client.config.certificates()).toEqual(certificates)
  })

  test('returns only the templates the user may print', async () => {
    const { user } = await setupTestCase()
    serveCertificates()
    const client = createTestClient(user, [
      encodeScope({
        type: 'record.print-certified-copies',
        options: { templates: ['birth-certificate', 'death-certificate'] }
      })
    ])

    expect(await client.config.certificates()).toEqual([
      certificates[0],
      certificates[2]
    ])
  })

  test('returns no certificates to a user who may not print', async () => {
    const { user } = await setupTestCase()
    serveCertificates()
    const client = createTestClient(user, [])

    expect(await client.config.certificates()).toEqual([])
  })

  test('reads the certificates signed as core, without the user token', async () => {
    const { user } = await setupTestCase()
    const requests = serveCertificates()
    const client = createTestClient(user, [
      encodeScope({ type: 'record.print-certified-copies' })
    ])

    await client.config.certificates()

    expect(requests).toHaveLength(1)
    expect(requests[0].headers.get('authorization')).toBeNull()
    expect(await verifySignedByCore(requests[0])).toMatchObject({
      valid: true
    })
  })
})
