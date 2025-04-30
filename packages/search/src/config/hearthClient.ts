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

import { logger } from '@opencrvs/commons'
import { HEARTH_MONGO_URL } from '@search/constants'
import { MongoClient } from 'mongodb'

const client = new MongoClient(HEARTH_MONGO_URL)

client.on('close', () => {
  logger.error('MongoDB connection closed.')
})

client.on('error', (err) => {
  logger.error('MongoDB connection error:', err)
})

async function wait(delay: number) {
  await new Promise((resolve) => setTimeout(resolve, delay))
}

export const start = async (): Promise<MongoClient> => {
  try {
    await client.connect()
    logger.info('Connected to MongoDB')
    return client
  } catch (err) {
    logger.error('Failed to connect to MongoDB. Retrying...')
    await wait(1000)
    return await start()
  }
}

export const stop = async (): Promise<void> => {
  await client.close()
}

export default client
