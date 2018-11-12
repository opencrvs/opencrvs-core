import { v4 as uuid } from 'uuid'

export function selectOrCreateTaskRefResource(
  fhirBundle: fhir.Bundle
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
    taskResource = createTaskRefTemplate()
    if (!fhirBundle.entry) {
      fhirBundle.entry = []
    }
    fhirBundle.entry.push(taskResource)
  }
  return taskResource.resource as fhir.Task
}

export function createTaskRefTemplate() {
  return {
    fullUrl: `urn:uuid:${uuid()}`,
    resource: {
      resourceType: 'Task',
      status: 'requested',
      code: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/types',
            code: 'birth-registration'
          }
        ]
      }
    }
  }
}
