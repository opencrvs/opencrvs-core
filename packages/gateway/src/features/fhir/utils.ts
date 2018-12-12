import { v4 as uuid } from 'uuid'
import {
  createMotherSection,
  createFatherSection,
  createChildSection,
  createPersonEntryTemplate,
  createEncounterSection,
  createEncounter,
  createLocationResource,
  createObservationEntryTemplate,
  createSupportingDocumentsSection,
  createDocRefTemplate,
  createTaskRefTemplate
} from 'src/features/fhir/templates'
import {
  ITemplatedBundle,
  ITemplatedComposition
} from '../registration/fhir-builders'
import fetch from 'node-fetch'
import { fhirUrl } from 'src/constants'
import { FHIR_OBSERVATION_CATEGORY_URL } from './constants'

export function findCompositionSectionInBundle(
  code: string,
  fhirBundle: ITemplatedBundle
) {
  return findCompositionSection(code, fhirBundle.entry[0].resource)
}

export function findCompositionSection(
  code: string,
  composition: ITemplatedComposition
) {
  return composition.section.find((section: fhir.CompositionSection) => {
    if (!section.code || !section.code.coding || !section.code.coding.some) {
      return false
    }
    return section.code.coding.some(coding => coding.code === code)
  })
}

export function selectOrCreatePersonResource(
  sectionCode: string,
  fhirBundle: ITemplatedBundle
): fhir.Patient {
  const section = findCompositionSectionInBundle(sectionCode, fhirBundle)

  let personEntry
  if (!section) {
    // create person
    const ref = uuid()
    let personSection
    switch (sectionCode) {
      case 'mother-details':
        personSection = createMotherSection(ref)
        break
      case 'father-details':
        personSection = createFatherSection(ref)
        break
      case 'child-details':
        personSection = createChildSection(ref)
        break
      default:
        throw new Error(`Unknown section code ${sectionCode}`)
    }
    const composition = fhirBundle.entry[0].resource
    composition.section.push(personSection)
    personEntry = createPersonEntryTemplate(ref)
    fhirBundle.entry.push(personEntry)
  } else {
    if (!section.entry || !section.entry[0]) {
      throw new Error('Expected person section ot have an entry')
    }
    const personSectionEntry = section.entry[0]
    personEntry = fhirBundle.entry.find(
      entry => entry.fullUrl === personSectionEntry.reference
    )
  }

  if (!personEntry) {
    throw new Error(
      'Patient referenced from composition section not found in FHIR bundle'
    )
  }

  return personEntry.resource as fhir.Patient
}

export function selectOrCreateEncounterResource(
  sectionCode: string,
  fhirBundle: ITemplatedBundle
): fhir.Encounter {
  const section = findCompositionSectionInBundle(sectionCode, fhirBundle)
  let encounterEntry

  if (!section) {
    const ref = uuid()
    let encounterSection
    if (sectionCode === 'birth-encounter') {
      encounterSection = createEncounterSection(ref)
    } else {
      throw new Error(`Unknown section code ${sectionCode}`)
    }
    fhirBundle.entry[0].resource.section.push(encounterSection)
    encounterEntry = createEncounter(ref)
    fhirBundle.entry.push(encounterEntry)
  } else {
    if (!section.entry || !section.entry[0]) {
      throw new Error('Expected encounter section to have an entry')
    }
    const encounterSectionEntry = section.entry[0]
    encounterEntry = fhirBundle.entry.find(
      entry => entry.fullUrl === encounterSectionEntry.reference
    )
  }

  if (!encounterEntry) {
    throw new Error(
      'Encounter referenced from composition section not found in FHIR bundle'
    )
  }

  return encounterEntry.resource as fhir.Encounter
}

export function selectOrCreateObservationResource(
  sectionCode: string,
  categoryCode: string,
  categoryDescription: string,
  observationCode: string,
  observationDescription: string,
  fhirBundle: ITemplatedBundle,
  context: any
): fhir.Observation {
  let observation = fhirBundle.entry.find(entry => {
    if (
      !entry ||
      !entry.resource ||
      entry.resource.resourceType !== 'Observation'
    ) {
      return false
    }
    const observationEntry = entry.resource as fhir.Observation
    const obCoding =
      observationEntry.code &&
      observationEntry.code.coding &&
      observationEntry.code.coding.find(
        obCode => obCode.code === observationCode
      )
    if (obCoding) {
      return true
    }
    return false
  })

  if (observation) {
    return observation.resource as fhir.Observation
  }
  /* Existing obseration not found for given type */
  observation = createObservationResource(sectionCode, fhirBundle, context)
  return updateObservationInfo(
    observation as fhir.Observation,
    categoryCode,
    categoryDescription,
    observationCode,
    observationDescription
  )
}

