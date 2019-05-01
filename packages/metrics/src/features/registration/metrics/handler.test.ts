import { createServer } from '../../..'
import { readPoints } from '../../../influxdb/client'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'

jest.mock('../../../influxdb/client.ts')

describe('verify metrics handler', () => {
  let server: any

  const token = jwt.sign(
    { scope: ['declare'] },
    readFileSync('../auth/test/cert.key'),
    {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:metrics-user'
    }
  )

  beforeEach(async () => {
    server = await createServer()
  })

  it('returns ok for valid request', async () => {
    const res = await server.server.inject({
      method: 'GET',
      url:
        '/metrics/birth?timeStart=1552469068679&timeEnd=1554814894419&locationId=43ac3486-7df1-4bd9-9b5e-728054ccd6ba',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })

  it('returns 400 for required params', async () => {
    const res = await server.server.inject({
      method: 'GET',
      url: '/metrics/birth',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(400)
  })

  it('return 500 for exception', async () => {
    readPoints.mockImplementation(() => {
      throw new Error()
    })

    const res = await server.server.inject({
      method: 'GET',
      url:
        '/metrics/birth?timeStart=1552469068679101074&timeEnd=1554814894419279468&locationId=43ac3486-7df1-4bd9-9b5e-728054ccd6ba',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(500)
  })
})
