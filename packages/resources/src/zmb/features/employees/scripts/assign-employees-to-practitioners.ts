import * as fs from 'fs'
import { EMPLOYEES_SOURCE } from '@resources/zmb/constants'
import chalk from 'chalk'
import { internal } from 'boom'
import { composeAndSavePractitioners } from '@resources/zmb/features/employees/scripts/service'

const sourceJSON = `${EMPLOYEES_SOURCE}test-employees.json`

export default async function importFacilities() {
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// MAPPING TEST EMPLOYEES TO PRACTITIONERS, ROLES AND USERS & SAVING TO FHIR ///////////////////////////'
    )}`
  )
  const employees = JSON.parse(fs.readFileSync(sourceJSON).toString())
  try {
    await composeAndSavePractitioners(employees)
  } catch (err) {
    return internal(err)
  }
  return true
}

importFacilities()
