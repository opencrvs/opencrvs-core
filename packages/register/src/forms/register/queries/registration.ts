import gql from 'graphql-tag'
import { ApolloQueryResult } from 'apollo-client'
import {
  GQLQuery,
  GQLBirthRegistration
} from '@opencrvs/gateway/src/graphql/schema.d'

export const FETCH_REGISTRATION = gql`
  query fetchRegistration($identifier: ID!) {
    queryRegistrationByIdentifier(identifier: $identifier) {
      id
      child {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        gender
      }
    }
  }
`
export const transformRegistrationData = (
  response: ApolloQueryResult<GQLQuery>
) => {
  const responseData = response.data
    .queryRegistrationByIdentifier as GQLBirthRegistration
  return responseData.child
}
