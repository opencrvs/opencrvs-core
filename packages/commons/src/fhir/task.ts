import { Nominal } from 'src/nominal'
import { Bundle, BusinessStatus, Extension, Resource, Saved } from '.'

export type TrackingID = Nominal<string, 'TrackingID'>
export type RegistrationNumber = Nominal<string, 'RegistrationNumber'>

type TaskIdentifier =
  | {
      system: 'http://opencrvs.org/specs/id/mosip-aid'
      value: string
    }
  | {
      system: 'http://opencrvs.org/specs/id/draft-id'
      value: string
    }
  | {
      system: 'http://opencrvs.org/specs/id/birth-tracking-id'
      value: TrackingID
    }
  | {
      system: 'http://opencrvs.org/specs/id/death-tracking-id'
      value: TrackingID
    }
  | {
      system: 'http://opencrvs.org/specs/id/marriage-tracking-id'
      value: TrackingID
    }
  | {
      system: 'http://opencrvs.org/specs/id/birth-registration-number'
      value: RegistrationNumber
    }
  | {
      system: 'http://opencrvs.org/specs/id/death-registration-number'
      value: RegistrationNumber
    }
  | {
      system: 'http://opencrvs.org/specs/id/marriage-registration-number'
      value: RegistrationNumber
    }
  | {
      system: 'http://opencrvs.org/specs/id/system_identifier'
      value: string
    }
  | {
      system: 'http://opencrvs.org/specs/id/paper-form-id'
      value: string
    }

type ExtractSystem<T> = T extends { system: string } ? T['system'] : never
type AllSystems = ExtractSystem<TaskIdentifier>
type AfterLastSlash<S extends string> =
  S extends `${infer _Start}/${infer Rest}` ? AfterLastSlash<Rest> : S
export type TaskIdentifierSystemType = AfterLastSlash<AllSystems>

export type Task = Omit<
  Saved<fhir3.Task>,
  'extension' | 'businessStatus' | 'code' | 'intent' | 'identifier'
> & {
  id: string
  lastModified: string
  extension: Array<Extension>
  businessStatus: BusinessStatus
  intent?: fhir3.Task['intent']
  identifier: Array<TaskIdentifier>
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
