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
import { IAdvancedSearchParam } from '@search/features/search/types'

export function advancedQueryBuilder(
  params: IAdvancedSearchParam,
  createdBy: string,
  isExternalSearch: boolean
) {
  const must: any[] = []
  const should: any[] = []

  if (params.event) {
    must.push({
      match: {
        event: params.event
      }
    })
  }

  if (params.name) {
    must.push({
      multi_match: {
        query: params.name,
        fields: [
          'childFirstNames',
          'childFamilyName',
          'motherFirstNames',
          'motherFamilyName',
          'fatherFirstNames',
          'fatherFamilyName',
          'informantFirstNames',
          'informantFamilyName',
          'deceasedFirstNames',
          'deceasedFamilyName',
          'spouseFirstNames',
          'spouseFamilyName'
        ],
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.registrationStatuses) {
    must.push({
      query_string: {
        default_field: 'type',
        query: isExternalSearch
          ? `(${REGISTERED_STATUS}) OR (${CERTIFIED_STATUS})`
          : `(${params.registrationStatuses.join(') OR (')})`
      }
    })
  }

  if (
    !params.dateOfEventStart &&
    !params.dateOfEventEnd &&
    params.dateOfEvent
  ) {
    must.push({
      match: {
        deathDate: params.dateOfEvent
      }
    })
  }

  if (params.dateOfEventStart || params.dateOfEventEnd) {
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

    must.push({
      range: {
        deathDate: {
          gte: params.dateOfEventStart,
          lte: params.dateOfEventEnd
        }
      }
    })
  }

  if (
    !params.dateOfRegistrationStart &&
    !params.dateOfRegistrationEnd &&
    params.dateOfRegistration
  ) {
    must.push({
      match: {
        dateOfRegistration: params.dateOfRegistration
      }
    })
  }

  if (params.dateOfRegistrationStart || params.dateOfRegistrationEnd) {
    if (!params.dateOfRegistrationStart) {
      throw new Error(
        'dateOfRegistrationStart  must be provided along with dateOfRegistrationEnd'
      )
    }

    if (!params.dateOfRegistrationEnd) {
      throw new Error(
        'dateOfRegistrationEnd  must be provided along with dateOfRegistrationStart'
      )
    }

    must.push({
      range: {
        dateOfDeclaration: {
          gte: params.dateOfRegistrationStart,
          lte: params.dateOfRegistrationEnd
        }
      }
    })
  }

  if (params.declarationLocationId) {
    must.push({
      match: {
        declarationLocationId: {
          query: params.declarationLocationId,
          boost: 2.0
        }
      }
    })
  }

  if (params.declarationJurisdictionId) {
    must.push({
      match: {
        declarationJurisdictionId: {
          query: params.declarationJurisdictionId,
          boost: 2.0
        }
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

  const eventJurisdictionIds = [
    params.eventLocationLevel1,
    params.eventLocationLevel2,
    params.eventLocationLevel3,
    params.eventLocationLevel4,
    params.eventLocationLevel5
  ].filter((id) => Boolean(id))

  if (eventJurisdictionIds.length > 0) {
    must.push({
      bool: {
        should: eventJurisdictionIds.map((locationId: string) => ({
          match: {
            eventJurisdictionIds: locationId
          }
        }))
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

  if (!params.childDoBStart && !params.childDoBEnd && params.childDoB) {
    must.push({
      match: {
        childDoB: params.childDoB
      }
    })
  }

  if (params.childDoBStart || params.childDoBEnd) {
    if (!params.childDoBStart) {
      throw new Error('childDoBStart must be provided along with childDoBEnd')
    }
    if (!params.childDoBEnd) {
      throw new Error('childDoBEnd must be provided along with childDoBStart')
    }

    must.push({
      range: {
        childDoB: {
          gte: params.childDoBStart,
          lte: params.childDoBEnd
        }
      }
    })
  }

  if (params.childGender) {
    should.push({
      match: {
        gender: params.childGender
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

  if (params.deceasedGender) {
    should.push({
      match: {
        gender: params.deceasedGender
      }
    })
  }

  if (
    !params.deceasedDoBStart &&
    !params.deceasedDoBEnd &&
    params.deceasedDoB
  ) {
    must.push({
      match: {
        deceasedDoB: params.deceasedDoB
      }
    })
  }

  if (params.deceasedDoBStart || params.deceasedDoBEnd) {
    if (!params.deceasedDoBStart) {
      throw new Error(
        'deceasedDoBStart must be provided along with deceasedDoBEnd'
      )
    }
    if (!params.deceasedDoBEnd) {
      throw new Error(
        'deceasedDoBEnd must be provided along with deceasedDoBStart'
      )
    }

    must.push({
      range: {
        childDoB: {
          gte: params.deceasedDoBStart,
          lte: params.deceasedDoBEnd
        }
      }
    })
  }

  if (params.deceasedIdentifier) {
    must.push({
      match: {
        deceasedIdentifier: params.deceasedIdentifier
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

  if (!params.motherDoBStart && !params.motherDoBEnd && params.motherDoB) {
    must.push({
      match: {
        motherDoB: params.motherDoB
      }
    })
  }

  if (params.motherDoBStart || params.motherDoBEnd) {
    if (!params.motherDoBStart) {
      throw new Error('motherDoBStart must be provided along with motherDoBEnd')
    }
    if (!params.motherDoBEnd) {
      throw new Error('motherDoBEnd must be provided along with motherDoBStart')
    }

    must.push({
      range: {
        motherDoB: {
          gte: params.motherDoBStart,
          lte: params.motherDoBEnd
        }
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

  if (!params.fatherDoBStart && params.fatherDoBEnd && params.fatherDoB) {
    must.push({
      match: {
        fatherDoB: params.fatherDoB
      }
    })
  }

  if (params.fatherDoBStart || params.fatherDoBEnd) {
    if (!params.fatherDoBStart) {
      throw new Error('fatherDoBStart must be provided along with fatherDoBEnd')
    }
    if (!params.fatherDoBEnd) {
      throw new Error('fatherDoBEnd must be provided along with fatherDoBStart')
    }

    must.push({
      range: {
        fatherDoB: {
          gte: params.fatherDoBStart,
          lte: params.fatherDoBEnd
        }
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

  if (
    !params.informantDoBStart &&
    !params.informantDoBEnd &&
    params.informantDoB
  ) {
    must.push({
      match: {
        informantDoB: params.informantDoB
      }
    })
  }

  if (params.informantDoBStart || params.informantDoBEnd) {
    if (!params.informantDoBStart) {
      throw new Error(
        'informantDoBStart must be provided along with informantDoBEnd'
      )
    }
    if (!params.deceasedDoBEnd) {
      throw new Error(
        'informantDoBEnd must be provided along with informantDoBStart'
      )
    }

    must.push({
      range: {
        childDoB: {
          gte: params.informantDoBStart,
          lte: params.informantDoBEnd
        }
      }
    })
  }

  if (params.informantIdentifier) {
    must.push({
      match: {
        informantIdentifier: params.informantIdentifier
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

  if (params.nationalId) {
    should.push(
      {
        match: {
          motherIdentifier: params.nationalId
        }
      },
      {
        match: {
          fatherIdentifier: params.nationalId
        }
      },
      {
        match: {
          informantIdentifier: params.nationalId
        }
      },
      {
        match: {
          deceasedIdentifier: params.nationalId
        }
      }
    )
  }

  if (createdBy) {
    must.push({
      term: {
        'createdBy.keyword': {
          value: createdBy
        }
      }
    })
  }

  if (params.compositionType) {
    must.push({
      terms: {
        'compositionType.keyword': params.compositionType
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

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
