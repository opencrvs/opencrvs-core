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
import { Readable, Transform } from 'node:stream'
import fetch from 'node-fetch'
import { getUUID, logger, TokenWithBearer } from '@opencrvs/commons'
import { EventDocument } from '@opencrvs/commons/events'
import { env } from '@events/environment'

import {
  STREAM_BATCH_SIZE,
  streamEventDocuments
} from '@events/storage/postgres/events/events'
import { getTemporaryIndexName } from '@events/storage/elasticsearch'
import {
  getEventConfigurations,
  getInMemoryEventConfigurations
} from '../config/config'
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

async function reindexSearch(
  timestamp: number,
  token: TokenWithBearer,
  onBatchProcessed?: (count: number) => Promise<void>
) {
  const configurations = await getInMemoryEventConfigurations(token)
  const indexNameOverrides = new Map(
    configurations.map((config) => [
      config.id,
      getTemporaryIndexName(config.id, timestamp)
    ])
  )

  let buffer: EventDocument[] = []

  async function flush() {
    if (buffer.length === 0) {
      return
    }
    const start = new Date()
    const batch = buffer
    buffer = []
    const batchId = batch[0]?.id ?? 'unknown'
    logger.info(`Batch ${batchId}: ${batch.length} events to index`)

    await Promise.all([
      indexEventsInBulk(batch, configurations, indexNameOverrides),
      reindexBatchToCountryConfig(token, batch)
    ])

    await onBatchProcessed?.(batch.length)
    logger.info(
      `Batch ${batchId}: Processing batch took ${new Date().valueOf() - start.valueOf()} ms`
    )
  }

  return new Transform({
    objectMode: true,
    async transform(event: EventDocument, _, cb) {
      try {
        buffer.push(event)
        if (buffer.length >= STREAM_BATCH_SIZE) {
          await flush()
        }
        cb()
      } catch (e) {
        cb(e as Error)
      }
    },
    async flush(cb) {
      try {
        await flush()
        cb()
      } catch (e) {
        cb(e as Error)
      }
    }
  })
}

export async function runReindex(token: TokenWithBearer) {
  const start = new Date()
  const timestamp = start.valueOf()
  const runId = getUUID()
  const startTimestamp = start.toISOString()

  await createReindexingStatusEntry(runId, startTimestamp)

  const configurations = await getEventConfigurations(token)

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

  let processedCount = 0
  const objStream = Readable.from(streamEventDocuments())
  const searchIndexingStream = await reindexSearch(
    timestamp,
    token,
    async (batchSize) => {
      processedCount += batchSize
      await updateReindexingProgress(runId, processedCount)
      logger.info(
        `Reindex total records processed: ${processedCount}. Per second: ${Math.round(processedCount / ((new Date().valueOf() - start.valueOf()) / 1000))}`
      )
    }
  )

  try {
    await new Promise<void>((resolve, reject) => {
      objStream
        .pipe(searchIndexingStream)
        .on('finish', resolve)
        .on('error', reject)
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
