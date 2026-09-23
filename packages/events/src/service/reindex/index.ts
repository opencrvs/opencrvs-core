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
import { getUUID, logger, TokenWithBearer } from '@opencrvs/commons'
import { EventConfig, EventDocument } from '@opencrvs/commons/events'
import { env } from '@events/environment'

import { streamEventDocuments } from '@events/storage/postgres/events/events'
import { getTemporaryIndexName } from '@events/storage/elasticsearch'
import { getInMemoryEventConfigurations } from '../config/config'
import { indexEventsInBulk } from '../indexing/indexing'
import {
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

async function reindexSearch(
  timestamp: number,
  token: TokenWithBearer,
  configurations: EventConfig[],
  onBatchProcessed?: (count: number) => Promise<void>
) {
  const indexNameOverrides = new Map(
    configurations.map((config) => [
      config.id,
      getTemporaryIndexName(config.id, timestamp)
    ])
  )

  const inFlight = new Set<Promise<void>>()
  let failure: Error | undefined

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
  for await (const batch of streamEventDocuments()) {
    if (failure) {
      throw failure
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

  await Promise.all(inFlight)
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
  let lastProgressWriteAt = 0
  try {
    await reindexSearch(timestamp, token, configurations, async (batchSize) => {
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
      await updateReindexingProgress(runId, totalProcessed)
    })
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
  await updateReindexingProgress(runId, totalProcessed)

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
