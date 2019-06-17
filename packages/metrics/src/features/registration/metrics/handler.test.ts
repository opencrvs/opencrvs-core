import { createServer } from '@metrics/index'
import { readPoints } from '@metrics/influxdb/client'
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { mocked } from 'ts-jest/utils'
import * as fetchAny from 'jest-fetch-mock'

const fetch = fetchAny as any

jest.mock('@metrics/influxdb/client.ts')

const mockLocation = {
  resourceType: 'Location',
  name: 'Dhaka',
  alias: ['ঢাকা'],
  description: 'division=3',
  status: 'active',
  partOf: {
    reference: 'Location/0'
  },
  extension: [
    {
      url: 'http://opencrvs.org/specs/id/statistics-total-populations',
      valueString:
        '[{"2007":"40383972"},{"2008":"40407624"},{"2009":"40407624"},{"2010":"42156664"},{"2011":"42890545"},{"2012":"43152770"},{"2013":"50723777"},{"2014":"50743648"},{"2015":"34899211"},{"2016":"35461299"},{"2017":"37247123"}]'
    },
    {
      url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
      valueString:
        '[{"2007":"22.1"},{"2008":"20.2"},{"2009":"19.5"},{"2010":"19.7"},{"2011":"19.7"},{"2012":"20.7"},{"2013":"20.6"},{"2014":"19.9"},{"2015":"19.4"},{"2016":"19.1"},{"2017":"17.3"}]'
    }
  ],
  id: 'b21ce04e-7ccd-4d65-929f-453bc193a736'
}

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
    fetch.mockResponse(JSON.stringify(mockLocation))
    mocked(readPoints).mockImplementation(() => {
      return [
        {
          total: 28334,
          gender: 'male'
        },
        {
          total: 28124,
          gender: 'female'
        }
      ]
    })

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
    fetch.mockResponse(JSON.stringify(mockLocation))
    mocked(readPoints).mockImplementation(() => {
      return null
    })

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
