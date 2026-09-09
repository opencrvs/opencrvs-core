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
/* eslint-disable max-lines */
import { UUID, encodeScope, getUUID, TokenUserType } from '@opencrvs/commons'
import { writeAuditLog } from '@events/storage/postgres/events/auditLog'
import {
  createSystemTestClient,
  createTestClient,
  setupTestCase
} from '@events/tests/utils'
import { CreatedUser } from '@events/tests/generators'

const auditReadScope = encodeScope({ type: 'integration.audit.read' })
const integrationCreateScope = encodeScope({ type: 'integration.create' })
const userReadScope = encodeScope({ type: 'user.read' })

/** A national administrator who may both manage integrations and read their logs. */
function createAdministratorClient(user: CreatedUser) {
  return createTestClient(user, [integrationCreateScope, auditReadScope])
}

/**
 * The error a caller observes, or a failure if the call unexpectedly resolved.
 * Asserting on `.code` rather than the whole error keeps the assertion to what
 * a caller sees, and independent of the error message.
 */
async function captureError(promise: Promise<unknown>) {
  try {
    await promise
  } catch (error) {
    return error as { code?: string } & Record<string, unknown>
  }

  throw new Error('Expected the call to be refused, but it resolved')
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Create an integration through the router and return its system client id. */
async function createIntegration(
  client: ReturnType<typeof createAdministratorClient>,
  name: string
) {
  const created = await client.integrations.create({
    name,
    scopes: [encodeScope({ type: 'record.import' })]
  })

  return created.clientId as UUID
}

/**
 * Seed entries the system client itself wrote. `createdAt` is set by the
 * database, so entries are spaced out to make their ordering deterministic.
 */
async function seedClientEntries(clientId: UUID, count: number, gapMs = 20) {
  for (let i = 0; i < count; i++) {
    if (i > 0) {
      await sleep(gapMs)
    }

    await writeAuditLog({
      clientId,
      clientType: TokenUserType.enum.system,
      operation: 'event.get',
      requestData: { eventId: getUUID() },
      responseSummary: { eventType: 'birth', trackingId: `TRACK${i}` }
    })
  }
}

/** An instant strictly between two entry timestamps, derived from the database
 *  values themselves so the assertion does not depend on the host clock. */
function instantBetween(older: string, newer: string) {
  return new Date((Date.parse(older) + Date.parse(newer)) / 2).toISOString()
}

describe('integrations.audit', () => {
  describe('access control', () => {
    test('refuses a caller without integration.audit.read', async () => {
      const { user } = await setupTestCase()
      const administrator = createAdministratorClient(user)
      const clientId = await createIntegration(
        administrator,
        'Unauthorised Read Integration'
      )

      const unscoped = createTestClient(user, [integrationCreateScope])

      const error = await captureError(
        unscoped.integrations.audit({ id: clientId })
      )

      expect(error.code).toBe('FORBIDDEN')
      expect(error).not.toHaveProperty('results')
    })

    test('allows a caller holding integration.audit.read', async () => {
      const { user } = await setupTestCase()
      const administrator = createAdministratorClient(user)
      const clientId = await createIntegration(
        administrator,
        'Authorised Read Integration'
      )

      await seedClientEntries(clientId, 1)

      const result = await administrator.integrations.audit({ id: clientId })

      expect(result.total).toBe(1)
      expect(result.results).toHaveLength(1)
    })

    test('refuses a machine caller even when it holds the scope and asks for its own log', async () => {
      const { user } = await setupTestCase()
      const administrator = createAdministratorClient(user)
      const clientId = await createIntegration(
        administrator,
        'Self Reading Integration'
      )

      await seedClientEntries(clientId, 1)

      const machine = createSystemTestClient(clientId, [auditReadScope])

      const error = await captureError(
        machine.integrations.audit({ id: clientId })
      )

      expect(error.code).toBe('FORBIDDEN')
      expect(error).not.toHaveProperty('results')
    })
  })

  describe('escalation guard', () => {
    /*
     * Regression test. `app.audit_log.client_id` is untyped text with no
     * foreign key, shared by human users and system clients, so a read keyed
     * only on that column cannot tell them apart. Without the existence check
     * against `app.system_clients`, a holder of `integration.audit.read` could
     * pass a *user's* id here and receive that user's entire audit log —
     * logins, password changes, contact changes — while holding none of the
     * scopes that govern user audit access. That is privilege escalation
     * straight across the user/integration boundary.
     *
     * See docs/adr/0001-system-client-audit-log-access.md.
     */
    test('refuses a human user identifier and leaks none of that user’s entries', async () => {
      const { user } = await setupTestCase()
      const administrator = createAdministratorClient(user)

      await writeAuditLog({
        clientId: user.id,
        clientType: TokenUserType.enum.user,
        operation: 'user.password_changed',
        requestData: { subjectId: user.id }
      })

      const error = await captureError(
        administrator.integrations.audit({ id: user.id })
      )

      expect(error.code).toBe('NOT_FOUND')
      // Nothing came back at all — not an empty page, not a partial one.
      expect(error).not.toHaveProperty('results')
      expect(error).not.toHaveProperty('total')

      // The seeded entry is real and readable by the scope that governs user
      // audit access, so it is the guard that refused it above and not an
      // empty fixture.
      const withUserRead = createTestClient(user, [userReadScope])
      const userAudit = await withUserRead.user.audit.list({ userId: user.id })

      expect(userAudit.total).toBe(1)
      expect(userAudit.results[0].operation).toBe('user.password_changed')
    })

    test('refuses a human user identifier even when that user also has a system-typed entry', async () => {
      const { user } = await setupTestCase()
      const administrator = createAdministratorClient(user)

      // The anonymous username-reminder path writes user-keyed rows with a
      // machine client type, which is why filtering on clientType would not
      // have been a substitute for the existence check.
      await writeAuditLog({
        clientId: user.id,
        clientType: TokenUserType.enum.system,
        operation: 'user.username_reminder',
        requestData: { subjectId: user.id }
      })

      const error = await captureError(
        administrator.integrations.audit({ id: user.id })
      )

      expect(error.code).toBe('NOT_FOUND')
      expect(error).not.toHaveProperty('results')
    })
  })

  describe('not found', () => {
    test('refuses an unknown identifier as NOT_FOUND rather than a server error', async () => {
      const { user } = await setupTestCase()
      const administrator = createAdministratorClient(user)

      const error = await captureError(
        administrator.integrations.audit({ id: getUUID() })
      )

      expect(error.code).toBe('NOT_FOUND')
      expect(error.code).not.toBe('INTERNAL_SERVER_ERROR')
    })

    test('refuses a deleted integration as NOT_FOUND', async () => {
      const { user } = await setupTestCase()
      const administrator = createAdministratorClient(user)
      const clientId = await createIntegration(
        administrator,
        'Doomed Integration'
      )

      await seedClientEntries(clientId, 1)
      await administrator.integrations.delete({ id: clientId })

      const error = await captureError(
        administrator.integrations.audit({ id: clientId })
      )

      expect(error.code).toBe('NOT_FOUND')
      expect(error.code).not.toBe('INTERNAL_SERVER_ERROR')
      expect(error).not.toHaveProperty('results')
    })
  })

  describe('empty case', () => {
    test('an integration with no activity returns an empty page and a zero total', async () => {
      const { user } = await setupTestCase()
      const administrator = createAdministratorClient(user)
      const clientId = await createIntegration(
        administrator,
        'Idle Integration'
      )

      const result = await administrator.integrations.audit({ id: clientId })

      expect(result.results).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('client semantics', () => {
    test('returns what the integration did, not its lifecycle recorded against the administrator', async () => {
      const { user } = await setupTestCase()
      const administrator = createAdministratorClient(user)
      const clientId = await createIntegration(
        administrator,
        'Lifecycle Integration'
      )

      // The integration itself does something audited.
      await writeAuditLog({
        clientId,
        clientType: TokenUserType.enum.system,
        operation: 'user.username_reminder',
        requestData: { subjectId: user.id }
      })

      // ...and the administrator disables it afterwards.
      await administrator.integrations.deactivate({ id: clientId })

      const result = await administrator.integrations.audit({ id: clientId })

      expect(result.total).toBe(1)
      expect(result.results.map((entry) => entry.operation)).toEqual([
        'user.username_reminder'
      ])
      expect(result.results.every((entry) => entry.clientId === clientId)).toBe(
        true
      )

      // The lifecycle entries exist, but are keyed to the administrator.
      const administratorAudit = await createTestClient(user, [
        userReadScope
      ]).user.audit.list({ userId: user.id, count: 100 })

      expect(
        administratorAudit.results.map((entry) => entry.operation)
      ).toEqual(
        expect.arrayContaining([
          'integrations.create',
          'integrations.deactivate'
        ])
      )
    })
  })

  describe('pagination', () => {
    test('returns the right slice and the unpaged total on every page', async () => {
      const { user } = await setupTestCase()
      const administrator = createAdministratorClient(user)
      const clientId = await createIntegration(
        administrator,
        'Paged Integration'
      )

      await seedClientEntries(clientId, 5)

      const all = await administrator.integrations.audit({
        id: clientId,
        count: 100
      })
      expect(all.total).toBe(5)
      const allIds = all.results.map((entry) => entry.id)

      const firstPage = await administrator.integrations.audit({
        id: clientId,
        skip: 0,
        count: 2
      })
      expect(firstPage.total).toBe(5)
      expect(firstPage.results.map((entry) => entry.id)).toEqual(
        allIds.slice(0, 2)
      )

      const secondPage = await administrator.integrations.audit({
        id: clientId,
        skip: 2,
        count: 2
      })
      expect(secondPage.total).toBe(5)
      expect(secondPage.results.map((entry) => entry.id)).toEqual(
        allIds.slice(2, 4)
      )

      const thirdPage = await administrator.integrations.audit({
        id: clientId,
        skip: 4,
        count: 2
      })
      expect(thirdPage.total).toBe(5)
      expect(thirdPage.results.map((entry) => entry.id)).toEqual(
        allIds.slice(4)
      )
    })

    test('defaults to the first ten entries', async () => {
      const { user } = await setupTestCase()
      const administrator = createAdministratorClient(user)
      const clientId = await createIntegration(
        administrator,
        'Default Page Integration'
      )

      await seedClientEntries(clientId, 12, 2)

      const result = await administrator.integrations.audit({ id: clientId })

      expect(result.results).toHaveLength(10)
      expect(result.total).toBe(12)
    })
  })

  describe('input validation', () => {
    describe('pagination bounds', () => {
      const invalidPagination: [string, { skip?: number; count?: number }][] = [
        ['an oversized page size', { count: 101 }],
        ['a fractional page size', { count: 10.5 }],
        ['a zero page size', { count: 0 }],
        ['a negative page size', { count: -1 }],
        ['a negative offset', { skip: -1 }],
        ['a fractional offset', { skip: 1.5 }]
      ]

      test.each(invalidPagination)(
        'rejects %s as a bad request',
        async (_label, overrides) => {
          const { user } = await setupTestCase()
          const administrator = createAdministratorClient(user)
          const clientId = await createIntegration(
            administrator,
            'Bounded Integration'
          )

          const error = await captureError(
            administrator.integrations.audit({ id: clientId, ...overrides })
          )

          expect(error.code).toBe('BAD_REQUEST')
        }
      )

      test('accepts the boundary page size of 100', async () => {
        const { user } = await setupTestCase()
        const administrator = createAdministratorClient(user)
        const clientId = await createIntegration(
          administrator,
          'Boundary Integration'
        )

        await expect(
          administrator.integrations.audit({ id: clientId, count: 100, skip: 0 })
        ).resolves.toEqual({ results: [], total: 0 })
      })
    })

    test('rejects an identifier that is not a UUID', async () => {
      const { user } = await setupTestCase()
      const administrator = createAdministratorClient(user)

      const error = await captureError(
        administrator.integrations.audit({ id: 'not-a-uuid' as UUID })
      )

      expect(error.code).toBe('BAD_REQUEST')
    })

    describe('date validation', () => {
      const invalidBounds: [string, { timeStart?: string; timeEnd?: string }][] =
        [
          [
            'a bare calendar date as the lower bound',
            { timeStart: '2026-07-28' }
          ],
          ['a bare calendar date as the upper bound', { timeEnd: '2026-07-28' }],
          ['a non-date string', { timeStart: 'garbage' }]
        ]

      test.each(invalidBounds)(
        'rejects %s as a bad request',
        async (_label, overrides) => {
          const { user } = await setupTestCase()
          const administrator = createAdministratorClient(user)
          const clientId = await createIntegration(
            administrator,
            'Date Validation Integration'
          )

          const error = await captureError(
            administrator.integrations.audit({ id: clientId, ...overrides })
          )

          expect(error.code).toBe('BAD_REQUEST')
        }
      )

      const validBounds: [string, string][] = [
        ['a UTC instant', '2026-07-28T10:00:00.000Z'],
        ['an instant with a numeric offset', '2026-07-28T10:00:00+02:00']
      ]

      test.each(validBounds)('accepts %s', async (_label, timeStart) => {
        const { user } = await setupTestCase()
        const administrator = createAdministratorClient(user)
        const clientId = await createIntegration(
          administrator,
          'Instant Integration'
        )

        await expect(
          administrator.integrations.audit({ id: clientId, timeStart })
        ).resolves.toMatchObject({ total: expect.any(Number) })
      })
    })
    })

  describe('time filtering', () => {
    test('a lower bound in the future yields nothing', async () => {
      const { user } = await setupTestCase()
      const administrator = createAdministratorClient(user)
      const clientId = await createIntegration(
        administrator,
        'Future Bound Integration'
      )

      await seedClientEntries(clientId, 2)

      const result = await administrator.integrations.audit({
        id: clientId,
        timeStart: new Date(Date.now() + 600_000).toISOString()
      })

      expect(result.results).toEqual([])
      expect(result.total).toBe(0)
    })

    test('an upper bound in the past yields nothing', async () => {
      const { user } = await setupTestCase()
      const administrator = createAdministratorClient(user)
      const clientId = await createIntegration(
        administrator,
        'Past Bound Integration'
      )

      await seedClientEntries(clientId, 2)

      const result = await administrator.integrations.audit({
        id: clientId,
        timeEnd: new Date(Date.now() - 600_000).toISOString()
      })

      expect(result.results).toEqual([])
      expect(result.total).toBe(0)
    })

    test('a window around known entries yields exactly those, with a filtered total', async () => {
      const { user } = await setupTestCase()
      const administrator = createAdministratorClient(user)
      const clientId = await createIntegration(
        administrator,
        'Windowed Integration'
      )

      // Spaced widely enough that a boundary can sit unambiguously between two
      // entries.
      await seedClientEntries(clientId, 5, 60)

      const all = await administrator.integrations.audit({
        id: clientId,
        count: 100
      })
      expect(all.total).toBe(5)

      // Newest first.
      const [newest, second, third, fourth] = all.results

      const windowed = await administrator.integrations.audit({
        id: clientId,
        timeStart: instantBetween(fourth.createdAt, third.createdAt),
        timeEnd: instantBetween(second.createdAt, newest.createdAt)
      })

      expect(windowed.results.map((entry) => entry.id)).toEqual([
        second.id,
        third.id
      ])
      // The total reflects the filters, not all of time.
      expect(windowed.total).toBe(2)

      const sinceSecond = await administrator.integrations.audit({
        id: clientId,
        timeStart: instantBetween(second.createdAt, newest.createdAt)
      })

      expect(sinceSecond.results.map((entry) => entry.id)).toEqual([newest.id])
      expect(sinceSecond.total).toBe(1)
    })

    test('a filtered total is independent of the page size', async () => {
      const { user } = await setupTestCase()
      const administrator = createAdministratorClient(user)
      const clientId = await createIntegration(
        administrator,
        'Filtered Total Integration'
      )

      await seedClientEntries(clientId, 4, 60)

      const all = await administrator.integrations.audit({
        id: clientId,
        count: 100
      })
      expect(all.total).toBe(4)
      const [newest, , third, fourth] = all.results

      // A window holding the three newest entries, read one entry at a time.
      const result = await administrator.integrations.audit({
        id: clientId,
        count: 1,
        timeStart: instantBetween(fourth.createdAt, third.createdAt)
      })

      expect(result.results.map((entry) => entry.id)).toEqual([newest.id])
      expect(result.total).toBe(3)
    })
  })

  describe('ordering', () => {
    test('returns entries newest first', async () => {
      const { user } = await setupTestCase()
      const administrator = createAdministratorClient(user)
      const clientId = await createIntegration(
        administrator,
        'Ordered Integration'
      )

      const trackingIds = ['FIRST', 'SECOND', 'THIRD']
      for (const trackingId of trackingIds) {
        await writeAuditLog({
          clientId,
          clientType: TokenUserType.enum.system,
          operation: 'event.get',
          requestData: { eventId: getUUID() },
          responseSummary: { eventType: 'birth', trackingId }
        })
        await sleep(20)
      }

      const result = await administrator.integrations.audit({ id: clientId })

      expect(
        result.results.map((entry) =>
          entry.operation === 'event.get'
            ? entry.responseSummary.trackingId
            : null
        )
      ).toEqual(['THIRD', 'SECOND', 'FIRST'])

      const timestamps = result.results.map((entry) =>
        Date.parse(entry.createdAt)
      )
      expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a))
    })
  })

  describe('side effects', () => {
    test('reading an audit log writes no audit entry of its own', async () => {
      const { user } = await setupTestCase()
      const administrator = createAdministratorClient(user)
      const withUserRead = createTestClient(user, [userReadScope])
      const clientId = await createIntegration(
        administrator,
        'Observed Integration'
      )

      const before = await withUserRead.user.audit.list({
        userId: user.id,
        count: 100
      })

      await administrator.integrations.audit({ id: clientId })
      await administrator.integrations.audit({
        id: clientId,
        count: 5,
        skip: 0
      })

      const after = await withUserRead.user.audit.list({
        userId: user.id,
        count: 100
      })

      // Nothing recorded against the reader...
      expect(after.total).toBe(before.total)
      // ...and nothing recorded against the integration either.
      const result = await administrator.integrations.audit({ id: clientId })
      expect(result.total).toBe(0)
    })
  })
})
