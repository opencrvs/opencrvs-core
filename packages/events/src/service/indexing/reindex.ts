import { EventConfig, getDeclarationFields } from '@opencrvs/commons/events'
import { logger } from '@opencrvs/commons'
import {
  getEventAliasName,
  getEventIndexName,
  getTemporaryIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { createIndex } from './indexing'

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
  eventType: string,
  tempIndexName: string
) {
  const esClient = getOrCreateClient()
  const globalAliasName = getEventAliasName()
  const writeAliasName = getEventIndexName(eventType)

  let currentLiveIndex: string | undefined
  try {
    const aliasInfo = await esClient.indices.getAlias({ name: globalAliasName })
    const eventIndexPrefix = getEventIndexName(eventType)
    currentLiveIndex = Object.keys(aliasInfo).find((idx) =>
      idx.startsWith(eventIndexPrefix)
    )
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
