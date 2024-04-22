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
import * as Hapi from '@hapi/hapi'
import {
  Bundle,
  getTaskFromSavedBundle,
  ValidRecord
} from '@opencrvs/commons/types'
import { getToken } from '@workflow/utils/auth-utils'
import {
  createEventNotificationTask,
  mergeChangedResourcesIntoRecord,
  withPractitionerDetails
} from '@workflow/records/fhir'
import { indexBundle } from '@workflow/records/search'

export async function eventNotificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as ValidRecord
  const token = getToken(request)

  const previousTask = getTaskFromSavedBundle(payload)

  const updatedTaskWithoutPractitionerExtensions =
    createEventNotificationTask(previousTask)

  const [taskWithLocation, practitionerResourcesBundle] =
    await withPractitionerDetails(
      updatedTaskWithoutPractitionerExtensions,
      token
    )

  const unsavedChangedResources: Bundle = {
    type: 'document',
    resourceType: 'Bundle',
    entry: [{ resource: taskWithLocation }]
  }

  const responseBundle = await mergeChangedResourcesIntoRecord(
    payload,
    unsavedChangedResources,
    practitionerResourcesBundle
  )

  await indexBundle(responseBundle, token)
}
