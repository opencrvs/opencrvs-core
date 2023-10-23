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
import { resolvers as rootResolvers } from '@gateway/features/OIDPUserInfo/root-resolvers'
import { OIDP_CLIENT_PRIVATE_KEY } from '@gateway/constants'
import * as fetchAny from 'jest-fetch-mock'
import * as jose from 'jose'

const fetch = fetchAny as fetchAny.FetchMock
const resolvers = rootResolvers as any
beforeEach(() => {
  fetch.resetMocks()
})

describe('get user info from OIDP national id integration', () => {
  it('returns user info and decrypts JWT properly', async () => {
    const jwtPayload = {
      sub: '1234567890',
      name: 'Pyry Rouvila',
      given_name: 'Pyry',
      family_name: 'Rouvila',
      middle_name: 'Test',
      birthdate: '1980-04-01',
      address: {
        formatted: 'Testingston 1\n12345 Ibombo, Central\nFarajaland',
        street_address: 'Tammelankatu 1',
        locality: 'Ibombo',
        region: 'Central',
        postal_code: '12345',
        country: 'Farajaland'
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

    fetch
      .mockResponseOnce(
        JSON.stringify({
          access_token: 'some-access-token'
        })
      )
      .mockResponseOnce(encoded)
      .mockResponseOnce(
        JSON.stringify({
          resourceType: 'Bundle',
          id: '34abc0a0-912d-4b8b-97fd-def9a2321b0f',
          meta: { lastUpdated: '2023-05-19T15:39:21.599+00:00' },
          type: 'searchset',
          total: 0,
          link: [
            {
              relation: 'self',
              url: 'http://localhost:7070/location?name=Farajaland'
            }
          ],
          entry: []
        })
      )
      .mockResponseOnce(
        JSON.stringify({
          resourceType: 'Bundle',
          id: 'c819db15-fc28-4606-9db4-095378a06125',
          meta: {
            lastUpdated: '2023-03-10T13:46:59.923+00:00'
          },
          type: 'searchset',
          total: 1,
          link: [
            {
              relation: 'self',
              url: 'http://localhost:7070/location?name=Central'
            }
          ],
          entry: [
            {
              fullUrl:
                'http://localhost:7070/location/5dd96001-7c94-4eeb-b96e-8a987957f7a2/_history/b3f14d83-eb74-4cfa-b17e-039d57d222f0',
              resource: {
                resourceType: 'Location',
                identifier: [
                  {
                    system: 'http://opencrvs.org/specs/id/statistical-code',
                    value: 'ADMIN_STRUCTURE_AWn3s2RqgAN'
                  },
                  {
                    system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                    value: 'STATE'
                  }
                ],
                name: 'Central',
                alias: ['Central'],
                description: 'AWn3s2RqgAN',
                status: 'active',
                mode: 'instance',
                partOf: {
                  reference: 'Location/0'
                },
                type: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/specs/location-type',
                      code: 'ADMIN_STRUCTURE'
                    }
                  ]
                },
                physicalType: {
                  coding: [
                    {
                      code: 'jdn',
                      display: 'Jurisdiction'
                    }
                  ]
                },
                extension: [],
                meta: {
                  lastUpdated: '2023-01-18T12:54:05.278+00:00',
                  versionId: 'b3f14d83-eb74-4cfa-b17e-039d57d222f0'
                },
                id: '5dd96001-7c94-4eeb-b96e-8a987957f7a2'
              },
              request: {
                method: 'PUT',
                url: 'Location/5dd96001-7c94-4eeb-b96e-8a987957f7a2'
              }
            }
          ]
        })
      )
      .mockResponseOnce(
        JSON.stringify({
          resourceType: 'Bundle',
          id: 'c6f0f99f-ad27-4e6e-9705-a320c1eb3423',
          meta: {
            lastUpdated: '2023-03-10T11:55:07.461+00:00'
          },
          type: 'searchset',
          total: 1,
          link: [
            {
              relation: 'self',
              url: 'http://localhost:7070/location?name=Ibombo&type=ADMIN_STRUCTURE'
            }
          ],
          entry: [
            {
              fullUrl:
                'http://localhost:7070/location/ab93d5a5-c078-4dfa-b4ca-d54d1e57bca0/_history/5127621b-de2a-4bd2-b530-6413924f2ed2',
              resource: {
                resourceType: 'Location',
                identifier: [
                  {
                    system: 'http://opencrvs.org/specs/id/statistical-code',
                    value: 'ADMIN_STRUCTURE_oEBf29y8JP8'
                  },
                  {
                    system: 'http://opencrvs.org/specs/id/jurisdiction-type',
                    value: 'DISTRICT'
                  }
                ],
                name: 'Ibombo',
                alias: ['Ibombo'],
                description: 'oEBf29y8JP8',
                status: 'active',
                mode: 'instance',
                partOf: {
                  reference: 'Location/5dd96001-7c94-4eeb-b96e-8a987957f7a2'
                },
                type: {
                  coding: [
                    {
                      system: 'http://opencrvs.org/specs/location-type',
                      code: 'ADMIN_STRUCTURE'
                    }
                  ]
                },
                physicalType: {
                  coding: [
                    {
                      code: 'jdn',
                      display: 'Jurisdiction'
                    }
                  ]
                },
                extension: [],
                meta: {
                  lastUpdated: '2023-01-18T12:54:05.324+00:00',
                  versionId: '5127621b-de2a-4bd2-b530-6413924f2ed2'
                },
                id: 'ab93d5a5-c078-4dfa-b4ca-d54d1e57bca0'
              },
              request: {
                method: 'PUT',
                url: 'Location/ab93d5a5-c078-4dfa-b4ca-d54d1e57bca0'
              }
            }
          ]
        })
      )

    const data = await resolvers.Query.getOIDPUserInfo(
      {},
      {
        code: 'some-code',
        clientId: 'some-client-id',
        redirectUri: 'http://localhost:3000/mosip-callback'
      }
    )

    expect(fetch.mock.calls[0][0]).toMatch(/oauth\/token$/)
    expect(fetch.mock.calls[1][0]).toMatch(/oidc\/userinfo$/)
    expect(fetch.mock.calls[2][0]).toMatch(
      /Location\?name=Farajaland&type=ADMIN_STRUCTURE$/
    )
    expect(fetch.mock.calls[3][0]).toMatch(
      /Location\?name=Central&type=ADMIN_STRUCTURE$/
    )
    expect(fetch.mock.calls[4][0]).toMatch(
      /Location\?name=Ibombo&type=ADMIN_STRUCTURE$/
    )
    expect(data).toEqual({
      oidpUserInfo: jwtPayload,
      districtFhirId: '5dd96001-7c94-4eeb-b96e-8a987957f7a2',
      locationLevel3FhirId: 'ab93d5a5-c078-4dfa-b4ca-d54d1e57bca0',
      stateFhirId: null
    })
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
