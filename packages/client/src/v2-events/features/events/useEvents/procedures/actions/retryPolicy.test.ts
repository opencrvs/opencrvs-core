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
import type { TRPCClientError } from '@trpc/client'
import type { AppRouter } from '@client/v2-events/trpc'
import { retryTransientErrors } from './retryPolicy'

vi.mock('react-hot-toast', () => ({
  toast: { error: vi.fn() }
}))

function errorWithStatus(httpStatus: number | undefined) {
  return { data: { httpStatus } } as TRPCClientError<AppRouter>
}

describe('retryTransientErrors', () => {
  it.each([404, 409, 403, 400, 401])(
    'never retries a %i (4xx / permanent) error',
    (httpStatus) => {
      expect(retryTransientErrors(0, errorWithStatus(httpStatus))).toBe(false)
      expect(toast.error).not.toHaveBeenCalled()
    }
  )

  it('retries 5xx errors while under the attempt limit', () => {
    expect(retryTransientErrors(0, errorWithStatus(500))).toBe(true)
    expect(retryTransientErrors(9, errorWithStatus(500))).toBe(true)
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('retries network errors (no httpStatus) while under the attempt limit', () => {
    expect(retryTransientErrors(0, errorWithStatus(undefined))).toBe(true)
  })

  it('stops retrying and shows a toast once the attempt limit is reached', () => {
    expect(retryTransientErrors(10, errorWithStatus(500))).toBe(false)
    expect(toast.error).toHaveBeenCalledTimes(1)
  })

  it('never lets the failure count exceed the limit and continue retrying', () => {
    // Regression test: the original implementation always returned `true`
    // for non-409 errors regardless of failureCount, causing indefinite
    // retries (and therefore an indefinitely pending mutation / spinner)
    // on any other error, including plain 404s.
    expect(retryTransientErrors(100, errorWithStatus(500))).toBe(false)
  })
})
