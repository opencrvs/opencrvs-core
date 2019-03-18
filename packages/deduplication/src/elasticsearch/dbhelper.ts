import { client } from 'src/elasticsearch/client'
import { IBirthCompositionBody, buildQuery } from 'src/elasticsearch/utils'

export const indexComposition = async (
  compositionIdentifier: string,
  body: IBirthCompositionBody
) => {
  const response = await client.index({
    index: 'ocrvs',
    type: 'compositions',
    id: compositionIdentifier,
    body
  })

  return response
}

export const searchComposition = async (body: IBirthCompositionBody) => {
  const response = client.search({
    index: 'ocrvs',
    type: 'compositions',
    body: {
      query: buildQuery(body)
    }
  })
  return response
}
