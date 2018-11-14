import * as fs from 'fs'
import { FACILITIES_SOURCE, ADMIN_STRUCTURE_SOURCE } from '../../../constants'

import { logger } from '../../../logger'
import { internal } from 'boom'
import { composeAndSaveFacilities } from './service'

const sourceJSON = `${FACILITIES_SOURCE}health-facilities.json`
const upazilas = JSON.parse(
  fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/upazilas.json`).toString()
)

export default async function importFacilities() {
  const facilities = JSON.parse(fs.readFileSync(sourceJSON).toString())
  try {
    logger.info('saving facilities')
    await composeAndSaveFacilities(facilities, upazilas)
  } catch (err) {
    return internal(err)
  }
  return true
}

importFacilities()
