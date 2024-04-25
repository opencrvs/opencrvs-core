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
  KnownExtensionType,
  resourceToSavedBundleEntry,
  SavedTask,
  StringExtensionType,
  ValidRecord
} from '@opencrvs/commons/types'
import { getToken } from '@workflow/utils/auth-utils'
import { indexBundle } from '@workflow/records/search'
import { sendBundleToHearth, toSavedBundle } from '@workflow/records/fhir'
import {
  getLocationOrOfficeById,
  getLoggedInPractitionerResource
} from '@workflow/features/user/utils'
import { internal } from '@hapi/boom'

export async function eventNotificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as Bundle
  const token = getToken(request)

  const responseBundle = await sendBundleToHearth(payload)
  const savedBundle = toSavedBundle(payload, responseBundle) as ValidRecord

  const task = getTaskFromSavedBundle(savedBundle) as SavedTask
  const systemInfo = await getLoggedInPractitionerResource(token)

  const savedTaskWithRegLastUser = addExtensionsToTask(task, [
    {
      url: 'http://opencrvs.org/specs/extension/regLastUser',
      valueReference: {
        reference: `Practitioner/${systemInfo.id}`
      }
    }
  ]) as SavedTask

  const savedTask: SavedTask = {
    ...savedTaskWithRegLastUser,
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: 'IN_PROGRESS'
        }
      ]
    }
  }

  const officeExtension = savedTask.extension.find(
    (e) => e.url === 'http://opencrvs.org/specs/extension/regLastOffice'
  ) as
    | StringExtensionType['http://opencrvs.org/specs/extension/regLastOffice']
    | undefined

  const officeId = officeExtension?.valueReference.reference.split('/')[1]

  if (!officeId) throw internal('Office id not found in bundle')

  const officeLocationExtension = savedTaskWithRegLastUser.extension.find(
    (e) => e.url === 'http://opencrvs.org/specs/extension/regLastLocation'
  ) as
    | KnownExtensionType['http://opencrvs.org/specs/extension/regLastLocation']
    | undefined

  const officeLocationId =
    officeLocationExtension?.valueReference.reference.split('/')[1]

  if (!officeLocationId)
    throw internal('Office location id not found in bundle')

  const office = await getLocationOrOfficeById(officeId)
  const officeLocation = await getLocationOrOfficeById(officeLocationId)

  const savedBundleWithRegLastUserAndBusinessStatus = {
    ...savedBundle,
    entry: [
      ...savedBundle.entry.filter((e) => e.resource.resourceType !== 'Task'),
      {
        fullUrl: savedBundle.entry.find(
          (e) => e.resource.resourceType === 'Task'
        )?.fullUrl,
        resource: savedTask
      },
      ...[office, officeLocation].map((r) => resourceToSavedBundleEntry(r))
    ]
  } as ValidRecord

  await indexBundle(savedBundleWithRegLastUserAndBusinessStatus, token)

  return h.response(savedBundleWithRegLastUserAndBusinessStatus).code(200)
}
