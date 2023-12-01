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
import { HAS_SHOWED_VERIFIED_DOCUMENT } from './constants'
import {
  ATTACHMENT_CONTEXT_KEY,
  ATTACHMENT_DOCS_TITLE,
  BIRTH_ATTENDANT_CODE,
  BIRTH_ENCOUNTER_CODE,
  BIRTH_TYPE_CODE,
  BODY_WEIGHT_CODE,
  BRIDE_TITLE,
  CAUSE_OF_DEATH_CODE,
  CAUSE_OF_DEATH_ESTABLISHED_CODE,
  CAUSE_OF_DEATH_METHOD_CODE,
  CHILD_TITLE,
  DEATH_DESCRIPTION_CODE,
  DEATH_ENCOUNTER_CODE,
  DECEASED_TITLE,
  FATHER_TITLE,
  FEMALE_DEPENDENTS_ON_DECEASED_CODE,
  GROOM_TITLE,
  INFORMANT_TITLE,
  LAST_LIVE_BIRTH_CODE,
  MALE_DEPENDENTS_ON_DECEASED_CODE,
  MANNER_OF_DEATH_CODE,
  MARRIAGE_ENCOUNTER_CODE,
  MARRIAGE_TYPE_CODE,
  MOTHER_TITLE,
  NUMBER_BORN_ALIVE_CODE,
  NUMBER_FOEATAL_DEATH_CODE,
  OBSERVATION_CATEGORY_PROCEDURE_CODE,
  OBSERVATION_CATEGORY_PROCEDURE_DESC,
  OBSERVATION_CATEGORY_VSIGN_CODE,
  OBSERVATION_CATEGORY_VSIGN_DESC,
  SPOUSE_TITLE,
  WITNESS_ONE_TITLE,
  WITNESS_TWO_TITLE,
  createCompositionTemplate
} from './templates'
import transformObj, { Context, IFieldBuilders } from './transformer'
import {
  getMaritalStatusCode,
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
  selectOrCreateWitnessResource,
  setCertificateCollectorReference,
  setInformantReference,
  setObjectPropInResourceArray,
  setQuestionnaireItem
} from './utils'

import {
  ATTACHMENT_DOCS_CODE,
  BRIDE_CODE,
  Bundle,
  CHILD_CODE,
  CompositionSectionCode,
  DECEASED_CODE,
  EncounterParticipant,
  Extension,
  FATHER_CODE,
  FHIR_SPECIFICATION_URL,
  GROOM_CODE,
  INFORMANT_CODE,
  KnownExtensionType,
  MOTHER_CODE,
  Money,
  OPENCRVS_SPECIFICATION_URL,
  Patient,
  ResourceIdentifier,
  SPOUSE_CODE,
  StringExtensionType,
  Task,
  TaskIdentifier,
  TaskIdentifierSystemType,
  WITNESS_ONE_CODE,
  WITNESS_TWO_CODE,
  findExtension,
  getComposition,
  markSaved
} from '..'
import { getUUID } from '../..'
import { EVENT_TYPE, replaceFromBundle } from '../../record'
import {
  AddressInput,
  Attachment,
  BirthRegistration,
  ContactPoint,
  DeathRegistration,
  HumanName,
  IdentityType,
  MarriageRegistration,
  QuestionnaireQuestion
} from './input'

type StringReplace<
  T extends string,
  S extends string,
  D extends string,
  A extends string = ''
> = T extends `${infer L}${S}${infer R}`
  ? StringReplace<R, S, D, `${A}${L}${D}`>
  : `${A}${T}`

enum SignatureExtensionPostfix {
  INFORMANT = 'informants-signature',
  GROOM = 'groom-signature',
  BRIDE = 'bride-signature',
  WITNESS_ONE = 'witness-one-signature',
  WITNESS_TWO = 'witness-two-signature'
}

