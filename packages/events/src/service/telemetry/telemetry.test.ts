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
import { ActionType, TENNIS_CLUB_MEMBERSHIP } from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { setupTestCase, seedEvent } from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'
import {
  collectTelemetryMetrics,
  buildTelemetryReport,
  sendTelemetryReport,
  runDailyTelemetry,
  startOfUtcDay,
  TELEMETRY_SCHEMA_VERSION
} from '@events/service/telemetry'

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

    const metrics = await collectTelemetryMetrics()

    expect(metrics['events.total']).toBe(3)
    expect(metrics['declarations.registered']).toBe(2)
    expect(metrics[`declarations.registered.${TENNIS_CLUB_MEMBERSHIP}`]).toBe(2)
    expect(metrics['declarations.pending']).toBe(1)
    // setupTestCase seeds two active users.
    expect(metrics['users.total']).toBe(2)
    expect(metrics['users.active']).toBe(2)
    expect(metrics['system.health']).toBe('ok')
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
  it('posts the envelope and maps 202 to accepted', async () => {
    let capturedBody: unknown = null

    mswServer.use(
      http.post(env.TELEMETRY_URL, async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json(
          {
            report_id: 'report-123',
            status: 'accepted',
            metrics_recorded: 2
          },
          { status: 202 } as HttpResponseInit
        )
      })
    )

    const report = buildTelemetryReport(
      { 'events.total': 3, 'system.health': 'ok' },
      '2026-08-13T00:00:00.000Z',
      {
        countryCode: 'FAR',
        domain: 'farajaland.opencrvs.org',
        environment: 'production'
      }
    )
    const result = await sendTelemetryReport(report)

    expect(result).toEqual({
      status: 'accepted',
      reportId: 'report-123',
      metricsRecorded: 2
    })
    expect(capturedBody).toEqual({
      schema_version: TELEMETRY_SCHEMA_VERSION,
      reported_at: '2026-08-13T00:00:00.000Z',
      country_code: 'FAR',
      domain: 'farajaland.opencrvs.org',
      instance: {
        environment: 'production',
        app_version: process.env.npm_package_version
      },
      metrics: { 'events.total': 3, 'system.health': 'ok' }
    })
  })

  it('maps a 200 idempotent duplicate to duplicate', async () => {
    mswServer.use(
      http.post(env.TELEMETRY_URL, () =>
        HttpResponse.json(
          { report_id: 'report-123', status: 'duplicate', metrics_recorded: 0 },
          { status: 200 } as HttpResponseInit
        )
      )
    )

    const report = buildTelemetryReport(
      { 'events.total': 3 },
      '2026-08-13T00:00:00.000Z',
      { countryCode: 'FAR', domain: null }
    )
    expect(await sendTelemetryReport(report)).toEqual({
      status: 'duplicate',
      reportId: 'report-123'
    })
  })

  it('returns an error result for a non-2xx response', async () => {
    mswServer.use(
      http.post(env.TELEMETRY_URL, () =>
        HttpResponse.json({ error: 'validation_failed' }, {
          status: 400
        } as HttpResponseInit)
      )
    )

    const report = buildTelemetryReport(
      { 'events.total': 3 },
      '2026-08-13T00:00:00.000Z',
      { countryCode: 'FAR', domain: null }
    )
    const result = await sendTelemetryReport(report)
    expect(result.status).toBe('error')
    if (result.status === 'error') {
      expect(result.httpStatus).toBe(400)
    }
  })
})

describe('runDailyTelemetry', () => {
  it('collects metrics and reports them for the given day', async () => {
    await setupTestCase()

    let receivedBody:
      | {
          reported_at: string
          country_code: string
          domain: string | null
          instance: { environment?: string }
        }
      | undefined
    mswServer.use(
      http.post(env.TELEMETRY_URL, async ({ request }) => {
        receivedBody = (await request.json()) as typeof receivedBody
        return HttpResponse.json(
          { report_id: 'r1', status: 'accepted', metrics_recorded: 5 },
          { status: 202 } as HttpResponseInit
        )
      })
    )

    const reportedAt = '2026-08-13T00:00:00.000Z'
    const result = await runDailyTelemetry(reportedAt)

    expect(result.status).toBe('accepted')
    expect(receivedBody?.reported_at).toBe(reportedAt)
    // country_code / domain / environment come from the default
    // /config/application msw handler (COUNTRY_CODE, TELEMETRY_DOMAIN,
    // TELEMETRY_ENVIRONMENT).
    expect(receivedBody?.country_code).toBe('FAR')
    expect(receivedBody?.domain).toBe('farajaland.opencrvs.org')
    expect(receivedBody?.instance.environment).toBe('production')
  })

  it('skips when telemetry is disabled in the application config', async () => {
    await setupTestCase()

    mswServer.use(
      http.get(`${env.COUNTRY_CONFIG_URL}/config/application`, () =>
        HttpResponse.json({
          APPLICATION_NAME: 'Test',
          COUNTRY_CODE: 'FAR',
          COUNTRY_LOGO: { fileName: 'logo.png', file: '' },
          SYSTEM_IANA_TIMEZONE: 'UTC',
          CURRENCY: { isoCode: 'USD', languagesAndCountry: ['en-US'] },
          TELEMETRY_ENABLED: false,
          PHONE_NUMBER_PATTERN: '^01[1-9][0-9]{8}$',
          USER_NOTIFICATION_DELIVERY_METHOD: 'email',
          INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'email',
          ADMIN_STRUCTURE: []
        })
      )
    )

    const result = await runDailyTelemetry('2026-08-13T00:00:00.000Z')
    expect(result.status).toBe('skipped')
  })
})
