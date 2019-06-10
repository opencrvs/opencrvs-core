import { GQLResolver } from '@gateway/graphql/schema'
import { postSearch } from '@gateway/features/fhir/utils'
import { ISearchCriteria } from '@gateway/features/search/type-resovlers'

export const resolvers: GQLResolver = {
  Query: {
    async searchEvents(
      _,
      {
        status,
        userId,
        locationIds,
        trackingId,
        registrationNumber,
        contactNumber,
        count = 10,
        skip = 0,
        sort = 'desc'
      },
      authHeader
    ) {
      const searchCriteria: ISearchCriteria = {
        from: skip,
        size: count,
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
      if (status) {
        searchCriteria.status = status
      }
      if (userId) {
        searchCriteria.createdBy = userId
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
