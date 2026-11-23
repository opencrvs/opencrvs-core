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
import { UUID, getActionConfig, ActionType } from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useModal } from '@client/v2-events/hooks/useModal'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'

export function useRejectionModal(eventId: UUID, eventType: string) {
  const [modal, openModal] = useModal()
  const events = useEvents()
  const { eventConfiguration } = useEventConfiguration(eventType)
  const rejectActionConfig = getActionConfig({
    eventConfiguration,
    actionType: ActionType.REJECT
  })

  const supportingCopy = rejectActionConfig?.supportingCopy

  async function handleRejection(onClose: () => void) {
    const confirmedRejection = await openModal<string | null>((close) => (
      <ReviewComponent.ActionModal.Reject
        close={close}
        supportingCopy={supportingCopy}
      />
    ))

    if (confirmedRejection) {
      events.actions.reject.mutate({
        eventId,
        declaration: {},
        transactionId: uuid(),
        annotation: {},
        content: { reason: confirmedRejection }
      })

      onClose()
      return
    }
  }

  return {
    rejectionModal: modal,
    handleRejection
  }
}
