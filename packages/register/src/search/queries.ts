import gql from 'graphql-tag'

export const SEARCH_EVENTS = gql`
  query(
    $searchContent: String
    $sort: String
    $eventType: String
    $status: String
    $count: Int
    $skip: Int
    $trackingId: String
    $contactNumber: String
    $registrationNumber: String
    $locationIds: [String]
  ) {
    searchEvents(
      searchContent: $searchContent
      sort: $sort
      eventType: $eventType
      status: $status
      count: $count
      skip: $skip
      trackingId: $trackingId
      registrationNumber: $registrationNumber
      contactNumber: $contactNumber
      locationIds: $locationIds
    ) {
      totalItems
      results {
        id
        type
        registration {
          status
          trackingId
          registrationNumber
          registeredLocationId
          duplicates
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
