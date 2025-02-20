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
import { AVATAR_API, NATIVE_LANGUAGE } from '@gateway/constants'
import {
  IEventDurationResponse,
  getEventDurationsFromMetrics
} from '@gateway/features/metrics/service'
import { getPresignedUrlFromUri } from '@gateway/features/registration/utils'
import {
  GQLOperationHistorySearchSet,
  GQLResolver
} from '@gateway/graphql/schema'
import { getFullName } from '@gateway/features/user/utils'
import { EVENT } from '@opencrvs/commons'

interface ISearchEventDataTemplate {
  _type: string
  _id: string
  _source: ISearchDataTemplate
}
interface ISearchDataTemplate {
  [key: string]: any
  compositionId: string
  informantType?: string
  contactNumber?: string
  contactEmail?: string
  eventLocationId?: string
}

interface IAssignment {
  officeName: string
  firstName: string
  lastName: string
  practitionerId: string
  createdAt: string
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
      given:
        ((source.childFirstNames || source.childMiddleName) && [
          source.childFirstNames,
          source.childMiddleName
        ]) ||
        null,
      family: source.childFamilyName || null
    }
  ]

  if (NATIVE_LANGUAGE) {
    names.push({
      use: NATIVE_LANGUAGE,
      given:
        ((source.childFirstNamesLocal || source.childMiddleNameLocal) && [
          source.childFirstNamesLocal,
          source.childMiddleNameLocal
        ]) ||
        null,
      family: source.childFamilyNameLocal || null
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
      given:
        ((source.deceasedFirstNames || source.deceasedMiddleName) && [
          source.deceasedFirstNames,
          source.deceasedMiddleName
        ]) ||
        null,
      family: source.deceasedFamilyName || null
    }
  ]

  if (NATIVE_LANGUAGE) {
    names.push({
      use: NATIVE_LANGUAGE,
      given:
        ((source.deceasedFirstNamesLocal || source.deceasedMiddleNameLocal) && [
          source.deceasedFirstNamesLocal,
          source.deceasedMiddleNameLocal
        ]) ||
        null,
      family: source.deceasedFamilyNameLocal || null
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
      given:
        ((source.brideFirstNames || source.brideMiddleName) && [
          source.brideFirstNames,
          source.brideMiddleName
        ]) ||
        null,
      family: source.brideFamilyName || null
    }
  ]

  if (NATIVE_LANGUAGE) {
    names.push({
      use: NATIVE_LANGUAGE,
      given:
        ((source.brideFirstNamesLocal || source.brideMiddleNameLocal) && [
          source.brideFirstNamesLocal,
          source.brideMiddleNameLocal
        ]) ||
        null,
      family: source.brideFamilyNameLocal || null
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
      given:
        ((source.groomFirstNames || source.groomMiddleName) && [
          source.groomFirstNames,
          source.groomMiddleName
        ]) ||
        null,
      family: source.groomFamilyName || null
    }
  ]

  if (NATIVE_LANGUAGE) {
    names.push({
      use: NATIVE_LANGUAGE,
      given:
        ((source.groomFirstNamesLocal || source.groomMiddleNameLocal) && [
          source.groomFirstNamesLocal,
          source.groomMiddleNameLocal
        ]) ||
        null,
      family: source.groomFamilyNameLocal || null
    })
  }

  return names
}

export const searchTypeResolvers: GQLResolver = {
  EventSearchSet: {
    __resolveType(obj: ISearchEventDataTemplate) {
      if (obj._source.event === EVENT.BIRTH) {
        return 'BirthEventSearchSet'
      }
      if (obj._source.event === EVENT.DEATH) {
        return 'DeathEventSearchSet'
      }
      if (obj._source.event === EVENT.MARRIAGE) {
        return 'MarriageEventSearchSet'
      }
      return null as never
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
    },
    contactRelationship(searchData: ISearchDataTemplate) {
      return searchData.informantType
    },
    contactNumber(searchData: ISearchDataTemplate) {
      return searchData.contactNumber
    },
    contactEmail(searchData: ISearchDataTemplate) {
      return searchData.contactEmail
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
      if (searchData._source.event === EVENT.BIRTH) {
        return getChildName(searchData._source)
      } else if (searchData._source.event === EVENT.DEATH) {
        return getDeceasedName(searchData._source)
      }
      return null
    },
    dateOfEvent(searchData: ISearchEventDataTemplate) {
      if (searchData._source.event === EVENT.BIRTH) {
        return (searchData._source && searchData._source.childDoB) || null
      } else if (searchData._source.event === EVENT.DEATH) {
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
      { dataSources }
    ) => {
      const res = await dataSources.usersAPI.getUserByPractitionerId(
        searchData._source && searchData._source.createdBy
      )
      // declarations created by health facilities don't have user
      // associated with it, so it returns an error
      if (res._id) return res
      return null
    },
    async startedByFacility(
      searchData: ISearchEventDataTemplate,
      _,
      { dataSources }
    ) {
      if (!searchData._source.eventLocationId) return null

      const location = await dataSources.locationsAPI.getLocation(
        searchData._source.eventLocationId
      )
      return location.name
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
    async avatarURL(
      assignmentData: IAssignment,
      _,
      { dataSources, headers: authHeader, presignDocumentUrls }
    ) {
      const user = await dataSources.usersAPI.getUserByPractitionerId(
        assignmentData.practitionerId
      )

      if (user.avatar?.data) {
        if (!presignDocumentUrls) {
          return user.avatar.data
        }
        const avatarURL = await getPresignedUrlFromUri(
          user.avatar.data,
          authHeader
        )
        return avatarURL
      }

      const userName = getFullName(user, 'en')

      return `${AVATAR_API}${userName}`
    }
  }
}
