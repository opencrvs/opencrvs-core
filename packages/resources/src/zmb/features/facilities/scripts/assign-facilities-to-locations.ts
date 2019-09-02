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
