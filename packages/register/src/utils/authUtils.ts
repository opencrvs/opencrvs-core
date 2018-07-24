import * as decode from 'jwt-decode'
import { config } from '../config'

export interface ITokenProfile {
  subject: string
  expiresIn: string
  algorithm: string
  body: {
    role: string
  }
}

export const isTokenExpired = (token: string) => {
  try {
    const decoded: ITokenProfile = getProfile(token)
    if (
      Number(decoded.expiresIn) <
      Date.now() / Number(config.CONFIG_TOKEN_EXPIRY)
    ) {
      return true
    } else {
      return false
    }
  } catch (err) {
    return false
  }
}

export const getProfile = (token: string): ITokenProfile => decode(token)

export const loggedIn = (): boolean => {
  const token = localStorage.getItem('opencrvs')
  return !!token && !isTokenExpired(token)
}

export const getToken = () => localStorage.getItem('opencrvs')
