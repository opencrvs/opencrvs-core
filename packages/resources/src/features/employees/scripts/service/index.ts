import { Response } from 'node-fetch'
import { ORG_URL } from '../../../../constants'
import { getUpazilaID, getFromFhir, sendToFhir } from '../../../utils/bn'
import chalk from 'chalk'

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

const composeFhirPractitioner = (practitioner: ITestPractitioner): any => {
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
        family: [practitioner.familyNameEnglish],
        given: practitioner.givenNamesEnglish.split(' ')
      },
      {
        use: 'bn',
        family: [practitioner.familyNameBengali],
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

export async function composeAndSavePractitioners(
  practitioners: ITestPractitioner[],
  divisions: fhir.Location[],
  districts: fhir.Location[],
  upazilas: fhir.Location[],
  unions: fhir.Location[]
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
      const upazilaID = await getUpazilaID(upazilas, practitioner.upazila)
      locations.push({ reference: `Location/${upazilaID as string}` })
    }
    if (practitioner.union) {
      const practitionerUnion: fhir.Location = unions.find(union => {
        return union.name === practitioner.union.toUpperCase()
      }) as fhir.Location
      locations.push({ reference: `Location/${practitionerUnion.id}` })
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
      throw Error('Cannot save practitioner role to FHIR')
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
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// FINISHED SAVING RESOURCES - THANK YOU FOR WAITING ///////////////////////////'
    )}`
  )
  return true
}
