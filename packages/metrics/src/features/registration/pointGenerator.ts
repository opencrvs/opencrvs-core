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
import {
  IBirthRegistrationPoint,
  IPointLocation,
  IAuthHeader,
  IBirthRegistrationTags
} from '@metrics/features/registration'
import {
  getSectionBySectionCode,
  getRegLastLocation,
  getTask,
  getPreviousTask,
  getComposition,
  APPLICATION_STATUS,
  getApplicationStatus,
  getTimeLoggedFromTask,
  getApplicationType,
  getPaymentReconciliation
} from '@metrics/features/registration/fhirUtils'
import {
  getAgeInDays,
  getDurationInSeconds
} from '@metrics/features/registration/utils'
import { OPENCRVS_SPECIFICATION_URL } from '@metrics/features/registration/metrics/constants'
import { fetchParentLocationByLocationID } from '@metrics/api'

export const generateInCompleteFieldPoints = async (
  payload: fhir.Bundle,
  authHeader: IAuthHeader
) => {
  const composition = getComposition(payload)
  const task = getTask(payload)
  const inCompleteFieldExtension =
    task &&
    task.extension &&
    task.extension.find(
      extension =>
        extension.url ===
        `${OPENCRVS_SPECIFICATION_URL}extension/in-complete-fields`
    )

  if (!composition) {
    throw new Error('Composition not found')
  }
  if (!inCompleteFieldExtension || !inCompleteFieldExtension.valueString) {
    throw new Error('In complete field list extension not found on payload')
  }

  const tags = {
    reg_status: 'IN_PROGESS',
    compositionId: composition.id,
    ...(await generatePointLocations(payload, authHeader))
  }
  return inCompleteFieldExtension.valueString.split(',').map(missingFieldId => {
    const missingFieldIds = missingFieldId.split('/')
    return {
      measurement: 'in_complete_fields',
      tags,
      fields: {
        missing_field_section_id: missingFieldIds[0],
        missing_field_group_id: missingFieldIds[1],
        missing_field_id: missingFieldIds[2]
      }
    }
  })
}

export const generateBirthRegPoint = async (
  payload: fhir.Bundle,
  regStatus: string,
  authHeader: IAuthHeader
) => {
  const child: fhir.Patient = getSectionBySectionCode(payload, 'child-details')
  if (!child) {
    throw new Error('No child found!')
  }

  const fields: IBirthRegistrationPoint = {
    current_status: 'registered',
    age_in_days: child.birthDate ? getAgeInDays(child.birthDate) : undefined,
    ...(await generatePointLocations(payload, authHeader))
  }

  const tags: IBirthRegistrationTags = {
    reg_status: regStatus,
    gender: child.gender
  }

  const point = {
    measurement: 'birth_reg',
    tags,
    fields
  }

  return point
}

const generatePointLocations = async (
  payload: fhir.Bundle,
  authHeader: IAuthHeader
): Promise<IPointLocation> => {
  const locations: IPointLocation = {}
  const locationLevel5 = getRegLastLocation(payload)
  if (!locationLevel5) {
    return locations
  }
  locations.locationLevel5 = locationLevel5
  let locationID: string = locations.locationLevel5

  // tslint:disable-next-line no-increment-decrement
  for (let index = 4; index > 1; index--) {
    locationID = await fetchParentLocationByLocationID(locationID, authHeader)
    if (!locationID) {
      break
    }
    locations[`locationLevel${index}`] = locationID
  }

  return locations
}

export async function generatePaymentPoint(payload: fhir.Bundle) {
  const reconciliation = getPaymentReconciliation(payload)
  const composition = getComposition(payload)
  if (!composition) {
    throw new Error('Composition not found')
  }
  if (!reconciliation) {
    throw new Error('Payment reconciliation not found')
  }

  const fields = {
    total: reconciliation.total,
    application_id: composition.id
  }

  const tags = {}

  return {
    measurement: 'certification_payment',
    tags,
    fields
  }
}

export async function generateEventDurationPoint(
  payload: fhir.Bundle,
  allowedPreviousStates: APPLICATION_STATUS[],
  authHeader: IAuthHeader
) {
  const composition = getComposition(payload)
  const currentTask = getTask(payload)

  if (!composition) {
    throw new Error('Composition not found')
  }

  if (!currentTask || !currentTask.lastModified) {
    throw new Error('Current task not found')
  }
  const previousTask = await getPreviousTask(
    currentTask,
    allowedPreviousStates,
    authHeader
  )

  if (!previousTask || !previousTask.lastModified) {
    throw new Error('Previous task not found')
  }

  const fields = {
    duration_in_seconds: getDurationInSeconds(
      previousTask.lastModified,
      currentTask.lastModified
    ),
    application_id: composition.id,
    current_task_id: currentTask.id,
    previous_task_id: previousTask.id
  }

  const tags = {
    current_status: getApplicationStatus(currentTask),
    previous_status: getApplicationStatus(previousTask),
    event_type: getApplicationType(currentTask)
  }

  return {
    measurement: 'application_event_duration',
    tags,
    fields
  }
}

export function generateTimeLoggedPoint(payload: fhir.Bundle) {
  const composition = getComposition(payload)
  const currentTask = getTask(payload)

  if (!composition) {
    throw new Error('Composition not found')
  }
  if (!currentTask) {
    throw new Error('Current task not found')
  }

  const fields = {
    time_spent_editing: getTimeLoggedFromTask(currentTask),
    application_id: composition.id
  }

  const tags = {
    current_status: getApplicationStatus(currentTask),
    event_type: getApplicationType(currentTask)
  }

  return {
    measurement: 'application_time_logged',
    tags,
    fields
  }
}
