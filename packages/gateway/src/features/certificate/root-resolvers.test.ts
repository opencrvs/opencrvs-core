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
          svgCode:
            '<svg width="420" height="595" viewBox="0 0 420 595" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect width="420" height="595" fill="white"/><rect x="16.5" y="16.5" width="387" height="562" stroke="#D7DCDE"/><path d="M138.429 511.629H281.571" stroke="#F4F4F4" stroke-width="1.22857" stroke-linecap="square" stroke-linejoin="round"/><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="526.552" text-anchor="middle">{registrarName}</tspan><tspan x="50%" y="538.552" text-anchor="middle">({role}) </tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="209.884" y="549.336"></tspan></text><text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="210" y="445.552"></tspan></text><text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="429.552" text-anchor="middle">This event was registered at {registrationLocation}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="308.828" text-anchor="middle">{eventDate}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="287.69" text-anchor="middle">Died on</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="345.69" text-anchor="middle">Place of death</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="500" letter-spacing="0px"><tspan x="211" y="384.004"></tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="367.828" text-anchor="middle">{placeOfDeath}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="245.828" text-anchor="middle">{informantName}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="224.69" text-anchor="middle">This is to certify that</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="1px"><tspan x="50%" y="145.828" text-anchor="middle">{registrationNumber}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" letter-spacing="0px"><tspan x="50%" y="127.828" text-anchor="middle">Death Registration No</tspan></text><text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="170.104" text-anchor="middle">Date of issuance of certificate:  {certificateDate}</tspan></text><line x1="44.9985" y1="403.75" x2="377.999" y2="401.75" stroke="#D7DCDE" stroke-width="0.5"/><line x1="44.9985" y1="189.75" x2="377.999" y2="187.75" stroke="#D7DCDE" stroke-width="0.5"/><rect x="188" y="51" width="46.7463" height="54" fill="url(#pattern0)"/><defs><pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1"><use xlink:href="#image0_43_3545" transform="translate(0 -0.000358256) scale(0.0005)"/></pattern><image id="image0_43_3545" width="2000" height="2312" xlink:href="{countryLogo}"/></defs></svg>',
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
            svgCode:
              '<svg width="420" height="595" viewBox="0 0 420 595" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect width="420" height="595" fill="white"/><rect x="16.5" y="16.5" width="387" height="562" stroke="#D7DCDE"/><path d="M138.429 511.629H281.571" stroke="#F4F4F4" stroke-width="1.22857" stroke-linecap="square" stroke-linejoin="round"/><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="526.552" text-anchor="middle">{registrarName}</tspan><tspan x="50%" y="538.552" text-anchor="middle">({role}) </tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="209.884" y="549.336"></tspan></text><text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="210" y="445.552"></tspan></text><text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="429.552" text-anchor="middle">This event was registered at {registrationLocation}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="308.828" text-anchor="middle">{eventDate}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="287.69" text-anchor="middle">Died on</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="345.69" text-anchor="middle">Place of death</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="500" letter-spacing="0px"><tspan x="211" y="384.004"></tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="367.828" text-anchor="middle">{placeOfDeath}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="245.828" text-anchor="middle">{informantName}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="224.69" text-anchor="middle">This is to certify that</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="1px"><tspan x="50%" y="145.828" text-anchor="middle">{registrationNumber}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" letter-spacing="0px"><tspan x="50%" y="127.828" text-anchor="middle">Death Registration No</tspan></text><text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="170.104" text-anchor="middle">Date of issuance of certificate:  {certificateDate}</tspan></text><line x1="44.9985" y1="403.75" x2="377.999" y2="401.75" stroke="#D7DCDE" stroke-width="0.5"/><line x1="44.9985" y1="189.75" x2="377.999" y2="187.75" stroke="#D7DCDE" stroke-width="0.5"/><rect x="188" y="51" width="46.7463" height="54" fill="url(#pattern0)"/><defs><pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1"><use xlink:href="#image0_43_3545" transform="translate(0 -0.000358256) scale(0.0005)"/></pattern><image id="image0_43_3545" width="2000" height="2312" xlink:href="{countryLogo}"/></defs></svg>',
            svgFilename: 'oCRVS_DefaultZambia_SingleCharacterSet_Birth_v1.svg',
            user: 'jonathan.campbell',
            event: 'birth',
            status: 'ACTIVE',
            creationDate: 1559054406433
          },
          {
            id: 'ca7022fafd4842',
            svgCode:
              '<svg width="420" height="595" viewBox="0 0 420 595" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect width="420" height="595" fill="white"/><rect x="16.5" y="16.5" width="387" height="562" stroke="#D7DCDE"/><path d="M138.429 511.629H281.571" stroke="#F4F4F4" stroke-width="1.22857" stroke-linecap="square" stroke-linejoin="round"/><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="526.552" text-anchor="middle">{registrarName}</tspan><tspan x="50%" y="538.552" text-anchor="middle">({role}) </tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="209.884" y="549.336"></tspan></text><text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="210" y="445.552"></tspan></text><text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="429.552" text-anchor="middle">This event was registered at {registrationLocation}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="308.828" text-anchor="middle">{eventDate}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="287.69" text-anchor="middle">Died on</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="345.69" text-anchor="middle">Place of death</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="500" letter-spacing="0px"><tspan x="211" y="384.004"></tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="367.828" text-anchor="middle">{placeOfDeath}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="245.828" text-anchor="middle">{informantName}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="224.69" text-anchor="middle">This is to certify that</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="1px"><tspan x="50%" y="145.828" text-anchor="middle">{registrationNumber}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" letter-spacing="0px"><tspan x="50%" y="127.828" text-anchor="middle">Death Registration No</tspan></text><text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="170.104" text-anchor="middle">Date of issuance of certificate:  {certificateDate}</tspan></text><line x1="44.9985" y1="403.75" x2="377.999" y2="401.75" stroke="#D7DCDE" stroke-width="0.5"/><line x1="44.9985" y1="189.75" x2="377.999" y2="187.75" stroke="#D7DCDE" stroke-width="0.5"/><rect x="188" y="51" width="46.7463" height="54" fill="url(#pattern0)"/><defs><pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1"><use xlink:href="#image0_43_3545" transform="translate(0 -0.000358256) scale(0.0005)"/></pattern><image id="image0_43_3545" width="2000" height="2312" xlink:href="{countryLogo}"/></defs></svg>',
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
      svgCode:
        '<svg width="420" height="595" viewBox="0 0 420 595" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect width="420" height="595" fill="white"/><rect x="16.5" y="16.5" width="387" height="562" stroke="#D7DCDE"/><path d="M138.429 511.629H281.571" stroke="#F4F4F4" stroke-width="1.22857" stroke-linecap="square" stroke-linejoin="round"/><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="526.552" text-anchor="middle">{registrarName}</tspan><tspan x="50%" y="538.552" text-anchor="middle">({role}) </tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="209.884" y="549.336"></tspan></text><text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="210" y="445.552"></tspan></text><text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="429.552" text-anchor="middle">This event was registered at {registrationLocation}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="308.828" text-anchor="middle">{eventDate}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="287.69" text-anchor="middle">Died on</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="345.69" text-anchor="middle">Place of death</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="500" letter-spacing="0px"><tspan x="211" y="384.004"></tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="367.828" text-anchor="middle">{placeOfDeath}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="245.828" text-anchor="middle">{informantName}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="224.69" text-anchor="middle">This is to certify that</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="1px"><tspan x="50%" y="145.828" text-anchor="middle">{registrationNumber}</tspan></text><text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" letter-spacing="0px"><tspan x="50%" y="127.828" text-anchor="middle">Death Registration No</tspan></text><text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="170.104" text-anchor="middle">Date of issuance of certificate:  {certificateDate}</tspan></text><line x1="44.9985" y1="403.75" x2="377.999" y2="401.75" stroke="#D7DCDE" stroke-width="0.5"/><line x1="44.9985" y1="189.75" x2="377.999" y2="187.75" stroke="#D7DCDE" stroke-width="0.5"/><rect x="188" y="51" width="46.7463" height="54" fill="url(#pattern0)"/><defs><pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1"><use xlink:href="#image0_43_3545" transform="translate(0 -0.000358256) scale(0.0005)"/></pattern><image id="image0_43_3545" width="2000" height="2312" xlink:href="{countryLogo}"/></defs></svg>',
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
