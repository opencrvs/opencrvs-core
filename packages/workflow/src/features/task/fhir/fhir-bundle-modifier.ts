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
import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'
import {
  setupLastRegUser,
  setupLastRegLocation,
  setupAuthorOnNotes,
  checkForDuplicateStatusUpdate
} from '@workflow/features/registration/fhir/fhir-bundle-modifier'
import { getTaskResource } from '@workflow/features/registration/fhir/fhir-template'

export async function modifyTaskBundle(fhirBundle: fhir.Bundle, token: string) {
  if (
    !fhirBundle ||
    !fhirBundle.entry ||
    !fhirBundle.entry[0] ||
    !fhirBundle.entry[0].resource
  ) {
    throw new Error('Invalid FHIR bundle found for task')
  }
  // Checking for duplicate status update
  await checkForDuplicateStatusUpdate(fhirBundle.entry[0].resource as fhir.Task)

  const taskResource = getTaskResource(fhirBundle)
  const practitioner = await getLoggedInPractitionerResource(token)
  /* setting lastRegUser here */
  setupLastRegUser(taskResource, practitioner)

  /* setting lastRegLocation here */
  await setupLastRegLocation(taskResource, practitioner)

  /* setting author and time on notes here */
  setupAuthorOnNotes(taskResource, practitioner)

  return fhirBundle
}
