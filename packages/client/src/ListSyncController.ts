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
import { client } from '@client/utils/apolloClient'
import {
  REGISTRATION_HOME_QUERY,
  FIELD_AGENT_HOME_QUERY
} from '@client/views/OfficeHome/queries'

export async function syncRegistrarWorkqueue(
  locationId: string,
  reviewStatuses: string[],
  pageSize: number,
  isFieldAgent: boolean,
  inProgressSkip: number,
  healthSystemSkip: number,
  reviewSkip: number,
  rejectSkip: number,
  approvalSkip: number,
  externalValidationSkip: number,
  printSkip: number,
  userId?: string
) {
  if (isFieldAgent && userId) {
    try {
      const queryResult = await client.query({
        query: FIELD_AGENT_HOME_QUERY,
        variables: {
          userId: userId,
          locationIds: [locationId],
          pageSize,
          reviewSkip: reviewSkip,
          rejectSkip: rejectSkip
        },
        fetchPolicy: 'no-cache'
      })
      return queryResult.data
    } catch (exception) {
      return undefined
    }
  } else {
    try {
      const queryResult = await client.query({
        query: REGISTRATION_HOME_QUERY,
        variables: {
          locationIds: [locationId],
          pageSize,
          reviewStatuses: reviewStatuses,
          inProgressSkip: inProgressSkip,
          healthSystemSkip: healthSystemSkip,
          reviewSkip: reviewSkip,
          rejectSkip: rejectSkip,
          approvalSkip: approvalSkip,
          externalValidationSkip: externalValidationSkip,
          printSkip: printSkip
        },
        fetchPolicy: 'no-cache'
      })
      return queryResult.data
    } catch (exception) {
      return undefined
    }
  }
}
