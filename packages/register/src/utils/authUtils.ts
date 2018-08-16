import * as queryString from 'query-string'
import * as decode from 'jwt-decode'

export interface IURLParams {
  [key: string]: string
}
export interface ITokenPayload {
  subject: string
  exp: string
  algorithm: string
  roles: string[]
}

const isTokenStillValid = (decoded: ITokenPayload) => {
  return Number(decoded.exp) * 1000 > Date.now()
}

function getToken() {
  return (
    localStorage.getItem('opencrvs') ||
    queryString.parse(window.location.search).token
  )
}

export const getTokenPayload = () => {
  const token = getToken()

  if (!token) {
    return null
  }
  let decoded: ITokenPayload
  try {
    decoded = decode(token)
  } catch (err) {
    return null
  }

  if (isTokenStillValid(decoded)) {
    localStorage.setItem('opencrvs', token)
  } else {
    localStorage.removeItem('opencrvs')
    return null
  }

  return decoded
}
