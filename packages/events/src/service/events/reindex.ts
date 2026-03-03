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
import { EventDocument } from '@opencrvs/commons/events'
import { logger, TokenWithBearer } from '@opencrvs/commons'
import {
  STREAM_BATCH_SIZE,
  streamEventDocuments
} from '@events/storage/postgres/events/events'
import { env } from '@events/environment'
import { indexEventsInBulk } from '../indexing/indexing'
import { getEventConfigurations } from '../config/config'

import { getInMemoryEventConfigurations } from '../config/config'
import {
  cleanupTemporaryIndex,
  finaliseReindexIndex,
  prepareReindexIndex
} from '../indexing/reindex'

/**
 * Notifies country config about a single batch of events.
 * Called once per STREAM_BATCH_SIZE chunk, so each HTTP request is short-lived
 * and not subject to server-level streaming timeouts.
 */
async function notifyCountryConfigBatch(
  token: TokenWithBearer,
  batch: EventDocument[]
): Promise<void> {
  const response = await fetch(new URL('/reindex', env.COUNTRY_CONFIG_URL), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify(batch)
  })

  if (!response.ok && response.status === 404) {
    logger.warn(
      `Country config reindex endpoint not found: ${env.COUNTRY_CONFIG_URL}`
    )
    return
  }

  if (!response.ok) {
    throw new Error(
      `Failed to reindex country config batch: ${response.status} ${response.statusText}`
    )
  }
}

async function reindexSearch(
  token: TokenWithBearer,
  indexNameOverrides: Map<string, string>
) {
  const configurations = await getInMemoryEventConfigurations(token)
  let buffer: EventDocument[] = []

  async function flush() {
    if (buffer.length === 0) {
      return
    }
    const batch = buffer
    buffer = []
    logger.info(`Reindexing ${batch.length} events`)
    // Both operations run in parallel per batch. Each is a short-lived call
    // so neither is subject to long-running connection timeouts.
    await Promise.all([
      indexEventsInBulk(batch, configurations, indexNameOverrides),
      notifyCountryConfigBatch(token, batch)
    ])
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

async function runReindex(token: TokenWithBearer) {
  const configurations = await getEventConfigurations(token)

  // Build temp indexes for each event type (blue/green pattern).
  // The live indexes remain intact and searchable throughout.
  const timestamp = Date.now()
  const indexMap = new Map<string, { tempIndexName: string }>()

  for (const configuration of configurations) {
    const result = await prepareReindexIndex(configuration, timestamp)
    indexMap.set(configuration.id, result)
    logger.info(
      `Prepared temporary index ${result.tempIndexName} for event type ${configuration.id}`
    )
  }

  // Map of eventType → temporary index name for bulk writes
  const indexNameOverrides = new Map(
    [...indexMap.entries()].map(([type, { tempIndexName }]) => [
      type,
      tempIndexName
    ])
  )

  const objStream = Readable.from(streamEventDocuments())
  const searchIndexingStream = await reindexSearch(token, indexNameOverrides)

  try {
    await new Promise<void>((resolve, reject) => {
      objStream
        .pipe(searchIndexingStream)
        .on('finish', resolve)
        .on('error', reject)
    })
  } catch (err) {
    // Reindexing failed — clean up temp indexes, leave live indexes untouched
    logger.error('Reindex failed, cleaning up temporary indexes', err)
    for (const { tempIndexName } of indexMap.values()) {
      await cleanupTemporaryIndex(tempIndexName).catch((cleanupErr) => {
        logger.error(
          `Failed to clean up temporary index ${tempIndexName}`,
          cleanupErr
        )
      })
    }
    throw err
  }

  // Success — atomically swap aliases from live → temp for each event type.
  for (const [type, { tempIndexName }] of indexMap.entries()) {
    await finaliseReindexIndex(type, tempIndexName)
  }
}

export function reindex(token: TokenWithBearer) {
  logger.info('Reindex started in background for all event types')
  runReindex(token).catch((err) => {
    logger.error('Reindex failed', err)
  })
}
