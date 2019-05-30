import {
  BirthRegistrationPoint,
  PointLocation,
  IAuthHeader,
  IBirthRegistrationTags
} from '.'
import {
  getSectionBySectionCode,
  getRegLastLocation,
  fetchParentLocationByLocationID
} from '@metrics/features/registration/fhirUtils'
import { getAgeInDays } from '@metrics/features/registration/utils'

export const generateBirthRegPoint = async (
  payload: fhir.Bundle,
  regStatus: string,
  authHeader: IAuthHeader
) => {
  const child: fhir.Patient = getSectionBySectionCode(payload, 'child-details')
  if (!child) {
    throw new Error('No child found!')
  }

  const fields: BirthRegistrationPoint = {
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
): Promise<PointLocation> => {
  const locations: PointLocation = {}
  const locationLevel5 = getRegLastLocation(payload)
  if (!locationLevel5) {
    return locations
  }
  locations.locationLevel5 = locationLevel5
  let locationID: string = locations.locationLevel5
  for (let index = 4; index > 1; index--) {
    locationID = await fetchParentLocationByLocationID(locationID, authHeader)
    if (!locationID) {
      break
    }
    locations[`locationLevel${index}`] = locationID
  }

  return locations
}
