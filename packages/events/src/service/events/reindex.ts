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
import fetch from 'node-fetch'
import { JsonStreamStringify } from 'json-stream-stringify'
import { EventDocument } from '@opencrvs/commons/events'
import { logger, TokenWithBearer } from '@opencrvs/commons'
import {
  STREAM_BATCH_SIZE,
  streamEventDocuments
} from '@events/storage/postgres/events/events'
import { env } from '@events/environment'
import { ensureIndexExists, indexEventsInBulk } from '../indexing/indexing'
import { getEventConfigurations } from '../config/config'
import { getInMemoryEventConfigurations } from '../config/config'

async function reindexSearch(token: TokenWithBearer) {
  const configurations = await getInMemoryEventConfigurations(token)
  let buffer: EventDocument[] = []

  async function flush() {
    if (buffer.length === 0) {
      return
    }
    logger.info(`Reindexing ${buffer.length} events`)
    // Index the buffered events in bulk
    await indexEventsInBulk(buffer, configurations)
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

export async function reindex(token: TokenWithBearer) {
  const configurations = await getEventConfigurations(token)
  for (const configuration of configurations) {
    logger.info(`Ensuring index exists for: ${configuration.id}`)
    await ensureIndexExists(configuration, { overwrite: true })
  }

  // Source: async iterator -> readable
  const sourceStream = Readable.from(streamEventDocuments())

  // Tee stream: single pipe from source, then fork
  const teeStream = new PassThrough({ objectMode: true })
  sourceStream.pipe(teeStream)

  // Stream to reindex endpoint in country config
  const eventDocumentStreamForCountryConfig = new PassThrough({
    objectMode: true
  })

  // Stream to ES indexing
  const eventDocumentStreamForSearch = new PassThrough({ objectMode: true })

  // Fork from tee
  teeStream.pipe(eventDocumentStreamForCountryConfig)
  teeStream.pipe(eventDocumentStreamForSearch)

  const searchIndexingStream = await reindexSearch(token)
  const searchIndexingPromise = new Promise((resolve, reject) => {
    eventDocumentStreamForSearch
      .pipe(searchIndexingStream)
      .on('finish', resolve)
      .on('error', reject)
  })

  const url = new URL('/reindex', env.COUNTRY_CONFIG_URL)

  const countryConfigIndexingPromise = fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    // Converts object stream to JSON string stream so that it can
    // be sent to the country config reindex endpoint
    body: new JsonStreamStringify(eventDocumentStreamForCountryConfig)
  })
    .then((response) => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .catch((err: any) => {
      logger.error(
        {
          message: err?.message,
          stack: err?.stack,
          code: err?.code,
          errno: err?.errno,
          type: err?.type,
          url: url.toString()
        },
        'Country config reindex request failed'
      )
      throw err
    })

  return Promise.all([searchIndexingPromise, countryConfigIndexingPromise])
}
