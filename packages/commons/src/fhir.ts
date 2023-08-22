export type TaskWithoutId = Omit<fhir.Task, 'id'>
export type CompositionWithoutId = Omit<fhir.Composition, 'id'>
export type Extension = fhir.Extension
export type BusinessStatus = Omit<fhir.CodeableConcept, 'coding'> & {
  coding: fhir.Coding[]
}

export type Task = Omit<TaskWithoutId, 'extension' | 'businessStatus'> & {
  id: string
  lastModified: string
  extension: Array<Extension>
  businessStatus: BusinessStatus
}

export type Composition = CompositionWithoutId & { id: string }
type Resource =
  | (Omit<fhir.Resource, 'resourceType'> & { resourceType: string })
  | Task

export type BundleEntry<T extends Resource = Resource> = Omit<
  fhir.BundleEntry,
  'resource'
> & {
  resource: T
}

export type Bundle<T extends Resource = Resource> = Omit<
  fhir.Bundle,
  'entry'
> & {
  entry: Array<BundleEntry<T>>
}

export type BundleEntryWithFullUrl = Omit<fhir.BundleEntry, 'fullUrl'> & {
  fullUrl: string
}

export function isCorrectionRequestedTask(task: Task) {
  return task.businessStatus.coding.some(
    ({ code }) => code === 'CORRECTION_REQUESTED'
  )
}
