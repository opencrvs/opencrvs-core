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
import {
  CorrectedAction,
  deepMerge,
  EventDocument,
  getCurrentEventState,
  RequestedCorrectionAction
} from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { CorrectionDetails } from '@client/v2-events/features/events/actions/correct/request/Summary/CorrectionDetails'

export function RequestCorrection({
  action,
  fullEvent
}: {
  action: RequestedCorrectionAction | CorrectedAction
  fullEvent: EventDocument
}) {
  const { eventConfiguration } = useEventConfiguration(fullEvent.type)

  // We need to get the state of the event before the correction request was made
  // so that we can display the original, uncorrected values
  const eventBeforeCorrectionRequest = {
    ...fullEvent,
    actions: fullEvent.actions.slice(0, fullEvent.actions.indexOf(action))
  }

  const eventIndex = getCurrentEventState(
    eventBeforeCorrectionRequest,
    eventConfiguration
  )

  if (!action.annotation) {
    return
  }

  return (
    <CorrectionDetails
      annotation={deepMerge(eventIndex.declaration, action.annotation)}
      event={eventBeforeCorrectionRequest}
      eventType={action.type}
      form={deepMerge(eventIndex.declaration, action.declaration)}
    />
  )
}
