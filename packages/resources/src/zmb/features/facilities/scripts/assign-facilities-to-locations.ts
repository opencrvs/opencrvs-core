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
} from '@resources/zmb/constants'
import chalk from 'chalk'
import { internal } from 'boom'
import {
  composeAndSaveFacilities,
  generateLocationResource
} from '@resources/zmb/features/facilities/scripts/service'
import { ILocation } from '@resources/zmb/features/utils'

const crvsOfficeSourceJSON = `${FACILITIES_SOURCE}generated/crvs-facilities.json`
const healthFacilitySourceJSON = `${FACILITIES_SOURCE}generated/health-facilities.json`

const districts = JSON.parse(
  fs
    .readFileSync(`${ADMIN_STRUCTURE_SOURCE}generated/districts.json`)
    .toString()
)

export default async function importFacilities() {
  let crvsOfficeLocations: fhir.Location[]
  let healthFacilityLocations: fhir.Location[]
  const crvsOffices = JSON.parse(
    fs.readFileSync(crvsOfficeSourceJSON).toString()
  )
  const healthFacilities = JSON.parse(
    fs.readFileSync(healthFacilitySourceJSON).toString()
  )
  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.blueBright(
        '/////////////////////////// MAPPING CR OFFICES TO LOCATIONS AND SAVING TO FHIR ///////////////////////////'
      )}`
    )
    crvsOfficeLocations = await composeAndSaveFacilities(
      crvsOffices,
      districts.districts
    )
    healthFacilityLocations = await composeAndSaveFacilities(
      healthFacilities,
      districts.districts
    )

    const fhirLocations: fhir.Location[] = []
    fhirLocations.push(...crvsOfficeLocations)
    fhirLocations.push(...healthFacilityLocations)
    const data: ILocation[] = []
    for (const location of fhirLocations) {
      data.push(generateLocationResource(location))
    }
    fs.writeFileSync(
      `${FACILITIES_SOURCE}generated/locations.json`,
      JSON.stringify({ data }, null, 2)
    )
  } catch (err) {
    return internal(err)
  }

  return true
}

importFacilities()
