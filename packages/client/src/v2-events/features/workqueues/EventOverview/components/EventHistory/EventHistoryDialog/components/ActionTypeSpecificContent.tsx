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
  ActionDocument,
  ActionType,
  EventDocument,
  ValidatorContext
} from '@opencrvs/commons/client'
import { RequestCorrection } from './RequestCorrection'
import { PrintCertificate } from './PrintCertificate'
import { CustomActionContent } from './CustomAction'
import { DetectedDuplicate } from './DetectedDuplicate'
import { Edit } from './Edit'
import { ActionFormContent } from './ActionFormContent'

export function ActionTypeSpecificContent({
  action,
  fullEvent,
  validatorContext
}: {
  action: ActionDocument
  fullEvent: EventDocument
  validatorContext: ValidatorContext
}) {
  const { type } = action

  if (type === ActionType.REQUEST_CORRECTION) {
    return (
      <RequestCorrection
        action={action}
        fullEvent={fullEvent}
        validatorContext={validatorContext}
      />
    )
  }

  if (type === ActionType.PRINT_CERTIFICATE) {
    return (
      <PrintCertificate
        action={action}
        event={fullEvent}
        validatorContext={validatorContext}
      />
    )
  }

  if (type === ActionType.CUSTOM) {
    return (
      <CustomActionContent
        action={action}
        event={fullEvent}
        validatorContext={validatorContext}
      />
    )
  }

  if (type === ActionType.EDIT) {
    return (
      <Edit
        action={action}
        fullEvent={fullEvent}
        validatorContext={validatorContext}
      />
    )
  }

  if (type === ActionType.DUPLICATE_DETECTED) {
    return <DetectedDuplicate action={action} />
  }

  const coreDialogFormActions: string[] = [
    ActionType.NOTIFY,
    ActionType.DECLARE,
    ActionType.REGISTER,
    ActionType.ARCHIVE,
    ActionType.REJECT
  ]

  if (coreDialogFormActions.includes(type)) {
    return (
      <ActionFormContent
        action={action}
        event={fullEvent}
        validatorContext={validatorContext}
      />
    )
  }

  return null
}
