/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { gql } from '@apollo/client'
import { Action, DownloadAction } from '@client/forms'

const GET_MARRIAGE_REGISTRATION_FOR_REVIEW = gql`
  query fetchMarriageRegistrationForReview($id: ID!) {
    fetchMarriageRegistration(id: $id) {
      _fhirIDMap
      id
      informant {
        id
        relationship
        otherRelationship
        _fhirIDPatient
        identifier {
          id
          type
          otherType
          fieldsModifiedByIdentity
        }
        name {
          use
          firstNames
          middleName
          familyName
        }
        occupation
        nationality
        birthDate
        ageOfIndividualInYears
        exactDateOfBirthUnknown
        address {
          type
          line
          district
          state
          city
          postalCode
          country
        }
      }
      bride {
        id
        name {
          use
          firstNames
          middleName
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
          middleName
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
        _fhirIDPatient
        identifier {
          id
          type
          otherType
        }
        name {
          use
          firstNames
          middleName
          familyName
        }
      }
      witnessTwo {
        id
        relationship
        otherRelationship
        _fhirIDPatient
        identifier {
          id
          type
          otherType
        }
        name {
          use
          firstNames
          middleName
          familyName
        }
      }
      registration {
        id
        informantType
        otherInformantType
        contact
        contactRelationship
        contactPhoneNumber
        contactEmail
        assignment {
          practitionerId
          firstName
          lastName
          officeName
          avatarURL
          createdAt
        }
        certificates {
          hasShowedVerifiedDocument
          certificateTemplateId
          collector {
            relationship
            otherRelationship
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
        groomSignature
        brideSignature
        witnessOneSignature
        witnessTwoSignature
        duplicates {
          compositionId
          trackingId
        }
        attachments {
          data
          uri
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
            partOf
          }
        }
        type
        trackingId
        registrationNumber
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
        documents {
          id
          data
          uri
          type
        }
        payment {
          id
          type
          amount
          outcome
          date
          attachmentURL
        }
        otherReason
        requester
        hasShowedVerifiedDocument
        certificateTemplateId
        noSupportingDocumentationRequired
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
          alias
        }
        system {
          name
          type
        }
        user {
          id
          role {
            id
            label {
              id
              defaultMessage
              description
            }
          }
          primaryOffice {
            id
          }
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
          value
        }
        output {
          valueCode
          valueId
          value
        }
        certificates {
          hasShowedVerifiedDocument
          collector {
            relationship
            otherRelationship
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
          certifier {
            name {
              use
              firstNames
              familyName
            }
            role {
              id
              label {
                id
                defaultMessage
                description
              }
            }
          }
        }
      }
    }
  }
`

const GET_MARRIAGE_REGISTRATION_FOR_CERTIFICATE = gql`
  query fetchMarriageRegistrationForCertificate($id: ID!) {
    fetchMarriageRegistration(id: $id) {
      _fhirIDMap
      id
      informant {
        id
        relationship
        otherRelationship
        _fhirIDPatient
        identifier {
          id
          type
          otherType
          fieldsModifiedByIdentity
        }
        name {
          use
          firstNames
          middleName
          familyName
        }
        occupation
        nationality
        birthDate
        ageOfIndividualInYears
        exactDateOfBirthUnknown
        address {
          type
          line
          district
          state
          city
          postalCode
          country
        }
      }
      bride {
        id
        name {
          use
          firstNames
          middleName
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
          middleName
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
        _fhirIDPatient
        identifier {
          id
          type
          otherType
        }
        name {
          use
          firstNames
          middleName
          familyName
        }
      }
      witnessTwo {
        id
        relationship
        otherRelationship
        _fhirIDPatient
        identifier {
          id
          type
          otherType
        }
        name {
          use
          firstNames
          middleName
          familyName
        }
      }
      registration {
        id
        informantType
        otherInformantType
        contact
        contactRelationship
        contactPhoneNumber
        contactEmail
        groomSignature
        brideSignature
        witnessOneSignature
        witnessTwoSignature
        duplicates {
          compositionId
          trackingId
        }
        attachments {
          data
          uri
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
            partOf
          }
        }
        type
        trackingId
        registrationNumber
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
          alias
        }
        system {
          name
          type
        }
        user {
          id
          role {
            id
            label {
              id
              defaultMessage
              description
            }
          }
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
          value
        }
        output {
          valueCode
          valueId
          value
        }
        certificates {
          hasShowedVerifiedDocument
          collector {
            relationship
            otherRelationship
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
          certifier {
            name {
              use
              firstNames
              familyName
            }
            role {
              id
              label {
                id
                defaultMessage
                description
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
