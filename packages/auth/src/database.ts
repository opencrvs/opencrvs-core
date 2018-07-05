import * as redis from 'redis'
import { REDIS_HOST } from './constants'
import { promisify } from 'util'

let redisClient: redis.RedisClient

export interface IDatabaseConnector {
  stop: () => void
  start: () => void
  set: (key: string, value: string) => Promise<void>
  get: (key: string) => Promise<string | null>
}

async function stop() {
  redisClient.quit()
}

async function start() {
  redisClient = redis.createClient({
    host: REDIS_HOST,
    retry_strategy: options => {
      return 1000
    }
  })
}

const get = (key: string) => promisify(redisClient.get).bind(redisClient)(key)

const set = (key: string, value: string) =>
  promisify(redisClient.set).bind(redisClient)(key, value)

const connector: IDatabaseConnector = { set, get, stop, start }

export default connector
