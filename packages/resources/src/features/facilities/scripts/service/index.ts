import fetch, { Response } from 'node-fetch'
import { FHIR_URL } from '../../../../constants'

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

interface ISearchParams {
  description: string
}

/*const composeFhirLocation = (
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
          system: `${ORG_URL}/specs/location-type§`,
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
}*/

export const sendToFhir = (
  doc: fhir.Location | ISearchParams,
  suffix: string,
  method: string
) => {
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

const getFromFhir = (suffixAndSearchParams: string) => {
  return fetch(`${FHIR_URL}${suffixAndSearchParams}`, {
    headers: {
      'Content-Type': 'application/json+fhir'
    }
  })
    .then(response => {
      return response
    })
    .catch(error => {
      return Promise.reject(new Error(`FHIR GETfailed: ${error.message}`))
    })
}

const kaliganjA2IIdescription = 'division=3&district=20&upazila=165'
const narsingdiA2IIdescription = 'division=3&district=29&upazila=229'
const kurigramA2IIdescription = 'division=6&district=55&upazila=417'

export async function composeAndSaveFacilities(
  facilities: IDGHSFacility[]
): Promise<fhir.Location[]> {
  const locations: fhir.Location[] = []
  for (const facility of facilities) {
    // let partOfReference: string
    let parentUpazilaResponse: Response
    if (facility.upazila === 'Kaliganj') {
      parentUpazilaResponse = await getFromFhir(
        `/Location?description=${encodeURIComponent(kaliganjA2IIdescription)}`
      )
    } else if (facility.upazila === 'Narsingdi Sadar') {
      parentUpazilaResponse = await getFromFhir(
        `/Location?description=${encodeURIComponent(narsingdiA2IIdescription)}`
      )
    } else {
      parentUpazilaResponse = await getFromFhir(
        `/Location?description=${encodeURIComponent(kurigramA2IIdescription)}`
      )
    }

    console.log(parentUpazilaResponse)

    /*const newLocation: fhir.Location = composeFhirLocation(
      facility,
      `Location/${partOfReference}`
    )

    const savedLocationResponse = (await sendToFhir(
      newLocation,
      '/Location',
      'POST'
    ).catch(err => {
      throw Error('Cannot save location to FHIR')
    })) as Response
    const locationHeader = savedLocationResponse.headers.get(
      'location'
    ) as string
    newLocation.id = locationHeader.split('/')[3]
    locations.push(newLocation)*/
  }
  return locations
}
