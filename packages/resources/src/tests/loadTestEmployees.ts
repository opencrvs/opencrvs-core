import * as fs from 'fs'
import { EMPLOYEES_SOURCE } from '@resources/bgd/constants'
import chalk from 'chalk'
import { internal } from 'boom'
import { composeAndSavePractitioners } from '@resources/bgd/features/employees/scripts/service'

const sourceJSON = `${EMPLOYEES_SOURCE}test-employees.json`

export default async function loadTestEmployees() {
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// MAPPING EMPLOYEES TO LOCATIONS, PRACTITIONERS & ROLES AND SAVING TO FHIR ///////////////////////////'
    )}`
  )
  const employees = JSON.parse(fs.readFileSync(sourceJSON).toString())
  try {
    await composeAndSavePractitioners(employees.slice(0, 1))
  } catch (err) {
    return internal(err)
  }
  return true
}

loadTestEmployees()
