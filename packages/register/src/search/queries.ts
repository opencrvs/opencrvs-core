import gql from 'graphql-tag'

export const SEARCH_EVENTS = gql`
  query(
    $searchContent: String
    $sort: String
    $eventType: String
    $status: String
    $count: Int
    $skip: Int
    $locationIds: [String]
  ) {
    searchEvents(
      searchContent: $searchContent
      sort: $sort
      eventType: $eventType
      status: $status
      count: $count
      skip: $skip
      locationIds: $locationIds
    ) {
      totalItems
      results {
        id
        type
        registration {
          status
          dateOfApplication
          trackingId
          registrationNumber
          registeredLocationId
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
