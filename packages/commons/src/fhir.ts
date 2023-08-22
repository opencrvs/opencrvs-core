export type TaskWithoutId = Omit<fhir.Task, 'id'>
export type CompositionWithoutId = Omit<fhir.Composition, 'id'>
export type Extension = fhir.Extension
export type Task = Omit<TaskWithoutId, 'extension'> & {
  id: string
  lastModified: string
  extension: Array<Extension>
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
