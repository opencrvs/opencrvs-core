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

export const PERFORMANCE_METRICS_FOR_OFFICE = gql`
  query data($timeStart: String!, $timeEnd: String!, $locationId: String!) {
    getDeclarationsStartedMetrics(
      timeStart: $timeStart
      timeEnd: $timeEnd
      locationId: $locationId
    ) {
      fieldAgentDeclarations
      hospitalDeclarations
      officeDeclarations
    }
  }
`
export const PERFORMANCE_METRICS = gql`
  query data($timeStart: String!, $timeEnd: String!, $locationId: String!) {
    getTotalMetrics(
      timeStart: $timeStart
      timeEnd: $timeEnd
      locationId: $locationId
    ) {
      estimated
      results {
        total
        gender
        eventLocationType
        timeLabel
      }
    }

    getDeclarationsStartedMetrics(
      timeStart: $timeStart
      timeEnd: $timeEnd
      locationId: $locationId
    ) {
      fieldAgentDeclarations
      hospitalDeclarations
      officeDeclarations
    }
  }
`
