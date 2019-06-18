import * as fs from 'fs'
import { EMPLOYEES_SOURCE, ADMIN_STRUCTURE_SOURCE } from '@resources/constants'
import chalk from 'chalk'
import { internal } from 'boom'
import { composeAndSavePractitioners } from '@resources/features/employees/scripts/service'

const sourceJSON = `${EMPLOYEES_SOURCE}test-employees.json`
const divisions = JSON.parse(
  fs
    .readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/divisions.json`)
    .toString()
)
const districts = JSON.parse(
  fs
    .readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/districts.json`)
    .toString()
)
const upazilas = JSON.parse(
  fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/upazilas.json`).toString()
)
const unions = JSON.parse(
  fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/unions.json`).toString()
)

export default async function importFacilities() {
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// MAPPING EMPLOYEES TO LOCATIONS, PRACTITIONERS & ROLES AND SAVING TO FHIR ///////////////////////////'
    )}`
  )
  const employees = JSON.parse(fs.readFileSync(sourceJSON).toString())
  try {
    await composeAndSavePractitioners(
      employees,
      divisions.divisions,
      districts.districts,
      upazilas.upazilas,
      unions.unions
    )
  } catch (err) {
    return internal(err)
  }
  return true
}

importFacilities()
