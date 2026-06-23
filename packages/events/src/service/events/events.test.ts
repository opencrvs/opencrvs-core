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
import { TRPCError } from '@trpc/server'
import { http, HttpResponse, HttpResponseInit } from 'msw'
import {
  ActionInputWithType,
  ActionStatus,
  ActionType,
  DeclareActionInput,
  DocumentPath,
  EventStatus,
  TENNIS_CLUB_MEMBERSHIP,
  TokenUserType,
  TokenWithBearer,
  UUID,
  getStatusFromActions,
  getUUID
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  createTestClient,
  createTestToken,
  setupTestCase,
  TEST_SYSTEM_ID,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'
import { payloadGenerator } from '@events/tests/generators'
import { processAction } from '@events/service/events/events'
import { TrpcUserContext } from '@events/context'
import {
  getEventIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'
import * as draftsRepo from '@events/storage/postgres/events/drafts'

type TestUser = Awaited<ReturnType<typeof setupTestCase>>['user']

function buildDeclareInput(
  eventId: UUID,
  generator: ReturnType<typeof payloadGenerator>,
  overrides: Partial<DeclareActionInput> = {}
): ActionInputWithType {
  const base = generator.event.actions.declare(eventId)
  return {
    ...base,
    eventId,
    waitFor: true,
    ...overrides
  }
}

function buildReadInput(eventId: UUID): ActionInputWithType {
  return {
    eventId,
    transactionId: getUUID(),
    type: ActionType.READ,
    declaration: {},
    waitFor: true
  }
}

describe('processAction', () => {
  let user: TestUser
  let generator: ReturnType<typeof payloadGenerator>
  let token: TokenWithBearer
  let trpcUser: TrpcUserContext
  let eventId: UUID

  beforeEach(async () => {
    const testCase = await setupTestCase()
    user = testCase.user
    generator = testCase.generator

    token = createTestToken({
      userId: user.id,
      scopes: TEST_USER_DEFAULT_SCOPES,
      userType: TokenUserType.enum.user,
      role: user.role
    })

    trpcUser = {
      ...user,
      type: TokenUserType.enum.user
    }

    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())
    eventId = event.id
  })

  describe('action persistence', () => {
    test('appends the action to event.actions and returns the updated event', async () => {
      const input = buildDeclareInput(eventId, generator, {
        keepAssignment: true
      })

      const updatedEvent = await processAction(input, {
        eventId,
        user: trpcUser,
        token,
        status: ActionStatus.Accepted,
        configuration: tennisClubMembershipEvent
      })

      expect(updatedEvent.id).toBe(eventId)
      expect(updatedEvent.actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: ActionType.DECLARE,
            status: ActionStatus.Accepted
          })
        ])
      )
    })

    test('persists the action with the provided status', async () => {
      const input = buildDeclareInput(eventId, generator, {
        keepAssignment: true
      })

      const updatedEvent = await processAction(input, {
        eventId,
        user: trpcUser,
        token,
        status: ActionStatus.Requested,
        configuration: tennisClubMembershipEvent
      })

      const declareActions = updatedEvent.actions.filter(
        (action) => action.type === ActionType.DECLARE
      )
      expect(declareActions).toHaveLength(1)
      expect(declareActions[0].status).toBe(ActionStatus.Requested)
    })
  })

  describe('keepAssignment resolution', () => {
    test('does NOT add UNASSIGN when keepAssignmentIfAccepted=true and status=Accepted', async () => {
      const input = buildDeclareInput(eventId, generator, {
        keepAssignmentIfAccepted: true,
        keepAssignmentIfRejected: false
      })

      const updatedEvent = await processAction(input, {
        eventId,
        user: trpcUser,
        token,
        status: ActionStatus.Accepted,
        configuration: tennisClubMembershipEvent
      })

      expect(
        updatedEvent.actions.some(
          (action) => action.type === ActionType.UNASSIGN
        )
      ).toBe(false)
    })

    test('does NOT add UNASSIGN when keepAssignmentIfRejected=true and status=Rejected', async () => {
      const input = buildDeclareInput(eventId, generator, {
        keepAssignmentIfAccepted: false,
        keepAssignmentIfRejected: true
      })

      const updatedEvent = await processAction(input, {
        eventId,
        user: trpcUser,
        token,
        status: ActionStatus.Rejected,
        configuration: tennisClubMembershipEvent
      })

      expect(
        updatedEvent.actions.some(
          (action) => action.type === ActionType.UNASSIGN
        )
      ).toBe(false)
    })

    test('adds UNASSIGN when keepAssignmentIfAccepted=false and status=Accepted', async () => {
      const input = buildDeclareInput(eventId, generator, {
        keepAssignmentIfAccepted: false,
        keepAssignmentIfRejected: true
      })

      const updatedEvent = await processAction(input, {
        eventId,
        user: trpcUser,
        token,
        status: ActionStatus.Accepted,
        configuration: tennisClubMembershipEvent
      })

      expect(updatedEvent.actions.at(-1)?.type).toBe(ActionType.UNASSIGN)
    })

    test('falls back to keepAssignment when status-specific flag is undefined', async () => {
      const input = buildDeclareInput(eventId, generator, {
        keepAssignment: true
      })

      const updatedEvent = await processAction(input, {
        eventId,
        user: trpcUser,
        token,
        status: ActionStatus.Accepted,
        configuration: tennisClubMembershipEvent
      })

      expect(
        updatedEvent.actions.some(
          (action) => action.type === ActionType.UNASSIGN
        )
      ).toBe(false)
    })

    test('defaults to unassigning when no keepAssignment flags are provided', async () => {
      const input = buildDeclareInput(eventId, generator)

      const updatedEvent = await processAction(input, {
        eventId,
        user: trpcUser,
        token,
        status: ActionStatus.Accepted,
        configuration: tennisClubMembershipEvent
      })

      expect(updatedEvent.actions.at(-1)?.type).toBe(ActionType.UNASSIGN)
    })
  })

  describe('UNASSIGN side-effect', () => {
    test('does NOT add UNASSIGN when status is Requested', async () => {
      const input = buildDeclareInput(eventId, generator)

      const updatedEvent = await processAction(input, {
        eventId,
        user: trpcUser,
        token,
        status: ActionStatus.Requested,
        configuration: tennisClubMembershipEvent
      })

      expect(
        updatedEvent.actions.some(
          (action) => action.type === ActionType.UNASSIGN
        )
      ).toBe(false)
    })

    test('does NOT add UNASSIGN when the action is not a write action (READ)', async () => {
      const input = buildReadInput(eventId)

      const updatedEvent = await processAction(input, {
        eventId,
        user: trpcUser,
        token,
        status: ActionStatus.Accepted,
        configuration: tennisClubMembershipEvent
      })

      expect(
        updatedEvent.actions.some(
          (action) => action.type === ActionType.UNASSIGN
        )
      ).toBe(false)
      expect(
        updatedEvent.actions.some((action) => action.type === ActionType.READ)
      ).toBe(true)
    })

    test('does NOT add UNASSIGN when the user is a system user', async () => {
      const systemToken = createTestToken({
        userId: TEST_SYSTEM_ID,
        scopes: TEST_USER_DEFAULT_SCOPES,
        userType: TokenUserType.enum.system
      })

      const systemUser: TrpcUserContext = {
        id: TEST_SYSTEM_ID,
        primaryOfficeId: user.primaryOfficeId,
        administrativeAreaId: user.administrativeAreaId ?? undefined,
        type: TokenUserType.enum.system
      }

      const input = buildDeclareInput(eventId, generator)

      const updatedEvent = await processAction(input, {
        eventId,
        user: systemUser,
        token: systemToken,
        status: ActionStatus.Accepted,
        configuration: tennisClubMembershipEvent
      })

      expect(
        updatedEvent.actions.some(
          (action) => action.type === ActionType.UNASSIGN
        )
      ).toBe(false)
    })
  })

  describe('drafts cleanup', () => {
    test('deletes drafts associated with the event for a non-READ/non-ASSIGN action', async () => {
      const client = createTestClient(user)
      await client.event.draft.create({
        eventId,
        type: ActionType.DECLARE,
        status: ActionStatus.Accepted,
        transactionId: 'draft-trnx-id'
      })

      const draftsBefore = await draftsRepo.getDraftsByUserId(user.id)
      expect(draftsBefore.some((draft) => draft.eventId === eventId)).toBe(true)

      const input = buildDeclareInput(eventId, generator, {
        keepAssignment: true
      })

      await processAction(input, {
        eventId,
        user: trpcUser,
        token,
        status: ActionStatus.Accepted,
        configuration: tennisClubMembershipEvent
      })

      const draftsAfter = await draftsRepo.getDraftsByUserId(user.id)
      expect(draftsAfter.some((draft) => draft.eventId === eventId)).toBe(false)
    })

    test('does NOT delete drafts for a READ action', async () => {
      const client = createTestClient(user)
      await client.event.draft.create({
        eventId,
        type: ActionType.DECLARE,
        status: ActionStatus.Accepted,
        transactionId: 'draft-trnx-id'
      })

      const input = buildReadInput(eventId)

      await processAction(input, {
        eventId,
        user: trpcUser,
        token,
        status: ActionStatus.Accepted,
        configuration: tennisClubMembershipEvent
      })

      const draftsAfter = await draftsRepo.getDraftsByUserId(user.id)
      expect(draftsAfter.some((draft) => draft.eventId === eventId)).toBe(true)
    })
  })

  describe('Elasticsearch indexing', () => {
    test('indexes the event when status transitions out of CREATED', async () => {
      const input = buildDeclareInput(eventId, generator, {
        keepAssignment: true
      })

      const updatedEvent = await processAction(input, {
        eventId,
        user: trpcUser,
        token,
        status: ActionStatus.Accepted,
        configuration: tennisClubMembershipEvent
      })

      expect(getStatusFromActions(updatedEvent.actions)).toBe(
        EventStatus.enum.DECLARED
      )

      const esClient = getOrCreateClient()
      const body = await esClient.search({
        index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP),
        body: { query: { match_all: {} } }
      })

      expect(body.hits.hits).toHaveLength(1)
      expect((body.hits.hits[0]._source as { id: UUID }).id).toBe(eventId)
    })

    test('does NOT index the event while it stays in CREATED status', async () => {
      // A Requested DECLARE action does not transition the event status from CREATED
      const input = buildDeclareInput(eventId, generator, {
        keepAssignment: true
      })

      const updatedEvent = await processAction(input, {
        eventId,
        user: trpcUser,
        token,
        status: ActionStatus.Requested,
        configuration: tennisClubMembershipEvent
      })

      expect(getStatusFromActions(updatedEvent.actions)).toBe(
        EventStatus.enum.CREATED
      )

      const esClient = getOrCreateClient()
      const body = await esClient.search({
        index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP),
        body: { query: { match_all: {} } }
      })

      expect(body.hits.hits).toHaveLength(0)
    })
  })

  describe('file validation', () => {
    test('throws BAD_REQUEST when a referenced file does not exist', async () => {
      mswServer.use(
        http.head(
          `${env.DOCUMENTS_URL}/files/:filePath*`,
          () => new HttpResponse(null, { status: 404 } as HttpResponseInit)
        )
      )

      const input = buildDeclareInput(eventId, generator, {
        keepAssignment: true,
        declaration: {
          ...generator.event.actions.declare(eventId).declaration,
          'applicant.image': {
            type: 'image/png',
            originalFilename: 'missing.png',
            path: 'missing-file.png' as DocumentPath
          }
        }
      })

      await expect(
        processAction(input, {
          eventId,
          user: trpcUser,
          token,
          status: ActionStatus.Accepted,
          configuration: tennisClubMembershipEvent
        })
      ).rejects.toMatchObject(
        new TRPCError({
          code: 'BAD_REQUEST',
          message: 'File not found: missing-file.png'
        })
      )
    })
  })
})
