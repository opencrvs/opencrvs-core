import gql from 'graphql-tag'

export const FETCH_METRIC = gql`
  query fetchBirthRegistrationMetrics($timeStart: String, $timeEnd: String) {
    fetchBirthRegistrationMetrics(timeStart: $timeStart, timeEnd: $timeEnd) {
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
