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
import test from 'node:test'
import assert from 'node:assert'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// Must be set before ./constants (imported via ./opencrvs-api) reads the
// environment, hence the dynamic imports inside the tests
process.env.OPENCRVS_CLIENT_ID = 'test-client-id'
process.env.OPENCRVS_CLIENT_SECRET = 'test-client-secret'

const AUTH_URL = 'http://localhost:4040' // devDefault of OPENCRVS_AUTH_URL

const EVENT_ID = '11111111-1111-1111-1111-111111111111'
const ACTION_ID = '22222222-2222-2222-2222-222222222222'

test('direct authentication with OpenCRVS', async (t) => {
  const opencrvs = await import('./opencrvs-api')

  await t.test('is configured when client credentials are set', () => {
    assert.strictEqual(opencrvs.isDirectAuthConfigured(), true)
  })

  await t.test(
    'obtains a confirmation token via client_credentials and token exchange',
    async () => {
      const requests: URL[] = []
      const mswServer = setupServer(
        http.post(`${AUTH_URL}/token`, ({ request }) => {
          const url = new URL(request.url)
          requests.push(url)

          if (url.searchParams.get('grant_type') === 'client_credentials') {
            assert.strictEqual(
              url.searchParams.get('client_id'),
              'test-client-id'
            )
            assert.strictEqual(
              url.searchParams.get('client_secret'),
              'test-client-secret'
            )
            return HttpResponse.json({ access_token: 'system-token' })
          }

          assert.strictEqual(
            url.searchParams.get('grant_type'),
            'urn:opencrvs:oauth:grant-type:token-exchange'
          )
          assert.strictEqual(
            url.searchParams.get('subject_token'),
            'system-token'
          )
          assert.strictEqual(url.searchParams.get('event_id'), EVENT_ID)
          assert.strictEqual(url.searchParams.get('action_id'), ACTION_ID)
          return HttpResponse.json({ access_token: 'confirmation-token' })
        })
      )
      mswServer.listen()

      try {
        const token = await opencrvs.getConfirmationToken(EVENT_ID, ACTION_ID)
        assert.strictEqual(token, 'confirmation-token')
        assert.strictEqual(requests.length, 2)
      } finally {
        mswServer.close()
      }
    }
  )

  await t.test('throws when authentication is rejected', async () => {
    const mswServer = setupServer(
      http.post(`${AUTH_URL}/token`, () =>
        HttpResponse.json({ error: 'invalid_client' }, { status: 401 })
      )
    )
    mswServer.listen()

    try {
      await assert.rejects(
        opencrvs.getConfirmationToken(EVENT_ID, ACTION_ID),
        opencrvs.OpenCRVSError
      )
    } finally {
      mswServer.close()
    }
  })
})
