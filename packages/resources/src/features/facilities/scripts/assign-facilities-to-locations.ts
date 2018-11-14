import * as fs from 'fs'
import { FACILITIES_SOURCE, ADMIN_STRUCTURE_SOURCE } from '../../../constants'
import chalk from 'chalk'
import { internal } from 'boom'
import { composeAndSaveFacilities } from './service'

const sourceJSON = `${FACILITIES_SOURCE}health-facilities.json`
const upazilas = JSON.parse(
  fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/upazilas.json`).toString()
)

export default async function importFacilities() {
  const facilities = JSON.parse(fs.readFileSync(sourceJSON).toString())
  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.blueBright(
        '/////////////////////////// MAPPING FACILITIES TO LOCATIONS AND SAVING TO FHIR ///////////////////////////'
      )}`
    )
    await composeAndSaveFacilities(facilities, upazilas.upazilas)
  } catch (err) {
    return internal(err)
  }
  return true
}

importFacilities()
