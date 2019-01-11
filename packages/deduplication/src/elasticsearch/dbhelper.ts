import { client } from 'src/elasticsearch/client'
import { ICompositionBody, buildQuery } from 'src/elasticsearch/utils'

export async function indexComposition(
  compositionIdentifier: string,
  body: ICompositionBody
) {
  const response = await client.index({
    index: 'ocrvs',
    type: 'compositions',
    id: compositionIdentifier,
    body
  })

  return response
}

export async function searchComposition(body: ICompositionBody) {
  const response = client.search({
    index: 'ocrvs',
    type: 'compositions',
    body: {
      query: buildQuery(body)
    }
  })
  return response
}
