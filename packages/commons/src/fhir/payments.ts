import { BundleEntry, Resource } from '.'

export type PaymentReconciliationDetail = fhir3.PaymentReconciliationDetail

export type PaymentReconciliation = fhir3.PaymentReconciliation
export type Money = fhir3.Money

export function isPaymentReconciliation(
  resource: Resource
): resource is PaymentReconciliation {
  return resource.resourceType === 'PaymentReconciliation'
}

export function isPaymentReconciliationBundleEntry(
  entry: BundleEntry
): entry is BundleEntry<PaymentReconciliation> {
  return entry.fullUrl?.startsWith('urn:uuid:')
    ? isPaymentReconciliation(entry.resource)
    : false
}
