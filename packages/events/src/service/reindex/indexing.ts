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

export async function prepareReindexIndex(
  eventConfiguration: EventConfig,
  timestamp: number
) {
  const tempIndexName = getTemporaryIndexName(eventConfiguration.id, timestamp)
  const formFields = getDeclarationFields(eventConfiguration)

  logger.info(`Preparing temporary reindex index ${tempIndexName}`)
  await createIndex(tempIndexName, formFields, false)

  return tempIndexName
}

export async function finaliseReindexIndex(
  entries: Array<{ eventType: string; tempIndexName: string }>
) {
  const esClient = getOrCreateClient()
  const globalAliasName = getEventAliasName()

  let existingAliasInfo: Record<string, unknown> = {}
  try {
    existingAliasInfo = await esClient.indices.getAlias({
      name: globalAliasName
    })
  } catch {
    // Alias doesn't exist yet — first reindex for all types
  }

  const actions: Array<Record<string, unknown>> = []
  const indicesToDelete: string[] = []
  // First-time entries: old concrete index had the same name as the write alias,
  // so we must delete it before we can create the alias with that name.
  const deferredWriteAliases: Array<{
    tempIndexName: string
    writeAliasName: string
  }> = []

  for (const { eventType, tempIndexName } of entries) {
    const writeAliasName = getEventIndexName(eventType)
    const currentLiveIndex = Object.keys(existingAliasInfo).find((idx) =>
      idx.startsWith(writeAliasName)
    )

    if (currentLiveIndex) {
      actions.push({
        remove: { index: currentLiveIndex, alias: globalAliasName }
      })
      actions.push({ add: { index: tempIndexName, alias: globalAliasName } })

      if (currentLiveIndex === writeAliasName) {
        // The concrete index occupies the name we want for the write alias;
        // defer creating it until after the old index is deleted.
        logger.warn(`First-time reindex for event type ${eventType}`)
        deferredWriteAliases.push({ tempIndexName, writeAliasName })
      } else {
        actions.push({ add: { index: tempIndexName, alias: writeAliasName } })
      }

      indicesToDelete.push(currentLiveIndex)
    } else {
      logger.info(
        `No existing index for ${eventType} — creating aliases ${globalAliasName} and ${writeAliasName} → ${tempIndexName}`
      )
      actions.push({ add: { index: tempIndexName, alias: globalAliasName } })
      actions.push({ add: { index: tempIndexName, alias: writeAliasName } })
    }
  }

  logger.info(`Swapping aliases for ${entries.length} event type(s) atomically`)
  await esClient.indices.updateAliases({ body: { actions } })

  await Promise.all(
    indicesToDelete.map((index) => {
      logger.info(`Deleting old index ${index}`)
      return esClient.indices.delete({ index })
    })
  )

  await Promise.all(
    deferredWriteAliases.map(({ tempIndexName, writeAliasName }) => {
      logger.info(
        `Creating per-type write alias ${writeAliasName} → ${tempIndexName}`
      )
      return esClient.indices.putAlias({
        index: tempIndexName,
        name: writeAliasName
      })
    })
  )

  logger.info(
    `Reindex finalised: ${entries.map((e) => e.tempIndexName).join(', ')} now live`
  )
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

export function listAllIndices() {
  const esClient = getOrCreateClient()
  return esClient.cat.indices({ format: 'json' })
}
