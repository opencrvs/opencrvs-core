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

import { resolvers } from '@gateway/features/informantSMSNotifications/root-resolvers'
import * as fetchAny from 'jest-fetch-mock'
import * as jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

const fetch = fetchAny as any
const informantSMSNotificationMock = [
  {
    id: '639ae12df387b6b3efbd9a17',
    name: 'deathInProgressSMS',
    enabled: true
  },
  {
    id: '639ae12df387b6b3efbd9a18',
    name: 'deathDeclarationSMS',
    enabled: true,
    updatedAt: '1671094573239',
    createdAt: '1671094573239'
  }
]

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
const authHeaderNatlSYSAdmin = {
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
const authHeaderRegister = {
  Authorization: `Bearer ${regsiterToken}`
}

describe('InformantSMSNotifications root resolvers', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  describe('informantSMSNotifications query', () => {
    it('should returns all the informantSMSNotifications with messages', async () => {
      fetch.mockResponseOnce(JSON.stringify(informantSMSNotificationMock), {
        status: 200
      })

      const res = await resolvers.Query.informantSMSNotifications(
        {},
        [
          {
            id: '639ae12df387b6b3efbd9a18',
            name: 'deathDeclarationSMS',
            enabled: false
          }
        ],
        { headers: authHeaderNatlSYSAdmin }
      )

      expect(res).toBeDefined()
    })

    it('throws error for unauthorized user', async () => {
      fetch.mockResponseOnce(JSON.stringify(informantSMSNotificationMock), {
        status: 200
      })

      await expect(
        resolvers.Query.informantSMSNotifications(
          {},
          [
            {
              id: '639ae12df387b6b3efbd9a18',
              name: 'deathDeclarationSMS',
              enabled: false
            }
          ],
          'null'
        )
      ).rejects.toThrowError(
        'Toggle informantSMSNotification is only allowed for natlsysadmin'
      )
    })

    it('throws error when the service response is not 200', async () => {
      fetch.mockResponseOnce(JSON.stringify({}), { status: 400 })

      await expect(
        resolvers.Query.informantSMSNotifications(
          {},
          [
            {
              id: '639ae12df387b6b3efbd9a18',
              name: 'deathDeclarationSMS',
              enabled: false
            }
          ],
          { headers: authHeaderNatlSYSAdmin }
        )
      ).rejects.toThrowError(
        "Something went wrong on config service. Couldn't get informantSMSNotification"
      )
    })
  })
})

describe('toggleInformantSMSNotification mutation', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  it('update informantSMSNotifications by natlsysadmin', async () => {
    fetch.mockResponseOnce(JSON.stringify(informantSMSNotificationMock), {
      status: 201
    })

    const response = await resolvers.Mutation.toggleInformantSMSNotification(
      {},
      [
        {
          id: '639ae12df387b6b3efbd9a18',
          name: 'deathDeclarationSMS',
          enabled: true
        }
      ],
      { headers: authHeaderNatlSYSAdmin }
    )

    expect(response[1].enabled).toBe(true)
  })

  it('should throw error for register', async () => {
    fetch.mockResponseOnce(JSON.stringify(informantSMSNotificationMock), {
      status: 201
    })

    return expect(
      resolvers.Mutation.toggleInformantSMSNotification(
        {},
        [
          {
            id: '639ae12df387b6b3efbd9a18',
            name: 'deathDeclarationSMS',
            enabled: true
          }
        ],
        { headers: authHeaderRegister }
      )
    ).rejects.toThrowError(
      'Toggle informantSMSNotification is only allowed for natlsysadmin'
    )
  })
})
