import { BirthRegistrationPoint } from '.'
import { getSectionBySectionCode, getRegLastLocation } from './fhirUtils'
import { getAgeInDays } from './utils'

export const generateBirthRegPoint = (
  payload: fhir.Bundle,
  regStatus: string
) => {
  const child: fhir.Patient = getSectionBySectionCode(payload, 'child-details')
  if (!child) {
    throw new Error('No child found!')
  }

  const fields: BirthRegistrationPoint = {
    current_status: 'registered',
    gender: child.gender,
    location: getRegLastLocation(payload),
    age_in_days: child.birthDate ? getAgeInDays(child.birthDate) : undefined
  }

  const point = {
    measurement: 'birth_reg',
    tags: { reg_status: regStatus },
    fields
  }

  return point
}
