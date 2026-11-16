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
  getDeclarationFields,
  toEventConfig,
  VersionedEventConfig
} from '@opencrvs/commons/events'
import { logger } from '@opencrvs/commons'
import {
  getEventAliasName,
  getEventIndexName,
  getEventVersionIndexName,
  getTemporaryVersionIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { createIndex, getIndicesBehind } from '../indexing/indexing'

/** Creates one temporary index per version of the event, each mapped from that version's fields. */
export async function prepareTemporaryIndices(
  eventConfiguration: VersionedEventConfig,
  timestamp: number
) {
  return Promise.all(
    eventConfiguration.versions.map(async (version) => {
      const tempIndexName = getTemporaryVersionIndexName(
        eventConfiguration.id,
        version.id,
        timestamp
      )
      const formFields = getDeclarationFields(
        toEventConfig(eventConfiguration, version)
      )

      logger.info(`Preparing temporary reindex index ${tempIndexName}`)

      await createIndex(tempIndexName, formFields, false)

      return tempIndexName
    })
  )
}

/** @returns the alias actions that make every name in `aliases` resolve to `index`. */
function addAliasActions(index: string, aliases: string[]) {
  return aliases.map((alias) => ({ add: { index, alias } }))
}

/**
 * Makes the indices a reindex built for the event live. Each version's name, the event's
 * name and the global alias move to them, and the indices they replace are deleted, in
 * one atomic step.
 */
export async function finaliseReindexIndices(
  eventConfiguration: VersionedEventConfig,
  timestamp: number
) {
  const esClient = getOrCreateClient()
  const globalAliasName = getEventAliasName()
  const eventIndexName = getEventIndexName(eventConfiguration.id)
  const versions = eventConfiguration.versions.map(({ id }) => ({
    indexName: getEventVersionIndexName(eventConfiguration.id, id),
    tempIndexName: getTemporaryVersionIndexName(
      eventConfiguration.id,
      id,
      timestamp
    )
  }))

  const liveNames = [eventIndexName, ...versions.map((v) => v.indexName)]
  const replacedIndices = new Set(
    (await Promise.all(liveNames.map(getIndicesBehind))).flatMap((indices) =>
      Object.keys(indices)
    )
  )

  logger.info(
    `Moving [${[...liveNames, globalAliasName].join(', ')}] to the reindexed indices, replacing [${[...replacedIndices].join(', ')}]`
  )
  await esClient.indices.updateAliases({
    body: {
      actions: [
        ...versions.flatMap(({ indexName, tempIndexName }) =>
          addAliasActions(tempIndexName, [
            indexName,
            eventIndexName,
            globalAliasName
          ])
        ),
        // Deleting a replaced index also frees its name, when a live name was an index.
        ...[...replacedIndices].map((index) => ({ remove_index: { index } }))
      ]
    }
  })

  logger.info(`Reindex finalised for ${eventConfiguration.id}`)
}

export async function cleanupTemporaryIndex(tempIndexName: string) {
  const esClient = getOrCreateClient()
  logger.info(`Cleaning up temporary index ${tempIndexName}`)
  const exists = await esClient.indices.exists({ index: tempIndexName })
  if (exists) {
    await esClient.indices.delete({ index: tempIndexName })
    logger.info(`Temporary index ${tempIndexName} deleted`)
  }
}

// A reindex takes minutes, so anything newer may still be an in-progress run.
const ORPHAN_MIN_AGE_MS = 24 * 60 * 60 * 1000

/** A temp index (`<type index>_<timestamp>`) with no alias never finished reindexing (e.g. killed mid-run) and is safe to delete. */
export async function cleanupOrphanedIndices(eventTypes: string[]) {
  const esClient = getOrCreateClient()
  const cutoff = Date.now() - ORPHAN_MIN_AGE_MS
  const typeIndexNames = eventTypes.map((eventType) =>
    getEventIndexName(eventType)
  )

  // An empty index list would make getAlias return every index in the cluster.
  if (typeIndexNames.length === 0) {
    return
  }

  const aliasInfo = await esClient.indices.getAlias({
    index: typeIndexNames.map((typeIndexName) => `${typeIndexName}_*`)
  })

  const orphaned = Object.entries(aliasInfo)
    .filter(
      ([index, { aliases }]) =>
        Object.keys(aliases).length === 0 &&
        typeIndexNames.some((typeIndexName) => {
          const timestamp = index.slice(typeIndexName.length + 1)
          return (
            index.startsWith(`${typeIndexName}_`) &&
            /^\d{13}$/.test(timestamp) &&
            Number(timestamp) < cutoff
          )
        })
    )
    .map(([index]) => index)

  if (orphaned.length === 0) {
    return
  }

  logger.warn(
    `Deleting ${orphaned.length} orphaned index(es) with no alias, left over from an interrupted reindex: ${orphaned.join(', ')}`
  )
  // Best-effort: a failure here must not block the reindex it's meant to precede.
  for (const index of orphaned) {
    await esClient.indices.delete({ index }).catch((err) => {
      logger.error(`Failed to delete orphaned index ${index}`, err)
    })
  }
}
