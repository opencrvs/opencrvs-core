/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { createServer } from '@config/index'
import Certificate, { ICertificateModel } from '@config/models/Certificate'
import * as fetchMock from 'jest-fetch-mock'
import mockingoose from 'mockingoose'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

export enum Event {
  BIRTH = 'birth',
  DEATH = 'death'
}
export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

const token = jwt.sign(
  { scope: ['natlsysadmin'] },
  readFileSync('../auth/test/cert.key'),
  {
    algorithm: 'RS256',
    issuer: 'opencrvs:auth-service',
    audience: 'opencrvs:config-user'
  }
)

const fetch = fetchMock as fetchMock.FetchMock

let mockCertificate = {
  svgCode: `<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
  width="200.000000pt" height="200.000000pt" viewBox="0 0 200.000000 200.000000"
  preserveAspectRatio="xMidYMid meet">

 <g transform="translate(0.000000,200.000000) scale(0.100000,-0.100000)"
 fill="#000000" stroke="none">
 <path d="M15 1970 c-13 -25 -15 -147 -15 -977 0 -842 2 -951 16 -971 l15 -22
 969 0 969 0 15 22 c14 20 16 129 16 978 0 849 -2 958 -16 978 l-15 22 -969 0
 -969 0 -16 -30z m1615 -625 c0 -271 -1 -286 -20 -305 -20 -20 -20 -19 -22 263
 l-3 282 -274 3 c-272 2 -274 2 -256 22 17 19 32 20 297 20 l278 0 0 -285z
 m-1216 -356 l3 -574 603 -5 c571 -5 601 -6 583 -22 -18 -16 -65 -18 -624 -18
 l-604 -1 -3 582 c-2 532 -1 584 15 601 9 10 18 16 20 14 2 -2 5 -262 7 -577z
 m386 214 c26 -33 23 -92 -6 -124 -27 -30 -87 -26 -113 7 -28 35 -28 93 -1 122
 31 33 92 30 120 -5z m174 11 c35 -34 11 -86 -39 -86 -22 0 -25 -5 -25 -34 0
 -27 -4 -34 -20 -34 -18 0 -20 7 -20 85 l0 85 44 0 c27 0 51 -6 60 -16z m166 1
 c0 -10 -11 -15 -35 -15 -28 0 -35 -4 -35 -20 0 -15 7 -20 25 -20 16 0 25 -6
 25 -15 0 -9 -9 -15 -25 -15 -16 0 -25 -6 -25 -15 0 -10 11 -15 35 -15 28 0 35
 -4 35 -20 0 -18 -7 -20 -55 -20 l-55 0 0 85 0 85 55 0 c42 0 55 -3 55 -15z
 m115 -25 c26 -58 38 -60 34 -6 -4 39 -1 46 13 46 16 0 18 -11 18 -85 0 -74 -2
 -85 -18 -85 -10 0 -27 18 -42 47 l-25 48 -3 -48 c-3 -39 -6 -48 -20 -45 -14 3
 -17 17 -18 86 -2 79 -1 82 21 82 16 0 27 -11 40 -40z m-464 -291 c28 -28 11
 -49 -24 -30 -38 21 -62 11 -65 -27 -5 -54 31 -80 67 -48 11 10 22 12 31 6 12
 -7 12 -11 0 -25 -23 -28 -60 -37 -93 -24 -51 22 -64 103 -22 144 30 31 77 33
 106 4z m181 4 c21 -19 23 -42 4 -68 -11 -16 -11 -23 7 -53 l20 -34 -24 4 c-13
 1 -29 14 -35 26 -23 46 -34 49 -34 9 0 -30 -4 -37 -20 -37 -18 0 -20 7 -20 78
 0 43 3 82 7 85 13 13 77 7 95 -10z m117 -43 l17 -55 15 55 c10 35 22 56 32 58
 11 2 17 -3 16 -15 -1 -28 -43 -155 -52 -154 -4 1 -13 1 -21 1 -8 0 -22 29 -35
 73 -25 86 -26 99 -5 95 10 -2 23 -24 33 -58z m215 44 c21 -21 11 -36 -20 -28
 -34 9 -30 -12 6 -31 25 -13 30 -22 30 -50 0 -40 -27 -60 -66 -51 -30 8 -52 45
 -33 57 8 5 20 2 32 -8 12 -11 21 -13 28 -6 7 7 -1 19 -26 37 -38 29 -44 55
 -19 80 20 20 48 20 68 0z"/>
 <path d="M712 1188 c-20 -20 -15 -76 7 -88 25 -13 27 -13 45 6 31 30 15 94
 -24 94 -9 0 -21 -5 -28 -12z"/>
 <path d="M910 1181 c0 -15 6 -21 21 -21 14 0 19 5 17 17 -5 26 -38 29 -38 4z"/>
 <path d="M910 864 c0 -9 7 -14 17 -12 25 5 28 28 4 28 -12 0 -21 -6 -21 -16z"/>
 </g>
 </svg>`,
  svgFilename: 'ocrvs.svg',
  user: 'dde0846b-4b0f-4732-80e7-b0f06444fef5',
  event: 'birth',
  status: 'ACTIVE'
} as unknown as ICertificateModel

