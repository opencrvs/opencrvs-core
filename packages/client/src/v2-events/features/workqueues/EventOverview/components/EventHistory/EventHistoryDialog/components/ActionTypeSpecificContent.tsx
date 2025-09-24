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
import { z } from 'zod'
import {
  ActionType,
  DeclarationActions,
  EventDocument,
  PrintCertificateAction,
  RequestedCorrectionAction
} from '@opencrvs/commons/client'
import {
  DECLARATION_ACTION_UPDATE,
  EventHistoryActionDocument
} from '@client/v2-events/features/events/actions/correct/useActionForHistory'
import { RequestCorrection } from './RequestCorrection'
import { PrintCertificate } from './PrintCertificate'
import { DeclarationUpdate } from './DeclarationUpdate'

const DeclarationActionsWithUpdate = z.enum([
  ...DeclarationActions.options,
  DECLARATION_ACTION_UPDATE
])

export function ActionTypeSpecificContent({
  action,
  fullEvent
}: {
  action: EventHistoryActionDocument
  fullEvent: EventDocument
}) {
  const { type } = action

  const isDeclarationAction =
    DeclarationActionsWithUpdate.safeParse(type).success

  if (isDeclarationAction) {
    return <DeclarationUpdate action={action} fullEvent={fullEvent} />
  }

  if (type === ActionType.REQUEST_CORRECTION) {
    return <RequestCorrection action={action} fullEvent={fullEvent} />
  }

  if (type === ActionType.PRINT_CERTIFICATE) {
    return <PrintCertificate action={action} event={fullEvent} />
  }

  return null
}
