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
import { ITemplatedComposition } from '@gateway/features/registration/fhir-builders'
import { EVENT_TYPE } from '@gateway/features/fhir/constants'

export const MOTHER_CODE = 'mother-details'
export const FATHER_CODE = 'father-details'
export const CHILD_CODE = 'child-details'
export const DECEASED_CODE = 'deceased-details'
export const INFORMANT_CODE = 'informant-details'
export const SPOUSE_CODE = 'spouse-details'
export const ATTACHMENT_DOCS_CODE = 'supporting-documents'
export const CERTIFICATE_DOCS_CODE = 'certificates'
export const BIRTH_ENCOUNTER_CODE = 'birth-encounter'
export const BODY_WEIGHT_CODE = '3141-9'
export const BIRTH_TYPE_CODE = '57722-1'
export const BIRTH_ATTENDANT_CODE = '73764-3'
export const BIRTH_REG_TYPE_CODE = 'birth-reg-type'
export const BIRTH_REG_PRESENT_CODE = 'present-at-birth-reg'
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
export const ATTACHMENT_DOCS_TITLE = 'Supporting Documents'
export const CERTIFICATE_DOCS_TITLE = 'Certificates'
export const ATTACHMENT_CONTEXT_KEY = 'attachments'
export const CERTIFICATE_CONTEXT_KEY = 'certificates'
export const DEATH_ENCOUNTER_CODE = 'death-encounter'
export const CAUSE_OF_DEATH_CODE = 'ICD10'
export const CAUSE_OF_DEATH_METHOD_CODE = 'cause-of-death-method'
export const MANNER_OF_DEATH_CODE = 'uncertified-manner-of-death'
export const REASON_MOTHER_NOT_APPLYING = 'reason-mother-not-applying'
export const REASON_FATHER_NOT_APPLYING = 'reason-father-not-applying'
export const REASON_CAREGIVER_NOT_APPLYING = 'reason-caregiver-not-applying'
export const PRIMARY_CAREGIVER = 'primary-caregiver'
export const PRIMARY_CAREGIVER_CODE = 'primary-caregiver-details'
export const PRIMARY_CAREGIVER_TITLE = "Primary caregiver's details"
export const PARENT_DETAILS = 'parent-details'

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
      resourceType: 'Location',
      mode: 'instance'
    }
  }
}

export function createEncounterSection(refUuid: string, sectionCode: string) {
  let sectionTitle
  if (sectionCode === BIRTH_ENCOUNTER_CODE) {
    sectionTitle = 'Birth encounter'
  } else if (sectionCode === DEATH_ENCOUNTER_CODE) {
    sectionTitle = 'Death encounter'
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
    } as fhir.Encounter
  }
}

export function createRelatedPersonTemplate(refUuid: string) {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'RelatedPerson'
    } as fhir.RelatedPerson
  }
}

export function createPaymentReconciliationTemplate(refUuid: string) {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'PaymentReconciliation',
      status: 'active'
    } as fhir.PaymentReconciliation
  }
}

export function createCompositionTemplate(refUuid: string, context: any) {
  let declarationText
  let declarationCode
  if (context.event === EVENT_TYPE.BIRTH) {
    declarationCode = 'birth-application'
    declarationText = 'Birth Application'
  } else {
    declarationCode = 'death-application'
    declarationText = 'Death Application'
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
    } as ITemplatedComposition
  }
}

export function updateTaskTemplate(
  task: fhir.Task,
  status: string,
  reason?: string,
  comment?: string
): fhir.Task {
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
  if (comment || reason) {
    if (!task.reason) {
      task.reason = {
        text: ''
      }
    }

    task.reason.text = reason || ''

    const newNote: fhir.Annotation = {
      text: comment ? comment : '',
      time: new Date().toUTCString(),
      authorString: ''
    }
    if (!task.note) {
      task.note = []
    }
    task.note.push(newNote)
  }
  return task
}

export function addDownloadExtensionToTaskTemplate(task: fhir.Task): fhir.Task {
  const url = 'http://opencrvs.org/specs/extension/regDownloaded'
  const taskExtension = task.extension?.find((ext) => ext.url === url)
  if (!taskExtension) {
    const newExtension: fhir.Extension = { url }
    task.extension?.push(newExtension)
  }
  return task
}

export function createPersonEntryTemplate(refUuid: string) {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'Patient',
      active: true
    } as fhir.Patient
  }
}

export function createPractitionerEntryTemplate(refUuid: string) {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'Practitioner',
      active: true
    } as fhir.Practitioner
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
    entry: [] as fhir.Reference[]
  }
}

export function createDocRefTemplate(refUuid: string) {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'DocumentReference',
      masterIdentifier: {
        system: 'urn:ietf:rfc:3986',
        value: refUuid
      },
      status: 'current'
    } as fhir.DocumentReference
  }
}

export function createObservationEntryTemplate(refUuid: string) {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'Observation',
      status: 'final'
    } as fhir.Observation
  }
}

export function createTaskRefTemplate(refUuid: string, event: EVENT_TYPE) {
  return {
    fullUrl: `urn:uuid:${refUuid}`,
    resource: {
      resourceType: 'Task',
      status: 'requested',
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
