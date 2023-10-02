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

export const HAS_CHILD_LOCATION = gql`
  query hasChildLocation($parentId: String!) {
    hasChildLocation(parentId: $parentId) {
      id
      type
      identifier {
        system
        value
      }
    }
  }
`

export const FETCH_MONTH_WISE_EVENT_ESTIMATIONS = gql`
  query fetchMonthWiseEventMetrics(
    $timeStart: String!
    $timeEnd: String!
    $locationId: String
    $event: String!
  ) {
    fetchMonthWiseEventMetrics(
      timeStart: $timeStart
      timeEnd: $timeEnd
      locationId: $locationId
      event: $event
    ) {
      total
      estimated
      withinTarget
      within1Year
      within5Years
      month
      year
    }
  }
`

export const FETCH_LOCATION_WISE_EVENT_ESTIMATIONS = gql`
  query fetchLocationWiseEventMetrics(
    $timeStart: String!
    $timeEnd: String!
    $locationId: String
    $event: String!
  ) {
    fetchLocationWiseEventMetrics(
      timeStart: $timeStart
      timeEnd: $timeEnd
      locationId: $locationId
      event: $event
    ) {
      total
      withinTarget
      within1Year
      within5Years
      estimated
      locationId
      locationName
    }
  }
`

export const FETCH_EVENTS_WITH_PROGRESS = gql`
  query getEventsWithProgress(
    $declarationJurisdictionId: String!
    $count: Int
    $skip: Int
    $registrationStatuses: [String]
    $compositionType: [String]
  ) {
    getEventsWithProgress(
      count: $count
      skip: $skip
      declarationJurisdictionId: $declarationJurisdictionId
      registrationStatuses: $registrationStatuses
      compositionType: $compositionType
    ) {
      totalItems
      results {
        id
        type
        name {
          use
          firstNames
          familyName
        }
        dateOfEvent
        registration {
          status
          contactNumber
          contactRelationship
          dateOfDeclaration
          trackingId
          registrationNumber
          createdAt
          modifiedAt
        }
        startedBy {
          name {
            use
            firstNames
            familyName
          }
          systemRole
          role {
            _id
            labels {
              lang
              label
            }
          }
        }
        startedByFacility
        startedAt
        progressReport {
          timeInProgress
          timeInReadyForReview
          timeInRequiresUpdates
          timeInWaitingForApproval
          timeInWaitingForBRIS
          timeInReadyToPrint
        }
      }
    }
  }
`

export const FETCH_REGISTRATIONS = gql`
  query getRegistrationsListByFilter(
    $event: String!
    $timeStart: String!
    $timeEnd: String!
    $filterBy: String!
    $locationId: String
    $skip: Int!
    $size: Int!
  ) {
    getRegistrationsListByFilter(
      timeStart: $timeStart
      timeEnd: $timeEnd
      locationId: $locationId
      event: $event
      filterBy: $filterBy
      skip: $skip
      size: $size
    ) {
      __typename
      ... on TotalMetricsByRegistrar {
        __typename
        results {
          total
          late
          delayed
          registrarPractitioner {
            id
            systemRole
            role {
              _id
              labels {
                lang
                label
              }
            }
            primaryOffice {
              name
              id
            }
            name {
              firstNames
              familyName
              use
            }
            avatar {
              type
              data
            }
          }
        }
        total
      }
      ... on TotalMetricsByLocation {
        results {
          total
          late
          delayed
          home
          healthFacility
          location {
            name
          }
        }
        total
      }
      ... on TotalMetricsByTime {
        results {
          total
          delayed
          late
          home
          healthFacility
          month
          time
        }
        total
      }
    }
  }
`

export const FETCH_FIELD_AGENTS_WITH_PERFORMANCE_DATA = gql`
  query searchFieldAgents(
    $locationId: String
    $primaryOfficeId: String
    $timeStart: String!
    $timeEnd: String!
    $event: String
    $status: String
    $language: String
    $count: Int
    $skip: Int
    $sort: String
  ) {
    searchFieldAgents(
      timeStart: $timeStart
      timeEnd: $timeEnd
      locationId: $locationId
      primaryOfficeId: $primaryOfficeId
      event: $event
      status: $status
      language: $language
      count: $count
      skip: $skip
      sort: $sort
    ) {
      results {
        practitionerId
        fullName
        role {
          labels {
            label
            lang
          }
        }
        status
        avatar {
          type
          data
        }
        primaryOfficeId
        creationDate
        totalNumberOfDeclarationStarted
        totalNumberOfInProgressAppStarted
        totalNumberOfRejectedDeclarations
        averageTimeForDeclaredDeclarations
      }
      totalItems
    }
  }
`
export const GET_TOTAL_PAYMENTS = gql`
  query getTotalPayments(
    $timeStart: String!
    $timeEnd: String!
    $locationId: String
    $event: String!
  ) {
    getTotalPayments(
      timeStart: $timeStart
      timeEnd: $timeEnd
      locationId: $locationId
      event: $event
    ) {
      total
      paymentType
    }
  }
`
export const GET_TOTAL_CERTIFICATIONS = gql`
  query getTotalCertifications(
    $timeStart: String!
    $timeEnd: String!
    $locationId: String
  ) {
    getTotalCertifications(
      timeStart: $timeStart
      timeEnd: $timeEnd
      locationId: $locationId
    ) {
      total
      eventType
    }
  }
`
