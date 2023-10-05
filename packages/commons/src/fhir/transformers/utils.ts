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
  BIRTH_CORRECTION_ENCOUNTER_CODE,
  BIRTH_ENCOUNTER_CODE,
  CERTIFICATE_CONTEXT_KEY,
  CERTIFICATE_DOCS_TITLE,
  CORRECTION_CERTIFICATE_DOCS_CONTEXT_KEY,
  CORRECTION_CERTIFICATE_DOCS_TITLE,
  DEATH_CORRECTION_ENCOUNTER_CODE,
  DEATH_ENCOUNTER_CODE,
  INFORMANT_TITLE,
  MARRIAGE_CORRECTION_ENCOUNTER_CODE,
  MARRIAGE_ENCOUNTER_CODE,
  createDocRefTemplate,
  createEncounter,
  createEncounterSection,
  createLocationResource,
  createObservationEntryTemplate,
  createPaymentReconciliationTemplate,
  createPersonEntryTemplate,
  createPersonSection,
  createPractitionerEntryTemplate,
  createQuestionnaireResponseTemplate,
  createRelatedPersonTemplate,
  createSupportingDocumentsSection,
  createTaskRefTemplate
} from './templates'

import { getUUID } from '../../uuid'
import {
  Bundle,
  BundleEntry,
  CERTIFICATE_DOCS_CODE,
  CORRECTION_CERTIFICATE_DOCS_CODE,
  CodeableConcept,
  CompositionSection,
  CompositionSectionCode,
  CompositionSectionEncounterReference,
  DocumentReference,
  Encounter,
  EncounterParticipant,
  INFORMANT_CODE,
  Location,
  OPENCRVS_SPECIFICATION_URL,
  Observation,
  Patient,
  PaymentReconciliation,
  Practitioner,
  QuestionnaireResponse,
  Reference,
  RelatedPerson,
  Resource,
  Saved,
  Task,
  URNReference,
  WITNESS_ONE_CODE,
  WITNESS_TWO_CODE,
  findCompositionSection,
  findExtension,
  getComposition,
  isObservation
} from '..'

import { PartialBy } from '../../types'
import {
  DOWNLOADED_EXTENSION_URL,
  EVENT_TYPE,
  FHIR_OBSERVATION_CATEGORY_URL,
  MAKE_CORRECTION_EXTENSION_URL
} from './constants'

export function findCompositionSectionInBundle<T extends Bundle>(
  code: string,
  fhirBundle: T
): CompositionSection | undefined

export function findCompositionSectionInBundle<T extends Bundle>(
  code: string,
  fhirBundle: T
) {
  return findCompositionSection(code, getComposition(fhirBundle))
}

export function selectOrCreatePersonResource(
  sectionCode: CompositionSectionCode,
  sectionTitle: string,
  fhirBundle: Bundle
): Patient {
  const section = findCompositionSectionInBundle(sectionCode, fhirBundle)

  let personEntry
  if (!section) {
    // create person
    const ref = getUUID()

    const personSection = createPersonSection(ref, sectionCode, sectionTitle)
    const composition = getComposition(fhirBundle)
    composition.section.push(personSection)
    personEntry = createPersonEntryTemplate(ref)
    fhirBundle.entry.push(personEntry)
  } else {
    if (!section.entry || !section.entry[0]) {
      throw new Error('Expected person section to have an entry')
    }
    const personSectionEntry = section.entry[0]
    personEntry = fhirBundle.entry.find(
      (entry) => entry.fullUrl === personSectionEntry.reference
    )
  }

  if (!personEntry) {
    throw new Error(
      'Patient referenced from composition section not found in FHIR bundle'
    )
  }

  return personEntry.resource as Patient
}

