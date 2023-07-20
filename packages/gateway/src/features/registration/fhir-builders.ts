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
import transformObj, { IFieldBuilders } from '@gateway/features/transformation'
import { v4 as uuid } from 'uuid'
import {
  ATTACHMENT_CONTEXT_KEY,
  ATTACHMENT_DOCS_CODE,
  ATTACHMENT_DOCS_TITLE,
  BIRTH_ATTENDANT_CODE,
  BIRTH_CORRECTION_ENCOUNTER_CODE,
  BIRTH_ENCOUNTER_CODE,
  BIRTH_TYPE_CODE,
  BODY_WEIGHT_CODE,
  CAUSE_OF_DEATH_CODE,
  CAUSE_OF_DEATH_ESTABLISHED_CODE,
  CAUSE_OF_DEATH_METHOD_CODE,
  CHILD_CODE,
  CHILD_TITLE,
  createCompositionTemplate,
  DEATH_CORRECTION_ENCOUNTER_CODE,
  DEATH_DESCRIPTION_CODE,
  DEATH_ENCOUNTER_CODE,
  DECEASED_CODE,
  DECEASED_TITLE,
  FATHER_CODE,
  FATHER_TITLE,
  FEMALE_DEPENDENTS_ON_DECEASED_CODE,
  INFORMANT_CODE,
  INFORMANT_TITLE,
  LAST_LIVE_BIRTH_CODE,
  MALE_DEPENDENTS_ON_DECEASED_CODE,
  MANNER_OF_DEATH_CODE,
  MOTHER_CODE,
  MOTHER_TITLE,
  NUMBER_BORN_ALIVE_CODE,
  NUMBER_FOEATAL_DEATH_CODE,
  OBSERVATION_CATEGORY_PROCEDURE_CODE,
  OBSERVATION_CATEGORY_PROCEDURE_DESC,
  OBSERVATION_CATEGORY_VSIGN_CODE,
  OBSERVATION_CATEGORY_VSIGN_DESC,
  SPOUSE_CODE,
  SPOUSE_TITLE,
  MARRIAGE_ENCOUNTER_CODE,
  MARRIAGE_TYPE_CODE,
  BRIDE_CODE,
  BRIDE_TITLE,
  GROOM_CODE,
  GROOM_TITLE,
  WITNESS_ONE_CODE,
  WITNESS_ONE_TITLE,
  WITNESS_TWO_CODE,
  WITNESS_TWO_TITLE,
  MARRIAGE_CORRECTION_ENCOUNTER_CODE,
  updateTaskTemplate
} from '@gateway/features/fhir/templates'
import {
  findBirthDuplicates,
  findDeathDuplicates,
  getMaritalStatusCode,
  isBase64FileString,
  postAssignmentSearch,
  selectOrCreateCertificateDocRefResource,
  selectOrCreateCollectorPersonResource,
  selectOrCreateDocRefResource,
  selectOrCreateEncounterLocationRef,
  selectOrCreateEncounterParticipant,
  selectOrCreateEncounterPartitioner,
  selectOrCreateEncounterResource,
  selectOrCreateInformantResource,
  selectOrCreateInformantSection,
  selectOrCreateLocationRefResource,
  selectOrCreateObservationResource,
  selectOrCreatePaymentReconciliationResource,
  selectOrCreatePersonResource,
  selectOrCreateQuestionnaireResource,
  selectOrCreateRelatedPersonResource,
  selectOrCreateTaskRefResource,
  setCertificateCollectorReference,
  setInformantReference,
  setObjectPropInResourceArray,
  setQuestionnaireItem,
  selectOrCreateWitnessResource,
  uploadBase64ToMinio
} from '@gateway/features/fhir/utils'
import {
  EVENT_TYPE,
  FHIR_SPECIFICATION_URL,
  HAS_SHOWED_VERIFIED_DOCUMENT,
  OPENCRVS_SPECIFICATION_URL,
  REQUEST_CORRECTION_OTHER_REASON_EXTENSION_URL
} from '@gateway/features/fhir/constants'
import { IAuthHeader } from '@gateway/common-types'
import { getTokenPayload } from '@gateway/features/user/utils'
import {
  GQLBirthRegistrationInput,
  GQLDeathRegistrationInput,
  GQLMarriageRegistrationInput
} from '@gateway/graphql/schema'

export enum SignatureExtensionPostfix {
  INFORMANT = 'informants-signature',
  GROOM = 'groom-signature',
  BRIDE = 'bride-signature',
  WITNESS_ONE = 'witness-one-signature',
  WITNESS_TWO = 'witness-two-signature'
}

function createNameBuilder(sectionCode: string, sectionTitle: string) {
  return {
    use: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(person, 'name', fieldValue, 'use', context)
    },
    firstNames: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'name',
        fieldValue.split(' '),
        'given',
        context
      )
    },
    familyName: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'name',
        [fieldValue],
        'family',
        context
      )
    },
    marriedLastName: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'name',
        [fieldValue],
        'suffix',
        context
      )
    }
  }
}
function createIDBuilder(sectionCode: string, sectionTitle: string) {
  return {
    id: async (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: { authHeader: IAuthHeader }
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'identifier',
        fieldValue,
        'value',
        context
      )
    },
    type: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'identifier',
        fieldValue,
        'type',
        context
      )
    },
    otherType: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'identifier',
        fieldValue,
        'otherType',
        context
      )
    },
    fieldsModifiedByIdentity: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'identifier',
        fieldValue.split(','),
        'fieldsModifiedByIdentity',
        context
      )
    }
  }
}

function createTelecomBuilder(sectionCode: string, sectionTitle: string) {
  return {
    system: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'telecom',
        fieldValue,
        'system',
        context
      )
    },
    value: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'telecom',
        fieldValue,
        'value',
        context
      )
    },
    use: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'telecom',
        fieldValue,
        'use',
        context
      )
    }
  }
}

function createPhotoBuilder(sectionCode: string, sectionTitle: string) {
  return {
    contentType: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'photo',
        fieldValue,
        'contentType',
        context
      )
    },
    data: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(person, 'photo', fieldValue, 'data', context)
    },
    title: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'photo',
        fieldValue,
        'title',
        context
      )
    }
  }
}

function createAddressBuilder(sectionCode: string, sectionTitle: string) {
  return {
    use: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'use',
        context
      )
    },
    type: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'type',
        context
      )
    },
    text: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'text',
        context
      )
    },
    line: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      if (!person.address) {
        person.address = []
      }
      if (!person.address[context._index.address]) {
        person.address[context._index.address] = {}
      }
      if (!person.address[context._index.address].line) {
        person.address[context._index.address].line = []
      }
      ;(person.address[context._index.address].line as string[]).push(
        fieldValue
      )
    },
    city: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'city',
        context
      )
    },
    district: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'district',
        context
      )
    },
    state: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'state',
        context
      )
    },
    postalCode: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'postalCode',
        context
      )
    },
    country: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'address',
        fieldValue,
        'country',
        context
      )
    }
  }
}

function createLocationAddressBuilder(sectionCode: string) {
  return {
    use: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )

      if (!location.address) {
        location.address = {}
      }
      location.address.use = fieldValue
    },
    type: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )
      if (!location.address) {
        location.address = {}
      }
      location.address.type = fieldValue
    },
    text: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )
      if (!location.address) {
        location.address = {}
      }
      location.address.text = fieldValue
    },
    line: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )
      if (!location.address) {
        location.address = {}
      }
      if (!location.address.line) {
        location.address.line = []
      }
      ;(location.address.line as string[]).push(fieldValue)
    },
    city: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )

      if (!location.address) {
        location.address = {}
      }
      location.address.city = fieldValue
    },
    district: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )

      if (!location.address) {
        location.address = {}
      }
      location.address.district = fieldValue
    },
    state: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )

      if (!location.address) {
        location.address = {}
      }
      location.address.state = fieldValue
    },
    postalCode: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )

      if (!location.address) {
        location.address = {}
      }
      location.address.postalCode = fieldValue
    },
    country: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )

      if (!location.address) {
        location.address = {}
      }
      location.address.country = fieldValue
    }
  }
}

function createDateOfMarriageBuilder(
  resource: fhir.Patient,
  fieldValue: string
) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/date-of-marriage`,
    valueDateTime: fieldValue
  })
}

function createAgeBuilder(resource: fhir.Patient, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/age`,
    valueString: fieldValue
  })
}

function createNationalityBuilder(resource: fhir.Patient, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }

  resource.extension.push({
    url: `${FHIR_SPECIFICATION_URL}patient-nationality`,
    extension: [
      {
        url: 'code',
        valueCodeableConcept: {
          coding: [{ system: 'urn:iso:std:iso:3166', code: fieldValue }]
        }
      },
      {
        url: 'period',
        valuePeriod: {
          start: '',
          end: ''
        }
      }
    ]
  })
}

function createMaritalStatusBuilder(
  resource: fhir.Patient,
  fieldValue: string
) {
  resource.maritalStatus = {
    coding: [
      {
        system: `${FHIR_SPECIFICATION_URL}marital-status`,
        code: getMaritalStatusCode(fieldValue)
      }
    ],
    text: fieldValue
  }
}

