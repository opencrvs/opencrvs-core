import { ORG_URL } from '../../../../constants'
import { getLocationIDByDescription, sendToFhir } from '../../../utils/bn'
interface IDGHSFacility {
  division: string
  district: string
  upazila: string
  union: string
  A2IReference: string
  facilityNameBengali: string
  facilityNameEnglish: string
  facilityTypeBengali: string
  facilityTypeEnglish: string
  email: string
  phone: string
}

const composeFhirLocation = (
  location: IDGHSFacility,
  partOfReference: string
): fhir.Location => {
  return {
    resourceType: 'Location',
    identifier: [],
    name: location.facilityNameEnglish, // English name
    alias: [location.facilityNameBengali], // Bangla name in element 0
    status: 'active',
    mode: 'instance',
    partOf: {
      reference: partOfReference // Reference to the office this office falls under, if any
    },
    type: {
      coding: [
        {
          system: `${ORG_URL}/specs/location-type`,
          code: location.facilityTypeEnglish
        }
      ]
    },
    physicalType: {
      coding: [
        {
          code: 'bu',
          display: 'Building'
        }
      ]
    },
    telecom: [
      { system: 'phone', value: location.phone },
      { system: 'email', value: location.email }
    ],
    address: {
      line: [location.union, location.upazila],
      district: location.district,
      state: location.division
    }
  }
}

export async function composeAndSaveFacilities(
  facilities: IDGHSFacility[],
  unions: fhir.Location[]
): Promise<boolean> {
  for (const facility of facilities) {
    const unionID = await getLocationIDByDescription(
      unions,
      facility.A2IReference
    )
    const newLocation: fhir.Location = composeFhirLocation(
      facility,
      `Location/${unionID}`
    )
    // tslint:disable-next-line:no-console
    console.log(
      `Saving facility ... type: ${facility.facilityTypeEnglish}, name: ${
        facility.facilityNameEnglish
      }`
    )

    await sendToFhir(newLocation, '/Location', 'POST').catch(err => {
      throw Error('Cannot save location to FHIR ')
    })
  }
  return true
}
