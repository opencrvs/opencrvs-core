import { client } from 'src/elasticsearch/client'
import { ISearchQuery } from './types'

const DEFAULT_SIZE = 10
const DEFAULT_SEARCH_TYPE = 'compositions'
const SEARCHABLE_FIELDS = [
  'childFirstNames',
  'childFamilyName',
  'childFirstNamesLocal',
  'childFamilyNameLocal',
  'trackingid',
  'registrationNumber',
  'contactNumber'
]

export async function searchComposition(params: ISearchQuery) {
  const { query, from = 0, size = DEFAULT_SIZE } = params
  return client.search({
    type: DEFAULT_SEARCH_TYPE,
    from: from,
    size: size,
    body: {
      query: {
        multi_match: {
          query: `${query}`,
          fields: SEARCHABLE_FIELDS,
          fuzziness: 'AUTO'
        }
      }
    }
  })
}
