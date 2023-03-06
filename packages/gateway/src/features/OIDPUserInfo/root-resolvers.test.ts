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
import { resolvers } from '@gateway/features/OIDPUserInfo/root-resolvers'
import { OIDP_CLIENT_PRIVATE_KEY } from '@gateway/constants'
import * as fetchAny from 'jest-fetch-mock'
import * as jose from 'jose'

const fetch = fetchAny as fetchAny.FetchMock

beforeEach(() => {
  fetch.resetMocks()
})

describe('get user info from OIDP national id integration', () => {
  it('returns user info and decrypts JWT properly', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        access_token: 'some-access-token'
      })
    )

    const jwtPayload = {
      sub: '1234567890',
      name: 'Pyry Rouvila',
      given_name: 'Pyry',
      family_name: 'Rouvila',
      middle_name: 'Test',
      gender: 'MALE',
      birthdate: '1970-01-01',
      address: {
        formatted: 'Tammelankatu 1\n33500 Tampere\nFinland',
        street_address: 'Tammelankatu 1',
        locality: 'Tampere',
        region: 'Pirkanmaa',
        postal_code: '33500',
        country: 'Finland'
      }
    }

    const decodeKey = Buffer.from(
      OIDP_CLIENT_PRIVATE_KEY!,
      'base64'
    )?.toString()
    const jwkObject = JSON.parse(decodeKey)
    const privateKey = await jose.importJWK(jwkObject, 'RS256')
    const encoded = await new jose.SignJWT(jwtPayload)
      .setProtectedHeader({ alg: 'RS256' })
      .sign(privateKey)

    fetch.mockResponseOnce(encoded)

    const data = await resolvers.Query.getOIDPUserInfo(
      {},
      {
        code: 'some-code',
        clientId: 'some-client-id',
        redirectUri: 'http://localhost:3000/mosip-callback'
      }
    )

    expect(data).toEqual(jwtPayload)
  })

  it('throws an error if no access token is returned', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        error: 'invalid_assertion',
        error_description: 'invalid_assertion'
      }),
      { status: 400 }
    )

    try {
      await resolvers.Query.getOIDPUserInfo(
        {},
        {
          code: 'some-code',
          clientId: 'some-client-id',
          redirectUri: 'http://localhost:3000/mosip-callback'
        }
      )
    } catch (e) {
      expect(e.message).toMatch('No access token was returned')
    }

    expect.assertions(1)
  })
})
