import { createToken } from '../authenticate/service'
import { WEB_USER_JWT_AUDIENCES, JWT_ISSUER } from 'src/constants'

export interface IDecodedToken {
  roles: string[]
  iat: string
  exp: string
  sub: string
}

export async function refreshToken(payload: IDecodedToken): Promise<string> {
  return createToken(
    payload.sub,
    payload.roles,
    WEB_USER_JWT_AUDIENCES,
    JWT_ISSUER
  )
}
