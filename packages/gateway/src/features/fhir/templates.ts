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
  EVENT_TYPE
} from '@gateway/features/fhir/constants'
import {
  BundleEntry,
  CodeableConcept,
  Composition,
  DocumentReference,
  Encounter,
  Observation,
  Patient,
  PaymentReconciliation,
  Practitioner,
  QuestionnaireResponse,
  Reference,
  RelatedPerson,
  Task,
  Unsaved,
  UnsavedResource
} from '@opencrvs/commons/types'

export const MOTHER_CODE = 'mother-details'
export const FATHER_CODE = 'father-details'
export const CHILD_CODE = 'child-details'
export const DECEASED_CODE = 'deceased-details'
export const INFORMANT_CODE = 'informant-details'
export const WITNESS_ONE_CODE = 'witness-one-details'
export const WITNESS_TWO_CODE = 'witness-two-details'
export const SPOUSE_CODE = 'spouse-details'
export const BRIDE_CODE = 'bride-details'
export const GROOM_CODE = 'groom-details'
export const ATTACHMENT_DOCS_CODE = 'supporting-documents'
export const CERTIFICATE_DOCS_CODE = 'certificates'
export const CORRECTION_CERTIFICATE_DOCS_CODE = 'correction-certificates'
export const CORRECTION_CERTIFICATE_DOCS_TITLE = 'Correction certificates'
export const CORRECTION_CERTIFICATE_DOCS_CONTEXT_KEY = 'correction-certificates'
export const BIRTH_ENCOUNTER_CODE = 'birth-encounter'
export const MARRIAGE_ENCOUNTER_CODE = 'marriage-encounter'
export const BODY_WEIGHT_CODE = '3141-9'
export const BIRTH_TYPE_CODE = '57722-1'
export const MARRIAGE_TYPE_CODE = 'partnership'
export const BIRTH_ATTENDANT_CODE = '73764-3'
export const INFORMANT_TYPE = 'informant-type'
export const NUMBER_BORN_ALIVE_CODE = 'num-born-alive'
export const NUMBER_FOEATAL_DEATH_CODE = 'num-foetal-death'
export const MALE_DEPENDENTS_ON_DECEASED_CODE =
  'num-male-dependents-on-deceased'
export const FEMALE_DEPENDENTS_ON_DECEASED_CODE =
  'num-female-dependents-on-deceased'
export const LAST_LIVE_BIRTH_CODE = '68499-3'
export const OBSERVATION_CATEGORY_PROCEDURE_CODE = 'procedure'
export const OBSERVATION_CATEGORY_PROCEDURE_DESC = 'Procedure'
export const OBSERVATION_CATEGORY_VSIGN_CODE = 'vital-signs'
export const OBSERVATION_CATEGORY_VSIGN_DESC = 'Vital Signs'
export const MOTHER_TITLE = "Mother's details"
export const FATHER_TITLE = "Father's details"
export const SPOUSE_TITLE = "Spouse's details"
export const CHILD_TITLE = 'Child details'
export const DECEASED_TITLE = 'Deceased details'
export const INFORMANT_TITLE = "Informant's details"
export const WITNESS_ONE_TITLE = "Witness One's details"
export const WITNESS_TWO_TITLE = "Witness Two's details"
export const BRIDE_TITLE = "Bride's details"
export const GROOM_TITLE = "Groom's details"
export const ATTACHMENT_DOCS_TITLE = 'Supporting Documents'
export const CERTIFICATE_DOCS_TITLE = 'Certificates'
export const ATTACHMENT_CONTEXT_KEY = 'attachments'
export const CERTIFICATE_CONTEXT_KEY = 'certificates'
export const DEATH_ENCOUNTER_CODE = 'death-encounter'
export const CAUSE_OF_DEATH_CODE = 'ICD10'
export const CAUSE_OF_DEATH_METHOD_CODE = 'cause-of-death-method'
export const CAUSE_OF_DEATH_ESTABLISHED_CODE = 'cause-of-death-established'
export const MANNER_OF_DEATH_CODE = 'uncertified-manner-of-death'
export const DEATH_DESCRIPTION_CODE =
  'lay-reported-or-verbal-autopsy-description'
export const PARENT_DETAILS = 'parent-details'
export const BIRTH_CORRECTION_ENCOUNTER_CODE = 'birth-correction-encounters'
export const DEATH_CORRECTION_ENCOUNTER_CODE = 'death-correction-encounters'
export const MARRIAGE_CORRECTION_ENCOUNTER_CODE =
  'marriage-correction-encounters'

export function createPersonSection(
  refUuid: string,
  sectionCode: string,
  sectionTitle: string
) {
  return {
    title: sectionTitle,
    code: {
      coding: [
        {
          system: 'http://opencrvs.org/doc-sections',
          code: sectionCode
        }
      ],
      text: sectionTitle
    },
    entry: [
      {
        reference: `urn:uuid:${refUuid}`
      }
    ]
  }
}

export function createLocationResource(refUuid: string) {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'Location' as const,
      mode: 'instance' as const
    }
  }
}

