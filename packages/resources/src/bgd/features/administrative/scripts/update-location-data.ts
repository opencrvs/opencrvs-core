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
import { internal } from 'boom'
import { ADMIN_STRUCTURE_SOURCE } from '@resources/bgd/constants'
import { sendToFhir } from '@resources/bgd/features/utils'
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
