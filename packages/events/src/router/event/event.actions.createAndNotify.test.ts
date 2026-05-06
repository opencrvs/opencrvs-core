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
import { TRPCError } from "@trpc/server"
import {
  ActionStatus,
  ActionType,
  encodeScope,
  getAcceptedActions,
  getUUID,
  TENNIS_CLUB_MEMBERSHIP
} from "@opencrvs/commons"
import {
  createSystemTestClient,
  createTestClient,
  setupTestCase,
  TEST_SYSTEM_ID
} from "@events/tests/utils"

describe("event.actions.createAndNotify", () => {
  describe("authorization", () => {
    test("regular (non-system) user is forbidden regardless of scopes", async () => {
      const { user, locations } = await setupTestCase()
      const client = createTestClient(user, [
        encodeScope({ type: "record.create" }),
        encodeScope({ type: "record.notify" })
      ])

      await expect(
        client.event.actions.createAndNotify.request({
          eventType: TENNIS_CLUB_MEMBERSHIP,
          transactionId: getUUID(),
          declaration: {},
          createdAtLocation: locations[0].id
        })
      ).rejects.toMatchObject(new TRPCError({ code: "FORBIDDEN" }))
    })

    test("prevents access when both scopes are missing", async () => {
      await setupTestCase()
      const client = createSystemTestClient(TEST_SYSTEM_ID, [])

      await expect(
        client.event.actions.createAndNotify.request({
          eventType: TENNIS_CLUB_MEMBERSHIP,
          transactionId: getUUID(),
          declaration: {},
          createdAtLocation: getUUID()
        })
      ).rejects.toMatchObject(new TRPCError({ code: "FORBIDDEN" }))
    })

    test("prevents access when only record.create scope is present", async () => {
      await setupTestCase()
      const client = createSystemTestClient(TEST_SYSTEM_ID, [
        encodeScope({ type: "record.create" })
      ])

      await expect(
        client.event.actions.createAndNotify.request({
          eventType: TENNIS_CLUB_MEMBERSHIP,
          transactionId: getUUID(),
          declaration: {},
          createdAtLocation: getUUID()
        })
      ).rejects.toMatchObject(new TRPCError({ code: "FORBIDDEN" }))
    })

    test("prevents access when only record.notify scope is present", async () => {
      await setupTestCase()
      const client = createSystemTestClient(TEST_SYSTEM_ID, [
        encodeScope({ type: "record.notify" })
      ])

      await expect(
        client.event.actions.createAndNotify.request({
          eventType: TENNIS_CLUB_MEMBERSHIP,
          transactionId: getUUID(),
          declaration: {},
          createdAtLocation: getUUID()
        })
      ).rejects.toMatchObject(new TRPCError({ code: "FORBIDDEN" }))
    })

    test("allows access when both record.create and record.notify scopes are present", async () => {
      const { locations } = await setupTestCase()
      const client = createSystemTestClient(TEST_SYSTEM_ID, [
        encodeScope({ type: "record.create" }),
        encodeScope({ type: "record.notify" })
      ])

      await expect(
        client.event.actions.createAndNotify.request({
          eventType: TENNIS_CLUB_MEMBERSHIP,
          transactionId: getUUID(),
          declaration: {},
          createdAtLocation: locations[0].id
        })
      ).resolves.toMatchObject({ type: TENNIS_CLUB_MEMBERSHIP })
    })

    test("prevents access when record.create scope is for a different event type", async () => {
      await setupTestCase()
      const client = createSystemTestClient(TEST_SYSTEM_ID, [
        encodeScope({
          type: "record.create",
          options: { event: ["some-other-event"] }
        }),
        encodeScope({
          type: "record.notify",
          options: { event: [TENNIS_CLUB_MEMBERSHIP] }
        })
      ])

      await expect(
        client.event.actions.createAndNotify.request({
          eventType: TENNIS_CLUB_MEMBERSHIP,
          transactionId: getUUID(),
          declaration: {},
          createdAtLocation: getUUID()
        })
      ).rejects.toMatchObject(new TRPCError({ code: "FORBIDDEN" }))
    })

    test("prevents access when record.notify scope is for a different event type", async () => {
      await setupTestCase()
      const client = createSystemTestClient(TEST_SYSTEM_ID, [
        encodeScope({
          type: "record.create",
          options: { event: [TENNIS_CLUB_MEMBERSHIP] }
        }),
        encodeScope({
          type: "record.notify",
          options: { event: ["some-other-event"] }
        })
      ])

      await expect(
        client.event.actions.createAndNotify.request({
          eventType: TENNIS_CLUB_MEMBERSHIP,
          transactionId: getUUID(),
          declaration: {},
          createdAtLocation: getUUID()
        })
      ).rejects.toMatchObject(new TRPCError({ code: "FORBIDDEN" }))
    })

    test("allows access when scopes are restricted to matching event type", async () => {
      const { locations } = await setupTestCase()
      const client = createSystemTestClient(TEST_SYSTEM_ID, [
        encodeScope({
          type: "record.create",
          options: { event: [TENNIS_CLUB_MEMBERSHIP] }
        }),
        encodeScope({
          type: "record.notify",
          options: { event: [TENNIS_CLUB_MEMBERSHIP] }
        })
      ])

      await expect(
        client.event.actions.createAndNotify.request({
          eventType: TENNIS_CLUB_MEMBERSHIP,
          transactionId: getUUID(),
          declaration: {},
          createdAtLocation: locations[0].id
        })
      ).resolves.toMatchObject({ type: TENNIS_CLUB_MEMBERSHIP })
    })
  })

  test("creates an event and applies a NOTIFY action in one request", async () => {
    const { locations } = await setupTestCase()
    const client = createSystemTestClient(TEST_SYSTEM_ID, [
      encodeScope({
        type: "record.create",
        options: { event: [TENNIS_CLUB_MEMBERSHIP] }
      }),
      encodeScope({
        type: "record.notify",
        options: { event: [TENNIS_CLUB_MEMBERSHIP] }
      })
    ])

    const result = await client.event.actions.createAndNotify.request({
      eventType: TENNIS_CLUB_MEMBERSHIP,
      transactionId: getUUID(),
      declaration: { "applicant.email": "test@opencrvs.org" },
      createdAtLocation: locations[0].id
    })

    expect(result.type).toBe(TENNIS_CLUB_MEMBERSHIP)

    const activeActions = getAcceptedActions(result)
    expect(
      activeActions.find((a) => a.type === ActionType.NOTIFY)
    ).toBeDefined()
  })

  test("returned event contains CREATE and NOTIFY actions (no ASSIGN for system user)", async () => {
    const { locations } = await setupTestCase()
    const client = createSystemTestClient(TEST_SYSTEM_ID, [
      encodeScope({ type: "record.create" }),
      encodeScope({ type: "record.notify" })
    ])

    const result = await client.event.actions.createAndNotify.request({
      eventType: TENNIS_CLUB_MEMBERSHIP,
      transactionId: getUUID(),
      declaration: {},
      createdAtLocation: locations[0].id
    })

    // NOTIFY goes through request/accept flow, so two NOTIFY actions are expected
    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: ActionType.CREATE }),
        expect.objectContaining({ type: ActionType.NOTIFY, status: ActionStatus.Requested }),
        expect.objectContaining({ type: ActionType.NOTIFY, status: ActionStatus.Accepted })
      ])
    )
    // System users do not get an ASSIGN action
    expect(result.actions.find((a) => a.type === ActionType.ASSIGN)).toBeUndefined()
  })

  test("is idempotent: calling twice with the same transactionId returns the same event", async () => {
    const { locations, eventsDb } = await setupTestCase()
    const client = createSystemTestClient(TEST_SYSTEM_ID, [
      encodeScope({ type: "record.create" }),
      encodeScope({ type: "record.notify" })
    ])

    const transactionId = getUUID()
    const payload = {
      eventType: TENNIS_CLUB_MEMBERSHIP,
      transactionId,
      declaration: {},
      createdAtLocation: locations[0].id
    }

    const first = await client.event.actions.createAndNotify.request(payload)
    const second = await client.event.actions.createAndNotify.request(payload)

    expect(first.id).toBe(second.id)

    // Only one event must exist in the database
    const events = await eventsDb
      .selectFrom("events")
      .selectAll()
      .execute()
    expect(events).toHaveLength(1)
  })

  test("fails with BAD_REQUEST for unknown event type", async () => {
    const { locations } = await setupTestCase()
    const client = createSystemTestClient(TEST_SYSTEM_ID, [
      encodeScope({ type: "record.create" }),
      encodeScope({ type: "record.notify" })
    ])

    await expect(
      client.event.actions.createAndNotify.request({
        eventType: "does-not-exist",
        transactionId: getUUID(),
        declaration: {},
        createdAtLocation: locations[0].id
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" })
  })

  test("fails with BAD_REQUEST for malformed declaration field", async () => {
    const { locations } = await setupTestCase()
    const client = createSystemTestClient(TEST_SYSTEM_ID, [
      encodeScope({ type: "record.create" }),
      encodeScope({ type: "record.notify" })
    ])

    await expect(
      client.event.actions.createAndNotify.request({
        eventType: TENNIS_CLUB_MEMBERSHIP,
        transactionId: getUUID(),
        declaration: {
          "applicant.name": { firstname: 123 } as unknown as string
        },
        createdAtLocation: locations[0].id
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" })
  })

  test("creates event with correct createdAtLocation on the CREATE action", async () => {
    const { locations } = await setupTestCase()
    const leafLocation = locations[0]

    const client = createSystemTestClient(TEST_SYSTEM_ID, [
      encodeScope({
        type: "record.create",
        options: { event: [TENNIS_CLUB_MEMBERSHIP] }
      }),
      encodeScope({
        type: "record.notify",
        options: { event: [TENNIS_CLUB_MEMBERSHIP] }
      })
    ])

    const result = await client.event.actions.createAndNotify.request({
      eventType: TENNIS_CLUB_MEMBERSHIP,
      transactionId: getUUID(),
      declaration: { "applicant.email": "sys@opencrvs.org" },
      createdAtLocation: leafLocation.id
    })

    expect(result.type).toBe(TENNIS_CLUB_MEMBERSHIP)
    expect(result.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: ActionType.CREATE,
          createdAtLocation: leafLocation.id
        }),
        expect.objectContaining({ type: ActionType.NOTIFY })
      ])
    )
  })

  test("rejects when createdAtLocation is an unknown UUID", async () => {
    await setupTestCase()

    const client = createSystemTestClient(TEST_SYSTEM_ID, [
      encodeScope({ type: "record.create" }),
      encodeScope({ type: "record.notify" })
    ])

    await expect(
      client.event.actions.createAndNotify.request({
        eventType: TENNIS_CLUB_MEMBERSHIP,
        transactionId: getUUID(),
        declaration: {},
        createdAtLocation: getUUID()
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" })
  })

  test("rejects when createdAtLocation is an administrative area (non-leaf)", async () => {
    // Administrative area IDs are not valid location IDs (different table)
    const { locations } = await setupTestCase()
    const adminAreaId = locations[0].administrativeAreaId ?? getUUID()

    const client = createSystemTestClient(TEST_SYSTEM_ID, [
      encodeScope({ type: "record.create" }),
      encodeScope({ type: "record.notify" })
    ])

    await expect(
      client.event.actions.createAndNotify.request({
        eventType: TENNIS_CLUB_MEMBERSHIP,
        transactionId: getUUID(),
        declaration: {},
        createdAtLocation: adminAreaId
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" })
  })
})
