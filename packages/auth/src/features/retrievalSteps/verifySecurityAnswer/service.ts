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
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import { env } from '@auth/environment'
import { AppRouter } from '@opencrvs/events/src/router'

const eventsClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: env.EVENTS_URL,
      transformer: superjson
    })
  ]
})

export interface IVerifySecurityAnswerResponse {
  matched: boolean
  questionKey: string
}

export async function verifySecurityAnswer(
  userId: string,
  questionKey: string,
  answer: string
): Promise<IVerifySecurityAnswerResponse> {
  return eventsClient.user.verifySecurityAnswer.mutate({
    userId,
    questionKey,
    answer
  })
}
