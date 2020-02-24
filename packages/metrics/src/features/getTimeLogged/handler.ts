/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as Hapi from 'hapi'
import {
  COMPOSITION_ID,
  STATUS
} from '@metrics/features/getTimeLogged/constants'
import {
  getTimeLoggedByStatus,
  ITimeLoggedData
} from '@metrics/features/getTimeLogged/utils'

export async function getTimeLoggedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const compositionId = request.query[COMPOSITION_ID]
  const status = request.query[STATUS].toUpperCase()

  const timeLoggedData: ITimeLoggedData[] = await getTimeLoggedByStatus(
    compositionId,
    status
  )
  return timeLoggedData && timeLoggedData.length > 0
    ? timeLoggedData[0]
    : // Send 0 if no logged data found for given status
      { timeSpentEditing: 0 }
}
