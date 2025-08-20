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
import { EventDocument } from '@opencrvs/commons/events'
import { logger } from '@opencrvs/commons'
import { streamEventDocuments } from '@events/storage/postgres/events/events'
import { env } from '@events/environment'
import { indexEventsInBulk } from '../indexing/indexing'
import { getEventConfigurations } from '../config/config'

const BATCH_SIZE = 1000

function createJSONStringifierStream() {
  return new Transform({
    readableObjectMode: false,
    writableObjectMode: true,
    transform(obj, _, cb) {
      try {
        const chunk = Buffer.from(JSON.stringify(obj) + '\n')
        cb(null, chunk)
      } catch (err) {
        cb(err as Error)
      }
    }
  })
}

async function reindexSearch(token: string) {
  const configurations = await getEventConfigurations(token)
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
        if (buffer.length >= BATCH_SIZE) {
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

export async function reindex(token: string) {
  const objStream = Readable.from(streamEventDocuments())

  // Stream to reindex endpoint in country config. PassThrough forks the stream.
  const eventDocumentStreamForCountryConfig = new PassThrough({
    objectMode: true
  })
  objStream.pipe(eventDocumentStreamForCountryConfig)

  // Stream to ES indexing
  const eventDocumentStreamForSearch = new PassThrough({ objectMode: true })
  objStream.pipe(eventDocumentStreamForSearch)

  // Converts object stream to JSON string stream so that it can
  // be sent to the country config reindex endpoint
  const stream = eventDocumentStreamForCountryConfig.pipe(
    createJSONStringifierStream()
  )

  const searchIndexingStream = await reindexSearch(token)
  const searchIndexingPromise = new Promise((resolve, reject) => {
    eventDocumentStreamForSearch
      .pipe(searchIndexingStream)
      .on('finish', resolve)
      .on('error', reject)
  })

  const countryConfixIndexingPromise = fetch(
    new URL('/reindex', env.COUNTRY_CONFIG_URL),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: stream
    }
  )

  return Promise.all([searchIndexingPromise, countryConfixIndexingPromise])
}
