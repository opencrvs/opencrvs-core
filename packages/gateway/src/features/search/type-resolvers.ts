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
import { NATIVE_LANGUAGE } from '@gateway/constants'
import {
  GQLResolver,
  GQLOperationHistorySearchSet
} from '@gateway/graphql/schema'
import {
  getEventDurationsFromMetrics,
  IEventDurationResponse
} from '@gateway/features/fhir/utils'
import { getUser } from '@gateway/features/user/utils'

interface ISearchEventDataTemplate {
  _type: string
  _id: string
  _source: ISearchDataTemplate
}
interface ISearchDataTemplate {
  [key: string]: any
}
export interface ISearchCriteria {
  declarationLocationId?: string
  declarationLocationHirarchyId?: string
  status?: string[]
  type?: string[]
  trackingId?: string
  contactNumber?: string
  name?: string
  registrationNumber?: string
  sort?: string
  sortColumn?: string
  size?: number
  from?: number
  createdBy?: string
}

const getTimeLoggedDataByStatus = (
  timeLoggedData: IEventDurationResponse[],
  status: string
) => {
  return (
    (timeLoggedData &&
      timeLoggedData.find(
        (timeLoggedByStatus) =>
          timeLoggedByStatus.status && timeLoggedByStatus.status === status
      )?.durationInSeconds) ||
    null
  )
}

const getChildName = (source: ISearchDataTemplate) => {
  if (!source) {
    return null
  }
  const names = [
    {
      use: 'en',
      given: (source.childFirstNames && [source.childFirstNames]) || null,
      family: (source.childFamilyName && [source.childFamilyName]) || null
    }
  ]

  if (NATIVE_LANGUAGE) {
    names.push({
      use: NATIVE_LANGUAGE,
      given:
        (source.childFirstNamesLocal && [source.childFirstNamesLocal]) || null,
      family:
        (source.childFamilyNameLocal && [source.childFamilyNameLocal]) || null
    })
  }

  return names
}

const getDeceasedName = (source: ISearchDataTemplate) => {
  if (!source) {
    return null
  }

  const names = [
    {
      use: 'en',
      given: (source.deceasedFirstNames && [source.deceasedFirstNames]) || null,
      family: (source.deceasedFamilyName && [source.deceasedFamilyName]) || null
    }
  ]

  if (NATIVE_LANGUAGE) {
    names.push({
      use: NATIVE_LANGUAGE,
      given:
        (source.deceasedFirstNamesLocal && [source.deceasedFirstNamesLocal]) ||
        null,
      family:
        (source.deceasedFamilyNameLocal && [source.deceasedFamilyNameLocal]) ||
        null
    })
  }

  return names
}

export const searchTypeResolvers: GQLResolver = {
  EventSearchSet: {
    // tslint:disable-next-line
    __resolveType(obj: ISearchEventDataTemplate) {
      if (obj._type === 'compositions' && obj._source.event === 'Birth') {
        return 'BirthEventSearchSet'
      } else {
        return 'DeathEventSearchSet'
      }
    }
  },
  BirthEventSearchSet: {
    id(resultSet: ISearchEventDataTemplate) {
      return resultSet._id
    },
    type(resultSet: ISearchEventDataTemplate) {
      return resultSet._source.event
    },
    registration(resultSet: ISearchEventDataTemplate) {
      return resultSet._source
    },
    childName(resultSet: ISearchEventDataTemplate) {
      return getChildName(resultSet._source)
    },
    dateOfBirth(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.childDoB) || null
    }
  },
  DeathEventSearchSet: {
    id(resultSet: ISearchEventDataTemplate) {
      return resultSet._id
    },
    type(resultSet: ISearchEventDataTemplate) {
      return resultSet._source.event
    },
    registration(resultSet: ISearchEventDataTemplate) {
      return resultSet._source
    },
    deceasedName(resultSet: ISearchEventDataTemplate) {
      return getDeceasedName(resultSet._source)
    },
    dateOfDeath(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.deathDate) || null
    }
  },
  RegistrationSearchSet: {
    status(searchData: ISearchDataTemplate) {
      return searchData.type
    },
    registeredLocationId(searchData: ISearchDataTemplate) {
      return searchData.declarationLocationId
    },
    eventLocationId(searchData: ISearchDataTemplate) {
      return searchData.eventLocationId
    },
    duplicates(searchData: ISearchDataTemplate) {
      return searchData.relatesTo
    }
  },
  EventProgressSet: {
    id(searchData: ISearchEventDataTemplate) {
      return searchData._id
    },
    type(searchData: ISearchEventDataTemplate) {
      return searchData._source.event
    },
    name(searchData: ISearchEventDataTemplate) {
      if (searchData._source.event === 'Birth') {
        return getChildName(searchData._source)
      } else if (searchData._source.event === 'Death') {
        return getDeceasedName(searchData._source)
      }
      return null
    },
    dateOfEvent(searchData: ISearchEventDataTemplate) {
      if (searchData._source.event === 'Birth') {
        return (searchData._source && searchData._source.childDoB) || null
      } else if (searchData._source.event === 'Death') {
        return (searchData._source && searchData._source.deathDate) || null
      }
      return null
    },
    registration(searchData: ISearchEventDataTemplate) {
      return searchData._source
    },
    startedAt(searchData: ISearchEventDataTemplate) {
      let startedAt = null
      if (searchData._source.operationHistories) {
        startedAt = (
          searchData._source
            .operationHistories as GQLOperationHistorySearchSet[]
        )[0].operatedOn
      }
      return startedAt
    },
    startedBy: async (searchData: ISearchEventDataTemplate, _, authHeader) => {
      return await getUser(
        { practitionerId: searchData._source && searchData._source.createdBy },
        authHeader
      )
    },
    startedByFacility(searchData: ISearchEventDataTemplate) {
      let facilityName = null
      if (searchData._source.operationHistories) {
        facilityName = (
          searchData._source
            .operationHistories as GQLOperationHistorySearchSet[]
        )[0].notificationFacilityName
      }
      return facilityName
    },
    progressReport: async (
      searchData: ISearchEventDataTemplate,
      _,
      authHeader
    ) => {
      return await getEventDurationsFromMetrics(authHeader, searchData._id)
    }
  },
  EventProgressData: {
    timeInProgress(timeLoggedResponse: IEventDurationResponse[]) {
      return getTimeLoggedDataByStatus(timeLoggedResponse, 'IN_PROGRESS')
    },
    timeInReadyForReview(timeLoggedResponse: IEventDurationResponse[]) {
      return getTimeLoggedDataByStatus(timeLoggedResponse, 'DECLARED')
    },
    timeInRequiresUpdates(timeLoggedResponse: IEventDurationResponse[]) {
      return getTimeLoggedDataByStatus(timeLoggedResponse, 'REJECTED')
    },
    timeInWaitingForApproval(timeLoggedResponse: IEventDurationResponse[]) {
      return getTimeLoggedDataByStatus(timeLoggedResponse, 'VALIDATED')
    },
    timeInWaitingForBRIS(timeLoggedResponse: IEventDurationResponse[]) {
      return getTimeLoggedDataByStatus(
        timeLoggedResponse,
        'WAITING_FOR_VALIDATION'
      )
    },
    timeInReadyToPrint(timeLoggedResponse: IEventDurationResponse[]) {
      return getTimeLoggedDataByStatus(timeLoggedResponse, 'REGISTERED')
    }
  }
}