function createOccupationBulder(resource: fhir.Patient, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }

  const hasOccupation = resource.extension.find(
    (extention) =>
      extention.url ===
      `${OPENCRVS_SPECIFICATION_URL}extension/patient-occupation`
  )

  if (hasOccupation) {
    hasOccupation.valueString = fieldValue
  } else {
    resource.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/patient-occupation`,
      valueString: fieldValue
    })
  }
}

function createReasonNotApplyingBuilder(
  resource: fhir.Patient,
  fieldValue: string
) {
  if (!resource.extension) {
    resource.extension = []
  }

  const hasReasonNotApplying = resource.extension.find(
    (extention) =>
      extention.url ===
      `${OPENCRVS_SPECIFICATION_URL}extension/reason-not-applying`
  )

  if (hasReasonNotApplying) {
    hasReasonNotApplying.valueString = fieldValue
  } else {
    resource.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/reason-not-applying`,
      valueString: fieldValue
    })
  }
}

function createAgeOfIndividualInYearsBuilder(
  resource: fhir.Patient,
  fieldValue: string
) {
  if (!resource.extension) {
    resource.extension = []
  }

  const hasAgeOfIndividualInYears = resource.extension.find(
    (extention) =>
      extention.url ===
      `${OPENCRVS_SPECIFICATION_URL}extension/age-of-individual-in-years`
  )

  if (hasAgeOfIndividualInYears) {
    hasAgeOfIndividualInYears.valueString = fieldValue
  } else {
    resource.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/age-of-individual-in-years`,
      valueString: fieldValue
    })
  }

  // for storing an assumed birthdate when exact DOB is not known
  const birthYear =
    new Date().getFullYear() - parseInt(fieldValue.toString(), 10)
  const firstDayOfBirthYear = new Date(birthYear, 0, 1)
  resource.birthDate = `${firstDayOfBirthYear.getFullYear()}-${String(
    firstDayOfBirthYear.getMonth() + 1
  ).padStart(2, '0')}-${String(firstDayOfBirthYear.getDate()).padStart(2, '0')}`
}

function createEducationalAttainmentBuilder(
  resource: fhir.Patient,
  fieldValue: string
) {
  if (!resource.extension) {
    resource.extension = []
  }

  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/educational-attainment`,
    valueString: fieldValue
  })
}

function createInformantShareContact(resource: fhir.Task, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/contact-person`,
    valueString: fieldValue
  })
}

function createInformantRelationship(resource: fhir.Task, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/contact-relationship`,
    valueString: fieldValue
  })
}

function createInformantsSignature(
  resource: fhir.Task,
  fieldValue: string,
  extensionPostfix: string
) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/${extensionPostfix}`,
    valueString: fieldValue
  })
}

function createInformantShareContactNumber(
  resource: fhir.Task,
  fieldValue: string
) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/contact-person-phone-number`,
    valueString: fieldValue
  })
}

function createInformantShareEmail(resource: fhir.Task, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/contact-person-email`,
    valueString: fieldValue
  })
}

function createInCompleteFieldListExt(resource: fhir.Task, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/in-complete-fields`,
    valueString: fieldValue
  })
}

function setResourceIdentifier(
  resource: fhir.Task,
  identifierName: string,
  fieldValue: string
) {
  if (!resource.identifier) {
    resource.identifier = []
  }
  resource.identifier.push({
    system: `${OPENCRVS_SPECIFICATION_URL}id/${identifierName}`,
    value: fieldValue
  })
}

function createRegStatusComment(
  resource: fhir.Task,
  fieldValue: string,
  context: any
) {
  if (!resource.note) {
    resource.note = []
  }
  if (!resource.note[context._index.comments]) {
    resource.note[context._index.comments] = { text: '' }
  }
  resource.note[context._index.comments].text = fieldValue
}

function createRegStatusCommentTimeStamp(
  resource: fhir.Task,
  fieldValue: string,
  context: any
) {
  if (!resource.note) {
    resource.note = []
  }
  if (!resource.note[context._index.comments]) {
    resource.note[context._index.comments] = {
      /* as text is a mendatory field for note */
      text: ''
    }
  }
  resource.note[context._index.comments].time = fieldValue
}

function createQuestionnaireBuilder() {
  return {
    fieldId: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const questionnaire = selectOrCreateQuestionnaireResource(
        context.event === EVENT_TYPE.BIRTH
          ? BIRTH_ENCOUNTER_CODE
          : context.event === EVENT_TYPE.DEATH
          ? DEATH_ENCOUNTER_CODE
          : MARRIAGE_ENCOUNTER_CODE,
        fhirBundle,
        context
      )
      setQuestionnaireItem(questionnaire, context, fieldValue, null)
    },
    value: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const questionnaire = selectOrCreateQuestionnaireResource(
        context.event === EVENT_TYPE.BIRTH
          ? BIRTH_ENCOUNTER_CODE
          : context.event === EVENT_TYPE.DEATH
          ? DEATH_ENCOUNTER_CODE
          : MARRIAGE_ENCOUNTER_CODE,
        fhirBundle,
        context
      )
      setQuestionnaireItem(questionnaire, context, null, fieldValue)
    }
  }
}

function createActionTypesBuilder() {
  const actionType = {
    coding: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/action-type',
        code: 'update'
      }
    ]
  }
  return {
    section: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const task = selectOrCreateTaskRefResource(fhirBundle, context)
      setObjectPropInResourceArray(
        task,
        'input',
        fieldValue,
        'valueCode',
        context,
        'values'
      )
      setObjectPropInResourceArray(
        task,
        'output',
        fieldValue,
        'valueCode',
        context,
        'values'
      )
    },
    fieldName: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const task = selectOrCreateTaskRefResource(fhirBundle, context)
      setObjectPropInResourceArray(
        task,
        'input',
        fieldValue,
        'valueId',
        context,
        'values'
      )
      setObjectPropInResourceArray(
        task,
        'output',
        fieldValue,
        'valueId',
        context,
        'values'
      )
    },
    oldValue: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const task = selectOrCreateTaskRefResource(fhirBundle, context)
      setObjectPropInResourceArray(
        task,
        'input',
        actionType,
        'type',
        context,
        'values'
      )
      setObjectPropInResourceArray(
        task,
        'input',
        fieldValue,
        'valueString',
        context,
        'values'
      )
    },
    newValue: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const task = selectOrCreateTaskRefResource(fhirBundle, context)
      setObjectPropInResourceArray(
        task,
        'output',
        actionType,
        'type',
        context,
        'values'
      )
      setObjectPropInResourceArray(
        task,
        'output',
        fieldValue,
        'valueString',
        context,
        'values'
      )
    }
  }
}

