import gql from 'graphql-tag'
import { ApolloQueryResult } from 'apollo-client'
import {
  GQLQuery,
  GQLBirthRegistration,
  GQLHumanName,
  GQLPerson
} from '@opencrvs/gateway/src/graphql/schema.d'

export const FETCH_REGISTRATION = gql`
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
export const transformRegistrationData = (
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
    familyNameEng: engName && engName.familyName,
    firstNames: localName && localName.firstNames,
    firstNamesEng: engName && engName.firstNames
  }
}