export function selectOrCreateEncounterResource(
  fhirBundle: Bundle,
  context: any,
  isCorrection?: boolean
): Encounter {
  let sectionCode: CompositionSectionEncounterReference
  if (context.event === EVENT_TYPE.BIRTH) {
    sectionCode = isCorrection
      ? BIRTH_CORRECTION_ENCOUNTER_CODE
      : BIRTH_ENCOUNTER_CODE
  } else if (context.event === EVENT_TYPE.DEATH) {
    sectionCode = isCorrection
      ? DEATH_CORRECTION_ENCOUNTER_CODE
      : DEATH_ENCOUNTER_CODE
  } else if (context.event === EVENT_TYPE.MARRIAGE) {
    sectionCode = isCorrection
      ? MARRIAGE_CORRECTION_ENCOUNTER_CODE
      : MARRIAGE_ENCOUNTER_CODE
  } else {
    throw new Error(`Unknown event ${context}`)
  }
  const section = findCompositionSectionInBundle(sectionCode, fhirBundle)

  if (!section) {
    const ref = getUUID()
    const encounterSection = createEncounterSection(ref, sectionCode)
    const unsavedComposition = getComposition(fhirBundle)

    unsavedComposition.section.push(encounterSection)
    const encounterEntry = createEncounter(ref)

    fhirBundle.entry.push(encounterEntry)
    return encounterEntry.resource
  }

  if (!section.entry || !section.entry[0]) {
    throw new Error('Expected encounter section to have an entry')
  }
  const encounterSectionEntry = section.entry[0]
  const encounterEntry = fhirBundle.entry.find(
    (entry): entry is BundleEntry<Encounter> =>
      entry.fullUrl === encounterSectionEntry.reference
  )

  if (!encounterEntry) {
    throw new Error(
      'Encounter referenced from composition section not found in FHIR bundle'
    )
  }

  return encounterEntry.resource
}

export function selectOrCreateObservationResource(
  sectionCode: string,
  categoryCode: string,
  categoryDescription: string,
  observationCode: string,
  observationDescription: string,
  fhirBundle: Bundle,
  context: any
): Observation {
  const observation = fhirBundle.entry
    .map(({ resource }) => resource)
    .filter(isObservation)
    .find((entry) => {
      const obCoding =
        entry.code &&
        entry.code.coding &&
        entry.code.coding.find((obCode) => obCode.code === observationCode)
      if (obCoding) {
        return true
      }
      return false
    })

  if (observation) {
    return observation
  }

  /* Existing obseration not found for given type */
  return updateObservationInfo(
    createObservationResource(sectionCode, fhirBundle, context),
    categoryCode,
    categoryDescription,
    observationCode,
    observationDescription
  )
}

export function updateObservationInfo(
  observation: Observation,
  categoryCode: string,
  categoryDescription: string,
  observationCode: string,
  observationDescription: string
): Observation {
  const categoryCoding = {
    coding: [
      {
        system: FHIR_OBSERVATION_CATEGORY_URL,
        code: categoryCode,
        display: categoryDescription
      }
    ]
  }

  if (!observation.category) {
    observation.category = []
  }
  observation.category.push(categoryCoding)

  const coding = [
    {
      system: 'http://loinc.org',
      code: observationCode,
      display: observationDescription
    }
  ]
  setArrayPropInResourceObject(observation, 'code', coding, 'coding')
  return observation
}

export function selectObservationResource(
  observationCode: string,
  fhirBundle: Bundle
): Observation | undefined {
  let observation
  fhirBundle.entry.forEach((entry) => {
    if (
      !entry ||
      !entry.resource ||
      entry.resource.resourceType === 'Observation'
    ) {
      const observationEntry = entry.resource as Observation
      const obCoding =
        observationEntry.code &&
        observationEntry.code.coding &&
        observationEntry.code.coding.find(
          (obCode) => obCode.code === observationCode
        )
      if (obCoding) {
        observation = observationEntry
      }
    }
  })

  return observation
}

export async function removeObservationResource(
  observationCode: string,
  fhirBundle: Bundle
) {
  fhirBundle.entry.forEach((entry, index) => {
    if (
      !entry ||
      !entry.resource ||
      entry.resource.resourceType === 'Observation'
    ) {
      const observationEntry = entry.resource as Observation
      const obCoding =
        observationEntry.code &&
        observationEntry.code.coding &&
        observationEntry.code.coding.find(
          (obCode) => obCode.code === observationCode
        )
      if (obCoding) {
        fhirBundle.entry.splice(index, 1)
      }
    }
  })
}

