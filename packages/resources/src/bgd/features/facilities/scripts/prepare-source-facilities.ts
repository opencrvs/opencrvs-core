import * as fs from 'fs'
import {
  FACILITIES_SOURCE,
  HRIS_FACILITIES_URL
} from '@resources/bgd/constants'
import * as csv2json from 'csv2json'
const crvsOfficeSourceJSON = `${FACILITIES_SOURCE}crvs-facilities.json`
const healthFacilitySourceJSON = `${FACILITIES_SOURCE}health-facilities.json`
import chalk from 'chalk'
import fetch from 'node-fetch'

async function fetchHealthFacilitiesFromHRIS(offset: number, limit: number) {
  // tslint:disable-next-line:no-console
  console.log(`Fetching records ${offset + 1}-${offset + limit}`)

  const result = await fetch(
    `${HRIS_FACILITIES_URL}?offset=${offset}&limit=${limit}`,
    {
      headers: {
        'client-id': process.argv[3],
        'X-Auth-Token': process.argv[4]
      }
    }
  )

  return result.json()
}

async function fetchAllHealthFacilitiesFromHRIS() {
  const allFacilities = []
  let moreFacilities = true
  const limit = 100
  let offset = 0

  while (moreFacilities) {
    const result = await fetchHealthFacilitiesFromHRIS(offset, limit)
    offset += limit

    if (result.length === 0) {
      moreFacilities = false
    } else {
      allFacilities.push(...result)
    }
  }

  return allFacilities
}

export default async function prepareSourceJSON() {
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// CONVERTING CRVS OFFICES CSV TO JSON ///////////////////////////'
    )}`
  )
  fs.createReadStream(`${FACILITIES_SOURCE}crvs-facilities.csv`)
    .pipe(csv2json())
    .pipe(fs.createWriteStream(crvsOfficeSourceJSON))

  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// FETCHING HEALTH FACILITIES FROM HRIS ///////////////////////////\n'
    )}`
  )
  const facilities = await fetchAllHealthFacilitiesFromHRIS()
  fs.writeFileSync(
    healthFacilitySourceJSON,
    JSON.stringify(facilities, null, 2)
  )

  return true
}

prepareSourceJSON()
