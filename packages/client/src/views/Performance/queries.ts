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
    $locationId: String!
    $event: String!
  ) {
    fetchMonthWiseEventMetrics(
      timeStart: $timeStart
      timeEnd: $timeEnd
      locationId: $locationId
      event: $event
    ) {
      details {
        actualTotalRegistration
        actual45DayRegistration
        estimatedRegistration
        estimated45DayPercentage
        month
        year
        startOfMonth
      }
      total {
        actualTotalRegistration
        actual45DayRegistration
        estimatedRegistration
        estimated45DayPercentage
      }
    }
  }
`

export const FETCH_LOCATION_WISE_EVENT_ESTIMATIONS = gql`
  query data(
    $timeStart: String!
    $timeEnd: String!
    $locationId: String!
    $event: String!
  ) {
    fetchLocationWiseEventMetrics(
      timeStart: $timeStart
      timeEnd: $timeEnd
      locationId: $locationId
      event: $event
    ) {
      details {
        actualTotalRegistration
        actual45DayRegistration
        estimatedRegistration
        estimated45DayPercentage
        locationId
        locationName
      }
      total {
        actualTotalRegistration
        actual45DayRegistration
        estimatedRegistration
        estimated45DayPercentage
      }
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
  query data($locationIds: [String], $count: Int, $skip: Int) {
    getEventsWithProgress(
      count: $count
      skip: $skip
      locationIds: $locationIds
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
          dateOfApplication
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
