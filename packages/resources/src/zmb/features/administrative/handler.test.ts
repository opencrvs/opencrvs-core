import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { createServer } from '@resources/index'
import * as locationsService from '@resources/zmb/features/administrative/service/service'

describe('administrative handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  describe('service returns locations json to client', () => {
    const mockReturn: locationsService.ILocationDataResponse = {
      data: [
        {
          id: 'ba819b89-57ec-4d8b-8b91-e8865579a40f',
          name: 'Barisal',
          alias: 'বরিশাল',
          physicalType: 'Jurisdiction',
          jurisdictionType: 'DIVISION',
          type: 'ADMIN_STRUCTURE',
          partOf: 'Location/0'
        }
      ]
    }
    it('returns a location array', async () => {
      jest
        .spyOn(locationsService, 'getLocations')
        .mockReturnValue(Promise.resolve(mockReturn))

      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:resources-user'
      })

      const res = await server.server.inject({
        method: 'GET',
        url: '/zmb/locations',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(JSON.parse(res.payload).data[0].id).toBe(
        'ba819b89-57ec-4d8b-8b91-e8865579a40f'
      )
    })
  })
})
