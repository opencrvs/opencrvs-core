import { RedisClient } from 'redis'

export async function generateVerificationCode(
  nonce: string,
  mobile: string,
  redisClient: RedisClient
) {
  // TODO lets come back to how these are generated
  const code = Math.round(1000 + Math.random() * 8999).toString()

  await redisClient.set(`verification_${nonce}`, code)
  return code
}

export async function sendVerificationCode(
  mobile: string,
  verificationCode: string
): Promise<void> {
  // TODO
  return undefined
}
