import gql from 'graphql-tag'
import { client } from '@register/utils/apolloClient'

export const FETCH_USER = gql`
  query($userId: String!) {
    getUser(userId: $userId) {
      userMgntUserID
      practitionerId
      mobile
      role
      type
      status
      name {
        use
        firstNames
        familyName
      }
      catchmentArea {
        id
        name
        status
        identifier {
          system
          value
        }
      }
      primaryOffice {
        id
        name
        status
      }
    }
  }
`

export const FETCH_USER_SIGNATURE = gql`
  query($locationId: String!) {
    getSignature(locationId: $locationId) {
      data
      type
    }
  }
`
async function fetchUserDetails(userId: string) {
  return (
    client &&
    client.query({
      query: FETCH_USER,
      variables: { userId }
    })
  )
}

async function fetchUserSignature(locationId: string) {
  return (
    client &&
    client.query({
      query: FETCH_USER_SIGNATURE,
      variables: { locationId }
    })
  )
}

export const queries = {
  fetchUserDetails,
  fetchUserSignature
}