describe('createCertificate handler', () => {
  let server: any
  const svgCode = `<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
  width="200.000000pt" height="200.000000pt" viewBox="0 0 200.000000 200.000000"
  preserveAspectRatio="xMidYMid meet">

 <g transform="translate(0.000000,200.000000) scale(0.100000,-0.100000)"
 fill="#000000" stroke="none">
 <path d="M15 1970 c-13 -25 -15 -147 -15 -977 0 -842 2 -951 16 -971 l15 -22
 969 0 969 0 15 22 c14 20 16 129 16 978 0 849 -2 958 -16 978 l-15 22 -969 0
 -969 0 -16 -30z m1615 -625 c0 -271 -1 -286 -20 -305 -20 -20 -20 -19 -22 263
 l-3 282 -274 3 c-272 2 -274 2 -256 22 17 19 32 20 297 20 l278 0 0 -285z
 m-1216 -356 l3 -574 603 -5 c571 -5 601 -6 583 -22 -18 -16 -65 -18 -624 -18
 l-604 -1 -3 582 c-2 532 -1 584 15 601 9 10 18 16 20 14 2 -2 5 -262 7 -577z
 m386 214 c26 -33 23 -92 -6 -124 -27 -30 -87 -26 -113 7 -28 35 -28 93 -1 122
 31 33 92 30 120 -5z m174 11 c35 -34 11 -86 -39 -86 -22 0 -25 -5 -25 -34 0
 -27 -4 -34 -20 -34 -18 0 -20 7 -20 85 l0 85 44 0 c27 0 51 -6 60 -16z m166 1
 c0 -10 -11 -15 -35 -15 -28 0 -35 -4 -35 -20 0 -15 7 -20 25 -20 16 0 25 -6
 25 -15 0 -9 -9 -15 -25 -15 -16 0 -25 -6 -25 -15 0 -10 11 -15 35 -15 28 0 35
 -4 35 -20 0 -18 -7 -20 -55 -20 l-55 0 0 85 0 85 55 0 c42 0 55 -3 55 -15z
 m115 -25 c26 -58 38 -60 34 -6 -4 39 -1 46 13 46 16 0 18 -11 18 -85 0 -74 -2
 -85 -18 -85 -10 0 -27 18 -42 47 l-25 48 -3 -48 c-3 -39 -6 -48 -20 -45 -14 3
 -17 17 -18 86 -2 79 -1 82 21 82 16 0 27 -11 40 -40z m-464 -291 c28 -28 11
 -49 -24 -30 -38 21 -62 11 -65 -27 -5 -54 31 -80 67 -48 11 10 22 12 31 6 12
 -7 12 -11 0 -25 -23 -28 -60 -37 -93 -24 -51 22 -64 103 -22 144 30 31 77 33
 106 4z m181 4 c21 -19 23 -42 4 -68 -11 -16 -11 -23 7 -53 l20 -34 -24 4 c-13
 1 -29 14 -35 26 -23 46 -34 49 -34 9 0 -30 -4 -37 -20 -37 -18 0 -20 7 -20 78
 0 43 3 82 7 85 13 13 77 7 95 -10z m117 -43 l17 -55 15 55 c10 35 22 56 32 58
 11 2 17 -3 16 -15 -1 -28 -43 -155 -52 -154 -4 1 -13 1 -21 1 -8 0 -22 29 -35
 73 -25 86 -26 99 -5 95 10 -2 23 -24 33 -58z m215 44 c21 -21 11 -36 -20 -28
 -34 9 -30 -12 6 -31 25 -13 30 -22 30 -50 0 -40 -27 -60 -66 -51 -30 8 -52 45
 -33 57 8 5 20 2 32 -8 12 -11 21 -13 28 -6 7 7 -1 19 -26 37 -38 29 -44 55
 -19 80 20 20 48 20 68 0z"/>
 <path d="M712 1188 c-20 -20 -15 -76 7 -88 25 -13 27 -13 45 6 31 30 15 94
 -24 94 -9 0 -21 -5 -28 -12z"/>
 <path d="M910 1181 c0 -15 6 -21 21 -21 14 0 19 5 17 17 -5 26 -38 29 -38 4z"/>
 <path d="M910 864 c0 -9 7 -14 17 -12 25 5 28 28 4 28 -12 0 -21 -6 -21 -16z"/>
 </g>
 </svg>`

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('creates and saves new certificate using mongoose', async () => {
    mockingoose(Certificate).toReturn(mockCertificate, 'save')

    const res = await server.server.inject({
      method: 'POST',
      url: '/createCertificate',
      payload: {
        svgCode: svgCode,
        svgFilename: 'sample_doc.jpeg',
        user: 'dde0846b-4b0f-4732-80e7-b0f06444fef5',
        event: 'birth',
        status: 'ACTIVE'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(201)
  })

  it('returns error when tries to saves invalid svg code using mongoose', async () => {
    mockingoose(Certificate).toReturn(mockCertificate, 'save')

    const res = await server.server.inject({
      method: 'POST',
      url: '/createCertificate',
      payload: {
        svgCode: 1123,
        svgFilename: 'sample_doc.jpeg',
        user: 'dde0846b-4b0f-4732-80e7-b0f06444fef5',
        event: 'birth',
        status: 'ACTIVE'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(400)
  })
})

describe('getCertificate handler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('get active certificate for birth using mongoose', async () => {
    mockingoose(Certificate).toReturn(mockCertificate, 'findOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/getCertificate',
      payload: {
        status: 'ACTIVE',
        event: 'birth'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })

  it('return no result found for active death certificate', async () => {
    mockingoose(Certificate).toReturn(null, 'findOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/getCertificate',
      payload: {
        status: 'ACTIVE',
        event: 'death'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(res.statusCode).toBe(204)
  })
})

describe('getActiveCertificates handler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('get active certificate for birth and death using mongoose', async () => {
    mockingoose(Certificate).toReturn(mockCertificate, 'find')

    const res = await server.server.inject({
      method: 'GET',
      url: '/getActiveCertificates',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(200)
  })
})

describe('updateCertificate handler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('update certificate to inactive using mongoose', async () => {
    mockCertificate.id = '61c4664e663fc6af203b63b8'
    mockingoose(Certificate).toReturn(mockCertificate, 'findOne')
    mockingoose(Certificate).toReturn(mockCertificate, 'update')

    const res = await server.server.inject({
      method: 'POST',
      url: '/updateCertificate',
      payload: {
        id: '61c4664e663fc6af203b63b8',
        status: 'INACTIVE'
      },
      headers: {
        Authorization: `${token}`
      }
    })
    expect(res.statusCode).toBe(201)
  })

  it('return error when tries to save invalid data', async () => {
    mockingoose(Certificate).toReturn(null, 'findOne')
    mockingoose(Certificate).toReturn({}, 'update')

    const res = await server.server.inject({
      method: 'POST',
      url: '/getCertificate',
      payload: {
        id: '61c4664e663fc6af203b63b8',
        svgFilename: 1234
      },
      headers: {
        Authorization: `${token}`
      }
    })

    expect(res.statusCode).toBe(400)
  })
})

describe('deleteCertificate handler', () => {
  let server: any

  beforeEach(async () => {
    mockingoose.resetAll()
    server = await createServer()
    fetch.resetMocks()
  })

  it('delete an exsisting certificate using mongoose', async () => {
    mockCertificate.id = '61c4664e663fc6af203b63b8'
    mockingoose(Certificate).toReturn({}, 'findOneAndRemove')

    const res = await server.server.inject({
      method: 'DELETE',
      url: '/certificate/61c4664e663fc6af203b63b8',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(res.statusCode).toBe(204)
  })

  it('return error when there is no param', async () => {
    mockingoose(Certificate).toReturn({}, 'findOneAndRemove')

    const res = await server.server.inject({
      method: 'DELETE',
      url: '/certificate'
    })

    expect(res.statusCode).toBe(404)
  })
})
