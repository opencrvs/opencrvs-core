import { createServer } from '../..'
import * as facilitiesService from 'src/features/facilities/service/service'

describe('facilities handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  describe('service returns facilities json to client', () => {
    it('returns a facilities array', async () => {
      jest
        .spyOn(facilitiesService, 'getFacilities')
        .mockReturnValue(
          '{"data":[{"id":"3fadd4e1-bcfd-470b-a997-07bc09631e2c","name":"Moktarpur Union Parishad","nameBn":"মোক্তারপুর ইউনিয়ন পরিষদ","physicalType":"Building","type":"CRVS_OFFICE","partOf":"Location/9ce9fdba-ae24-467f-87ab-5b5498a0217f"}]}'
        )
      const res = await server.server.inject({
        method: 'GET',
        url: '/facilities'
      })
      expect(JSON.parse(res.payload).data[0].id).toBe(
        '3fadd4e1-bcfd-470b-a997-07bc09631e2c'
      )
    })
  })
})
