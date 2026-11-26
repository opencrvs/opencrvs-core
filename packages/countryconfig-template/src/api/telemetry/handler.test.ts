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

import { vi, describe, it, expect } from 'vitest'
import { Request, ResponseToolkit } from '@hapi/hapi'

vi.mock('@opencrvs/toolkit/telemetry', () => ({
  sendTelemetry: vi.fn()
}))

// Force telemetry off, keeping the rest of the environment intact.
vi.mock('@countryconfig/environment', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@countryconfig/environment')>()
  return { ...actual, env: { ...actual.env, TELEMETRY_ENABLED: false } }
})

import { SERVICE_USER_ID } from '@opencrvs/toolkit/authentication'
import { sendTelemetry } from '@opencrvs/toolkit/telemetry'
import { telemetryHandler } from './handler'

const responseToolkit = {
  response: (payload: unknown) => ({
    code: (statusCode: number) => ({ payload, statusCode })
  })
} as unknown as ResponseToolkit

describe('telemetry trigger handler', () => {
  it('does not forward anything when telemetry is disabled', async () => {
    const request = {
      auth: { credentials: { sub: SERVICE_USER_ID } },
      payload: {
        reported_at: '2026-08-13T00:00:00.000Z',
        metrics: { 'events.total': 1 }
      }
    } as unknown as Request

    const response = (await telemetryHandler(request, responseToolkit)) as {
      payload: unknown
      statusCode: number
    }

    expect(sendTelemetry).not.toHaveBeenCalled()
    expect(response.statusCode).toBe(200)
    expect(response.payload).toEqual({ status: 'skipped' })
  })
})
