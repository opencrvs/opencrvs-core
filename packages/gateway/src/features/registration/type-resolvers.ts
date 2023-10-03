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
import {
  DUPLICATE_TRACKING_ID,
  FHIR_SPECIFICATION_URL,
  FLAGGED_AS_POTENTIAL_DUPLICATE,
  HAS_SHOWED_VERIFIED_DOCUMENT,
  NO_SUPPORTING_DOCUMENTATION_REQUIRED,
  OPENCRVS_SPECIFICATION_URL,
  ORIGINAL_FILE_NAME_SYSTEM,
  PAYMENT_DETAILS,
  REQUESTING_INDIVIDUAL,
  REQUESTING_INDIVIDUAL_OTHER,
  SYSTEM_FILE_NAME_SYSTEM
} from '@gateway/features/fhir/constants'
import {
  BIRTH_ATTENDANT_CODE,
  BIRTH_ENCOUNTER_CODE,
  BIRTH_TYPE_CODE,
  BODY_WEIGHT_CODE,
  CAUSE_OF_DEATH_CODE,
  CAUSE_OF_DEATH_ESTABLISHED_CODE,
  CAUSE_OF_DEATH_METHOD_CODE,
  DEATH_DESCRIPTION_CODE,
  DEATH_ENCOUNTER_CODE,
  FEMALE_DEPENDENTS_ON_DECEASED_CODE,
  LAST_LIVE_BIRTH_CODE,
  MALE_DEPENDENTS_ON_DECEASED_CODE,
  MANNER_OF_DEATH_CODE,
  MARRIAGE_ENCOUNTER_CODE,
  MARRIAGE_TYPE_CODE,
  NUMBER_BORN_ALIVE_CODE,
  NUMBER_FOEATAL_DEATH_CODE
} from '@gateway/features/fhir/templates'
import {
  ITimeLoggedResponse,
  fetchTaskByCompositionIdFromHearth,
  findExtension,
  getActionFromTask,
  getCertificatesFromTask,
  getStatusFromTask,
  getTimeLoggedFromMetrics
} from '@gateway/features/fhir/utils'
import { SignatureExtensionPostfix } from '@gateway/features/registration/fhir-builders'
import { getPresignedUrlFromUri } from '@gateway/features/registration/utils'
import { getSignatureExtension } from '@gateway/features/user/type-resolvers'

import {
  GQLQuestionnaireQuestion,
  GQLRegStatus,
  GQLResolver
} from '@gateway/graphql/schema'
import {
  ATTACHMENT_DOCS_CODE,
  BRIDE_CODE,
  Bundle,
  CHILD_CODE,
  Coding,
  DECEASED_CODE,
  DocumentReference,
  EncounterParticipant,
  Extension,
  FATHER_CODE,
  GROOM_CODE,
  INFORMANT_CODE,
  Identifier,
  Location,
  MOTHER_CODE,
  Patient,
  PaymentReconciliation,
  Practitioner,
  RelatedPerson,
  ResourceIdentifier,
  SPOUSE_CODE,
  Saved,
  Task,
  ValidRecord,
  WITNESS_ONE_CODE,
  WITNESS_TWO_CODE,
  findCompositionSection,
  findObservationByCode,
  getComposition,
  getEncounterFromRecord,
  getResourceFromBundleById,
  getTaskFromBundle,
  isDocumentReference,
  isObservation,
  isPatient,
  isQuestionnaireResponse,
  isSavedObservation,
  isTaskOrTaskHistory,
  resourceIdentifierToUUID,
  urlReferenceToID
} from '@opencrvs/commons/types'

import * as validateUUID from 'uuid-validate'

function findRelatedPerson(
  patientCode:
    | typeof INFORMANT_CODE
    | typeof WITNESS_ONE_CODE
    | typeof WITNESS_TWO_CODE
) {
  return (record: Saved<Saved<Bundle>>) => {
    const composition = getComposition(record)
    const patientSection = findCompositionSection(patientCode, composition)

    if (!patientSection || !patientSection.entry) {
      return null
    }
    return getResourceFromBundleById<RelatedPerson>(
      record,
      urlReferenceToID(patientSection.entry![0].reference)
    )
  }
}
function findPatient(
  patientCode:
    | typeof MOTHER_CODE
    | typeof FATHER_CODE
    | typeof CHILD_CODE
    | typeof INFORMANT_CODE
    | typeof DECEASED_CODE
    | typeof SPOUSE_CODE
    | typeof BRIDE_CODE
    | typeof GROOM_CODE
    | typeof WITNESS_ONE_CODE
    | typeof WITNESS_TWO_CODE
) {
  return (record: Saved<Saved<Bundle>>) => {
    const composition = getComposition(record)
    const patientSection = findCompositionSection(patientCode, composition)

    if (!patientSection || !patientSection.entry) {
      return null
    }

    const patientOrRelatedPerson = getResourceFromBundleById<
      Patient | RelatedPerson
    >(record, urlReferenceToID(patientSection.entry![0].reference))

    if (isPatient(patientOrRelatedPerson)) {
      return patientOrRelatedPerson
    }

    return getResourceFromBundleById(
      record,
      urlReferenceToID(patientOrRelatedPerson.patient.reference)
    )
  }
}