export function createObservationResource(
  sectionCode: string,
  fhirBundle: Bundle,
  context: any
): Observation {
  const encounter = selectOrCreateEncounterResource(fhirBundle, context)
  const section = findCompositionSectionInBundle(sectionCode, fhirBundle)

  const ref = getUUID()
  const observationEntry = createObservationEntryTemplate(ref)
  if (!section || !section.entry || !section.entry[0]) {
    throw new Error('Expected encounter section to exist and have an entry')
  }
  const encounterSectionEntry = section.entry[0]
  const encounterEntry = fhirBundle.entry.find(
    (entry) => entry.fullUrl === encounterSectionEntry.reference
  )
  if (encounterEntry && encounter) {
    observationEntry.resource.context = {
      reference: `${encounterEntry.fullUrl}`
    }
  }
  fhirBundle.entry.push(observationEntry)

  return observationEntry.resource
}

export function selectOrCreateLocationRefResource(
  sectionCode: string,
  fhirBundle: Bundle,
  context: any
): Location {
  const isCorrection = [
    BIRTH_CORRECTION_ENCOUNTER_CODE,
    DEATH_CORRECTION_ENCOUNTER_CODE
  ].includes(sectionCode)
  const encounter = selectOrCreateEncounterResource(
    fhirBundle,
    context,
    isCorrection
  )

  if (!encounter.location) {
    // create location
    const locationRef = getUUID()
    const locationEntry = createLocationResource(locationRef)
    fhirBundle.entry.push(locationEntry)
    encounter.location = []
    encounter.location.push({
      location: { reference: `urn:uuid:${locationRef}` as URNReference }
    })
    return locationEntry.resource
  }

  if (!encounter.location || !encounter.location[0]) {
    throw new Error('Encounter is expected to have a location property')
  }

  const locationElement = encounter.location[0]
  const locationEntry = fhirBundle.entry.find(
    (entry): entry is BundleEntry<Location> =>
      entry.fullUrl === locationElement.location.reference
  )!

  if (!locationEntry) {
    throw new Error(
      'Location referenced from encounter section not found in FHIR bundle'
    )
  }
  return locationEntry.resource
}

export function selectOrCreateEncounterParticipant(
  fhirBundle: Bundle,
  context: any
) {
  const encounter = selectOrCreateEncounterResource(fhirBundle, context)
  if (!encounter.participant || !encounter.participant[0]) {
    encounter.participant = [{}]
  }
  return encounter.participant[0]
}

export function selectOrCreateEncounterPartitioner(
  fhirBundle: Bundle,
  context: any
): Practitioner {
  const encounterParticipant = selectOrCreateEncounterParticipant(
    fhirBundle,
    context
  ) as EncounterParticipant
  let practitioner
  if (
    !encounterParticipant.individual ||
    !encounterParticipant.individual.reference
  ) {
    const ref = getUUID()
    encounterParticipant.individual = {
      reference: `urn:uuid:${ref}` as URNReference
    }
    practitioner = createPractitionerEntryTemplate(ref)
    fhirBundle.entry.push(practitioner)
  } else {
    practitioner = fhirBundle.entry.find(
      (entry) => entry.fullUrl === encounterParticipant.individual?.reference
    )
    if (!practitioner) {
      throw new Error(
        'fhirBundle is expected to have an encounter practitioner entry'
      )
    }
  }
  return practitioner.resource as Practitioner
}

export function selectOrCreateEncounterLocationRef(
  fhirBundle: Bundle,
  context: any,
  correction?: boolean
): Reference {
  const encounter = selectOrCreateEncounterResource(
    fhirBundle,
    context,
    correction
  )
  if (!encounter.location) {
    encounter.location = []
    encounter.location.push({
      location: { reference: '' as URNReference } // @todo ask Euan about this
    })
  } else {
    if (!encounter.location || !encounter.location[0]) {
      throw new Error('Encounter is expected to have a location property')
    }
  }
  return encounter.location[0].location
}

