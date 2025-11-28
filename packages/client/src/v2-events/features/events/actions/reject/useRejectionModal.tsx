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

import React from 'react'
import { v4 as uuid } from 'uuid'
import { UUID } from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useModal } from '@client/v2-events/hooks/useModal'
import {
  REJECT_ACTIONS,
  RejectionState,
  Review as ReviewComponent
} from '@client/v2-events/features/events/components/Review'

export function useRejectionModal(eventId: UUID, allowArchive = true) {
  const [modal, openModal] = useModal()
  const events = useEvents()

  async function handleRejection(onClose: () => void) {
    const confirmedRejection = await openModal<RejectionState | null>(
      (close) => (
        <ReviewComponent.ActionModal.Reject
          allowArchive={allowArchive}
          close={close}
        />
      )
    )
    if (confirmedRejection) {
      const { rejectAction, message, isDuplicate } = confirmedRejection

      if (rejectAction === REJECT_ACTIONS.SEND_FOR_UPDATE) {
        events.actions.reject.mutate({
          eventId,
          declaration: {},
          transactionId: uuid(),
          annotation: {},
          content: { reason: message }
        })
      }

      if (rejectAction === REJECT_ACTIONS.ARCHIVE) {
        if (isDuplicate) {
          events.customActions.archiveOnDuplicate.mutate({
            eventId,
            declaration: {},
            transactionId: uuid(),
            content: { reason: message }
          })
        } else {
          events.actions.archive.mutate({
            eventId,
            declaration: {},
            transactionId: uuid(),
            annotation: {},
            content: { reason: message }
          })
        }
      }

      onClose()
      return
    }
  }

  return {
    rejectionModal: modal,
    handleRejection
  }
}