function createNameBuilder(
  sectionCode: CompositionSectionCode,
  sectionTitle: string
): IFieldBuilders<'name', HumanName> {
  return {
    use: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(person, 'name', fieldValue, 'use', context)
    },
    firstNames: (fhirBundle, fieldValue, context) => {
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
    familyName: (fhirBundle, fieldValue, context) => {
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
    marriedLastName: (fhirBundle, fieldValue, context) => {
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

function createIDBuilder(
  sectionCode: CompositionSectionCode,
  sectionTitle: string
): IFieldBuilders<'identifier', IdentityType> {
  return {
    id: (fhirBundle, fieldValue, context) => {
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
    type: (fhirBundle, fieldValue, context) => {
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
    otherType: (fhirBundle, fieldValue, context) => {
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
    fieldsModifiedByIdentity: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(
        person,
        'identifier',
        fieldValue ? fieldValue.split(',') : [],
        'fieldsModifiedByIdentity',
        context
      )
    }
  }
}

function createTelecomBuilder(
  sectionCode: CompositionSectionCode,
  sectionTitle: string
): IFieldBuilders<'telecom', ContactPoint> {
  return {
    system: (fhirBundle, fieldValue, context) => {
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
    value: (fhirBundle, fieldValue, context) => {
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
    use: (fhirBundle, fieldValue, context) => {
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

function createPhotoBuilder(
  sectionCode: CompositionSectionCode,
  sectionTitle: string
): IFieldBuilders<'photo', Attachment> {
  return {
    contentType: (fhirBundle, fieldValue, context) => {
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
    data: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )
      setObjectPropInResourceArray(person, 'photo', fieldValue, 'data', context)
    }
  }
}

function createAddressBuilder(
  sectionCode: CompositionSectionCode,
  sectionTitle: string
): IFieldBuilders<'address', AddressInput> {
  return {
    use: (fhirBundle, fieldValue, context) => {
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
    type: (fhirBundle, fieldValue, context) => {
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
    text: (fhirBundle, fieldValue, context) => {
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
    line: (fhirBundle, fieldValue, context) => {
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
      if (
        person.address[context._index.address].line![context._index.line] !=
        undefined
      ) {
        person.address[context._index.address].line![context._index.line] =
          fieldValue
      } else {
        ;(person.address[context._index.address].line as string[]).push(
          fieldValue
        )
      }
    },
    city: (fhirBundle, fieldValue, context) => {
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
    district: (fhirBundle, fieldValue, context) => {
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
    state: (fhirBundle, fieldValue, context) => {
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
    postalCode: (fhirBundle, fieldValue, context) => {
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
    country: (fhirBundle, fieldValue, context) => {
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
    },
    partOf: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        sectionCode,
        sectionTitle,
        fhirBundle
      )

      setObjectPropInResourceArray(
        person,
        'address',
        [
          {
            url: 'http://opencrvs.org/specs/extension/part-of',
            valueReference: {
              reference: `Location/${fieldValue}`
            }
          }
        ],
        'extension',
        context
      )
    }
  }
}

function createLocationAddressBuilder(
  sectionCode: string
): IFieldBuilders<'address', AddressInput> {
  return {
    use: (fhirBundle, fieldValue, context) => {
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
    type: (fhirBundle, fieldValue, context) => {
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
    text: (fhirBundle, fieldValue, context) => {
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
    line: (fhirBundle, fieldValue, context) => {
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
    city: (fhirBundle, fieldValue, context) => {
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
    district: (fhirBundle, fieldValue, context) => {
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
    state: (fhirBundle, fieldValue, context) => {
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
    postalCode: (fhirBundle, fieldValue, context) => {
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
    country: (fhirBundle, fieldValue, context) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )

      if (!location.address) {
        location.address = {}
      }
      location.address.country = fieldValue
    },
    partOf: (fhirBundle, fieldValue, context) => {
      const location = selectOrCreateLocationRefResource(
        sectionCode,
        fhirBundle,
        context
      )

      location.partOf = { reference: `Location/${fieldValue}` }
    }
  }
}

function createDateOfMarriageBuilder(resource: Patient, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/date-of-marriage`,
    valueDateTime: fieldValue
  })
}

function createAgeBuilder(resource: Patient, fieldValue: number) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/age`,
    valueInteger: fieldValue
  })
}

function createNationalityBuilder(resource: Patient, fieldValue: string) {
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

function createMaritalStatusBuilder(resource: Patient, fieldValue: string) {
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

function createOccupationBulder(resource: Patient, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }

  const hasOccupation = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/patient-occupation`,
    resource.extension
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

function createReasonNotApplyingBuilder(resource: Patient, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }

  const hasReasonNotApplying = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/reason-not-applying`,
    resource.extension
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
  resource: Patient,
  fieldValue: number
) {
  if (!resource.extension) {
    resource.extension = []
  }

  const hasAgeOfIndividualInYears = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/age-of-individual-in-years`,
    resource.extension
  )

  if (hasAgeOfIndividualInYears) {
    hasAgeOfIndividualInYears.valueInteger = fieldValue
  } else {
    resource.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/age-of-individual-in-years`,
      valueInteger: fieldValue
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
  resource: Patient,
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

function setExtension<T extends keyof StringExtensionType>(
  extensions: Array<Extension>,
  url: T,
  value: StringExtensionType[T]['valueString']
) {
  const existingExtension = findExtension(
    url as StringExtensionType[keyof StringExtensionType]['url'],
    extensions
  )

  if (existingExtension) {
    existingExtension.valueString = value
  } else {
    extensions.push({
      url: url,
      valueString: value
    } as KnownExtensionType[T])
  }
}

function createInformantShareContact(task: Task, fieldValue: string) {
  if (!task.extension) {
    task.extension = []
  }
  setExtension(
    task.extension,
    `${OPENCRVS_SPECIFICATION_URL}extension/contact-person`,
    fieldValue
  )
}

function createInformantRelationship(task: Task, fieldValue: string) {
  if (!task.extension) {
    task.extension = []
  }
  setExtension(
    task.extension,
    `${OPENCRVS_SPECIFICATION_URL}extension/contact-relationship`,
    fieldValue
  )
}

function createInformantsSignature(
  resource: Task,
  fieldValue: string,
  extensionPostfix: SignatureExtensionPostfix
) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/${extensionPostfix}`,
    valueString: fieldValue
  })
}

function createInformantShareContactNumber(resource: Task, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/contact-person-phone-number`,
    valueString: fieldValue
  })
}
function createInformantType(
  fhirBundle: Bundle,
  fieldValue: string,
  context: Context
) {
  const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
  createInformantShareContact(taskResource, fieldValue)

  const relatedPersonResource = selectOrCreateInformantSection(
    INFORMANT_CODE,
    INFORMANT_TITLE,
    fhirBundle
  )

  if (fieldValue !== 'OTHER') {
    relatedPersonResource.relationship = {
      coding: [
        {
          system: 'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
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
    }
  } else if (context.event === EVENT_TYPE.DEATH) {
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
    } else if (fieldValue === 'SPOUSE') {
      setInformantReference(
        SPOUSE_CODE,
        SPOUSE_TITLE,
        relatedPersonResource,
        fhirBundle,
        context
      )
    }
  } else if (context.event === EVENT_TYPE.MARRIAGE) {
    if (fieldValue === 'BRIDE') {
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
}

function createOtherInformantType(
  fhirBundle: Bundle,
  fieldValue: string,
  context: Context
) {
  const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
  createInformantRelationship(taskResource, fieldValue)
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
}
function createInformantShareEmail(resource: Task, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/contact-person-email`,
    valueString: fieldValue
  })
}

function createInCompleteFieldListExt(resource: Task, fieldValue: string) {
  if (!resource.extension) {
    resource.extension = []
  }
  resource.extension.push({
    url: `${OPENCRVS_SPECIFICATION_URL}extension/in-complete-fields`,
    valueString: fieldValue
  })
}

function setResourceIdentifier(
  resource: Task,
  identifierName: TaskIdentifierSystemType,
  fieldValue: string
) {
  if (!resource.identifier) {
    resource.identifier = []
  }
  const identifier = {
    system: `http://opencrvs.org/specs/id/${identifierName}` as const,
    value: fieldValue
  } as TaskIdentifier

  resource.identifier.push(identifier)
}

function createRegStatusComment(
  resource: Task,
  fieldValue: string,
  context: Context<'comments'>
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
  resource: Task,
  fieldValue: string,
  context: Context<'comments'>
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

function createQuestionnaireBuilder(): IFieldBuilders<
  'questionnaire',
  QuestionnaireQuestion
> {
  return {
    fieldId: (fhirBundle, fieldValue, context) => {
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
    value: (fhirBundle, fieldValue, context) => {
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

const builders: IFieldBuilders = {
  _fhirIDMap: {
    composition: (fhirBundle, fieldValue, context) => {
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
        const savedObservation = markSaved(observation, fieldValue)
        return replaceFromBundle(fhirBundle, observation, savedObservation)
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
        const savedObservation = markSaved(observation, fieldValue)
        return replaceFromBundle(fhirBundle, observation, savedObservation)
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
        const savedObservation = markSaved(observation, fieldValue)
        return replaceFromBundle(fhirBundle, observation, savedObservation)
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
        const savedObservation = markSaved(observation, fieldValue)
        return replaceFromBundle(fhirBundle, observation, savedObservation)
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
        const savedObservation = markSaved(observation, fieldValue)
        return replaceFromBundle(fhirBundle, observation, savedObservation)
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
        const savedObservation = markSaved(observation, fieldValue)
        return replaceFromBundle(fhirBundle, observation, savedObservation)
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
        const savedObservation = markSaved(observation, fieldValue)
        return replaceFromBundle(fhirBundle, observation, savedObservation)
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
        const savedObservation = markSaved(observation, fieldValue)
        return replaceFromBundle(fhirBundle, observation, savedObservation)
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
        const savedObservation = markSaved(observation, fieldValue)
        return replaceFromBundle(fhirBundle, observation, savedObservation)
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
        const savedObservation = markSaved(observation, fieldValue)
        return replaceFromBundle(fhirBundle, observation, savedObservation)
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
        const savedObservation = markSaved(observation, fieldValue)
        return replaceFromBundle(fhirBundle, observation, savedObservation)
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
        const savedObservation = markSaved(observation, fieldValue)
        return replaceFromBundle(fhirBundle, observation, savedObservation)
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
        const savedObservation = markSaved(observation, fieldValue)
        return replaceFromBundle(fhirBundle, observation, savedObservation)
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
        const savedObservation = markSaved(observation, fieldValue)
        return replaceFromBundle(fhirBundle, observation, savedObservation)
      }
    },
    questionnaireResponse: (fhirBundle, fieldValue, context) => {
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

    const composition = getComposition(fhirBundle)

    composition.date = fieldValue

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
      mother.gender = fieldValue
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
      return createReasonNotApplyingBuilder(person, fieldValue)
    },
    ageOfIndividualInYears: (fhirBundle, fieldValue) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      return createAgeOfIndividualInYearsBuilder(person, fieldValue)
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
    deceased: {
      deceased: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreatePersonResource(
          MOTHER_CODE,
          MOTHER_TITLE,
          fhirBundle
        )
        person.deceasedBoolean = fieldValue
      },
      deathDate: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreatePersonResource(
          MOTHER_CODE,
          MOTHER_TITLE,
          fhirBundle
        )
        person.deceasedDateTime = fieldValue
      }
    },
    nationality: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        MOTHER_CODE,
        MOTHER_TITLE,
        fhirBundle
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (fhirBundle, fieldValue, context) => {
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
      father.gender = fieldValue
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
      return createAgeOfIndividualInYearsBuilder(person, fieldValue)
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
    deceased: {
      deceased: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreatePersonResource(
          FATHER_CODE,
          FATHER_TITLE,
          fhirBundle
        )
        person.deceasedBoolean = fieldValue
      },
      deathDate: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreatePersonResource(
          FATHER_CODE,
          FATHER_TITLE,
          fhirBundle
        )
        person.deceasedDateTime = fieldValue
      }
    },
    nationality: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        FATHER_CODE,
        FATHER_TITLE,
        fhirBundle
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (fhirBundle, fieldValue, context) => {
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
    gender: (fhirBundle, fieldValue, context) => {
      const spouse = selectOrCreatePersonResource(
        SPOUSE_CODE,
        SPOUSE_TITLE,
        fhirBundle
      )
      spouse.gender = fieldValue
    },
    identifier: createIDBuilder(SPOUSE_CODE, SPOUSE_TITLE),
    name: createNameBuilder(SPOUSE_CODE, SPOUSE_TITLE),
    telecom: createTelecomBuilder(SPOUSE_CODE, SPOUSE_TITLE),
    birthDate: (fhirBundle, fieldValue, context) => {
      const spouse = selectOrCreatePersonResource(
        SPOUSE_CODE,
        SPOUSE_TITLE,
        fhirBundle
      )
      spouse.birthDate = fieldValue as string
    },
    maritalStatus: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        SPOUSE_CODE,
        SPOUSE_TITLE,
        fhirBundle
      )
      return createMaritalStatusBuilder(person, fieldValue as string)
    },
    occupation: (fhirBundle, fieldValue) => {
      const person = selectOrCreatePersonResource(
        SPOUSE_CODE,
        SPOUSE_TITLE,
        fhirBundle
      )
      return createOccupationBulder(person, fieldValue as string)
    },
    detailsExist: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        SPOUSE_CODE,
        SPOUSE_TITLE,
        fhirBundle
      )
      person.active = fieldValue as boolean
    },
    reasonNotApplying: (fhirBundle, fieldValue) => {
      const person = selectOrCreatePersonResource(
        SPOUSE_CODE,
        SPOUSE_TITLE,
        fhirBundle
      )
      return createReasonNotApplyingBuilder(person, fieldValue as string)
    },
    ageOfIndividualInYears: (fhirBundle, fieldValue) => {
      const person = selectOrCreatePersonResource(
        SPOUSE_CODE,
        SPOUSE_TITLE,
        fhirBundle
      )
      return createAgeOfIndividualInYearsBuilder(person, fieldValue)
    },
    address: createAddressBuilder(SPOUSE_CODE, SPOUSE_TITLE),
    photo: createPhotoBuilder(SPOUSE_CODE, SPOUSE_TITLE),

    nationality: (fhirBundle: Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        SPOUSE_CODE,
        SPOUSE_TITLE,
        fhirBundle
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (fhirBundle: Bundle, fieldValue: string, context: any) => {
      const person = selectOrCreatePersonResource(
        SPOUSE_CODE,
        SPOUSE_TITLE,
        fhirBundle
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (
      fhirBundle: Bundle,
      fieldValue: string,
      context: any
    ) => {
      const person = selectOrCreatePersonResource(
        SPOUSE_CODE,
        SPOUSE_TITLE,
        fhirBundle
      )
      return createEducationalAttainmentBuilder(person, fieldValue)
    }
  },
  child: {
    _fhirID: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      child.id = fieldValue
    },
    gender: (fhirBundle, fieldValue, context) => {
      const child = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      child.gender = fieldValue
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
      child.birthDate = fieldValue
    },
    maritalStatus: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      return createMaritalStatusBuilder(person, fieldValue)
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
    deceased: {
      deceased: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreatePersonResource(
          CHILD_CODE,
          CHILD_TITLE,
          fhirBundle
        )
        person.deceasedBoolean = fieldValue
      },
      deathDate: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreatePersonResource(
          CHILD_CODE,
          CHILD_TITLE,
          fhirBundle
        )
        person.deceasedDateTime = fieldValue
      }
    },
    nationality: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        CHILD_CODE,
        CHILD_TITLE,
        fhirBundle
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (fhirBundle, fieldValue, context) => {
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
      person.id = fieldValue
    },
    gender: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      person.gender = fieldValue
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
      person.birthDate = fieldValue
    },
    age: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      return createAgeBuilder(person, fieldValue)
    },
    ageOfIndividualInYears: (fhirBundle, fieldValue) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      return createAgeOfIndividualInYearsBuilder(person, fieldValue)
    },
    maritalStatus: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      return createMaritalStatusBuilder(person, fieldValue)
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
    nationality: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        DECEASED_CODE,
        DECEASED_TITLE,
        fhirBundle
      )
      return createEducationalAttainmentBuilder(person, fieldValue)
    }
  },
  informant: {
    _fhirID: (fhirBundle, fieldValue, context) => {
      const relatedPersonResource = selectOrCreateInformantSection(
        INFORMANT_CODE,
        INFORMANT_TITLE,
        fhirBundle
      )
      relatedPersonResource.id = fieldValue
    },
    _fhirIDPatient: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreateInformantResource(fhirBundle)

      /*
       * In case of the informant already exists, we should not change their id.
       * If you imagine first storing a record with mother as the informant and then later on changing it to father
       * then what would happen is "person" evaluates to father while _fhirPatient input still referring mother (as client doesn't know better).
       */

      if (!person.id) {
        person.id = fieldValue as string
      }
    },
    gender: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreateInformantResource(fhirBundle)
      person.gender = fieldValue
    },
    ageOfIndividualInYears: (fhirBundle, fieldValue) => {
      const person = selectOrCreateInformantResource(fhirBundle)
      return createAgeOfIndividualInYearsBuilder(person, fieldValue)
    },
    identifier: {
      id: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'identifier',
          fieldValue,
          'value',
          context
        )
      },
      type: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'identifier',
          fieldValue,
          'type',
          context
        )
      },
      otherType: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'identifier',
          fieldValue,
          'otherType',
          context
        )
      },
      fieldsModifiedByIdentity: (fhirBundle, fieldValue, context) => {
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
      use: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(person, 'name', fieldValue, 'use', context)
      },
      firstNames: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'name',
          fieldValue.split(' '),
          'given',
          context
        )
      },
      familyName: (fhirBundle, fieldValue, context) => {
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
      system: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'telecom',
          fieldValue,
          'system',
          context
        )
      },
      value: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'telecom',
          fieldValue,
          'value',
          context
        )
      },
      use: (fhirBundle, fieldValue, context) => {
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
      use: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'address',
          fieldValue,
          'use',
          context
        )
      },
      type: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'address',
          fieldValue,
          'type',
          context
        )
      },
      text: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'address',
          fieldValue,
          'text',
          context
        )
      },
      line: (fhirBundle, fieldValue, context) => {
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
        if (
          person.address[context._index.address].line![context._index.line] !==
          undefined
        ) {
          person.address[context._index.address].line![context._index.line] =
            fieldValue
        } else {
          ;(person.address[context._index.address].line as string[]).push(
            fieldValue
          )
        }
      },
      city: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'address',
          fieldValue,
          'city',
          context
        )
      },
      district: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'address',
          fieldValue,
          'district',
          context
        )
      },
      state: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'address',
          fieldValue,
          'state',
          context
        )
      },
      postalCode: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'address',
          fieldValue,
          'postalCode',
          context
        )
      },
      partOf: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)

        setObjectPropInResourceArray(
          person,
          'address',
          [
            {
              url: 'http://opencrvs.org/specs/extension/part-of',
              valueReference: {
                reference: `Location/${fieldValue}`
              }
            }
          ],
          'extension',
          context
        )
      },
      country: (fhirBundle, fieldValue, context) => {
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
      contentType: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'photo',
          fieldValue,
          'contentType',
          context
        )
      },
      data: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateInformantResource(fhirBundle)
        setObjectPropInResourceArray(
          person,
          'photo',
          fieldValue,
          'data',
          context
        )
      }
    },
    nationality: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreateInformantResource(fhirBundle)
      return createNationalityBuilder(person, fieldValue)
    },
    occupation: (fhirBundle, fieldValue) => {
      const person = selectOrCreateInformantResource(fhirBundle)
      return createOccupationBulder(person, fieldValue as string)
    },
    dateOfMarriage: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreateInformantResource(fhirBundle)
      return createDateOfMarriageBuilder(person, fieldValue)
    },
    educationalAttainment: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreateInformantResource(fhirBundle)
      return createEducationalAttainmentBuilder(person, fieldValue)
    },
    relationship: (fhirBundle, fieldValue, context) =>
      createInformantType(fhirBundle, fieldValue, context),
    otherRelationship: (fhirBundle, fieldValue, context) =>
      createOtherInformantType(fhirBundle, fieldValue, context)
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
      return createAgeOfIndividualInYearsBuilder(person, fieldValue)
    },
    address: createAddressBuilder(BRIDE_CODE, BRIDE_TITLE),
    photo: createPhotoBuilder(BRIDE_CODE, BRIDE_TITLE),
    nationality: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        BRIDE_CODE,
        BRIDE_TITLE,
        fhirBundle
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (fhirBundle, fieldValue, context) => {
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
      return createAgeOfIndividualInYearsBuilder(person, fieldValue)
    },
    address: createAddressBuilder(GROOM_CODE, GROOM_TITLE),
    photo: createPhotoBuilder(GROOM_CODE, GROOM_TITLE),
    nationality: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        GROOM_CODE,
        GROOM_TITLE,
        fhirBundle
      )
      return createNationalityBuilder(person, fieldValue)
    },
    dateOfMarriage: (fhirBundle, fieldValue, context) => {
      const person = selectOrCreatePersonResource(
        GROOM_CODE,
        GROOM_TITLE,
        fhirBundle
      )
      return createDateOfMarriageBuilder(person, fieldValue)
    }
  },
  witnessOne: {
    _fhirID: (fhirBundle, fieldValue, context) => {
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
      use: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateWitnessResource(
          fhirBundle,
          WITNESS_ONE_CODE,
          WITNESS_ONE_TITLE
        )
        setObjectPropInResourceArray(person, 'name', fieldValue, 'use', context)
      },
      firstNames: (fhirBundle, fieldValue, context) => {
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
      familyName: (fhirBundle, fieldValue, context) => {
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
    relationship: (fhirBundle, fieldValue, context) => {
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
    otherRelationship: (fhirBundle, fieldValue, context) => {
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
    _fhirID: (fhirBundle, fieldValue, context) => {
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
      use: (fhirBundle, fieldValue, context) => {
        const person = selectOrCreateWitnessResource(
          fhirBundle,
          WITNESS_TWO_CODE,
          WITNESS_TWO_TITLE
        )
        setObjectPropInResourceArray(person, 'name', fieldValue, 'use', context)
      },
      firstNames: (fhirBundle, fieldValue, context) => {
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
      familyName: (fhirBundle, fieldValue, context) => {
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
    relationship: (fhirBundle, fieldValue, context) => {
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
    otherRelationship: (fhirBundle, fieldValue, context) => {
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
    informantsSignature: (fhirBundle, fieldValue, context) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)

      return createInformantsSignature(
        taskResource,
        fieldValue,
        SignatureExtensionPostfix.INFORMANT
      )
    },
    groomSignature: (fhirBundle, fieldValue, context) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)

      return createInformantsSignature(
        taskResource,
        fieldValue,
        SignatureExtensionPostfix.GROOM
      )
    },
    brideSignature: (fhirBundle, fieldValue, context) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)

      return createInformantsSignature(
        taskResource,
        fieldValue,
        SignatureExtensionPostfix.BRIDE
      )
    },
    witnessOneSignature: (fhirBundle, fieldValue, context) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)

      return createInformantsSignature(
        taskResource,
        fieldValue,
        SignatureExtensionPostfix.WITNESS_ONE
      )
    },
    witnessTwoSignature: (fhirBundle, fieldValue, context) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)

      return createInformantsSignature(
        taskResource,
        fieldValue,
        SignatureExtensionPostfix.WITNESS_TWO
      )
    },
    contactPhoneNumber: (fhirBundle, fieldValue, context) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return createInformantShareContactNumber(taskResource, fieldValue)
    },
    contactEmail: (fhirBundle, fieldValue, context) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return createInformantShareEmail(taskResource, fieldValue)
    },
    informantType: (fhirBundle, fieldValue, context) =>
      createInformantType(fhirBundle, fieldValue, context),
    otherInformantType: (fhirBundle, fieldValue, context) =>
      createOtherInformantType(fhirBundle, fieldValue, context),
    draftId: (fhirBundle, fieldValue, context) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return setResourceIdentifier(taskResource, 'draft-id', fieldValue)
    },
    trackingId: (fhirBundle, fieldValue, context) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      let trackingId:
        | 'birth-tracking-id'
        | 'death-tracking-id'
        | 'marriage-tracking-id' = 'birth-tracking-id'

      if (context.event === EVENT_TYPE.BIRTH) {
        trackingId = 'birth-tracking-id'
      } else if (context.event === EVENT_TYPE.DEATH) {
        trackingId = 'death-tracking-id'
      } else if (context.event === EVENT_TYPE.MARRIAGE) {
        trackingId = 'marriage-tracking-id'
      }
      return setResourceIdentifier(taskResource, `${trackingId}`, fieldValue)
    },
    mosipAid: (fhirBundle, fieldValue, context) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return setResourceIdentifier(taskResource, 'mosip-aid', fieldValue)
    },
    registrationNumber: (fhirBundle, fieldValue, context) => {
      let regNumber:
        | 'birth-registration-number'
        | 'death-registration-number'
        | 'marriage-registration-number' = 'birth-registration-number'

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
    inCompleteFields: (fhirBundle, fieldValue, context) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      taskResource.status = 'draft'
      return createInCompleteFieldListExt(taskResource, fieldValue)
    },
    paperFormID: (fhirBundle, fieldValue, context) => {
      const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)
      return setResourceIdentifier(taskResource, 'paper-form-id', fieldValue)
    },
    status: {
      comments: {
        comment: (fhirBundle, fieldValue, context) => {
          const taskResource = selectOrCreateTaskRefResource(
            fhirBundle,
            context
          )
          return createRegStatusComment(taskResource, fieldValue, context)
        },
        createdAt: (fhirBundle, fieldValue, context) => {
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
      timeLoggedMS: (fhirBundle, fieldValue: number, context) => {
        const taskResource = selectOrCreateTaskRefResource(fhirBundle, context)

        if (!taskResource.extension) {
          taskResource.extension = []
        }

        const hasTimeLoggedMS = findExtension(
          `${OPENCRVS_SPECIFICATION_URL}extension/timeLoggedMS`,
          taskResource.extension
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
      _fhirID: (fhirBundle, fieldValue, context) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        docRef.id = fieldValue
      },
      originalFileName: (fhirBundle, fieldValue, context) => {
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
      systemFileName: (fhirBundle, fieldValue, context) => {
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
      status: (fhirBundle, fieldValue, context) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )

        docRef.docStatus = fieldValue
          .toLowerCase()
          .replace(/_/g, '-') as StringReplace<
          Lowercase<typeof fieldValue>,
          '_',
          '-'
        >
      },
      type: (fhirBundle, fieldValue, context) => {
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
      createdAt: (fhirBundle, fieldValue, context) => {
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
      contentType: (fhirBundle, fieldValue, context) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        if (!docRef.content?.[0]) {
          docRef.content = [
            {
              attachment: {
                contentType: fieldValue
              }
            }
          ]
        }
        docRef.content[0].attachment.contentType = fieldValue
      },
      data: (fhirBundle, fieldValue, context) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        if (!docRef.content?.[0]) {
          docRef.content = [
            {
              attachment: {
                contentType: fieldValue
              }
            }
          ]
        }

        docRef.content[0].attachment.data = fieldValue
      },
      subject: (fhirBundle, fieldValue, context) => {
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
      uri: (fhirBundle, fieldValue, context) => {
        const docRef = selectOrCreateDocRefResource(
          ATTACHMENT_DOCS_CODE,
          ATTACHMENT_DOCS_TITLE,
          fhirBundle,
          context,
          ATTACHMENT_CONTEXT_KEY
        )
        if (!docRef.content?.[0]) {
          docRef.content = [
            {
              attachment: {
                contentType: fieldValue
              }
            }
          ]
        }
        docRef.content[0].attachment.data = fieldValue
      }
    },
    certificates: {
      collector: {
        relationship: (fhirBundle, fieldValue, context) => {
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
            setCertificateCollectorReference(
              MOTHER_CODE,
              relatedPersonResource,
              fhirBundle,
              context
            )
          } else if (fieldValue === 'FATHER') {
            setCertificateCollectorReference(
              FATHER_CODE,
              relatedPersonResource,
              fhirBundle,
              context
            )
          } else if (fieldValue === 'INFORMANT') {
            setCertificateCollectorReference(
              INFORMANT_CODE,
              relatedPersonResource,
              fhirBundle,
              context
            )
          } else if (fieldValue === 'BRIDE') {
            setCertificateCollectorReference(
              BRIDE_CODE,
              relatedPersonResource,
              fhirBundle,
              context
            )
          } else if (fieldValue === 'GROOM') {
            setCertificateCollectorReference(
              GROOM_CODE,
              relatedPersonResource,
              fhirBundle,
              context
            )
          }
        },
        otherRelationship: (fhirBundle, fieldValue, context) => {
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
          contentType: (fhirBundle, fieldValue, context) => {
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
          data: (fhirBundle, fieldValue, context) => {
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
          id: (fhirBundle, fieldValue, context) => {
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
          type: (fhirBundle, fieldValue, context) => {
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
          use: (fhirBundle, fieldValue, context) => {
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
          firstNames: (fhirBundle, fieldValue, context) => {
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
          familyName: (fhirBundle, fieldValue, context) => {
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
      hasShowedVerifiedDocument: (fhirBundle, fieldValue, context) => {
        const certDocResource = selectOrCreateCertificateDocRefResource(
          fhirBundle,
          context,
          EVENT_TYPE.BIRTH
        )
        if (!certDocResource.extension) {
          certDocResource.extension = []
        }
        const hasVerifiedExt = findExtension(
          HAS_SHOWED_VERIFIED_DOCUMENT,
          certDocResource.extension
        )

        if (!hasVerifiedExt) {
          certDocResource.extension.push({
            url: `${OPENCRVS_SPECIFICATION_URL}extension/hasShowedVerifiedDocument`,
            valueBoolean: fieldValue
          })
        } else {
          hasVerifiedExt.valueBoolean = fieldValue
        }
      },
      payments: {
        paymentId: (fhirBundle, fieldValue, context) => {
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
        type: (fhirBundle, fieldValue, context) => {
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
        total: (fhirBundle, fieldValue, context) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            context.event
          )

          paymentResource.total = fieldValue as Money
        },
        amount: (fhirBundle, fieldValue, context) => {
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
                amount: fieldValue as Money
              }
            ]
          } else {
            paymentResource.detail[0].amount = fieldValue as Money
          }
        },
        outcome: (fhirBundle, fieldValue, context) => {
          const paymentResource = selectOrCreatePaymentReconciliationResource(
            fhirBundle,
            context,
            context.event
          )
          paymentResource.outcome = {
            coding: [{ code: fieldValue }]
          }
        },
        date: (fhirBundle, fieldValue, context) => {
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
      data: (fhirBundle, fieldValue, context) => {
        const certDocResource = selectOrCreateCertificateDocRefResource(
          fhirBundle,
          context,
          context.event
        )

        if (!certDocResource.content?.[0]) {
          certDocResource.content = [
            {
              attachment: {
                contentType: 'application/pdf',
                data: fieldValue
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
    _fhirID: (fhirBundle, fieldValue, context) => {
      const encounterLocationRef = selectOrCreateEncounterLocationRef(
        fhirBundle,
        context
      )
      encounterLocationRef.reference =
        `Location/${fieldValue}` as ResourceIdentifier
    },
    type: (fhirBundle, fieldValue, context) => {
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
    partOf: (fhirBundle, fieldValue, context) => {
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
        reference: fieldValue as ResourceIdentifier
      }
    },
    address: createLocationAddressBuilder(BIRTH_ENCOUNTER_CODE)
  },
  medicalPractitioner: {
    name: (fhirBundle, fieldValue, context) => {
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
    qualification: (fhirBundle, fieldValue, context) => {
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
    lastVisitDate: (fhirBundle, fieldValue, context) => {
      const encounterParticipant = selectOrCreateEncounterParticipant(
        fhirBundle,
        context
      ) as EncounterParticipant
      if (!encounterParticipant.period) {
        encounterParticipant.period = {}
      }
      encounterParticipant.period.start = fieldValue
    }
  },
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
    // @todo use correct field
    observation.valueString = fieldValue as unknown as string
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
    // @todo use correct field
    observation.valueString = fieldValue as unknown as string
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
    if (!observation.valueQuantity) {
      observation.valueQuantity = { value: fieldValue }
    }
    observation.valueQuantity.value = fieldValue
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
    if (!observation.valueQuantity) {
      observation.valueQuantity = { value: fieldValue }
    }
    observation.valueQuantity.value = fieldValue
  },
  weightAtBirth: (fhirBundle, fieldValue: number, context) => {
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
    observation.valueString = fieldValue
  },
  childrenBornAliveToMother: (fhirBundle, fieldValue: number, context) => {
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
      observation.valueQuantity = { value: fieldValue }
    }
    observation.valueQuantity.value = fieldValue
  },
  foetalDeathsToMother: (fhirBundle, fieldValue: number, context) => {
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
      observation.valueQuantity = { value: fieldValue }
    }
    observation.valueQuantity.value = fieldValue
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
    observation.valueDateTime = fieldValue
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
    observation.valueCodeableConcept = {
      coding: [
        {
          system: `${OPENCRVS_SPECIFICATION_URL}manner-of-death`,
          code: fieldValue
        }
      ]
    }
  },
  deathDescription: (fhirBundle, fieldValue, context) => {
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
    observation.valueCodeableConcept = {
      coding: [
        {
          system: `${OPENCRVS_SPECIFICATION_URL}cause-of-death-established`,
          code: fieldValue
        }
      ]
    }
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
    observation.valueCodeableConcept = {
      coding: [
        {
          system: `${OPENCRVS_SPECIFICATION_URL}cause-of-death-method`,
          code: fieldValue
        }
      ]
    }
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

export function updateFHIRBundle<T extends Bundle>(
  existingBundle: T,
  recordDetails: BirthRegistration | DeathRegistration | MarriageRegistration,
  eventType: EVENT_TYPE
) {
  const context = {
    event: eventType,
    _index: {}
  }

  return transformObj(
    recordDetails as Record<string, unknown>,
    existingBundle,
    builders,
    context
  ) as T
}

export function buildFHIRBundle(
  reg: BirthRegistration | DeathRegistration | MarriageRegistration,
  eventType: EVENT_TYPE
): Bundle {
  const ref = getUUID()
  const context = {
    _index: {},
    event: eventType
  }

  const initialFHIRBundle: Bundle = {
    resourceType: 'Bundle' as const,
    type: 'document' as const,
    entry: [createCompositionTemplate(ref, context)]
  }

  const newFHIRBundle = transformObj(
    reg as Record<string, unknown>,
    initialFHIRBundle,
    builders,
    context
  )

  return newFHIRBundle
}
