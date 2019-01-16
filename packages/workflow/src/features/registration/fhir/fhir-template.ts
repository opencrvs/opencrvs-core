import { v4 as uuid } from 'uuid'
import { OPENCRVS_SPECIFICATION_URL } from './constants'

export function getTaskResource(bundle: fhir.Bundle & fhir.BundleEntry) {
  if (
    !bundle ||
    bundle.type !== 'document' ||
    !bundle.entry ||
    !bundle.entry[0].resource
  ) {
    throw new Error('Invalid FHIR bundle found')
  }

  if (bundle.entry[0].resource.resourceType === 'Composition') {
    return selectOrCreateTaskRefResource(bundle as fhir.Bundle)
  } else if (bundle.entry[0].resource.resourceType === 'Task') {
    return bundle.entry[0].resource
  } else {
    throw new Error('Unable to find Task Bundle from the provided data')
  }
}

export function selectOrCreateTaskRefResource(fhirBundle: fhir.Bundle) {
  let taskResource = getTaskResourceFromFhirBundle(fhirBundle) as fhir.Task
  if (!taskResource) {
    const taskEntry = createTaskRefTemplate()
    if (!fhirBundle.entry) {
      fhirBundle.entry = []
    }
    taskResource = taskEntry.resource as fhir.Task
    if (!taskResource.focus) {
      taskResource.focus = { reference: '' }
    }
    taskResource.focus.reference = fhirBundle.entry[0].fullUrl
    fhirBundle.entry.push(taskEntry)
  }
  return taskResource
}

export function getTaskResourceFromFhirBundle(fhirBundle: fhir.Bundle) {
  const taskEntry =
    fhirBundle.entry &&
    fhirBundle.entry.find(entry => {
      if (entry.resource && entry.resource.resourceType === 'Task') {
        return true
      }
      return false
    })
  return taskEntry && taskEntry.resource
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
      `Invalid person section found for given code: ${sectionCode}`
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
