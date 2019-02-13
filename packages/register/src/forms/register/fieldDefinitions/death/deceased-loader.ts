import gql from 'graphql-tag'
import { ApolloQueryResult } from 'apollo-client'
import {
  GQLQuery,
  GQLBirthRegistration,
  GQLHumanName,
  GQLPerson
} from '@opencrvs/gateway/src/graphql/schema.d'

export const FETCH_DECEASED = gql`
  query fetchDeceased($identifier: ID!) {
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
export const transformDeceasedData = (
  response: ApolloQueryResult<GQLQuery>
) => {
  const responseData = response.data
    .queryRegistrationByIdentifier as GQLBirthRegistration
  const { birthDate, gender, name } = responseData.child as GQLPerson

  const localName =
    name &&
    name.find((humanName: GQLHumanName) => {
      return humanName && humanName.use === 'bn'
    })
  const engName =
    name &&
    name.find((humanName: GQLHumanName) => {
      return humanName && humanName.use === 'en'
    })
  return {
    birthDate,
    gender,
    familyName: localName && localName.familyName,
    familyNameEng: engName && engName.firstNames,
    firstNames: localName && localName.familyName,
    firstNamesEng: engName && engName.firstNames
  }
}