export function selectOrCreateDocRefResource(
  sectionCode: CompositionSectionCode,
  sectionTitle: string,
  fhirBundle: Bundle,
  context: any,
  indexKey: string
): DocumentReference {
  const section = findCompositionSectionInBundle(sectionCode, fhirBundle)

  let docRef
  if (!section) {
    const ref = getUUID()
    const docSection = createSupportingDocumentsSection(
      sectionCode,
      sectionTitle
    )
    docSection.entry[context._index[indexKey]] = {
      reference: `urn:uuid:${ref}` as const
    }
    getComposition(fhirBundle).section.push(docSection)
    docRef = createDocRefTemplate(ref)
    fhirBundle.entry.push(docRef)
  } else {
    if (!section.entry) {
      throw new Error(
        'Expected supporting documents section to have an entry property'
      )
    }
    const docSectionEntry = section.entry[context._index[indexKey]]
    if (!docSectionEntry) {
      const ref = getUUID()
      section.entry[context._index[indexKey]] = {
        reference: `urn:uuid:${ref}` as URNReference
      }
      docRef = createDocRefTemplate(ref)
      fhirBundle.entry.push(docRef)
    } else {
      docRef = fhirBundle.entry.find(
        (entry) => entry.fullUrl === docSectionEntry.reference
      )
      if (!docRef) {
        const ref = getUUID()
        docRef = createDocRefTemplate(ref)
        fhirBundle.entry.push(docRef)
        section.entry[context._index[indexKey]] = {
          reference: `urn:uuid:${ref}` as URNReference
        }
      }
    }
  }

  return docRef.resource as DocumentReference
}

export function selectOrCreateCertificateDocRefResource(
  fhirBundle: Bundle,
  context: any,
  eventType: string,
  isCorrection?: boolean
) {
  const certificate = isCorrection
    ? ({
        code: CORRECTION_CERTIFICATE_DOCS_CODE,
        title: CORRECTION_CERTIFICATE_DOCS_TITLE,
        indexKey: CORRECTION_CERTIFICATE_DOCS_CONTEXT_KEY
      } as const)
    : ({
        code: CERTIFICATE_DOCS_CODE,
        title: CERTIFICATE_DOCS_TITLE,
        indexKey: CERTIFICATE_CONTEXT_KEY
      } as const)

  const docRef = selectOrCreateDocRefResource(
    certificate.code,
    certificate.title,
    fhirBundle,
    context,
    certificate.indexKey
  )
  if (!docRef.type?.coding) {
    docRef.type = {
      coding: [
        {
          system: `${OPENCRVS_SPECIFICATION_URL}certificate-type`,
          code: eventType
        }
      ]
    }
  }
  return docRef
}

export function selectOrCreateInformantSection(
  sectionCode:
    | typeof INFORMANT_CODE
    | typeof WITNESS_ONE_CODE
    | typeof WITNESS_TWO_CODE,
  sectionTitle: string,
  fhirBundle: Bundle
): RelatedPerson | PartialBy<RelatedPerson, 'patient'> {
  const section = findCompositionSectionInBundle(sectionCode, fhirBundle)

  if (!section) {
    // create person
    const ref = getUUID()
    const informantSection = createPersonSection(ref, sectionCode, sectionTitle)
    const composition = getComposition(fhirBundle)
    composition.section.push(informantSection)
    const informantEntry = createRelatedPersonTemplate(ref)
    fhirBundle.entry.push(informantEntry)
    return informantEntry.resource
  }
  if (!section.entry || !section.entry[0]) {
    throw new Error('Expected person section ot have an entry')
  }
  const personSectionEntry = section.entry[0]
  const informantEntry = fhirBundle.entry.find(
    (entry): entry is BundleEntry<RelatedPerson> =>
      entry.fullUrl === personSectionEntry.reference
  )
  if (!informantEntry) {
    throw new Error(
      'Informant referenced from composition section not found in FHIR bundle'
    )
  }

  return informantEntry.resource
}

export function selectOrCreateInformantResource(fhirBundle: Bundle): Patient {
  const relatedPersonResource = selectOrCreateInformantSection(
    INFORMANT_CODE,
    INFORMANT_TITLE,
    fhirBundle
  )

  const patientRef =
    relatedPersonResource.patient && relatedPersonResource.patient.reference
  if (!patientRef) {
    const personEntry = createPersonEntryTemplate(getUUID())
    fhirBundle.entry.push(personEntry)
    relatedPersonResource.patient = {
      reference: personEntry.fullUrl
    }
    return personEntry.resource
  } else {
    const personEntry = fhirBundle.entry.find(
      (entry): entry is BundleEntry<Patient> => entry.fullUrl === patientRef
    )
    if (!personEntry) {
      throw new Error(
        'No related informant person entry not found on fhir bundle'
      )
    }
    return personEntry.resource
  }
}

