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
  EventDocument
} from '@opencrvs/commons/client'
import { Archive } from './Archive'
import { RequestCorrection } from './RequestCorrection'
import { PrintCertificate } from './PrintCertificate'

export function getActionTypeSpecificContent(
  action: ActionDocument,
  fullEvent: EventDocument
) {
  const { type } = action

  //@todo check for duplicate flag
  if (type === ActionType.ARCHIVE) {
    return <Archive />
  }

  if (type === ActionType.REQUEST_CORRECTION) {
    return <RequestCorrection action={action} fullEvent={fullEvent} />
  }

  if (type === ActionType.PRINT_CERTIFICATE) {
    return <PrintCertificate action={action} event={fullEvent} />
  }

  return null
}
