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
  changeState,
  EVENT_TYPE,
  KnownExtensionType,
  Resource,
  resourceToSavedBundleEntry,
  StringExtensionType,
  Task
} from '@opencrvs/commons/types'
import { getToken, getTokenPayload } from '@workflow/utils/auth-utils'
import { indexBundle } from '@workflow/records/search'
import { sendBundleToHearth, toSavedBundle } from '@workflow/records/fhir'
import {
  getLocationOrOfficeById,
  getSystem
} from '@workflow/features/user/utils'
import { internal } from '@hapi/boom'
import { getTaskResourceFromFhirBundle } from '@workflow/features/registration/fhir/fhir-template'
import { auditEvent } from '@workflow/records/audit'
import {
  generateTrackingIdForEvents,
  getEventType
} from '@workflow/features/registration/utils'
import { getFromFhir } from '@workflow/features/registration/fhir/fhir-utils'

export async function eventNotificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const bundle = request.payload as Bundle<Resource>
  const token = getToken(request)

  const unsavedTask = getTaskResourceFromFhirBundle(bundle)

  const tokenPayload = getTokenPayload(token)
  const system = await getSystem(tokenPayload.sub, {
    Authorization: `Bearer ${token}`
  })

  const practitioner = await getFromFhir(
    `/Practitioner/${system.practitionerId}`
  )

  const { name, username, type } = system
  const systemInformationJSON = { name, username, type }

  const taskWithRegLastUser = addExtensionsToTask(unsavedTask, [
    {
      url: 'http://opencrvs.org/specs/extension/regLastUser',
      valueReference: {
        reference: `Practitioner/${practitioner.id}`
      }
    }
  ])

  const event = getEventType(bundle)
  const trackingId = await generateTrackingIdForEvents(event, bundle, token)

  const taskWithRegLastUserAndStatus: Task = {
    ...taskWithRegLastUser,
    lastModified: new Date().toISOString(),
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: 'IN_PROGRESS'
        }
      ]
    },
    identifier: [
      ...taskWithRegLastUser.identifier,
      {
        system: `http://opencrvs.org/specs/id/${
          event.toLowerCase() as Lowercase<EVENT_TYPE>
        }-tracking-id`,
        value: trackingId
      },
      {
        system: 'http://opencrvs.org/specs/id/system_identifier',
        value: JSON.stringify(systemInformationJSON)
      }
    ]
  }

  const officeExtension = taskWithRegLastUserAndStatus.extension.find(
    (e) => e.url === 'http://opencrvs.org/specs/extension/regLastOffice'
  ) as
    | StringExtensionType['http://opencrvs.org/specs/extension/regLastOffice']
    | undefined

  const officeId = officeExtension?.valueReference.reference.split('/')[1]

  if (!officeId) throw internal('Office id not found in bundle')

  const officeLocationExtension = taskWithRegLastUserAndStatus.extension.find(
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
    ...bundle,
    entry: [
      ...bundle.entry.filter((e) => e.resource.resourceType !== 'Task'),
      {
        fullUrl: bundle.entry.find((e) => e.resource.resourceType === 'Task')
          ?.fullUrl,
        resource: taskWithRegLastUserAndStatus
      },
      ...[office, officeLocation, practitioner].map((r) =>
        resourceToSavedBundleEntry(r)
      )
    ]
  }

  const responseBundle = await sendBundleToHearth(
    savedBundleWithRegLastUserAndBusinessStatus
  )
  const savedBundle = toSavedBundle(
    savedBundleWithRegLastUserAndBusinessStatus,
    responseBundle
  )

  const record = changeState(savedBundle, ['IN_PROGRESS', 'READY_FOR_REVIEW'])

  await indexBundle(record, token)
  await auditEvent('sent-notification', record, token)

  return h.response(responseBundle).code(200)
}
