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

import { useSelector } from 'react-redux'
import { ActionType, SCOPES } from '@opencrvs/commons/client'
import { getScope } from '@client/profile/profileSelectors'

export function useCorrectionActionType() {
  const scopes = useSelector(getScope) ?? []

  if (scopes.includes(SCOPES.RECORD_REGISTRATION_CORRECT)) {
    return {
      correctionActionType: ActionType.CORRECT
    }
  } else if (scopes.includes(SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION)) {
    return {
      correctionActionType: ActionType.REQUEST_CORRECTION
    }
  }
  throw new Error(`User has no scope to request or make correction.`)
}
