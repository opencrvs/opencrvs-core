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
import { eventQueryDataGenerator } from '@opencrvs/commons/events'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import {
  decodeEventIndex,
  encodeEventIndex,
  removeSecuredFields
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
          streetLevelDetails: {
            district: 'District',
            country: 'Country',
            province: 'Province',
            urbanOrRural: 'URBAN'
          }
        }
      }
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
