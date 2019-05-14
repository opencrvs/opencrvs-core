import { get } from 'src/database'
import { INVALID_TOKEN_NAMESPACE } from 'src/constants'

export async function verifyToken(token: string) {
  const record = await get(`${INVALID_TOKEN_NAMESPACE}:${token}`)
  return record === null
}
