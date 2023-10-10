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
  findCompositionSection,
  findExtension,
  fetchFHIR,
  getTimeLoggedFromMetrics,
  getStatusFromTask,
  ITimeLoggedResponse,
  getCertificatesFromTask,
  getActionFromTask,
  fetchTaskByCompositionIdFromHearth
} from '@gateway/features/fhir/utils'
import {
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE,
  ATTACHMENT_DOCS_CODE,
  BIRTH_ENCOUNTER_CODE,
  BODY_WEIGHT_CODE,
  BIRTH_TYPE_CODE,
  BIRTH_ATTENDANT_CODE,
  LAST_LIVE_BIRTH_CODE,
  NUMBER_BORN_ALIVE_CODE,
  NUMBER_FOEATAL_DEATH_CODE,
  DECEASED_CODE,
  INFORMANT_CODE,
  DEATH_ENCOUNTER_CODE,
  MANNER_OF_DEATH_CODE,
  CAUSE_OF_DEATH_CODE,
  CAUSE_OF_DEATH_METHOD_CODE,
  SPOUSE_CODE,
  MALE_DEPENDENTS_ON_DECEASED_CODE,
  FEMALE_DEPENDENTS_ON_DECEASED_CODE,
  DEATH_DESCRIPTION_CODE,
  CAUSE_OF_DEATH_ESTABLISHED_CODE,
  MARRIAGE_ENCOUNTER_CODE,
  MARRIAGE_TYPE_CODE,
  BRIDE_CODE,
  GROOM_CODE,
  WITNESS_ONE_CODE,
  WITNESS_TWO_CODE
} from '@gateway/features/fhir/templates'
import {
  GQLQuestionnaireQuestion,
  GQLRegStatus,
  GQLResolver
} from '@gateway/graphql/schema'
import {
  ORIGINAL_FILE_NAME_SYSTEM,
  SYSTEM_FILE_NAME_SYSTEM,
  FHIR_SPECIFICATION_URL,
  OPENCRVS_SPECIFICATION_URL,
  REQUESTING_INDIVIDUAL,
  HAS_SHOWED_VERIFIED_DOCUMENT,
  DUPLICATE_TRACKING_ID,
  FLAGGED_AS_POTENTIAL_DUPLICATE,
  NO_SUPPORTING_DOCUMENTATION_REQUIRED,
  PAYMENT_DETAILS,
  REQUESTING_INDIVIDUAL_OTHER
} from '@gateway/features/fhir/constants'
import { SignatureExtensionPostfix } from '@gateway/features/registration/fhir-builders'
import fetch from 'node-fetch'
import { USER_MANAGEMENT_URL } from '@gateway/constants'
import * as validateUUID from 'uuid-validate'
import {
  getSignatureExtension,
  IUserModelData
} from '@gateway/features/user/type-resolvers'
import { getUser } from '@gateway/features/user/utils'
import {
  getPatientResource,
  getPresignedUrlFromUri
} from '@gateway/features/registration/utils'
import {
  Bundle,
  BundleEntry,
  Coding,
  Composition,
  DocumentReference,
  Extension,
  Identifier,
  Location,
  Observation,
  Practitioner,
  PractitionerRole,
  QuestionnaireResponse,
  Reference,
  RelatedPerson,
  Task
} from '@opencrvs/commons/types'

