import fetch from 'node-fetch'
import { ORG_URL, FHIR_URL } from '../../../../constants'

interface IDGHSFacility {
  division: string
  district: string
  upazila: string
  union: string
  facilityNameBengali: string
  facilityNameEnglish: string
  facilityTypeBengali: string
  facilityTypeEnglish: string
  email: string
  phone: string
  type: string
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
          code: location.type
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

const sendToFhir = (doc: fhir.Location, suffix: string, method: string) => {
  return fetch(`${FHIR_URL}${suffix}`, {
    method,
    body: JSON.stringify(doc),
    headers: {
      'Content-Type': 'application/json+fhir'
    }
  })
    .then(response => {
      return response
    })
    .catch(error => {
      return Promise.reject(
        new Error(`FHIR ${method} failed: ${error.message}`)
      )
    })
}
// This is a temporary hack because some upazilas share the same name

const kaliganjA2IIdescription = 'division=3&district=20&upazila=165'
const narsingdiA2IIdescription = 'division=3&district=29&upazila=229'
const kurigramA2IIdescription = 'division=6&district=55&upazila=417'

function getUpazilaID(upazilas: fhir.Location[], description: string) {
  const relevantUpazila = upazilas.find(upazila => {
    return upazila.description === description
  }) as fhir.Location
  return relevantUpazila.id as string
}

export async function composeAndSaveFacilities(
  facilities: IDGHSFacility[],
  upazilas: fhir.Location[]
): Promise<boolean> {
  let description: string

  for (const facility of facilities) {
    // This is a temporary hack because some upazilas share the same name
    if (facility.upazila === 'Kaliganj') {
      description = kaliganjA2IIdescription
    } else if (facility.upazila === 'Narsingdi Sadar') {
      description = narsingdiA2IIdescription
    } else {
      description = kurigramA2IIdescription
    }

    const upazilaID = await getUpazilaID(upazilas, description)

    const newLocation: fhir.Location = composeFhirLocation(
      facility,
      `Location/${upazilaID}`
    )
    // tslint:disable-next-line:no-console
    console.log(
      `Saving facility ... type: ${facility.type}, name: ${
        facility.facilityNameEnglish
      }`
    )

    await sendToFhir(newLocation, '/Location', 'POST').catch(err => {
      throw Error('Cannot save location to FHIR ')
    })
  }
  return true
}
