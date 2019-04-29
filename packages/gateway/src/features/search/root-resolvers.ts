import { GQLResolver } from 'src/graphql/schema'
import { postSearch } from 'src/features/fhir/utils'
import { ISearchCriteria } from './type-resovlers'

export const resolvers: GQLResolver = {
  Query: {
    async searchEvents(
      _,
      {
        eventType,
        status,
        locationIds,
        searchContent,
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
      if (eventType) {
        searchCriteria.event = eventType
      }
      if (status) {
        searchCriteria.status = status
      }
      if (locationIds) {
        searchCriteria.applicationLocationId = locationIds.join(',')
      }
      if (searchContent) {
        searchCriteria.query = searchContent
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
