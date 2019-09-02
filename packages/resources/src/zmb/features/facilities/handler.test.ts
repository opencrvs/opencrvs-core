import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { createServer } from '@resources/index'
import * as facilitiesService from '@resources/zmb/features/facilities/service/service'

describe('facilities handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  describe('service returns facilities json to client', () => {
    const mockReturn: facilitiesService.ILocationDataResponse = {
      data: [
        {
          id: '3fadd4e1-bcfd-470b-a997-07bc09631e2c',
          name: 'Moktarpur Union Parishad',
          alias: 'মোক্তারপুর ইউনিয়ন পরিষদ',
          physicalType: 'Building',
          type: 'CRVS_OFFICE',
          partOf: 'Location/0'
        }
      ]
    }
    it('returns a facilities array', async () => {
      jest
        .spyOn(facilitiesService, 'getFacilities')
        .mockReturnValue(Promise.resolve(mockReturn))

      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:resources-user'
      })

      const res = await server.server.inject({
        method: 'GET',
        url: '/zmb/facilities',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(JSON.parse(res.payload).data[0].id).toBe(
        '3fadd4e1-bcfd-470b-a997-07bc09631e2c'
      )
    })
  })
})
