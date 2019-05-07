import { post } from 'k6/http'
import { AUTH_URL } from './constants.js'

export function fetchToken(username, password) {
  const resAuth = post(
    `${AUTH_URL}/authenticate`,
    JSON.stringify({
      mobile: username,
      password: password
    })
  )
  const body = resAuth.json()

  const resVerify = post(
    `${AUTH_URL}/verifyCode`,
    JSON.stringify({
      nonce: body.nonce,
      code: '000000'
    })
  )
  return resVerify.json().token
}
