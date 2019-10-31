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
import { FACILITIES_SOURCE } from '@resources/zmb/constants'
import * as csv2json from 'csv2json'
const crvsOfficeSourceJSON = `${FACILITIES_SOURCE}generated/crvs-facilities.json`
const healthFacilitySourceJSON = `${FACILITIES_SOURCE}generated/health-facilities.json`
import chalk from 'chalk'

export default async function prepareSourceJSON() {
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// CONVERTING FACILITIES CSV TO JSON ///////////////////////////'
    )}`
  )
  fs.createReadStream(`${FACILITIES_SOURCE}source/crvs-facilities.csv`)
    .pipe(csv2json())
    .pipe(fs.createWriteStream(crvsOfficeSourceJSON))
  fs.createReadStream(`${FACILITIES_SOURCE}source/health-facilities.csv`)
    .pipe(csv2json())
    .pipe(fs.createWriteStream(healthFacilitySourceJSON))

  return true
}

prepareSourceJSON()
