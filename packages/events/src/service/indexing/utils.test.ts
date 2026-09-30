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
import { UUID } from '@opencrvs/commons'
import {
  AddressType,
  EventIndex,
  eventQueryDataGenerator
} from '@opencrvs/commons/events'
import {
  ChildOnboardingEvent,
  tennisClubMembershipEvent
} from '@opencrvs/commons/fixtures'
import { TrpcUserContext } from '../../context'
import {
  collectLocationIds,
  decodeEventIndex,
  encodeEventIndex,
  resolveRecordActionScopeToIds
} from './utils'

describe('EventIndex utils', () => {
  const eventConfig = tennisClubMembershipEvent
  const eventIndex = eventQueryDataGenerator({
    declaration: {
      'applicant.name': {
        firstname: 'John',
        surname: 'Doe'
      },
      'applicant.dob': '1990-01-01'
    }
  })

  const encodedEventIndex = encodeEventIndex(eventIndex, eventConfig)

  test('encodes EventIndex', () => {
    expect(encodedEventIndex.declaration).toEqual({
      applicant____name: {
        firstname: 'John',
        surname: 'Doe',
        __fullname: 'John Doe'
      },
      applicant____dob: '1990-01-01'
    })
  })

  test('decodes EventIndex', () => {
    const decodedEventIndex = decodeEventIndex(eventConfig, encodedEventIndex)
    expect(decodedEventIndex.declaration).toEqual({
      'applicant.name': {
        firstname: 'John',
        surname: 'Doe'
      },
      'applicant.dob': '1990-01-01'
    })
  })
})

describe('resolveRecordActionScopeToIds()', () => {
  const user = {
    id: 'a3e0b4c7-1f2d-4a58-9c3b-6d7e8f901234' as UUID,
    primaryOfficeId: 'b4f1c5d8-2e3a-4b69-8d4c-7e8f90123456' as UUID,
    administrativeAreaId: 'c5a2d6e9-3f4b-4c7a-9e5d-8f9012345678' as UUID
  } as TrpcUserContext

  test('resolves createdIn: location to the user primary office', () => {
    expect(
      resolveRecordActionScopeToIds(
        { type: 'record.search', options: { createdIn: 'location' } },
        user
      ).options?.createdIn
    ).toBe(user.primaryOfficeId)
  })

  test('resolves createdIn: administrativeArea to the user administrative area', () => {
    expect(
      resolveRecordActionScopeToIds(
        {
          type: 'record.search',
          options: { createdIn: 'administrativeArea' }
        },
        user
      ).options?.createdIn
    ).toBe(user.administrativeAreaId)
  })

  test('resolves createdIn: all to no filter', () => {
    expect(
      resolveRecordActionScopeToIds(
        { type: 'record.search', options: { createdIn: 'all' } },
        user
      ).options?.createdIn
    ).toBeUndefined()
  })
})

describe('resolveRecordActionScopeToIds()', () => {
  const user = {
    id: 'a3e0b4c7-1f2d-4a58-9c3b-6d7e8f901234' as UUID,
    primaryOfficeId: 'b4f1c5d8-2e3a-4b69-8d4c-7e8f90123456' as UUID,
    administrativeAreaId: 'c5a2d6e9-3f4b-4c7a-9e5d-8f9012345678' as UUID
  } as TrpcUserContext

  test('resolves createdIn: location to the user primary office', () => {
    expect(
      resolveRecordActionScopeToIds(
        { type: 'record.search', options: { createdIn: 'location' } },
        user
      ).options?.createdIn
    ).toBe(user.primaryOfficeId)
  })

  test('resolves createdIn: administrativeArea to the user administrative area', () => {
    expect(
      resolveRecordActionScopeToIds(
        {
          type: 'record.search',
          options: { createdIn: 'administrativeArea' }
        },
        user
      ).options?.createdIn
    ).toBe(user.administrativeAreaId)
  })

  test('resolves createdIn: all to no filter', () => {
    expect(
      resolveRecordActionScopeToIds(
        { type: 'record.search', options: { createdIn: 'all' } },
        user
      ).options?.createdIn
    ).toBeUndefined()
  })
})

describe('collectLocationIds', () => {
  const createdAtLocation = '11111111-1111-4111-8111-111111111111' as UUID
  const placeOfEvent = '22222222-2222-4222-8222-222222222222' as UUID
  const updatedAtLocation = '33333333-3333-4333-8333-333333333333' as UUID
  const declaredAtLocation = '44444444-4444-4444-8444-444444444444' as UUID
  const birthLocation = '55555555-5555-4555-8555-555555555555' as UUID
  const homeAdministrativeArea = '66666666-6666-4666-8666-666666666666' as UUID

  // eventQueryDataGenerator does not carry placeOfEvent through, so set it here.
  const eventIndex: EventIndex = {
    ...eventQueryDataGenerator({
      createdAtLocation,
      updatedAtLocation,
      legalStatuses: {
        DECLARED: {
          createdAtLocation: declaredAtLocation,
          createdAt: '2024-01-01T00:00:00.000Z',
          acceptedAt: '2024-01-01T00:00:00.000Z',
          createdBy: '77777777-7777-4777-8777-777777777777'
        }
      },
      declaration: {
        'child.birthLocation': birthLocation,
        'child.birthLocation.privateHome': {
          country: 'FAR',
          addressType: AddressType.DOMESTIC,
          administrativeArea: homeAdministrativeArea,
          streetLevelDetails: { street: '12', town: 'Baker St' }
        }
      }
    }),
    placeOfEvent
  }

  test('collects the top level, legal status and declaration locations', () => {
    expect(collectLocationIds(ChildOnboardingEvent, eventIndex).sort()).toEqual(
      [
        createdAtLocation,
        placeOfEvent,
        updatedAtLocation,
        declaredAtLocation,
        birthLocation,
        homeAdministrativeArea
      ].sort()
    )
  })

  test('skips declaration fields that are not locations', () => {
    const ids = collectLocationIds(ChildOnboardingEvent, {
      ...eventIndex,
      declaration: { 'child.name': { firstname: 'Jo', surname: 'Doe' } }
    })

    expect(ids).not.toContain(birthLocation)
    expect(ids).not.toContain(homeAdministrativeArea)
  })

  test('omits absent locations rather than collecting empty ids', () => {
    const ids = collectLocationIds(ChildOnboardingEvent, {
      ...eventIndex,
      createdAtLocation: null,
      placeOfEvent: null,
      updatedAtLocation: null,
      legalStatuses: {},
      declaration: {}
    })

    expect(ids).toEqual([])
  })
})
