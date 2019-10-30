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
import * as fs from 'fs'
import {
  FACILITIES_SOURCE,
  ADMIN_STRUCTURE_SOURCE
} from '@resources/bgd/constants'
import chalk from 'chalk'
import { internal } from 'boom'
import {
  mapAndSaveCRVSFacilities,
  generateLocationResource,
  mapAndSaveHealthFacilities,
  IORGFacility,
  IHRISFacility
} from '@resources/bgd/features/facilities/scripts/service'
import { ILocation } from '@resources/bgd/features/utils'

const crvsOfficeSourceJSON = `${FACILITIES_SOURCE}crvs-facilities.json`
const healthFacilitySourceJSON = `${FACILITIES_SOURCE}health-facilities.json`

const unions = JSON.parse(
  fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/unions.json`).toString()
)
const upazilas = JSON.parse(
  fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/upazilas.json`).toString()
)
const districts = JSON.parse(
  fs
    .readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/districts.json`)
    .toString()
)
const divisions = JSON.parse(
  fs
    .readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/divisions.json`)
    .toString()
)

const facilityTypesCodesToInclude = [
  /*{ code: '1010', name: 'Public Health Institution' },
  { code: '1002', name: 'Specialty Postgraduate Institute & Hospital' },
  { code: '1021', name: 'Specialized Health Center' },
  { code: '1055', name: 'School Health Clinic' },
  { code: '1015', name: 'Institute of Health Technology' },
  { code: '1035', name: 'Leprosy Hospital' },
  { code: '1005', name: 'Medical College Hospital' },
  { code: '1020', name: 'Special Purpose Hospital' },
  { code: '1034', name: 'Chest Hospital' },
  { code: '1061', name: 'Other Hospital' },
  { code: '1038', name: 'Union Sub-center' },*/
  { code: '1029', name: 'Upazila Health Complex' },
  // { code: '1033', name: 'Infectious Disease Hospital' },
  { code: '1037', name: 'Union Health & Family Welfare Center (UH&FWC)' },
  /*{ code: '1026', name: '20-bed Hospital' },
  { code: '1022', name: 'General Hospital (not district hospital)' },
  { code: '1056', name: 'Chest Disease Clinic' },
  { code: '1036', name: 'Trauma Center' },
  { code: '1024', name: '50-bed Hospital' },*/
  { code: '1028', name: 'District Hospital' },
  /*{ code: '1027', name: '10-bed Hospital' },
  { code: '1023', name: '200-250 bed Hospital (not district hospital)' },
  { code: '1025', name: '31-bed Hospital' },
  { code: '1058', name: 'Medical Sub Depot' },
  { code: '1019', name: 'Specialized Hospital' },
  { code: '1060', name: 'Other' },
  { code: '1009', name: 'Hospital of Alternative Medicine' },*/
  { code: '1039', name: 'Community Clinic' },
  // { code: '1062', name: 'Union Health Center' },
  { code: '1043', name: 'Private Hospital / Clinic' },
  { code: '1044', name: 'NGO Hospital/Clinic' }
  /*{ code: '1013', name: 'Nursing College/Nursing Institute' },
  { code: '1031', name: 'MCWC' },
  { code: '1032', name: 'Family Planning Clinic' },
  { code: '1030', name: 'Upazila Field Service' },
  { code: '1042', name: 'Urban Primary Health Care Center' },
  { code: '1041', name: 'City Corporation / Municipality Hospital' }*/
]

export default async function importFacilities() {
  let crvsOfficeLocations: fhir.Location[]
  let healthFacilityLocations: fhir.Location[]

  const crvsOffices: IORGFacility[] = JSON.parse(
    fs.readFileSync(crvsOfficeSourceJSON).toString()
  )
  const healthFacilities: IHRISFacility[] = JSON.parse(
    fs.readFileSync(healthFacilitySourceJSON).toString()
  )

  const filteredHealthFacilities = healthFacilities.filter(facility => {
    const foundCode = facilityTypesCodesToInclude.find(
      typeCodes => typeCodes.code === facility.facilitytype_code
    )

    return !!foundCode // cast to bool
  })

  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.blueBright(
        '/////////////////////////// MAPPING CR OFFICES AND HEALTH FACILITIES TO LOCATIONS AND SAVING TO FHIR ///////////////////////////'
      )}`
    )

    // setting some locations covered in the pilot implementation to use to highlight any warnings if we cannot map an office to A2I
    const deploymentUpazilas = ['Kaliganj', 'Narsingdi Sadar', 'Bhurungamari']

    crvsOfficeLocations = await mapAndSaveCRVSFacilities(
      crvsOffices,
      divisions.divisions,
      districts.districts,
      upazilas.upazilas,
      unions.unions,
      deploymentUpazilas
    )

    healthFacilityLocations = await mapAndSaveHealthFacilities(
      filteredHealthFacilities,
      divisions.divisions,
      districts.districts,
      upazilas.upazilas
    )

    const fhirLocations: fhir.Location[] = []
    fhirLocations.push(...crvsOfficeLocations)
    fhirLocations.push(...healthFacilityLocations)

    const data: ILocation[] = []
    for (const location of fhirLocations) {
      data.push(generateLocationResource(location))
    }
    fs.writeFileSync(
      `${FACILITIES_SOURCE}locations.json`,
      JSON.stringify({ data }, null, 2)
    )
  } catch (err) {
    return internal(err)
  }

  return true
}

importFacilities()
