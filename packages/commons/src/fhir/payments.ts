/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
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
