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
  getApplicationStatus
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
    previous_status: getApplicationStatus(previousTask)
  }

  return {
    measurement: 'application_event_duration',
    tags,
    fields
  }
}
