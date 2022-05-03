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

export const HAS_CHILD_LOCATION = gql`
  query data($parentId: String!) {
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
  query data(
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
  query data(
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

export const FETCH_STATUS_WISE_REGISTRATION_COUNT = gql`
  query data($locationId: String!, $status: [String]!) {
    fetchRegistrationCountByStatus(locationId: $locationId, status: $status) {
      results {
        status
        count
      }
      total
    }
  }
`

export const FETCH_EVENTS_WITH_PROGRESS = gql`
  query data(
    $locationId: String!
    $count: Int
    $skip: Int
    $status: [String]
    $type: [String]
  ) {
    getEventsWithProgress(
      count: $count
      skip: $skip
      locationId: $locationId
      status: $status
      type: $type
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
          role
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
export const FETCH_FIELD_AGENTS_WITH_PERFORMANCE_DATA = gql`
  query data(
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
        type
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
  query data(
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
  query data($timeStart: String!, $timeEnd: String!, $locationId: String) {
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
