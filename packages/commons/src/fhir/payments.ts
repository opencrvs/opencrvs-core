import { BundleEntry, Resource, Saved, Unsaved } from '.'

export type PaymentReconciliation = Saved<fhir3.PaymentReconciliation>

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
