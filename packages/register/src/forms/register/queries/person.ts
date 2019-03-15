import gql from 'graphql-tag'
import { ApolloQueryResult } from 'apollo-client'
import {
  GQLQuery,
  GQLHumanName,
  GQLPerson,
  GQLAddress
} from '@opencrvs/gateway/src/graphql/schema.d'

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
  const { birthDate, gender, name, address } = responseData

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

  const permanentAddress =
    address &&
    address.find((gqlAdrs: GQLAddress) => {
      return gqlAdrs && gqlAdrs.type === 'PERMANENT'
    })
  const currentAddress =
    address &&
    address.find((gqlAdrs: GQLAddress) => {
      return gqlAdrs && gqlAdrs.type === 'CURRENT'
    })

  const transformedValues = {
    birthDate,
    gender,
    familyName: localName && localName.familyName,
    familyNameEng: engName && engName.familyName,
    firstNames: localName && localName.firstNames,
    firstNamesEng: engName && engName.firstNames,
    state: currentAddress && currentAddress.state,
    district: currentAddress && currentAddress.district,
    postCode: currentAddress && currentAddress.postalCode,
    country: currentAddress && currentAddress.country,
    addressLine4:
      currentAddress && currentAddress.line && currentAddress.line[5],
    addressLine3:
      currentAddress && currentAddress.line && currentAddress.line[3],
    addressLine3CityOption:
      currentAddress && currentAddress.line && currentAddress.line[4],
    addressLine2:
      currentAddress && currentAddress.line && currentAddress.line[2],
    addressLine1CityOption:
      currentAddress && currentAddress.line && currentAddress.line[1],
    addressLine1:
      currentAddress && currentAddress.line && currentAddress.line[0],
    statePermanent: permanentAddress && permanentAddress.state,
    districtPermanent: permanentAddress && permanentAddress.district,
    postCodePermanent: permanentAddress && permanentAddress.postalCode,
    countryPermanent: permanentAddress && permanentAddress.country,
    addressLine4Permanent:
      permanentAddress && permanentAddress.line && permanentAddress.line[5],
    addressLine3Permanent:
      permanentAddress && permanentAddress.line && permanentAddress.line[3],
    addressLine3CityOptionPermanent:
      permanentAddress && permanentAddress.line && permanentAddress.line[4],
    addressLine2Permanent:
      permanentAddress && permanentAddress.line && permanentAddress.line[2],
    addressLine1CityOptionPermanent:
      permanentAddress && permanentAddress.line && permanentAddress.line[1],
    addressLine1Permanent:
      permanentAddress && permanentAddress.line && permanentAddress.line[0],
    currentAddressSameAsPermanent: true
  }

  if (permanentAddress && currentAddress) {
    const isSameAddress =
      permanentAddress.country === currentAddress.country &&
      permanentAddress.state === currentAddress.state &&
      permanentAddress.district === currentAddress.district &&
      permanentAddress.postalCode === currentAddress.postalCode &&
      (permanentAddress.line && permanentAddress.line[0]) ===
        (currentAddress.line && currentAddress.line[0]) &&
      (permanentAddress.line && permanentAddress.line[1]) ===
        (currentAddress.line && currentAddress.line[1]) &&
      (permanentAddress.line && permanentAddress.line[2]) ===
        (currentAddress.line && currentAddress.line[2]) &&
      (permanentAddress.line && permanentAddress.line[3]) ===
        (currentAddress.line && currentAddress.line[3]) &&
      (permanentAddress.line && permanentAddress.line[4]) ===
        (currentAddress.line && currentAddress.line[4]) &&
      (permanentAddress.line && permanentAddress.line[5]) ===
        (currentAddress.line && currentAddress.line[5])

    if (!isSameAddress) {
      transformedValues.currentAddressSameAsPermanent = false
    }
  }

  return transformedValues
}
