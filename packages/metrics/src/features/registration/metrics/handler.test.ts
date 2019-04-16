import { createServer } from '../../..'
import { readPoints } from '../../../influxdb/client'

jest.mock('../../../influxdb/client.ts')

describe('verify metrics handler', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('returns ok for valid request', async () => {
    const res = await server.server.inject({
      method: 'GET',
      url:
        '/metrics/birth?timeStart=1552469068679101074&timeEnd=1554814894419279468'
    })

    expect(res.statusCode).toBe(200)
  })

  it('returns 400 for required params', async () => {
    const res = await server.server.inject({
      method: 'GET',
      url: '/metrics/birth'
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
        '/metrics/birth?timeStart=1552469068679101074&timeEnd=1554814894419279468'
    })

    expect(res.statusCode).toBe(500)
  })
})
