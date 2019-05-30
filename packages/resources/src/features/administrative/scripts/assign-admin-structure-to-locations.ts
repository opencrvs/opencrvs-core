import {
  fetchAndComposeLocations,
  getLocationsByParentDivisions,
  generateLocationResource
} from '@resources/features/administrative/scripts/service'
import chalk from 'chalk'
import * as fs from 'fs'
import { ADMIN_STRUCTURE_SOURCE } from '@resources/constants'
import { ILocation } from '@resources/features/utils/bn'

export default async function importAdminStructure() {
  let divisions: fhir.Location[]
  let districts: fhir.Location[]
  let upazilas: fhir.Location[]
  let thanas: fhir.Location[]
  let cities: fhir.Location[]
  let cityWards: fhir.Location[]
  let unions: fhir.Location[]
  let municipalities: fhir.Location[]
  let municipalityWards: fhir.Location[]
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// IMPORTING LOCATIONS FROM A2I AND SAVING TO FHIR ///////////////////////////'
    )}`
  )
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.yellow(
      'Fetching locations from the OISF/A2I database, this will take some time, please wait ....'
    )}`
  )

  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.yellow('Fetching from A2I:')} divisions. Please wait ....`
    )
    divisions = await fetchAndComposeLocations('division', '0', 'DIVISION')
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
    process.exit(1)
    return
  }

  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.yellow('Fetching from A2I:')} districts. Please wait ....`
    )
    districts = await getLocationsByParentDivisions('district', divisions)
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
    process.exit(1)
    return
  }

  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.yellow('Fetching from A2I:')} upazilas. Please wait ....`
    )
    upazilas = await getLocationsByParentDivisions('upazila', districts)
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
    process.exit(1)
    return
  }

  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.yellow('Fetching from A2I:')} thanas. Please wait ....`
    )
    thanas = await getLocationsByParentDivisions('thana', districts)
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
    process.exit(1)
    return
  }

  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.yellow('Fetching from A2I:')} cities. Please wait ....`
    )
    cities = await getLocationsByParentDivisions('citycorporation', districts)
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
    process.exit(1)
    return
  }

  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.yellow('Fetching from A2I:')} city wards. Please wait ....`
    )
    cityWards = await getLocationsByParentDivisions(
      'citycorporationward',
      cities
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
      `${chalk.yellow('Fetching from A2I:')} unions. Please wait ....`
    )
    unions = await getLocationsByParentDivisions('union', upazilas)
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
    process.exit(1)
    return
  }

  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.yellow('Fetching from A2I:')} municipalities. Please wait ....`
    )
    municipalities = await getLocationsByParentDivisions(
      'municipality',
      upazilas
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
      `${chalk.yellow(
        'Fetching from A2I:'
      )} municipality wards. Please wait ....`
    )
    municipalityWards = await getLocationsByParentDivisions(
      'municipalityward',
      municipalities
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
    `${ADMIN_STRUCTURE_SOURCE}locations/thanas.json`,
    JSON.stringify({ thanas }, null, 2)
  )

  fs.writeFileSync(
    `${ADMIN_STRUCTURE_SOURCE}locations/cities.json`,
    JSON.stringify({ cities }, null, 2)
  )

  fs.writeFileSync(
    `${ADMIN_STRUCTURE_SOURCE}locations/cityWards.json`,
    JSON.stringify({ cityWards }, null, 2)
  )

  fs.writeFileSync(
    `${ADMIN_STRUCTURE_SOURCE}locations/unions.json`,
    JSON.stringify({ unions }, null, 2)
  )

  fs.writeFileSync(
    `${ADMIN_STRUCTURE_SOURCE}locations/municipalities.json`,
    JSON.stringify({ municipalities }, null, 2)
  )

  fs.writeFileSync(
    `${ADMIN_STRUCTURE_SOURCE}locations/municipalityWards.json`,
    JSON.stringify({ municipalityWards }, null, 2)
  )

  const fhirLocations: fhir.Location[] = []
  fhirLocations.push(...divisions)
  fhirLocations.push(...districts)
  fhirLocations.push(...upazilas)
  fhirLocations.push(...cities)
  fhirLocations.push(...cityWards)
  fhirLocations.push(...unions)
  fhirLocations.push(...municipalities)
  fhirLocations.push(...municipalityWards)

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