export const builders: IFieldBuilders = {
  _fhirIDMap: {
    composition: (fhirBundle, fieldValue) => {
      fhirBundle.entry[0].resource.id = fieldValue as string
    },
    encounter: (fhirBundle, fieldValue, context) => {
      const encounter = selectOrCreateEncounterResource(fhirBundle, context)
      encounter.id = fieldValue as string
    },
    eventLocation: (fhirBundle, fieldValue) => {
      return false
    },
    observation: {
      maleDependentsOfDeceased: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          DEATH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_DESC,
          MALE_DEPENDENTS_ON_DECEASED_CODE,
          'Number of male dependents on Deceased',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      femaleDependentsOfDeceased: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          DEATH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_DESC,
          FEMALE_DEPENDENTS_ON_DECEASED_CODE,
          'Number of female dependents on Deceased',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      mannerOfDeath: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          DEATH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_VSIGN_CODE,
          OBSERVATION_CATEGORY_VSIGN_DESC,
          MANNER_OF_DEATH_CODE,
          'Uncertified manner of death',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      deathDescription: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          DEATH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_VSIGN_CODE,
          OBSERVATION_CATEGORY_VSIGN_DESC,
          DEATH_DESCRIPTION_CODE,
          'Lay reported or verbal autopsy description',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      causeOfDeathEstablished: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          DEATH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_VSIGN_CODE,
          OBSERVATION_CATEGORY_VSIGN_DESC,
          CAUSE_OF_DEATH_ESTABLISHED_CODE,
          'Cause of death established',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      causeOfDeathMethod: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          DEATH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_VSIGN_CODE,
          OBSERVATION_CATEGORY_VSIGN_DESC,
          CAUSE_OF_DEATH_METHOD_CODE,
          'Cause of death method',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      causeOfDeath: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          DEATH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_VSIGN_CODE,
          OBSERVATION_CATEGORY_VSIGN_DESC,
          CAUSE_OF_DEATH_CODE,
          'Cause of death',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      birthType: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          BIRTH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_DESC,
          BIRTH_TYPE_CODE,
          'Birth plurality of Pregnancy',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      typeOfMarriage: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          MARRIAGE_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_DESC,
          MARRIAGE_TYPE_CODE,
          'Types of marriage partnerships',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      weightAtBirth: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          BIRTH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_VSIGN_CODE,
          OBSERVATION_CATEGORY_VSIGN_DESC,
          BODY_WEIGHT_CODE,
          'Body weight Measured',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      attendantAtBirth: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          BIRTH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_CODE,
          OBSERVATION_CATEGORY_PROCEDURE_DESC,
          BIRTH_ATTENDANT_CODE,
          'Birth attendant title',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      childrenBornAliveToMother: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          BIRTH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_VSIGN_CODE,
          OBSERVATION_CATEGORY_VSIGN_DESC,
          NUMBER_BORN_ALIVE_CODE,
          'Number born alive to mother',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      foetalDeathsToMother: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          BIRTH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_VSIGN_CODE,
          OBSERVATION_CATEGORY_VSIGN_DESC,
          NUMBER_FOEATAL_DEATH_CODE,
          'Number foetal deaths to mother',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      },
      lastPreviousLiveBirth: (fhirBundle, fieldValue, context) => {
        const observation = selectOrCreateObservationResource(
          BIRTH_ENCOUNTER_CODE,
          OBSERVATION_CATEGORY_VSIGN_CODE,
          OBSERVATION_CATEGORY_VSIGN_DESC,
          LAST_LIVE_BIRTH_CODE,
          'Date last live birth',
          fhirBundle,
          context
        )
        observation.id = fieldValue as string
      }
    },
    questionnaireResponse: (fhirBundle, fieldValue: string, context) => {
      const questionnaireResponse = selectOrCreateQuestionnaireResource(
        context.event === EVENT_TYPE.BIRTH
          ? BIRTH_ENCOUNTER_CODE
          : context.event === EVENT_TYPE.DEATH
          ? DEATH_ENCOUNTER_CODE
          : MARRIAGE_ENCOUNTER_CODE,
        fhirBundle,
        context
      )
      questionnaireResponse.id = fieldValue
    }
  },
  createdAt: (fhirBundle, fieldValue, context) => {
    if (!fhirBundle.meta) {
      fhirBundle.meta = {}
    }
    fhirBundle.meta.lastUpdated = fieldValue
    fhirBundle.entry[0].resource.date = fieldValue

    const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
    taskResource.lastModified = fieldValue as string
    return
  },
  mother: {
    _fhirID: (fhirBundle, fieldValue) => {
      const mother = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      mother.id = fieldValue as string
    },
    gender: (fhirBundle, fieldValue, context) => {
      const mother = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      mother.gender = fieldValue as string
    },
    identifier: createIDBuilder(MOTHER_CODE, MOTHER_TITLE),
    name: createNameBuilder(MOTHER_CODE, MOTHER_TITLE),
    telecom: createTelecomBuilder(MOTHER_CODE, MOTHER_TITLE),
    birthDate: (fhirBundle, fieldValue, context) => {
      const mother = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      mother.birthDate = fieldValue as string
    },
    maritalStatus: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      return createMaritalStatusBuilder(person, fieldValue as string)
    },
    occupation: (fhirBundle, fieldValue) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      return createOccupationBulder(person, fieldValue as string)
    },
    detailsExist: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      person.active = fieldValue as boolean
    },
    reasonNotApplying: (fhirBundle, fieldValue) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      return createReasonNotApplyingBuilder(person, fieldValue as string)
    },
    ageOfIndividualInYears: (fhirBundle, fieldValue) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      return createAgeOfIndividualInYearsBuilder(person, fieldValue as string)
    },
    multipleBirth: (fhirBundle, fieldValue, context) => {
      const mother = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      mother.multipleBirthInteger = fieldValue as number
    },
    address: createAddressBuilder(MOTHER_CODE, MOTHER_TITLE),
    photo: createPhotoBuilder(MOTHER_CODE, MOTHER_TITLE),
    deceased: (fhirBundle, fieldValue, context) => {
      const mother = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      mother.deceasedBoolean = fieldValue as boolean
    },
    nationality: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      return createEducationalAttainmentBuilder(person, fieldValue)
    }
  },
  father: {
    _fhirID: (fhirBundle, fieldValue, context) => {
      const father = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      father.id = fieldValue as string
    },
    gender: (fhirBundle, fieldValue, context) => {
      const father = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      father.gender = fieldValue as string
    },
    identifier: createIDBuilder(FATHER_CODE, FATHER_TITLE),
    name: createNameBuilder(FATHER_CODE, FATHER_TITLE),
    telecom: createTelecomBuilder(FATHER_CODE, FATHER_TITLE),
    birthDate: (fhirBundle, fieldValue, context) => {
      const father = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      father.birthDate = fieldValue as string
    },
    maritalStatus: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      return createMaritalStatusBuilder(person, fieldValue as string)
    },
    occupation: (fhirBundle, fieldValue) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      return createOccupationBulder(person, fieldValue as string)
    },
    detailsExist: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      person.active = fieldValue as boolean
    },
    reasonNotApplying: (fhirBundle, fieldValue) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      return createReasonNotApplyingBuilder(person, fieldValue as string)
    },
    ageOfIndividualInYears: (fhirBundle, fieldValue) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      return createAgeOfIndividualInYearsBuilder(person, fieldValue as string)
    },
    multipleBirth: (fhirBundle, fieldValue, context) => {
      const father = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      father.multipleBirthInteger = fieldValue as number
    },
    address: createAddressBuilder(FATHER_CODE, FATHER_TITLE),
    photo: createPhotoBuilder(FATHER_CODE, FATHER_TITLE),
    deceased: (fhirBundle, fieldValue, context) => {
      const father = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      father.deceasedBoolean = fieldValue as boolean
    },

    nationality: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      return createEducationalAttainmentBuilder(person, fieldValue)
    }
  },
  spouse: {
    _fhirID: (fhirBundle, fieldValue, context) => {
      const spouse = selectOrCreatePersonResource(
        SPOUSE_CODE,
        SPOUSE_TITLE,
        fhirBundle
      )
      spouse.id = fieldValue as string
    },
    name: createNameBuilder(SPOUSE_CODE, SPOUSE_TITLE)
  },
  child: {
    _fhirID: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      child.id = fieldValue as string
    },
    gender: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      child.gender = fieldValue as string
    },
    identifier: createIDBuilder(CHILD_CODE, CHILD_TITLE),
    name: createNameBuilder(CHILD_CODE, CHILD_TITLE),
    telecom: createTelecomBuilder(CHILD_CODE, CHILD_TITLE),
    birthDate: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      child.birthDate = fieldValue as string
    },
    maritalStatus: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      return createMaritalStatusBuilder(person, fieldValue as string)
    },
    multipleBirth: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      child.multipleBirthInteger = fieldValue as number
    },
    address: createAddressBuilder(CHILD_CODE, CHILD_TITLE),
    photo: createPhotoBuilder(CHILD_CODE, CHILD_TITLE),
    deceased: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      child.deceasedBoolean = fieldValue as boolean
    },

    nationality: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      return createEducationalAttainmentBuilder(person, fieldValue)
    }
  },
  deceased: {
    _fhirID: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      person.id = fieldValue as string
    },
    gender: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      person.gender = fieldValue as string
    },
    identifier: createIDBuilder(DECEASED_CODE, DECEASED_TITLE),
    name: createNameBuilder(DECEASED_CODE, DECEASED_TITLE),
    telecom: createTelecomBuilder(DECEASED_CODE, DECEASED_TITLE),
    birthDate: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      person.birthDate = fieldValue as string
    },
    age: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      return createAgeBuilder(person, fieldValue as string)
    },
    ageOfIndividualInYears: (fhirBundle, fieldValue) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      return createAgeOfIndividualInYearsBuilder(person, fieldValue as string)
    },
    maritalStatus: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      return createMaritalStatusBuilder(person, fieldValue as string)
    },
    occupation: (fhirBundle, fieldValue) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      return createOccupationBulder(person, fieldValue as string)
    },
    multipleBirth: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      person.multipleBirthInteger = fieldValue as number
    },
    address: createAddressBuilder(DECEASED_CODE, DECEASED_TITLE),
    photo: createPhotoBuilder(DECEASED_CODE, DECEASED_TITLE),
    deceased: {
      deceased: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreatePersonResource(
          DECEASED_CODE,
          DECEASED_TITLE,
          fhirBundle
        )
        person.deceasedBoolean = fieldValue as boolean
      },
      deathDate: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreatePersonResource(
          DECEASED_CODE,
          DECEASED_TITLE,
          fhirBundle
        )
        person.deceasedDateTime = fieldValue as string
      }
    },
    nationality: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      return createEducationalAttainmentBuilder(person, fieldValue)
    }
  },
  informant: {
    _fhirID: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const relatedPersonResource = selectOrCreateInformantSection(
        INFORMANT_CODE,
        INFORMANT_TITLE,
        fhirBundle
      )
      relatedPersonResource.id = fieldValue
    },
    _fhirIDPatient: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreateInformantResource(fhirBundle)
      person.id = fieldValue as string
    },
    gender: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreateInformantResource(fhirBundle)
      person.gender = fieldValue as string
    },
    ageOfIndividualInYears: (fhirBundle, fieldValue) => {
      const person = selectOrCreateInformantResource(fhirBundle)
      return createAgeOfIndividualInYearsBuilder(person, fieldValue as string)
    },
    identifier: {
      id: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'identifier',
          fieldValue,
          'value',
          context
        )
      },
      type: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'identifier',
          fieldValue,
          'type',
          context
        )
      },
      otherType: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'identifier',
          fieldValue,
          'otherType',
          context
        )
      },
      fieldsModifiedByIdentity: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'identifier',
          fieldValue.split(','),
          'fieldsModifiedByIdentity',
          context
        )
      }
    },
    name: {
      use: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(person, 'name', fieldValue, 'use', context)
      },
      firstNames: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'name',
          fieldValue.split(' '),
          'given',
          context
        )
      },
      familyName: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'name',
          [fieldValue],
          'family',
          context
        )
      }
    },
    telecom: {
      system: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'telecom',
          fieldValue,
          'system',
          context
        )
      },
      value: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'telecom',
          fieldValue,
          'value',
          context
        )
      },
      use: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'telecom',
          fieldValue,
          'use',
          context
        )
      }
    },
    birthDate: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreateInformantResource(fhirBundle)
      person.birthDate = fieldValue as string
    },
    maritalStatus: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreateInformantResource(fhirBundle)
      return createMaritalStatusBuilder(person, fieldValue as string)
    },
    multipleBirth: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreateInformantResource(fhirBundle)
      person.multipleBirthInteger = fieldValue as number
    },
    address: {
      use: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'address',
          fieldValue,
          'use',
          context
        )
      },
      type: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'address',
          fieldValue,
          'type',
          context
        )
      },
      text: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'address',
          fieldValue,
          'text',
          context
        )
      },
      line: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        if (!person.address) {
          person.address = []
        }
        if (!person.address[context._index.address]) {
          person.address[context._index.address] = {}
        }
        if (!person.address[context._index.address].line) {
          person.address[context._index.address].line = []
        }
        ;(person.address[context._index.address].line as string[]).push(
          fieldValue
        )
      },
      city: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'address',
          fieldValue,
          'city',
          context
        )
      },
      district: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'address',
          fieldValue,
          'district',
          context
        )
      },
      state: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'address',
          fieldValue,
          'state',
          context
        )
      },
      postalCode: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'address',
          fieldValue,
          'postalCode',
          context
        )
      },
      country: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'address',
          fieldValue,
          'country',
          context
        )
      }
    },
    photo: {
      contentType: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'photo',
          fieldValue,
          'contentType',
          context
        )
      },
      data: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'photo',
          fieldValue,
          'data',
          context
        )
      },
      title: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'photo',
          fieldValue,
          'title',
          context
        )
      }
    },
    nationality: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreateInformantResource(fhirBundle)
      return createNationalityBuilder(person, fieldValue)
    },
    occupation: (fhirBundle, fieldValue) => {
      const person = selectOrCreateInformantResource(fhirBundle)
      return createOccupationBulder(person, fieldValue as string)
    },
    dateOfMarriage: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreateInformantResource(fhirBundle)
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreateInformantResource(fhirBundle)
      return createEducationalAttainmentBuilder(person, fieldValue)
    }
  },
  bride: {
    _fhirID: (fhirBundle, fieldValue) => {
      const bride = selectOrCreatePersonResource(
        BRIDE_CODE,
        BRIDE_TITLE,
        fhirBundle
      )
      bride.id = fieldValue as string
    },
    identifier: createIDBuilder(BRIDE_CODE, BRIDE_TITLE),
    name: createNameBuilder(BRIDE_CODE, BRIDE_TITLE),
    telecom: createTelecomBuilder(BRIDE_CODE, BRIDE_TITLE),
    birthDate: (fhirBundle, fieldValue, context) => {
      const bride = selectOrCreatePersonResource(
        BRIDE_CODE,
        BRIDE_TITLE,
        fhirBundle
      )
      bride.birthDate = fieldValue as string
    },
    ageOfIndividualInYears: (fhirBundle, fieldValue) => {
      const person = selectOrCreatePersonResource(
        BRIDE_CODE,
        BRIDE_TITLE,
        fhirBundle
      )
      return createAgeOfIndividualInYearsBuilder(person, fieldValue as string)
    },
    address: createAddressBuilder(BRIDE_CODE, BRIDE_TITLE),
    photo: createPhotoBuilder(BRIDE_CODE, BRIDE_TITLE),
    nationality: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        BRIDE_CODE,
        BRIDE_TITLE,
        fhirBundle
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        BRIDE_CODE,
        BRIDE_TITLE,
        fhirBundle
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    }
  },
  groom: {
    _fhirID: (fhirBundle, fieldValue) => {
      const groom = selectOrCreatePersonResource(
        GROOM_CODE,
        GROOM_TITLE,
        fhirBundle
      )
      groom.id = fieldValue as string
    },
    identifier: createIDBuilder(GROOM_CODE, GROOM_TITLE),
    name: createNameBuilder(GROOM_CODE, GROOM_TITLE),
    telecom: createTelecomBuilder(GROOM_CODE, GROOM_TITLE),
    birthDate: (fhirBundle, fieldValue, context) => {
      const groom = selectOrCreatePersonResource(
        GROOM_CODE,
        GROOM_TITLE,
        fhirBundle
      )
      groom.birthDate = fieldValue as string
    },
    ageOfIndividualInYears: (fhirBundle, fieldValue) => {
      const person = selectOrCreatePersonResource(
        GROOM_CODE,
        GROOM_TITLE,
        fhirBundle
      )
      return createAgeOfIndividualInYearsBuilder(person, fieldValue as string)
    },
    address: createAddressBuilder(GROOM_CODE, GROOM_TITLE),
    photo: createPhotoBuilder(GROOM_CODE, GROOM_TITLE),
    nationality: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        GROOM_CODE,
        GROOM_TITLE,
        fhirBundle
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        GROOM_CODE,
        GROOM_TITLE,
        fhirBundle
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    }
  },
  witnessOne: {
    _fhirID: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const relatedPersonResource = selectOrCreateInformantSection(
        WITNESS_ONE_CODE,
        WITNESS_ONE_TITLE,
        fhirBundle
      )
      relatedPersonResource.id = fieldValue
    },
    _fhirIDPatient: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreateWitnessResource(
        fhirBundle,
        WITNESS_ONE_CODE,
        WITNESS_ONE_TITLE
      )
      person.id = fieldValue as string
    },
    name: {
      use: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
        const person = selectOrCreateWitnessResource(
          fhirBundle,
          WITNESS_ONE_CODE,
          WITNESS_ONE_TITLE
        )
        setObjectPropInResourceArray(person, 'name', fieldValue, 'use', context)
      },
      firstNames: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateWitnessResource(
          fhirBundle,
          WITNESS_ONE_CODE,
          WITNESS_ONE_TITLE
        )
        setObjectPropInResourceArray(
          person,
          'name',
          fieldValue.split(' '),
          'given',
          context
        )
      },
      familyName: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateWitnessResource(
          fhirBundle,
          WITNESS_ONE_CODE,
          WITNESS_ONE_TITLE
        )
        setObjectPropInResourceArray(
          person,
          'name',
          [fieldValue],
          'family',
          context
        )
      }
    },
    relationship: async (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const relatedPersonResource = selectOrCreateInformantSection(
        WITNESS_ONE_CODE,
        WITNESS_ONE_TITLE,
        fhirBundle
      )
      if (fieldValue !== 'OTHER') {
        relatedPersonResource.relationship = {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: fieldValue
            }
          ]
        }
      }
    },
    otherRelationship: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const relatedPersonResource = selectOrCreateInformantSection(
        WITNESS_ONE_CODE,
        WITNESS_ONE_TITLE,
        fhirBundle
      )
      if (!relatedPersonResource.relationship) {
        relatedPersonResource.relationship = {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'OTHER'
            }
          ]
        }
      }
      relatedPersonResource.relationship.text = fieldValue
    }
  },
  witnessTwo: {
    _fhirID: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const relatedPersonResource = selectOrCreateInformantSection(
        WITNESS_TWO_CODE,
        WITNESS_TWO_TITLE,
        fhirBundle
      )
      relatedPersonResource.id = fieldValue
    },
    _fhirIDPatient: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreateWitnessResource(
        fhirBundle,
        WITNESS_TWO_CODE,
        WITNESS_TWO_TITLE
      )
      person.id = fieldValue as string
    },
    name: {
      use: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
        const person = selectOrCreateWitnessResource(
          fhirBundle,
          WITNESS_TWO_CODE,
          WITNESS_TWO_TITLE
        )
        setObjectPropInResourceArray(person, 'name', fieldValue, 'use', context)
      },
      firstNames: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateWitnessResource(
          fhirBundle,
          WITNESS_TWO_CODE,
          WITNESS_TWO_TITLE
        )
        setObjectPropInResourceArray(
          person,
          'name',
          fieldValue.split(' '),
          'given',
          context
        )
      },
      familyName: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const person = selectOrCreateWitnessResource(
          fhirBundle,
          WITNESS_TWO_CODE,
          WITNESS_TWO_TITLE
        )
        setObjectPropInResourceArray(
          person,
          'name',
          [fieldValue],
          'family',
          context
        )
      }
    },
    relationship: async (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const relatedPersonResource = selectOrCreateInformantSection(
        WITNESS_TWO_CODE,
        WITNESS_TWO_TITLE,
        fhirBundle
      )
      if (fieldValue !== 'OTHER') {
        relatedPersonResource.relationship = {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: fieldValue
            }
          ]
        }
      }
    },
    otherRelationship: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const relatedPersonResource = selectOrCreateInformantSection(
        WITNESS_TWO_CODE,
        WITNESS_TWO_TITLE,
        fhirBundle
      )
      if (!relatedPersonResource.relationship) {
        relatedPersonResource.relationship = {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: 'OTHER'
            }
          ]
        }
      }
      relatedPersonResource.relationship.text = fieldValue
    }
  },
  registration: {
    _fhirID: (fhirBundle, fieldValue, context) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      taskResource.id = fieldValue as string
    },
    contact: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return createInformantShareContact(taskResource, fieldValue)
    },
    informantsSignature: async (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      if (isBase64FileString(fieldValue)) {
        const docUploadResponse = await uploadBase64ToMinio(
          fieldValue,
          context.authHeader
        )
        fieldValue = docUploadResponse
      }
      return createInformantsSignature(
        taskResource,
        fieldValue,
        SignatureExtensionPostfix.INFORMANT
      )
    },
    groomSignature: async (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      if (isBase64FileString(fieldValue)) {
        const docUploadResponse = await uploadBase64ToMinio(
          fieldValue,
          context.authHeader
        )
        fieldValue = docUploadResponse
      }
      return createInformantsSignature(
        taskResource,
        fieldValue,
        SignatureExtensionPostfix.GROOM
      )
    },
    brideSignature: async (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      if (isBase64FileString(fieldValue)) {
        const docUploadResponse = await uploadBase64ToMinio(
          fieldValue,
          context.authHeader
        )
        fieldValue = docUploadResponse
      }
      return createInformantsSignature(
        taskResource,
        fieldValue,
        SignatureExtensionPostfix.BRIDE
      )
    },
    witnessOneSignature: async (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      if (isBase64FileString(fieldValue)) {
        const docUploadResponse = await uploadBase64ToMinio(
          fieldValue,
          context.authHeader
        )
        fieldValue = docUploadResponse
      }
      return createInformantsSignature(
        taskResource,
        fieldValue,
        SignatureExtensionPostfix.WITNESS_ONE
      )
    },
    witnessTwoSignature: async (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      if (isBase64FileString(fieldValue)) {
        const docUploadResponse = await uploadBase64ToMinio(
          fieldValue,
          context.authHeader
        )
        fieldValue = docUploadResponse
      }
      return createInformantsSignature(
        taskResource,
        fieldValue,
        SignatureExtensionPostfix.WITNESS_TWO
      )
    },
    contactRelationship: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return createInformantRelationship(taskResource, fieldValue)
    },
    contactPhoneNumber: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return createInformantShareContactNumber(taskResource, fieldValue)
    },
    contactEmail: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return createInformantShareEmail(taskResource, fieldValue)
    },
    informantType: async (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const relatedPersonResource = selectOrCreateInformantSection(
        INFORMANT_CODE,
        INFORMANT_TITLE,
        fhirBundle
      )

      if (fieldValue !== 'OTHER') {
        relatedPersonResource.relationship = {
          coding: [
            {
              system:
                'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
              code: fieldValue
            }
          ]
        }
      }
      if (context.event === EVENT_TYPE.BIRTH) {
        if (fieldValue === 'MOTHER') {
          setInformantReference(
            MOTHER_CODE,
            MOTHER_TITLE,
            relatedPersonResource,
            fhirBundle,
            context
          )
        } else if (fieldValue === 'FATHER') {
          setInformantReference(
            FATHER_CODE,
            FATHER_TITLE,
            relatedPersonResource,
            fhirBundle,
            context
          )
        } else if (fieldValue === 'BRIDE') {
          setInformantReference(
            BRIDE_CODE,
            BRIDE_TITLE,
            relatedPersonResource,
            fhirBundle,
            context
          )
        } else if (fieldValue === 'GROOM') {
          setInformantReference(
            GROOM_CODE,
            GROOM_TITLE,
            relatedPersonResource,
            fhirBundle,
            context
          )
        }
      }
    },
    otherInformantType: async (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const relatedPersonResource = selectOrCreateInformantSection(
        INFORMANT_CODE,
        INFORMANT_TITLE,
        fhirBundle
      )
      if (
        fieldValue &&
        relatedPersonResource.relationship &&
        relatedPersonResource.relationship.coding &&
        relatedPersonResource.relationship.coding[0]
      ) {
        relatedPersonResource.relationship.coding[0].code = 'OTHER'
        relatedPersonResource.relationship.text = fieldValue
      } else if (fieldValue) {
        relatedPersonResource.relationship = {
          coding: [
            {
              system: `${OPENCRVS_SPECIFICATION_URL}extension/other-informant-value`,
              code: 'OTHER'
            }
          ],
          text: fieldValue
        }
      }
    },
    draftId: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return setResourceIdentifier(taskResource, 'draft-id', fieldValue)
    },
    trackingId: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      let trackingId
      if (context.event === EVENT_TYPE.BIRTH) {
        trackingId = 'birth-tracking-id'
      } else if (context.event === EVENT_TYPE.DEATH) {
        trackingId = 'death-tracking-id'
      } else if (context.event === EVENT_TYPE.MARRIAGE) {
        trackingId = 'marriage-tracking-id'
      }
      return setResourceIdentifier(taskResource, `${trackingId}`, fieldValue)
    },
    mosipAid: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return setResourceIdentifier(taskResource, 'mosip-aid', fieldValue)
    },
    registrationNumber: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      let regNumber
      if (context.event === EVENT_TYPE.BIRTH) {
        regNumber = 'birth-registration-number'
      } else if (context.event === EVENT_TYPE.DEATH) {
        regNumber = 'death-registration-number'
      } else if (context.event === EVENT_TYPE.MARRIAGE) {
        regNumber = 'marriage-registration-number'
      }
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return setResourceIdentifier(taskResource, `${regNumber}`, fieldValue)
    },
    inCompleteFields: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      taskResource.status = 'draft'
      return createInCompleteFieldListExt(taskResource, fieldValue)
    },
    paperFormID: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return setResourceIdentifier(taskResource, 'paper-form-id', fieldValue)
    },
    correction: {
      requester: async (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
        if (!taskResource.extension) {
          taskResource.extension = []
        }
        const requesterExtensionURL = `${OPENCRVS_SPECIFICATION_URL}extension/requestingIndividual`
        const requesterExtension = taskResource.extension.find(
          (ext) => ext.url === requesterExtensionURL
        )
        if (!requesterExtension) {
          taskResource.extension.push({
            url: requesterExtensionURL,
            valueString: fieldValue
          })
        } else {
          requesterExtension.valueString = fieldValue
        }
      },
      hasShowedVerifiedDocument: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const certDocResource = selectOrCreateCertificateDocRefResource(
          fhirBundle,
          context,
          context.event,
          true
        )
        const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
        if (!certDocResource.extension) {
          certDocResource.extension = []
        }
        if (!taskResource.extension) {
          taskResource.extension = []
        }

        const hasVerifiedExt = certDocResource.extension.find(
          (ext) => ext.url === HAS_SHOWED_VERIFIED_DOCUMENT
        )

        const hasVerifiedExtInTask = taskResource.extension.find(
          (ext) => ext.url === HAS_SHOWED_VERIFIED_DOCUMENT
        )

        //  pushing HAS_SHOWED_VERIFIED_DOCUMENT in DocReference
        if (!hasVerifiedExt) {
          certDocResource.extension.push({
            url: HAS_SHOWED_VERIFIED_DOCUMENT,
            valueString: fieldValue
          })
        } else {
          hasVerifiedExt.valueString = fieldValue
        }

        //  pushing HAS_SHOWED_VERIFIED_DOCUMENT in Task
        if (!hasVerifiedExtInTask) {
          taskResource.extension.push({
            url: HAS_SHOWED_VERIFIED_DOCUMENT,
            valueString: fieldValue
          })
        } else {
          hasVerifiedExtInTask.valueString = fieldValue
        }
      },
      attestedAndCopied: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const certDocResource = selectOrCreateCertificateDocRefResource(
          fhirBundle,
          context,
          context.event,
          true
        )
        if (!certDocResource.extension) {
          certDocResource.extension = []
        }
        const hasVerifiedExt = certDocResource.extension.find(
          (extention) =>
            extention.url ===
            `${OPENCRVS_SPECIFICATION_URL}extension/attestedAndCopied`
        )
        if (!hasVerifiedExt) {
          certDocResource.extension.push({
            url: `${OPENCRVS_SPECIFICATION_URL}extension/attestedAndCopied`,
            valueString: fieldValue
          })
        } else {
          hasVerifiedExt.valueString = fieldValue
        }
      },
      noSupportingDocumentationRequired: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const certDocResource = selectOrCreateCertificateDocRefResource(
          fhirBundle,
          context,
          context.event,
          true
        )
        if (!certDocResource.extension) {
          certDocResource.extension = []
        }
        const hasVerifiedExt = certDocResource.extension.find(
          (extention) =>
            extention.url ===
            `${OPENCRVS_SPECIFICATION_URL}extension/noSupportingDocumentationRequired`
        )
        if (!hasVerifiedExt) {
          certDocResource.extension.push({
            url: `${OPENCRVS_SPECIFICATION_URL}extension/noSupportingDocumentationRequired`,
            valueString: fieldValue
          })
        } else {
          hasVerifiedExt.valueString = fieldValue
        }
      },
      payments: {
        paymentId: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            context.event,
            true
          )
          if (!paymentResource.identifier) {
            paymentResource.identifier = []
          }
          paymentResource.identifier.push({
            system: `${OPENCRVS_SPECIFICATION_URL}id/payment-id`,
            value: fieldValue
          })
        },
        type: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            context.event,
            true
          )
          if (!paymentResource.detail) {
            paymentResource.detail = [
              {
                type: {
                  coding: [{ code: fieldValue }]
                }
              }
            ]
          } else {
            paymentResource.detail[0].type = {
              coding: [{ code: fieldValue }]
            }
          }
        },
        total: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            context.event,
            true
          )
          paymentResource.total = fieldValue as fhir.Money
        },
        amount: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            context.event,
            true
          )
          if (!paymentResource.detail) {
            paymentResource.detail = [
              {
                /* should be replaced when type value comes in */
                type: {
                  coding: [{ code: 'payment' }]
                },
                amount: fieldValue as fhir.Money
              }
            ]
          } else {
            paymentResource.detail[0].amount = fieldValue as fhir.Money
          }
        },
        outcome: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            context.event,
            true
          )
          paymentResource.outcome = {
            coding: [{ code: fieldValue }]
          }
        },
        date: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            context.event,
            true
          )
          if (!paymentResource.detail) {
            paymentResource.detail = [
              {
                /* should be replaced when type value comes in */
                type: {
                  coding: [{ code: 'payment' }]
                },
                date: fieldValue
              }
            ]
          } else {
            paymentResource.detail[0].date = fieldValue
          }
        },
        data: async (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const certDocResource = selectOrCreateCertificateDocRefResource(
            fhirBundle,
            context,
            context.event,
            true
          )
          if (!certDocResource.content) {
            certDocResource.content = []
          }
          if (isBase64FileString(fieldValue)) {
            const docUploadResponse = await uploadBase64ToMinio(
              fieldValue,
              context.authHeader
            )
            fieldValue = docUploadResponse
          }

          certDocResource.content.push({
            attachment: {
              contentType: 'image/jpg',
              data: fieldValue
            }
          })
        }
      },
      location: {
        _fhirID: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const taskResource = selectOrCreateTaskRefResource(
            fhirBundle,
            context
          )
          const encounterRef = selectOrCreateEncounterResource(
            fhirBundle,
            context,
            true
          )
          const encounterLocationRef = selectOrCreateEncounterLocationRef(
            fhirBundle,
            context,
            true
          )

          //@ts-ignore
          taskResource.encounter = encounterRef._id
          encounterLocationRef.reference = `Location/${fieldValue}`
        },
        type: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const location = selectOrCreateLocationRefResource(
            context.event === EVENT_TYPE.BIRTH
              ? BIRTH_CORRECTION_ENCOUNTER_CODE
              : context.event === EVENT_TYPE.DEATH
              ? DEATH_CORRECTION_ENCOUNTER_CODE
              : MARRIAGE_CORRECTION_ENCOUNTER_CODE,
            fhirBundle,
            context
          )
          location.type = {
            coding: [
              {
                system: `${OPENCRVS_SPECIFICATION_URL}location-type`,
                code: fieldValue
              }
            ]
          }
        },
        partOf: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const location = selectOrCreateLocationRefResource(
            context.event === EVENT_TYPE.BIRTH
              ? BIRTH_CORRECTION_ENCOUNTER_CODE
              : DEATH_CORRECTION_ENCOUNTER_CODE,
            fhirBundle,
            context
          )
          location.partOf = {
            reference: fieldValue
          }
        },
        address: (_, __, context: any) =>
          createLocationAddressBuilder(
            context.event === EVENT_TYPE.BIRTH
              ? BIRTH_CORRECTION_ENCOUNTER_CODE
              : DEATH_CORRECTION_ENCOUNTER_CODE
          )
      },
      values: createActionTypesBuilder(),
      data: async (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const certDocResource = selectOrCreateCertificateDocRefResource(
          fhirBundle,
          context,
          context.event,
          true
        )
        if (!certDocResource.content) {
          certDocResource.content = []
        }
        if (isBase64FileString(fieldValue)) {
          const docUploadResponse = await uploadBase64ToMinio(
            fieldValue,
            context.authHeader
          )
          fieldValue = docUploadResponse
        }

        certDocResource.content.push({
          attachment: {
            contentType: 'application/pdf',
            data: fieldValue
          }
        })
      },
      reason: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
        if (!taskResource.reason) {
          taskResource.reason = {}
        }
        taskResource.reason.text = fieldValue
      },
      otherReason: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
        if (!taskResource.reason) {
          taskResource.reason = {}
        }
        taskResource.reason.extension = [
          {
            url: REQUEST_CORRECTION_OTHER_REASON_EXTENSION_URL,
            valueString: fieldValue
          }
        ]
      },
      note: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)

        const newNote: fhir.Annotation = {
          text: fieldValue ? fieldValue : '',
          time: new Date().toUTCString(),
          authorString: ''
        }
        if (!taskResource.note) {
          taskResource.note = []
        }
        taskResource.note.push(newNote)
      }
    },
    status: {
      comments: {
        comment: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const taskResource = selectOrCreateTaskRefResource(
            fhirBundle,
            context
          )
          return createRegStatusComment(taskResource, fieldValue, context)
        },
        createdAt: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const taskResource = selectOrCreateTaskRefResource(
            fhirBundle,
            context
          )
          return createRegStatusCommentTimeStamp(
            taskResource,
            fieldValue,
            context
          )
        }
      },
      timestamp: () => {
        return
      },
      timeLoggedMS: (
        fhirBundle: ITemplatedBundle,
        fieldValue: number,
        context: any
      ) => {
        const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)

        if (!taskResource.extension) {
          taskResource.extension = []
        }

        const hasTimeLoggedMS = taskResource.extension.find(
          (extension) =>
            extension.url ===
            `${OPENCRVS_SPECIFICATION_URL}extension/timeLoggedMS`
        )

        if (hasTimeLoggedMS && hasTimeLoggedMS.valueInteger) {
          hasTimeLoggedMS.valueInteger =
            hasTimeLoggedMS.valueInteger + fieldValue
        } else {
          taskResource.extension.push({
            url: `${OPENCRVS_SPECIFICATION_URL}extension/timeLoggedMS`,
            valueInteger: fieldValue
          })
        }
        return
      }
    },
    attachments: {
      _fhirID: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        docRef.id = fieldValue as string
      },
      originalFileName: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        if (!docRef.identifier) {
          docRef.identifier = []
        }

        docRef.identifier.push({
          system: `${OPENCRVS_SPECIFICATION_URL}id/original-file-name`,
          value: fieldValue
        })
      },
      systemFileName: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        if (!docRef.identifier) {
          docRef.identifier = []
        }

        docRef.identifier.push({
          system: `${OPENCRVS_SPECIFICATION_URL}id/system-file-name`,
          value: fieldValue
        })
      },
      status: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        docRef.docStatus = fieldValue
      },
      type: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        docRef.type = {
          coding: [
            {
              system: `${OPENCRVS_SPECIFICATION_URL}supporting-doc-type`,
              code: fieldValue
            }
          ]
        }
      },
      createdAt: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        docRef.created = fieldValue
        docRef.indexed = fieldValue
      },
      contentType: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        if (!docRef.content) {
          docRef.content = [
            {
              attachment: {}
            }
          ]
        }
        docRef.content[0].attachment.contentType = fieldValue
      },
      data: async (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        if (!docRef.content) {
          docRef.content = [
            {
              attachment: {}
            }
          ]
        }

        if (isBase64FileString(fieldValue)) {
          const docUploadResponse = await uploadBase64ToMinio(
            fieldValue,
            context.authHeader
          )
          fieldValue = docUploadResponse
        }
        docRef.content[0].attachment.data = fieldValue
      },
      subject: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        if (!docRef.subject) {
          docRef.subject = {}
        }
        docRef.subject.display = fieldValue
      },
      uri: async (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        if (!docRef.content) {
          docRef.content = [
            {
              attachment: {}
            }
          ]
        }
        docRef.content[0].attachment.data = fieldValue
      }
    },
    certificates: {
      collector: {
        relationship: async (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const relatedPersonResource = selectOrCreateRelatedPersonResource(
            fhirBundle,
            context,
            context.event
          )
          if (!relatedPersonResource.relationship) {
            relatedPersonResource.relationship = {}
          }
          if (relatedPersonResource.relationship.coding?.[0]) {
            relatedPersonResource.relationship.coding[0].code = fieldValue
          } else {
            relatedPersonResource.relationship.coding = [
              {
                system:
                  'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
                code: fieldValue
              }
            ]
          }
          /* if mother/father is collecting then we will just put the person ref here */
          if (fieldValue === 'MOTHER') {
            await setCertificateCollectorReference(
              MOTHER_CODE,
              relatedPersonResource,
              fhirBundle,
              context
            )
          } else if (fieldValue === 'FATHER') {
            await setCertificateCollectorReference(
              FATHER_CODE,
              relatedPersonResource,
              fhirBundle,
              context
            )
          } else if (fieldValue === 'INFORMANT') {
            await setCertificateCollectorReference(
              INFORMANT_CODE,
              relatedPersonResource,
              fhirBundle,
              context
            )
          } else if (fieldValue === 'BRIDE') {
            await setCertificateCollectorReference(
              BRIDE_CODE,
              relatedPersonResource,
              fhirBundle,
              context
            )
          } else if (fieldValue === 'GROOM') {
            await setCertificateCollectorReference(
              GROOM_CODE,
              relatedPersonResource,
              fhirBundle,
              context
            )
          }
        },
        otherRelationship: async (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const relatedPersonResource = selectOrCreateRelatedPersonResource(
            fhirBundle,
            context,
            context.event
          )
          if (!relatedPersonResource.relationship) {
            relatedPersonResource.relationship = {}
          }
          relatedPersonResource.relationship.text = fieldValue
        },
        affidavit: {
          contentType: (
            fhirBundle: ITemplatedBundle,
            fieldValue: string,
            context: any
          ) => {
            const relatedPersonResource = selectOrCreateRelatedPersonResource(
              fhirBundle,
              context,
              context.event
            )
            if (!relatedPersonResource.extension) {
              relatedPersonResource.extension = []
            }
            const hasAffidavit = relatedPersonResource.extension.find(
              (extention) =>
                extention.url ===
                `${OPENCRVS_SPECIFICATION_URL}extension/relatedperson-affidavittype`
            )
            if (!hasAffidavit) {
              relatedPersonResource.extension.push({
                url: `${OPENCRVS_SPECIFICATION_URL}extension/relatedperson-affidavittype`,
                valueAttachment: {
                  contentType: fieldValue
                }
              })
            } else {
              hasAffidavit.valueAttachment = {
                ...hasAffidavit.valueAttachment,
                contentType: fieldValue
              }
            }
          },
          data: async (
            fhirBundle: ITemplatedBundle,
            fieldValue: string,
            context: any
          ) => {
            const relatedPersonResource = selectOrCreateRelatedPersonResource(
              fhirBundle,
              context,
              context.event
            )
            if (!relatedPersonResource.extension) {
              relatedPersonResource.extension = []
            }
            const hasAffidavit = relatedPersonResource.extension.find(
              (extention) =>
                extention.url ===
                `${OPENCRVS_SPECIFICATION_URL}extension/relatedperson-affidavittype`
            )
            if (isBase64FileString(fieldValue)) {
              const docUploadResponse = await uploadBase64ToMinio(
                fieldValue,
                context.authHeader
              )
              fieldValue = docUploadResponse
            }
            if (!hasAffidavit) {
              relatedPersonResource.extension.push({
                url: `${OPENCRVS_SPECIFICATION_URL}extension/relatedperson-affidavittype`,
                valueAttachment: {
                  data: fieldValue
                }
              })
            } else {
              hasAffidavit.valueAttachment = {
                ...hasAffidavit.valueAttachment,
                data: fieldValue
              }
            }
          }
        },
        /* expecting value for this only when other is selected as relationship */
        identifier: {
          id: (
            fhirBundle: ITemplatedBundle,
            fieldValue: string,
            context: any
          ) => {
            const person = selectOrCreateCollectorPersonResource(
              fhirBundle,
              context,
              context.event
            )
            setObjectPropInResourceArray(
              person,
              'identifier',
              fieldValue,
              'id',
              context
            )
          },
          type: (
            fhirBundle: ITemplatedBundle,
            fieldValue: string,
            context: any
          ) => {
            const person = selectOrCreateCollectorPersonResource(
              fhirBundle,
              context,
              context.event
            )
            setObjectPropInResourceArray(
              person,
              'identifier',
              fieldValue,
              'type',
              context
            )
          }
        },
        name: {
          use: (
            fhirBundle: ITemplatedBundle,
            fieldValue: string,
            context: any
          ) => {
            const person = selectOrCreateCollectorPersonResource(
              fhirBundle,
              context,
              context.event
            )
            setObjectPropInResourceArray(
              person,
              'name',
              fieldValue,
              'use',
              context
            )
          },
          firstNames: (
            fhirBundle: ITemplatedBundle,
            fieldValue: string,
            context: any
          ) => {
            const person = selectOrCreateCollectorPersonResource(
              fhirBundle,
              context,
              context.event
            )
            setObjectPropInResourceArray(
              person,
              'name',
              fieldValue.split(' '),
              'given',
              context
            )
          },
          familyName: (
            fhirBundle: ITemplatedBundle,
            fieldValue: string,
            context: any
          ) => {
            const person = selectOrCreateCollectorPersonResource(
              fhirBundle,
              context,
              context.event
            )
            setObjectPropInResourceArray(
              person,
              'name',
              [fieldValue],
              'family',
              context
            )
          }
        }
      },
      hasShowedVerifiedDocument: (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const certDocResource = selectOrCreateCertificateDocRefResource(
          fhirBundle,
          context,
          EVENT_TYPE.BIRTH
        )
        if (!certDocResource.extension) {
          certDocResource.extension = []
        }
        const hasVerifiedExt = certDocResource.extension.find(
          (extention) => extention.url === HAS_SHOWED_VERIFIED_DOCUMENT
        )
        if (!hasVerifiedExt) {
          certDocResource.extension.push({
            url: `${OPENCRVS_SPECIFICATION_URL}extension/hasShowedVerifiedDocument`,
            valueString: fieldValue
          })
        } else {
          hasVerifiedExt.valueString = fieldValue
        }
      },
      payments: {
        paymentId: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            context.event
          )
          if (!paymentResource.identifier) {
            paymentResource.identifier = []
          }
          paymentResource.identifier.push({
            system: `${OPENCRVS_SPECIFICATION_URL}id/payment-id`,
            value: fieldValue
          })
        },
        type: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            context.event
          )
          if (!paymentResource.detail) {
            paymentResource.detail = [
              {
                type: {
                  coding: [{ code: fieldValue }]
                }
              }
            ]
          } else {
            paymentResource.detail[0].type = {
              coding: [{ code: fieldValue }]
            }
          }
        },
        total: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            context.event
          )
          paymentResource.total = fieldValue as fhir.Money
        },
        amount: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            context.event
          )
          if (!paymentResource.detail) {
            paymentResource.detail = [
              {
                /* should be replaced when type value comes in */
                type: {
                  coding: [{ code: 'payment' }]
                },
                amount: fieldValue as fhir.Money
              }
            ]
          } else {
            paymentResource.detail[0].amount = fieldValue as fhir.Money
          }
        },
        outcome: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            context.event
          )
          paymentResource.outcome = {
            coding: [{ code: fieldValue }]
          }
        },
        date: (
          fhirBundle: ITemplatedBundle,
          fieldValue: string,
          context: any
        ) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            context.event
          )
          if (!paymentResource.detail) {
            paymentResource.detail = [
              {
                /* should be replaced when type value comes in */
                type: {
                  coding: [{ code: 'payment' }]
                },
                date: fieldValue
              }
            ]
          } else {
            paymentResource.detail[0].date = fieldValue
          }
        }
      },
      data: async (
        fhirBundle: ITemplatedBundle,
        fieldValue: string,
        context: any
      ) => {
        const certDocResource = selectOrCreateCertificateDocRefResource(
          fhirBundle,
          context,
          context.event
        )

        if (isBase64FileString(fieldValue)) {
          const docUploadResponse = await uploadBase64ToMinio(
            fieldValue,
            context.authHeader
          )
          fieldValue = docUploadResponse
        }
        if (!certDocResource.content) {
          certDocResource.content = [
            {
              attachment: {
                contentType: 'application/pdf'
              }
            }
          ]
        }
        certDocResource.content[0].attachment.data = fieldValue
      }
    }
  },
  questionnaire: createQuestionnaireBuilder(),
  eventLocation: {
    _fhirID: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const encounterLocationRef = selectOrCreateEncounterLocationRef(
        fhirBundle,
        context
      )
      encounterLocationRef.reference = `Location/${fieldValue}`
    },
    type: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      let location
      if (context.event === EVENT_TYPE.BIRTH) {
        location = selectOrCreateLocationRefResource(
          BIRTH_ENCOUNTER_CODE,
          fhirBundle,
          context
        )
      } else if (context.event === EVENT_TYPE.DEATH) {
        location = selectOrCreateLocationRefResource(
          DEATH_ENCOUNTER_CODE,
          fhirBundle,
          context
        )
      } else {
        location = selectOrCreateLocationRefResource(
          MARRIAGE_ENCOUNTER_CODE,
          fhirBundle,
          context
        )
      }

      location.type = {
        coding: [
          {
            system: `${OPENCRVS_SPECIFICATION_URL}location-type`,
            code: fieldValue
          }
        ]
      }
    },
    partOf: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const location = selectOrCreateLocationRefResource(
        context.event === EVENT_TYPE.BIRTH
          ? BIRTH_ENCOUNTER_CODE
          : context.event === EVENT_TYPE.DEATH
          ? DEATH_ENCOUNTER_CODE
          : MARRIAGE_ENCOUNTER_CODE,
        fhirBundle,
        context
      )
      location.partOf = {
        reference: fieldValue
      }
    },
    address: createLocationAddressBuilder(BIRTH_ENCOUNTER_CODE)
  },
  medicalPractitioner: {
    name: (fhirBundle: ITemplatedBundle, fieldValue: string, context: any) => {
      const practitioner = selectOrCreateEncounterPartitioner(
        fhirBundle,
        context
      )
      practitioner.name = [
        {
          use: 'en',
          family: `${fieldValue}`
        }
      ]
    },
    qualification: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const practitioner = selectOrCreateEncounterPartitioner(
        fhirBundle,
        context
      )
      practitioner.qualification = [
        {
          code: {
            coding: [
              {
                system: `${OPENCRVS_SPECIFICATION_URL}practitioner-degree`,
                code: fieldValue
              }
            ]
          }
        }
      ]
    },
    lastVisitDate: (
      fhirBundle: ITemplatedBundle,
      fieldValue: string,
      context: any
    ) => {
      const encounterParticipant = selectOrCreateEncounterParticipant(
        fhirBundle,
        context
      ) as fhir.EncounterParticipant
      if (!encounterParticipant.period) {
        encounterParticipant.period = {}
      }
      encounterParticipant.period.start = fieldValue
    }
  },
  maleDependentsOfDeceased: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      DEATH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_DESC,
      MALE_DEPENDENTS_ON_DECEASED_CODE,
      'Number of male dependents on Deceased',
      fhirBundle,
      context
    )
    observation.valueString = fieldValue as string
  },
  femaleDependentsOfDeceased: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      DEATH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_DESC,
      FEMALE_DEPENDENTS_ON_DECEASED_CODE,
      'Number of female dependents on Deceased',
      fhirBundle,
      context
    )
    observation.valueString = fieldValue as string
  },
  birthType: (
    fhirBundle: ITemplatedBundle,
    fieldValue: number,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      BIRTH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_DESC,
      BIRTH_TYPE_CODE,
      'Birth plurality of Pregnancy',
      fhirBundle,
      context
    )
    if (!observation.valueQuantity) {
      observation.valueQuantity = {}
    }
    observation.valueQuantity.value = fieldValue
  },
  typeOfMarriage: (
    fhirBundle: ITemplatedBundle,
    fieldValue: number,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      MARRIAGE_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_DESC,
      MARRIAGE_TYPE_CODE,
      'Types of marriage partnerships',
      fhirBundle,
      context
    )
    if (!observation.valueQuantity) {
      observation.valueQuantity = {}
    }
    observation.valueQuantity.value = fieldValue
  },
  weightAtBirth: (
    fhirBundle: ITemplatedBundle,
    fieldValue: number,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      BIRTH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_VSIGN_CODE,
      OBSERVATION_CATEGORY_VSIGN_DESC,
      BODY_WEIGHT_CODE,
      'Body weight Measured',
      fhirBundle,
      context
    )
    observation.valueQuantity = {
      value: fieldValue,
      unit: 'kg',
      system: 'http://unitsofmeasure.org',
      code: 'kg'
    }
  },
  attendantAtBirth: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      BIRTH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_DESC,
      BIRTH_ATTENDANT_CODE,
      'Birth attendant title',
      fhirBundle,
      context
    )
    observation.valueString = fieldValue
  },
  childrenBornAliveToMother: (
    fhirBundle: ITemplatedBundle,
    fieldValue: number,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      BIRTH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_VSIGN_CODE,
      OBSERVATION_CATEGORY_VSIGN_DESC,
      NUMBER_BORN_ALIVE_CODE,
      'Number born alive to mother',
      fhirBundle,
      context
    )
    if (!observation.valueQuantity) {
      observation.valueQuantity = {}
    }
    observation.valueQuantity.value = fieldValue
  },
  foetalDeathsToMother: (
    fhirBundle: ITemplatedBundle,
    fieldValue: number,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      BIRTH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_VSIGN_CODE,
      OBSERVATION_CATEGORY_VSIGN_DESC,
      NUMBER_FOEATAL_DEATH_CODE,
      'Number foetal deaths to mother',
      fhirBundle,
      context
    )
    if (!observation.valueQuantity) {
      observation.valueQuantity = {}
    }
    observation.valueQuantity.value = fieldValue
  },
  lastPreviousLiveBirth: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      BIRTH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_VSIGN_CODE,
      OBSERVATION_CATEGORY_VSIGN_DESC,
      LAST_LIVE_BIRTH_CODE,
      'Date last live birth',
      fhirBundle,
      context
    )
    observation.valueDateTime = fieldValue
  },
  mannerOfDeath: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      DEATH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_VSIGN_CODE,
      OBSERVATION_CATEGORY_VSIGN_DESC,
      MANNER_OF_DEATH_CODE,
      'Uncertified manner of death',
      fhirBundle,
      context
    )
    observation.valueCodeableConcept = {
      coding: [
        {
          system: `${OPENCRVS_SPECIFICATION_URL}manner-of-death`,
          code: fieldValue
        }
      ]
    }
  },
  deathDescription: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      DEATH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_CODE,
      OBSERVATION_CATEGORY_PROCEDURE_DESC,
      DEATH_DESCRIPTION_CODE,
      'Lay reported or verbal autopsy description',
      fhirBundle,
      context
    )
    observation.valueString = fieldValue
  },
  causeOfDeathEstablished: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      DEATH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_VSIGN_CODE,
      OBSERVATION_CATEGORY_VSIGN_DESC,
      CAUSE_OF_DEATH_ESTABLISHED_CODE,
      'Cause of death established',
      fhirBundle,
      context
    )
    observation.valueCodeableConcept = {
      coding: [
        {
          system: `${OPENCRVS_SPECIFICATION_URL}cause-of-death-established`,
          code: fieldValue
        }
      ]
    }
  },
  causeOfDeathMethod: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      DEATH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_VSIGN_CODE,
      OBSERVATION_CATEGORY_VSIGN_DESC,
      CAUSE_OF_DEATH_METHOD_CODE,
      'Cause of death method',
      fhirBundle,
      context
    )
    observation.valueCodeableConcept = {
      coding: [
        {
          system: `${OPENCRVS_SPECIFICATION_URL}cause-of-death-method`,
          code: fieldValue
        }
      ]
    }
  },
  causeOfDeath: (
    fhirBundle: ITemplatedBundle,
    fieldValue: string,
    context: any
  ) => {
    const observation = selectOrCreateObservationResource(
      DEATH_ENCOUNTER_CODE,
      OBSERVATION_CATEGORY_VSIGN_CODE,
      OBSERVATION_CATEGORY_VSIGN_DESC,
      CAUSE_OF_DEATH_CODE,
      'Cause of death',
      fhirBundle,
      context
    )
    observation.valueCodeableConcept = {
      coding: [
        {
          system: `${OPENCRVS_SPECIFICATION_URL}cause-of-death`,
          code: fieldValue
        }
      ]
    }
  }
}

