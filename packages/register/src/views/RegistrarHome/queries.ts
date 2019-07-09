import gql from 'graphql-tag'

export const COUNT_REGISTRATION_QUERY = gql`
  query data($locationIds: [String]) {
    countEvents(locationIds: $locationIds) {
      declared
      registered
      rejected
    }
  }
`

export const COUNT_EVENT_REGISTRATION_BY_STATUS = gql`
  query data($locationIds: [String], $status: String) {
    countEventRegistrationsByStatus(
      locationIds: $locationIds
      status: $status
    ) {
      count
    }
  }
`

export const LIST_EVENT_REGISTRATIONS_BY_STATUS = gql`
  query data($locationIds: [String], $status: String, $count: Int, $skip: Int) {
    listEventRegistrations(
      locationId: $locationIds
      status: $status
      count: $count
      skip: $skip
    ) {
      totalItems
      results {
        registration {
          type
          status {
            user {
              name {
                use
                firstNames
                familyName
              }
              role
            }
          }
        }
        ... on BirthRegistration {
          child {
            name {
              use
              firstNames
              familyName
            }
          }
          updatedAt
        }
        ... on DeathRegistration {
          deceased {
            name {
              use
              firstNames
              familyName
            }
          }
          updatedAt
        }
      }
    }
  }
`

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
            use
          }
        }
        ... on DeathEventSearchSet {
          dateOfDeath
          deceasedName {
            firstNames
            familyName
            use
          }
        }
      }
    }
  }
`

export const FETCH_REGISTRATION_BY_COMPOSITION = gql`
  query data($id: ID!) {
    fetchRegistration(id: $id) {
      id
      registration {
        id
        type
        status {
          id
          user {
            id
            name {
              use
              firstNames
              familyName
            }
            role
          }
          location {
            id
            name
            alias
          }
          office {
            name
            alias
            address {
              district
              state
            }
          }
          type
          timestamp
          comments {
            comment
          }
        }
        contactPhoneNumber
      }
      ... on BirthRegistration {
        child {
          name {
            use
            firstNames
            familyName
          }
          birthDate
        }
      }
      ... on DeathRegistration {
        deceased {
          name {
            use
            firstNames
            familyName
          }
          deceased {
            deathDate
          }
        }
        informant {
          individual {
            telecom {
              use
              system
              value
            }
          }
        }
      }
    }
  }
`
