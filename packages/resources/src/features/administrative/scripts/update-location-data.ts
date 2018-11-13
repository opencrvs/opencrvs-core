import * as fs from 'fs'
import { internal } from 'boom'
import { ADMIN_STRUCTURE_SOURCE } from '../../../constants'
import { sendToFhir } from './service'

export default async function administrativeStructureHandler() {
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
  let cities
  try {
    cities = await JSON.parse(
      fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/cities.json`, 'utf8')
    )
  } catch (err) {
    return internal(err)
  }
  let unions
  try {
    unions = await JSON.parse(
      fs.readFileSync(`${ADMIN_STRUCTURE_SOURCE}locations/unions.json`, 'utf8')
    )
  } catch (err) {
    return internal(err)
  }

  const locationData = divisions.divisions.concat(
    districts.districts,
    upazilas.upazilas,
    cities.cities,
    unions.unions
  )

  for (const location of locationData) {
    await sendToFhir(location, '/Location', 'PUT')
  }

  return true
}

administrativeStructureHandler()
