import { createToken, ITokenPayload } from '../authenticate/service'
import { WEB_USER_JWT_AUDIENCES, JWT_ISSUER } from 'src/constants'

export async function refreshToken(payload: ITokenPayload): Promise<string> {
  return createToken(
    payload.sub,
    payload.claims,
    WEB_USER_JWT_AUDIENCES,
    JWT_ISSUER
  )
}
