/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
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
        'client-id': process.argv[2],
        'X-Auth-Token': process.argv[3]
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
