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
import { getEventConfigurations } from '../config/config'
import { getInMemoryEventConfigurations } from '../config/config'
import { indexEventsInBulk } from '../indexing/indexing'
import {
  cleanupTemporaryIndex,
  finaliseReindexIndex,
  prepareReindexIndex
} from '../indexing/reindex'

async function reindexBatchToCountryConfig(
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

    await Promise.all([
      indexEventsInBulk(batch, configurations, indexNameOverrides),
      reindexBatchToCountryConfig(token, batch)
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

  const timestamp = Date.now()
  const indexMap = new Map<string, string>()

  for (const configuration of configurations) {
    const indexNameWithTimestamp = await prepareReindexIndex(
      configuration,
      timestamp
    )
    indexMap.set(configuration.id, indexNameWithTimestamp)
    logger.info(
      `Prepared temporary index ${indexNameWithTimestamp} for event type ${configuration.id}`
    )
  }

  const indexNameOverrides = new Map(
    [...indexMap.entries()].map(([type, tempIndexName]) => [
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
    logger.error('Reindex failed, cleaning up temporary indexes', err)
    for (const tempIndexName of indexMap.values()) {
      await cleanupTemporaryIndex(tempIndexName).catch((cleanupErr) => {
        logger.error(
          `Failed to clean up temporary index ${tempIndexName}`,
          cleanupErr
        )
      })
    }
    throw err
  }

  for (const [type, tempIndexName] of indexMap.entries()) {
    await finaliseReindexIndex(type, tempIndexName)
  }
}

export function reindex(token: TokenWithBearer) {
  logger.info('Reindex started in background')
  runReindex(token).catch((err) => {
    logger.error('Reindex failed', err)
  })
}