export function selectOrCreateWitnessResource(
  fhirBundle: Bundle,
  code: typeof WITNESS_ONE_CODE | typeof WITNESS_TWO_CODE,
  title: string
): Patient {
  const relatedPersonResource = selectOrCreateInformantSection(
    code,
    title,
    fhirBundle
  )
  const patientRef =
    relatedPersonResource.patient && relatedPersonResource.patient.reference
  if (!patientRef) {
    const personEntry = createPersonEntryTemplate(getUUID())
    fhirBundle.entry.push(personEntry)
    relatedPersonResource.patient = {
      reference: personEntry.fullUrl
    }
    return personEntry.resource as Patient
  } else {
    const personEntry = fhirBundle.entry.find(
      (entry) => entry.fullUrl === patientRef
    )
    if (!personEntry) {
      throw new Error(
        'No related informant person entry not found on fhir bundle'
      )
    }
    return personEntry.resource as Patient
  }
}

export function selectOrCreateRelatedPersonResource(
  fhirBundle: Bundle,
  context: any,
  eventType: string
): RelatedPerson | PartialBy<RelatedPerson, 'patient'> {
  const docRef = selectOrCreateCertificateDocRefResource(
    fhirBundle,
    context,
    eventType
  )
  if (!docRef.extension) {
    docRef.extension = []
  }
  const relatedPersonExt = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/collector`,
    docRef.extension
  )
  if (!relatedPersonExt) {
    const relatedPersonEntry = createRelatedPersonTemplate(getUUID())
    fhirBundle.entry.push(relatedPersonEntry)
    docRef.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/collector`,
      valueReference: {
        reference: relatedPersonEntry.fullUrl
      }
    })
    return relatedPersonEntry.resource
  } else {
    const relatedPersonEntry = fhirBundle.entry.find(
      (entry): entry is BundleEntry<RelatedPerson> => {
        if (!relatedPersonExt.valueReference) {
          return false
        }
        return entry.fullUrl === relatedPersonExt.valueReference.reference
      }
    )
    if (!relatedPersonEntry) {
      throw new Error('No related person entry found on bundle')
    }
    return relatedPersonEntry.resource
  }
}

export function selectOrCreateCollectorPersonResource(
  fhirBundle: Bundle,
  context: any,
  eventType: string
): Patient {
  const relatedPersonResource = selectOrCreateRelatedPersonResource(
    fhirBundle,
    context,
    eventType
  )
  const patientRef =
    relatedPersonResource.patient && relatedPersonResource.patient.reference
  if (!patientRef) {
    const personEntry = createPersonEntryTemplate(getUUID())
    fhirBundle.entry.push(personEntry)
    relatedPersonResource.patient = {
      reference: personEntry.fullUrl
    }
    return personEntry.resource as Patient
  } else {
    const personEntry = fhirBundle.entry.find(
      (entry) => entry.fullUrl === patientRef
    )
    if (!personEntry) {
      throw new Error(
        'No related collector person entry not found on fhir bundle'
      )
    }
    return personEntry.resource as Patient
  }
}

export async function setCertificateCollectorReference(
  sectionCode: string,
  relatedPerson: RelatedPerson | PartialBy<RelatedPerson, 'patient'>,
  fhirBundle: Bundle,
  context: any
) {
  const section = findCompositionSectionInBundle(sectionCode, fhirBundle)
  if (section && section.entry) {
    const personSectionEntry = section.entry[0]
    const personEntry = fhirBundle.entry.find(
      (entry): entry is Saved<BundleEntry<Patient>> =>
        entry.fullUrl === personSectionEntry.reference
    )
    if (!personEntry) {
      throw new Error('Expected person entry not found on the bundle')
    }
    relatedPerson.patient = {
      reference: personEntry.fullUrl
    }
  } else {
    const composition = getComposition(fhirBundle)

    const sec = findCompositionSection(sectionCode, composition)
    if (sec && sec.entry) {
      relatedPerson.patient = {
        reference: sec.entry[0].reference
      }
    }
  }
}

