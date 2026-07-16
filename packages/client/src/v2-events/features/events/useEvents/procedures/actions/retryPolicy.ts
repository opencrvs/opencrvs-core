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
import { toast } from 'react-hot-toast'
import { TRPCClientError } from '@trpc/client'
import type { AppRouter } from '@client/v2-events/trpc'
import { ToastKey } from '@client/v2-events/routes/Toaster'

export const MAX_ACTION_RETRY_ATTEMPTS = 10

/**
 * 4xx errors (404 Not Found, 409 Conflict, 403 Forbidden, ...) represent
 * permanent failures — retrying the same request will not change the
 * outcome. Only 5xx / network errors (no httpStatus at all) are transient
 * and worth retrying. Matches the convention already used for
 * `shouldDehydrateMutation` (trpc.tsx) and `event.delete`'s retry (delete.ts).
 */
function isPermanentClientError(error: TRPCClientError<AppRouter>) {
  const httpStatus = error.data?.httpStatus
  return typeof httpStatus === 'number' && httpStatus >= 400 && httpStatus < 500
}

/**
 * Retries transient (5xx / network) errors, up to a maximum number of
 * attempts, surfacing a toast once that limit is reached. Never retries 4xx
 * errors, since those won't succeed no matter how many times we resend the
 * same request.
 */
export function retryTransientErrors(
  failureCount: number,
  error: TRPCClientError<AppRouter>
) {
  if (isPermanentClientError(error)) {
    return false
  }
  if (failureCount >= MAX_ACTION_RETRY_ATTEMPTS) {
    toast.error(ToastKey.SOMETHING_WENT_WRONG)
    return false
  }
  return true
}

export function retryDelay(attemptIndex: number) {
  return Math.max(10000, 1000 * 2 ** attemptIndex)
}
