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
import { REGISTRATION_HOME_QUERY } from '@client/views/RegistrationHome/queries'
import { IQueryData } from '@client/views/RegistrationHome/RegistrationHome'
import ApolloClient, { ApolloError } from 'apollo-client'
import { Dispatch } from 'redux'
import { updateRegistrarWorkQueue } from './applications'

const onSuccess = (dispatch: Dispatch, result: IQueryData) => {
  dispatch(updateRegistrarWorkQueue(false, false, result))
}

const onError = (dispatch: Dispatch, error: ApolloError) => {
  dispatch(updateRegistrarWorkQueue(false, true))
}
const queryData = async (
  dispatch: Dispatch,
  locationId: string,
  reviewStatuses: string[],
  inProgressSkip: number,
  reviewSkip: number,
  rejectSkip: number,
  approvalSkip: number,
  printSkip: number,
  client: ApolloClient<{}>
) => {
  try {
    const queryResult = await client.query({
      query: REGISTRATION_HOME_QUERY,
      variables: {
        locationIds: [locationId],
        count: 10,
        reviewStatuses: reviewStatuses,
        inProgressSkip: inProgressSkip,
        reviewSkip: reviewSkip,
        rejectSkip: rejectSkip,
        approvalSkip: approvalSkip,
        printSkip: printSkip
      },
      fetchPolicy: 'no-cache'
    })
    onSuccess(dispatch, queryResult.data)
  } catch (exception) {
    onError(dispatch, exception)
  }
}
export const syncRegistrarWorkqueue = (
  dispatch: Dispatch,
  requireLoading: boolean = false,
  locationId: string,
  reviewStatuses: string[],
  client: ApolloClient<{}>,
  inProgressSkip: number = 0,
  reviewSkip: number = 0,
  rejectSkip: number = 0,
  approvalSkip: number = 0,
  printSkip: number = 0
) => {
  if (requireLoading) {
    dispatch(updateRegistrarWorkQueue(true, false))
    queryData(
      dispatch,
      locationId,
      reviewStatuses,
      inProgressSkip,
      reviewSkip,
      rejectSkip,
      approvalSkip,
      printSkip,
      client
    )
  }
}
