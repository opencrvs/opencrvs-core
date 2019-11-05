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

export const FETCH_METRIC = gql`
  query fetchBirthRegistrationMetrics(
    $timeStart: String!
    $timeEnd: String!
    $locationId: String!
  ) {
    fetchBirthRegistrationMetrics(
      timeStart: $timeStart
      timeEnd: $timeEnd
      locationId: $locationId
    ) {
      keyFigures {
        label
        value
        total
        estimate
        categoricalData {
          name
          value
        }
      }
      regByAge {
        label
        value
      }
      regWithin45d {
        label
        value
        totalEstimate
      }
    }
  }
`
