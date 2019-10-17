import {
  composeAndSaveLocations,
  composeAndSaveLocationsByParent,
  generateLocationResource,
  fetchAndProcessLocationsFromOISF
} from '@resources/bgd/features/administrative/scripts/service'
import chalk from 'chalk'
import * as fs from 'fs'
import { ADMIN_STRUCTURE_SOURCE } from '@resources/bgd/constants'
import { ILocation, IOISFLocationResponse } from '@resources/bgd/features/utils'

export default async function importAdminStructure() {
  let divisions: fhir.Location[]
  let districts: fhir.Location[]
  let upazilas: fhir.Location[]
  let unions: fhir.Location[]
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// IMPORTING LOCATIONS FROM A2I AND SAVING TO FHIR ///////////////////////////'
    )}`
  )
  let oisfLocations: IOISFLocationResponse
  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.yellow(
        'Fetching locations from the OISF/A2I database, this will take some time, please wait ....'
      )}`
    )
    oisfLocations = await fetchAndProcessLocationsFromOISF()
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
    process.exit(1)
    return
  }

  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.yellow('Extracting from A2I response:')} ${
        oisfLocations.divisions.length
      } divisions. Please wait ....`
    )
    divisions = await composeAndSaveLocations(
      oisfLocations.divisions,
      'DIVISION',
      '0'
    )
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
    process.exit(1)
    return
  }

  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.yellow('Extracting from A2I response:')} ${
        oisfLocations.districts.length
      } districts. Please wait ....`
    )
    districts = await composeAndSaveLocationsByParent(
      oisfLocations.districts,
      'DISTRICT',
      divisions
    )
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
    process.exit(1)
    return
  }

  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.yellow('Extracting from A2I response:')} ${
        oisfLocations.upazilas.length
      } upazilas. Please wait ....`
    )
    upazilas = await composeAndSaveLocationsByParent(
      oisfLocations.upazilas,
      'UPAZILA',
      districts
    )
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
    process.exit(1)
    return
  }

  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.yellow('Extracting from A2I response:')} ${
        oisfLocations.unions.length
      } unions. Please wait for 10 mins ....`
    )
    unions = await composeAndSaveLocationsByParent(
      oisfLocations.unions,
      'UNION',
      upazilas
    )
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
    process.exit(1)
    return
  }

  fs.writeFileSync(
    `${ADMIN_STRUCTURE_SOURCE}locations/divisions.json`,
    JSON.stringify({ divisions }, null, 2)
  )

  fs.writeFileSync(
    `${ADMIN_STRUCTURE_SOURCE}locations/districts.json`,
    JSON.stringify({ districts }, null, 2)
  )

  fs.writeFileSync(
    `${ADMIN_STRUCTURE_SOURCE}locations/upazilas.json`,
    JSON.stringify({ upazilas }, null, 2)
  )

  fs.writeFileSync(
    `${ADMIN_STRUCTURE_SOURCE}locations/unions.json`,
    JSON.stringify({ unions }, null, 2)
  )

  const fhirLocations: fhir.Location[] = []
  fhirLocations.push(...divisions)
  fhirLocations.push(...districts)
  fhirLocations.push(...upazilas)
  fhirLocations.push(...unions)

  const data: ILocation[] = []
  for (const location of fhirLocations) {
    data.push(generateLocationResource(location))
  }
  fs.writeFileSync(
    `${ADMIN_STRUCTURE_SOURCE}locations.json`,
    JSON.stringify({ data }, null, 2)
  )

  return true
}

importAdminStructure()
