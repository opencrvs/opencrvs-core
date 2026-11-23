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

import { http, HttpResponse, HttpResponseInit } from 'msw'
import {
  ActionStatus,
  ActionType,
  getUUID,
  TENNIS_CLUB_MEMBERSHIP,
  TokenUserType
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { setupTestCase, seedEvent } from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'
import {
  collectTelemetryMetrics,
  buildTelemetryReport,
  sendTelemetryReport,
  runDailyTelemetry,
  startOfUtcDay
} from '@events/service/telemetry'

const TELEMETRY_TRIGGER_URL = `${env.COUNTRY_CONFIG_URL}/trigger/telemetry`

describe('collectTelemetryMetrics', () => {
  it('counts registered, pending, users and folds event type into the key', async () => {
    const { user, eventsDb, rng } = await setupTestCase()

    // Two registered events (Accepted DECLARE + Accepted REGISTER)...
    await seedEvent(eventsDb, {
      eventConfig: tennisClubMembershipEvent,
      actions: [ActionType.DECLARE, ActionType.REGISTER],
      user,
      rng
    })
    await seedEvent(eventsDb, {
      eventConfig: tennisClubMembershipEvent,
      actions: [ActionType.DECLARE, ActionType.REGISTER],
      user,
      rng
    })
    // ...and one declared-but-not-registered event.
    await seedEvent(eventsDb, {
      eventConfig: tennisClubMembershipEvent,
      actions: [ActionType.DECLARE],
      user,
      rng
    })

    // Print certificates: 2 on the first event, 1 on the second — a record can
    // be printed more than once, so the total (3) exceeds registrations (2).
    const events = await eventsDb.selectFrom('events').select('id').execute()
    await eventsDb
      .insertInto('eventActions')
      .values(
        [events[0].id, events[0].id, events[1].id].map((eventId) => ({
          actionType: ActionType.PRINT_CERTIFICATE,
          status: ActionStatus.Accepted,
          eventId,
          createdBy: user.id,
          createdByUserType: TokenUserType.enum.user,
          transactionId: getUUID(),
          declaration: {}
        }))
      )
      .execute()

    const metrics = await collectTelemetryMetrics()

    expect(metrics['events.total']).toBe(3)
    expect(metrics['declarations.registered']).toBe(2)
    expect(metrics[`declarations.registered.${TENNIS_CLUB_MEMBERSHIP}`]).toBe(2)
    expect(metrics['declarations.pending']).toBe(1)
    // Certificates printed exceed registrations (3 prints across 2 records).
    expect(metrics['certificates.printed']).toBe(3)
    expect(metrics[`certificates.printed.${TENNIS_CLUB_MEMBERSHIP}`]).toBe(3)
    // setupTestCase seeds two active users.
    expect(metrics['users.total']).toBe(2)
    expect(metrics['users.active']).toBe(2)
    expect(typeof metrics['system.uptime_seconds']).toBe('number')
  })
})

describe('startOfUtcDay', () => {
  it('is stable across the day so retries share one reported_at', () => {
    const morning = startOfUtcDay(new Date('2026-08-13T06:30:00Z'))
    const evening = startOfUtcDay(new Date('2026-08-13T23:59:59Z'))
    expect(morning).toBe('2026-08-13T00:00:00.000Z')
    expect(morning).toBe(evening)
  })
})

describe('sendTelemetryReport', () => {
  it('posts the report to countryconfig with a bearer token and maps a 2xx to sent', async () => {
    let capturedBody: unknown = null
    let capturedAuth: string | null = null

    mswServer.use(
      http.post(TELEMETRY_TRIGGER_URL, async ({ request }) => {
        capturedBody = await request.json()
        capturedAuth = request.headers.get('authorization')
        return HttpResponse.json({ status: 'forwarded' }, {
          status: 202
        } as HttpResponseInit)
      })
    )

    const report = buildTelemetryReport(
      { 'events.total': 3, 'users.active': 5 },
      '2026-08-13T00:00:00.000Z'
    )
    const result = await sendTelemetryReport(report, 'Bearer test-token')

    expect(result).toEqual({ status: 'sent' })
    expect(capturedAuth).toBe('Bearer test-token')
    // core sends only the window, its own version, and the metrics — no
    // country code / domain / environment (countryconfig stamps those).
    expect(capturedBody).toEqual({
      reported_at: '2026-08-13T00:00:00.000Z',
      app_version: process.env.npm_package_version,
      metrics: { 'events.total': 3, 'users.active': 5 }
    })
  })

  it('returns an error result for a non-2xx response', async () => {
    mswServer.use(
      http.post(TELEMETRY_TRIGGER_URL, () =>
        HttpResponse.json({ error: 'boom' }, {
          status: 502
        } as HttpResponseInit)
      )
    )

    const report = buildTelemetryReport(
      { 'events.total': 3 },
      '2026-08-13T00:00:00.000Z'
    )
    const result = await sendTelemetryReport(report, 'Bearer test-token')
    expect(result.status).toBe('error')
    if (result.status === 'error') {
      expect(result.httpStatus).toBe(502)
    }
  })
})

describe('runDailyTelemetry', () => {
  it('collects metrics and hands them to countryconfig for the given day', async () => {
    await setupTestCase()

    let receivedBody:
      | { reported_at: string; metrics: Record<string, unknown> }
      | undefined
    let receivedAuth: string | null = null
    mswServer.use(
      http.post(TELEMETRY_TRIGGER_URL, async ({ request }) => {
        receivedBody = (await request.json()) as typeof receivedBody
        receivedAuth = request.headers.get('authorization')
        return HttpResponse.json({ status: 'forwarded' }, {
          status: 202
        } as HttpResponseInit)
      })
    )

    const reportedAt = '2026-08-13T00:00:00.000Z'
    const result = await runDailyTelemetry(reportedAt)

    expect(result.status).toBe('sent')
    expect(receivedBody?.reported_at).toBe(reportedAt)
    expect(receivedBody?.metrics['events.total']).toBeDefined()
    // the worker fetched a service token (msw handler) and sent it as bearer
    expect(receivedAuth).toBe('Bearer service-token')
  })
})
