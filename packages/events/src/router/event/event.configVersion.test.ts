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
import {
  ActionConfig,
  ActionType,
  DEFAULT_EFFECTIVE_FROM,
  encodeScope,
  EventConfigVersion,
  FieldType,
  getUUID,
  TENNIS_CLUB_MEMBERSHIP,
  toVersionedEventConfig,
  VersionedEventConfig
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  createEvent,
  createTestClient,
  setupTestCase,
  TEST_USER_DEFAULT_SCOPES
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'
import { getClient } from '@events/storage/postgres/events'

const PAST = '2010-01-01'
const FUTURE = '2999-01-01'
const EXTRA_FIELD_ID = 'applicant.extra'
const CUSTOM_ACTION_TYPE = 'VERSIONS_TEST_ACTION'
const SECURED_FIELD_ID = 'applicant.address'

const { versions, ...eventLevel } = toVersionedEventConfig(
  tennisClubMembershipEvent
)
const [base] = versions

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

const SEARCH_SCOPES = [
  ...TEST_USER_DEFAULT_SCOPES,
  encodeScope({
    type: 'record.search',
    options: { event: [TENNIS_CLUB_MEMBERSHIP] }
  })
]

function useVersions(...configured: EventConfigVersion[]) {
  const config: VersionedEventConfig = { ...eventLevel, versions: configured }
  mswServer.use(
    http.get(`${env.COUNTRY_CONFIG_URL}/config/events`, () =>
      HttpResponse.json([config])
    )
  )
}

function version(
  id: string,
  effectiveFrom = DEFAULT_EFFECTIVE_FROM
): EventConfigVersion {
  return { ...base, id, effectiveFrom }
}

/** A version whose declaration requires a field the default payload does not fill. */
function versionRequiringExtraField(
  id: string,
  effectiveFrom?: string
): EventConfigVersion {
  return {
    ...version(id, effectiveFrom),
    actions: base.actions.map((action) => {
      if (action.type !== ActionType.DECLARE) {
        return action
      }
      const [firstPage, ...otherPages] = action.declaration.pages
      return {
        ...action,
        declaration: {
          ...action.declaration,
          pages: [
            {
              ...firstPage,
              fields: [
                ...firstPage.fields,
                {
                  id: EXTRA_FIELD_ID,
                  type: FieldType.TEXT,
                  required: true,
                  label: {
                    id: 'event.tennis-club-membership.action.declare.form.section.who.field.extra.label',
                    defaultMessage: 'Extra',
                    description: 'Field added by a newer version'
                  }
                }
              ]
            },
            ...otherPages
          ]
        }
      }
    })
  }
}

/** A version that updates secured field with `secured: false`. */
function versionWithFieldUnsecured(
  id: string,
  effectiveFrom?: string
): EventConfigVersion {
  return {
    ...version(id, effectiveFrom),
    actions: base.actions.map((action) => {
      if (action.type !== ActionType.DECLARE) {
        return action
      }
      return {
        ...action,
        declaration: {
          ...action.declaration,
          pages: action.declaration.pages.map((page) => ({
            ...page,
            fields: page.fields.map((field) =>
              field.id === SECURED_FIELD_ID
                ? { ...field, secured: false }
                : field
            )
          }))
        }
      }
    })
  }
}

function withCustomAction(configured: EventConfigVersion): EventConfigVersion {
  return { ...configured, actions: [...configured.actions, customAction] }
}

describe('the event configuration version of a record', () => {
  test('a record is created under the newest version already in effect', async () => {
    useVersions(version('v1'), version('v2', PAST))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    expect(event.configVersionId).toBe('v2')
  })

  test('a version that takes effect in the future is not used', async () => {
    useVersions(version('v1'), version('v3', FUTURE))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    expect(event.configVersionId).toBe('v1')
  })

  test('a record is created under the version the client chose, e.g. offline', async () => {
    useVersions(version('v1'), version('v2', PAST))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)

    const event = await client.event.create({
      ...generator.event.create(),
      configVersionId: 'v1'
    })

    expect(event.configVersionId).toBe('v1')
  })

  test('a version the client chose must be configured and already in effect', async () => {
    useVersions(version('v1'), version('v3', FUTURE))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)

    await expect(
      client.event.create({
        ...generator.event.create(),
        configVersionId: 'v9'
      })
    ).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: `Event '${TENNIS_CLUB_MEMBERSHIP}' has no version 'v9'`
    })
    await expect(
      client.event.create({
        ...generator.event.create(),
        configVersionId: 'v3'
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  test("actions keep using the record's version after a newer one takes effect", async () => {
    useVersions(version('v1'), versionRequiringExtraField('v2', FUTURE))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    // v2 has taken effect since, and requires a field the declaration does not fill.
    useVersions(version('v1'), versionRequiringExtraField('v2', PAST))
    const declared = await client.event.actions.declare.request(
      generator.event.actions.declare(event.id)
    )

    expect(declared.configVersionId).toBe('v1')
  })

  test('changing the effectiveFrom of a version does not move its records', async () => {
    useVersions(version('v1'), versionRequiringExtraField('v2', PAST))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    useVersions(version('v1'), versionRequiringExtraField('v2', FUTURE))

    expect(
      (await client.event.get({ eventId: event.id })).configVersionId
    ).toBe('v2')
    // Still validated against v2, which requires the extra field.
    await expect(
      client.event.actions.declare.request(
        generator.event.actions.declare(event.id)
      )
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  test("an action added to the record's version later can be performed", async () => {
    useVersions(version('v1'))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, CUSTOM_ACTION_SCOPES)
    const declared = await createEvent(client, generator, [ActionType.DECLARE])

    useVersions(withCustomAction(version('v1')))

    await expect(
      client.event.actions.custom.request({
        type: ActionType.CUSTOM,
        eventId: declared.id,
        transactionId: getUUID(),
        customActionType: CUSTOM_ACTION_TYPE,
        annotation: {}
      })
    ).resolves.toMatchObject({ configVersionId: 'v1' })
  })

  test('an action only a newer version has cannot be performed', async () => {
    useVersions(version('v1'), withCustomAction(version('v2', FUTURE)))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, CUSTOM_ACTION_SCOPES)
    const declared = await createEvent(client, generator, [ActionType.DECLARE])

    useVersions(version('v1'), withCustomAction(version('v2', PAST)))

    await expect(
      client.event.actions.custom.request({
        type: ActionType.CUSTOM,
        eventId: declared.id,
        transactionId: getUUID(),
        customActionType: CUSTOM_ACTION_TYPE,
        annotation: {}
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  test('a record created before versioning uses the earliest version', async () => {
    useVersions(version('v1'))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, CUSTOM_ACTION_SCOPES)
    const declared = await createEvent(client, generator, [ActionType.DECLARE])
    await getClient()
      .updateTable('events')
      .set({ configVersionId: null })
      .where('id', '=', declared.id)
      .execute()

    // Only the earliest version has the custom action.
    useVersions(withCustomAction(version('v1')), version('v2', PAST))

    await expect(
      client.event.actions.custom.request({
        type: ActionType.CUSTOM,
        eventId: declared.id,
        transactionId: getUUID(),
        customActionType: CUSTOM_ACTION_TYPE,
        annotation: {}
      })
    ).resolves.not.toHaveProperty('configVersionId')
  })

  test("search drops the fields secured in the record's version", async () => {
    // The record is stamped v1:
    // versions: [
    //   { id: 'v1', fields: [..., { id: 'applicant.address', secured: true }] },
    //   { id: 'v2', fields: [..., { id: 'applicant.address', secured: false }] }
    // ]
    useVersions(version('v1'), versionWithFieldUnsecured('v2', FUTURE))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, SEARCH_SCOPES)
    const declared = await createEvent(client, generator, [ActionType.DECLARE])
    const search = async () =>
      client.event.search({
        query: { type: 'and', clauses: [{ id: declared.id }] }
      })
    expect((await search()).results[0].declaration).not.toHaveProperty([
      SECURED_FIELD_ID
    ])

    // v2, which has taken effect since, does not secure the field.
    useVersions(version('v1'), versionWithFieldUnsecured('v2', PAST))

    expect((await search()).results[0].declaration).not.toHaveProperty([
      SECURED_FIELD_ID
    ])
  })

  test("search keeps the fields not secured in the record's version", async () => {
    // The record is stamped v2:
    // versions: [
    //   { id: 'v1', fields: [..., { id: 'applicant.address', secured: true }] },
    //   { id: 'v2', fields: [..., { id: 'applicant.address', secured: false }] }
    // ]
    useVersions(version('v1'), versionWithFieldUnsecured('v2', PAST))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, SEARCH_SCOPES)
    const declared = await createEvent(client, generator, [ActionType.DECLARE])
    const search = async () =>
      client.event.search({
        query: { type: 'and', clauses: [{ id: declared.id }] }
      })
    expect((await search()).results[0].declaration).toHaveProperty([
      SECURED_FIELD_ID
    ])

    // v2 takes effect later now, so v1, which secures the field, is in effect today.
    useVersions(version('v1'), versionWithFieldUnsecured('v2', FUTURE))

    expect((await search()).results[0].declaration).toHaveProperty([
      SECURED_FIELD_ID
    ])
  })
})