export function createEncounterSection(refUuid: string, sectionCode: string) {
  let sectionTitle
  if (sectionCode === BIRTH_ENCOUNTER_CODE) {
    sectionTitle = 'Birth encounter'
  } else if (sectionCode === DEATH_ENCOUNTER_CODE) {
    sectionTitle = 'Death encounter'
  } else if (sectionCode === MARRIAGE_ENCOUNTER_CODE) {
    sectionTitle = 'Marriage encounter'
  } else if (sectionCode === BIRTH_CORRECTION_ENCOUNTER_CODE) {
    sectionTitle = 'Birth correction encounters'
  } else if (sectionCode === DEATH_CORRECTION_ENCOUNTER_CODE) {
    sectionTitle = 'Death correction encounters'
  } else {
    throw new Error(`Unknown section code ${sectionCode}`)
  }

  return {
    title: sectionTitle,
    code: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/sections',
          code: sectionCode
        }
      ],
      text: sectionTitle
    },
    entry: [
      {
        reference: `urn:uuid:${refUuid}`
      }
    ]
  }
}

export function createEncounter(refUuid: string) {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'Encounter',
      status: 'finished'
    } as Encounter
  }
}

export function createRelatedPersonTemplate(refUuid: string) {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'RelatedPerson'
    } as RelatedPerson
  }
}

export function createPaymentReconciliationTemplate(refUuid: string) {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'PaymentReconciliation',
      status: 'active'
    } as PaymentReconciliation
  }
}

export function createCompositionTemplate(refUuid: string, context: any) {
  let declarationText
  let declarationCode
  if (context.event === EVENT_TYPE.BIRTH) {
    declarationCode = 'birth-declaration'
    declarationText = 'Birth Declaration'
  } else if (context.event === EVENT_TYPE.DEATH) {
    declarationCode = 'death-declaration'
    declarationText = 'Death Declaration'
  } else if (context.event === EVENT_TYPE.MARRIAGE) {
    declarationCode = 'marriage-declaration'
    declarationText = 'Marriage Declaration'
  }

  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      identifier: {
        system: 'urn:ietf:rfc:3986',
        value: `${refUuid}`
      },
      resourceType: 'Composition',
      status: 'preliminary',
      type: {
        coding: [
          {
            system: 'http://opencrvs.org/doc-types',
            code: `${declarationCode}`
          }
        ],
        text: `${declarationText}`
      },
      class: {
        coding: [
          {
            system: 'http://opencrvs.org/doc-classes',
            code: 'crvs-document'
          }
        ],
        text: 'CRVS Document'
      },
      title: `${declarationText}`,
      section: [],
      subject: {},
      date: '',
      author: []
    } as UnsavedResource<Composition>
  }
}

export function updateTaskTemplate(
  task: Task,
  status: string,
  reason?: string,
  comment?: string,
  duplicateTrackingId?: string
): Task {
  if (
    !task ||
    !task.businessStatus ||
    !task.businessStatus.coding ||
    !task.businessStatus.coding[0] ||
    !task.businessStatus.coding[0].code
  ) {
    throw new Error('Task has no businessStatus code')
  }
  task.businessStatus.coding[0].code = status
  if (!task.reason) {
    task.reason = {
      text: ''
    }
  }
  task.reason.text = reason || ''
  const statusReason: CodeableConcept = {
    text: comment || ''
  }
  task.statusReason = statusReason
  if (duplicateTrackingId) {
    task.extension = task.extension || []
    task.extension.push({
      url: DUPLICATE_TRACKING_ID,
      valueString: duplicateTrackingId
    })
  }
  return task
}

export function createPersonEntryTemplate(
  refUuid: string
): Unsaved<BundleEntry<Patient>> {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'Patient',
      extension: [],
      active: true,
      name: []
    }
  }
}

export function createPractitionerEntryTemplate(
  refUuid: string
): Unsaved<BundleEntry<Practitioner>> {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'Practitioner',
      extension: [],
      active: true,
      name: [],
      telecom: []
    }
  }
}

export function createSupportingDocumentsSection(
  sectionCode: string,
  sectionTitle: string
) {
  return {
    title: sectionTitle,
    code: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/sections',
          code: sectionCode
        }
      ],
      text: sectionTitle
    },
    entry: [] as Reference[]
  }
}

export function createDocRefTemplate(
  refUuid: string
): Unsaved<BundleEntry<DocumentReference>> {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'DocumentReference',
      masterIdentifier: {
        system: 'urn:ietf:rfc:3986',
        value: refUuid
      },
      extension: [],
      type: {},
      content: [],
      status: 'current'
    }
  }
}

export function createObservationEntryTemplate(
  refUuid: string
): Unsaved<BundleEntry<Observation>> {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'Observation',
      extension: [],
      status: 'final',
      code: {}
    }
  }
}

export function createTaskRefTemplate(refUuid: string, event: EVENT_TYPE) {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'Task',
      extension: [],
      status: 'ready',
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/types',
            code: event.toString()
          }
        ]
      }
    }
  }
}
export function createQuestionnaireResponseTemplate(refUuid: string) {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'QuestionnaireResponse',
      extension: [],
      status: 'completed'
    } as QuestionnaireResponse
  }
}
