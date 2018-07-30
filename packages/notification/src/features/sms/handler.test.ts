import * as fetch from 'jest-fetch-mock'
import * as service from './service'
import { createServer } from '../..'

describe('smsHandler', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('returns OK if the sms gets sent', async () => {
    const spy = fetch.once('')

    const res = await server.server.inject({
      method: 'POST',
      url: '/sms',
      payload: { msisdn: '447789778823', message: 'foo' },
      headers: {
        // Generated with "auth" project's test cert
        Authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzI2OTM1MjEsImV4cCI6MjQ3OTQwMTkwMSwic3ViIjoiMSJ9.G4WYYnPZSnhMcnwsvODxlqSvYwBgVxvSRef94iVN8SDsHEfmJ0px3Gs-ezgZrgpNESMvLsdsWXGSFsAjqBielGRy7Cay-k7NTq-sFgDakrQq_6fTqAxEVnduaOjJr8BGciWh6raciw-IHLgB7evB314aiL-fr_P_Z76HhRRGLX11QSLYp2NHNO2uk-Quhq5OvMltZl35YUrmqyC_NCxds25YqM-zm2taRvohzvZ6ivTLPhBVxcNb00X93P3Sy3jyCqz2OmexsoGb9J-yFF6W5k5HGydYVGsiYSiGjwVMgi6upSwS3c_EHQtxN7P80axhUBttcqO0MF6q3D24Y3chbB0eyHbX4vJ0tbo37U80FRAi2FKgx3_RRmjhTkLa4h_RWovAaInNvyhDlG9yIJ6TaVXs08j2gUtlLmaAvWjf1-Fa5dGJ5jE272BXADg_EGfdYoF07eZsy_vxDw0KJKcyxVrJCKm8co0To1Nbf-mvIA00PzFgFJfTW0PamlsPMO6Lt1IE6UXnla-pz4k-Sg9vgcXyECqwN4PQPCjGIxknZ8_1UhcEyzM16gQz3G2HH6ybKzzAVBdGX0t3tttaBwegDBmx-LKBIlsVtDXm6CeOrB9TL20bUpod_M2Mk0KGOkf2479YF-kqx7TBz97QNsE38_7YS3JUBnUQKkl583vDO0Q'
      }
    })

    expect(spy).toHaveBeenCalled()

    expect(res.statusCode).toBe(200)
  })
  it("returns 500 if the sms isn't sent", async () => {
    const spy = jest
      .spyOn(service, 'sendSMS')
      .mockImplementationOnce(() => Promise.reject(new Error()))

    const res = await server.server.inject({
      method: 'POST',
      url: '/sms',
      payload: { msisdn: '447789778823', message: 'foo' },
      headers: {
        // Generated with "auth" project's test cert
        Authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzI2OTM1MjEsImV4cCI6MjQ3OTQwMTkwMSwic3ViIjoiMSJ9.G4WYYnPZSnhMcnwsvODxlqSvYwBgVxvSRef94iVN8SDsHEfmJ0px3Gs-ezgZrgpNESMvLsdsWXGSFsAjqBielGRy7Cay-k7NTq-sFgDakrQq_6fTqAxEVnduaOjJr8BGciWh6raciw-IHLgB7evB314aiL-fr_P_Z76HhRRGLX11QSLYp2NHNO2uk-Quhq5OvMltZl35YUrmqyC_NCxds25YqM-zm2taRvohzvZ6ivTLPhBVxcNb00X93P3Sy3jyCqz2OmexsoGb9J-yFF6W5k5HGydYVGsiYSiGjwVMgi6upSwS3c_EHQtxN7P80axhUBttcqO0MF6q3D24Y3chbB0eyHbX4vJ0tbo37U80FRAi2FKgx3_RRmjhTkLa4h_RWovAaInNvyhDlG9yIJ6TaVXs08j2gUtlLmaAvWjf1-Fa5dGJ5jE272BXADg_EGfdYoF07eZsy_vxDw0KJKcyxVrJCKm8co0To1Nbf-mvIA00PzFgFJfTW0PamlsPMO6Lt1IE6UXnla-pz4k-Sg9vgcXyECqwN4PQPCjGIxknZ8_1UhcEyzM16gQz3G2HH6ybKzzAVBdGX0t3tttaBwegDBmx-LKBIlsVtDXm6CeOrB9TL20bUpod_M2Mk0KGOkf2479YF-kqx7TBz97QNsE38_7YS3JUBnUQKkl583vDO0Q'
      }
    })

    expect(spy).toHaveBeenCalled()
    expect(res.statusCode).toBe(500)
  })
})
