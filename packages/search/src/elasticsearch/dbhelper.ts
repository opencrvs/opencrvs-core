import { client } from '@search/elasticsearch/client'
import { buildQuery, ICompositionBody } from '@search/elasticsearch/utils'
import { logger } from '@search/logger'

export const indexComposition = async (
  compositionIdentifier: string,
  body: ICompositionBody
) => {
  let response: any
  try {
    response = await client.index({
      index: 'ocrvs',
      type: 'compositions',
      id: compositionIdentifier,
      body
    })
  } catch (e) {
    logger.error(`indexComposition: error: ${e}`)
  }

  return response
}

export const updateComposition = async (id: string, body: ICompositionBody) => {
  let response: any
  try {
    response = await client.update({
      index: 'ocrvs',
      type: 'compositions',
      id,
      body: {
        doc: body
      }
    })
  } catch (e) {
    logger.error(`updateComposition: error: ${e}`)
  }

  return response
}

export const searchComposition = async (body: ICompositionBody) => {
  let response: any
  try {
    response = client.search({
      index: 'ocrvs',
      type: 'compositions',
      body: {
        query: buildQuery(body)
      }
    })
  } catch (e) {
    logger.error(`searchComposition: error: ${e}`)
  }
  return response
}
