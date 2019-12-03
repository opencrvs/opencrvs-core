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
import { generateRegistrationNumber } from '@resources/bgd/features/generate/service'
import {
  getTaskResource,
  findExtension,
  getTrackingIdFromTaskResource
} from '@resources/bgd/features/utils/fhir-utils'
import {
  OPENCRVS_SPECIFICATION_URL,
  getFromFhir
} from '@resources/bgd/features/utils'

export async function createWebHookResponseFromBundle(bundle: fhir.Bundle) {
  const taskResource = getTaskResource(bundle)

  if (!taskResource || !taskResource.extension) {
    throw new Error(
      'Failed to validate registration: could not find task resource in bundle or task resource had no extensions'
    )
  }

  const trackingId = getTrackingIdFromTaskResource(taskResource)
  const practitionerRefExt = findExtension(
    `${OPENCRVS_SPECIFICATION_URL}extension/regLastUser`,
    taskResource.extension
  )

  if (
    !practitionerRefExt ||
    !practitionerRefExt.valueReference ||
    !practitionerRefExt.valueReference.reference
  ) {
    throw new Error(
      'Failed to validate registration: practitioner reference not found in task resource'
    )
  }

  const practitioner = await getFromFhir(
    practitionerRefExt.valueReference.reference
  )

  return {
    trackingId,
    registrationNumber: await generateRegistrationNumber(practitioner.id)
  }
}
