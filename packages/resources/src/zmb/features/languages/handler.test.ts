import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { createServer } from '@resources/index'
import * as languagesService from '@resources/zmb/features/languages/service/service'

describe('languages handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  describe('service returns languages json to client', () => {
    const mockReturn: languagesService.ILanguageDataResponse = {
      data: [
        {
          lang: 'en',
          displayName: 'English',
          messages: {
            'birth.form.section.child.name': 'Child',
            'birth.form.section.child.title': "Child's details"
          }
        }
      ]
    }
    it('returns a languages array', async () => {
      jest
        .spyOn(languagesService, 'getLanguages')
        .mockReturnValue(Promise.resolve(mockReturn))
      const token = jwt.sign({}, readFileSync('../auth/test/cert.key'), {
        algorithm: 'RS256',
        issuer: 'opencrvs:auth-service',
        audience: 'opencrvs:resources-user'
      })

      const res = await server.server.inject({
        method: 'GET',
        url: '/zmb/languages/register',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      expect(JSON.parse(res.payload).data[0].displayName).toBe('English')
    })
  })
})
