import { createServer } from '.'

describe('Route authorization', () => {
  it('blocks requests without a token', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/ping'
    })
    expect(res.statusCode).toBe(401)
  })

  it('blocks requests with an invalid token', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/ping',
      headers: {
        Authorization: 'Bearer abc'
      }
    })
    expect(res.statusCode).toBe(401)
  })

  it('accepts requests with a valid token', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/ping',
      headers: {
        // Generated with "auth" project's generate-test-token command
        Authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjo'
      }
    })

    expect(res.statusCode).toBe(200)
  })

  it('blocks requests with a token with invalid signature', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/ping',
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUyMjgsImV4cCI6MTU0MzE5NTIyNywiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.G4KzkaIsW8fTkkF-O8DI0qESKeBI332UFlTXRis3vJ6daisu06W5cZsgYhmxhx_n0Q27cBYt2OSOnjgR72KGA5IAAfMbAJifCul8ib57R4VJN8I90RWqtvA0qGjV-sPndnQdmXzCJx-RTumzvr_vKPgNDmHzLFNYpQxcmQHA-N8li-QHMTzBHU4s9y8_5JOCkudeoTMOd_1021EDAQbrhonji5V1EOSY2woV5nMHhmq166I1L0K_29ngmCqQZYi1t6QBonsIowlXJvKmjOH5vXHdCCJIFnmwHmII4BK-ivcXeiVOEM_ibfxMWkAeTRHDshOiErBFeEvqd6VWzKvbKAH0UY-Rvnbh4FbprmO4u4_6Yd2y2HnbweSo-v76dVNcvUS0GFLFdVBt0xTay-mIeDy8CKyzNDOWhmNUvtVi9mhbXYfzzEkwvi9cWwT1M8ZrsWsvsqqQbkRCyBmey_ysvVb5akuabenpPsTAjiR8-XU2mdceTKqJTwbMU5gz-8fgulbTB_9TNJXqQlH7tyYXMWHUY3uiVHWg2xgjRiGaXGTiDgZd01smYsxhVnPAddQOhqZYCrAgVcT1GBFVvhO7CC-rhtNlLl21YThNNZNpJHsCgg31WA9gMQ_2qAJmw2135fAyylO8q7ozRUvx46EezZiPzhCkPMeELzLhQMEIqjd'
      }
    })
    expect(res.statusCode).toBe(401)
  })

  it('blocks requests with expired token', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/ping',
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUzMTYsImV4cCI6MTUzMzE5NTIxNiwiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.sibbska3KxUIR4Tm6X3wBcRj8YwvJM_hxNe7BwC0Wqn--0jiIuS8Eehsvpfani1jNbyjkO9lJhXmYpysfqje_XvE-XsAaED9EhuNMmjrsCxjy-H4aviufnH5Ek0pWjApG9Ku5IywyMugnNYFMm0rcZYLhbupoYA7iuHvSUsZvkG82FzMVTT-PBZUYAd5pmxBLFEDGfjr0XCL_CzX_jmAGLypyiIdMkvS5XxmN7V_PG0shVu2BLIBc2YcinGQHDltpPbJwsTTe3BUG1XEpK9TfBtuVJDabK-YjhIfOloI6rWBNpdbcAxoQ3IC04Jwhh09wbbD731y0xw7tRh-hXaCzChBCCqk2LJFiCnlxu0an_2oturbAmKOGxShplr_zvZrGkqw4r7QoPX3OEvtYLa4RJhozc1mhnmZ_PmW14FZv-v-pDhML7XQ3nffng0REE8GjWNSAMOAn4Ig5DKA0fJKxXv5BqmOLILGmRsdv28WLv1b3jXFtkNp3gNT4EYPQrqGncC93tdpAtjaohcBfKr_ZO-U8BlpF7XkWXbFWZyMwni0AIR4sjs5eOX1K7AGK3ig5y3xWdBnzHCYUvtrDqg0GMEAjhYCKoU6vc21I1ihJwYrLSRUDuUe_iTzaowrsEYknNIhrIWqMDPC3tI-2PVkXZqk7driKyB74jmQIvceTRg'
      }
    })
    expect(res.statusCode).toBe(401)
  })
  it('blocks requests signed with wrong algorithm (HS512)', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/ping',
      headers: {
        Authorization:
          // Header: { "alg": "HS512", "typ": "JWT" }
          // Payload: {"role":"admin","iat":1533195372,"exp":1543195371,"aud":["gateway"],"sub":"1"}
          // Secret: test/cert.key.pub
          'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxOTUzNzIsImV4cCI6MTU0MzE5NTM3MSwiYXVkIjpbImdhdGV3YXkiXSwic3ViIjoiMSJ9.ep--vUK-cCkB6jt5-22ZHO9pk8gWUv3RagYE2jfzV1WFH3s2RN4JUrHrkAmWIzjPwHWZ_De1makYJ5TyNUCcyQ'
      }
    })
    expect(res.statusCode).toBe(401)
  })
})
