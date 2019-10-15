import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { createServer } from '@resources/index'
import * as collectorService from '@resources/bgd/features/certificate/service'

describe('collector fields handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  describe('service returns collector fields json to client', () => {
    const mockReturn: collectorService.IFields = {
      en: {
        firstNames: 'firstNamesEng',
        familyName: 'familyNameEng',
        applicantFirstNames: 'applicantFirstNamesEng',
        applicantFamilyName: 'applicantFamilyNameEng'
      }
    }
    it('returns collector fields object', async () => {
      jest
        .spyOn(collectorService, 'getCollectorFields')
        .mockReturnValue(Promise.resolve(mockReturn))

      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:resources-user'
      })

      const res = await server.server.inject({
        method: 'GET',
        url: '/bgd/collector',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(JSON.parse(res.payload).data.en).toEqual({
        firstNames: 'firstNamesEng',
        familyName: 'familyNameEng',
        applicantFirstNames: 'applicantFirstNamesEng',
        applicantFamilyName: 'applicantFamilyNameEng'
      })
    })
  })
})
