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
import { resolvers } from '@gateway/features/certificate/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import mockCertificate from '../../../test/mockCertificate'

const fetch = fetchAny as any

beforeEach(() => {
  fetch.resetMocks()
})

describe('Certificate root resolvers', () => {
  describe('getCertificateSVG()', () => {
    it('returns a certificate object', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          id: 'ba7022f0ff4822',
          svgCode: mockCertificate,
          svgFilename: 'oCRVS_DefaultZambia_SingleCharacterSet_Birth_v1.svg',
          user: 'jonathan.campbell',
          event: 'death',
          status: 'ACTIVE',
          creationDate: 1559054406433
        })
      )

      const certificateSVG = await resolvers.Query.getCertificateSVG(
        {},
        { user: 'jonathan.campbell' }
      )

      expect(certificateSVG).toBeDefined()
    })
  })

  describe('getActiveCertificatesSVG()', () => {
    it('returns active certificates array for birth and death event', async () => {
      fetch.mockResponseOnce(
        JSON.stringify([
          {
            _d: 'ba7022f0ff4822',
            svgCode: mockCertificate,
            svgFilename: 'oCRVS_DefaultZambia_SingleCharacterSet_Birth_v1.svg',
            user: 'jonathan.campbell',
            event: 'birth',
            status: 'ACTIVE',
            creationDate: 1559054406433
          },
          {
            id: 'ca7022fafd4842',
            svgCode: mockCertificate,
            svgFilename: 'oCRVS_DefaultZambia_SingleCharacterSet_Birth_v1.svg',
            user: 'jonathan.campbell',
            event: 'death',
            status: 'ACTIVE',
            creationDate: 1559054406433
          }
        ])
      )

      const certificateSVG = await resolvers.Query.getActiveCertificatesSVG(
        {},
        { user: 'jonathan.campbell' }
      )

      expect(certificateSVG).toBeDefined()
    })
  })

  describe('createOrUpdateCertificate mutation', () => {
    let authHeaderNatlSYSAdmin: { Authorization: string }
    let authHeaderRegister: { Authorization: string }
    beforeEach(() => {
      fetch.resetMocks()
      const natlSYSAdminToken = jwt.sign(
        { scope: ['natlsysadmin'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderNatlSYSAdmin = {
        Authorization: `Bearer ${natlSYSAdminToken}`
      }
      const regsiterToken = jwt.sign(
        { scope: ['register'] },
        readFileSync('../auth/test/cert.key'),
        {
          subject: 'ba7022f0ff4822',
          algorithm: 'RS256',
          issuer: 'opencrvs:auth-service',
          audience: 'opencrvs:gateway-user'
        }
      )
      authHeaderRegister = {
        Authorization: `Bearer ${regsiterToken}`
      }
    })
    const certificateSVG = {
      svgCode: mockCertificate,
      svgFilename: 'oCRVS_DefaultZambia_SingleCharacterSet_Birth_v1.svg',
      user: 'jonathan.campbell',
      event: 'birth',
      status: 'ACTIVE'
    }

    it('creates certificate by natlsysadmin', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          user: 'jonathan.campbell'
        }),
        { status: 201 }
      )

      const response = await resolvers.Mutation.createOrUpdateCertificateSVG(
        {},
        { certificateSVG },
        authHeaderNatlSYSAdmin
      )

      expect(response).toEqual({
        user: 'jonathan.campbell'
      })
    })

    it('should throw error for register', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          statusCode: '201'
        }),
        { status: 400 }
      )

      return expect(
        resolvers.Mutation.createOrUpdateCertificateSVG(
          {},
          { certificateSVG },
          authHeaderRegister
        )
      ).rejects.toThrowError(
        'Create or update certificate is only allowed for natlsysadmin'
      )
    })

    it('should throw error when /createUser sends anything but 201', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          statusCode: '201'
        }),
        { status: 400 }
      )

      expect(
        resolvers.Mutation.createOrUpdateCertificateSVG(
          {},
          { certificateSVG },
          authHeaderNatlSYSAdmin
        )
      ).rejects.toThrowError(
        "Something went wrong on config service. Couldn't create certificate"
      )
    })
  })
})
