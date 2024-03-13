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
import * as mongoose from 'mongoose'

import { MONGO_URL } from '@user-mgnt/constants'
import { logger } from '@user-mgnt/logger'

const db = mongoose.connection

db.on('disconnected', () => {
  logger.info('MongoDB disconnected')
})

db.on('connected', () => {
  logger.info('Connected to MongoDB')
})

const wait = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time))

const connect = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URL)
  } catch (err) {
    logger.error(err)
    await wait(1000)
    return connect()
  }
}

export async function stop() {
  mongoose.disconnect()
}

export async function start() {
  return connect()
}
