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
import { internal } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'
import { IPoints } from '@metrics/features/registration'
import {
  fetchTotalSearchRequestByClientId,
  getClientIdFromToken
} from '@metrics/features/searchMetrics/service'
import { writePoints } from '@metrics/influxdb/client'
import * as Joi from 'joi'

export const responseSchema = Joi.object({
  total: Joi.number()
})

export async function getAdvancedSearchByClient(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const clientId = getClientIdFromToken(request.headers.authorization)
    const totalSearchResult = await fetchTotalSearchRequestByClientId(clientId)
    const total = totalSearchResult.length > 0 ? totalSearchResult[0].count : 0
    return h.response({ total }).code(200)
  } catch (err) {
    return internal(err)
  }
}

export async function postAdvancedSearchByClient(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const clientId = getClientIdFromToken(request.headers.authorization)
    const ipAddress = request.headers['x-real-ip'] || request.info.remoteAddress
    const point: IPoints = {
      fields: { clientId },
      measurement: 'search_requests',
      tags: { ipAddress },
      timestamp: undefined
    }
    await writePoints([point])
    return h.response({}).code(200)
  } catch (err) {
    return internal(err)
  }
}
