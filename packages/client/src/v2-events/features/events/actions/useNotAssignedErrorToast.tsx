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
import React, { useState } from 'react'
import { TRPCClientError } from '@trpc/client'
import { useIntl } from 'react-intl'
import { Toast } from '@opencrvs/components'

export function useNotAssignedErrorToast(eventTrackingId?: string) {
  const intl = useIntl()
  const [hasNotAssignedError, setHasNotAssignedError] = useState(false)

  function NotAssignedErrorToast() {
    if (!hasNotAssignedError) {
      return <></>
    }

    return (
      <Toast
        id="not-assigned-error"
        type="error"
        onClose={() => setHasNotAssignedError(false)}
      >
        {intl.formatMessage({
          id: 'v2.errors.notAssigned',
          defaultMessage: "You've been unassigned from the event",
          description: 'User not assigned error toast message'
        })}
        {eventTrackingId ? `: ${eventTrackingId}` : ''}
      </Toast>
    )
  }

  function onPossibleNotAssignedError(error: Error | unknown) {
    if (error instanceof TRPCClientError && error.data?.httpStatus === 409) {
      setHasNotAssignedError(true)
    }
  }

  return {
    onPossibleNotAssignedError,
    NotAssignedErrorToast
  }
}
