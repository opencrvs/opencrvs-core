import * as fs from 'fs'
import { FACILITIES_SOURCE, ADMIN_STRUCTURE_SOURCE } from '@resources/constants'
import chalk from 'chalk'
import { internal } from 'boom'
import {
  composeAndSaveFacilities,
  generateLocationResource
} from '@resources/features/facilities/scripts/service'
import { ILocation } from '@resources/features/utils/bn'

const crvsOfficeSourceJSON = `${FACILITIES_SOURCE}crvs-facilities.json`
const healthFacilitySourceJSON = `${FACILITIES_SOURCE}health-facilities.json`

const unions = JSON.parse(
  fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/unions.json`).toString()
)

const upazilas = JSON.parse(
  fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/upazilas.json`).toString()
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
        '/////////////////////////// MAPPING CR OFFICES AND HEALTH FACILITIES TO LOCATIONS AND SAVING TO FHIR ///////////////////////////'
      )}`
    )
    crvsOfficeLocations = await composeAndSaveFacilities(
      crvsOffices,
      unions.unions
    )
    healthFacilityLocations = await composeAndSaveFacilities(
      healthFacilities,
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
