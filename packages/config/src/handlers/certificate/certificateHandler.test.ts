/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { createServer } from '@config/server'
import Certificate, { ICertificateModel } from '@config/models/certificate'
import * as fetchMock from 'jest-fetch-mock'
import * as mockingoose from 'mockingoose'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

export enum Event {
  BIRTH = 'birth',
  DEATH = 'death',
  MARRIAGE = 'marriage'
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

const mockCertificate = {
  svgCode: 'ocrvs/1234-6789.svg',
  svgFilename: 'ocrvs.svg',
  user: 'dde0846b-4b0f-4732-80e7-b0f06444fef5',
  event: 'birth',
  status: 'ACTIVE'
} as unknown as ICertificateModel

describe('createCertificate handler', () => {
  let server: any
  const svgCode = 'ocrvs/1234-6789.svg'

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

  it('get active certificate for marriage using mongoose', async () => {
    mockingoose(Certificate).toReturn(mockCertificate, 'findOne')

    const res = await server.server.inject({
      method: 'POST',
      url: '/getCertificate',
      payload: {
        status: 'ACTIVE',
        event: 'marriage'
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

    expect(res.statusCode).toBe(404)
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
