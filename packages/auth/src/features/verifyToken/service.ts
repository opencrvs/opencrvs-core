import { get } from '@auth/database'
import { INVALID_TOKEN_NAMESPACE } from '@auth/constants'

export async function verifyToken(token: string) {
  const record = await get(`${INVALID_TOKEN_NAMESPACE}:${token}`)
  return record === null
}