export async function buildFHIRBundle(
  reg:
    | GQLBirthRegistrationInput
    | GQLDeathRegistrationInput
    | GQLMarriageRegistrationInput,
  eventType: EVENT_TYPE,
  authHeader: IAuthHeader
) {
  const ref = uuid()
  const context: any = {
    event: eventType
  }
  const composition = createCompositionTemplate(ref, context)
  const fhirBundle = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [composition]
  }

  if (authHeader) {
    context.authHeader = authHeader
  }
  await transformObj(
    reg as Record<string, unknown>,
    fhirBundle,
    builders,
    context
  )
  let isADuplicate = false
  if (eventType === EVENT_TYPE.BIRTH) {
    isADuplicate = await hasBirthDuplicates(
      authHeader,
      reg as GQLBirthRegistrationInput
    )
  } else if (eventType === EVENT_TYPE.DEATH) {
    isADuplicate = await hasDeathDuplicates(
      authHeader,
      reg as GQLDeathRegistrationInput
    )
  }

  if (isADuplicate) {
    composition.resource.extension = composition.resource.extension || []
    composition.resource.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}duplicate`,
      valueBoolean: true
    })
  }
  return fhirBundle
}

async function hasBirthDuplicates(
  authHeader: IAuthHeader,
  bundle: GQLBirthRegistrationInput
) {
  if (!bundle || !bundle.child) {
    return false
  }

  const res = await findBirthDuplicates(authHeader, {
    motherIdentifier: bundle.mother?.identifier?.[0]?.id,
    childFirstNames: bundle.child.name?.[0]?.firstNames,
    childFamilyName: bundle.child.name?.[0]?.familyName,
    childDoB: bundle.child.birthDate,
    motherFirstNames: bundle.mother?.name?.[0]?.firstNames,
    motherFamilyName: bundle.mother?.name?.[0]?.familyName,
    motherDoB: bundle.mother?.birthDate
  })

  return !res || res.length > 0
}

async function hasDeathDuplicates(
  authHeader: IAuthHeader,
  bundle: GQLDeathRegistrationInput
) {
  if (!bundle || !bundle.deceased) {
    return false
  }

  const res = await findDeathDuplicates(authHeader, {
    deceasedFirstNames: bundle.deceased?.name?.[0]?.firstNames,
    deceasedFamilyName: bundle.deceased?.name?.[0]?.familyName,
    deceasedIdentifier: bundle.deceased?.identifier?.[0]?.id,
    deceasedDoB: bundle.deceased?.birthDate,
    deathDate: bundle.deceased?.deceased?.deathDate
  })

  return !res || res.length > 0
}

export async function updateFHIRTaskBundle(
  taskEntry: ITaskBundleEntry,
  status: string,
  reason?: string,
  comment?: string,
  duplicateTrackingId?: string
) {
  const taskResource = taskEntry.resource
  taskEntry.resource = updateTaskTemplate(
    taskResource,
    status,
    reason,
    comment,
    duplicateTrackingId
  )
  taskEntry.resource.lastModified = new Date().toISOString()
  const fhirBundle: ITaskBundle = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [taskEntry]
  }
  return fhirBundle
}

export function taskBundleWithExtension(
  taskEntry: ITaskBundleEntry,
  extension: fhir.Extension
) {
  const task = taskEntry.resource
  task.lastModified = new Date().toISOString()
  task.extension = [...(task.extension ?? []), extension]
  const fhirBundle: ITaskBundle = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [taskEntry]
  }
  return fhirBundle
}

export async function checkUserAssignment(
  id: string,
  authHeader: IAuthHeader
): Promise<boolean> {
  if (!authHeader || !authHeader.Authorization) {
    return false
  }
  const tokenPayload = getTokenPayload(authHeader.Authorization.split(' ')[1])
  const userId = tokenPayload.sub
  const res: { userId?: string } = await postAssignmentSearch(authHeader, id)
  return userId === res?.userId
}

export interface ITemplatedComposition extends fhir.Composition {
  section: fhir.CompositionSection[]
  [key: string]: any
}

export interface ICompositionBundleEntry extends fhir.BundleEntry {
  resource: ITemplatedComposition
}

export interface ITemplatedBundle extends fhir.Bundle {
  resourceType: fhir.code
  // prettier-ignore
  entry: [ICompositionBundleEntry, ...fhir.BundleEntry[]]
}

export interface ITaskBundleEntry extends fhir.BundleEntry {
  resource: fhir.Task
}

export interface ITaskBundle extends fhir.Bundle {
  resourceType: fhir.code
  // prettier-ignore
  entry: [ITaskBundleEntry]
}
