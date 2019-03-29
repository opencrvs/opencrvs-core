import gql from 'graphql-tag'
import { ApolloQueryResult } from 'apollo-client'
import { GQLQuery, GQLPerson } from '@opencrvs/gateway/src/graphql/schema.d'

export const FETCH_PERSON = gql`
  query fetchPerson($identifier: ID!) {
    queryPersonByIdentifier(identifier: $identifier) {
      id
      name {
        use
        firstNames
        familyName
      }
      birthDate
      gender
      address {
        type
        line
        city
        district
        state
        postalCode
        country
      }
    }
  }
`
export const transformPersonData = (response: ApolloQueryResult<GQLQuery>) => {
  const responseData = response.data.queryPersonByIdentifier as GQLPerson
  return responseData
}
export const transformInformantData = (
  response: ApolloQueryResult<GQLQuery>
) => {
  const responseData = response.data.queryPersonByIdentifier as GQLPerson
  return { individual: responseData }
}
