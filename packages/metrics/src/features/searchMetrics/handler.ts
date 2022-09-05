import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import { internal } from '@hapi/boom'
import { writePoints } from '@metrics/influxdb/client'
import {
  IAdvancedSearchFields,
  IAdvancedSearchTags,
  IPoints
} from '@metrics/features/registration'
import { fetchTotalSearchRequestByClientId } from '@metrics/features/searchMetrics/service'

export const requestSchema = Joi.object({
  clientId: Joi.string().required(),
  ip_address: Joi.string().required()
})

export const responseSchema = Joi.object({
  total: Joi.number()
})

export async function getAdvancedSearchByClient(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const totalSearchResult = await fetchTotalSearchRequestByClientId(
      request.query.clientId
    )
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
    const { clientId } = request.payload as IAdvancedSearchFields
    const { ip_address } = request.payload as IAdvancedSearchTags
    const point: IPoints = {
      fields: { clientId },
      measurement: 'search_requests',
      tags: { ip_address },
      timestamp: undefined
    }
    await writePoints([point])
    return h.response().code(200)
  } catch (err) {
    return internal(err)
  }
}
