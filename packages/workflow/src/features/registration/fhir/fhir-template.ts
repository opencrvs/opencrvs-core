import { v4 as uuid } from 'uuid'
import { OPENCRVS_SPECIFICATION_URL } from '../constants'

export function selectOrCreateTaskRefResource(
  fhirBundle: fhir.Bundle
): fhir.Task {
  let taskResource = getTaskResource(fhirBundle)
  if (!taskResource) {
    taskResource = createTaskRefTemplate()
    if (!fhirBundle.entry) {
      fhirBundle.entry = []
    }
    fhirBundle.entry.push(taskResource)
  }
  return taskResource.resource as fhir.Task
}

export function getTaskResource(fhirBundle: fhir.Bundle) {
  return (
    fhirBundle.entry &&
    fhirBundle.entry.find(entry => {
      if (entry.resource && entry.resource.resourceType === 'Task') {
        return true
      }
      return false
    })
  )
}

function createTaskRefTemplate() {
  return {
    fullUrl: `urn:uuid:${uuid()}`,
    resource: {
      resourceType: 'Task',
      status: 'requested',
      code: {
        coding: [
          {
            system: `${OPENCRVS_SPECIFICATION_URL}types`,
            code: 'birth-registration'
          }
        ]
      }
    }
  }
}

export function findPersonEntry(
  sectionCode: string,
  fhirBundle: fhir.Bundle
): fhir.Patient {
  const composition =
    fhirBundle &&
    fhirBundle.entry &&
    (fhirBundle.entry[0].resource as fhir.Composition)

  const personSection =
    composition &&
    composition.section &&
    composition.section.find((section: fhir.CompositionSection) => {
      if (!section.code || !section.code.coding) {
        return false
      }
      return section.code.coding.some(coding => coding.code === sectionCode)
    })

  if (!personSection || !personSection.entry) {
    throw new Error(
      `Ivalid person section not found for given code: ${sectionCode}`
    )
  }
  const personSectionEntry = personSection.entry[0]
  const personEntry =
    fhirBundle.entry &&
    fhirBundle.entry.find(
      entry => entry.fullUrl === personSectionEntry.reference
    )

  if (!personEntry) {
    throw new Error(
      'Patient referenced from composition section not found in FHIR bundle'
    )
  }
  return personEntry.resource as fhir.Patient
}
