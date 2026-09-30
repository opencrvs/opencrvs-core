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
import { EventDocument, isPotentialDuplicate } from '@opencrvs/commons/client'
import { deleteLocalEvent } from '@client/v2-events/features/events/useEvents/api'
import { AppRouter } from '@client/v2-events/trpc'
import { ToastKey } from '@client/v2-events/routes/Toaster'

import { showToast } from '../../../useToastAndRedirect'

/**
 * Retry, error and success handlers shared by the mutation defaults of both the
 * generic event actions and the composed custom actions.
 */

function showToastOnDuplicateDetected(event: EventDocument) {
  showToast({
    message: {
      defaultMessage:
        '{trackingId} is a potential duplicate. Record is ready for review.',
      id: 'event.declaration.potentialDuplicateDetected',
      description:
        'Notification for potential duplicate declaration. Shown when a potential duplicate is detected after declaring an event.'
    },
    toastType: 'error',
    toastId: `duplicate-detected-${event.trackingId}`,
    messageOpts: { trackingId: event.trackingId }
  })
}

export function deleteLocalEventAndToastOnDuplicate(event: EventDocument) {
  void deleteLocalEvent(event)

  if (isPotentialDuplicate(event.actions)) {
    showToastOnDuplicateDetected(event)
  }
}

export function retryUnlessConflict(
  _failureCount: number,
  error: TRPCClientError<AppRouter>
) {
  if (_failureCount === 10) {
    toast.error(ToastKey.SOMETHING_WENT_WRONG)
  }
  return error.data?.httpStatus !== 409
}

export function retryDelay(attemptIndex: number) {
  return Math.max(10000, 1000 * 2 ** attemptIndex)
}

export function errorToastOnConflict(error: TRPCClientError<AppRouter>) {
  if (error.data?.httpStatus === 409) {
    toast.error(ToastKey.NOT_ASSIGNED_ERROR)
  }
}
