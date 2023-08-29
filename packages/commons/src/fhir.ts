import { UUID } from './uuid'

type Saved<T> = Omit<T, 'id'> & {
  id: string
}

export type Unsaved<T extends BundleEntry> = Omit<T, 'fullUrl' | 'resource'> & {
  fullUrl: `urn:uuid:${UUID}`
  resource: Omit<T['resource'], 'id'>
}

export type CompositionWithoutId = Omit<fhir3.Composition, 'id'>
export type Extension = fhir3.Extension
export type Practitioner = fhir3.Practitioner
export type BusinessStatus = Omit<fhir3.CodeableConcept, 'coding'> & {
  coding: fhir3.Coding[]
}

export type TaskWithoutId = Omit<fhir3.Task, 'id'>

export type Task = Omit<Saved<fhir3.Task>, 'extension' | 'businessStatus'> & {
  id: string
  lastModified: string
  extension: Array<Extension>
  businessStatus: BusinessStatus
  // This field is missing from the fhir3 spec
  encounter: fhir3.Reference
}

export type Composition = CompositionWithoutId & { id: string }

export type PaymentReconciliation = Saved<fhir3.PaymentReconciliation>
export type DocumentReference = Saved<fhir3.DocumentReference>
export type Patient = Saved<fhir3.Patient>
export type RelatedPerson = Saved<fhir3.RelatedPerson>
export type Location = Saved<fhir3.Location>

export type Resource = fhir3.Resource

export type BundleEntry<T extends Resource = Resource> = Omit<
  fhir3.BundleEntry,
  'resource'
> & {
  resource: T
}

export type Bundle<T extends Resource = Resource> = Omit<
  fhir3.Bundle,
  'entry'
> & {
  entry: Array<BundleEntry<T>>
}

export type BundleEntryWithFullUrl = Omit<fhir3.BundleEntry, 'fullUrl'> & {
  fullUrl: string
}

export type CorrectionRequestedTask = Omit<Task, 'encounter'> & {
  encounter: {
    reference: string
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

export function isComposition(resource: Resource): resource is Composition {
  return resource.resourceType === 'Composition'
}

export function isEncounter(resource: Resource): resource is fhir3.Encounter {
  return resource.resourceType === 'Encounter'
}

export function isRelatedPerson(
  resource: Resource
): resource is fhir3.RelatedPerson {
  return resource.resourceType === 'RelatedPerson'
}

export function isTask(resource: Resource): resource is Task {
  return resource.resourceType === 'Task'
}

export function isPaymentReconciliation(
  resource: Resource
): resource is PaymentReconciliation {
  return resource.resourceType === 'PaymentReconciliation'
}

export function isUnsavedPaymentReconciliationBundleEntry(
  entry: Unsaved<BundleEntry>
): entry is Unsaved<BundleEntry<PaymentReconciliation>> {
  return (
    entry.fullUrl.startsWith('urn:uuid:') &&
    isPaymentReconciliation(entry.resource)
  )
}

export function getTaskFromBundle(bundle: Bundle): Task {
  const task = bundle.entry.map(({ resource }) => resource).find(isTask)

  if (!task) {
    throw new Error('No task found in bundle')
  }
  return task
}

type KnownExtensionType = {
  'http://opencrvs.org/specs/extension/paymentDetails': {
    url: 'http://opencrvs.org/specs/extension/paymentDetails'
    valueReference: {
      reference: string
    }
  }
}

export function findExtension<T extends keyof KnownExtensionType>(
  url: T,
  extensions: fhir3.Extension[]
): KnownExtensionType[T] | undefined {
  return extensions.find(
    (obj: fhir3.Extension): obj is KnownExtensionType[T] => {
      return obj.url === url
    }
  )
}
export function sortTasksDescending(tasks: Task[]) {
  return tasks.slice().sort((a, b) => {
    return (
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
  })
}
