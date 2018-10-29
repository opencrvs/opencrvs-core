import { createServer } from '../..'

describe('authenticate handler receives a request', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  describe('administrative structure', () => {
    it('returns a 200 response to client', async () => {
      const res = await server.server.inject({
        method: 'GET',
        url: '/administrative_structure'
      })

      expect(res.statusCode).toBe(200)
    })
  })
})
