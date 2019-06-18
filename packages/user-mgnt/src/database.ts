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

// tslint:disable-next-line
const wait = (time: number) => new Promise(resolve => setTimeout(resolve, time))

const connect = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URL, { autoReconnect: true })
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
