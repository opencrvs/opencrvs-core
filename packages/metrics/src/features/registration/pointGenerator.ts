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
  IInProgressDeclarationFields,
  ITimeLoggedFields,
  IDeclarationsStartedFields,
  IRejectedFields,
  IDurationFields,
  IPaymentFields,
  IPointLocation,
  IAuthHeader,
  IBirthRegistrationTags,
  IDeathRegistrationTags,
  IInProgressDeclarationTags,
  ITimeLoggedTags,
  IDurationTags,
  ILocationTags,
  IPoints,
  IPaymentPoints,
  IDeclarationsStartedPoints,
  IRejectedPoints,
  ICorrectionPoint
} from '@metrics/features/registration'
import {
  getSectionBySectionCode,
  getRegLastLocation,
  getTask,
  getPreviousTask,
  getComposition,
  DECLARATION_STATUS,
  getDeclarationStatus,
  getTimeLoggedFromTask,
  getDeclarationType,
  getStartedByFieldAgent,
  getPaymentReconciliation,
  getObservationValueByCode,
  isNotification,
  MANNER_OF_DEATH_CODE,
  CAUSE_OF_DEATH_CODE,
  getPractionerIdFromTask,
  getTrackingId,
  getRegLastOffice,
  getEncounterLocationType,
  getPractitionerIdFromBundle,
  fetchDeclarationsBeginnerRole
} from '@metrics/features/registration/fhirUtils'
import {
  getAgeInDays,
  getAgeInYears,
  getDurationInSeconds,
  getDurationInDays,
  getTimeLabel,
  getAgeLabel
} from '@metrics/features/registration/utils'
import {
  OPENCRVS_SPECIFICATION_URL,
  Events
} from '@metrics/features/metrics/constants'
import { fetchParentLocationByLocationID, fetchTaskHistory } from '@metrics/api'
import { EVENT_TYPE } from '@metrics/features/metrics/utils'

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
      (extension) =>
        extension.url ===
        `${OPENCRVS_SPECIFICATION_URL}extension/in-complete-fields`
    )
  if (!composition) {
    throw new Error('Composition not found')
  }
  if (!inCompleteFieldExtension || !inCompleteFieldExtension.valueString) {
    throw new Error('In complete field list extension not found on payload')
  }
  /**
   * Avoid generating points when value is N/A
   * Ex: For health birth/death notifications, we will receive N/A as value
   */
  if (inCompleteFieldExtension.valueString === 'N/A') {
    return []
  }
  if (!task) {
    throw new Error('Task not found')
  }

  const fields: IInProgressDeclarationFields = {
    compositionId: composition.id
  }
  const locationTags: ILocationTags = await generatePointLocations(
    payload,
    authHeader
  )

  return inCompleteFieldExtension.valueString
    .split(',')
    .map((missingFieldId) => {
      const missingFieldIds = missingFieldId.split('/')
      const tags: IInProgressDeclarationTags = {
        missingFieldSectionId: missingFieldIds[0],
        missingFieldGroupId: missingFieldIds[1],
        missingFieldId: missingFieldIds[2],
        eventType: getDeclarationType(task),
        regStatus: 'IN_PROGESS',
        ...locationTags
      }
      return {
        measurement: 'in_complete_fields',
        tags,
        fields,
        timestamp: toInfluxTimestamp(task.lastModified)
      }
    })
}

