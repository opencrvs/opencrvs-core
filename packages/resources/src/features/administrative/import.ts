import { requestLocations, getDivisionsByLevel, ILocation } from './service'
import { logger } from '../../logger'
import { internal } from 'boom'
import { writeFile } from 'fs'

export default async function administrativeStructureHandler() {
  let states: ILocation[]
  let districts: ILocation[]
  let upazilas: ILocation[]

  try {
    logger.info('getting states')
    states = await requestLocations('division', 0)
  } catch (err) {
    return internal(err)
  }

  try {
    logger.info('getting districts')
    districts = await getDivisionsByLevel('district?division=%1', states)
  } catch (err) {
    return internal(err)
  }

  try {
    logger.info('getting upazilas')
    upazilas = await getDivisionsByLevel(
      'upazila?division=%1&district=%2',
      states,
      districts
    )
  } catch (err) {
    return internal(err)
  }

  /*const thanas: ILocation[] = await getDivisionsByLevel(
    'thana?division=%1&district=%2',
    states,
    districts
  )

  const cities: ILocation[] = await getDivisionsByLevel(
    'citycorporation?division=%1&district=%2',
    states,
    districts
  )

  const unions: ILocation[] = await getDivisionsByLevel(
    'unions?division=%1&district=%2&upazila=%3',
    states,
    districts,
    upazilas
  )

  const municipalities: ILocation[] = await getDivisionsByLevel(
    'municipality?division=%1&district=%2&upazila=%3',
    states,
    districts,
    upazilas
  )

  const cityWards: ILocation[] = await getDivisionsByLevel(
    'citycorporationward?division=%1&district=%2&citycorporation=%3',
    states,
    districts,
    cities
  )

  const municipalityWards: ILocation[] = await getDivisionsByLevel(
    'municipalityward?division=%1&district=%2&municipality=%3',
    states,
    districts,
    municipalities
  )
  */

  const locations = states.concat(
    districts,
    upazilas
    /*thanas,
    cities,
    unions,
    municipalities,
    cityWards,
    municipalityWards*/
  )
  writeFile(
    `${process.cwd()}/src/features/administrative/administrativeStructure.json`,
    JSON.stringify(locations, null, 4),
    err => {
      if (err) {
        console.log(err)
        return
      }
      console.log('File has been created')
    }
  )

  return { locations }
}

administrativeStructureHandler()
