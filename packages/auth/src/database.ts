import * as redis from 'redis'
import { REDIS_HOST } from './constants'
import { promisify } from 'util'

let redisClient: redis.RedisClient

export async function stop() {
  redisClient.quit()
}

export async function start() {
  redisClient = redis.createClient({
    host: REDIS_HOST,
    retry_strategy: options => {
      return 1000
    }
  })
}

export const get = (...args: string[]) =>
  promisify(redisClient.get).bind(redisClient)(...args)

export const set = (...args: string[]) =>
  promisify(redisClient.set).bind(redisClient)(...args)
