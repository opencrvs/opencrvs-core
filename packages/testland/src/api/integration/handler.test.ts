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
import * as Hapi from '@hapi/hapi'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import fetch from 'node-fetch'
import { logger } from '../../logger'
import { systemReadyHandler } from './handler'

vi.mock('node-fetch', () => ({ default: vi.fn() }))
vi.mock('../../logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }
}))
// The MOSIP entry in INTEGRATIONS is built from these at module load
vi.mock('../../constants', () => ({
  MOSIP_INTEGRATION_CLIENT_ID: '5f10f0e9-dafa-48d6-b5e6-551809efa0ab',
  MOSIP_INTEGRATION_CLIENT_SECRET: '7514fe5f-6401-429b-8ac3-1f1c3dc40359',
  EVENTS_URL: 'http://events:5555/'
}))

const CONFIGURED_ID = '5f10f0e9-dafa-48d6-b5e6-551809efa0ab'
const CONFIGURED_SECRET = '7514fe5f-6401-429b-8ac3-1f1c3dc40359'

const mockFetch = vi.mocked(fetch)
const mockLogger = vi.mocked(logger)

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body)
  } as unknown as Awaited<ReturnType<typeof fetch>>
}

const request = {
  headers: { authorization: 'Bearer bootstrap-token' }
} as unknown as Hapi.Request

const h = {
  response: () => ({ code: (statusCode: number) => ({ statusCode }) })
} as unknown as Hapi.ResponseToolkit

/** Every POST /integrations call made during the run */
function registrationCalls() {
  return mockFetch.mock.calls.filter(
    ([, options]) => options?.method === 'POST'
  )
}

function warnings() {
  return mockLogger.warn.mock.calls.map(([message]) => String(message))
}

/*
 * The exact code is the contract: events retries this trigger on a failing
 * status and treats 2xx as done, so 503-rather-than-200 is the whole point of
 * reporting an incomplete run.
 */
async function runHandler() {
  const response = await systemReadyHandler(request, h)
  return (response as unknown as { statusCode: number }).statusCode
}

describe('systemReadyHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('seeds the configured credentials when the integration is new', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([]))
    mockFetch.mockResolvedValueOnce(jsonResponse({ clientId: CONFIGURED_ID }))

    const status = await runHandler()

    const [, options] = registrationCalls()[0]
    expect(JSON.parse(String(options?.body))).toMatchObject({
      name: 'MOSIP',
      credentials: {
        clientId: CONFIGURED_ID,
        clientSecret: CONFIGURED_SECRET
      }
    })
    expect(warnings()).toEqual([])
    expect(status).toBe(200)
  })

  // A restart must never clobber a secret a National System Admin rotated
  it('skips silently when the registered client id matches the configured one', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse([{ id: CONFIGURED_ID, name: 'MOSIP' }])
    )

    const status = await runHandler()

    expect(registrationCalls()).toHaveLength(0)
    expect(warnings()).toEqual([])
    expect(status).toBe(200)
  })

  // The failure this warning exists for: the integration was registered with a
  // generated id, so the configured credentials 401 with nothing to explain it
  it('warns when the registered client id differs from the configured one', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse([
        { id: 'ac3daa16-bd38-41dd-9dbc-98a10b71bddd', name: 'MOSIP' }
      ])
    )

    const status = await runHandler()

    // Still must not re-register, or it would invalidate credentials in use
    expect(registrationCalls()).toHaveLength(0)

    const [warning] = warnings()
    expect(warning).toContain('ac3daa16-bd38-41dd-9dbc-98a10b71bddd')
    expect(warning).toContain(CONFIGURED_ID)
    expect(warning).toContain('NOT in use')

    // The name is taken and only an operator can resolve the mismatch, so
    // registration is as complete as it can get
    expect(status).toBe(200)
  })

  it('reports incomplete when listing integrations fails', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: 'nope' }, 500))

    const status = await runHandler()

    expect(registrationCalls()).toHaveLength(0)
    expect(warnings()[0]).toContain('listing integrations failed')
    expect(status).toBe(503)
  })

  it('reports incomplete when registering an integration is refused', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([]))
    mockFetch.mockResolvedValueOnce(jsonResponse({ error: 'nope' }, 500))

    const status = await runHandler()

    expect(warnings()[0]).toContain('failed')
    expect(status).toBe(503)
  })

  it('reports incomplete when registering an integration throws', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([]))
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'))

    const status = await runHandler()

    expect(warnings()[0]).toContain('threw')
    expect(status).toBe(503)
  })
})
