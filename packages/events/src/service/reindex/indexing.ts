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
import { EventConfig, getDeclarationFields } from '@opencrvs/commons/events'
import { logger } from '@opencrvs/commons'
import {
  getEventAliasName,
  getEventIndexName,
  getTemporaryIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { createIndex } from '../indexing/indexing'

export async function prepareTemporaryIndex(
  eventConfiguration: EventConfig,
  timestamp: number
) {
  const tempIndexName = getTemporaryIndexName(eventConfiguration.id, timestamp)
  const formFields = getDeclarationFields(eventConfiguration)

  logger.info(`Preparing temporary reindex index ${tempIndexName}`)

  await createIndex(tempIndexName, formFields, false)

  return tempIndexName
}

async function getIndicesBehindAlias(
  esClient: ReturnType<typeof getOrCreateClient>,
  alias: string
): Promise<string[]> {
  try {
    return Object.keys(await esClient.indices.getAlias({ name: alias }))
  } catch {
    // Alias doesn't exist yet — first reindex
    return []
  }
}

export async function finaliseReindexIndex(
  eventType: string,
  tempIndexName: string
) {
  const esClient = getOrCreateClient()
  const globalAliasName = getEventAliasName()
  const writeAliasName = getEventIndexName(eventType)

  let currentLiveIndex: string | undefined
  try {
    const aliasInfo = await getIndicesBehindAlias(esClient, globalAliasName)
    const eventIndexPrefix = getEventIndexName(eventType)
    currentLiveIndex = aliasInfo.find((idx) => idx.startsWith(eventIndexPrefix))
  } catch {
    // Alias doesn't exist yet — this is the first reindex
  }

  if (currentLiveIndex) {
    const writeAliasConflictsWithConcreteIndex =
      currentLiveIndex === writeAliasName

    if (writeAliasConflictsWithConcreteIndex) {
      logger.warn('First-time reindex')
      await esClient.indices.updateAliases({
        body: {
          actions: [
            { remove: { index: currentLiveIndex, alias: globalAliasName } },
            { add: { index: tempIndexName, alias: globalAliasName } }
          ]
        }
      })
      logger.info(
        `Global alias swapped. Deleting old concrete index ${currentLiveIndex}`
      )
      await esClient.indices.delete({ index: currentLiveIndex })
      logger.info(
        `Creating per-type write alias ${writeAliasName} → ${tempIndexName}`
      )
      await esClient.indices.putAlias({
        index: tempIndexName,
        name: writeAliasName
      })
    } else {
      logger.info(
        `Swapping aliases [${globalAliasName}, ${writeAliasName}] from ${currentLiveIndex} to ${tempIndexName}`
      )
      await esClient.indices.updateAliases({
        body: {
          actions: [
            { remove: { index: currentLiveIndex, alias: globalAliasName } },
            { add: { index: tempIndexName, alias: globalAliasName } },
            { add: { index: tempIndexName, alias: writeAliasName } }
          ]
        }
      })
      logger.info(
        `Aliases swapped atomically. Deleting old index ${currentLiveIndex}`
      )
      await esClient.indices.delete({ index: currentLiveIndex })
    }
  } else {
    logger.info(
      `No existing index for ${eventType}, creating aliases ${globalAliasName} and ${writeAliasName} → ${tempIndexName}`
    )
    await esClient.indices.updateAliases({
      body: {
        actions: [
          { add: { index: tempIndexName, alias: globalAliasName } },
          { add: { index: tempIndexName, alias: writeAliasName } }
        ]
      }
    })
  }

  logger.info(`Reindex finalised: ${tempIndexName} is now live`)
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
export async function cleanupOrphanedIndices(configurations: EventConfig[]) {
  const esClient = getOrCreateClient()
  const cutoff = Date.now() - ORPHAN_MIN_AGE_MS
  const typeIndexNames = configurations.map(({ id }) => getEventIndexName(id))

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
