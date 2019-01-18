import * as fs from 'fs'
import { FACILITIES_SOURCE, ADMIN_STRUCTURE_SOURCE } from '../../../constants'
import chalk from 'chalk'
import { internal } from 'boom'
import { composeAndSaveFacilities } from './service'

const crvsOfficeSourceJSON = `${FACILITIES_SOURCE}crvs-facilities.json`
const healthFacilitySourceJSON = `${FACILITIES_SOURCE}health-facilities.json`

const unions = JSON.parse(
  fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/unions.json`).toString()
)

const upazilas = JSON.parse(
  fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/upazilas.json`).toString()
)

export default async function importFacilities() {
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
    await composeAndSaveFacilities(crvsOffices, unions.unions)
    await composeAndSaveFacilities(healthFacilities, upazilas.upazilas)
  } catch (err) {
    return internal(err)
  }

  return true
}

importFacilities()
