import * as fs from 'fs'
import { internal } from 'boom'
import { ADMIN_STRUCTURE_SOURCE } from '@resources/constants'
import { sendToFhir } from '@resources/features/utils/bn'
import chalk from 'chalk'

export default async function administrativeStructureHandler() {
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// UPDATING LOCATIONS WITH MAP DATA IN FHIR ///////////////////////////'
    )}`
  )
  let divisions
  try {
    divisions = await JSON.parse(
      fs.readFileSync(
        `${ADMIN_STRUCTURE_SOURCE}locations/divisions-geo.json`,
        'utf8'
      )
    )
  } catch (err) {
    return internal(err)
  }
  let districts
  try {
    districts = await JSON.parse(
      fs.readFileSync(
        `${ADMIN_STRUCTURE_SOURCE}locations/districts-geo.json`,
        'utf8'
      )
    )
  } catch (err) {
    return internal(err)
  }
  let upazilas
  try {
    upazilas = await JSON.parse(
      fs.readFileSync(
        `${ADMIN_STRUCTURE_SOURCE}locations/upazilas-geo.json`,
        'utf8'
      )
    )
  } catch (err) {
    return internal(err)
  }

  const locationData = divisions.divisions.concat(
    districts.districts,
    upazilas.upazilas
  )

  for (const location of locationData) {
    // tslint:disable-next-line:no-console
    console.log(`Updating location: ${location.id}`)
    await sendToFhir(location, `/Location/${location.id}`, 'PUT')
  }

  return true
}

administrativeStructureHandler()
