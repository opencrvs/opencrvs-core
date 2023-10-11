import { BundleEntry, Resource, Unsaved } from '.'

export type PaymentReconciliationDetail = fhir3.PaymentReconciliationDetail

export type PaymentReconciliation = fhir3.PaymentReconciliation
export type Money = fhir3.Money

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
