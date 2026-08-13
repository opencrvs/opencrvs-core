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
import { eventQueryDataGenerator, EventState } from '@opencrvs/commons/events'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { TrpcUserContext } from '../../context'
import {
  decodeEventIndex,
  encodeEventIndex,
  removeSecuredFields,
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

  test('removes secured data while keeping the others', () => {
    const eventIndexWithSecuredData = eventQueryDataGenerator({
      declaration: {
        'applicant.name': {
          firstname: 'John',
          surname: 'Doe'
        },
        'applicant.dob': '1990-01-01',
        'applicant.address': {
          addressType: 'DOMESTIC',
          country: 'GB',
          administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
          streetLevelDetails: {}
        }
      } satisfies EventState
    })
    expect(
      removeSecuredFields(eventConfig, eventIndexWithSecuredData).declaration
    ).toEqual({
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
