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
import { gql } from '@apollo/client'

const EVENT_SEARCH_RESULT_FIELDS = gql`
  fragment EventSearchFields on EventSearchSet {
    id
    type
    registration {
      status
      contactRelationship
      contactNumber
      trackingId
      eventLocationId
      registrationNumber
      registeredLocationId
      duplicates
      createdAt
      modifiedAt
      assignment {
        userId
        firstName
        lastName
        officeName
        avatarURL
      }
    }
    operationHistories {
      operationType
      operatedOn
      operatorRole
      operatorName {
        firstNames
        familyName
        use
      }
      operatorOfficeName
      operatorOfficeAlias
      notificationFacilityName
      notificationFacilityAlias
      rejectReason
      rejectComment
    }
    ... on BirthEventSearchSet {
      dateOfBirth
      childName {
        firstNames
        familyName
        use
      }
    }
    ... on DeathEventSearchSet {
      dateOfDeath
      deceasedName {
        firstNames
        familyName
        use
      }
    }
    ... on MarriageEventSearchSet {
      dateOfMarriage
      brideName {
        firstNames
        familyName
        use
      }
      groomName {
        firstNames
        familyName
        use
      }
    }
  }
`

export const REGISTRATION_HOME_QUERY = gql`
  ${EVENT_SEARCH_RESULT_FIELDS}
  query registrationHome(
    $declarationLocationId: String!
    $pageSize: Int
    $inProgressSkip: Int
    $healthSystemSkip: Int
    $reviewStatuses: [String]
    $reviewSkip: Int
    $rejectSkip: Int
    $approvalSkip: Int
    $externalValidationSkip: Int
    $printSkip: Int
    $issueSkip: Int
  ) {
    inProgressTab: searchEvents(
      advancedSearchParameters: {
        declarationLocationId: $declarationLocationId
        registrationStatuses: ["IN_PROGRESS"]
        compositionType: [
          "birth-declaration"
          "death-declaration"
          "marriage-declaration"
        ]
      }
      count: $pageSize
      skip: $inProgressSkip
    ) {
      totalItems
      results {
        ...EventSearchFields
      }
    }
    notificationTab: searchEvents(
      advancedSearchParameters: {
        declarationLocationId: $declarationLocationId
        registrationStatuses: ["IN_PROGRESS"]
        compositionType: [
          "birth-notification"
          "death-notification"
          "marriage-notification"
        ]
      }
      count: $pageSize
      skip: $healthSystemSkip
    ) {
      totalItems
      results {
        ...EventSearchFields
      }
    }
    reviewTab: searchEvents(
      advancedSearchParameters: {
        declarationLocationId: $declarationLocationId
        registrationStatuses: $reviewStatuses
      }
      count: $pageSize
      skip: $reviewSkip
    ) {
      totalItems
      results {
        ...EventSearchFields
      }
    }
    rejectTab: searchEvents(
      advancedSearchParameters: {
        declarationLocationId: $declarationLocationId
        registrationStatuses: ["REJECTED"]
      }
      count: $pageSize
      skip: $rejectSkip
      sortColumn: "createdAt.keyword"
      sort: "asc"
    ) {
      totalItems
      results {
        ...EventSearchFields
      }
    }
    approvalTab: searchEvents(
      advancedSearchParameters: {
        declarationLocationId: $declarationLocationId
        registrationStatuses: ["VALIDATED", "CORRECTION_REQUESTED"]
      }
      count: $pageSize
      skip: $approvalSkip
    ) {
      totalItems
      results {
        ...EventSearchFields
      }
    }
    externalValidationTab: searchEvents(
      advancedSearchParameters: {
        declarationLocationId: $declarationLocationId
        registrationStatuses: ["WAITING_VALIDATION"]
      }
      count: $pageSize
      skip: $externalValidationSkip
    ) {
      totalItems
      results {
        ...EventSearchFields
      }
    }
    printTab: searchEvents(
      advancedSearchParameters: {
        declarationLocationId: $declarationLocationId
        registrationStatuses: ["REGISTERED"]
      }
      count: $pageSize
      skip: $printSkip
    ) {
      totalItems
      results {
        ...EventSearchFields
      }
    }
    issueTab: searchEvents(
      advancedSearchParameters: {
        declarationLocationId: $declarationLocationId
        registrationStatuses: ["CERTIFIED"]
      }
      count: $pageSize
      skip: $issueSkip
    ) {
      totalItems
      results {
        ...EventSearchFields
      }
    }
  }
`

export const FIELD_AGENT_HOME_QUERY = gql`
  ${EVENT_SEARCH_RESULT_FIELDS}
  query fieldAgentHome(
    $userId: String
    $declarationLocationId: String!
    $pageSize: Int
    $reviewSkip: Int
    $rejectSkip: Int
  ) {
    reviewTab: searchEvents(
      userId: $userId
      advancedSearchParameters: {
        declarationLocationId: $declarationLocationId
        registrationStatuses: [
          "DECLARED"
          "IN_PROGRESS"
          "VALIDATED"
          "WAITING_VALIDATION"
          "REGISTERED"
        ]
      }
      count: $pageSize
      skip: $reviewSkip
    ) {
      totalItems
      results {
        ...EventSearchFields
      }
    }
    rejectTab: searchEvents(
      userId: $userId
      advancedSearchParameters: {
        declarationLocationId: $declarationLocationId
        registrationStatuses: ["REJECTED"]
      }
      count: $pageSize
      skip: $rejectSkip
      sortColumn: "createdAt.keyword"
      sort: "asc"
    ) {
      totalItems
      results {
        ...EventSearchFields
      }
    }
  }
`
