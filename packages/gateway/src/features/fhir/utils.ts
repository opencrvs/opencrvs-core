import { v4 as uuid } from 'uuid'
import {
  createMotherSection,
  createFatherSection,
  createChildSection,
  createPersonEntryTemplate,
  createEncounterSection,
  createEncounter,
  createLocationResource
} from 'src/features/fhir/templates'
import { IExtension } from 'src/type/person'

export function findCompositionSectionInBundle(code: string, fhirBundle: any) {
  return fhirBundle.entry[0].resource.section.find(
    (section: any) => section.code.coding.code === code
  )
}

export function findCompositionSection(code: string, composition: any) {
  return composition.section.find(
    (section: any) => section.code.coding.code === code
  )
}

export function selectOrCreatePersonResource(
  sectionCode: string,
  fhirBundle: any,
  context: any
) {
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
      default:
        throw new Error(`Unknown section code ${sectionCode}`)
    }
    fhirBundle.entry[0].resource.section.push(personSection)
    personEntry = createPersonEntryTemplate(ref)
    fhirBundle.entry.push(personEntry)
  } else {
    personEntry = fhirBundle.entry.find(
      (entry: any) => entry.fullUrl === section.entry[0].reference
    )
  }

  return personEntry.resource
}

export function selectOrCreateEncounter(
  sectionCode: string,
  fhirBundle: any,
  context: any,
  locationRef: string
) {
  const section = findCompositionSection(sectionCode, fhirBundle)
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
    encounterEntry = createEncounter(ref, locationRef)
    fhirBundle.entry.push(encounterEntry)
  } else {
    encounterEntry = fhirBundle.entry.find(
      (entry: any) => entry.fullUrl === section[0].reference
    )
  }
  return encounterEntry.resource
}

export function selectOrCreateLocation(
  sectionCode: string,
  fhirBundle: any,
  context: any
) {
  const section = findCompositionSection(sectionCode, fhirBundle)
  let encounterEntry
  if (!section) {
    const locationRef = uuid()
    const locationEntry = createLocationResource(locationRef)
    fhirBundle.entry.push(locationEntry)
    encounterEntry = selectOrCreateEncounter(
      sectionCode,
      fhirBundle,
      context,
      locationRef
    )
  } else {
    encounterEntry = fhirBundle.entry.find(
      (entry: any) => entry.fullUrl === section[0].reference
    )
  }

  return encounterEntry.resource.location
}

export function setObjectPropInResourceArray(
  resource: any,
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

export function findExtension(url: string, composition: any): IExtension {
  const extension = composition.find((obj: IExtension) => {
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
