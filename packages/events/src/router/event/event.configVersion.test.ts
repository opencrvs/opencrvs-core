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
  INITIAL_EVENT_CONFIG_VERSION_ID,
  QueryType,
  TENNIS_CLUB_MEMBERSHIP,
  toVersionedEventConfig,
  VersionedEventConfig,
  withDeclarationField
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
import { ensureIndexExists } from '@events/service/indexing/indexing'

const PAST = '2010-01-01'
const FUTURE = '2999-01-01'
const EXTRA_FIELD_ID = 'applicant.extra'
const NICKNAME_FIELD_ID = 'applicant.nickname'
const ALIAS_FIELD_ID = 'applicant.alias'
/** The TEXT field of the older version for each part of the NAME field `applicant.alias`. */
const ALIAS_TEXT_FIELD_IDS = {
  firstname: 'applicant.aliasFirstname',
  middlename: 'applicant.aliasMiddlename',
  surname: 'applicant.aliasSurname'
}
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

async function useVersions(...configured: EventConfigVersion[]) {
  const config: VersionedEventConfig = { ...eventLevel, versions: configured }
  mswServer.use(
    http.get(`${env.COUNTRY_CONFIG_URL}/config/events`, () =>
      HttpResponse.json([config])
    )
  )
  await ensureIndexExists(config)
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
  return withDeclarationField(version(id, effectiveFrom), {
    id: EXTRA_FIELD_ID,
    type: FieldType.TEXT,
    required: true,
    label: {
      id: 'event.tennis-club-membership.action.declare.form.section.who.field.extra.label',
      defaultMessage: 'Extra',
      description: 'Field added by a newer version'
    }
  })
}

/** A version whose declaration has a field that the other versions do not have. */
function versionWithNickname(
  id: string,
  effectiveFrom?: string
): EventConfigVersion {
  return withDeclarationField(version(id, effectiveFrom), {
    id: NICKNAME_FIELD_ID,
    type: FieldType.TEXT,
    label: {
      id: 'event.tennis-club-membership.action.declare.form.section.who.field.nickname.label',
      defaultMessage: 'Nickname',
      description: 'Field that only one version has'
    }
  })
}

/** A version that has the alias as one NAME field, with a middle name. */
function versionWithAlias(
  id: string,
  effectiveFrom?: string
): EventConfigVersion {
  return withDeclarationField(version(id, effectiveFrom), {
    id: ALIAS_FIELD_ID,
    type: FieldType.NAME,
    configuration: {
      name: {
        firstname: { required: true },
        middlename: { required: false },
        surname: { required: true }
      }
    },
    label: {
      id: 'event.tennis-club-membership.action.declare.form.section.who.field.alias.label',
      defaultMessage: 'Alias',
      description: 'Name field that only one version has'
    }
  })
}

