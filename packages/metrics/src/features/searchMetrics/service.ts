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
import { query } from '@metrics/influxdb/client'
import { getTokenPayload } from '@metrics/utils/authUtils'
import { format } from 'date-fns'

export function getClientIdFromToken(token: string) {
  const payload = getTokenPayload(token)
  return payload.sub
}

export async function fetchTotalSearchRequestByClientId(clientId: string) {
  const currentDate = format(new Date(), 'yyyy-MM-dd')
  return await query(
    `SELECT COUNT(clientId) FROM search_requests WHERE clientId = $clientId AND time >= $currentDate`,
    {
      placeholders: {
        clientId,
        currentDate
      }
    }
  )
}
