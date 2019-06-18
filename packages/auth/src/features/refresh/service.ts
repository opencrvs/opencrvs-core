import { createToken, ITokenPayload } from '@auth/features/authenticate/service'
import { WEB_USER_JWT_AUDIENCES, JWT_ISSUER } from '@auth/constants'

export async function refreshToken(payload: ITokenPayload): Promise<string> {
  return createToken(
    payload.sub,
    payload.scope,
    WEB_USER_JWT_AUDIENCES,
    JWT_ISSUER
  )
}
