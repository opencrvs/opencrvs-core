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
import {
  CERTIFIED_STATUS,
  REGISTERED_STATUS
} from '@search/elasticsearch/utils'
import {
  IAdvancedSearchParam,
  IFilter,
  INameCombination
} from '@search/features/search/types'
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

const allNameFields = [
  'childFirstNames',
  'childFamilyName',
  'childFirstNamesLocal',
  'childFamilyNameLocal',
  'motherFirstNames',
  'motherFamilyName',
  'motherFirstNamesLocal',
  'motherFamilyNameLocal',
  'fatherFirstNames',
  'fatherFamilyName',
  'fatherFirstNamesLocal',
  'fatherFamilyNameLocal',
  'informantFirstNames',
  'informantFamilyName',
  'informantFirstNamesLocal',
  'informantFamilyNameLocal',
  'deceasedFirstNames',
  'deceasedFamilyName',
  'deceasedFirstNamesLocal',
  'deceasedFamilyNameLocal',
  'spouseFirstNames',
  'spouseFamilyName',
  'spouseFirstNamesLocal',
  'spouseFamilyNameLocal'
]

const childFirstNameFields = ['childFirstNames', 'childFirstNamesLocal']

const motherFirstNameFields = ['motherFirstNames', 'motherFirstNamesLocal']

const fatherFirstNameFields = ['fatherFirstNames', 'fatherFirstNamesLocal']

const childFamilyNameFields = ['childFamilyName', 'childFamilyNameLocal']

const motherFamilyNameFields = ['motherFamilyName', 'motherFamilyNameLocal']

const fatherFamilyNameFields = ['fatherFamilyName', 'fatherFamilyNameLocal']

export const EMPTY_STRING = ''

