/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { gql } from '@apollo/client'
import { Action, DownloadAction } from '@client/forms'

export const GET_MARRIAGE_REGISTRATION_FOR_REVIEW = gql`
  query fetchMarriageRegistrationForReview($id: ID!) {
    fetchMarriageRegistration(id: $id) {
      _fhirIDMap
      id
      bride {
        id
        name {
          use
          firstNames
          familyName
          marriedLastName
        }
        birthDate
        maritalStatus
        ageOfIndividualInYears
        exactDateOfBirthUnknown
        dateOfMarriage
        nationality
        identifier {
          id
          type
          otherType
        }
        address {
          type
          line
          district
          state
          city
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      groom {
        id
        name {
          use
          firstNames
          familyName
          marriedLastName
        }
        birthDate
        maritalStatus
        ageOfIndividualInYears
        exactDateOfBirthUnknown
        dateOfMarriage
        nationality
        identifier {
          id
          type
          otherType
        }
        address {
          type
          line
          district
          state
          city
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      witnessOne {
        id
        relationship
        otherRelationship
        individual {
          id
          identifier {
            id
            type
            otherType
          }
          name {
            use
            firstNames
            familyName
          }
        }
      }
      witnessTwo {
        id
        relationship
        otherRelationship
        individual {
          id
          identifier {
            id
            type
            otherType
          }
          name {
            use
            firstNames
            familyName
          }
        }
      }
      registration {
        id
        informantType
        otherInformantType
        contact
        contactRelationship
        contactPhoneNumber
        groomSignature
        brideSignature
        witnessOneSignature
        witnessTwoSignature
        duplicates
        attachments {
          data
          type
          contentType
          subject
        }
        status {
          comments {
            comment
          }
          type
          timestamp
          office {
            name
            alias
            address {
              district
              state
            }
          }
        }
        type
        trackingId
        registrationNumber
        mosipAid
      }
      typeOfMarriage
      eventLocation {
        id
        address {
          line
          district
          state
          city
          postalCode
          country
        }
      }
      questionnaire {
        fieldId
        value
      }
      history {
        otherReason
        requester
        hasShowedVerifiedDocument
        date
        action
        regStatus
        dhis2Notification
        statusReason {
          text
        }
        reason
        location {
          id
          name
        }
        office {
          id
          name
        }
        system {
          name
          type
        }
        user {
          id
          role {
            _id
            labels {
              lang
              label
            }
          }
          systemRole
          name {
            firstNames
            familyName
            use
          }
          avatar {
            data
            type
          }
        }
        signature {
          data
          type
        }
        comments {
          user {
            id
            username
            avatar {
              data
              type
            }
          }
          comment
          createdAt
        }
        input {
          valueCode
          valueId
          valueString
        }
        output {
          valueCode
          valueId
          valueString
        }
        certificates {
          hasShowedVerifiedDocument
          collector {
            relationship
            otherRelationship
            individual {
              name {
                use
                firstNames
                familyName
              }
              telecom {
                system
                value
                use
              }
            }
          }
        }
      }
    }
  }
`

export const GET_MARRIAGE_REGISTRATION_FOR_CERTIFICATE = gql`
  query fetchMarriageRegistrationForCertificate($id: ID!) {
    fetchMarriageRegistration(id: $id) {
      _fhirIDMap
      id
      bride {
        id
        name {
          use
          firstNames
          familyName
          marriedLastName
        }
        birthDate
        maritalStatus
        ageOfIndividualInYears
        exactDateOfBirthUnknown
        dateOfMarriage
        nationality
        identifier {
          id
          type
          otherType
        }
        address {
          type
          line
          district
          state
          city
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      groom {
        id
        name {
          use
          firstNames
          familyName
          marriedLastName
        }
        birthDate
        maritalStatus
        ageOfIndividualInYears
        exactDateOfBirthUnknown
        dateOfMarriage
        nationality
        identifier {
          id
          type
          otherType
        }
        address {
          type
          line
          district
          state
          city
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      witnessOne {
        id
        relationship
        otherRelationship
        individual {
          id
          identifier {
            id
            type
            otherType
          }
          name {
            use
            firstNames
            familyName
          }
        }
      }
      witnessTwo {
        id
        relationship
        otherRelationship
        individual {
          id
          identifier {
            id
            type
            otherType
          }
          name {
            use
            firstNames
            familyName
          }
        }
      }
      registration {
        id
        informantType
        otherInformantType
        contact
        contactRelationship
        contactPhoneNumber
        groomSignature
        brideSignature
        witnessOneSignature
        witnessTwoSignature
        duplicates
        attachments {
          data
          type
          contentType
          subject
        }
        status {
          comments {
            comment
          }
          type
          timestamp
          office {
            name
            alias
            address {
              district
              state
            }
          }
        }
        type
        trackingId
        registrationNumber
        mosipAid
      }
      typeOfMarriage
      eventLocation {
        id
        address {
          line
          district
          state
          city
          postalCode
          country
        }
      }
      questionnaire {
        fieldId
        value
      }
      history {
        otherReason
        requester
        hasShowedVerifiedDocument
        date
        action
        regStatus
        dhis2Notification
        statusReason {
          text
        }
        reason
        location {
          id
          name
        }
        office {
          id
          name
        }
        system {
          name
          type
        }
        user {
          id
          role {
            _id
            labels {
              lang
              label
            }
          }
          systemRole
          name {
            firstNames
            familyName
            use
          }
          avatar {
            data
            type
          }
        }
        signature {
          data
          type
        }
        comments {
          user {
            id
            username
            avatar {
              data
              type
            }
          }
          comment
          createdAt
        }
        input {
          valueCode
          valueId
          valueString
        }
        output {
          valueCode
          valueId
          valueString
        }
        certificates {
          hasShowedVerifiedDocument
          collector {
            relationship
            otherRelationship
            individual {
              name {
                use
                firstNames
                familyName
              }
              telecom {
                system
                value
                use
              }
            }
          }
        }
      }
    }
  }
`
export function getMarriageQueryMappings(action: Action) {
  switch (action) {
    case DownloadAction.LOAD_REVIEW_DECLARATION:
      return {
        query: GET_MARRIAGE_REGISTRATION_FOR_REVIEW,
        dataKey: 'fetchMarriageRegistration'
      }
    case DownloadAction.LOAD_CERTIFICATE_DECLARATION:
      return {
        query: GET_MARRIAGE_REGISTRATION_FOR_CERTIFICATE,
        dataKey: 'fetchMarriageRegistration'
      }
    default:
      return null
  }
}
