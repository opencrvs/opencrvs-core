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

export const CORRECTION_TOTALS = gql`
  query getTotalCorrections(
    $event: String!
    $timeStart: String!
    $timeEnd: String!
    $locationId: String
  ) {
    getTotalCorrections(
      timeStart: $timeStart
      timeEnd: $timeEnd
      locationId: $locationId
      event: $event
    ) @persist {
      total
      reason
    }
  }
`
export const PERFORMANCE_METRICS = gql`
  query getTotalMetrics(
    $event: String!
    $timeStart: String!
    $timeEnd: String!
    $locationId: String
  ) {
    getTotalMetrics(
      timeStart: $timeStart
      timeEnd: $timeEnd
      locationId: $locationId
      event: $event
    ) @persist {
      estimated {
        totalEstimation
        maleEstimation
        femaleEstimation
        locationId
        locationLevel
      }
      results {
        total
        gender
        eventLocationType
        practitionerRole
        timeLabel
      }
    }
  }
`

export const PERFORMANCE_STATS = gql`
  query getLocationStatistics(
    $locationId: String
    $populationYear: Int!
    $status: [String]!
    $event: String
    $officeSelected: Boolean!
  ) {
    getLocationStatistics(
      locationId: $locationId
      populationYear: $populationYear
    ) @persist @skip(if: $officeSelected) {
      population
      offices
      registrars
    }

    fetchRegistrationCountByStatus(
      locationId: $locationId
      status: $status
      event: $event
    ) @persist {
      results {
        status
        count
      }
      total
    }
  }
`
