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
import { UserAuditLog } from '@opencrvs/commons/events'
import { logger } from '@opencrvs/commons'
import { env } from '@user-mgnt/environment'
import { AppRouter } from '@opencrvs/events/src/router'

export function recordUserAuditEvent(token: string, input: UserAuditLog): void {
  const client = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: env.EVENTS_URL,
        transformer: superjson,
        headers: { Authorization: token }
      })
    ]
  })
  client.user.audit.record.mutate(input).catch((err) => {
    logger.error('Failed to record user audit event', err)
    throw err
  })
}
