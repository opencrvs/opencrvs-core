import { group, check } from 'k6'
import { post } from 'k6/http'
import genReg from './gen-registration.js'
import { API_URL } from './constants.js'

export const options = {
  vus: 10,
  duration: '30s'
}

export default () => {
  group('Birth Registration', () => {
    const reg = genReg({ femaleRate: 0.45 })
    const res = post(API_URL, JSON.stringify(reg), {
      headers: {
        'Content-Type': 'application/fhir+json',
        Authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJkZWNsYXJlIiwiZGVtbyJdLCJpYXQiOjE1NTcxNDgxNTEsImV4cCI6MTU1Nzc1Mjk1MSwiYXVkIjpbIm9wZW5jcnZzOmF1dGgtdXNlciIsIm9wZW5jcnZzOnVzZXItbWdudC11c2VyIiwib3BlbmNydnM6aGVhcnRoLXVzZXIiLCJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJvcGVuY3J2czpub3RpZmljYXRpb24tdXNlciIsIm9wZW5jcnZzOndvcmtmbG93LXVzZXIiLCJvcGVuY3J2czpzZWFyY2gtdXNlciIsIm9wZW5jcnZzOm1ldHJpY3MtdXNlciIsIm9wZW5jcnZzOnJlc291cmNlcy11c2VyIl0sImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSIsInN1YiI6IjVjNzUzNWQ3YjRhMjQwMTU1MmMzYTA5NyJ9.UTXyr_FtA36uGsBj63qa4rHUKttxa-u9johCN4r6VxkhREe7qSC4U1Y1nfDas9QdLNJg_hopzlRDctj1tgGzjsUMHV8K-co6V_TZwsMOU2CI9IW1JsQYZ-SDmWbA40pQHF2IpPOcCxrdia5jGUv11kFpXDRQllp389w3TLtU3zWvhb75W2dMoS994AFirsrF3alne3bPXs1RNUBdJegf1MU-_3VpcSNXNpRIYgBfwox9p7NAeFe743Ccz-2EOVVCb6-mQD7s63oJzYxXJatWLKOD0xMRJqvRHmPmNDB1pUXQjr84fHi0_evHf8I6Z3hlEZS8wvlxdK1QSQPkHom9bg'
      }
    })
    check(res, {
      'is status 200': r => r.status === 200
    })
  })
}
