import { v4 as uuid } from 'uuid'
import {
  createMotherSection,
  createFatherSection,
  createChildSection,
  createPersonEntryTemplate
} from 'src/features/fhir/templates'

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
        break
      default:
        throw new Error(`Unknown section code ${sectionCode}`)
    }
    fhirBundle.entry[0].resource.section.push(personSection)
    personEntry = createPersonEntryTemplate(ref)
    fhirBundle.entry.push(personEntry)
    context.motherRef = ref
  } else {
    personEntry = fhirBundle.entry.find(
      (entry: any) => entry.fullUrl === section.entry[0].reference
    )
  }

  return personEntry.resource
}

export function createAndSetNameProperty(
  resource: any,
  value: string | string[],
  propName: string,
  context: any
) {
  if (!resource.name) {
    resource.name = []
  }
  if (!resource.name[context._index]) {
    resource.name[context._index] = {}
  }
  resource.name[context._index][propName] = value
}
