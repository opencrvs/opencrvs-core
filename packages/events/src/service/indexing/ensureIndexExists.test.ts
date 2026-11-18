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
import {
  DEFAULT_EFFECTIVE_FROM,
  EventConfigVersion,
  FieldType,
  getDeclarationFields,
  INITIAL_EVENT_CONFIG_VERSION_ID,
  toVersionedEventConfig,
  VersionedEventConfig,
  withDeclarationField
} from '@opencrvs/commons/events'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  getEventAliasName,
  getEventIndexName,
  getEventVersionIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { createIndex, ensureIndexExists } from './indexing'
import { encodeFieldId } from './utils'

const EVENT_ID = 'startup-event'
const EXTRA_FIELD_ID = 'applicant.extra'
const LATER = '2020-01-01'

const { versions, ...eventLevel } = toVersionedEventConfig(
  tennisClubMembershipEvent
)
const [base] = versions

function version(
  id: string,
  effectiveFrom = DEFAULT_EFFECTIVE_FROM
): EventConfigVersion {
  return { ...base, id, effectiveFrom }
}

/** A version whose declaration has a field the base version does not. */
function withExtraField(configured: EventConfigVersion): EventConfigVersion {
  return withDeclarationField(configured, {
    id: EXTRA_FIELD_ID,
    type: FieldType.TEXT,
    label: {
      id: 'event.startup-event.field.extra.label',
      defaultMessage: 'Extra',
      description: 'Field only one version has'
    }
  })
}

function configOf(...configured: EventConfigVersion[]): VersionedEventConfig {
  return { ...eventLevel, id: EVENT_ID, versions: configured }
}

/** @returns the indices `name`, an index or an alias, resolves to. */
async function indicesBehind(name: string) {
  const indices = await getOrCreateClient().indices.get({ index: name })
  return Object.keys(indices).sort()
}

async function mappedDeclarationFields(indexName: string) {
  const [mapping] = Object.values(
    await getOrCreateClient().indices.getMapping({ index: indexName })
  )
  const declaration = mapping.mappings.properties?.declaration
  return Object.keys(
    declaration && 'properties' in declaration
      ? (declaration.properties ?? {})
      : {}
  )
}

describe('ensureIndexExists()', () => {
  test('on a fresh install, each version gets its own index, mapped from its own fields', async () => {
    await ensureIndexExists(
      configOf(version('v1'), withExtraField(version('v2', LATER)))
    )

    const v1Index = getEventVersionIndexName(EVENT_ID, 'v1')
    const v2Index = getEventVersionIndexName(EVENT_ID, 'v2')

    expect(await indicesBehind(v1Index)).toEqual([v1Index])
    expect(await indicesBehind(v2Index)).toEqual([v2Index])
    expect(await indicesBehind(getEventIndexName(EVENT_ID))).toEqual(
      [v1Index, v2Index].sort()
    )
    expect(await indicesBehind(getEventAliasName())).toEqual(
      expect.arrayContaining([v1Index, v2Index])
    )

    const extraField = encodeFieldId(EXTRA_FIELD_ID)
    expect(await mappedDeclarationFields(v1Index)).not.toContain(extraField)
    expect(await mappedDeclarationFields(v2Index)).toContain(extraField)
  })

  test('on upgrade, every version name resolves to the index the versions still share', async () => {
    const esClient = getOrCreateClient()
    const eventIndexName = getEventIndexName(EVENT_ID)
    const sharedIndex = `${eventIndexName}_1700000000000`
    await createIndex(
      sharedIndex,
      getDeclarationFields(tennisClubMembershipEvent)
    )
    await esClient.indices.putAlias({
      index: sharedIndex,
      name: eventIndexName
    })

    const config = configOf(
      version(INITIAL_EVENT_CONFIG_VERSION_ID),
      version('v2', LATER)
    )
    await ensureIndexExists(config)
    // The service may restart before the reindex has run. A second start must leave things as they are.
    await ensureIndexExists(config)

    expect(
      await indicesBehind(
        getEventVersionIndexName(EVENT_ID, INITIAL_EVENT_CONFIG_VERSION_ID)
      )
    ).toEqual([sharedIndex])
    expect(
      await indicesBehind(getEventVersionIndexName(EVENT_ID, 'v2'))
    ).toEqual([sharedIndex])
    expect(await indicesBehind(eventIndexName)).toEqual([sharedIndex])
  })

  test('on upgrade from an index that was never reindexed, every version name resolves to it', async () => {
    const eventIndexName = getEventIndexName(EVENT_ID)
    await createIndex(
      eventIndexName,
      getDeclarationFields(tennisClubMembershipEvent)
    )

    await ensureIndexExists(
      configOf(version(INITIAL_EVENT_CONFIG_VERSION_ID), version('v2', LATER))
    )

    expect(
      await indicesBehind(
        getEventVersionIndexName(EVENT_ID, INITIAL_EVENT_CONFIG_VERSION_ID)
      )
    ).toEqual([eventIndexName])
    expect(
      await indicesBehind(getEventVersionIndexName(EVENT_ID, 'v2'))
    ).toEqual([eventIndexName])
  })

  test('a new version gets its own index, not the leftover index of a removed version (one taken out of the config after a reindex built its index)', async () => {
    const esClient = getOrCreateClient()
    const eventIndexName = getEventIndexName(EVENT_ID)
    const v2Index = getEventVersionIndexName(EVENT_ID, 'v2')
    const v3Index = getEventVersionIndexName(EVENT_ID, 'v3')

    // After a reindex, each version has its own index behind the event's name.
    for (const versionId of ['v1', 'v2']) {
      const versionIndex = getEventVersionIndexName(EVENT_ID, versionId)
      const reindexedIndex = `${versionIndex}_1700000000000`
      await createIndex(
        reindexedIndex,
        getDeclarationFields(tennisClubMembershipEvent)
      )
      await esClient.indices.putAlias({
        index: reindexedIndex,
        name: versionIndex
      })
      await esClient.indices.putAlias({
        index: reindexedIndex,
        name: eventIndexName
      })
    }

    // v2 never took effect, so no record uses it and it can be removed. v3 is added.
    await ensureIndexExists(configOf(version('v1'), version('v3', LATER)))

    expect(await indicesBehind(v3Index)).toEqual([v3Index])
    expect(await indicesBehind(v2Index)).toEqual([`${v2Index}_1700000000000`])
  })

  test('a version added later gets a new index, and the existing one keeps its records', async () => {
    const esClient = getOrCreateClient()
    const v1Index = getEventVersionIndexName(EVENT_ID, 'v1')
    const v2Index = getEventVersionIndexName(EVENT_ID, 'v2')

    await ensureIndexExists(configOf(version('v1')))
    await esClient.index({
      index: v1Index,
      id: 'record-1',
      document: { id: 'record-1' },
      refresh: true
    })

    await ensureIndexExists(configOf(version('v1'), version('v2', LATER)))

    expect(await indicesBehind(v1Index)).toEqual([v1Index])
    expect(await indicesBehind(v2Index)).toEqual([v2Index])
    expect(await indicesBehind(getEventIndexName(EVENT_ID))).toEqual(
      [v1Index, v2Index].sort()
    )
    expect((await esClient.count({ index: v1Index })).count).toBe(1)
    expect((await esClient.count({ index: v2Index })).count).toBe(0)
  })
})
