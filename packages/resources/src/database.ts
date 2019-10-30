import * as mongoose from 'mongoose'

import { MONGO_URL } from '@resources/constants'
import { logger } from '@resources/logger'

const db = mongoose.connection

db.on('disconnected', () => {
  logger.info('MongoDB disconnected')
})

db.on('connected', () => {
  logger.info('Connected to MongoDB')
})

// tslint:disable-next-line
const wait = (time: number) => new Promise(resolve => setTimeout(resolve, time))

export const connect = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URL, { autoReconnect: true })
  } catch (err) {
    logger.error(err)
    await wait(1000)
    return connect()
  }
}

export async function disconnect() {
  mongoose.disconnect()
}
