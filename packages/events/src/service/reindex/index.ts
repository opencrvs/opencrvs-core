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
import { getUUID, logger, UUID } from '@opencrvs/commons'
import { EventDocument, VersionedEventConfig } from '@opencrvs/commons/events'

import {
  getEventsByIdsInTrx,
  streamEventDocuments
} from '@events/storage/postgres/events/events'
import { getClient } from '@events/storage/postgres/events'
import { getTemporaryVersionIndexName } from '@events/storage/elasticsearch'
import { getInMemoryVersionedEventConfigurations } from '../config/config'
import { getConfigForRecord, indexEventsInBulk } from '../indexing/indexing'
import {
  cleanupOrphanedIndices,
  cleanupTemporaryIndex,
  finaliseReindexIndices,
  prepareTemporaryIndices
} from './indexing'
import {
  completeReindexingStatus,
  createReindexingStatusEntry,
  failReindexingStatus,
  pruneOldReindexingStatusEntries,
  updateReindexingProgress
} from './status'

const REINDEX_CONCURRENCY = 4

const PROGRESS_WRITE_INTERVAL_MS = 2000

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let retries = 0
  const maxRetries = 5
  while (retries <= maxRetries) {
    try {
      return await fn()
    } catch (error) {
      logger.warn(
        `Request failed, retry in 5 seconds. Retry ${retries + 1}/${maxRetries}: ${error}`
      )
      retries++
      if (retries >= maxRetries) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
  throw new Error(`Max retries exceeded. This should never happen`)
}

async function reindexSearch(
  timestamp: number,
  configurations: VersionedEventConfig[],
  onBatchProcessed?: (count: number) => Promise<void>
) {
  const getTemporaryIndexOf = (event: EventDocument) =>
    getTemporaryVersionIndexName(event.type, event.configVersionId, timestamp)

  const inFlight = new Set<Promise<void>>()
  let failure: Error | undefined

  // A record that cannot be read fails the reindex, so search never silently misses it.
  async function fetchEvents(ids: UUID[]): Promise<EventDocument[]> {
    return withRetry(async () => getEventsByIdsInTrx(getClient(), ids))
  }

  async function writeBatch(batch: EventDocument[]) {
    // A record stamped with a version that is no longer configured fails the reindex
    // rather than drop out of search. Checked before writing, as retrying cannot fix it.
    for (const event of batch) {
      getConfigForRecord(configurations, event)
    }

    const start = new Date()
    const batchId = batch[0]?.id ?? 'unknown'
    logger.info(`Batch ${batchId}: ${batch.length} events to index`)

    await withRetry(async () =>
      indexEventsInBulk(batch, configurations, getTemporaryIndexOf)
    )

    await onBatchProcessed?.(batch.length)
    logger.info(
      `Batch ${batchId}: Processing batch took ${new Date().valueOf() - start.valueOf()} ms`
    )
  }

  /*
   * Starts each batch without waiting for it, so the next batch can be read from
   * Postgres while this one is written to Elasticsearch.
   * Only blocks once REINDEX_CONCURRENCY batches are already in flight.
   */
  try {
    for await (const batch of streamEventDocuments(undefined, fetchEvents)) {
      if (failure) {
        break
      }

      // The stored promise never rejects, so a failure cannot go unhandled while
      // nothing is awaiting it. It surfaces on the next batch, or once drained.
      const pending: Promise<void> = writeBatch(batch)
        .catch((err: unknown) => {
          failure = failure ?? (err as Error)
        })
        .finally(() => {
          inFlight.delete(pending)
        })

      inFlight.add(pending)

      if (inFlight.size >= REINDEX_CONCURRENCY) {
        await Promise.race(inFlight)
      }
    }
  } finally {
    // Let in-flight batches settle, also when reading from Postgres fails
    await Promise.all(inFlight)
  }

  if (failure) {
    throw failure
  }
}

async function buildTemporaryIndices(
  runId: UUID,
  timestamp: number,
  versionedConfigurations: VersionedEventConfig[]
) {
  // Best-effort: leftover orphans are retried on the next run.
  await cleanupOrphanedIndices(versionedConfigurations).catch((err) =>
    logger.error('Failed to clean up orphaned indices', err)
  )

  /*
   * Create temporary indices for every version of all event types
   */
  await Promise.all(
    versionedConfigurations.map(async (configuration) => {
      const indexNamesWithTimestamp = await prepareTemporaryIndices(
        configuration,
        timestamp
      )
      logger.info(
        `Prepared temporary indices ${indexNamesWithTimestamp.join(', ')} for event type ${configuration.id}`
      )
    })
  )
  const startSecond = Math.floor(Date.now() / 1000)
  const processedCounts: number[] = []
  let totalProcessed = 0
  let lastProgressWriteAt = 0

  await reindexSearch(timestamp, versionedConfigurations, async (batchSize) => {
    const currentSecond = Math.floor(Date.now() / 1000) - startSecond
    const processedThisSecond = processedCounts[currentSecond] || 0
    processedCounts[currentSecond] = processedThisSecond + batchSize
    totalProcessed += batchSize
    const perSecond =
      processedCounts.slice(-6, -1).reduce((m, x) => m + x, 0) / 5
    logger.info(
      `Reindex total records processed: ${totalProcessed}. Per second: ${Math.round(perSecond)}`
    )

    /*
     * Batches complete concurrently, and the status document is a single
     * document, so writing it per batch makes Elasticsearch reject the
     * interleaved updates with a version conflict. Claiming the window before
     * the await lets exactly one caller through, and the final count is
     * written once every batch has been processed.
     */
    const now = Date.now()
    if (now - lastProgressWriteAt < PROGRESS_WRITE_INTERVAL_MS) {
      return
    }
    lastProgressWriteAt = now
    await updateReindexingProgress(runId, { processed: totalProcessed })
  })
  await updateReindexingProgress(runId, { processed: totalProcessed })

  return totalProcessed
}

async function cleanupTemporaryIndices(
  timestamp: number,
  versionedConfigurations: VersionedEventConfig[]
) {
  const temporaryIndices = versionedConfigurations.flatMap((configuration) =>
    configuration.versions.map(({ id }) =>
      getTemporaryVersionIndexName(configuration.id, id, timestamp)
    )
  )
  for (const tempIndexName of temporaryIndices) {
    await cleanupTemporaryIndex(tempIndexName).catch((cleanupErr) => {
      logger.error(
        `Failed to clean up temporary index ${tempIndexName}`,
        cleanupErr
      )
    })
  }
}

export async function runReindex() {
  const start = new Date()
  const timestamp = start.valueOf()
  const runId = getUUID()

  await createReindexingStatusEntry(runId, start.toISOString())

  let versionedConfigurations: VersionedEventConfig[] = []
  // The temporary indices are only safe to delete before an alias moves to them.
  let aliasesMoved = false
  try {
    versionedConfigurations = await getInMemoryVersionedEventConfigurations()
    const totalProcessed = await buildTemporaryIndices(
      runId,
      timestamp,
      versionedConfigurations
    )

    aliasesMoved = true
    await Promise.all(
      versionedConfigurations.map(async (config) =>
        finaliseReindexIndices(config, timestamp)
      )
    )

    await completeReindexingStatus(runId, new Date().toISOString())
    logger.info(`Reindex completed. Total records indexed: ${totalProcessed}`)
  } catch (err) {
    logger.error('Reindex failed', err)
    const errorMessage = err instanceof Error ? err.message : String(err)
    await failReindexingStatus(runId, errorMessage, new Date().toISOString())
    if (!aliasesMoved) {
      await cleanupTemporaryIndices(timestamp, versionedConfigurations)
    }
    throw err
  }
  await pruneOldReindexingStatusEntries()
}
