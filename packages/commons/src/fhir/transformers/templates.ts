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
  BundleEntry,
  Composition,
  CompositionSectionCode,
  CompositionSectionEncounterReference,
  DocumentReference,
  Encounter,
  Location,
  Observation,
  Patient,
  PaymentReconciliation,
  Practitioner,
  QuestionnaireResponse,
  RelatedPerson,
  Section,
  Task
} from '..'
import { EVENT_TYPE, PartialBy } from '../../types'
import { UUID } from '../../uuid'

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

export function createPersonSection<T extends CompositionSectionCode>(
  refUuid: UUID,
  sectionCode: T,
  sectionTitle: string
): Section<T> {
  return {
    title: sectionTitle,
    code: {
      coding: [
        {
          system: 'http://opencrvs.org/doc-sections' as const,
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

export function createLocationResource(refUuid: UUID): BundleEntry<Location> {
  return {
    fullUrl: `urn:uuid:${refUuid}` as const,
    resource: {
      resourceType: 'Location' as const,
      mode: 'instance' as const
    }
  }
}

export function createEncounterSection<
  T extends CompositionSectionEncounterReference
>(refUuid: UUID, sectionCode: T): Section<T> {
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
        reference: `urn:uuid:${refUuid}` as const
      }
    ]
  }
}

export function createEncounter(refUuid: UUID): BundleEntry<Encounter> {
  return {
    fullUrl: `urn:uuid:${refUuid}` as const,
    resource: {
      resourceType: 'Encounter',
      status: 'finished'
    }
  }
}

export function createRelatedPersonTemplate(refUuid: UUID) {
  return {
    fullUrl: `urn:uuid:${refUuid}` as const,
    resource: {
      resourceType: 'RelatedPerson' as const
    }
  } satisfies BundleEntry<PartialBy<RelatedPerson, 'patient'>>
}

export function createPaymentReconciliationTemplate(refUuid: UUID) {
  return {
    fullUrl: `urn:uuid:${refUuid}` as const,
    resource: {
      resourceType: 'PaymentReconciliation',
      status: 'active'
    }
  } satisfies BundleEntry<PaymentReconciliation>
}

export function createCompositionTemplate(
  refUuid: UUID,
  context: any
): BundleEntry<Composition> {
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
    fullUrl: `urn:uuid:${refUuid}` as const,
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
    }
  }
}

export function createPersonEntryTemplate(refUuid: UUID) {
  return {
    fullUrl: `urn:uuid:${refUuid}` as const,
    resource: {
      resourceType: 'Patient' as const,
      extension: [],
      active: true,
      name: []
    }
  } satisfies BundleEntry<Patient>
}

export function createPractitionerEntryTemplate(
  refUuid: UUID
): BundleEntry<Practitioner> {
  return {
    fullUrl: `urn:uuid:${refUuid}` as const,
    resource: {
      resourceType: 'Practitioner' as const,
      extension: [],
      active: true,
      name: [],
      telecom: []
    }
  }
}

export function createSupportingDocumentsSection<
  T extends CompositionSectionCode
>(sectionCode: T, sectionTitle: string): Section<T> {
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
    entry: []
  }
}

export function createDocRefTemplate(
  refUuid: UUID
): BundleEntry<DocumentReference> {
  return {
    fullUrl: `urn:uuid:${refUuid}` as const,
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
  refUuid: UUID
): BundleEntry<Observation> {
  return {
    fullUrl: `urn:uuid:${refUuid}` as const,
    resource: {
      resourceType: 'Observation',
      extension: [],
      status: 'final',
      code: {}
    }
  }
}

export function createTaskRefTemplate(
  refUuid: UUID,
  event: EVENT_TYPE
): BundleEntry<Task> {
  return {
    fullUrl: `urn:uuid:${refUuid}` as const,
    resource: {
      resourceType: 'Task',
      extension: [],
      status: 'ready',
      identifier: [],
      lastModified: new Date().toISOString(),
      businessStatus: {
        coding: []
      },
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/types',
            code: event
          }
        ]
      }
    }
  }
}
export function createQuestionnaireResponseTemplate(
  refUuid: UUID
): BundleEntry<QuestionnaireResponse> {
  return {
    fullUrl: `urn:uuid:${refUuid}` as const,
    resource: {
      resourceType: 'QuestionnaireResponse',
      extension: [],
      status: 'completed'
    }
  }
}

export async function removeDuplicatesFromComposition(
  composition: Composition,
  compositionId: string,
  duplicateId?: string
) {
  if (duplicateId) {
    const removeAllDuplicates = compositionId === duplicateId
    const updatedRelatesTo =
      composition.relatesTo &&
      composition.relatesTo.filter((relatesTo) => {
        return (
          relatesTo.code !== 'duplicate' ||
          (!removeAllDuplicates &&
            relatesTo.targetReference &&
            relatesTo.targetReference.reference !==
              `Composition/${duplicateId}`)
        )
      })
    composition.relatesTo = updatedRelatesTo
    return composition
  } else {
    composition.relatesTo = []
    return composition
  }
}
