import { createServer } from '@metrics/index'
import * as influx from '@metrics/influxdb/client'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'

const readPoints = influx.readPoints as jest.Mock

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
    readPoints.mockResolvedValue([
      {
        total: 28334,
        gender: 'male'
      },
      {
        total: 28124,
        gender: 'female'
      }
    ])

    const res = await server.server.inject({
      method: 'GET',
      url:
        '/metrics/birth?timeStart=1552469068679&timeEnd=1554814894419&locationId=Location/b21ce04e-7ccd-4d65-929f-453bc193a736',
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

  it('returns empty keyfigure if no matching data found', async () => {
    readPoints.mockResolvedValue(null)

    const res = await server.server.inject({
      method: 'GET',
      url:
        '/metrics/birth?timeStart=1552469068679&timeEnd=1554814894419&locationId=Location/b21ce04e-7ccd-4d65-929f-453bc193a736',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(200)
  })
})
