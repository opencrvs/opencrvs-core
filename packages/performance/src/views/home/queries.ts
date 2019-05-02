import gql from 'graphql-tag'

export const FETCH_METRIC = gql`
  query fetchBirthRegistrationMetrics(
    $timeStart: String!
    $timeEnd: String!
    $locationId: String!
  ) {
    fetchBirthRegistrationMetrics(
      timeStart: $timeStart
      timeEnd: $timeEnd
      locationId: $locationId
    ) {
      regByAge {
        label
        value
      }
      regWithin45d {
        label
        value
        totalEstimate
      }
    }
  }
`
