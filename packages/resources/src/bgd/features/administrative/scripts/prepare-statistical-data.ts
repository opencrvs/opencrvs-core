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
import { ADMIN_STRUCTURE_SOURCE } from '@resources/bgd/constants'
import * as csv2json from 'csv2json'
const divisionsJSON = `${ADMIN_STRUCTURE_SOURCE}statistics/divisions.json`
const districtsJSON = `${ADMIN_STRUCTURE_SOURCE}statistics/districts.json`
import chalk from 'chalk'

export default async function prepareSourceJSON() {
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// CONVERTING STATISTICS CSV TO JSON ///////////////////////////'
    )}`
  )
  fs.createReadStream(`${ADMIN_STRUCTURE_SOURCE}statistics/divisions.csv`)
    .pipe(csv2json())
    .pipe(fs.createWriteStream(divisionsJSON))
  fs.createReadStream(`${ADMIN_STRUCTURE_SOURCE}statistics/districts.csv`)
    .pipe(csv2json())
    .pipe(fs.createWriteStream(districtsJSON))

  return true
}

prepareSourceJSON()
