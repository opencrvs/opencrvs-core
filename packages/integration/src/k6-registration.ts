import { group, check } from 'k6'
import { post } from 'k6/http'
import genReg from './gen-registration.js'
import { API_URL, AUTH_URL } from './constants.js'

export const options = {
  vus: 10,
  duration: '30s'
}

export function setup() {
  const resAuth = post(
    `${AUTH_URL}/authenticate`,
    JSON.stringify({
      mobile: '+8801733333333',
      password: 'test'
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
  return { token: resVerify.json().token }
}

export default data => {
  group('Birth Registration', () => {
    const reg = genReg({ femaleRate: 0.45 })
    const res = post(API_URL, JSON.stringify(reg), {
      headers: {
        'Content-Type': 'application/fhir+json',
        Authorization: `Bearer ${data.token}`
      }
    })
    check(res, {
      'is status 200': r => r.status === 200
    })
  })
}
