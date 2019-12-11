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

import * as Hapi from 'hapi'
import { query, getCSV } from '@metrics/influxdb/client'
import * as archiver from 'archiver'

async function getMeasurementNames() {
  const points = await query<Array<{ key: string }>>(
    // tslint:disable-next-line
    `SHOW SERIES`
  )
  return points.map(({ key }) => key.split(',')[0])
}

export async function exportHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const measurements = await getMeasurementNames()

  const csvStreams = []
  for (const measurement of measurements) {
    csvStreams.push([measurement, await getCSV(measurement)])
  }

  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  })

  csvStreams.forEach(([name, stream]) =>
    archive.append(stream as any, { name: `${name}.csv` })
  )
  archive.finalize()

  return archive
}
