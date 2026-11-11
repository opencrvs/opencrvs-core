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
import {
  createTestClient,
  createUnauthenticatedTestClient,
  setupTestCase
} from '@events/tests/utils'

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

describe('config.application', () => {
  test('returns the application configuration, with fields core does not know', async () => {
    const { user } = await setupTestCase()
    mswServer.use(
      http.get(`${env.COUNTRY_CONFIG_URL}/config/application`, () =>
        HttpResponse.json({
          APPLICATION_NAME: 'Farajaland CRS',
          COUNTRY_LOGO: { fileName: 'logo.png', file: '' },
          SYSTEM_IANA_TIMEZONE: 'UTC',
          CURRENCY: { isoCode: 'USD', languagesAndCountry: ['en-US'] },
          ADMIN_STRUCTURE: [],
          PHONE_NUMBER_PATTERN: '^01[1-9][0-9]{8}$',
          USER_NOTIFICATION_DELIVERY_METHOD: 'email',
          INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'email',
          LOGIN_BACKGROUND: { backgroundColor: '36304E' }
        })
      )
    )

    const config = await createTestClient(user).config.application()

    expect(config).toMatchObject({
      APPLICATION_NAME: 'Farajaland CRS',
      SEARCH_DEFAULT_CRITERIA: 'TRACKING_ID',
      LOGIN_BACKGROUND: { backgroundColor: '36304E' }
    })
  })

  test('requires authentication', async () => {
    const client = await createUnauthenticatedTestClient()

    await expect(client.config.application()).rejects.toMatchObject({
      code: 'UNAUTHORIZED'
    })
  })
})

describe('config.publicApplication', () => {
  test('gives anyone the fields the login page needs, and no others', async () => {
    const client = await createUnauthenticatedTestClient()

    const config = await client.config.publicApplication()

    expect(Object.keys(config).sort()).toEqual([
      'APPLICATION_NAME',
      'COUNTRY_LOGO',
      'INFORMANT_NOTIFICATION_DELIVERY_METHOD',
      'PHONE_NUMBER_PATTERN',
      'USER_NOTIFICATION_DELIVERY_METHOD'
    ])
  })
})
