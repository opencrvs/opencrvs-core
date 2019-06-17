import { setex } from '@auth/database'
import {
  INVALID_TOKEN_NAMESPACE,
  CONFIG_TOKEN_EXPIRY_SECONDS
} from '@auth/constants'

export async function invalidateToken(token: string) {
  return setex(
    `${INVALID_TOKEN_NAMESPACE}:${token}`,
    CONFIG_TOKEN_EXPIRY_SECONDS,
    'INVALID'
  )
}