/** A version that has the alias as 3 TEXT fields, one for each part of the name. */
function versionWithAliasTextFields(
  id: string,
  effectiveFrom?: string
): EventConfigVersion {
  return Object.values(ALIAS_TEXT_FIELD_IDS).reduce(
    (configured, fieldId) =>
      withDeclarationField(configured, {
        id: fieldId,
        type: FieldType.TEXT,
        label: {
          id: `event.tennis-club-membership.action.declare.form.section.who.field.${fieldId}.label`,
          defaultMessage: fieldId,
          description: 'Text field for one part of the alias'
        }
      }),
    version(id, effectiveFrom)
  )
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
    await useVersions(version('v1'), version('v2', PAST))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    expect(event.configVersionId).toBe('v2')
  })

  test('a version that takes effect in the future is not used', async () => {
    await useVersions(version('v1'), version('v3', FUTURE))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)

    const event = await client.event.create(generator.event.create())

    expect(event.configVersionId).toBe('v1')
  })

  test('a record is created under the version the client chose, e.g. offline', async () => {
    await useVersions(version('v1'), version('v2', PAST))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)

    const event = await client.event.create({
      ...generator.event.create(),
      configVersionId: 'v1'
    })

    expect(event.configVersionId).toBe('v1')
  })

  test('a version the client chose must be configured and already in effect', async () => {
    await useVersions(version('v1'), version('v3', FUTURE))
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
    await useVersions(version('v1'), versionRequiringExtraField('v2', FUTURE))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    // v2 has taken effect since, and requires a field the declaration does not fill.
    await useVersions(version('v1'), versionRequiringExtraField('v2', PAST))
    const declared = await client.event.actions.declare.request(
      generator.event.actions.declare(event.id)
    )

    expect(declared.configVersionId).toBe('v1')
  })

  test('changing the effectiveFrom of a version does not move its records', async () => {
    await useVersions(version('v1'), versionRequiringExtraField('v2', PAST))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)
    const event = await client.event.create(generator.event.create())

    await useVersions(version('v1'), versionRequiringExtraField('v2', FUTURE))

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
    await useVersions(version('v1'))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, CUSTOM_ACTION_SCOPES)
    const declared = await createEvent(client, generator, [ActionType.DECLARE])

    await useVersions(withCustomAction(version('v1')))

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
    await useVersions(version('v1'), withCustomAction(version('v2', FUTURE)))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, CUSTOM_ACTION_SCOPES)
    const declared = await createEvent(client, generator, [ActionType.DECLARE])

    await useVersions(version('v1'), withCustomAction(version('v2', PAST)))

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

  test('a record of the initial version keeps it when an earlier version is added', async () => {
    await useVersions(version(INITIAL_EVENT_CONFIG_VERSION_ID))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, CUSTOM_ACTION_SCOPES)
    const declared = await createEvent(client, generator, [ActionType.DECLARE])

    // e.g. a version for digitising legacy records. Only the initial version has the custom action.
    await useVersions(
      withCustomAction(version(INITIAL_EVENT_CONFIG_VERSION_ID, PAST)),
      version('legacy_1980', '1980-01-01')
    )

    await expect(
      client.event.actions.custom.request({
        type: ActionType.CUSTOM,
        eventId: declared.id,
        transactionId: getUUID(),
        customActionType: CUSTOM_ACTION_TYPE,
        annotation: {}
      })
    ).resolves.toMatchObject({
      configVersionId: INITIAL_EVENT_CONFIG_VERSION_ID
    })
  })

  test("search drops the fields secured in the record's version", async () => {
    // The record is stamped v1:
    // versions: [
    //   { id: 'v1', fields: [..., { id: 'applicant.address', secured: true }] },
    //   { id: 'v2', fields: [..., { id: 'applicant.address', secured: false }] }
    // ]
    await useVersions(version('v1'), versionWithFieldUnsecured('v2', FUTURE))
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
    await useVersions(version('v1'), versionWithFieldUnsecured('v2', PAST))

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
    await useVersions(version('v1'), versionWithFieldUnsecured('v2', PAST))
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
    await useVersions(version('v1'), versionWithFieldUnsecured('v2', FUTURE))

    expect((await search()).results[0].declaration).toHaveProperty([
      SECURED_FIELD_ID
    ])
  })

  /**
   * Declares a record with the nickname 'Ace' under v1. Then v2, which does not have the
   * field, takes effect.
   */
  async function declareRecordWithNicknameOfOlderVersion() {
    await useVersions(versionWithNickname('v1'), version('v2', FUTURE))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, SEARCH_SCOPES)
    const event = await client.event.create(generator.event.create())
    const declare = generator.event.actions.declare(event.id)
    await client.event.actions.declare.request({
      ...declare,
      declaration: { ...declare.declaration, [NICKNAME_FIELD_ID]: 'Ace' }
    })

    await useVersions(versionWithNickname('v1'), version('v2', PAST))

    return { client, event }
  }

  const nicknameQuery = {
    type: 'and',
    clauses: [
      {
        eventType: TENNIS_CLUB_MEMBERSHIP,
        data: { [NICKNAME_FIELD_ID]: { type: 'exact', term: 'Ace' } }
      }
    ]
  } satisfies QueryType

  test('search finds a record by a field that only an older version has', async () => {
    const { client, event } = await declareRecordWithNicknameOfOlderVersion()

    const { results } = await client.event.search({ query: nicknameQuery })

    expect(results.map(({ id }) => id)).toEqual([event.id])
  })

  test('search finds a record of a version that is added while the service runs', async () => {
    await useVersions(version('v1'))
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, SEARCH_SCOPES)

    // Countryconfig serves v2 without a restart, so the startup check did not create its index.
    // v2 takes effect in 2010 and v1 in year 1, so a new record gets v2.
    const config: VersionedEventConfig = {
      ...eventLevel,
      versions: [version('v1'), version('v2', PAST)]
    }
    mswServer.use(
      http.get(`${env.COUNTRY_CONFIG_URL}/config/events`, () =>
        HttpResponse.json([config])
      )
    )

    const declared = await createEvent(client, generator, [ActionType.DECLARE])
    const { results } = await client.event.search({
      query: { type: 'and', clauses: [{ id: declared.id }] }
    })

    expect(results).toMatchObject([{ id: declared.id, configVersionId: 'v2' }])
  })

  test('a workqueue count filters by a field that only an older version has', async () => {
    const { client } = await declareRecordWithNicknameOfOlderVersion()

    const counts = await client.workqueue.count([
      { slug: 'recent', query: nicknameQuery }
    ])

    expect(counts).toEqual({ recent: 1 })
  })

  test('search finds records of both versions when 3 TEXT fields are replaced by one NAME field', async () => {
    const alias = { firstname: 'Ace', middlename: 'Van', surname: 'Smith' }
    await useVersions(
      versionWithAliasTextFields('v1'),
      versionWithAlias('v2', FUTURE)
    )
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user, SEARCH_SCOPES)

    const recordOfV1 = await client.event.create(generator.event.create())
    const declareV1 = generator.event.actions.declare(recordOfV1.id)
    await client.event.actions.declare.request({
      ...declareV1,
      declaration: {
        ...declareV1.declaration,
        [ALIAS_TEXT_FIELD_IDS.firstname]: alias.firstname,
        [ALIAS_TEXT_FIELD_IDS.middlename]: alias.middlename,
        [ALIAS_TEXT_FIELD_IDS.surname]: alias.surname
      }
    })

    await useVersions(
      versionWithAliasTextFields('v1'),
      versionWithAlias('v2', PAST)
    )
    const recordOfV2 = await client.event.create(generator.event.create())
    const declareV2 = generator.event.actions.declare(recordOfV2.id)
    await client.event.actions.declare.request({
      ...declareV2,
      declaration: { ...declareV2.declaration, [ALIAS_FIELD_ID]: alias }
    })

    // The query that the client builds when all 3 inputs are filled. The first name input has
    // `searchFields: ['applicant.aliasFirstname', 'applicant.alias.firstname']`, and so on.
    const { results } = await client.event.search({
      query: {
        type: 'and',
        clauses: (['firstname', 'middlename', 'surname'] as const).map(
          (part) => ({
            type: 'or',
            clauses: [
              ALIAS_TEXT_FIELD_IDS[part],
              `${ALIAS_FIELD_ID}.${part}`
            ].map((fieldId) => ({
              eventType: TENNIS_CLUB_MEMBERSHIP,
              data: { [fieldId]: { type: 'fuzzy', term: alias[part] } }
            }))
          })
        )
      }
    })

    expect(results.map(({ id }) => id).sort()).toEqual(
      [recordOfV1.id, recordOfV2.id].sort()
    )
  })
})
