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

import { DocumentNode } from 'graphql'
import { client } from '@client/utils/apolloClient'
import {
  CreateBirthRegistrationMutation,
  CreateDeathRegistrationMutation,
  FetchRecordStatusQuery
} from '@client/utils/gateway'
import { TransformedData } from '@client/forms'
import { gql } from '@apollo/client'

type Result = {
  recordId: string
  trackingId: string
  isPotentiallyDuplicate: boolean
}

const FETCH_RECORD_STATUS = gql`
  query fetchRecordStatus($draftId: ID!) {
    fetchRecordStatus(draftId: $draftId) {
      ... on RecordProcessing {
        processed
      }
      ... on RecordProcessed {
        processed
        trackingId
        hasPotentialDuplicates
        recordId
      }
    }
  }
`

export async function submitAndWaitUntilRecordInWorkqueue(
  mutation: DocumentNode,
  graphqlPayload: TransformedData,
  draftId: string
): Promise<Result> {
  const response = await client.mutate<
    CreateBirthRegistrationMutation | CreateDeathRegistrationMutation
  >({
    mutation,
    variables: {
      details: graphqlPayload
    }
  })

  if (response.errors) {
    /*
     * This should trigger resending the request to the gateway
     */
    throw new Error(response.errors[0].message)
  }

  if (!response.data) {
    throw new Error('No data returned from record creation mutation')
  }

  /*
   * Here we should know the request was received by the gateway.
   * Now we can start waiting until the record is found in a workqueue
   */

  let nthTry = 0

  while (true) {
    const result = await client.query<FetchRecordStatusQuery>({
      query: FETCH_RECORD_STATUS,
      fetchPolicy: 'no-cache',
      variables: {
        draftId
      }
    })
    if (result.data.fetchRecordStatus.__typename === 'RecordProcessed') {
      return {
        recordId: result.data.fetchRecordStatus.recordId,
        trackingId: result.data.fetchRecordStatus.trackingId,
        isPotentiallyDuplicate:
          result.data.fetchRecordStatus.hasPotentialDuplicates
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000 + nthTry * 1000))
    nthTry++
  }
}
