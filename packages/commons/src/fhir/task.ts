import { Bundle, BusinessStatus, Extension, Resource, Saved } from '.'

export type Task = Omit<
  Saved<fhir3.Task>,
  'extension' | 'businessStatus' | 'code' | 'intent'
> & {
  id: string
  lastModified: string
  extension: Array<Extension>
  businessStatus: BusinessStatus
  intent?: fhir3.Task['intent']
  code: Omit<fhir3.CodeableConcept, 'coding'> & {
    coding: Array<
      Omit<fhir3.Coding, 'code' | 'system'> & {
        system: 'http://opencrvs.org/specs/types'
        code: 'BIRTH' | 'DEATH' | 'MARRIAGE'
      }
    >
  }
  // This field is missing from the fhir3 spec
  // @todo Where exactly it's used?
  encounter?: fhir3.Reference
}

export type CorrectionRequestedTask = Omit<Task, 'encounter' | 'requester'> & {
  encounter: {
    reference: string
  }
  requester: {
    agent: { reference: `Practitioner/${string}` }
  }
}

export function isCorrectionRequestedTask(
  task: Task
): task is CorrectionRequestedTask {
  return task.businessStatus.coding.some(
    ({ code }) => code === 'CORRECTION_REQUESTED'
  )
}

export function getBusinessStatus(task: Task) {
  const code = task.businessStatus.coding.find(({ code }) => code)
  if (!code) {
    throw new Error('No business status code found')
  }
  return code.code
}

export function isTask(resource: Resource): resource is Task {
  return resource.resourceType === 'Task'
}

export function getTaskFromBundle(bundle: Bundle): Task {
  const task = bundle.entry.map(({ resource }) => resource).find(isTask)

  if (!task) {
    throw new Error('No task found in bundle')
  }
  return task
}

export function sortTasksDescending(tasks: Task[]) {
  return tasks.slice().sort((a, b) => {
    return (
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
  })
}
