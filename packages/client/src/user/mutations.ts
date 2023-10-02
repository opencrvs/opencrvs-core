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
import { client } from '@client/utils/apolloClient'
import { InternalRefetchQueriesInclude, gql } from '@apollo/client'

const RESEND_SMS_INVITE = gql`
  mutation resendInvite($userId: String!) {
    resendInvite(userId: $userId)
  }
`
const USERNAME_REMINDER = gql`
  mutation usernameReminder($userId: String!) {
    usernameReminder(userId: $userId)
  }
`

async function resendInvite(
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
const RESET_PASSWORD_INVITE = gql`
  mutation resetPasswordInvite($userId: String!) {
    resetPasswordInvite(userId: $userId)
  }
`
async function sendResetPasswordInvite(
  userId: string,
  refetchQueries: InternalRefetchQueriesInclude
) {
  return (
    client &&
    client.mutate({
      mutation: RESET_PASSWORD_INVITE,
      variables: { userId },
      refetchQueries
    })
  )
}

async function usernameReminderSend(
  userId: string,
  refetchQueries: InternalRefetchQueriesInclude
) {
  return (
    client &&
    client.mutate({
      mutation: USERNAME_REMINDER,
      variables: { userId },
      refetchQueries
    })
  )
}

export const userMutations = {
  resendInvite,
  usernameReminderSend,
  sendResetPasswordInvite
}
