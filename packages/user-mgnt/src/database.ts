import * as mongoose from 'mongoose'

import { MONGO_URL } from './constants'
import { logger } from 'src/logger'

const db = mongoose.connection

const connect = () =>
  mongoose.connect(
    MONGO_URL,
    { server: { auto_reconnect: true } }
  )

const onError = (error: Error) => {
  logger.error(error)
  mongoose.disconnect()
}

export async function stop() {
  db.off('error', onError)
  db.off('disconnected', connect)
  db.once('disconnected', () => {
    logger.info('MongoDB disconnected')
  })
  mongoose.disconnect()
}

export async function start() {
  db.on('error', onError)
  db.on('disconnected', connect)
  db.once('connected', () => {
    logger.info('Connected to MongoBD')
  })
  connect()
}
