import gql from 'graphql-tag'

export const SEARCH_EVENTS = gql`
  query(
    $sort: String
    $trackingId: String
    $contactNumber: String
    $registrationNumber: String
    $status: String
    $locationIds: [String]
    $count: Int
    $skip: Int
  ) {
    searchEvents(
      sort: $sort
      trackingId: $trackingId
      registrationNumber: $registrationNumber
      contactNumber: $contactNumber
      locationIds: $locationIds
      status: $status
      count: $count
      skip: $skip
    ) {
      totalItems
      results {
        id
        type
        registration {
          status
          contactNumber
          trackingId
          registrationNumber
          registeredLocationId
          duplicates
          createdAt
          modifiedAt
        }
        ... on BirthEventSearchSet {
          dateOfBirth
          childName {
            firstNames
            familyName
          }
        }
        ... on DeathEventSearchSet {
          dateOfDeath
          deceasedName {
            firstNames
            familyName
          }
        }
      }
    }
  }
`
export const SEARCH_APPLICATIONS_USER_WISE = gql`
  query(
    $status: String
    $userId: String
    $locationIds: [String]
    $sort: String
    $count: Int
    $skip: Int
  ) {
    searchEvents(
      status: $status
      userId: $userId
      locationIds: $locationIds
      sort: $sort
      count: $count
      skip: $skip
    ) {
      totalItems
      results {
        id
        type
        registration {
          dateOfApplication
          status
        }
        ... on BirthEventSearchSet {
          childName {
            use
            firstNames
            familyName
          }
        }
        ... on DeathEventSearchSet {
          deceasedName {
            use
            firstNames
            familyName
          }
        }
      }
    }
  }
`

export const COUNT_USER_WISE_APPLICATIONS = gql`
  query($status: String, $userId: String, $locationIds: [String]) {
    searchEvents(status: $status, userId: $userId, locationIds: $locationIds) {
      totalItems
    }
  }
`
