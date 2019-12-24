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
  IBirthRegistrationFields,
  IDeathRegistrationFields,
  IInProgressApplicationFields,
  ITimeLoggedFields,
  IDurationFields,
  IPaymentFields,
  IPointLocation,
  IAuthHeader,
  IBirthRegistrationTags,
  IDeathRegistrationTags,
  IInProgressApplicationTags,
  ITimeLoggedTags,
  IDurationTags,
  IPoints,
  IPaymentPoints
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
  getPaymentReconciliation,
  getObservationValueByCode,
  MANNER_OF_DEATH_CODE,
  CAUSE_OF_DEATH_CODE
} from '@metrics/features/registration/fhirUtils'
import {
  getAgeInDays,
  getAgeInYears,
  getDurationInSeconds
} from '@metrics/features/registration/utils'
import { OPENCRVS_SPECIFICATION_URL } from '@metrics/features/metrics/constants'
import { fetchParentLocationByLocationID } from '@metrics/api'

export const generateInCompleteFieldPoints = async (
  payload: fhir.Bundle,
  authHeader: IAuthHeader
): Promise<IPoints[]> => {
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
  if (!task) {
    throw new Error('Task not found')
  }

  const fields: IInProgressApplicationFields = {
    compositionId: composition.id,
    ...(await generatePointLocations(payload, authHeader))
  }
  return inCompleteFieldExtension.valueString.split(',').map(missingFieldId => {
    const missingFieldIds = missingFieldId.split('/')
    const tags: IInProgressApplicationTags = {
      missingFieldSectionId: missingFieldIds[0],
      missingFieldGroupId: missingFieldIds[1],
      missingFieldId: missingFieldIds[2],
      eventType: getApplicationType(task) as string,
      regStatus: 'IN_PROGESS'
    }
    return {
      measurement: 'in_complete_fields',
      tags,
      fields
    }
  })
}

export const generateBirthRegPoint = async (
  payload: fhir.Bundle,
  regStatus: string,
  authHeader: IAuthHeader
): Promise<IPoints> => {
  const child: fhir.Patient = getSectionBySectionCode(payload, 'child-details')
  if (!child) {
    throw new Error('No child found!')
  }

  const composition = getComposition(payload)
  if (!composition) {
    throw new Error('Composition not found')
  }

  const fields: IBirthRegistrationFields = {
    compositionId: composition.id,
    ageInDays: child.birthDate ? getAgeInDays(child.birthDate) : undefined
  }

  const tags: IBirthRegistrationTags = {
    regStatus: regStatus,
    gender: child.gender,
    ...(await generatePointLocations(payload, authHeader))
  }

  const point = {
    measurement: 'birth_reg',
    tags,
    fields
  }

  return point
}

export const generateDeathRegPoint = async (
  payload: fhir.Bundle,
  regStatus: string,
  authHeader: IAuthHeader
): Promise<IPoints> => {
  const deceased: fhir.Patient = getSectionBySectionCode(
    payload,
    'deceased-details'
  )

  const composition = getComposition(payload)
  if (!composition) {
    throw new Error('Composition not found')
  }

  const fields: IDeathRegistrationFields = {
    compositionId: composition.id,
    ageInYears: deceased.birthDate
      ? getAgeInYears(deceased.birthDate)
      : undefined,
    deathDays: deceased.deceasedDateTime
      ? getAgeInDays(deceased.deceasedDateTime)
      : undefined
  }

  const tags: IDeathRegistrationTags = {
    regStatus: regStatus,
    gender: deceased.gender,
    mannerOfDeath: getObservationValueByCode(payload, MANNER_OF_DEATH_CODE),
    causeOfDeath: getObservationValueByCode(payload, CAUSE_OF_DEATH_CODE),
    ...(await generatePointLocations(payload, authHeader))
  }

  const point = {
    measurement: 'death_reg',
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

export async function generatePaymentPoint(
  payload: fhir.Bundle,
  authHeader: IAuthHeader
): Promise<IPaymentPoints> {
  const reconciliation = getPaymentReconciliation(payload)
  const composition = getComposition(payload)
  const task = getTask(payload)
  if (!task) {
    throw new Error('Task not found')
  }
  if (!composition) {
    throw new Error('Composition not found')
  }
  if (!reconciliation) {
    throw new Error('Payment reconciliation not found')
  }

  const total = reconciliation.total as number

  const fields: IPaymentFields = {
    total,
    compositionId: composition.id
  }

  const tags = await generatePointLocations(payload, authHeader)

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
): Promise<IPoints> {
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

  const fields: IDurationFields = {
    durationInSeconds: getDurationInSeconds(
      previousTask.lastModified,
      currentTask.lastModified
    ),
    compositionId: composition.id,
    currentTaskId: currentTask.id,
    previousTaskId: previousTask.id
  }

  const tags: IDurationTags = {
    currentStatus: getApplicationStatus(currentTask) as string,
    previousStatus: getApplicationStatus(previousTask) as string,
    eventType: getApplicationType(currentTask) as string
  }

  return {
    measurement: 'application_event_duration',
    tags,
    fields
  }
}

export function generateTimeLoggedPoint(payload: fhir.Bundle): IPoints {
  const composition = getComposition(payload)
  const currentTask = getTask(payload)

  if (!composition) {
    throw new Error('Composition not found')
  }
  if (!currentTask) {
    throw new Error('Current task not found')
  }

  const fields: ITimeLoggedFields = {
    timeSpentEditing: getTimeLoggedFromTask(currentTask),
    compositionId: composition.id
  }

  const tags: ITimeLoggedTags = {
    currentStatus: getApplicationStatus(currentTask) as string,
    eventType: getApplicationType(currentTask) as string
  }

  return {
    measurement: 'application_time_logged',
    tags,
    fields
  }
}
