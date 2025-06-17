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
  EventConfig
} from '@opencrvs/commons/client'
import { Archive } from './Archive'
import { RequestCorrection } from './RequestCorrection'

export function getActionTypeSpecificContent(
  action: ActionDocument,
  eventConfiguration: EventConfig
) {
  const { type } = action

  if (type === ActionType.ARCHIVE && action.reason.isDuplicate) {
    return <Archive />
  }

  if (type === ActionType.REQUEST_CORRECTION) {
    return (
      <RequestCorrection
        action={action}
        eventConfiguration={eventConfiguration}
      />
    )
  }

  return null
}
