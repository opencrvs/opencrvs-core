import { client } from 'src/elasticsearch/client'
import { buildQuery, ICompositionBody } from 'src/elasticsearch/utils'

export const indexComposition = async (
  compositionIdentifier: string,
  body: ICompositionBody
) => {
  try {
    const response = await client.index({
      index: 'ocrvs',
      type: 'compositions',
      id: compositionIdentifier,
      body
    })

    return response
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
    throw err
  }
}

export const updateComposition = async (id: string, body: ICompositionBody) => {
  try {
    const response = await client.update({
      index: 'ocrvs',
      type: 'compositions',
      id,
      body: {
        doc: body
      }
    })

    return response
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
    throw err
  }
}

export const searchComposition = async (body: ICompositionBody) => {
  try {
    const response = client.search({
      index: 'ocrvs',
      type: 'compositions',
      body: {
        query: buildQuery(body)
      }
    })
    return response
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
    return null
  }
}

export const searchByCompositionId = async (compositionId: string) => {
  try {
    const response = await client.search({
      index: 'ocrvs',
      type: 'compositions',
      body: {
        query: {
          match: {
            _id: compositionId
          }
        }
      }
    })
    return response
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
    return null
  }
}
