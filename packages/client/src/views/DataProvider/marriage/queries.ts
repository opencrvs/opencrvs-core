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
        _fhirIDPatient
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
        groomSignatureURI
        brideSignature
        brideSignatureURI
        witnessOneSignature
        witnessOneSignatureURI
        witnessTwoSignature
        witnessTwoSignatureURI
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
        _fhirIDPatient
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
        groomSignatureURI
        brideSignature
        brideSignatureURI
        witnessOneSignature
        witnessOneSignatureURI
        witnessTwoSignature
        witnessTwoSignatureURI
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
          alias
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
