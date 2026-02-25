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
import { Readable, Transform, PassThrough } from 'node:stream'
import { Agent } from 'node:http'
import fetch from 'node-fetch'
import { JsonStreamStringify } from 'json-stream-stringify'
import { EventDocument } from '@opencrvs/commons/events'
import { logger, TokenWithBearer } from '@opencrvs/commons'
import {
  STREAM_BATCH_SIZE,
  streamEventDocuments
} from '@events/storage/postgres/events/events'
import { env } from '@events/environment'
import {
  cleanupTemporaryIndex,
  finaliseReindexIndex,
  indexEventsInBulk,
  prepareReindexIndex
} from '../indexing/indexing'
import { getEventConfigurations } from '../config/config'

import { getInMemoryEventConfigurations } from '../config/config'

async function reindexSearch(
  token: TokenWithBearer,
  indexNameOverrides: Map<string, string>,
  eventType?: string
) {
  const allConfigurations = await getInMemoryEventConfigurations(token)
  const configurations = eventType
    ? allConfigurations.filter((c) => c.id === eventType)
    : allConfigurations
  let buffer: EventDocument[] = []

  async function flush() {
    if (buffer.length === 0) {
      return
    }
    logger.info(`Reindexing ${buffer.length} events`)
    await indexEventsInBulk(buffer, configurations, indexNameOverrides)
    buffer = []
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

async function runReindex(token: TokenWithBearer, eventType?: string) {
  const allConfigurations = await getEventConfigurations(token)
  const configurations = eventType
    ? allConfigurations.filter((c) => c.id === eventType)
    : allConfigurations

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

  const objStream = Readable.from(streamEventDocuments(eventType))

  // Stream to reindex endpoint in country config. PassThrough forks the stream.
  const eventDocumentStreamForCountryConfig = new PassThrough({
    objectMode: true
  })
  objStream.pipe(eventDocumentStreamForCountryConfig)

  // Stream to ES indexing (targets temporary indexes)
  const eventDocumentStreamForSearch = new PassThrough({ objectMode: true })
  objStream.pipe(eventDocumentStreamForSearch)

  const searchIndexingStream = await reindexSearch(
    token,
    indexNameOverrides,
    eventType
  )
  const searchIndexingPromise = new Promise((resolve, reject) => {
    eventDocumentStreamForSearch
      .pipe(searchIndexingStream)
      .on('finish', resolve)
      .on('error', reject)
  })

  const countryConfigIndexingPromise = fetch(
    new URL('/reindex', env.COUNTRY_CONFIG_URL),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      // Converts object stream to JSON string stream so that it can
      // be sent to the country config reindex endpoint
      body: new JsonStreamStringify(eventDocumentStreamForCountryConfig),
      // Ensure HTTP socket of previous GET /events request is not reused
      // to avoid connections being closed preemptively by Node.js
      agent: new Agent({ keepAlive: false })
    }
  ).then((response) => {
    if (!response.ok && response.status === 404) {
      logger.warn(
        `Country config reindex endpoint not found: ${env.COUNTRY_CONFIG_URL}`
      )
      return
    }
    if (!response.ok) {
      throw new Error(
        `Failed to reindex country config: ${response.status} ${response.statusText}`
      )
    }
  })

  try {
    await Promise.all([searchIndexingPromise, countryConfigIndexingPromise])
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
  // Pass the eventType so finaliseReindexIndex can look up the current live
  // index from the alias (which may itself be a previous temp index).
  for (const [eventType, { tempIndexName }] of indexMap.entries()) {
    await finaliseReindexIndex(eventType, tempIndexName)
  }
}

export function reindex(token: TokenWithBearer, eventType?: string) {
  logger.info(
    eventType
      ? `Reindex started in background for event type: ${eventType}`
      : 'Reindex started in background for all event types'
  )
  runReindex(token, eventType).catch((err) => {
    logger.error('Reindex failed', err)
  })
}
