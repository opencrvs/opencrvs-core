import * as decode from 'jwt-decode'

export interface ITokenPayload {
  subject: string
  exp: string
  algorithm: string
  claims: string[]
}

export const getTokenPayload = (token: string) => {
  if (!token) {
    return null
  }
  let decoded: ITokenPayload
  try {
    decoded = decode(token)
  } catch (err) {
    return null
  }

  return decoded
}
