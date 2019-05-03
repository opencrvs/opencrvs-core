import { GQLResolver } from 'src/graphql/schema'
import { getMetrics } from '../fhir/utils'

export interface ITimeRange {
  timeStart: string
  timeEnd: string
}

export const resolvers: GQLResolver = {
  Query: {
    async fetchBirthRegistrationMetrics(
      _,
      { timeStart, timeEnd, locationId },
      authHeader
    ) {
      const timeRange: ITimeRange = {
        timeStart,
        timeEnd
      }
      const metricsData = await getMetrics(authHeader, timeRange, locationId)
      return {
        regByAge: (metricsData && metricsData.regByAge) || [],
        regWithin45d: (metricsData && metricsData.regWithin45d) || []
      }
    }
  }
}
