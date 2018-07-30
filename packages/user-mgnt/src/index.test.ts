import { createServer } from './index'
import * as database from './database'

// tslint:disable-next-line no-empty
const noop = () => {}

const { start, stop } = database

beforeEach(() => {
  // @ts-ignore
  database.start = noop
  // @ts-ignore
  database.stop = noop
})

afterEach(() => {
  // @ts-ignore
  database.start = start
  // @ts-ignore
  database.stop = stop
})

test('should start and stop server without error', async () => {
  const server = await createServer()

  // @ts-ignore
  server.server.start = noop
  // @ts-ignore
  server.server.stop = noop

  await server.start()
  await server.stop()
})

describe('Route authorization', () => {
  it('blocks requests without a token', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/check-token'
    })
    expect(res.statusCode).toBe(401)
  })

  it('blocks requests with an invalid token', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/check-token',
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
      url: '/check-token',
      headers: {
        // Generated with "auth" project's test cert
        Authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzI2OTM1MjEsImV4cCI6MjQ3OTQwMTkwMSwic3ViIjoiMSJ9.G4WYYnPZSnhMcnwsvODxlqSvYwBgVxvSRef94iVN8SDsHEfmJ0px3Gs-ezgZrgpNESMvLsdsWXGSFsAjqBielGRy7Cay-k7NTq-sFgDakrQq_6fTqAxEVnduaOjJr8BGciWh6raciw-IHLgB7evB314aiL-fr_P_Z76HhRRGLX11QSLYp2NHNO2uk-Quhq5OvMltZl35YUrmqyC_NCxds25YqM-zm2taRvohzvZ6ivTLPhBVxcNb00X93P3Sy3jyCqz2OmexsoGb9J-yFF6W5k5HGydYVGsiYSiGjwVMgi6upSwS3c_EHQtxN7P80axhUBttcqO0MF6q3D24Y3chbB0eyHbX4vJ0tbo37U80FRAi2FKgx3_RRmjhTkLa4h_RWovAaInNvyhDlG9yIJ6TaVXs08j2gUtlLmaAvWjf1-Fa5dGJ5jE272BXADg_EGfdYoF07eZsy_vxDw0KJKcyxVrJCKm8co0To1Nbf-mvIA00PzFgFJfTW0PamlsPMO6Lt1IE6UXnla-pz4k-Sg9vgcXyECqwN4PQPCjGIxknZ8_1UhcEyzM16gQz3G2HH6ybKzzAVBdGX0t3tttaBwegDBmx-LKBIlsVtDXm6CeOrB9TL20bUpod_M2Mk0KGOkf2479YF-kqx7TBz97QNsE38_7YS3JUBnUQKkl583vDO0Q'
      }
    })

    expect(res.statusCode).toBe(200)
  })

  it('blocks requests with a token with invalid signature', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/check-token',
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzI2OTM1MjEsImV4cCI6MjQ3OTQwMTkwMSwic3ViIjoiMSJ9.G4WYYnPZSnhMcnwsvODxlqSvYwBgVxvSRef94iVN8SDsHEfmJ0px3Gs-ezgZrgpNESMvLsdsWXGSFsAjqBielGRy7Cay-k7NTq-sFgDakrQq_6fTqAxEVnduaOjJr8BGciWh6raciw-IHLgB7evB314aiL-fr_P_Z76HhRRGLX11QSLYp2NHNO2uk-Quhq5OvMltZl35YUrmqyC_NCxds25YqM-zm2taRvohzvZ6ivTLPhBVxcNb00X93P3Sy3jyCqz2OmexsoGb9J-yFF6W5k5HGydYVGsiYSiGjwVMgi6upSwS3c_EHQtxN7P80axhUBttcqO0MF6q3D24Y3chbB0eyHbX4vJ0tbo37U80FRAi2FKgx3_RRmjhTkLa4h_RWovAaInNvyhDlG9yIJ6TaVXs08j2gUtlLmaAvWjf1-Fa5dGJ5jE272BXADg_EGfdYoF07eZsy_vxDw0KJKcyxVrJCKm8co0To1Nbf-mvIA00PzFgFJfTW0PamlsPMO6Lt1IE6UXnla-pz4k-Sg9vgcXyECqwN4PQPCjGIxknZ8_1UhcEyzM16gQz3G2HH6ybKzzAVBdGX0t3tttaBwegDBmx-LKBIlsVtDXm6CeOrB9TL20bUpod_M2Mk0KGOkf2479YF-kqx7TBz97QNsE38_7YS3JUBnUQKkl583vDO0s'
      }
    })
    expect(res.statusCode).toBe(401)
  })

  it('blocks requests with expired token', async () => {
    const server = await createServer()
    const res = await server.server.inject({
      method: 'GET',
      url: '/check-token',
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzI5Mzc2ODMsImV4cCI6MTUzMjkzNzA4Mywic3ViIjoiMSJ9.Ua4FPpLjI_U3DsGHGbC56BfugHDH5xohv9eLB8IZfDukJ-XoMyLryHltYG7tp3a4aLA1gFuMT5naYfvHKr04Mt8M5opLjGeTKWU6qVONw0Y-CMGxeQn8nLD3fNHfZRkvSX8hRfHeTZKKnfzDJ6Gy-g8sIAI3jO4X98oZcSc9tLptczwOkHsm8ZRzFLIpDVSwAVfTnsLC-SEPDg4qqSrw1iUujJvlQYhpPH8lCCj9d7omGssVkXdafB9aMAkvgB27YUhKrsDg7W_ptuPRrWAx1y9DmhlabX1Xl3p-HcIxaRbleYNdeH30Qv80zEFFAJF3lmYegKA3QR-XdRhyKf47jY6YSv9lXsYEEB663F3pkZ7THcn2MuGwlCucQJel16bO83XpVx4AWDMiaLFgJ_r4xl4YYcrt8q0HW1xiFHQmGO-9MkTnrObp0csUamA_zoJuIc061OTK1FDZs1sqImFDcgEYq5DS23g_oscINVKV6O91F3XEVvwkVeXmwIAwzfMWDPNWe3Jmbo9vjbDwM1Pn1uP7zhQASJGPihRc0o2ISYj5YBXqJalCS0bPsOxooyxbplj5SSk6hbECkc-HGk2hQ25onohohzkuJQ3L1jww_e2kNP-6oiezOiYeCufo10mviCyskRyhFcLJhEAnU6CL0LDfOVjNUGrgqWTXDdyiRXY'
      }
    })
    expect(res.statusCode).toBe(401)
  })
})
