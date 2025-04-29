const REDIS_DEFAULT_PORT = 6379

export function getRedisUrl(
  host: string,
  port = REDIS_DEFAULT_PORT,
  username?: string,
  password?: string
) {
  if (username && password) {
    return `redis://${username}:${password}@${host}:${port}`
  }

  return `redis://${host}:${port}`
}
