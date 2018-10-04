import { v4 as uuid } from 'uuid'
import {
  createMotherSection,
  createFatherSection,
  createChildSection,
  createPersonEntryTemplate
} from 'src/features/fhir/templates'

export function findCompositionSection(code: string, accumulatedObj: any) {
  return accumulatedObj.entry[0].resource.section.find(
    (section: any) => section.code.coding.code === code
  )
}

export function selectOrCreatePersonResource(
  sectionCode: string,
  accumulatedObj: any,
  context: any
) {
  const section = findCompositionSection(sectionCode, accumulatedObj)

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
    accumulatedObj.entry[0].resource.section.push(personSection)
    personEntry = createPersonEntryTemplate(ref)
    accumulatedObj.entry.push(personEntry)
    context.motherRef = ref
  } else {
    personEntry = accumulatedObj.entry.find(
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
