import { GQLResolver } from '@gateway/graphql/schema'
import { postSearch } from '@gateway/features/fhir/utils'
import { ISearchCriteria } from '@gateway/features/search/type-resovlers'

export const resolvers: GQLResolver = {
  Query: {
    async searchEvents(
      _,
      {
        userId,
        locationIds,
        status,
        trackingId,
        registrationNumber,
        contactNumber,
        count,
        skip,
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
      if (count) {
        searchCriteria.size = count
      }
      if (skip) {
        searchCriteria.from = skip
      }
      if (status) {
        searchCriteria.status = status as string[]
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
    },
    async countEvents(_, { locationIds }, authHeader) {
      const searchCriteria: ISearchCriteria =
        (locationIds && {
          applicationLocationId: locationIds.join(',')
        }) ||
        {}

      const inProgressCriteria: ISearchCriteria = {
        ...searchCriteria,
        status: ['IN_PROGRESS']
      }
      const inProgressResult = await postSearch(authHeader, inProgressCriteria)

      const declaredCriteria: ISearchCriteria = {
        ...searchCriteria,
        status: ['DECLARED']
      }
      const declaredResult = await postSearch(authHeader, declaredCriteria)

      const validatedCriteria: ISearchCriteria = {
        ...searchCriteria,
        status: ['VALIDATED']
      }
      const validatedResult = await postSearch(authHeader, validatedCriteria)

      const registeredCriteria: ISearchCriteria = {
        ...searchCriteria,
        status: ['REGISTERED']
      }
      const registeredResult = await postSearch(authHeader, registeredCriteria)

      const rejectedCriteria: ISearchCriteria = {
        ...searchCriteria,
        status: ['REJECTED']
      }
      const rejectedResult = await postSearch(authHeader, rejectedCriteria)
      return {
        inProgress:
          (inProgressResult &&
            inProgressResult.hits &&
            inProgressResult.hits.total) ||
          0,
        declared:
          (declaredResult &&
            declaredResult.hits &&
            declaredResult.hits.total) ||
          0,
        validated:
          (validatedResult &&
            validatedResult.hits &&
            validatedResult.hits.total) ||
          0,
        registered:
          (registeredResult &&
            registeredResult.hits &&
            registeredResult.hits.total) ||
          0,
        rejected:
          (rejectedResult &&
            rejectedResult.hits &&
            rejectedResult.hits.total) ||
          0
      }
    }
  }
}
