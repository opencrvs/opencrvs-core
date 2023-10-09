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
import { resolvers as rootResolvers } from '@gateway/features/bookmarkAdvancedSearch/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

const fetch = fetchAny as any
const resolvers = rootResolvers as any
beforeEach(() => {
  fetch.resetMocks()
})

describe('Advanced search resolvers', () => {
  describe('bookmarkAdvancedSearch mutation', () => {
    let authHeaderRegister: { Authorization: string }
    beforeEach(() => {
      fetch.resetMocks()
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

    it('Store advance search and return all saved searches', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          searchList: [
            {
              searchId: '62b99cd9sdf113a700cc19a1a'
            },
            {
              searchId: '62b99cdf113a700cc19a1a'
            },
            {
              searchId: '62b99cd234vs4700cc19a1a'
            }
          ]
        }),
        { status: 201 }
      )

      const response = await resolvers.Mutation.bookmarkAdvancedSearch(
        {},
        {
          bookmarkSearchInput: {
            userId: '62b99cd98f113a700cc19a1a',
            name: 'Advance Search',
            parameters: {
              event: 'birth'
            }
          }
        },
        { headers: authHeaderRegister }
      )

      expect(response.searchList.length).toEqual(3)
    })

    it('throws error for unauthorized user', async () => {
      await expect(
        resolvers.Mutation.bookmarkAdvancedSearch(
          {},
          {
            bookmarkSearchInput: {
              userId: '62b99cd98f113a700cc19a1a',
              name: 'Advance Search',
              parameters: {
                event: 'birth'
              }
            }
          },
          'null'
        )
      ).rejects.toThrowError(
        'Advanced search is only allowed for registrar or registration agent'
      )
    })

    it('throws error when the service response is not 200', async () => {
      fetch.mockResponseOnce(JSON.stringify(null), { status: 400 })

      await expect(
        resolvers.Mutation.bookmarkAdvancedSearch(
          {},
          {
            bookmarkSearchInput: {
              userId: '62b99cd98f113a700cc19a1a',
              name: 'Advance Search',
              parameters: {
                event: 'birth'
              }
            }
          },
          { headers: authHeaderRegister }
        )
      ).rejects.toThrowError(
        "Something went wrong on user management service. Couldn't bookmark advanced search."
      )
    })
  })

  describe('removeBookmarkedAdvancedSearch mutation', () => {
    let authHeaderRegister: { Authorization: string }
    beforeEach(() => {
      fetch.resetMocks()
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

    it('delete advanced search by id and return all saved searches', async () => {
      fetch.mockResponseOnce(
        JSON.stringify({
          searchList: [
            {
              searchId: '62b99cd9sdf113a700cc19a1a'
            },
            {
              searchId: '62b99cdf113a700cc19a1a'
            }
          ]
        }),
        { status: 200 }
      )

      const response = await resolvers.Mutation.removeBookmarkedAdvancedSearch(
        {},
        {
          removeBookmarkedSearchInput: {
            userId: '62b99cd98f113a700cc19a1a',
            searchId: '62b99cd234vs4700cc19a1a'
          }
        },
        { headers: authHeaderRegister }
      )

      expect(response.searchList.length).toEqual(2)
    })

    it('throws error for unauthorized user', async () => {
      await expect(
        resolvers.Mutation.removeBookmarkedAdvancedSearch(
          {},
          {
            removeBookmarkedSearchInput: {
              userId: '62b99cd98f113a700cc19a1a',
              searchId: '62b99cd234vs4700cc19a1a'
            }
          },
          'null'
        )
      ).rejects.toThrowError(
        'Advanced search is only allowed for registrar or registration agent'
      )
    })

    it('throws error when the service response is not 200', async () => {
      fetch.mockResponseOnce(JSON.stringify(null), { status: 400 })

      await expect(
        resolvers.Mutation.removeBookmarkedAdvancedSearch(
          {},
          {
            removeBookmarkedSearchInput: {
              userId: '62b99cd98f113a700cc19a1a',
              searchId: '62b99cd234vs4700cc19a1a'
            }
          },
          { headers: authHeaderRegister }
        )
      ).rejects.toThrowError(
        "Something went wrong on user management service. Couldn't unbookmarked advanced search."
      )
    })
  })
})
