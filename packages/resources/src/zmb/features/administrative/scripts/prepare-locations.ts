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
import chalk from 'chalk'
import * as fs from 'fs'
import { ADMIN_STRUCTURE_SOURCE } from '@resources/zmb/constants'
import * as csv2json from 'csv2json'

const provincesJSON = `${ADMIN_STRUCTURE_SOURCE}generated/sourceProvinces.json`
const districtsJSON = `${ADMIN_STRUCTURE_SOURCE}generated/sourceDistricts.json`

export default async function prepSource() {
  fs.createReadStream(`${ADMIN_STRUCTURE_SOURCE}source/provinces.csv`)
    .pipe(csv2json())
    .pipe(fs.createWriteStream(provincesJSON))
  fs.createReadStream(`${ADMIN_STRUCTURE_SOURCE}source/districts.csv`)
    .pipe(csv2json())
    .pipe(fs.createWriteStream(districtsJSON))
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// PREPARING SOURCE JSON FROM LOCATIONS CSV FILES ///////////////////////////'
    )}`
  )

  return true
}

prepSource()
