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