export const typeResolvers: GQLResolver = {
  EventRegistration: {
    __resolveType(record: Saved<ValidRecord>) {
      const composition = getComposition(record)
      if (
        composition.type.coding?.[0].code === 'birth-declaration' ||
        composition.type.coding?.[0].code === 'birth-notification'
      ) {
        return 'BirthRegistration'
      } else if (
        composition.type.coding?.[0].code === 'death-declaration' ||
        composition.type.coding?.[0].code === 'death-notification'
      ) {
        return 'DeathRegistration'
      } else {
        return 'MarriageRegistration'
      }
    }
  },
  HumanName: {
    firstNames(name) {
      return (name.given && name.given.join(' ')) || ''
    },
    familyName(name) {
      if (!name.family) {
        return null
      }
      return Array.isArray(name.family) ? name.family.join(' ') : name.family
    },
    marriedLastName(name) {
      if (!name.suffix) {
        return null
      }
      return Array.isArray(name.suffix) ? name.suffix.join(' ') : name.suffix
    }
  },
  IdentityType: {
    id: (identifier) => {
      return identifier.value
    },
    type: (identifier: Identifier) => {
      return identifier.type?.coding?.[0].code
    },
    otherType: (identifier) => {
      return identifier.otherType
    },
    fieldsModifiedByIdentity: (identifier) => {
      return identifier.fieldsModifiedByIdentity
    }
  },
  Address: {
    stateName: async (address, _, { dataSources }) => {
      const location = await dataSources.locationsAPI.getLocation(address.state)
      return location.name
    },
    districtName: async (address, _, { dataSources }) => {
      const location = await dataSources.locationsAPI.getLocation(
        address.district
      )
      return location.name
    },
    lineName: (address, _, { dataSources }) => {
      return Promise.all(
        address.line.map(async (line: string) => {
          if (!validateUUID(line)) {
            return line
          }
          const location = await dataSources.locationsAPI.getLocation(line)
          return location.name
        })
      )
    }
  },
  Person: {
    /* `gender` and `name` resolvers are trivial resolvers, so they don't need implementation */
    dateOfMarriage: (person: Patient) => {
      if (!person.extension) {
        return null
      }

      const marriageExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/date-of-marriage`,
        person.extension
      )
      return (marriageExtension && marriageExtension.valueDateTime) || null
    },
    age: (person: Patient) => {
      if (!person.extension) {
        return null
      }

      const marriageExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/age`,
        person.extension
      )
      if (!marriageExtension) {
        return null
      }
      if (marriageExtension.valueInteger) {
        return marriageExtension.valueInteger
      }
      return marriageExtension.valueString
    },
    maritalStatus: (person: Patient) => {
      return person && person.maritalStatus && person.maritalStatus.text
    },
    occupation: (person: Patient) => {
      if (!person.extension) {
        return null
      }

      const occupationExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/patient-occupation`,
        person.extension
      )
      return (occupationExtension && occupationExtension.valueString) || null
    },
    reasonNotApplying: (person: Patient) => {
      if (!person.extension) {
        return null
      }

      const reasonNotApplyingExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/reason-not-applying`,
        person.extension
      )
      return (
        (reasonNotApplyingExtension &&
          reasonNotApplyingExtension.valueString) ||
        null
      )
    },
    ageOfIndividualInYears: (person: Patient) => {
      if (!person.extension) {
        return null
      }

      const ageOfIndividualInYearsExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/age-of-individual-in-years`,
        person.extension
      )
      return (
        (ageOfIndividualInYearsExtension &&
          ageOfIndividualInYearsExtension.valueInteger) ||
        null
      )
    },
    exactDateOfBirthUnknown: (person: Patient) => {
      if (!person.extension) {
        return null
      }

      const exactDateOfBirthUnknownExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/age-of-individual-in-years`,
        person.extension
      )
      return (
        (exactDateOfBirthUnknownExtension &&
          exactDateOfBirthUnknownExtension.valueInteger) ||
        null
      )
    },
    detailsExist: (person: Patient) => {
      return person.active
    },
    multipleBirth: (person: Patient) => {
      return person.multipleBirthInteger
    },
    deceased: (person: Patient) => {
      return person
    },
    nationality: (person: Patient) => {
      if (!person.extension) {
        return null
      }

      const nationalityExtension = findExtension(
        `${FHIR_SPECIFICATION_URL}patient-nationality`,
        person.extension
      )
      if (!nationalityExtension || !nationalityExtension.extension) {
        return null
      }
      const countryCodeExtension = findExtension(
        'code',
        nationalityExtension.extension
      )

      const coding =
        (countryCodeExtension &&
          countryCodeExtension.valueCodeableConcept &&
          countryCodeExtension.valueCodeableConcept.coding &&
          countryCodeExtension.valueCodeableConcept.coding) ||
        []

      // Nationality could be multiple
      const nationality = coding.map((n) => {
        return n.code
      })

      return nationality
    },
    educationalAttainment: (person: Patient) => {
      if (!person.extension) {
        return null
      }

      const educationalAttainmentExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/educational-attainment`,
        person.extension
      )
      return (
        (educationalAttainmentExtension &&
          educationalAttainmentExtension.valueString) ||
        null
      )
    }
  },
  RelatedPerson: {
    id: (relatedPerson) => {
      return relatedPerson && relatedPerson.id
    },
    _fhirIDPatient: async (relatedPerson: Saved<RelatedPerson>) => {
      return urlReferenceToID(relatedPerson.patient.reference)
    },
    relationship: (relatedPerson) => {
      return (
        relatedPerson &&
        relatedPerson.relationship &&
        relatedPerson.relationship.coding &&
        relatedPerson.relationship.coding[0].code
      )
    },
    otherRelationship: (relatedPerson) => {
      return (
        relatedPerson &&
        relatedPerson.relationship &&
        relatedPerson.relationship.text
      )
    },
    name: async (relatedPerson, _, context) => {
      const person = getResourceFromBundleById<Patient>(
        context.record!,
        urlReferenceToID(relatedPerson.patient.reference)
      )
      return (person && person.name) || null
    },
    dateOfMarriage: async (relatedPerson, _, context) => {
      const person = getResourceFromBundleById<Patient>(
        context.record!,
        urlReferenceToID(relatedPerson.patient.reference)
      )
      const marriageExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/date-of-marriage`,
        person?.extension || []
      )
      return (marriageExtension && marriageExtension.valueDateTime) || null
    },
    age: async (relatedPerson, _, context) => {
      const person = getResourceFromBundleById<Patient>(
        context.record!,
        urlReferenceToID(relatedPerson.patient.reference)
      )
      const marriageExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/age`,
        person?.extension || []
      )
      if (!marriageExtension) {
        return null
      }
      if (marriageExtension.valueInteger) {
        return marriageExtension.valueInteger
      }
      return marriageExtension.valueString
    },
    birthDate: async (relatedPerson, _, context) => {
      const person = getResourceFromBundleById<Patient>(
        context.record!,
        urlReferenceToID(relatedPerson.patient.reference)
      )
      return (person && person.birthDate) || null
    },
    identifier: async (relatedPerson, _, context) => {
      const person = getResourceFromBundleById<Patient>(
        context.record!,
        urlReferenceToID(relatedPerson.patient.reference)
      )
      return (person && person.identifier) || null
    },
    maritalStatus: async (relatedPerson, _, context) => {
      const person = getResourceFromBundleById<Patient>(
        context.record!,
        urlReferenceToID(relatedPerson.patient.reference)
      )
      return person && person.maritalStatus && person.maritalStatus.text
    },
    occupation: async (relatedPerson, _, context) => {
      const person = getResourceFromBundleById<Patient>(
        context.record!,
        urlReferenceToID(relatedPerson.patient.reference)
      )
      const occupationExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/patient-occupation`,
        person?.extension || []
      )
      return (occupationExtension && occupationExtension.valueString) || null
    },
    reasonNotApplying: async (relatedPerson, _, context) => {
      const person = getResourceFromBundleById<Patient>(
        context.record!,
        urlReferenceToID(relatedPerson.patient.reference)
      )
      const reasonNotApplyingExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/reason-not-applying`,
        person?.extension || []
      )
      return (
        (reasonNotApplyingExtension &&
          reasonNotApplyingExtension.valueString) ||
        null
      )
    },
    ageOfIndividualInYears: async (relatedPerson, _, context) => {
      const person = getResourceFromBundleById<Patient>(
        context.record!,
        urlReferenceToID(relatedPerson.patient.reference)
      )
      const ageOfIndividualInYearsExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/age-of-individual-in-years`,
        person?.extension || []
      )
      return (
        (ageOfIndividualInYearsExtension &&
          ageOfIndividualInYearsExtension.valueInteger) ||
        null
      )
    },
    exactDateOfBirthUnknown: async (relatedPerson, _, context) => {
      const person = getResourceFromBundleById<Patient>(
        context.record!,
        urlReferenceToID(relatedPerson.patient.reference)
      )
      const exactDateOfBirthUnknownExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/age-of-individual-in-years`,
        person?.extension || []
      )
      return (
        (exactDateOfBirthUnknownExtension &&
          exactDateOfBirthUnknownExtension.valueInteger) ||
        null
      )
    },
    detailsExist: async (relatedPerson, _, context) => {
      const person = getResourceFromBundleById<Patient>(
        context.record!,
        urlReferenceToID(relatedPerson.patient.reference)
      )
      return person?.active
    },
    multipleBirth: async (relatedPerson, _, context) => {
      const person = getResourceFromBundleById<Patient>(
        context.record!,
        urlReferenceToID(relatedPerson.patient.reference)
      )
      return person?.multipleBirthInteger
    },
    deceased: async (relatedPerson, _, context) => {
      const person = getResourceFromBundleById<Patient>(
        context.record!,
        urlReferenceToID(relatedPerson.patient.reference)
      )
      return person
    },
    nationality: async (relatedPerson, _, context) => {
      const person = getResourceFromBundleById<Patient>(
        context.record!,
        urlReferenceToID(relatedPerson.patient.reference)
      )

      const nationalityExtension = findExtension(
        `${FHIR_SPECIFICATION_URL}patient-nationality`,
        person?.extension || []
      )
      if (!nationalityExtension || !nationalityExtension.extension) {
        return null
      }
      const countryCodeExtension = findExtension(
        'code',
        nationalityExtension.extension
      )

      const coding =
        (countryCodeExtension &&
          countryCodeExtension.valueCodeableConcept &&
          countryCodeExtension.valueCodeableConcept.coding &&
          countryCodeExtension.valueCodeableConcept.coding) ||
        []

      // Nationality could be multiple
      const nationality = coding.map((n) => {
        return n.code
      })

      return nationality
    },
    educationalAttainment: async (relatedPerson, _, context) => {
      const person = getResourceFromBundleById<Patient>(
        context.record!,
        urlReferenceToID(relatedPerson.patient.reference)
      )
      const educationalAttainmentExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/educational-attainment`,
        person?.extension || []
      )
      return (
        (educationalAttainmentExtension &&
          educationalAttainmentExtension.valueString) ||
        null
      )
    },
    address: async (relatedPerson, _, context) => {
      const person = getResourceFromBundleById<Patient>(
        context.record!,
        urlReferenceToID(relatedPerson.patient.reference)
      )
      return person?.address
    }
  },
  Deceased: {
    deceased: (person) => {
      return person && person.deceasedBoolean
    },
    deathDate: (person) => {
      return person && person.deceasedDateTime
    }
  },
  Registration: {
    async trackingId(task: Task) {
      const trackingId =
        task &&
        task.code &&
        task.code.coding &&
        task.code.coding[0] &&
        task.code.coding[0].code

      let specificationIdentifier:
        | 'birth-tracking-id'
        | 'death-tracking-id'
        | 'marriage-tracking-id'

      if (trackingId === 'BIRTH') {
        specificationIdentifier = 'birth-tracking-id'
      } else if (trackingId === 'DEATH') {
        specificationIdentifier = 'death-tracking-id'
      } else if (trackingId === 'MARRIAGE') {
        specificationIdentifier = 'marriage-tracking-id'
      }
      const foundIdentifier =
        task.identifier &&
        task.identifier.find(
          (identifier: Identifier) =>
            identifier.system ===
            `${OPENCRVS_SPECIFICATION_URL}id/${specificationIdentifier}`
        )

      return (foundIdentifier && foundIdentifier.value) || null
    },
    async registrationNumber(task: Task) {
      const regNoType =
        task &&
        task.code &&
        task.code.coding &&
        task.code.coding[0] &&
        task.code.coding[0].code

      let specificationIdentifier:
        | 'birth-registration-number'
        | 'death-registration-number'
        | 'marriage-registration-number'

      if (regNoType === 'BIRTH') {
        specificationIdentifier = 'birth-registration-number'
      } else if (regNoType === 'DEATH') {
        specificationIdentifier = 'death-registration-number'
      } else if (regNoType === 'MARRIAGE') {
        specificationIdentifier = 'marriage-registration-number'
      }
      const foundIdentifier =
        task.identifier &&
        task.identifier.find(
          (identifier: Identifier) =>
            identifier.system ===
            `${OPENCRVS_SPECIFICATION_URL}id/${specificationIdentifier}`
        )

      return (foundIdentifier && foundIdentifier.value) || null
    },
    async mosipAid(task: Task) {
      const mosipAidType =
        task &&
        task.code &&
        task.code.coding &&
        task.code.coding[0] &&
        task.code.coding[0].code

      if (mosipAidType !== 'BIRTH') {
        return null
      }

      const foundIdentifier =
        task.identifier &&
        task.identifier.find(
          (identifier: Identifier) =>
            identifier.system === `${OPENCRVS_SPECIFICATION_URL}id/mosip-aid`
        )

      return (foundIdentifier && foundIdentifier.value) || null
    },
    async attachments(task: Task, _, context) {
      if (!task.focus) {
        throw new Error(
          'Task resource does not have a focus property necessary to lookup the composition'
        )
      }

      const composition = getComposition(context.record!)
      const docSection = findCompositionSection(
        ATTACHMENT_DOCS_CODE,
        composition
      )
      if (!docSection || !docSection.entry) {
        return null
      }
      const docRefReferences = docSection.entry.map(
        (docRefEntry) => docRefEntry.reference
      )
      return docRefReferences.map(async (docRefReference) =>
        getResourceFromBundleById(
          context.record!,
          urlReferenceToID(docRefReference)
        )
      )
    },
    async informantType(task: Saved<Task>, _, context) {
      if (!task.focus) {
        return null
      }
      const composition = getComposition(context.record!)
      const patientSection = findCompositionSection(INFORMANT_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }

      const relatedPerson = getResourceFromBundleById<RelatedPerson>(
        context.record!,
        urlReferenceToID(patientSection.entry[0].reference)
      )

      if (
        relatedPerson &&
        relatedPerson.relationship &&
        relatedPerson.relationship.coding &&
        relatedPerson.relationship.coding[0]
      ) {
        return relatedPerson.relationship?.coding[0].code
      } else {
        return null
      }
    },
    async otherInformantType(task: Task, _, context) {
      if (!task.focus) {
        return null
      }
      const composition = getComposition(context.record!)
      const patientSection = findCompositionSection(INFORMANT_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      const relatedPerson = getResourceFromBundleById<RelatedPerson>(
        context.record!,
        urlReferenceToID(patientSection.entry[0].reference)
      )

      if (
        relatedPerson &&
        relatedPerson.relationship &&
        relatedPerson.relationship.coding &&
        relatedPerson.relationship.coding[0]
      ) {
        return relatedPerson.relationship?.text
      } else {
        return null
      }
    },
    contact: (task) => {
      const contact = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/contact-person`,
        task.extension
      )
      return (contact && contact.valueString) || null
    },
    informantsSignature: async (task, _, { headers: authHeader }) => {
      const signatureExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/${SignatureExtensionPostfix.INFORMANT}`,
        task.extension
      )
      if (signatureExtension && signatureExtension.valueString) {
        return await getPresignedUrlFromUri(
          signatureExtension.valueString,
          authHeader
        )
      }
      return null
    },
    informantsSignatureURI: (task) => {
      const contact = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/${SignatureExtensionPostfix.INFORMANT}`,
        task.extension
      )
      return (contact && contact.valueString) || null
    },
    groomSignature: async (task, _, { headers: authHeader }) => {
      const signatureExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/${SignatureExtensionPostfix.GROOM}`,
        task.extension
      )
      if (signatureExtension && signatureExtension.valueString) {
        return await getPresignedUrlFromUri(
          signatureExtension.valueString,
          authHeader
        )
      }
      return null
    },
    groomSignatureURI: (task) => {
      const contact = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/${SignatureExtensionPostfix.GROOM}`,
        task.extension
      )
      return (contact && contact.valueString) || null
    },
    brideSignature: async (task, _, { headers: authHeader }) => {
      const signatureExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/${SignatureExtensionPostfix.BRIDE}`,
        task.extension
      )
      if (signatureExtension && signatureExtension.valueString) {
        return await getPresignedUrlFromUri(
          signatureExtension.valueString,
          authHeader
        )
      }
      return null
    },
    brideSignatureURI: (task) => {
      const contact = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/${SignatureExtensionPostfix.BRIDE}`,
        task.extension
      )
      return (contact && contact.valueString) || null
    },
    witnessOneSignature: async (task, _, { headers: authHeader }) => {
      const signatureExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/${SignatureExtensionPostfix.WITNESS_ONE}`,
        task.extension
      )
      if (signatureExtension && signatureExtension.valueString) {
        return await getPresignedUrlFromUri(
          signatureExtension.valueString,
          authHeader
        )
      }
      return null
    },
    witnessOneSignatureURI: (task) => {
      const contact = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/${SignatureExtensionPostfix.WITNESS_ONE}`,
        task.extension
      )
      return (contact && contact.valueString) || null
    },
    witnessTwoSignature: async (task, _, { headers: authHeader }) => {
      const signatureExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/${SignatureExtensionPostfix.WITNESS_TWO}`,
        task.extension
      )
      if (signatureExtension && signatureExtension.valueString) {
        return await getPresignedUrlFromUri(
          signatureExtension.valueString,
          authHeader
        )
      }
      return null
    },
    witnessTwoSignatureURI: (task) => {
      const contact = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/${SignatureExtensionPostfix.WITNESS_TWO}`,
        task.extension
      )
      return (contact && contact.valueString) || null
    },
    contactRelationship: (task) => {
      const contact = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/contact-relationship`,
        task.extension
      )
      return (contact && contact.valueString) || null
    },
    contactPhoneNumber: (task) => {
      const contactNumber = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/contact-person-phone-number`,
        task.extension
      )
      return (contactNumber && contactNumber.valueString) || null
    },
    contactEmail: (task) => {
      const email = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/contact-person-email`,
        task.extension
      )
      return (email && email.valueString) || null
    },
    paperFormID: (task) => {
      const foundIdentifier =
        task.identifier &&
        task.identifier.find(
          (identifier: Identifier) =>
            identifier.system ===
            `${OPENCRVS_SPECIFICATION_URL}id/paper-form-id`
        )

      return (foundIdentifier && foundIdentifier.value) || null
    },
    page: (task) => {
      const foundIdentifier =
        task.identifier &&
        task.identifier.find(
          (identifier: Identifier) =>
            identifier.system ===
            `${OPENCRVS_SPECIFICATION_URL}id/paper-form-page`
        )

      return (foundIdentifier && foundIdentifier.value) || null
    },
    book: (task) => {
      const foundIdentifier =
        task.identifier &&
        task.identifier.find(
          (identifier: Identifier) =>
            identifier.system ===
            `${OPENCRVS_SPECIFICATION_URL}id/paper-form-book`
        )

      return (foundIdentifier && foundIdentifier.value) || null
    },
    status: async (task: Saved<Task>, _, context) => {
      return context.record?.entry
        .map(({ resource }) => resource)
        .filter(isTaskOrTaskHistory)
        .sort(
          (a, b) =>
            new Date(b.lastModified).valueOf() -
            new Date(a.lastModified).valueOf()
        )
    },
    type: (task) => {
      const taskType = task.code
      const taskCode = taskType.coding.find(
        (coding: Coding) =>
          coding.system === `${OPENCRVS_SPECIFICATION_URL}types`
      )
      return (taskCode && taskCode.code) || null
    },
    duplicates: async (task, _, context) => {
      if (!task.focus) {
        throw new Error(
          'Task resource does not have a focus property necessary to lookup the composition'
        )
      }

      const composition = getComposition(context.record!)
      const duplicateCompositionIds =
        composition.relatesTo &&
        composition.relatesTo.map((duplicate) => {
          if (
            duplicate.code &&
            duplicate.code === 'duplicate' &&
            duplicate.targetReference &&
            duplicate.targetReference.reference
          ) {
            return duplicate.targetReference.reference.split('/')[1]
          }
          return null
        })

      const duplicateData =
        duplicateCompositionIds &&
        (await Promise.all(
          duplicateCompositionIds.map(async (compositionId: string) => {
            const taskData = await fetchTaskByCompositionIdFromHearth(
              compositionId
            )
            return {
              compositionId: compositionId,
              trackingId: taskData.entry?.[0].resource?.identifier?.find(
                (identifier) =>
                  identifier.system &&
                  [
                    `${OPENCRVS_SPECIFICATION_URL}id/birth-tracking-id`,
                    `${OPENCRVS_SPECIFICATION_URL}id/death-tracking-id`
                  ].includes(identifier.system)
              )?.value
            }
          })
        ))
      return duplicateData
    },
    certificates: async (task, _, { headers: authHeader }) =>
      await getCertificatesFromTask(task, _, authHeader),
    assignment: async (task, _, context) => {
      const assignmentExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/regAssigned`,
        task.extension
      )
      const regLastOfficeExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastOffice`,
        task.extension
      )

      if (assignmentExtension) {
        const regLastUserExtension = findExtension(
          `${OPENCRVS_SPECIFICATION_URL}extension/regLastUser`,
          task.extension
        )

        const practitionerId =
          regLastUserExtension?.valueReference?.reference?.split('/')?.[1]

        if (practitionerId) {
          const user =
            await context.dataSources.usersAPI.getUserByPractitionerId(
              practitionerId
            )
          if (user) {
            return {
              userId: user._id,
              firstName: user.name[0].given.join(' '),
              lastName: user.name[0].family,
              officeName: regLastOfficeExtension?.valueString || ''
            }
          }
        }
      }
      return null
    }
  },
  RegWorkflow: {
    type: (task: Task) => {
      return getStatusFromTask(task)
    },
    user: async (task, _, context) => {
      const user = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastUser`,
        task.extension
      )
      if (!user || !user.valueReference || !user.valueReference.reference) {
        return null
      }
      return context.dataSources.usersAPI.getUserByPractitionerId(
        resourceIdentifierToUUID(user.valueReference.reference)
      )
    },
    reason: (task: Task) => (task.reason && task.reason.text) || null,
    timestamp: (task) => task.lastModified,
    comments: (task) => task.note,
    location: async (task, _, { dataSources }) => {
      const taskLocation = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastLocation`,
        task.extension
      )
      if (!taskLocation || !taskLocation.valueReference) {
        return null
      }
      return dataSources.locationsAPI.getLocation(
        taskLocation.valueReference.reference?.split('/')[1] as string
      )
    },
    office: async (task, _, { dataSources }) => {
      const taskLocation = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastOffice`,
        task.extension
      )
      if (!taskLocation || !taskLocation.valueReference) {
        return null
      }
      return dataSources.locationsAPI.getLocation(
        taskLocation.valueReference.reference?.split('/')[1] as string
      )
    },
    timeLogged: async (task, _, { headers: authHeader }) => {
      const compositionId =
        (task.focus.reference && task.focus.reference.split('/')[1]) || ''
      const timeLoggedResponse = (await getTimeLoggedFromMetrics(
        authHeader,
        compositionId,
        getStatusFromTask(task) || ''
      )) as ITimeLoggedResponse
      return (timeLoggedResponse && timeLoggedResponse.timeSpentEditing) || 0
    }
  },
  Comment: {
    user: async (comment, _, context) => {
      if (!comment.authorString) {
        return null
      }
      return context.dataSources.usersAPI.getUserByPractitionerId(
        resourceIdentifierToUUID(comment.authorString)
      )
    },
    comment: (comment) => comment.text,
    createdAt: (comment) => comment.time
  },
  Attachment: {
    id(docRef: DocumentReference) {
      return (docRef.masterIdentifier && docRef.masterIdentifier.value) || null
    },
    async data(docRef: DocumentReference, _, { headers: authHeader }) {
      const fileUri = docRef.content[0].attachment.data
      if (fileUri) {
        return getPresignedUrlFromUri(fileUri, authHeader)
      }
      return null
    },
    uri(docRef: DocumentReference) {
      return docRef.content[0].attachment.data
    },
    contentType(docRef: DocumentReference) {
      return docRef.content[0].attachment.contentType
    },
    originalFileName(docRef: DocumentReference) {
      const foundIdentifier =
        docRef.identifier &&
        docRef.identifier.find(
          (identifier: Identifier) =>
            identifier.system === ORIGINAL_FILE_NAME_SYSTEM
        )
      return (foundIdentifier && foundIdentifier.value) || null
    },
    systemFileName(docRef: DocumentReference) {
      const foundIdentifier =
        docRef.identifier &&
        docRef.identifier.find(
          (identifier: Identifier) =>
            identifier.system === SYSTEM_FILE_NAME_SYSTEM
        )
      return (foundIdentifier && foundIdentifier.value) || null
    },
    type(docRef: DocumentReference) {
      return (
        (docRef.type && docRef.type.coding && docRef.type.coding[0].code) ||
        null
      )
    },
    subject(docRef: DocumentReference) {
      return (docRef.subject && docRef.subject.display) || null
    },
    createdAt(docRef: DocumentReference) {
      return docRef.created
    }
  },
  Certificate: {
    async collector(docRef: DocumentReference, _, context) {
      const relatedPersonRef =
        docRef.extension &&
        findExtension(
          `${OPENCRVS_SPECIFICATION_URL}extension/collector`,
          docRef.extension
        )
      if (!relatedPersonRef || !relatedPersonRef.valueReference.reference) {
        return null
      }

      return getResourceFromBundleById<RelatedPerson>(
        context.record!,
        resourceIdentifierToUUID(
          relatedPersonRef.valueReference.reference as ResourceIdentifier
        )
      )
    },
    async hasShowedVerifiedDocument(docRef: DocumentReference, _) {
      const hasShowedDocument = findExtension(
        HAS_SHOWED_VERIFIED_DOCUMENT,
        docRef.extension as Extension[]
      )

      if (hasShowedDocument?.valueString) {
        return Boolean(hasShowedDocument?.valueString)
      }

      if (typeof hasShowedDocument?.valueBoolean === 'boolean') {
        return hasShowedDocument?.valueBoolean
      }

      return false
    }
  },
  Identifier: {
    system: (identifier) => identifier.system,
    value: (identifier) => identifier.value
  },
  Location: {
    name: (location) => location.name,
    status: (location) => location.status,
    identifier: (location) => location.identifier,
    longitude: (location) => location.position.longitude,
    latitude: (location) => location.position.latitude,
    alias: (location) => location.alias,
    description: (location) => location.description,
    partOf: (location) => location.partOf.reference,
    type: (location: Location) => {
      return (
        (location.type &&
          location.type.coding &&
          location.type.coding[0].code) ||
        null
      )
    },
    address: (location) => location.address
  },
  MedicalPractitioner: {
    name: async (encounterParticipant: EncounterParticipant, _, context) => {
      if (
        !encounterParticipant ||
        !encounterParticipant.individual ||
        !encounterParticipant.individual.reference
      ) {
        return null
      }

      const practitioner = getResourceFromBundleById(
        context.record!,
        resourceIdentifierToUUID(
          encounterParticipant.individual.reference as ResourceIdentifier
        )
      ) as Practitioner

      return (
        (practitioner &&
          practitioner.name &&
          practitioner.name[0] &&
          practitioner.name[0].family) ||
        null
      )
    },
    qualification: async (encounterParticipant, _, context) => {
      if (
        !encounterParticipant ||
        !encounterParticipant.individual ||
        !encounterParticipant.individual.reference
      ) {
        return null
      }

      const practitioner = getResourceFromBundleById(
        context.record!,
        resourceIdentifierToUUID(encounterParticipant.individual.reference)
      ) as Practitioner
      return (
        (practitioner &&
          practitioner.qualification &&
          practitioner.qualification[0] &&
          practitioner.qualification[0].code &&
          practitioner.qualification[0].code.coding &&
          practitioner.qualification[0].code.coding[0] &&
          practitioner.qualification[0].code.coding[0].code) ||
        null
      )
    },
    lastVisitDate: async (encounterParticipant, _, { headers: authHeader }) => {
      return (
        (encounterParticipant &&
          encounterParticipant.period &&
          encounterParticipant.period.start) ||
        null
      )
    }
  },
  History: {
    documents: async (task: Task, _, context) => {
      const encounter = task.encounter?.reference
      if (!encounter) {
        return []
      }

      return context
        .record!.entry.map((entry) => entry.resource)
        .filter(isDocumentReference)
        .filter((x) => x.subject?.reference === encounter)
    },
    payment: async (task: Task, _, context) => {
      const includesPayment = findExtension(
        PAYMENT_DETAILS,
        task.extension as Extension[]
      )

      if (!includesPayment) {
        return null
      }

      const paymentReference = includesPayment.valueReference!
        .reference as `${string}/${string}`

      const paymentId = paymentReference.split('/')[1]
      const paymentReconciliation =
        getResourceFromBundleById<PaymentReconciliation>(
          context.record!,
          paymentId
        )

      if (!paymentReconciliation) {
        throw new Error(
          'PaymentReconciliation resource not found even when task has payment extension. This should never happen'
        )
      }

      const documentReference = context
        .record!.entry.map((entry) => entry.resource)
        .filter(isDocumentReference)
        .filter(
          (x) => x.subject?.reference === `PaymentReconciliation/${paymentId}`
        )

      return {
        id: paymentId,
        type: paymentReconciliation.detail?.[0].type?.coding?.[0].code,
        amount: paymentReconciliation.detail?.[0].amount?.value,
        outcome: paymentReconciliation.outcome?.coding?.[0].code,
        date: paymentReconciliation.detail?.[0].date,
        attachmentURL:
          documentReference.length > 0
            ? await getPresignedUrlFromUri(
                documentReference[0].content[0].attachment.data!,
                context.headers
              )
            : null
      }
    },
    hasShowedVerifiedDocument: (task: Task) => {
      const hasShowedDocument = findExtension(
        HAS_SHOWED_VERIFIED_DOCUMENT,
        task.extension as Extension[]
      )

      if (hasShowedDocument?.valueString) {
        return Boolean(hasShowedDocument?.valueString)
      }

      if (typeof hasShowedDocument?.valueBoolean === 'boolean') {
        return hasShowedDocument?.valueBoolean
      }

      return false
    },

    noSupportingDocumentationRequired: (task: Task) => {
      const hasShowedDocument = findExtension(
        NO_SUPPORTING_DOCUMENTATION_REQUIRED,
        task.extension as Extension[]
      )

      return Boolean(hasShowedDocument?.valueBoolean)
    },

    requester: (task: Task) => {
      const requestedBy = findExtension(
        REQUESTING_INDIVIDUAL,
        task.extension as Extension[]
      )

      return requestedBy?.valueString || ''
    },
    requesterOther: (task: Task) => {
      const requestedBy = findExtension(
        REQUESTING_INDIVIDUAL_OTHER,
        task.extension as Extension[]
      )

      return requestedBy?.valueString || ''
    },
    regStatus: (task: Task) => getStatusFromTask(task),
    action: (task) => getActionFromTask(task),
    ipAddress: (task, _, context) => {
      const verifiedExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/regVerified`,
        task.extension as Extension[]
      )
      if (!verifiedExtension || !verifiedExtension.valueString) {
        return null
      }
      return verifiedExtension.valueString
    },
    statusReason: (task: Task) => task.statusReason || null,
    reason: (task: Task) => task.reason?.text || null,
    otherReason: (task: Task) => {
      return task.reason?.extension ? task.reason?.extension[0].valueString : ''
    },
    note: (task: Task) => {
      return task.note ? task.note[0].text : ''
    },
    date: (task: Task) => task.meta?.lastUpdated,
    dhis2Notification: (task: Task) =>
      task.identifier?.some(
        ({ system }) =>
          system === `${OPENCRVS_SPECIFICATION_URL}id/dhis2_event_identifier`
      ),
    user: async (task: Task, _: any, { dataSources }) => {
      const systemIdentifier = task.identifier?.find(
        ({ system }) =>
          system === `${OPENCRVS_SPECIFICATION_URL}id/system_identifier`
      )
      const user = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastUser`,
        task.extension as Extension[]
      )
      if (
        systemIdentifier ||
        !user ||
        !user.valueReference ||
        !user.valueReference.reference
      ) {
        return null
      }
      const practitionerId = user.valueReference.reference.split('/')[1]
      const practitionerRoleBundle =
        await dataSources.practitionerRoleAPI.getPractitionerRoleByPractitionerId(
          practitionerId
        )

      const practitionerRoleId = practitionerRoleBundle.entry?.[0].resource?.id

      const practitionerRoleHistory =
        await dataSources.practitionerRoleAPI.getPractionerRoleHistory(
          practitionerRoleId
        )
      const result = practitionerRoleHistory.find(
        (it) =>
          it?.meta?.lastUpdated &&
          task.lastModified &&
          it?.meta?.lastUpdated <= task.lastModified!
      )

      const targetCode = result?.code?.find((element) => {
        return element.coding?.[0].system === 'http://opencrvs.org/specs/types'
      })

      const role = targetCode?.coding?.[0].code

      const userResponse = await dataSources.usersAPI.getUserByPractitionerId(
        resourceIdentifierToUUID(user.valueReference.reference)
      )

      if (role) {
        userResponse.role.labels = JSON.parse(role)
      }

      return userResponse
    },
    system: async (task: Task, _: any, { headers: authHeader }) => {
      const systemIdentifier = task.identifier?.find(
        ({ system }) =>
          system === `${OPENCRVS_SPECIFICATION_URL}id/system_identifier`
      )
      if (!systemIdentifier || !systemIdentifier.value) {
        return null
      }
      return JSON.parse(systemIdentifier.value)
    },
    location: async (task: Task, _: any, { dataSources }) => {
      const taskLocation = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastLocation`,
        task.extension as Extension[]
      )
      if (!taskLocation || !taskLocation.valueReference) {
        return null
      }
      return dataSources.locationsAPI.getLocation(
        taskLocation.valueReference.reference?.split('/')[1] as string
      )
    },
    office: async (task: Task, _: any, { dataSources }) => {
      const taskLocation = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastOffice`,
        task.extension as Extension[]
      )
      if (!taskLocation || !taskLocation.valueReference) {
        return null
      }
      return dataSources.locationsAPI.getLocation(
        taskLocation.valueReference.reference?.split('/')[1] as string
      )
    },
    comments: (task) => task.note || [],
    input: (task) => task.input || [],
    output: (task) => task.output || [],
    certificates: async (task, _, { headers: authHeader }) => {
      if (
        getActionFromTask(task) ||
        getStatusFromTask(task) !== GQLRegStatus.CERTIFIED
      ) {
        return null
      }
      return await getCertificatesFromTask(task, _, authHeader)
    },
    signature: async (task: Task, _: any, context) => {
      const action = getActionFromTask(task)
      const status = getStatusFromTask(task)
      if (
        action ||
        (status !== GQLRegStatus.REGISTERED &&
          status !== GQLRegStatus.VALIDATED)
      ) {
        return null
      }
      const user = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastUser`,
        task.extension as Extension[]
      )
      if (!user || !user.valueReference || !user.valueReference.reference) {
        return null
      }

      const practitionerId = resourceIdentifierToUUID(
        user.valueReference.reference
      )
      const practitioner = getResourceFromBundleById<Practitioner>(
        context.record!,
        practitionerId
      )

      const signatureExtension = getSignatureExtension(practitioner.extension)
      const signature = signatureExtension && signatureExtension.valueSignature
      return (
        signature && {
          type: signature.contentType,
          data: signature.blob
        }
      )
    },
    duplicateOf: (task: Task) => {
      const extensions = task.extension || []
      const duplicateTrackingIdExt = findExtension(
        DUPLICATE_TRACKING_ID,
        extensions
      )
      return duplicateTrackingIdExt?.valueString
    },
    potentialDuplicates: (task: Task) => {
      const extensions = task.extension || []
      const duplicateTrackingIdExt = findExtension(
        FLAGGED_AS_POTENTIAL_DUPLICATE,
        extensions
      )
      return duplicateTrackingIdExt?.valueString?.split(',')
    }
  },
  DeathRegistration: {
    id(record: Saved<Bundle>) {
      const composition = getComposition(record)
      return composition.id
    },
    async _fhirIDMap(record: Saved<Bundle>) {
      const composition = getComposition(record)
      const encounter = getEncounterFromRecord(record, DEATH_ENCOUNTER_CODE)

      const encounterReference = `Encounter/${encounter.id}`
      const recordResources = record.entry.map((x) => x.resource)

      const questionnaireResponses = recordResources
        .filter(isQuestionnaireResponse)
        .filter(
          (response) => response.subject?.reference === encounterReference
        )

      const observation: Record<string, string> = {}

      const observations = recordResources
        .filter(isSavedObservation)
        .filter(
          (observation) => observation.context?.reference === encounterReference
        )

      if (observations) {
        const observationKeys = {
          maleDependentsOfDeceased: MALE_DEPENDENTS_ON_DECEASED_CODE,
          femaleDependentsOfDeceased: FEMALE_DEPENDENTS_ON_DECEASED_CODE,
          mannerOfDeath: MANNER_OF_DEATH_CODE,
          causeOfDeathMethod: CAUSE_OF_DEATH_METHOD_CODE,
          causeOfDeathEstablished: CAUSE_OF_DEATH_ESTABLISHED_CODE,
          deathDescription: DEATH_DESCRIPTION_CODE,
          causeOfDeath: CAUSE_OF_DEATH_CODE
        }
        observations.map((item) => {
          if (item.code.coding?.[0]?.code) {
            const itemCode = item.code.coding[0].code
            const observationKey = Object.keys(observationKeys).find(
              (key: keyof typeof observationKeys) =>
                observationKeys[key] === itemCode
            )
            if (observationKey) {
              observation[observationKey] = item.id
            }
          }
        })
      }

      return {
        composition: composition.id,
        encounter: encounterReference.split('/')[1],
        eventLocation: urlReferenceToID(
          encounter.location[0].location.reference
        ),
        observation,
        questionnaireResponse: questionnaireResponses[0]?.id
      }
    },
    createdAt(record: Saved<Bundle>) {
      const composition = getComposition(record)
      return composition.date
    },
    mother: findPatient(MOTHER_CODE),
    father: findPatient(FATHER_CODE),
    informant: findRelatedPerson(INFORMANT_CODE),
    deceased: findPatient(DECEASED_CODE),
    spouse: findPatient(SPOUSE_CODE),

    async registration(record: Saved<Bundle>) {
      return getTaskFromBundle(record)
    },
    async eventLocation(record: Saved<Bundle>) {
      const encounter = getEncounterFromRecord(record, DEATH_ENCOUNTER_CODE)

      return getResourceFromBundleById(
        record,
        urlReferenceToID(encounter.location[0].location.reference)
      )
    },
    async deathDescription(record: Saved<Bundle>) {
      return findObservationByCode(record, DEATH_DESCRIPTION_CODE)?.valueString
    },
    async mannerOfDeath(record: Saved<Bundle>) {
      return findObservationByCode(record, MANNER_OF_DEATH_CODE)
        ?.valueCodeableConcept?.coding?.[0].code
    },
    async causeOfDeathEstablished(record: Saved<Bundle>) {
      return findObservationByCode(record, CAUSE_OF_DEATH_ESTABLISHED_CODE)
        ?.valueCodeableConcept?.coding?.[0].code
    },
    async causeOfDeathMethod(record: Saved<Bundle>) {
      return findObservationByCode(record, CAUSE_OF_DEATH_METHOD_CODE)
        ?.valueCodeableConcept?.coding?.[0].code
    },
    async causeOfDeath(record: Saved<Bundle>) {
      return findObservationByCode(record, CAUSE_OF_DEATH_CODE)
        ?.valueCodeableConcept?.coding?.[0].code
    },
    async maleDependentsOfDeceased(record: Saved<Bundle>) {
      return findObservationByCode(record, MALE_DEPENDENTS_ON_DECEASED_CODE)
        ?.valueString
    },
    async femaleDependentsOfDeceased(record: Saved<Bundle>) {
      return findObservationByCode(record, FEMALE_DEPENDENTS_ON_DECEASED_CODE)
        ?.valueString
    },

    async questionnaire(record: Saved<Bundle>) {
      const recordResources = record.entry.map((x) => x.resource)

      const encounter = getEncounterFromRecord(record, DEATH_ENCOUNTER_CODE)

      const questionnaireResponses = recordResources
        .filter(isQuestionnaireResponse)
        .filter(
          (response) =>
            response.subject?.reference === `Encounter/${encounter.id}`
        )

      const questionnaireResponse = questionnaireResponses[0]

      if (!questionnaireResponse) {
        return null
      }
      const questionnaire: GQLQuestionnaireQuestion[] = []

      if (questionnaireResponse.item && questionnaireResponse.item.length) {
        questionnaireResponse.item.forEach((item) => {
          if (item.answer && item.answer[0]) {
            questionnaire.push({
              fieldId: item.text,
              value: item.answer[0].valueString
            })
          }
        })
        return questionnaire
      } else {
        return null
      }
    },
    async medicalPractitioner(record: Saved<Bundle>) {
      const encounter = getEncounterFromRecord(record, DEATH_ENCOUNTER_CODE)

      const encounterParticipant =
        encounter && encounter.participant && encounter.participant[0]
      if (!encounterParticipant) {
        return null
      }
      return encounterParticipant
    },
    async history(record: Saved<Bundle>) {
      return record.entry
        .map(({ resource }) => resource)
        .filter(isTaskOrTaskHistory)
        .sort(
          (a, b) =>
            new Date(b.lastModified).valueOf() -
            new Date(a.lastModified).valueOf()
        )
    }
  },
  BirthRegistration: {
    id(record: Saved<Bundle>) {
      const composition = getComposition(record)
      return composition.id
    },
    async _fhirIDMap(record: Saved<Bundle>) {
      const composition = getComposition(record)

      const recordResources = record.entry.map((x) => x.resource)

      const encounter = getEncounterFromRecord(record, BIRTH_ENCOUNTER_CODE)

      const encounterReference = `Encounter/${encounter.id}`

      const questionnaireResponses = recordResources
        .filter(isQuestionnaireResponse)
        .filter(
          (response) => response.subject?.reference === encounterReference
        )

      const observation: Record<string, string> = {}

      const observations = recordResources
        .filter(isObservation)
        .filter(
          (observation) => observation.context?.reference === encounterReference
        )

      if (observations) {
        const observationKeys = {
          weightAtBirth: BODY_WEIGHT_CODE,
          birthType: BIRTH_TYPE_CODE,
          attendantAtBirth: BIRTH_ATTENDANT_CODE,
          childrenBornAliveToMother: NUMBER_BORN_ALIVE_CODE,
          foetalDeathsToMother: NUMBER_FOEATAL_DEATH_CODE,
          lastPreviousLiveBirth: LAST_LIVE_BIRTH_CODE
        }
        observations.map((item) => {
          if (item.code.coding?.[0]?.code) {
            const itemCode = item.code.coding[0].code
            const observationKey = Object.keys(observationKeys).find(
              (key: keyof typeof observationKeys) =>
                observationKeys[key] === itemCode
            )
            if (observationKey) {
              observation[observationKey] = item.id
            }
          }
        })
      }

      return {
        composition: composition.id,
        encounter: encounterReference.split('/')[1],
        eventLocation: urlReferenceToID(
          encounter.location[0].location.reference
        ),
        observation,
        questionnaireResponse: questionnaireResponses[0]?.id
      }
    },
    createdAt(record: Saved<Bundle>) {
      const composition = getComposition(record)
      return composition.date
    },
    mother: findPatient(MOTHER_CODE),
    father: findPatient(FATHER_CODE),
    child: findPatient(CHILD_CODE),
    informant: findRelatedPerson(INFORMANT_CODE),
    async registration(record: Saved<Bundle>) {
      return getTaskFromBundle(record)
    },
    async weightAtBirth(record: Saved<Bundle>) {
      return findObservationByCode(record, BODY_WEIGHT_CODE)?.valueQuantity
        ?.value
    },
    async attendantAtBirth(record: Saved<Bundle>) {
      return findObservationByCode(record, BIRTH_ATTENDANT_CODE)?.valueString
    },
    async childrenBornAliveToMother(record: Saved<Bundle>) {
      return findObservationByCode(record, BIRTH_ATTENDANT_CODE)?.valueInteger
    },
    async foetalDeathsToMother(record: Saved<Bundle>) {
      return findObservationByCode(record, NUMBER_FOEATAL_DEATH_CODE)
        ?.valueInteger
    },
    async lastPreviousLiveBirth(record: Saved<Bundle>) {
      return findObservationByCode(record, LAST_LIVE_BIRTH_CODE)?.valueDateTime
    },
    async birthType(record: Saved<Bundle>) {
      return findObservationByCode(record, BIRTH_TYPE_CODE)?.valueQuantity
        ?.value
    },
    async questionnaire(record: Saved<Bundle>) {
      const recordResources = record.entry.map((x) => x.resource)

      const encounter = getEncounterFromRecord(record, BIRTH_ENCOUNTER_CODE)

      const questionnaireResponses = recordResources
        .filter(isQuestionnaireResponse)
        .filter(
          (response) =>
            response.subject?.reference === `Encounter/${encounter.id}`
        )

      const questionnaireResponse = questionnaireResponses[0]

      if (!questionnaireResponse) {
        return null
      }
      const questionnaire: GQLQuestionnaireQuestion[] = []

      if (questionnaireResponse.item && questionnaireResponse.item.length) {
        questionnaireResponse.item.forEach((item) => {
          if (item.answer && item.answer[0]) {
            questionnaire.push({
              fieldId: item.text,
              value: item.answer[0].valueString
            })
          }
        })
        return questionnaire
      } else {
        return null
      }
    },
    async eventLocation(record: Saved<Bundle>) {
      const encounter = getEncounterFromRecord(record, BIRTH_ENCOUNTER_CODE)

      return getResourceFromBundleById(
        record,
        urlReferenceToID(encounter.location[0].location.reference)
      )
    },
    async history(record: Saved<Bundle>) {
      return record.entry
        .map(({ resource }) => resource)
        .filter(isTaskOrTaskHistory)
        .sort(
          (a, b) =>
            new Date(b.lastModified).valueOf() -
            new Date(a.lastModified).valueOf()
        )
    }
  },
  MarriageRegistration: {
    id(record: Saved<Bundle>) {
      const composition = getComposition(record)
      return composition.id
    },
    async _fhirIDMap(record: Saved<Bundle>) {
      const composition = getComposition(record)
      const encounter = getEncounterFromRecord(record, MARRIAGE_ENCOUNTER_CODE)

      const encounterReference = `Encounter/${encounter.id}`
      const recordResources = record.entry.map((x) => x.resource)

      const questionnaireResponses = recordResources
        .filter(isQuestionnaireResponse)
        .filter(
          (response) => response.subject?.reference === encounterReference
        )

      const observation: Record<string, string> = {}

      const observations = recordResources
        .filter(isSavedObservation)
        .filter(
          (observation) => observation.context?.reference === encounterReference
        )

      if (observations) {
        const observationKeys = {
          typeOfMarriage: MARRIAGE_TYPE_CODE
        }
        observations.map((item) => {
          if (item.code.coding?.[0]?.code) {
            const itemCode = item.code.coding[0].code
            const observationKey = Object.keys(observationKeys).find(
              (key: keyof typeof observationKeys) =>
                observationKeys[key] === itemCode
            )
            if (observationKey) {
              observation[observationKey] = item.id
            }
          }
        })
      }

      return {
        composition: composition.id,
        encounter: encounterReference.split('/')[1],
        eventLocation: urlReferenceToID(
          encounter.location[0].location.reference
        ),
        observation,
        questionnaireResponse: questionnaireResponses[0]?.id
      }
    },
    createdAt(record: Saved<Bundle>) {
      const composition = getComposition(record)
      return composition.date
    },
    informant: findRelatedPerson(INFORMANT_CODE),
    bride: findPatient(BRIDE_CODE),
    groom: findPatient(GROOM_CODE),
    witnessOne: findRelatedPerson(WITNESS_ONE_CODE),
    witnessTwo: findRelatedPerson(WITNESS_TWO_CODE),

    async registration(record: Saved<Bundle>) {
      return getTaskFromBundle(record)
    },
    async questionnaire(record: Saved<Bundle>) {
      const recordResources = record.entry.map((x) => x.resource)

      const encounter = getEncounterFromRecord(record, MARRIAGE_ENCOUNTER_CODE)

      const questionnaireResponses = recordResources
        .filter(isQuestionnaireResponse)
        .filter(
          (response) =>
            response.subject?.reference === `Encounter/${encounter.id}`
        )

      const questionnaireResponse = questionnaireResponses[0]

      if (!questionnaireResponse) {
        return null
      }
      const questionnaire: GQLQuestionnaireQuestion[] = []

      if (questionnaireResponse.item && questionnaireResponse.item.length) {
        questionnaireResponse.item.forEach((item) => {
          if (item.answer && item.answer[0]) {
            questionnaire.push({
              fieldId: item.text,
              value: item.answer[0].valueString
            })
          }
        })
        return questionnaire
      } else {
        return null
      }
    },
    async typeOfMarriage(record: Saved<Bundle>) {
      return findObservationByCode(record, MARRIAGE_TYPE_CODE)?.valueQuantity
        ?.value
    },
    async eventLocation(record: Saved<Bundle>) {
      const encounter = getEncounterFromRecord(record, MARRIAGE_ENCOUNTER_CODE)

      return getResourceFromBundleById(
        record,
        urlReferenceToID(encounter.location[0].location.reference)
      )
    },
    async history(record: Saved<Bundle>) {
      return record.entry
        .map(({ resource }) => resource)
        .filter(isTaskOrTaskHistory)
        .sort(
          (a, b) =>
            new Date(b.lastModified).valueOf() -
            new Date(a.lastModified).valueOf()
        )
    }
  }
}
