import { GQLResolver } from '@gateway/graphql/schema'
import { postSearch } from '@gateway/features/fhir/utils'
import { ISearchCriteria } from '@gateway/features/search/type-resovlers'

export const resolvers: GQLResolver = {
  Query: {
    async searchEvents(
      _,
      {
        locationIds,
        trackingId,
        registrationNumber,
        contactNumber,
        sort = 'desc'
      },
      authHeader
    ) {
      const searchCriteria: ISearchCriteria = {
        sort
      }
      if (locationIds) {
        searchCriteria.applicationLocationId = locationIds.join(',')
      }
      if (trackingId) {
        searchCriteria.trackingId = trackingId
      }
      if (registrationNumber) {
        searchCriteria.registrationNumber = registrationNumber
      }
      if (contactNumber) {
        searchCriteria.contactNumber = contactNumber
      }

      const searchResult = await postSearch(authHeader, searchCriteria)
      return {
        totalItems:
          (searchResult && searchResult.hits && searchResult.hits.total) || 0,
        results:
          (searchResult && searchResult.hits && searchResult.hits.hits) || []
      }
    }
  }
}