export function updateObservationInfo(
  observation: fhir.Observation,
  categoryCode: string,
  categoryDescription: string,
  observationCode: string,
  observationDescription: string
): fhir.Observation {
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

export function createObservationResource(
  sectionCode: string,
  fhirBundle: ITemplatedBundle,
  context: any
): fhir.Observation {
  const encounter = selectOrCreateEncounterResource(sectionCode, fhirBundle)
  const section = findCompositionSectionInBundle(sectionCode, fhirBundle)

  const ref = uuid()
  const observationEntry = createObservationEntryTemplate(ref)

  if (!section || !section.entry || !section.entry[0]) {
    throw new Error('Expected encounter section to exist and have an entry')
  }
  const encounterSectionEntry = section.entry[0]
  const encounterEntry = fhirBundle.entry.find(
    entry => entry.fullUrl === encounterSectionEntry.reference
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
  fhirBundle: ITemplatedBundle,
  context: any
): fhir.Location {
  let locationEntry

  const encounter = selectOrCreateEncounterResource(sectionCode, fhirBundle)

  if (!encounter.location) {
    // create location
    const locationRef = uuid()
    locationEntry = createLocationResource(locationRef)
    fhirBundle.entry.push(locationEntry)
    encounter.location = []
    encounter.location.push({
      location: { reference: `urn:uuid:${locationRef}` }
    })
  } else {
    if (!encounter.location || !encounter.location[0]) {
      throw new Error('Encounter is expected to have a location property')
    }
    const locationElement = encounter.location[0]
    locationEntry = fhirBundle.entry.find(
      entry => entry.fullUrl === locationElement.location.reference
    )
  }

  if (!locationEntry) {
    throw new Error(
      'Location referenced from encounter section not found in FHIR bundle'
    )
  }

  return locationEntry.resource as fhir.Location
}

export function selectOrCreateDocRefResource(
  sectionCode: string,
  fhirBundle: ITemplatedBundle,
  context: any
): fhir.DocumentReference {
  const section = findCompositionSectionInBundle(sectionCode, fhirBundle)

  let docRef
  if (!section) {
    const ref = uuid()
    const docSection = createSupportingDocumentsSection()
    docSection.entry[context._index.attachments] = {
      reference: `urn:uuid:${ref}`
    }
    fhirBundle.entry[0].resource.section.push(docSection)
    docRef = createDocRefTemplate(ref)
    fhirBundle.entry.push(docRef)
  } else {
    if (!section.entry) {
      throw new Error(
        'Expected supporting documents section to have an entry property'
      )
    }
    const docSectionEntry = section.entry[context._index.attachments]
    if (!docSectionEntry) {
      const ref = uuid()
      section.entry[context._index.attachments] = {
        reference: `urn:uuid:${ref}`
      }
      docRef = createDocRefTemplate(ref)
      fhirBundle.entry.push(docRef)
    } else {
      docRef = fhirBundle.entry.find(
        entry => entry.fullUrl === docSectionEntry.reference
      )
      if (!docRef) {
        const ref = uuid()
        docRef = createDocRefTemplate(ref)
        fhirBundle.entry.push(docRef)
        section.entry[context._index.attachments] = {
          reference: `urn:uuid:${ref}`
        }
      }
    }
  }

  return docRef.resource as fhir.DocumentReference
}

export function selectOrCreateTaskRefResource(
  fhirBundle: ITemplatedBundle,
  context: any
): fhir.Task {
  let taskResource =
    fhirBundle.entry &&
    fhirBundle.entry.find(entry => {
      if (entry.resource && entry.resource.resourceType === 'Task') {
        return true
      }
      return false
    })
  if (!taskResource) {
    taskResource = createTaskRefTemplate(uuid())
    fhirBundle.entry.push(taskResource)
  }
  return taskResource.resource as fhir.Task
}

export function setObjectPropInResourceArray(
  resource: fhir.Resource,
  label: string,
  value: string | string[],
  propName: string,
  context: any
) {
  if (!resource[label]) {
    resource[label] = []
  }
  if (!resource[label][context._index[label]]) {
    resource[label][context._index[label]] = {}
  }
  resource[label][context._index[label]][propName] = value
}

export function setArrayPropInResourceObject(
  resource: fhir.Resource,
  label: string,
  value: Array<{}>,
  propName: string
) {
  if (!resource[label]) {
    resource[label] = {}
  }
  resource[label][propName] = value
}

export function findExtension(
  url: string,
  extensions: fhir.Extension[]
): fhir.Extension | undefined {
  const extension = extensions.find((obj: fhir.Extension) => {
    return obj.url === url
  })
  return extension
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
    default:
      return 'UNK'
  }
}

export const getFromFhir = (suffix: string) => {
  return fetch(`${fhirUrl}${suffix}`, {
    headers: {
      'Content-Type': 'application/json+fhir'
    }
  })
    .then(response => {
      return response.json()
    })
    .catch(error => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
    })
}
