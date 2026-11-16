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
import fetch from 'node-fetch'
import { getUUID, logger, TokenWithBearer, UUID } from '@opencrvs/commons'
import { EventConfig, EventDocument } from '@opencrvs/commons/events'
import { env } from '@events/environment'

import {
  getEventsByIdsInTrx,
  streamEventDocuments
} from '@events/storage/postgres/events/events'
import { getClient } from '@events/storage/postgres/events'
import { getTemporaryIndexName } from '@events/storage/elasticsearch'
import { getInMemoryEventConfigurations } from '../config/config'
import { indexEventsInBulk } from '../indexing/indexing'
import {
  cleanupOrphanedIndices,
  cleanupTemporaryIndex,
  finaliseReindexIndex,
  prepareTemporaryIndex
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

async function reindexBatchToCountryConfig(
  token: TokenWithBearer,
  batch: EventDocument[]
): Promise<void> {
  const start = new Date()

  const response = await fetch(new URL('/reindex', env.COUNTRY_CONFIG_URL), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify(batch)
  })
  const batchId = batch[0]?.id ?? 'unknown'
  logger.info(
    `Batch ${batchId}: Reindex batch to country config took ${new Date().valueOf() - start.valueOf()} ms`
  )
  if (!response.ok) {
    throw new Error(
      `Failed to reindex country config batch: ${response.status} ${response.statusText}`
    )
  }
}

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

interface SkippedEvent {
  id: UUID
  error: string
}

/*
 * Splits a chunk that cannot be read in half until only the records that fail
 * on their own are left, so the rest of the chunk can still be indexed.
 */
async function fetchReadableEvents(
  ids: UUID[]
): Promise<{ events: EventDocument[]; skipped: SkippedEvent[] }> {
  try {
    return { events: await getEventsByIdsInTrx(getClient(), ids), skipped: [] }
  } catch (err) {
    if (ids.length === 1) {
      const error = err instanceof Error ? err.message : String(err)
      return { events: [], skipped: [{ id: ids[0], error }] }
    }

    const middle = Math.ceil(ids.length / 2)
    const first = await fetchReadableEvents(ids.slice(0, middle))
    const second = await fetchReadableEvents(ids.slice(middle))
    return {
      events: [...first.events, ...second.events],
      skipped: [...first.skipped, ...second.skipped]
    }
  }
}

async function reindexSearch(
  timestamp: number,
  token: TokenWithBearer,
  configurations: EventConfig[],
  onBatchProcessed?: (count: number) => Promise<void>,
  onEventsSkipped?: (skipped: SkippedEvent[]) => void
) {
  const indexNameOverrides = new Map(
    configurations.map((config) => [
      config.id,
      getTemporaryIndexName(config.id, timestamp)
    ])
  )

  const inFlight = new Set<Promise<void>>()
  let failure: Error | undefined

  /*
   * Records that still cannot be read after retrying are skipped, so one bad
   * record does not fail the whole reindex. The skip is reported in the run's
   * progress, so the records can be fixed and reindexed.
   */
  async function fetchEvents(ids: UUID[]): Promise<EventDocument[]> {
    try {
      return await withRetry(async () => getEventsByIdsInTrx(getClient(), ids))
    } catch (err) {
      const { events, skipped } = await fetchReadableEvents(ids)

      // Every record failing on its own points at the database, not the data
      if (skipped.length === ids.length) {
        throw err
      }

      for (const { id, error } of skipped) {
        logger.error({
          message: 'Skipping event that could not be read',
          eventId: id,
          error
        })
      }
      onEventsSkipped?.(skipped)
      return events
    }
  }

  async function writeBatch(batch: EventDocument[]) {
    const start = new Date()
    const batchId = batch[0]?.id ?? 'unknown'
    logger.info(`Batch ${batchId}: ${batch.length} events to index`)

    await Promise.all([
      withRetry(async () =>
        indexEventsInBulk(batch, configurations, indexNameOverrides)
      ),
      withRetry(async () => reindexBatchToCountryConfig(token, batch))
    ])

    await onBatchProcessed?.(batch.length)
    logger.info(
      `Batch ${batchId}: Processing batch took ${new Date().valueOf() - start.valueOf()} ms`
    )
  }

  /*
   * Starts each batch without waiting for it, so the next batch can be read from
   * Postgres while this one is written to Elasticsearch and country config.
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

export async function runReindex(token: TokenWithBearer) {
  const start = new Date()
  const timestamp = start.valueOf()
  const runId = getUUID()
  const startTimestamp = start.toISOString()

  await createReindexingStatusEntry(runId, startTimestamp)

  const configurations = await getInMemoryEventConfigurations(token)

  // Best-effort: leftover orphans are retried on the next run.
  await cleanupOrphanedIndices(configurations).catch((err) =>
    logger.error('Failed to clean up orphaned indices', err)
  )

  /*
   * Create temporary indices for all event types
   */
  const temporaryIndices = await Promise.all(
    configurations.map(async (configuration) => {
      const indexNameWithTimestamp = await prepareTemporaryIndex(
        configuration,
        timestamp
      )
      logger.info(
        `Prepared temporary index ${indexNameWithTimestamp} for event type ${configuration.id}`
      )
      return indexNameWithTimestamp
    })
  )
  const startSecond = Math.floor(Date.now() / 1000)
  const processedCounts: number[] = []
  let totalProcessed = 0
  const skippedEvents: SkippedEvent[] = []
  let lastProgressWriteAt = 0

  function getProgress() {
    return {
      processed: totalProcessed,
      skipped: skippedEvents.length,
      errors: skippedEvents.map(({ id, error }) => `${id}: ${error}`)
    }
  }

  function onEventsSkipped(skipped: SkippedEvent[]) {
    skippedEvents.push(...skipped)
  }

  try {
    await reindexSearch(
      timestamp,
      token,
      configurations,
      async (batchSize) => {
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
        await updateReindexingProgress(runId, getProgress())
      },
      onEventsSkipped
    )
  } catch (err) {
    logger.error('Reindex failed, cleaning up temporary indexes', err)
    const errorMessage = err instanceof Error ? err.message : String(err)
    await failReindexingStatus(runId, errorMessage, new Date().toISOString())
    for (const tempIndexName of temporaryIndices) {
      await cleanupTemporaryIndex(tempIndexName).catch((cleanupErr) => {
        logger.error(
          `Failed to clean up temporary index ${tempIndexName}`,
          cleanupErr
        )
      })
    }
    throw err
  }
  await updateReindexingProgress(runId, getProgress())
  if (skippedEvents.length > 0) {
    logger.error(
      `Reindex skipped ${skippedEvents.length} records that could not be read`
    )
  }

  await Promise.all(
    configurations.map(async (config) =>
      finaliseReindexIndex(
        config.id,
        getTemporaryIndexName(config.id, timestamp)
      )
    )
  )

  await completeReindexingStatus(runId, new Date().toISOString())
  await pruneOldReindexingStatusEntries()
}

export async function reindex(token: TokenWithBearer) {
  logger.info('Reindex started in background')
  return runReindex(token)
}
