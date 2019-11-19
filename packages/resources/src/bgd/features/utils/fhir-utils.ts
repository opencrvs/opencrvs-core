/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
export function getTaskResource(
  bundle: fhir.Bundle & fhir.BundleEntry
): fhir.Task | undefined {
  if (
    !bundle ||
    bundle.type !== 'document' ||
    !bundle.entry ||
    !bundle.entry[0].resource
  ) {
    throw new Error('Invalid FHIR bundle found')
  }

  if (bundle.entry[0].resource.resourceType === 'Composition') {
    return getTaskResourceFromFhirBundle(bundle as fhir.Bundle)
  } else if (bundle.entry[0].resource.resourceType === 'Task') {
    return bundle.entry[0].resource as fhir.Task
  } else {
    throw new Error('Unable to find Task Bundle from the provided data')
  }
}

export function getTaskResourceFromFhirBundle(fhirBundle: fhir.Bundle) {
  const taskEntry =
    fhirBundle.entry &&
    fhirBundle.entry.find((entry: fhir.BundleEntry) => {
      if (entry.resource && entry.resource.resourceType === 'Task') {
        return true
      }
      return false
    })
  return taskEntry && (taskEntry.resource as fhir.Task)
}

export function findExtension(
  url: string,
  extensions: fhir.Extension[]
): fhir.Extension | undefined {
  const extension = extensions.find((obj: fhir.Extension) => {
    return obj.url === url
  })
  return extension
}
