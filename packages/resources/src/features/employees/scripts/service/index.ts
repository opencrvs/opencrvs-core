import fetch, { Response } from 'node-fetch'
import { ORG_URL, FHIR_URL } from '../../../../constants'

interface ITestPractitioner {
  division: string
  district: string
  upazila: string
  union: string
  facilityEnglishName: string
  givenNamesBengali: string
  givenNamesEnglish: string
  familyNameBengali: string
  familyNameEnglish: string
  gender: string
  role: string
  mobile: string
  email: string
}

const composeFhirPractitioner = (
  practitioner: ITestPractitioner
): fhir.Practitioner => {
  return {
    resourceType: 'Practitioner',
    identifier: [
      {
        use: 'official',
        system: '',
        value: ''
      }
    ],
    name: [
      {
        use: 'en',
        family: practitioner.familyNameEnglish,
        given: practitioner.givenNamesEnglish.split(' ')
      },
      {
        use: 'bn',
        family: practitioner.familyNameBengali,
        given: practitioner.givenNamesBengali.split(' ')
      }
    ],
    gender: practitioner.gender
  }
}

const composeFhirPractitionerRole = (
  role: string,
  practitioner: string,
  location: fhir.Reference[]
): fhir.PractitionerRole => {
  return {
    resourceType: 'PractitionerRole',
    practitioner: {
      reference: practitioner
    },
    code: [
      {
        coding: [
          {
            system: `${ORG_URL}/specs/roles`,
            code: role
          }
        ]
      }
    ],
    location
  }
}

type ISupportedTypes = fhir.Practitioner | fhir.PractitionerRole

const sendToFhir = (doc: ISupportedTypes, suffix: string, method: string) => {
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

const getFromFhir = (suffix: string) => {
  return fetch(`${FHIR_URL}${suffix}`, {
    headers: {
      'Content-Type': 'application/json+fhir'
    }
  })
    .then(response => {
      return response.json()
    })
    .catch(error => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
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

export async function composeAndSavePractitioners(
  practitioners: ITestPractitioner[],
  divisions: fhir.Location[],
  districts: fhir.Location[],
  upazilas: fhir.Location[]
): Promise<boolean> {
  for (const practitioner of practitioners) {
    // Get Locations

    const locations: fhir.Reference[] = []
    if (practitioner.facilityEnglishName) {
      const facility = await getFromFhir(
        `/Location?name=${encodeURIComponent(practitioner.facilityEnglishName)}`
      )
      locations.push({ reference: `Location/${facility.id}` })
    }
    if (practitioner.division) {
      const practitionerDivision: fhir.Location = divisions.find(division => {
        return division.name === practitioner.division
      }) as fhir.Location
      locations.push({ reference: `Location/${practitionerDivision.id}` })
    }
    if (practitioner.district) {
      const practitionerDistrict: fhir.Location = districts.find(district => {
        return district.name === practitioner.district.toUpperCase()
      }) as fhir.Location
      locations.push({ reference: `Location/${practitionerDistrict.id}` })
    }
    if (practitioner.upazila) {
      let description: string
      // This is a temporary hack because some upazilas share the same name
      if (practitioner.upazila === 'Kaliganj') {
        description = kaliganjA2IIdescription
      } else if (practitioner.upazila === 'Narsingdi Sadar') {
        description = narsingdiA2IIdescription
      } else {
        description = kurigramA2IIdescription
      }
      const upazilaID = await getUpazilaID(upazilas, description)
      locations.push({ reference: `Location/${upazilaID as string}` })
    }

    // Create and save Practitioner

    const newPractitioner: fhir.Practitioner = composeFhirPractitioner(
      practitioner
    )
    const savedPractitionerResponse = (await sendToFhir(
      newPractitioner,
      '/Practitioner',
      'POST'
    ).catch(err => {
      throw Error('Cannot save practitioner to FHIR')
    })) as Response
    const practitionerLocationHeader = savedPractitionerResponse.headers.get(
      'location'
    ) as string
    const practitionerReference = `Practitioner/${
      practitionerLocationHeader.split('/')[3]
    }`
    // tslint:disable-next-line:no-console
    console.log(`Practitioner saved to fhir: ${practitionerReference}`)

    // Create and save PractitionerRole

    const newPractitionerRole: fhir.PractitionerRole = composeFhirPractitionerRole(
      practitioner.role,
      practitionerReference,
      locations
    )

    const savedPractitionerRoleResponse = (await sendToFhir(
      newPractitionerRole,
      '/PractitionerRole',
      'POST'
    ).catch(err => {
      throw Error('Cannot save practitioner to FHIR')
    })) as Response
    const practitionerRoleLocationHeader = savedPractitionerRoleResponse.headers.get(
      'location'
    ) as string
    const practitionerRoleReference = `PractitionerRole/${
      practitionerRoleLocationHeader.split('/')[3]
    }`
    // tslint:disable-next-line:no-console
    console.log(`PractitionerRole saved to fhir: ${practitionerRoleReference}`)
  }
  return true
}
