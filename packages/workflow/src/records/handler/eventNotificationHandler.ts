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
  addExtensionsToTask,
  Bundle,
  getTaskFromSavedBundle,
  SavedTask,
  ValidRecord
} from '@opencrvs/commons/types'
import { getToken } from '@workflow/utils/auth-utils'
import { indexBundle } from '@workflow/records/search'
import { sendBundleToHearth, toSavedBundle } from '@workflow/records/fhir'
import { getLoggedInPractitionerResource } from '@workflow/features/user/utils'

export async function eventNotificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as Bundle
  const token = getToken(request)

  const responseBundle = await sendBundleToHearth(payload)
  const savedBundle = toSavedBundle(payload, responseBundle) as ValidRecord

  const task = getTaskFromSavedBundle(savedBundle) as SavedTask
  const system = await getLoggedInPractitionerResource(token)

  const savedTaskWithRegLastUser = addExtensionsToTask(task, [
    {
      url: 'http://opencrvs.org/specs/extension/regLastUser',
      valueReference: {
        reference: `Practitioner/${system.id}`
      }
    }
  ]) as SavedTask

  const savedBundleWithRegLastUser = {
    ...savedBundle,
    entry: [
      ...savedBundle.entry.filter((e) => e.resource.resourceType !== 'Task'),
      {
        fullUrl: savedBundle.entry.find(
          (e) => e.resource.resourceType === 'Task'
        )?.fullUrl,
        resource: savedTaskWithRegLastUser
      }
    ]
  } as ValidRecord

  await indexBundle(savedBundleWithRegLastUser, token)
}
