import { client } from '@search/elasticsearch/client'
import { ISearchQuery, SortOrder } from '@search/features/search/types'
import { queryBuilder, EMPTY_STRING } from '@search/features/search/utils'

const DEFAULT_SIZE = 10
const DEFAULT_SEARCH_TYPE = 'compositions'

export const searchComposition = async (params: ISearchQuery) => {
  const {
    query = EMPTY_STRING,
    trackingId = EMPTY_STRING,
    contactNumber = EMPTY_STRING,
    registrationNumber = EMPTY_STRING,
    event = EMPTY_STRING,
    status = EMPTY_STRING,
    applicationLocationId = EMPTY_STRING,
    createdBy = EMPTY_STRING,
    from = 0,
    size = DEFAULT_SIZE,
    sort = SortOrder.ASC
  } = params

  return client.search({
    type: DEFAULT_SEARCH_TYPE,
    from,
    size,
    body: {
      query: queryBuilder(
        query,
        trackingId,
        contactNumber,
        registrationNumber,
        applicationLocationId,
        createdBy,
        { event, status }
      ),
      sort: [{ dateOfApplication: sort }]
    }
  })
}
