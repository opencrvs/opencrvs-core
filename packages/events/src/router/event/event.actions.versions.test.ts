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
import { http, HttpResponse } from 'msw'
import {
  ActionConfig,
  ActionStatus,
  ActionType,
  createPrng,
  encodeScope,
  EventConfig,
  EventDocument,
  EventState,
  eventQueryDataGenerator,
  FieldConfig,
  FieldType,
  generateActionDuplicateDeclarationInput,
  getOrThrow,
  getUUID,
  TENNIS_CLUB_MEMBERSHIP
} from '@opencrvs/commons'
import {
  tennisClubMembershipEvent,
  tennisClubMembershipEventWithDedupCheck
} from '@opencrvs/commons/fixtures'
import {
  CONFIRMATION_SCOPES,
  createEvent,
  createSystemTestClient,
  createTestClient,
  setupTestCase,
  TEST_SYSTEM_ID,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import {
  getEventIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { encodeEventIndex } from '@events/service/indexing/utils'
import { env } from '@events/environment'
import { getClient } from '@events/storage/postgres/events'

const PAST = '2010-01-01'
const DISTANT_PAST = '2000-01-01'
const FUTURE = '2999-01-01'
const EXTRA_FIELD_ID = 'applicant.extra'
const CUSTOM_ACTION_TYPE = 'VERSIONS_TEST_ACTION'

const customAction = {
  type: ActionType.CUSTOM,
  customActionType: CUSTOM_ACTION_TYPE,
  label: {
    id: 'event.tennis-club-membership.action.versions-test.label',
    defaultMessage: 'Versions test',
    description: 'Custom action of the versions tests'
  },
  auditHistoryLabel: {
    id: 'event.tennis-club-membership.action.versions-test.audit-history-label',
    defaultMessage: 'Versions test performed',
    description: 'Audit history label of the versions test action'
  },
  form: [],
  flags: []
} satisfies ActionConfig

const CUSTOM_ACTION_SCOPES = [
  ...TEST_USER_DEFAULT_SCOPES,
  encodeScope({
    type: 'record.custom-action',
    options: {
      event: [TENNIS_CLUB_MEMBERSHIP],
      customActionTypes: [CUSTOM_ACTION_TYPE]
    }
  })
]

const confirmer = createSystemTestClient(TEST_SYSTEM_ID, [
  ...CONFIRMATION_SCOPES,
  encodeScope({ type: 'record.read' })
])

function mockConfirmationResponse(
  actionType: ActionType,
  status: number,
  body: Record<string, unknown> = {}
) {
  mswServer.use(
    http.post(
      `${env.COUNTRY_CONFIG_URL}/trigger/events/${TENNIS_CLUB_MEMBERSHIP}/actions/${actionType}`,
      () => HttpResponse.json(body, { status })
    )
  )
}

function useEventConfig(config: EventConfig) {
  mswServer.use(
    http.get(`${env.COUNTRY_CONFIG_URL}/config/events`, () =>
      HttpResponse.json([config])
    )
  )
}

function getFixtureAction(type: ActionType) {
  return getOrThrow(
    tennisClubMembershipEvent.actions.find((action) => action.type === type),
    `Expected the fixture to have a ${type} action`
  )
}

/** The fixture, with the action of `type` replaced by the given versions. */
function withVersions(type: ActionType, versions: ActionConfig[]): EventConfig {
  return {
    ...tennisClubMembershipEvent,
    actions: tennisClubMembershipEvent.actions.flatMap((action) =>
      action.type === type ? versions : [action]
    )
  }
}

const extraField = {
  id: EXTRA_FIELD_ID,
  type: FieldType.TEXT,
  required: true,
  label: {
    id: 'event.tennis-club-membership.action.declare.form.section.who.field.extra.label',
    defaultMessage: 'Extra',
    description: 'Field added by a newer DECLARE version'
  }
} satisfies FieldConfig

/** A DECLARE version whose first page also asks for `field` (by default a required `applicant.extra`). */
function declareVersionWithExtraField(
  effectiveFrom: string,
  field: FieldConfig = extraField
): ActionConfig {
  const declare = getFixtureAction(ActionType.DECLARE)
  if (declare.type !== ActionType.DECLARE) {
    throw new Error('Expected a DECLARE action')
  }
  const [firstPage, ...otherPages] = declare.declaration.pages

  return {
    ...declare,
    effectiveFrom,
    declaration: {
      ...declare.declaration,
      pages: [
        {
          ...firstPage,
          fields: [...firstPage.fields, field]
        },
        ...otherPages
      ]
    }
  }
}

function getAction(
  event: EventDocument,
  type: ActionType,
  status: ActionStatus
) {
  return getOrThrow(
    event.actions.find(
      (action) => action.type === type && action.status === status
    ),
    `Could not find a ${status} ${type} action`
  )
}

describe('event actions use the configuration version effective at their anchor date', () => {
  test('an action is performed with the newest version that is already effective', async () => {
    const register = getFixtureAction(ActionType.REGISTER)
    useEventConfig(
      withVersions(ActionType.REGISTER, [
        register,
        { ...register, effectiveFrom: PAST }
      ])
    )
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const declared = await createEvent(client, generator, [ActionType.DECLARE])

    await client.event.actions.register.request(
      generator.event.actions.register(declared.id)
    )

    const event = await client.event.get({ eventId: declared.id })
    expect(
      getAction(event, ActionType.REGISTER, ActionStatus.Accepted)
    ).toMatchObject({ effectiveFrom: PAST })
  })

  test('a version that takes effect in the future is not used', async () => {
    const register = getFixtureAction(ActionType.REGISTER)
    useEventConfig(
      withVersions(ActionType.REGISTER, [
        register,
        { ...register, effectiveFrom: FUTURE }
      ])
    )
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const declared = await createEvent(client, generator, [ActionType.DECLARE])

    await client.event.actions.register.request(
      generator.event.actions.register(declared.id)
    )

    const event = await client.event.get({ eventId: declared.id })
    expect(
      getAction(event, ActionType.REGISTER, ActionStatus.Accepted)
    ).not.toHaveProperty('effectiveFrom')
  })

  test('an action whose every version takes effect in the future cannot be performed', async () => {
    const register = getFixtureAction(ActionType.REGISTER)
    useEventConfig(
      withVersions(ActionType.REGISTER, [
        { ...register, effectiveFrom: FUTURE }
      ])
    )
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const declared = await createEvent(client, generator, [ActionType.DECLARE])

    await expect(
      client.event.actions.register.request(
        generator.event.actions.register(declared.id)
      )
    ).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  test('a record created before every DECLARE version cannot be declared', async () => {
    const declare = getFixtureAction(ActionType.DECLARE)
    useEventConfig(tennisClubMembershipEvent)
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())
    await getClient()
      .updateTable('events')
      .set({ createdAt: `${DISTANT_PAST}T00:00:00.000Z` })
      .where('id', '=', event.id)
      .execute()

    // Today the dated version is in effect, but it was not when the record was created.
    useEventConfig(
      withVersions(ActionType.DECLARE, [{ ...declare, effectiveFrom: PAST }])
    )

    await expect(
      client.event.actions.declare.request(
        generator.event.actions.declare(event.id)
      )
    ).rejects.toMatchObject({
      code: 'CONFLICT',
      message: `Action 'DECLARE' has no version in effect on ${DISTANT_PAST}, when the record was created, action cannot be performed`
    })
  })

  test('a declaration uses the DECLARE version effective when the record was created', async () => {
    const declare = getFixtureAction(ActionType.DECLARE)
    useEventConfig(
      withVersions(ActionType.DECLARE, [
        declare,
        { ...declare, effectiveFrom: DISTANT_PAST }
      ])
    )
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)

    const declared = await createEvent(client, generator, [ActionType.DECLARE])

    expect(
      getAction(declared, ActionType.DECLARE, ActionStatus.Accepted)
    ).toMatchObject({ effectiveFrom: DISTANT_PAST })
  })

  test('a declaration must satisfy the form of the version in effect, and is stamped with it', async () => {
    const declare = getFixtureAction(ActionType.DECLARE)
    useEventConfig(
      withVersions(ActionType.DECLARE, [
        declare,
        declareVersionWithExtraField(DISTANT_PAST)
      ])
    )
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())
    const payload = generator.event.actions.declare(event.id)

    await expect(
      client.event.actions.declare.request(payload)
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })

    const declared = await client.event.actions.declare.request({
      ...payload,
      transactionId: getUUID(),
      declaration: { ...payload.declaration, [EXTRA_FIELD_ID]: 'extra' }
    })

    // The declaration is stored on the Requested row, the Accepted row confirms it.
    expect(
      getAction(declared, ActionType.DECLARE, ActionStatus.Requested)
    ).toMatchObject({
      effectiveFrom: DISTANT_PAST,
      declaration: expect.objectContaining({ [EXTRA_FIELD_ID]: 'extra' })
    })
    expect(
      getAction(declared, ActionType.DECLARE, ActionStatus.Accepted)
    ).toMatchObject({ effectiveFrom: DISTANT_PAST })
  })

  test('a declaration does not need fields from a version that takes effect in the future', async () => {
    const declare = getFixtureAction(ActionType.DECLARE)
    useEventConfig(
      withVersions(ActionType.DECLARE, [
        declareVersionWithExtraField(FUTURE),
        declare
      ])
    )
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    const declared = await client.event.actions.declare.request(
      generator.event.actions.declare(event.id)
    )

    expect(
      getAction(declared, ActionType.DECLARE, ActionStatus.Accepted)
    ).not.toHaveProperty('effectiveFrom')
  })

  test('an asynchronous confirmation is validated against the version the Requested action is stamped with', async () => {
    const declare = getFixtureAction(ActionType.DECLARE)
    const declareVersions = [
      declare,
      declareVersionWithExtraField(DISTANT_PAST)
    ]
    useEventConfig(withVersions(ActionType.DECLARE, declareVersions))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())
    const generated = generator.event.actions.declare(event.id, {
      waitFor: false
    })
    const payload = {
      ...generated,
      declaration: { ...generated.declaration, [EXTRA_FIELD_ID]: 'extra' }
    }

    mswServer.use(
      http.post(
        `${env.COUNTRY_CONFIG_URL}/trigger/events/${TENNIS_CLUB_MEMBERSHIP}/actions/${ActionType.DECLARE}`,
        () => HttpResponse.json({}, { status: 202 })
      )
    )
    const requested = await client.event.actions.declare.request(payload)
    const requestedAction = getAction(
      requested,
      ActionType.DECLARE,
      ActionStatus.Requested
    )
    expect(requestedAction).toMatchObject({ effectiveFrom: DISTANT_PAST })

    // A newer DECLARE version without `applicant.extra` takes effect before the confirmation.
    useEventConfig(
      withVersions(ActionType.DECLARE, [
        ...declareVersions,
        { ...declare, effectiveFrom: PAST }
      ])
    )
    const accepted = await confirmer.event.actions.declare.accept({
      ...payload,
      eventId: event.id,
      transactionId: getUUID(),
      actionId: requestedAction.id
    })

    expect(
      getAction(accepted, ActionType.DECLARE, ActionStatus.Accepted)
    ).toMatchObject({ effectiveFrom: DISTANT_PAST })
  })

  test('a synchronous confirmation is validated against the version the action is stamped with', async () => {
    const declare = getFixtureAction(ActionType.DECLARE)
    useEventConfig(
      withVersions(ActionType.DECLARE, [
        declare,
        declareVersionWithExtraField(DISTANT_PAST)
      ])
    )
    mswServer.use(
      http.post(
        `${env.COUNTRY_CONFIG_URL}/trigger/events/${TENNIS_CLUB_MEMBERSHIP}/actions/${ActionType.DECLARE}`,
        () =>
          HttpResponse.json({
            declaration: { [EXTRA_FIELD_ID]: 'from the country config' }
          })
      )
    )
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())
    const payload = generator.event.actions.declare(event.id)

    const declared = await client.event.actions.declare.request({
      ...payload,
      declaration: { ...payload.declaration, [EXTRA_FIELD_ID]: 'extra' }
    })

    expect(
      getAction(declared, ActionType.DECLARE, ActionStatus.Accepted)
    ).toMatchObject({ effectiveFrom: DISTANT_PAST })
  })

  test('files are checked for the file fields of the version the action uses', async () => {
    const declare = getFixtureAction(ActionType.DECLARE)
    const fileFieldId = 'applicant.extraFile'
    useEventConfig(
      withVersions(ActionType.DECLARE, [
        declare,
        declareVersionWithExtraField(
          DISTANT_PAST,
          FieldConfig.parse({
            id: fileFieldId,
            type: FieldType.FILE,
            required: false,
            label: {
              id: 'event.tennis-club-membership.action.declare.form.section.who.field.extra-file.label',
              defaultMessage: 'Extra file',
              description: 'File field added by a newer DECLARE version'
            }
          })
        )
      ])
    )
    const missingFile = 'missing-extra-file.png'
    mswServer.use(
      http.head(`${env.DOCUMENTS_URL}/files/:filePath*`, ({ request }) =>
        request.url.includes(missingFile)
          ? new HttpResponse(null, { status: 404 })
          : HttpResponse.json({ ok: true })
      )
    )
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())
    const payload = generator.event.actions.declare(event.id)

    await expect(
      client.event.actions.declare.request({
        ...payload,
        declaration: {
          ...payload.declaration,
          [fileFieldId]: {
            path: missingFile,
            originalFilename: missingFile,
            type: 'image/png'
          }
        }
      })
    ).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: `File not found: ${missingFile}`
    })
  })

  test('duplicates are searched with the deduplication of the DECLARE version the record uses', async () => {
    const declare = getFixtureAction(ActionType.DECLARE)
    const declareWithDedup = getOrThrow(
      tennisClubMembershipEventWithDedupCheck(ActionType.DECLARE).actions.find(
        (action) => action.type === ActionType.DECLARE
      ),
      'Expected a DECLARE action with deduplication'
    )
    useEventConfig(
      withVersions(ActionType.DECLARE, [
        declare,
        { ...declareWithDedup, effectiveFrom: DISTANT_PAST }
      ])
    )
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const newEvent = await client.event.create(generator.event.create())

    const existingEventId = getUUID()
    const existingEventIndex = eventQueryDataGenerator({
      id: existingEventId,
      declaration: generateActionDuplicateDeclarationInput(
        tennisClubMembershipEvent,
        ActionType.DECLARE,
        createPrng(73),
        { 'applicant.dobUnknown': false }
      ) as Partial<EventState>
    })
    await getOrCreateClient().update({
      index: getEventIndexName(TENNIS_CLUB_MEMBERSHIP),
      id: existingEventId,
      body: {
        doc: encodeEventIndex(existingEventIndex, tennisClubMembershipEvent),
        doc_as_upsert: true
      },
      refresh: 'wait_for'
    })

    const declared = await client.event.actions.declare.request(
      generator.event.actions.declare(newEvent.id, {
        declaration: existingEventIndex.declaration
      })
    )

    expect(declared.actions.at(-1)?.type).toBe(ActionType.DUPLICATE_DETECTED)
  })

  test('an action in progress keeps its version when a newer one takes effect', async () => {
    const register = getFixtureAction(ActionType.REGISTER)
    const registerVersions = [
      register,
      { ...register, effectiveFrom: DISTANT_PAST }
    ]
    useEventConfig(withVersions(ActionType.REGISTER, registerVersions))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const declared = await createEvent(
      client,
      generator,
      [ActionType.DECLARE],
      false
    )
    const payload = generator.event.actions.register(declared.id, {
      waitFor: false
    })

    // The country config answers 202: the REGISTER action stays Requested.
    mswServer.use(
      http.post(
        `${env.COUNTRY_CONFIG_URL}/trigger/events/${TENNIS_CLUB_MEMBERSHIP}/actions/${ActionType.REGISTER}`,
        () => HttpResponse.json({}, { status: 202 })
      )
    )
    const requested = await client.event.actions.register.request(payload)
    const requestedAction = getAction(
      requested,
      ActionType.REGISTER,
      ActionStatus.Requested
    )
    expect(requestedAction).toMatchObject({ effectiveFrom: DISTANT_PAST })

    // A newer version takes effect before the country config confirms the action.
    useEventConfig(
      withVersions(ActionType.REGISTER, [
        ...registerVersions,
        { ...register, effectiveFrom: PAST }
      ])
    )
    const accepted = await confirmer.event.actions.register.accept({
      ...payload,
      eventId: declared.id,
      transactionId: getUUID(),
      actionId: requestedAction.id,
      registrationNumber: '1MY2TEST3NRO'
    })

    expect(
      getAction(accepted, ActionType.REGISTER, ActionStatus.Accepted)
    ).toMatchObject({ effectiveFrom: DISTANT_PAST })
  })

  test('a duplicate declared with another DECLARE version is found', async () => {
    const declareWithDedup = getOrThrow(
      tennisClubMembershipEventWithDedupCheck(ActionType.DECLARE).actions.find(
        (action) => action.type === ActionType.DECLARE
      ),
      'Expected a DECLARE action with deduplication'
    )
    const withExtraField = {
      ...declareVersionWithExtraField(DISTANT_PAST),
      deduplication:
        declareWithDedup.type === ActionType.DECLARE
          ? declareWithDedup.deduplication
          : undefined
    }
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const declaration = generateActionDuplicateDeclarationInput(
      tennisClubMembershipEvent,
      ActionType.DECLARE,
      createPrng(91),
      { 'applicant.dobUnknown': false }
    )

    // Record A is declared with the version that has `applicant.extra`.
    useEventConfig(
      withVersions(ActionType.DECLARE, [declareWithDedup, withExtraField])
    )
    const recordA = await client.event.create(generator.event.create())
    const declaredA = await client.event.actions.declare.request(
      generator.event.actions.declare(recordA.id, {
        declaration: { ...declaration, [EXTRA_FIELD_ID]: 'extra' },
        waitFor: true
      })
    )
    expect(
      getAction(declaredA, ActionType.DECLARE, ActionStatus.Accepted)
    ).toMatchObject({ effectiveFrom: DISTANT_PAST })

    // Record B is created while that version is not in effect: it uses the undated one.
    useEventConfig(
      withVersions(ActionType.DECLARE, [
        declareWithDedup,
        { ...withExtraField, effectiveFrom: FUTURE }
      ])
    )
    const recordB = await client.event.create(generator.event.create())
    const declaredB = await client.event.actions.declare.request(
      generator.event.actions.declare(recordB.id, { declaration })
    )

    expect(
      getAction(declaredB, ActionType.DECLARE, ActionStatus.Accepted)
    ).not.toHaveProperty('effectiveFrom')
    expect(declaredB.actions.at(-1)).toMatchObject({
      type: ActionType.DUPLICATE_DETECTED,
      content: {
        duplicates: [expect.objectContaining({ id: recordA.id })]
      }
    })
  })

  test('an action anchored at now reads the declaration with the version the record was declared with', async () => {
    useEventConfig(tennisClubMembershipEvent)
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const declared = await createEvent(client, generator, [ActionType.DECLARE])

    // A DECLARE version requiring a new field has taken effect since.
    useEventConfig(
      withVersions(ActionType.DECLARE, [
        getFixtureAction(ActionType.DECLARE),
        declareVersionWithExtraField(DISTANT_PAST)
      ])
    )
    const registered = await client.event.actions.register.request(
      generator.event.actions.register(declared.id)
    )

    expect(
      getAction(registered, ActionType.REGISTER, ActionStatus.Accepted)
    ).toBeDefined()
  })

  test('an asynchronously rejected action keeps the stamp of the Requested action', async () => {
    const register = getFixtureAction(ActionType.REGISTER)
    useEventConfig(
      withVersions(ActionType.REGISTER, [
        register,
        { ...register, effectiveFrom: PAST }
      ])
    )
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const declared = await createEvent(
      client,
      generator,
      [ActionType.DECLARE],
      false
    )
    const payload = generator.event.actions.register(declared.id, {
      waitFor: false
    })

    mockConfirmationResponse(ActionType.REGISTER, 202)
    const requested = await client.event.actions.register.request(payload)
    const requestedAction = getAction(
      requested,
      ActionType.REGISTER,
      ActionStatus.Requested
    )
    expect(requestedAction).toMatchObject({ effectiveFrom: PAST })

    const rejected = await confirmer.event.actions.register.reject({
      ...payload,
      eventId: declared.id,
      transactionId: getUUID(),
      actionId: requestedAction.id,
      waitFor: false
    })

    expect(
      getAction(rejected, ActionType.REGISTER, ActionStatus.Rejected)
    ).toMatchObject({ effectiveFrom: PAST })
  })

  test('a custom action with several versions is stamped with the one in effect', async () => {
    useEventConfig({
      ...tennisClubMembershipEvent,
      actions: [
        ...tennisClubMembershipEvent.actions,
        customAction,
        { ...customAction, effectiveFrom: PAST },
        { ...customAction, effectiveFrom: FUTURE }
      ]
    })
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, CUSTOM_ACTION_SCOPES)
    const declared = await createEvent(client, generator, [ActionType.DECLARE])

    const performed = await client.event.actions.custom.request({
      type: ActionType.CUSTOM,
      eventId: declared.id,
      transactionId: getUUID(),
      customActionType: CUSTOM_ACTION_TYPE,
      annotation: {}
    })

    expect(
      getAction(performed, ActionType.CUSTOM, ActionStatus.Accepted)
    ).toMatchObject({ effectiveFrom: PAST })
  })

  test('an action added to the configuration after the record was declared can be performed', async () => {
    useEventConfig(tennisClubMembershipEvent)
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, CUSTOM_ACTION_SCOPES)
    const declared = await createEvent(client, generator, [ActionType.DECLARE])

    useEventConfig({
      ...tennisClubMembershipEvent,
      actions: [...tennisClubMembershipEvent.actions, customAction]
    })

    const performed = await client.event.actions.custom.request({
      type: ActionType.CUSTOM,
      eventId: declared.id,
      transactionId: getUUID(),
      customActionType: CUSTOM_ACTION_TYPE,
      annotation: {}
    })

    expect(
      getAction(performed, ActionType.CUSTOM, ActionStatus.Accepted)
    ).toMatchObject({ customActionType: CUSTOM_ACTION_TYPE })
  })
})
