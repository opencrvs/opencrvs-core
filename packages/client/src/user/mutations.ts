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
import { InternalRefetchQueriesInclude, gql } from '@apollo/client'

const RESEND_SMS_INVITE = gql`
  mutation resendSMSInvite($userId: String!) {
    resendSMSInvite(userId: $userId)
  }
`
async function resendSMSInvite(
  userId: string,
  refetchQueries: InternalRefetchQueriesInclude
) {
  return (
    client &&
    client.mutate({
      mutation: RESEND_SMS_INVITE,
      variables: { userId },
      refetchQueries
    })
  )
}
const RESET_PASSWORD_SMS = gql`
  mutation resetPasswordSMS($userId: String!, $applicationName: String!) {
    resetPasswordSMS(userId: $userId, applicationName: $applicationName)
  }
`
async function sendResetPasswordSMS(
  userId: string,
  applicationName: string,
  refetchQueries: InternalRefetchQueriesInclude
) {
  return (
    client &&
    client.mutate({
      mutation: RESET_PASSWORD_SMS,
      variables: { userId, applicationName },
      refetchQueries
    })
  )
}

export const userMutations = {
  resendSMSInvite,
  sendResetPasswordSMS
}
