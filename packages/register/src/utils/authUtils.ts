import * as decode from 'jwt-decode'

export interface IURLParams {
  [key: string]: string
}
export interface ITokenProfile {
  subject: string
  exp: string
  algorithm: string
  role: string
}

export const isTokenStillValid = (token: string, localToken?: boolean) => {
  try {
    const decoded: ITokenProfile = getProfile(token)
    if (Number(decoded.exp) * 1000 > Date.now()) {
      return true
    } else {
      if (localToken) {
        localStorage.removeItem('opencrvs')
      }
      return false
    }
  } catch (err) {
    return false
  }
}

export const getProfile = (token: string): ITokenProfile => decode(token)

export const loggedIn = (urlParams: IURLParams): string => {
  const localToken = checkLocalToken()
  if (Boolean(localToken)) {
    return localToken
  }
  const urlToken = checkURLToken(urlParams)
  if (Boolean(urlToken)) {
    return urlToken
  }
  return ''
}

const checkLocalToken = (): string => {
  const localToken = localStorage.getItem('opencrvs')
  if (localToken) {
    if (isTokenStillValid(localToken, true)) {
      return localToken
    } else {
      return ''
    }
  } else {
    return ''
  }
}

const checkURLToken = (urlParams: IURLParams): string => {
  const urlToken = urlParams.token
  if (urlToken) {
    if (isTokenStillValid(urlToken)) {
      localStorage.setItem('opencrvs', urlToken)
      return urlToken
    } else {
      return ''
    }
  } else {
    return ''
  }
}
