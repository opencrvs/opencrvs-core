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
  DeclarationActions,
  EventDocument,
  ValidatorContext
} from '@opencrvs/commons/client'
import { RequestCorrection } from './RequestCorrection'
import { PrintCertificate } from './PrintCertificate'
import { DeclarationUpdate } from './DeclarationUpdate'

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

  const isDeclarationAction = DeclarationActions.safeParse(type).success
  if (isDeclarationAction) {
    return (
      <DeclarationUpdate
        action={action}
        fullEvent={fullEvent}
        validatorContext={validatorContext}
      />
    )
  }

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

  return null
}
