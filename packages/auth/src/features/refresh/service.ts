import {
  createToken,
  ITokenPayload,
  getTokenAudience
} from '../authenticate/service'

export async function refreshToken(payload: ITokenPayload): Promise<string> {
  return createToken(payload.sub, payload.role, getTokenAudience(payload.role))
}
