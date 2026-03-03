import { EventConfig, getDeclarationFields } from '@opencrvs/commons/events'
import { logger } from '@opencrvs/commons'
import {
  getEventAliasName,
  getEventIndexName,
  getTemporaryIndexName,
  getOrCreateClient
} from '@events/storage/elasticsearch'
import { createIndex } from './indexing'

/**
 * Creates a temporary index for blue/green reindexing.
 * Returns the temporary index name. Bulk writes should target this index.
 * The alias is NOT added at this point — it is only added in `finaliseReindexIndex`
 * once all data has been successfully indexed, so the temp index never appears
 * in alias-based queries before the swap.
 * Call `finaliseReindexIndex` on success or `cleanupTemporaryIndex` on failure.
 */
export async function prepareReindexIndex(
  eventConfiguration: EventConfig,
  timestamp: number
): Promise<{ tempIndexName: string }> {
  const tempIndexName = getTemporaryIndexName(eventConfiguration.id, timestamp)
  const formFields = getDeclarationFields(eventConfiguration)

  logger.info(`Preparing temporary reindex index ${tempIndexName}`)
  // addAlias: false — the temp index must NOT join the alias until the swap
  await createIndex(tempIndexName, formFields, { addAlias: false })

  return { tempIndexName }
}

/**
 * Atomically swaps the global read alias and the per-type write alias from
 * whichever index currently holds them to the newly built temp index, then
 * deletes the old index. Zero-downtime promotion.
 *
 * Two aliases are maintained:
 *  - Global read alias  (`events`)         — used by all search/query operations
 *  - Per-type write alias (`events_birth`) — used by indexEvent / indexEventsInBulk
 *    so that writes always resolve to the correct physical index regardless of
 *    whether a reindex has occurred.
 *
 * We look up the current alias holder at finalise-time rather than relying on
 * the static computed name, because after the first blue/green reindex the live
 * index is a timestamped temp name, not the original `{prefix}_{eventType}`.
 */

export async function finaliseReindexIndex(
  eventType: string,
  tempIndexName: string
) {
  const esClient = getOrCreateClient()
  const globalAliasName = getEventAliasName()
  // The write alias name is the same as the stable event-type index name
  // (e.g. "events_birth"). After the first reindex this name is an alias, not a
  // concrete index, so writes always land on the correct physical index.
  const writeAliasName = getEventIndexName(eventType)

  // Find which concrete index currently holds the global alias for this event type
  let currentLiveIndex: string | undefined
  try {
    const aliasInfo = await esClient.indices.getAlias({ name: globalAliasName })
    // The global alias spans all event types — find the index that serves this
    // specific event type (its name starts with the event type index prefix)
    const eventIndexPrefix = getEventIndexName(eventType)
    currentLiveIndex = Object.keys(aliasInfo).find((idx) =>
      idx.startsWith(eventIndexPrefix)
    )
  } catch {
    // Alias doesn't exist yet — this is the first reindex
  }

  if (currentLiveIndex) {
    // First-ever reindex of a deployed instance: the live index is a bare
    // concrete index whose name (e.g. "events_birth") is the same as the write
    // alias we want to create. ES does not allow an alias to share a name with
    // an existing concrete index, so we must delete the concrete index first and
    // then create the alias in two separate steps.
    const writeAliasConflictsWithConcreteIndex =
      currentLiveIndex === writeAliasName

    if (writeAliasConflictsWithConcreteIndex) {
      logger.warn(
        `First-time blue/green reindex detected: live index "${currentLiveIndex}" has the same name ` +
          `as the write alias "${writeAliasName}". Falling back to two-step alias promotion ` +
          `(brief write-alias gap window is unavoidable in this case).`
      )
      // Step 1: Atomically swap global read alias to the new index.
      await esClient.indices.updateAliases({
        body: {
          actions: [
            { remove: { index: currentLiveIndex, alias: globalAliasName } },
            { add: { index: tempIndexName, alias: globalAliasName } }
          ]
        }
      })
      // Step 2: Delete old concrete index — this frees the name "events_birth".
      logger.info(
        `Global alias swapped. Deleting old concrete index ${currentLiveIndex}`
      )
      await esClient.indices.delete({ index: currentLiveIndex })
      // Step 3: Now safe to create the write alias under the freed name.
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
      // Normal path (second+ reindex): single atomic call swaps global read alias
      // AND creates per-type write alias simultaneously — no gap window.
      await esClient.indices.updateAliases({
        body: {
          actions: [
            { remove: { index: currentLiveIndex, alias: globalAliasName } },
            { add: { index: tempIndexName, alias: globalAliasName } },
            { add: { index: tempIndexName, alias: writeAliasName } }
          ]
        }
      })
      // Delete old index only after aliases are consistent.
      logger.info(
        `Aliases swapped atomically. Deleting old index ${currentLiveIndex}`
      )
      await esClient.indices.delete({ index: currentLiveIndex })
    }
  } else {
    // No existing index for this event type — create both aliases in one call.
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

/**
 * Deletes the temporary index if reindexing failed. The live index is untouched.
 */
export async function cleanupTemporaryIndex(tempIndexName: string) {
  const esClient = getOrCreateClient()
  logger.info(`Cleaning up temporary index ${tempIndexName}`)
  const exists = await esClient.indices.exists({ index: tempIndexName })
  if (exists) {
    await esClient.indices.delete({ index: tempIndexName })
    logger.info(`Temporary index ${tempIndexName} deleted`)
  }
}