export function queryBuilder(
  query: string,
  trackingId: string,
  contactNumber: string,
  registrationNumber: string,
  eventLocationId: string,
  gender: string,
  nameCombinations: INameCombination[],
  declarationLocationId: string | string[],
  declarationLocationHirarchyId: string,
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

  if (nameCombinations.length > 0) {
    nameCombinations.forEach((nameCombination: INameCombination) => {
      must.push({
        multi_match: {
          query: nameCombination.name,
          fields: selectNameFields(nameCombination.fields),
          fuzziness: 'AUTO'
        }
      })
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

  if (gender !== EMPTY_STRING) {
    must.push({
      term: {
        'gender.keyword': gender
      }
    })
  }

  if (eventLocationId !== EMPTY_STRING) {
    must.push({
      term: {
        'eventLocationId.keyword': {
          value: eventLocationId,
          // tslint:disable-next-line
          boost: 2.0
        }
      }
    })
  }

  if (Array.isArray(declarationLocationId)) {
    declarationLocationId.forEach((id) => {
      should.push({
        term: {
          'declarationLocationId.keyword': {
            value: id,
            boost: 2
          }
        }
      })
    })
  } else if (declarationLocationId !== EMPTY_STRING) {
    must.push({
      term: {
        'declarationLocationId.keyword': {
          value: declarationLocationId,
          boost: 2
        }
      }
    })
  }

  if (declarationLocationHirarchyId !== EMPTY_STRING) {
    must.push({
      term: {
        'declarationLocationHirarchyIds.keyword': {
          value: declarationLocationHirarchyId,
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

export function advancedQueryBuilder(params: IAdvancedSearchParam) {
  const must: any[] = [
    {
      query_string: {
        default_field: 'type',
        query: `(${REGISTERED_STATUS}) OR (${CERTIFIED_STATUS})`
      }
    }
  ]

  if (params.event) {
    must.push({
      match: {
        event: params.event
      }
    })
  }

  if (params.eventLocationId) {
    must.push({
      match: {
        eventLocationId: params.eventLocationId
      }
    })
  }

  if (params.childFirstNames) {
    must.push({
      multi_match: {
        query: params.childFirstNames,
        fields: ['childFirstNames'],
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.childLastName) {
    must.push({
      multi_match: {
        query: params.childLastName,
        fields: 'childLastName',
        fuzziness: 'AUTO'
      }
    })
  }

  if (!params.dateOfEventStart && !params.dateOfEventEnd && params.childDoB) {
    must.push({
      match: {
        childDoB: params.childDoB
      }
    })
  }

  if (params.deceasedFirstNames) {
    must.push({
      multi_match: {
        query: params.deceasedFirstNames,
        fields: 'deceasedFirstNames',
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.deceasedFamilyName) {
    must.push({
      multi_match: {
        query: params.deceasedFamilyName,
        fields: 'deceasedFamilyName',
        fuzziness: 'AUTO'
      }
    })
  }

  if (!params.dateOfEventStart && !params.dateOfEventEnd && params.deathDate) {
    must.push({
      match: {
        deathDate: params.deathDate
      }
    })
  }

  if (params.dateOfEventStart || params.dateOfEventEnd) {
    // if (!params.event) {
    //   throw new Error('Event is required for date range search')
    // }
    if (!params.dateOfEventStart) {
      throw new Error(
        'dateOfEventStart must be provided along with dateOfEventEnd'
      )
    }
    if (!params.dateOfEventEnd) {
      throw new Error(
        'dateOfEventEnd must be provided along with dateOfEventStart'
      )
    }

    // childDoB: {
    //   gte: params.dateOfEventStart,
    //   lte: params.dateOfEventEnd
    // }

    must.push({
      aggs: {
        range: {
          date_range: {
            field: 'childDoB',
            ranges: [
              { from: params.dateOfEventStart },
              { to: params.dateOfEventEnd }
            ]
          }
        }
      }
    })
  }

  if (params.motherFirstNames) {
    must.push({
      multi_match: {
        query: params.motherFirstNames,
        fields: 'motherFirstNames',
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.motherFamilyName) {
    must.push({
      multi_match: {
        query: params.motherFamilyName,
        fields: 'motherFamilyName',
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.motherDoB) {
    must.push({
      match: {
        motherDoB: params.motherDoB
      }
    })
  }

  if (params.motherIdentifier) {
    must.push({
      match: {
        motherIdentifier: params.motherIdentifier
      }
    })
  }

  if (params.fatherFirstNames) {
    must.push({
      multi_match: {
        query: params.fatherFirstNames,
        fields: 'fatherFirstNames',
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.fatherFamilyName) {
    must.push({
      multi_match: {
        query: params.fatherFamilyName,
        fields: 'fatherFamilyName',
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.fatherDoB) {
    must.push({
      match: {
        fatherDoB: params.fatherDoB
      }
    })
  }

  if (params.fatherIdentifier) {
    must.push({
      match: {
        fatherIdentifier: params.fatherIdentifier
      }
    })
  }

  if (params.informantFirstNames) {
    must.push({
      multi_match: {
        query: params.informantFirstNames,
        fields: 'informantFirstNames',
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.informantFamilyName) {
    must.push({
      multi_match: {
        query: params.informantFamilyName,
        fields: 'informantFamilyName',
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.contactNumber) {
    must.push({
      match: {
        contactNumber: params.contactNumber
      }
    })
  }

  if (params.registrationNumber) {
    must.push({
      match: {
        registrationNumber: params.registrationNumber
      }
    })
  }

  if (params.trackingId) {
    must.push({
      match: {
        trackingId: params.trackingId
      }
    })
  }

  if (params.dateOfRegistration) {
    must.push({
      match: {
        dateOfRegistration: params.dateOfRegistration
      }
    })
  }

  return {
    bool: {
      must
    }
  }
}

function selectNameFields(fields: string): string[] {
  switch (fields) {
    case 'CHILD_FIRST':
      return childFirstNameFields
    case 'CHILD_FAMILY':
      return childFamilyNameFields
    case 'FATHER_FIRST':
      return fatherFirstNameFields
    case 'FATHER_FAMILY':
      return fatherFamilyNameFields
    case 'MOTHER_FIRST':
      return motherFirstNameFields
    case 'MOTHER_FAMILY':
      return motherFamilyNameFields
    default:
      return allNameFields
  }
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