export function selectOrCreatePaymentReconciliationResource(
  fhirBundle: Bundle,
  context: any,
  eventType: string,
  isCorrection?: boolean
): PaymentReconciliation {
  const docRef = selectOrCreateCertificateDocRefResource(
    fhirBundle,
    context,
    eventType,
    isCorrection
  )
  if (!docRef.extension) {
    docRef.extension = []
  }
  const paymentExt = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/payment`,
    docRef.extension
  )
  if (!paymentExt) {
    const paymentEntry = createPaymentReconciliationTemplate(getUUID())
    fhirBundle.entry.push(paymentEntry)
    docRef.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/payment`,
      valueReference: {
        reference: paymentEntry.fullUrl
      }
    })
    return paymentEntry.resource
  } else {
    const paymentEntry = fhirBundle.entry.find((entry) => {
      if (!paymentExt.valueReference) {
        return false
      }
      return entry.fullUrl === paymentExt.valueReference.reference
    })
    if (!paymentEntry) {
      throw new Error('No related payment entry found on bundle')
    }
    return paymentEntry.resource as PaymentReconciliation
  }
}

export function selectOrCreateQuestionnaireResource(
  sectionCode: string,
  fhirBundle: Bundle,
  context: any
): QuestionnaireResponse {
  const questionnaire = fhirBundle.entry.find((entry) => {
    if (
      !entry ||
      !entry.resource ||
      entry.resource.resourceType !== 'QuestionnaireResponse'
    ) {
      return false
    } else {
      return true
    }
  })

  if (questionnaire) {
    return questionnaire.resource as QuestionnaireResponse
  }

  const encounter = selectOrCreateEncounterResource(fhirBundle, context)
  const section = findCompositionSectionInBundle(sectionCode, fhirBundle)

  const ref = getUUID()
  const questionnaireResponseEntry = createQuestionnaireResponseTemplate(ref)
  if (!section || !section.entry || !section.entry[0]) {
    throw new Error('Expected encounter section to exist and have an entry')
  }
  const encounterSectionEntry = section.entry[0]
  const encounterEntry = fhirBundle.entry.find(
    (entry) => entry.fullUrl === encounterSectionEntry.reference
  )
  if (encounterEntry && encounter) {
    questionnaireResponseEntry.resource.subject = {
      reference: `${encounterEntry.fullUrl}`
    }
  }
  fhirBundle.entry.push(questionnaireResponseEntry)

  return questionnaireResponseEntry.resource
}

export function selectOrCreateTaskRefResource(
  fhirBundle: Bundle,
  context: any
) {
  const taskEntry =
    fhirBundle.entry &&
    fhirBundle.entry.find((entry): entry is BundleEntry<Task> => {
      if (entry.resource && entry.resource.resourceType === 'Task') {
        return true
      }
      return false
    })

  if (!taskEntry) {
    const unsavedTaskEntry = createTaskRefTemplate(getUUID(), context.event)
    const taskResource = unsavedTaskEntry.resource
    if (!taskResource.focus) {
      taskResource.focus = { reference: '' }
    }

    taskResource.focus.reference = fhirBundle.entry[0].fullUrl
    fhirBundle.entry.push(unsavedTaskEntry)
    return unsavedTaskEntry.resource
  }
  return taskEntry.resource
}

type ItemType<T> = T extends Array<infer U> ? U : never

type KeysWithArrayValues<T> = {
  [K in keyof T]: T[K] extends any[] | undefined ? K : never
}[keyof T]

type TakeIdentifierHackIntoAccount<KeyOfResource, ExpectedType> =
  KeyOfResource extends 'identifier'
    ? ExpectedType extends CodeableConcept
      ? string
      : ExpectedType
    : ExpectedType

export function setObjectPropInResourceArray<
  ResourceType extends Resource,
  KeyOfResource extends KeysWithArrayValues<ResourceType>,
  NestedKey extends keyof ItemType<ResourceType[KeyOfResource]>,
  QueryContext extends {
    _index: Partial<Record<KeyOfResource, number>>
  }
