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
import { typeResolvers as resolvers } from '@gateway/features/registration/type-resolvers'

import {
  causeOfDeathObservation,
  mannerOfDeathObservation,
  mockDeathComposition,
  mockDeathEncounter,
  mockDeathEncounterLocation,
  mockObservations
} from '@gateway/utils/testUtils'
import * as fetchAny from 'jest-fetch-mock'
const typeResolvers = resolvers as any

const fetch = fetchAny as any

beforeEach(() => {
  fetch.resetMocks()
})

const mockRecord = {
  entry: [
    { resource: mockDeathComposition },
    mockDeathEncounter,
    causeOfDeathObservation,
    mannerOfDeathObservation,
    mockDeathEncounterLocation
  ]
}

describe('Registration type resolvers', () => {
  it('returns createdAt date', () => {
    const createdAt = typeResolvers.DeathRegistration.createdAt(mockRecord)
    expect(createdAt).toBe('2018-10-05')
  })

  describe('Death Registration type', () => {
    it('returns eventLocation', async () => {
      const eventLocation = await typeResolvers.DeathRegistration.eventLocation(
        mockRecord,
        undefined,
        { headers: undefined }
      )
      expect(eventLocation).toBeDefined()
      expect(eventLocation).toEqual(mockDeathEncounterLocation.resource)
    })
    it('returns mannerOfDeath', async () => {
      fetch.mockResponseOnce(JSON.stringify(mockObservations.mannerOfDeath))

      const mannerOfDeath = await typeResolvers.DeathRegistration.mannerOfDeath(
        mockRecord,
        undefined,
        { headers: undefined }
      )
      expect(mannerOfDeath).toBeDefined()
      expect(mannerOfDeath).toEqual('NATURAL_CAUSES')
    })
    it('returns causeOfDeathMethod', async () => {
      fetch.mockResponseOnce(
        JSON.stringify(mockObservations.causeOfDeathMethod)
      )

      const causeOfDeathMethod =
        await typeResolvers.DeathRegistration.causeOfDeathMethod(
          {
            entry: [
              { resource: mockDeathComposition },
              mockDeathEncounter,
              causeOfDeathObservation
            ]
          },
          undefined,
          { headers: undefined }
        )
      expect(causeOfDeathMethod).toBeDefined()
      expect(causeOfDeathMethod).toEqual('PHYSICIAN')
    })
  })
})
