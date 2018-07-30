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
  const decoded: ITokenProfile = getProfile(token)
  if (Number(decoded.exp) * 1000 > Date.now()) {
    return true
  } else {
    if (localToken) {
      localStorage.removeItem('opencrvs')
    }
    return false
  }
}

export const getProfile = (token: string): ITokenProfile => decode(token)

export const loggedIn = (urlParams: IURLParams) => {
  const localToken = checkLocalToken()
  if (Boolean(localToken)) {
    return localToken
  }
  const urlToken = checkURLToken(urlParams)
  if (Boolean(urlToken)) {
    return urlToken
  }
  return null
}

const checkLocalToken = () => {
  const localToken = localStorage.getItem('opencrvs')
  if (localToken) {
    if (isTokenStillValid(localToken, true)) {
      return localToken
    } else {
      return null
    }
  } else {
    return null
  }
}

const checkURLToken = (urlParams: IURLParams) => {
  const urlToken = urlParams.token
  if (urlToken) {
    if (isTokenStillValid(urlToken)) {
      localStorage.setItem('opencrvs', urlToken)
      return urlToken
    } else {
      return null
    }
  } else {
    return null
  }
}
