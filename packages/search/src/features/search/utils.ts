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
import { IFilter, INameCombination } from '@search/features/search/types'
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
  'primaryCaregiverFirstNames',
  'primaryCaregiverFamilyName',
  'primaryCaregiverFirstNamesLocal',
  'primaryCaregiverFamilyNameLocal',
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
  declarationLocationId: string,
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

  if (declarationLocationId !== EMPTY_STRING) {
    must.push({
      term: {
        'declarationLocationId.keyword': {
          value: declarationLocationId,
          // tslint:disable-next-line
          boost: 2.0
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
