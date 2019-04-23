import { GQLResolver } from 'src/graphql/schema'

interface IBirthRegistrationByAgeMetricsDataTemplate {
  label: string
  value: number
}

export const resolvers: GQLResolver = {
  BirthRegistrationByAgeMetrics: {
    label(result: IBirthRegistrationByAgeMetricsDataTemplate) {
      return result.label
    },
    value(result: IBirthRegistrationByAgeMetricsDataTemplate) {
      return result.value
    }
  }
}
