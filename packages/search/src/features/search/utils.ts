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
import { IFilter } from '@search/features/search/types'
const SEARCHABLE_FIELDS = [
  'childFirstNames',
  'childFamilyName',
  'childFirstNamesLocal',
  'childFamilyNameLocal',
  'deceasedFirstNames',
  'deceasedFamilyName',
  'deceasedFirstNamesLocal',
  'deceasedFamilyNameLocal',
  'trackingId',
  'registrationNumber',
  'contactNumber'
]
export const EMPTY_STRING = ''

export function queryBuilder(
  query: string,
  trackingId: string,
  contactNumber: string,
  registrationNumber: string,
  applicationLocationId: string,
  createdBy: string,
  filters: IFilter
) {
  const must: any[] = []
  const should: any[] = []

  if (query !== EMPTY_STRING) {
    must.push({
      multi_match: {
        query: `${query}`,
        fields: SEARCHABLE_FIELDS,
        fuzziness: 'AUTO'
      }
    })
  }

  if (trackingId !== EMPTY_STRING) {
    must.push({
      term: {
        'trackingId.keyword': trackingId
      }
    })
  }

  if (contactNumber !== EMPTY_STRING) {
    must.push({
      term: {
        'contactNumber.keyword': contactNumber
      }
    })
  }

  if (registrationNumber !== EMPTY_STRING) {
    must.push({
      term: {
        'registrationNumber.keyword': registrationNumber
      }
    })
  }

  if (applicationLocationId !== EMPTY_STRING) {
    must.push({
      term: {
        'applicationLocationId.keyword': {
          value: applicationLocationId,
          // tslint:disable-next-line
          boost: 2.0
        }
      }
    })
  }

  if (createdBy !== EMPTY_STRING) {
    must.push({
      term: {
        'createdBy.keyword': {
          value: createdBy
        }
      }
    })
  }

  if (filters.event !== EMPTY_STRING) {
    must.push({
      term: {
        'event.keyword': filters.event
      }
    })
  }

  if (filters.status) {
    must.push({
      terms: {
        'type.keyword': filters.status
      }
    })
  }

  if (filters.type) {
    must.push({
      terms: {
        'compositionType.keyword': filters.type
      }
    })
  }

  return {
    bool: {
      must,
      should
    }
  }
}