function toInfluxTimestamp(date?: Date | string) {
  if (!date) {
    return undefined
  }
  return new Date(date).valueOf() * 1000000
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

  const practitionerId = getPractitionerIdFromBundle(payload)

  if (!practitionerId) {
    throw new Error('Practitioner id not found')
  }

  const practitionerRole = await fetchDeclarationsBeginnerRole(
    payload,
    authHeader
  )

  const ageInDays =
    (child.birthDate &&
      getAgeInDays(child.birthDate, new Date(composition.date))) ||
    undefined

  const fields: IBirthRegistrationFields = {
    compositionId: composition.id,
    ageInDays
  }

  const tags: IBirthRegistrationTags = {
    regStatus: regStatus,
    eventLocationType: await getEncounterLocationType(payload, authHeader),
    gender: child.gender,
    practitionerRole,
    ageLabel: (ageInDays && getAgeLabel(ageInDays)) || undefined,
    timeLabel:
      (ageInDays && (await getTimeLabel(ageInDays, EVENT_TYPE.BIRTH))) ||
      undefined,
    officeLocation: getRegLastOffice(payload),
    ...(await generatePointLocations(payload, authHeader))
  }

  const point = {
    measurement: 'birth_reg',
    tags,
    fields,
    timestamp: toInfluxTimestamp(composition.date)
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

  const practitionerId = getPractitionerIdFromBundle(payload)

  if (!practitionerId) {
    throw new Error('Practitioner id not found')
  }

  const practitionerRole = await fetchDeclarationsBeginnerRole(
    payload,
    authHeader
  )

  const deathDays =
    (deceased.deceasedDateTime &&
      getDurationInDays(
        deceased.deceasedDateTime,
        new Date(composition.date).toISOString()
      )) ||
    undefined
  const fields: IDeathRegistrationFields = {
    compositionId: composition.id,
    ageInYears:
      (deceased.birthDate &&
        getAgeInYears(deceased.birthDate, new Date(composition.date))) ||
      undefined,
    deathDays
  }
  const deceasedAgeInDays =
    (deceased.birthDate &&
      getAgeInDays(deceased.birthDate, new Date(composition.date))) ||
    undefined
  const tags: IDeathRegistrationTags = {
    regStatus: regStatus,
    gender: deceased.gender,
    practitionerRole,
    ageLabel:
      (deceasedAgeInDays && getAgeLabel(deceasedAgeInDays)) || undefined,
    timeLabel:
      (deathDays && (await getTimeLabel(deathDays, EVENT_TYPE.DEATH))) ||
      undefined,
    eventLocationType: await getEncounterLocationType(payload, authHeader),
    mannerOfDeath: getObservationValueByCode(payload, MANNER_OF_DEATH_CODE),
    causeOfDeath: getObservationValueByCode(payload, CAUSE_OF_DEATH_CODE),
    officeLocation: getRegLastOffice(payload),
    ...(await generatePointLocations(payload, authHeader))
  }

  const point = {
    measurement: 'death_reg',
    tags,
    fields,
    timestamp: new Date(composition.date).valueOf() * 1000000
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
    if (!locationID || locationID === 'Location/0') {
      break
    }
    locations[`locationLevel${index}`] = locationID
  }

  return locations
}

export async function generateCorrectionReasonPoint(
  payload: fhir.Bundle,
  authHeader: IAuthHeader
): Promise<ICorrectionPoint> {
  const composition = getComposition(payload)
  const task = getTask(payload)
  if (!task) {
    throw new Error('Task not found')
  }
  if (!composition) {
    throw new Error('Composition not found')
  }
  if (!task.reason) {
    throw new Error("Tasks didn't include a reason field")
  }

  const reason = task.reason.text

  const fields = {
    compositionId: composition.id
  }

  const tags = {
    eventType: getDeclarationType(task),
    officeLocation: getRegLastOffice(payload),
    reason: reason || 'UNKNOWN',
    ...(await generatePointLocations(payload, authHeader))
  }

  return {
    measurement: 'correction',
    tags,
    fields,
    timestamp: toInfluxTimestamp(task.lastModified)
  }
}
export async function generatePaymentPoint(
  payload: fhir.Bundle,
  authHeader: IAuthHeader,
  paymentType: 'certification' | 'correction'
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

  const tags = {
    eventType: getDeclarationType(task),
    officeLocation: getRegLastOffice(payload),
    paymentType,
    ...(await generatePointLocations(payload, authHeader))
  }

  return {
    measurement: 'payment',
    tags,
    fields,
    timestamp: toInfluxTimestamp(reconciliation.created)
  }
}

export async function generateEventDurationPoint(
  payload: fhir.Bundle,
  allowedPreviousStates: DECLARATION_STATUS[],
  authHeader: IAuthHeader,
  fromTask?: boolean
): Promise<IPoints> {
  const currentTask = getTask(payload)
  let compositionId
  if (!fromTask) {
    const composition = getComposition(payload)
    if (!composition) {
      throw new Error('composition not found')
    }
    compositionId = composition.id
  } else {
    compositionId = currentTask?.focus?.reference?.split('/')[1]
  }

  if (!compositionId) {
    throw new Error('CompositionId not found')
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
    compositionId: compositionId,
    currentTaskId: currentTask.id,
    previousTaskId: previousTask.id
  }

  const tags: IDurationTags = {
    currentStatus: getDeclarationStatus(currentTask) as string,
    previousStatus: getDeclarationStatus(previousTask) as string,
    eventType: getDeclarationType(currentTask)
  }

  return {
    measurement: 'declaration_event_duration',
    tags,
    fields,
    timestamp: toInfluxTimestamp(currentTask.lastModified)
  }
}

export async function generateTimeLoggedPoint(
  payload: fhir.Bundle,
  authHeader: IAuthHeader,
  fromTask?: boolean
): Promise<IPoints> {
  const currentTask = getTask(payload)
  let compositionId
  let timestamp
  if (!fromTask) {
    const composition = getComposition(payload)
    if (!composition) {
      throw new Error('composition not found')
    }
    compositionId = composition.id
    timestamp = composition.date
  } else {
    if (currentTask && currentTask.focus && currentTask.focus.reference) {
      compositionId = currentTask.focus.reference.split('/')[1]
      timestamp = currentTask.meta?.lastUpdated
    }
  }

  if (!compositionId) {
    throw new Error('compositionId not found')
  }

  if (!currentTask) {
    throw new Error('Current task not found')
  }

  const timeLoggedInMS = getTimeLoggedFromTask(currentTask)
  const timeLoggedInSeconds = timeLoggedInMS / 1000

  const fields: ITimeLoggedFields = {
    timeSpentEditing: timeLoggedInSeconds,
    compositionId
  }

  const tags: ITimeLoggedTags = {
    currentStatus: getDeclarationStatus(currentTask) as string,
    trackingId: getTrackingId(currentTask) as string,
    eventType: getDeclarationType(currentTask),
    practitionerId: getPractionerIdFromTask(currentTask),
    officeLocation: getRegLastOffice(payload),
    ...(await generatePointLocations(payload, authHeader))
  }

  return {
    measurement: 'declaration_time_logged',
    tags,
    fields,
    timestamp: toInfluxTimestamp(timestamp)
  }
}

export async function generateDeclarationStartedPoint(
  payload: fhir.Bundle,
  authHeader: IAuthHeader,
  status: string
): Promise<IDeclarationsStartedPoints> {
  const composition = getComposition(payload)
  const task = getTask(payload)

  if (!composition) {
    throw new Error('composition not found')
  }

  if (!task) {
    throw new Error('Task not found')
  }

  let role: string = ''

  if (status === Events.IN_PROGRESS_DEC) {
    isNotification(composition)
      ? (role = 'NOTIFICATION_API_USER')
      : (role = 'FIELD_AGENT')
  } else if (status === Events.REQUEST_FOR_REGISTRAR_VALIDATION) {
    role = 'REGISTRATION_AGENT'
  } else if (
    status ===
    Events.REGISTRAR_REGISTRATION_WAITING_EXTERNAL_RESOURCE_VALIDATION
  ) {
    role = 'REGISTRAR'
  } else if (status === Events.NEW_DEC) {
    role = 'FIELD_AGENT'
  }

  if (role === '') {
    throw new Error('Role not found')
  }

  const fields: IDeclarationsStartedFields = {
    role,
    status: getDeclarationStatus(task),
    compositionId: composition.id
  }

  const tags = {
    eventType: getDeclarationType(task),
    practitionerId: getPractionerIdFromTask(task),
    officeLocation: getRegLastOffice(payload),
    ...(await generatePointLocations(payload, authHeader))
  }

  return {
    measurement: 'declarations_started',
    tags,
    fields,
    timestamp: toInfluxTimestamp(task.lastModified)
  }
}

export async function generateRejectedPoints(
  payload: fhir.Bundle,
  authHeader: IAuthHeader
): Promise<IRejectedPoints> {
  const task = getTask(payload)

  if (!task) {
    throw new Error('Task not found')
  }
  const taskHistory = await fetchTaskHistory(task.id, authHeader)
  let compositionId
  if (task && task.focus && task.focus.reference) {
    compositionId = task.focus.reference.split('/')[1]
  }
  if (!compositionId) {
    throw new Error('compositionId not found')
  }
  const fields: IRejectedFields = {
    compositionId
  }

  const tags = {
    eventType: getDeclarationType(task),
    startedBy: getStartedByFieldAgent(taskHistory),
    officeLocation: getRegLastOffice(payload),
    ...(await generatePointLocations(payload, authHeader))
  }

  return {
    measurement: 'declarations_rejected',
    tags,
    fields,
    timestamp: toInfluxTimestamp(task.lastModified)
  }
}
