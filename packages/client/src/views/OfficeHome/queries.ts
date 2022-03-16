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
import gql from 'graphql-tag'

const allSearchFields = `
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
  `

export const REGISTRATION_HOME_QUERY = gql`
  query registrationHome(
    $locationIds: [String]
    $count: Int
    $inProgressCount: Int
    $reviewCount: Int
    $rejectCount: Int
    $approvalCount: Int
    $externalValidationCount: Int
    $printCount: Int
    $inProgressSkip: Int
    $reviewStatuses: [String]
    $reviewSkip: Int
    $rejectSkip: Int
    $approvalSkip: Int
    $externalValidationSkip: Int
    $printSkip: Int
  ) {
    inProgressTab: searchEvents(
      locationIds: $locationIds
      status: ["IN_PROGRESS"]
      type: ["birth-declaration", "death-declaration"]
      count: $inProgressCount
      skip: $inProgressSkip
    ) {
      totalItems
      results {
        ${allSearchFields}
      }
    }
    notificationTab: searchEvents(
      locationIds: $locationIds
      status: ["IN_PROGRESS"]
      type: ["birth-notification", "death-notification"]
      count: $count
      skip: $inProgressSkip
    ) {
      totalItems
      results {
        ${allSearchFields}
      }
    }
    reviewTab: searchEvents(
      locationIds: $locationIds
      status: $reviewStatuses
      count: $reviewCount
      skip: $reviewSkip
    ) {
      totalItems
      results {
        ${allSearchFields}
      }
    }
    rejectTab: searchEvents(
      locationIds: $locationIds
      status: ["REJECTED"]
      count: $rejectCount
      skip: $rejectSkip  
      sortColumn: "createdAt.keyword"          
      sort: "asc"
    ) {
      totalItems
      results {
        ${allSearchFields}
      }
    }
    approvalTab: searchEvents(
      locationIds: $locationIds
      status: ["VALIDATED"]
      count: $approvalCount
      skip: $approvalSkip
    ) {
      totalItems
      results {
        ${allSearchFields}
      }
    }
    externalValidationTab: searchEvents(
      locationIds: $locationIds
      status: ["WAITING_VALIDATION"]
      count: $externalValidationCount
      skip: $externalValidationSkip
    ) {
      totalItems
      results {
        ${allSearchFields}
      }
    }
    printTab: searchEvents(
      locationIds: $locationIds
      status: ["REGISTERED"]
      count: $printCount
      skip: $printSkip
    ) {
      totalItems
      results {
        ${allSearchFields}
      }
    }
  }
`

export const SEARCH_EVENTS = gql`
  query(
    $sort: String
    $trackingId: String
    $contactNumber: String
    $registrationNumber: String
    $status: [String]
    $locationIds: [String]
    $count: Int
    $skip: Int
  ) {
    searchEvents(
      sort: $sort
      trackingId: $trackingId
      registrationNumber: $registrationNumber
      contactNumber: $contactNumber
      locationIds: $locationIds
      status: $status
      count: $count
      skip: $skip
    ) {
      totalItems
      results {
        ${allSearchFields}
      }
    }
  }
`

export const FETCH_REGISTRATION_BY_COMPOSITION = gql`
  query data($id: ID!) {
    fetchRegistration(id: $id) {
      id
      registration {
        id
        type
        status {
          id
          user {
            id
            name {
              use
              firstNames
              familyName
            }
            role
          }
          location {
            id
            name
            alias
          }
          office {
            name
            alias
            address {
              district
              state
            }
          }
          type
          timestamp
          comments {
            comment
          }
        }
        contact
        contactPhoneNumber
      }
      ... on BirthRegistration {
        child {
          id
          multipleBirth
          name {
            use
            firstNames
            familyName
          }
          birthDate
        }
      }
      ... on DeathRegistration {
        deceased {
          name {
            use
            firstNames
            familyName
          }
          deceased {
            deathDate
          }
        }
        informant {
          individual {
            telecom {
              use
              system
              value
            }
          }
        }
      }
    }
  }
`
