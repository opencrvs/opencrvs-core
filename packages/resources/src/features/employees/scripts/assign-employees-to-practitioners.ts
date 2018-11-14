import * as fs from 'fs'
import { EMPLOYEES_SOURCE, ADMIN_STRUCTURE_SOURCE } from '../../../constants'

import { logger } from '../../../logger'
import { internal } from 'boom'
import { composeAndSavePractitioners } from './service'

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

export default async function importFacilities() {
  const employees = JSON.parse(fs.readFileSync(sourceJSON).toString())
  try {
    logger.info('saving employees')
    await composeAndSavePractitioners(
      employees,
      divisions.divisions,
      districts.districts,
      upazilas.upazilas
    )
  } catch (err) {
    return internal(err)
  }
  return true
}

importFacilities()
