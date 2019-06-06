import * as fs from 'fs'

import { EMPLOYEES_SOURCE, TEST_SOURCE } from '@resources/constants'
import chalk from 'chalk'
import { internal } from 'boom'
import { composeAndSavePractitioners } from '@resources/features/employees/scripts/service'

const sourceJSON = `${EMPLOYEES_SOURCE}test-employees.json`
const testLocations = JSON.parse(
  fs.readFileSync(`${TEST_SOURCE}locations.json`).toString()
)

export default async function loadTestEmployees() {
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// MAPPING EMPLOYEES TO LOCATIONS, PRACTITIONERS & ROLES AND SAVING TO FHIR ///////////////////////////'
    )}`
  )
  const employees = JSON.parse(fs.readFileSync(sourceJSON).toString())
  try {
    await composeAndSavePractitioners(
      employees.slice(0, 1),
      testLocations.locations.slice(-1),
      testLocations.locations.slice(3, 4),
      testLocations.locations.slice(2, 3),
      testLocations.locations.slice(1, 2)
    )
  } catch (err) {
    return internal(err)
  }
  return true
}

loadTestEmployees()