export const typeResolvers: GQLResolver = {
  EventRegistration: {
    __resolveType(obj) {
      if (
        obj.type.coding[0].code === 'birth-declaration' ||
        obj.type.coding[0].code === 'birth-notification'
      ) {
        return 'BirthRegistration'
      } else if (
        obj.type.coding[0].code === 'death-declaration' ||
        obj.type.coding[0].code === 'death-notification'
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
    dateOfMarriage: (person) => {
      const marriageExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/date-of-marriage`,
        person.extension
      )
      return (marriageExtension && marriageExtension.valueDateTime) || null
    },
    age: (person) => {
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
    maritalStatus: (person) => {
      return person && person.maritalStatus && person.maritalStatus.text
    },
    occupation: (person) => {
      const occupationExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/patient-occupation`,
        person.extension
      )
      return (occupationExtension && occupationExtension.valueString) || null
    },
    reasonNotApplying: (person) => {
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
    ageOfIndividualInYears: (person) => {
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
    exactDateOfBirthUnknown: (person) => {
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
    detailsExist: (person) => {
      return person.active
    },
    multipleBirth: (person) => {
      return person.multipleBirthInteger
    },
    deceased: (person) => {
      return person
    },
    nationality: (person) => {
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
    educationalAttainment: (person) => {
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
    _fhirIDPatient: async (
      relatedPerson,
      _,
      { headers: authHeader, dataSources }
    ) => {
      const person = await getPatientResource(
        relatedPerson,
        authHeader,
        dataSources
      )
      return person && person.id
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
    name: async (relatedPerson, _, { headers: authHeader, dataSources }) => {
      const person = await getPatientResource(
        relatedPerson,
        authHeader,
        dataSources
      )
      return (person && person.name) || null
    },
    dateOfMarriage: async (
      relatedPerson,
      _,
      { headers: authHeader, dataSources }
    ) => {
      const person = await getPatientResource(
        relatedPerson,
        authHeader,
        dataSources
      )
      const marriageExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/date-of-marriage`,
        person?.extension || []
      )
      return (marriageExtension && marriageExtension.valueDateTime) || null
    },
    age: async (relatedPerson, _, { headers: authHeader, dataSources }) => {
      const person = await getPatientResource(
        relatedPerson,
        authHeader,
        dataSources
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
    birthDate: async (
      relatedPerson,
      _,
      { headers: authHeader, dataSources }
    ) => {
      const person = await getPatientResource(
        relatedPerson,
        authHeader,
        dataSources
      )
      return (person && person.birthDate) || null
    },
    identifier: async (
      relatedPerson,
      _,
      { headers: authHeader, dataSources }
    ) => {
      const person = await getPatientResource(
        relatedPerson,
        authHeader,
        dataSources
      )
      return (person && person.identifier) || null
    },
    maritalStatus: async (
      relatedPerson,
      _,
      { headers: authHeader, dataSources }
    ) => {
      const person = await getPatientResource(
        relatedPerson,
        authHeader,
        dataSources
      )
      return person && person.maritalStatus && person.maritalStatus.text
    },
    occupation: async (
      relatedPerson,
      _,
      { headers: authHeader, dataSources }
    ) => {
      const person = await getPatientResource(
        relatedPerson,
        authHeader,
        dataSources
      )
      const occupationExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/patient-occupation`,
        person?.extension || []
      )
      return (occupationExtension && occupationExtension.valueString) || null
    },
    reasonNotApplying: async (
      relatedPerson,
      _,
      { headers: authHeader, dataSources }
    ) => {
      const person = await getPatientResource(
        relatedPerson,
        authHeader,
        dataSources
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
    ageOfIndividualInYears: async (
      relatedPerson,
      _,
      { headers: authHeader, dataSources }
    ) => {
      const person = await getPatientResource(
        relatedPerson,
        authHeader,
        dataSources
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
    exactDateOfBirthUnknown: async (
      relatedPerson,
      _,
      { headers: authHeader, dataSources }
    ) => {
      const person = await getPatientResource(
        relatedPerson,
        authHeader,
        dataSources
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
    detailsExist: async (
      relatedPerson,
      _,
      { headers: authHeader, dataSources }
    ) => {
      const person = await getPatientResource(
        relatedPerson,
        authHeader,
        dataSources
      )
      return person?.active
    },
    multipleBirth: async (
      relatedPerson,
      _,
      { headers: authHeader, dataSources }
    ) => {
      const person = await getPatientResource(
        relatedPerson,
        authHeader,
        dataSources
      )
      return person?.multipleBirthInteger
    },
    deceased: async (
      relatedPerson,
      _,
      { headers: authHeader, dataSources }
    ) => {
      const person = await getPatientResource(
        relatedPerson,
        authHeader,
        dataSources
      )
      return person
    },
    nationality: async (
      relatedPerson,
      _,
      { headers: authHeader, dataSources }
    ) => {
      const person = await getPatientResource(
        relatedPerson,
        authHeader,
        dataSources
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
    educationalAttainment: async (
      relatedPerson,
      _,
      { headers: authHeader, dataSources }
    ) => {
      const person = await getPatientResource(
        relatedPerson,
        authHeader,
        dataSources
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
    address: async (relatedPerson, _, { headers: authHeader, dataSources }) => {
      const person = await getPatientResource(
        relatedPerson,
        authHeader,
        dataSources
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
    async attachments(task: Task, _, { headers: authHeader }) {
      if (!task.focus) {
        throw new Error(
          'Task resource does not have a focus property necessary to lookup the composition'
        )
      }

      const composition = await fetchFHIR(
        `/${task.focus.reference}`,
        authHeader
      )
      const docSection = findCompositionSection(
        ATTACHMENT_DOCS_CODE,
        composition
      )
      if (!docSection || !docSection.entry) {
        return null
      }
      const docRefReferences = docSection.entry.map(
        (docRefEntry: Reference) => docRefEntry.reference
      )
      return docRefReferences.map(async (docRefReference: string) => {
        return await fetchFHIR(`/${docRefReference}`, authHeader)
      })
    },
    async informantType(task: Task, _, { headers: authHeader }) {
      if (!task.focus) {
        return null
      }
      const composition = await fetchFHIR(
        `/${task.focus.reference}`,
        authHeader
      )
      const patientSection = findCompositionSection(INFORMANT_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      const relatedPerson: RelatedPerson = await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
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
    async otherInformantType(task: Task, _, { headers: authHeader }) {
      if (!task.focus) {
        return null
      }
      const composition = await fetchFHIR(
        `/${task.focus.reference}`,
        authHeader
      )
      const patientSection = findCompositionSection(INFORMANT_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      const relatedPerson: RelatedPerson = await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
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
    status: async (task: Task, _, { headers: authHeader }) => {
      // fetch full task history
      const taskBundle: Bundle<Task> = await fetchFHIR(
        `/Task/${task.id}/_history`,
        authHeader
      )
      return (
        taskBundle.entry &&
        taskBundle.entry.map((taskEntry, i) => {
          const historicalTask = taskEntry.resource
          // all these tasks will have the same id, make it more specific to keep apollo-client's cache happy
          if (historicalTask && historicalTask.meta) {
            historicalTask.id = `${historicalTask.id}/_history/${historicalTask.meta.versionId}`
          }
          return historicalTask
        })
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
    duplicates: async (task, _, { headers: authHeader }) => {
      if (!task.focus) {
        throw new Error(
          'Task resource does not have a focus property necessary to lookup the composition'
        )
      }

      const composition = await fetchFHIR<Composition>(
        `/${task.focus.reference}`,
        authHeader
      )
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
    assignment: async (task, _, { headers: authHeader }) => {
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
          const user = await getUser({ practitionerId }, authHeader)
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
    user: async (task, _, { headers: authHeader }) => {
      const user = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastUser`,
        task.extension
      )
      if (!user || !user.valueReference || !user.valueReference.reference) {
        return null
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}getUser`, {
        method: 'POST',
        body: JSON.stringify({
          practitionerId: user.valueReference.reference.split('/')[1]
        }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      return await res.json()
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
    user: async (comment, _, { headers: authHeader }) => {
      if (!comment.authorString) {
        return null
      }
      const res = await fetch(`${USER_MANAGEMENT_URL}getUser`, {
        method: 'POST',
        body: JSON.stringify({
          practitionerId: comment.authorString.split('/')[1]
        }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      return await res.json()
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
    async collector(docRef: DocumentReference, _, { headers: authHeader }) {
      const relatedPersonRef =
        docRef.extension &&
        findExtension(
          `${OPENCRVS_SPECIFICATION_URL}extension/collector`,
          docRef.extension
        )
      if (!relatedPersonRef) {
        return null
      }
      return (await fetchFHIR(
        `/${
          relatedPersonRef.valueReference &&
          relatedPersonRef.valueReference.reference
        }`,
        authHeader
      )) as RelatedPerson
    },
    async hasShowedVerifiedDocument(
      docRef: DocumentReference,
      _,
      { headers: authHeader }
    ) {
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
    name: async (encounterParticipant, _, { headers: authHeader }) => {
      if (
        !encounterParticipant ||
        !encounterParticipant.individual ||
        !encounterParticipant.individual.reference
      ) {
        return null
      }
      const practitioner = await fetchFHIR(
        `/${encounterParticipant.individual.reference}`,
        authHeader
      )
      return (
        (practitioner &&
          practitioner.name &&
          practitioner.name[0] &&
          practitioner.name[0].family) ||
        null
      )
    },
    qualification: async (encounterParticipant, _, { headers: authHeader }) => {
      if (
        !encounterParticipant ||
        !encounterParticipant.individual ||
        !encounterParticipant.individual.reference
      ) {
        return null
      }
      const practitioner = await fetchFHIR(
        `/${encounterParticipant.individual.reference}`,
        authHeader
      )
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
    documents: async (task: Task, _, { dataSources, headers: authHeader }) => {
      const encounter: Reference = (task as any).encounter
      if (!encounter) {
        return []
      }
      return dataSources.documentsAPI.findBySubject(
        encounter.reference as `${string}/${string}`
      )
    },
    payment: async (task: Task, _, { dataSources, headers: authHeader }) => {
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
      const paymentReconciliation = await dataSources.paymentsAPI.getPayment(
        paymentId
      )

      const documentReference = await dataSources.documentsAPI.findBySubject(
        paymentReference
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
                authHeader
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
    ipAddress: (task) => {
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
    user: async (task: Task, _: any, { dataSources, headers: authHeader }) => {
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
      const practitionerRoleHistoryBundle: Bundle & {
        entry: PractitionerRole[]
      } = await dataSources.practitionerRoleAPI.getPractionerRoleHistory(
        practitionerRoleId
      )
      const result = practitionerRoleHistoryBundle.entry.find(
        (it: BundleEntry) =>
          it.resource?.meta?.lastUpdated &&
          task.lastModified &&
          it.resource?.meta?.lastUpdated <= task.lastModified!
      )?.resource as PractitionerRole | undefined

      const targetCode = result?.code?.find((element) => {
        return element.coding?.[0].system === 'http://opencrvs.org/specs/types'
      })

      const role = targetCode?.coding?.[0].code

      const res = await fetch(`${USER_MANAGEMENT_URL}getUser`, {
        method: 'POST',
        body: JSON.stringify({
          practitionerId: user.valueReference.reference.split('/')[1]
        }),
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      })
      const userResponse: IUserModelData = await res.json()
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
    signature: async (task: Task, _: any, { headers: authHeader }) => {
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

      const practitionerId = user.valueReference.reference.split('/')[1]
      const practitioner: Practitioner = await fetchFHIR(
        `/Practitioner/${practitionerId}`,
        authHeader
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
    async _fhirIDMap(composition: Composition, _, { headers: authHeader }) {
      // Preparing Encounter
      const encounterSection = findCompositionSection(
        DEATH_ENCOUNTER_CODE,
        composition
      )

      const encounterReference =
        encounterSection &&
        encounterSection.entry &&
        encounterSection.entry[0].reference

      if (!encounterReference) {
        return {
          composition: composition.id
        }
      }

      const questionnaireResponse = await fetchFHIR(
        `/QuestionnaireResponse?subject=${encounterReference}`,
        authHeader
      )

      const observation: Record<string, string> = {}
      const observations = await fetchFHIR<Bundle<Observation>>(
        `/Observation?encounter=${encounterReference}`,
        authHeader
      )

      const encounter = await fetchFHIR(`/${encounterReference}`, authHeader)

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
        observations.entry.map((item) => {
          if (item.resource?.code.coding?.[0]?.code) {
            const itemCode = item.resource.code.coding[0].code
            const observationKey = Object.keys(observationKeys).find(
              (key: keyof typeof observationKeys) =>
                observationKeys[key] === itemCode
            )
            if (observationKey) {
              observation[observationKey] = item.resource.id
            }
          }
        })
      }

      return {
        composition: composition.id,
        encounter: encounterReference.split('/')[1],
        eventLocation:
          encounter.location &&
          encounter.location[0].location.reference.split('/')[1],
        observation,
        questionnaireResponse: questionnaireResponse?.entry?.[0]?.resource?.id
      }
    },
    createdAt(composition: Composition) {
      return composition.date
    },
    async mother(composition: Composition, _, { headers: authHeader }) {
      const patientSection = findCompositionSection(MOTHER_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )
    },
    async father(composition: Composition, _, { headers: authHeader }) {
      const patientSection = findCompositionSection(FATHER_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )
    },
    async spouse(composition: Composition, _, { headers: authHeader }) {
      const patientSection = findCompositionSection(SPOUSE_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )
    },
    async deceased(composition: Composition, _, { headers: authHeader }) {
      const patientSection = findCompositionSection(DECEASED_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )
    },
    async informant(composition: Composition, _, { headers: authHeader }) {
      const patientSection = findCompositionSection(INFORMANT_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return (await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )) as RelatedPerson
    },
    async registration(composition: Composition, _, { headers: authHeader }) {
      const taskBundle = await fetchFHIR(
        `/Task?focus=Composition/${composition.id}`,
        authHeader
      )

      if (!taskBundle.entry[0] || !taskBundle.entry[0].resource) {
        return null
      }
      return taskBundle.entry[0].resource
    },

    async eventLocation(composition: Composition, _, { headers: authHeader }) {
      const encounterSection = findCompositionSection(
        DEATH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const data = await fetchFHIR(
        `/${encounterSection.entry[0].reference}`,
        authHeader
      )

      if (!data || !data.location || !data.location[0].location) {
        return null
      }

      return await fetchFHIR(
        `/${data.location[0].location.reference}`,
        authHeader
      )
    },
    async deathDescription(
      composition: Composition,
      _,
      { headers: authHeader }
    ) {
      const encounterSection = findCompositionSection(
        DEATH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${DEATH_DESCRIPTION_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueString) ||
        null
      )
    },
    async mannerOfDeath(composition: Composition, _, { headers: authHeader }) {
      const encounterSection = findCompositionSection(
        DEATH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${MANNER_OF_DEATH_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueCodeableConcept &&
          observations.entry[0].resource.valueCodeableConcept.coding &&
          observations.entry[0].resource.valueCodeableConcept.coding[0] &&
          observations.entry[0].resource.valueCodeableConcept.coding[0].code) ||
        null
      )
    },
    async causeOfDeathEstablished(
      composition: Composition,
      _,
      { headers: authHeader }
    ) {
      const encounterSection = findCompositionSection(
        DEATH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${CAUSE_OF_DEATH_ESTABLISHED_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueCodeableConcept &&
          observations.entry[0].resource.valueCodeableConcept.coding &&
          observations.entry[0].resource.valueCodeableConcept.coding[0] &&
          observations.entry[0].resource.valueCodeableConcept.coding[0].code) ||
        null
      )
    },
    async causeOfDeathMethod(
      composition: Composition,
      _,
      { headers: authHeader }
    ) {
      const encounterSection = findCompositionSection(
        DEATH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${CAUSE_OF_DEATH_METHOD_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueCodeableConcept &&
          observations.entry[0].resource.valueCodeableConcept.coding &&
          observations.entry[0].resource.valueCodeableConcept.coding[0] &&
          observations.entry[0].resource.valueCodeableConcept.coding[0].code) ||
        null
      )
    },
    async causeOfDeath(composition: Composition, _, { headers: authHeader }) {
      const encounterSection = findCompositionSection(
        DEATH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${CAUSE_OF_DEATH_CODE}`,
        authHeader
      )

      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueCodeableConcept &&
          observations.entry[0].resource.valueCodeableConcept.coding &&
          observations.entry[0].resource.valueCodeableConcept.coding[0] &&
          observations.entry[0].resource.valueCodeableConcept.coding[0].code) ||
        null
      )
    },
    async maleDependentsOfDeceased(
      composition: Composition,
      _,
      { headers: authHeader }
    ) {
      const encounterSection = findCompositionSection(
        DEATH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${MALE_DEPENDENTS_ON_DECEASED_CODE}`,
        authHeader
      )
      return observations &&
        observations.entry &&
        observations.entry[0] &&
        observations.entry[0].resource
        ? observations.entry[0].resource.valueString
        : null
    },
    async femaleDependentsOfDeceased(
      composition: Composition,
      _,
      { headers: authHeader }
    ) {
      const encounterSection = findCompositionSection(
        DEATH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${FEMALE_DEPENDENTS_ON_DECEASED_CODE}`,
        authHeader
      )

      return observations &&
        observations.entry &&
        observations.entry[0] &&
        observations.entry[0].resource
        ? observations.entry[0].resource.valueString
        : null
    },
    async questionnaire(composition: Composition, _, { headers: authHeader }) {
      const encounterSection = findCompositionSection(
        DEATH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const response = await fetchFHIR(
        `/QuestionnaireResponse?subject=${encounterSection.entry[0].reference}`,
        authHeader
      )
      let questionnaireResponse: QuestionnaireResponse | null = null

      if (
        response &&
        response.entry &&
        response.entry[0] &&
        response.entry[0].resource
      ) {
        questionnaireResponse = response.entry[0].resource
      }

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
    async medicalPractitioner(
      composition: Composition,
      _,
      { headers: authHeader }
    ) {
      const encounterSection = findCompositionSection(
        DEATH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const encounter = await fetchFHIR(
        `/${encounterSection.entry[0].reference}`,
        authHeader
      )
      const encounterParticipant =
        encounter && encounter.participant && encounter.participant[0]
      if (!encounterParticipant) {
        return null
      }
      return encounterParticipant
    },
    async history(composition: Composition, _: any, { headers: authHeader }) {
      const task = await fetchFHIR(
        `/Task/?focus=Composition/${composition.id}`,
        authHeader
      )

      const taskId = task.entry[0].resource.id

      const taskHistory = await fetchFHIR(
        `/Task/${taskId}/_history?_count=100`,
        authHeader
      )

      if (!taskHistory.entry[0] || !taskHistory.entry[0].resource) {
        return null
      }

      return taskHistory?.entry?.map(
        (item: { resource: { extension: any }; extension: Extension[] }) => {
          return item.resource
        }
      )
    }
  },
  BirthRegistration: {
    async _fhirIDMap(composition: Composition, _, { headers: authHeader }) {
      // Preparing Encounter
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )

      const encounterReference =
        encounterSection &&
        encounterSection.entry &&
        encounterSection.entry[0].reference

      if (!encounterReference) {
        return {
          composition: composition.id
        }
      }

      const questionnaireResponse = await fetchFHIR(
        `/QuestionnaireResponse?subject=${encounterReference}`,
        authHeader
      )

      const observation: Record<string, string> = {}
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterReference}`,
        authHeader
      )

      const encounter = await fetchFHIR(`/${encounterReference}`, authHeader)

      if (observations) {
        const observationKeys = {
          weightAtBirth: BODY_WEIGHT_CODE,
          birthType: BIRTH_TYPE_CODE,
          attendantAtBirth: BIRTH_ATTENDANT_CODE,
          childrenBornAliveToMother: NUMBER_BORN_ALIVE_CODE,
          foetalDeathsToMother: NUMBER_FOEATAL_DEATH_CODE,
          lastPreviousLiveBirth: LAST_LIVE_BIRTH_CODE
        }
        observations.entry.map(
          (item: BundleEntry & { resource?: Observation }) => {
            if (item.resource?.code.coding?.[0]?.code) {
              const itemCode = item.resource.code.coding[0].code
              const observationKey = Object.keys(observationKeys).find(
                (key: keyof typeof observationKeys) =>
                  observationKeys[key] === itemCode
              )
              if (observationKey) {
                observation[observationKey] = item.resource.id
              }
            }
          }
        )
      }

      return {
        composition: composition.id,
        encounter: encounterReference.split('/')[1],
        eventLocation:
          encounter.location &&
          encounter.location[0].location.reference.split('/')[1],
        observation,
        questionnaireResponse: questionnaireResponse?.entry?.[0]?.resource?.id
      }
    },
    createdAt(composition: Composition) {
      return composition.date
    },
    async mother(composition: Composition, _, { headers: authHeader }) {
      const patientSection = findCompositionSection(MOTHER_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )
    },
    async father(composition: Composition, _, { headers: authHeader }) {
      const patientSection = findCompositionSection(FATHER_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )
    },
    async child(composition: Composition, _, { headers: authHeader }) {
      const patientSection = findCompositionSection(CHILD_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )
    },
    async informant(composition: Composition, _, { headers: authHeader }) {
      const patientSection = findCompositionSection(INFORMANT_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return (await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )) as RelatedPerson
    },
    async registration(composition: Composition, _, { headers: authHeader }) {
      const taskBundle = await fetchFHIR(
        `/Task?focus=Composition/${composition.id}`,
        authHeader
      )

      if (!taskBundle.entry[0] || !taskBundle.entry[0].resource) {
        return null
      }
      return taskBundle.entry[0].resource
    },
    async weightAtBirth(composition: Composition, _, { headers: authHeader }) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${BODY_WEIGHT_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource &&
          observations.entry[0].resource.valueQuantity &&
          observations.entry[0].resource.valueQuantity.value) ||
        null
      )
    },

    async questionnaire(composition: Composition, _, { headers: authHeader }) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const response = await fetchFHIR(
        `/QuestionnaireResponse?subject=${encounterSection.entry[0].reference}`,
        authHeader
      )
      let questionnaireResponse: QuestionnaireResponse | null = null

      if (
        response &&
        response.entry &&
        response.entry[0] &&
        response.entry[0].resource
      ) {
        questionnaireResponse = response.entry[0].resource
      }

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
    async birthType(composition: Composition, _, { headers: authHeader }) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${BIRTH_TYPE_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueQuantity.value) ||
        null
      )
    },
    async eventLocation(composition: Composition, _, { headers: authHeader }) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const data = await fetchFHIR(
        `/${encounterSection.entry[0].reference}`,
        authHeader
      )

      if (!data || !data.location || !data.location[0].location) {
        return null
      }

      return await fetchFHIR(
        `/${data.location[0].location.reference}`,
        authHeader
      )
    },
    async attendantAtBirth(
      composition: Composition,
      _,
      { headers: authHeader }
    ) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${BIRTH_ATTENDANT_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueString) ||
        null
      )
    },
    async childrenBornAliveToMother(
      composition: Composition,
      _,
      { headers: authHeader }
    ) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${NUMBER_BORN_ALIVE_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueInteger) ||
        null
      )
    },
    async foetalDeathsToMother(
      composition: Composition,
      _,
      { headers: authHeader }
    ) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${NUMBER_FOEATAL_DEATH_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueInteger) ||
        null
      )
    },
    async lastPreviousLiveBirth(
      composition: Composition,
      _,
      { headers: authHeader }
    ) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${LAST_LIVE_BIRTH_CODE}`,
        authHeader
      )
      return (
        (observations &&
          observations.entry &&
          observations.entry[0] &&
          observations.entry[0].resource.valueDateTime) ||
        null
      )
    },
    async history(composition: Composition, _: any, { headers: authHeader }) {
      const task = await fetchFHIR(
        `/Task/?focus=Composition/${composition.id}`,
        authHeader
      )

      const taskId = task.entry[0].resource.id

      const taskHistory = await fetchFHIR(
        `/Task/${taskId}/_history?_count=100`,
        authHeader
      )

      if (!taskHistory.entry[0] || !taskHistory.entry[0].resource) {
        return null
      }

      return taskHistory?.entry?.map(
        (item: { resource: { extension: any }; extension: Extension[] }) => {
          return item.resource
        }
      )
    }
  },
  MarriageRegistration: {
    async _fhirIDMap(composition: Composition, _, { headers: authHeader }) {
      // Preparing Encounter
      const encounterSection = findCompositionSection(
        MARRIAGE_ENCOUNTER_CODE,
        composition
      )

      const encounterReference =
        encounterSection &&
        encounterSection.entry &&
        encounterSection.entry[0].reference

      if (!encounterReference) {
        return {
          composition: composition.id
        }
      }

      const questionnaireResponse = await fetchFHIR(
        `/QuestionnaireResponse?subject=${encounterReference}`,
        authHeader
      )

      const observation: Record<string, string> = {}
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterReference}`,
        authHeader
      )

      const encounter = await fetchFHIR(`/${encounterReference}`, authHeader)

      if (observations) {
        const observationKeys = {
          typeOfMarriage: MARRIAGE_TYPE_CODE
        }
        observations.entry.map(
          (item: BundleEntry & { resource?: Observation }) => {
            if (item.resource?.code.coding?.[0]?.code) {
              const itemCode = item.resource.code.coding[0].code
              const observationKey = Object.keys(observationKeys).find(
                (key: keyof typeof observationKeys) =>
                  observationKeys[key] === itemCode
              )
              if (observationKey) {
                observation[observationKey] = item.resource.id
              }
            }
          }
        )
      }

      return {
        composition: composition.id,
        encounter: encounterReference.split('/')[1],
        eventLocation:
          encounter.location &&
          encounter.location[0].location.reference.split('/')[1],
        observation,
        questionnaireResponse: questionnaireResponse?.entry?.[0]?.resource?.id
      }
    },
    createdAt(composition: Composition) {
      return composition.date
    },
    async informant(composition: Composition, _, { headers: authHeader }) {
      const relatedPersonSection = findCompositionSection(
        INFORMANT_CODE,
        composition
      )
      if (!relatedPersonSection || !relatedPersonSection.entry) {
        return null
      }
      return (await fetchFHIR(
        `/${relatedPersonSection.entry[0].reference}`,
        authHeader
      )) as RelatedPerson
    },
    async bride(composition: Composition, _, { headers: authHeader }) {
      const patientSection = findCompositionSection(BRIDE_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )
    },
    async groom(composition: Composition, _, { headers: authHeader }) {
      const patientSection = findCompositionSection(GROOM_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      return await fetchFHIR(
        `/${patientSection.entry[0].reference}`,
        authHeader
      )
    },
    async witnessOne(composition: Composition, _, { headers: authHeader }) {
      const relatedPersonSection = findCompositionSection(
        WITNESS_ONE_CODE,
        composition
      )
      if (!relatedPersonSection || !relatedPersonSection.entry) {
        return null
      }
      return (await fetchFHIR(
        `/${relatedPersonSection.entry[0].reference}`,
        authHeader
      )) as RelatedPerson
    },
    async witnessTwo(composition: Composition, _, { headers: authHeader }) {
      const relatedPersonSection = findCompositionSection(
        WITNESS_TWO_CODE,
        composition
      )
      if (!relatedPersonSection || !relatedPersonSection.entry) {
        return null
      }
      const relatedPerson = (await fetchFHIR(
        `/${relatedPersonSection.entry[0].reference}`,
        authHeader
      )) as RelatedPerson
      return relatedPerson
    },
    async registration(composition: Composition, _, { headers: authHeader }) {
      const taskBundle = await fetchFHIR(
        `/Task?focus=Composition/${composition.id}`,
        authHeader
      )

      if (!taskBundle.entry[0] || !taskBundle.entry[0].resource) {
        return null
      }
      return taskBundle.entry[0].resource
    },
    async questionnaire(composition: Composition, _, { headers: authHeader }) {
      const encounterSection = findCompositionSection(
        MARRIAGE_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const response = await fetchFHIR(
        `/QuestionnaireResponse?subject=${encounterSection.entry[0].reference}`,
        authHeader
      )
      let questionnaireResponse: QuestionnaireResponse | null = null

      if (
        response &&
        response.entry &&
        response.entry[0] &&
        response.entry[0].resource
      ) {
        questionnaireResponse = response.entry[0].resource
      }

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
    async typeOfMarriage(composition: Composition, _, { headers: authHeader }) {
      const encounterSection = findCompositionSection(
        MARRIAGE_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const observations = await fetchFHIR(
        `/Observation?encounter=${encounterSection.entry[0].reference}&code=${MARRIAGE_TYPE_CODE}`,
        authHeader
      )
      return observations?.entry?.[0]?.resource?.valueQuantity?.value || null
    },
    async eventLocation(composition: Composition, _, { headers: authHeader }) {
      const encounterSection = findCompositionSection(
        MARRIAGE_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const data = await fetchFHIR(
        `/${encounterSection.entry[0].reference}`,
        authHeader
      )

      if (!data || !data.location || !data.location[0].location) {
        return null
      }

      return await fetchFHIR(
        `/${data.location[0].location.reference}`,
        authHeader
      )
    },
    async history(composition: Composition, _: any, { headers: authHeader }) {
      const task = await fetchFHIR(
        `/Task/?focus=Composition/${composition.id}`,
        authHeader
      )
      const taskId = task.entry[0].resource.id
      const taskHistory = await fetchFHIR(
        `/Task/${taskId}/_history?_count=100`,
        authHeader
      )

      if (!taskHistory.entry[0] || !taskHistory.entry[0].resource) {
        return null
      }

      return taskHistory?.entry?.map(
        (item: { resource: { extension: any }; extension: Extension[] }) => {
          return item.resource
        }
      )
    }
  }
}
