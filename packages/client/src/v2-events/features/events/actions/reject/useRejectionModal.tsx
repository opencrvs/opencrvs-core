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
import {
  EventIndex,
  getActionConfig,
  getActionFormFields,
  ActionType
} from '@opencrvs/commons/client'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useModal } from '@client/v2-events/hooks/useModal'
import {
  Review as ReviewComponent,
  RejectActionModalResult
} from '@client/v2-events/features/events/components/Review'
import { useEventConfigurationForEvent } from '@client/v2-events/features/events/useEventConfiguration'

export function useRejectionModal(event: EventIndex) {
  const eventId = event.id
  const [modal, openModal] = useModal()
  const events = useEvents()
  const { eventConfiguration } = useEventConfigurationForEvent(event)
  const rejectActionConfig = getActionConfig({
    eventConfiguration,
    actionType: ActionType.REJECT
  })

  const supportingCopy = rejectActionConfig?.supportingCopy
  const fields = getActionFormFields(eventConfiguration, ActionType.REJECT)

  async function handleRejection(onClose: () => void) {
    const modalResult = await openModal<RejectActionModalResult | null>(
      (close) => (
        <ReviewComponent.ActionModal.Reject
          close={close}
          eventConfiguration={eventConfiguration}
          fields={fields}
          supportingCopy={supportingCopy}
        />
      )
    )

    if (modalResult) {
      events.actions.reject.mutate({
        eventId,
        declaration: {},
        transactionId: uuid(),
        annotation: modalResult.values,
        content: { reason: modalResult.reason }
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
