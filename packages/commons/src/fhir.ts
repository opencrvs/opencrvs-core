import { UUID } from './uuid'

/*
 * These types should always strictly match the data formats
 * that OpenCRVS stores in its database.
 * If we know a field always exists, it should not be optional even if its optional in FHIR spec.
 */

type Saved<T> = Omit<T, 'id'> & {
  id: string
}

export type UnsavedResource<T extends Resource> = Omit<T, 'id'>

export type Unsaved<T extends BundleEntry> = Omit<T, 'fullUrl' | 'resource'> & {
  fullUrl: `urn:uuid:${UUID}`
  resource: UnsavedResource<T['resource']>
}

export type OpenCRVSPatientName = Omit<fhir3.HumanName, 'use' | 'family'> & {
  use: string
  family: string[]
}

export type OpenCRVSPractitionerName = Omit<fhir3.HumanName, 'use'> & {
  use: string
}

type Address = Omit<fhir3.Address, 'type'> & {
  type: 'SECONDARY_ADDRESS' | 'PRIMARY_ADDRESS'
}

export type CompositionWithoutId = Omit<fhir3.Composition, 'id'>
export type Extension = fhir3.Extension
export type Practitioner = Omit<fhir3.Practitioner, 'name'> & {
  name: Array<OpenCRVSPractitionerName>
}

export type BusinessStatus = Omit<fhir3.CodeableConcept, 'coding'> & {
  coding: fhir3.Coding[]
}

export type TaskWithoutId = Omit<fhir3.Task, 'id'>

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

export type Composition = CompositionWithoutId & { id: string }

export type PaymentReconciliation = Saved<fhir3.PaymentReconciliation>
export type DocumentReference = Saved<Omit<fhir3.DocumentReference, 'indexed'>>
export type Patient = Saved<
  Omit<fhir3.Patient, 'name' | 'address'> & {
    name: Array<OpenCRVSPatientName>
    address?: Address[]
    deceased?: boolean
  }
>
export type RelatedPerson = Saved<fhir3.RelatedPerson>
export type Location = Saved<fhir3.Location>
export type Encounter = Saved<fhir3.Encounter>
export type Observation = Saved<
  Omit<fhir3.Observation, 'valueQuantity'> & {
    valueQuantity?: Omit<fhir3.Quantity, 'value'> & {
      // Birth plurality of Pregnancy
      // { value: 'TWIN' }
      value: number | string
    }
  }
>

export type Resource = fhir3.Resource

export type BundleEntry<T extends Resource = Resource> = Omit<
  fhir3.BundleEntry,
  'resource'
> & {
  resource: T
}

export type StrictBundle<T extends Resource[]> = Omit<fhir3.Bundle, 'entry'> & {
  entry: { [Property in keyof T]: BundleEntry<T[Property]> }
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