>(
  resource: ResourceType,
  label: KeyOfResource,
  value: ResourceType[KeyOfResource] extends Array<infer U> | undefined
    ? NestedKey extends keyof U
      ? TakeIdentifierHackIntoAccount<KeyOfResource, U[NestedKey]>
      : never
    : never,
  propName: NestedKey,
  context: QueryContext,
  contextProperty?: KeyOfResource
) {
  type ArrayInResourceKeys = ResourceType[KeyOfResource]
  type ArrayItem = ArrayInResourceKeys[keyof ArrayInResourceKeys]
  if (!resource[label]) {
    resource[label] = [] as ArrayInResourceKeys
  }

  if (contextProperty) {
    const arrayIndex = context._index[
      contextProperty
    ] as keyof ArrayInResourceKeys

    if (!resource[label][arrayIndex]) {
      resource[label][arrayIndex] = {} as ArrayItem
    }
    resource[label][arrayIndex][propName as keyof ArrayItem] = value
  } else {
    const indexLabel = context._index[label] as keyof ArrayInResourceKeys
    if (!resource[label][indexLabel]) {
      resource[label][indexLabel] = {} as ArrayItem
    }
    if (label === 'identifier' && propName === 'type') {
      resource[label][indexLabel][propName as keyof ArrayItem] = {
        coding: [
          {
            system: `${OPENCRVS_SPECIFICATION_URL}identifier-type`,
            code: value
          }
        ]
      } as ArrayItem[keyof ArrayItem]
    } else {
      resource[label][indexLabel][propName as keyof ArrayItem] = value
    }
  }
}

export function setQuestionnaireItem(
  questionnaire: QuestionnaireResponse,
  context: any,
  label: string | null,
  value: string | null
) {
  if (!questionnaire.item) {
    questionnaire.item = []
  }

  if (label && !questionnaire.item[context._index.questionnaire]) {
    questionnaire.item[context._index.questionnaire] = {
      text: label,
      linkId: ''
    }
  }

  if (value && questionnaire.item[context._index.questionnaire]) {
    questionnaire.item[context._index.questionnaire].answer = [
      { valueString: value }
    ]
  }
}

export function setArrayPropInResourceObject<
  T extends Resource,
  L extends keyof T
>(resource: T, label: L, value: Array<{}>, propName: string) {
  if (!resource[label]) {
    resource[label] = {} as T[L]
  }
  resource[label][propName as keyof T[L]] = value as T[L][keyof T[L]]
}

export function getDownloadedExtensionStatus(task: Task) {
  const extension =
    task.extension && findExtension(DOWNLOADED_EXTENSION_URL, task.extension)
  return extension?.valueString
}

export function getMaritalStatusCode(fieldValue: string) {
  switch (fieldValue) {
    case 'SINGLE':
      return 'S'
    case 'WIDOWED':
      return 'W'
    case 'DIVORCED':
      return 'D'
    case 'NOT_STATED':
      return 'UNK'
    case 'MARRIED':
      return 'M'
    case 'SEPARATED':
      return 'L'
    default:
      return 'UNK'
  }
}

export function setInformantReference(
  sectionCode: CompositionSectionCode,
  sectionTitle: string,
  relatedPerson: RelatedPerson | PartialBy<RelatedPerson, 'patient'>,
  fhirBundle: Bundle,
  context: any
) {
  selectOrCreatePersonResource(sectionCode, sectionTitle, fhirBundle)
  const section = findCompositionSectionInBundle(sectionCode, fhirBundle)
  if (!section?.entry) {
    throw new Error(`${sectionCode} not found in composition!`)
  }
  const personSectionEntry = section.entry[0]
  const personEntry = fhirBundle.entry.find(
    (entry): entry is Saved<BundleEntry<Patient>> =>
      entry.fullUrl === personSectionEntry.reference
  )
  if (!personEntry) {
    return
  }
  relatedPerson.patient = {
    reference: personEntry.fullUrl
  }
}

export function hasRequestCorrectionExtension(task: Task) {
  const extension =
    task.extension &&
    findExtension(MAKE_CORRECTION_EXTENSION_URL, task.extension)
  return extension
}
