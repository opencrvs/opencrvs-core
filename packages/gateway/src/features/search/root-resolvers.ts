import { GQLResolver } from 'src/graphql/schema'
import { postSearch } from 'src/features/fhir/utils'
import { ISearchCriteria } from './type-resovlers'

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
