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
    const ipAddress = request.info.remoteAddress
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
