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
  AVATAR_API,
  NATIVE_LANGUAGE,
  USER_MANAGEMENT_URL
} from '@gateway/constants'
import fetch from 'node-fetch'
import {
  GQLOperationHistorySearchSet,
  GQLResolver
} from '@gateway/graphql/schema'
import {
  getEventDurationsFromMetrics,
  IEventDurationResponse
} from '@gateway/features/fhir/utils'
import { getUser } from '@gateway/features/user/utils'
import { getPresignedUrlFromUri } from '@gateway/features/registration/utils'

interface ISearchEventDataTemplate {
  _type: string
  _id: string
  _source: ISearchDataTemplate
}
interface ISearchDataTemplate {
  [key: string]: any
}

interface IAssignment {
  officeName: string
  firstName: string
  lastName: string
  userId: string
}

type IAvatarResponse = {
  userName: string
  avatarURI?: string
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

const getBrideName = (source: ISearchDataTemplate) => {
  if (!source) {
    return null
  }
  const names = [
    {
      use: 'en',
      given: (source.brideFirstNames && [source.brideFirstNames]) || null,
      family: (source.brideFamilyName && [source.brideFamilyName]) || null
    }
  ]

  if (NATIVE_LANGUAGE) {
    names.push({
      use: NATIVE_LANGUAGE,
      given:
        (source.brideFirstNamesLocal && [source.brideFirstNamesLocal]) || null,
      family:
        (source.brideFamilyNameLocal && [source.brideFamilyNameLocal]) || null
    })
  }

  return names
}

const getGroomName = (source: ISearchDataTemplate) => {
  if (!source) {
    return null
  }
  const names = [
    {
      use: 'en',
      given: (source.groomFirstNames && [source.groomFirstNames]) || null,
      family: (source.groomFamilyName && [source.groomFamilyName]) || null
    }
  ]

  if (NATIVE_LANGUAGE) {
    names.push({
      use: NATIVE_LANGUAGE,
      given:
        (source.groomFirstNamesLocal && [source.groomFirstNamesLocal]) || null,
      family:
        (source.groomFamilyNameLocal && [source.groomFamilyNameLocal]) || null
    })
  }

  return names
}

export const searchTypeResolvers: GQLResolver = {
  EventSearchSet: {
    __resolveType(obj: ISearchEventDataTemplate) {
      if (obj._type === 'compositions' && obj._source.event === 'Birth') {
        return 'BirthEventSearchSet'
      } else if (
        obj._type === 'compositions' &&
        obj._source.event === 'Death'
      ) {
        return 'DeathEventSearchSet'
      } else {
        return 'MarriageEventSearchSet'
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
    operationHistories(resultSet: ISearchEventDataTemplate) {
      return resultSet._source.operationHistories
    },
    childName(resultSet: ISearchEventDataTemplate) {
      return getChildName(resultSet._source)
    },
    dateOfBirth(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.childDoB) || null
    },
    placeOfBirth(resultSet: ISearchEventDataTemplate) {
      return (
        (resultSet._source && resultSet._source.eventLocationId) ||
        (resultSet._source &&
          resultSet._source.eventJurisdictionIds[
            resultSet._source.eventJurisdictionIds.length - 1
          ]) ||
        null
      )
    },
    childGender(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.gender) || null
    },
    childIdentifier(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.childIdentifier) || null
    },
    mothersFirstName(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.motherFirstNames) || null
    },
    mothersLastName(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.motherFamilyName) || null
    },
    fathersFirstName(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.fatherFirstNames) || null
    },
    fathersLastName(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.fatherFamilyName) || null
    },
    motherDateOfBirth(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.motherDoB) || null
    },
    fatherDateOfBirth(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.fatherDoB) || null
    },
    motherIdentifier(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.motherIdentifier) || null
    },
    fatherIdentifier(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.fatherIdentifier) || null
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
    operationHistories(resultSet: ISearchEventDataTemplate) {
      return resultSet._source.operationHistories
    },
    deceasedGender(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.gender) || null
    },
    deceasedName(resultSet: ISearchEventDataTemplate) {
      return getDeceasedName(resultSet._source)
    },
    dateOfDeath(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.deathDate) || null
    }
  },
  MarriageEventSearchSet: {
    id(resultSet: ISearchEventDataTemplate) {
      return resultSet._id
    },
    type(resultSet: ISearchEventDataTemplate) {
      return resultSet._source.event
    },
    registration(resultSet: ISearchEventDataTemplate) {
      return resultSet._source
    },
    operationHistories(resultSet: ISearchEventDataTemplate) {
      return resultSet._source.operationHistories
    },
    brideName(resultSet: ISearchEventDataTemplate) {
      return getBrideName(resultSet._source)
    },
    brideIdentifier(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.brideIdentifier) || null
    },
    groomName(resultSet: ISearchEventDataTemplate) {
      return getGroomName(resultSet._source)
    },
    groomIdentifier(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.groomIdentifier) || null
    },
    dateOfMarriage(resultSet: ISearchEventDataTemplate) {
      return (resultSet._source && resultSet._source.marriageDate) || null
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
  OperationHistorySearchSet: {
    operatorName(searchData: ISearchDataTemplate) {
      const names = [
        {
          use: 'en',
          given:
            (searchData.operatorFirstNames && [
              searchData.operatorFirstNames
            ]) ||
            null,
          family:
            (searchData.operatorFamilyName && [
              searchData.operatorFamilyName
            ]) ||
            null
        }
      ]

      if (NATIVE_LANGUAGE) {
        names.push({
          use: NATIVE_LANGUAGE,
          given:
            (searchData.operatorFirstNamesLocale && [
              searchData.operatorFirstNamesLocale
            ]) ||
            null,
          family:
            (searchData.operatorFamilyNameLocale && [
              searchData.operatorFamilyNameLocale
            ]) ||
            null
        })
      }

      return names
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
    startedBy: async (
      searchData: ISearchEventDataTemplate,
      _,
      { headers: authHeader }
    ) => {
      const res = await getUser(
        { practitionerId: searchData._source && searchData._source.createdBy },
        authHeader
      )
      // declarations created by health facilities don't have user
      // associated with it, so it returns an error
      if (res._id) return res
      return null
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
      { headers: authHeader }
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
  },
  AssignmentData: {
    async avatarURL(assignmentData: IAssignment, _, { headers: authHeader }) {
      const response = await fetch(
        new URL(`users/${assignmentData.userId}/avatar`, USER_MANAGEMENT_URL),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      const { userName, avatarURI }: IAvatarResponse = await response.json()

      if (avatarURI) {
        const avatarURL = await getPresignedUrlFromUri(avatarURI, authHeader)
        return avatarURL
      }
      return `${AVATAR_API}${userName}`
    }
  }
}
