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

import * as Hapi from '@hapi/hapi'
import { query, getCSV } from '@metrics/influxdb/client'
import * as archiver from 'archiver'
import { metricsHandler } from '@metrics/features/metrics/handler'
import * as stringify from 'csv-stringify'
import { fetchLocation } from '@metrics/api'
import { EVENT } from '@metrics/features/metrics/constants'
//import { EXPECTED_BIRTH_REGISTRATION_IN_DAYS } from '@metrics/constants'
import { getRegistrationTargetDays } from '@metrics/features/metrics/utils'

async function getMeasurementNames() {
  const points = await query<Array<{ key: string }>>('SHOW SERIES')
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

  // Getting CSV contents as zip
  return archiveStreams(csvStreams)
}

export async function monthlyExportHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const event =
    request.query[EVENT].toUpperCase() === 'BIRTH' ? 'Birth' : 'Death'
  const auth = request.auth as Hapi.RequestAuth & {
    token: string
  }

  const monthlyMetrics = await metricsHandler(request, h)

  const EXPECTED_BIRTH_REGISTRATION_IN_DAYS = await getRegistrationTargetDays(
    event,
    auth.token
  )

  const csvStreams = []
  // populating csv for gender based registration data
  if (monthlyMetrics.genderBasisMetrics) {
    const stream = []
    for (const genderBaseData of monthlyMetrics.genderBasisMetrics) {
      const loc = await fetchLocation(genderBaseData.location, {
        Authorization: `Bearer ${auth.token}`
      })
      stream.push({
        Location: loc.name,
        'Male Under 18': `${genderBaseData.maleUnder18} (${getPercentage(
          genderBaseData.maleUnder18,
          genderBaseData.total
        )}%)`,
        'Female Under 18': `${genderBaseData.femaleUnder18} (${getPercentage(
          genderBaseData.femaleUnder18,
          genderBaseData.total
        )}%)`,
        'Male Over 18': `${genderBaseData.maleOver18} (${getPercentage(
          genderBaseData.maleOver18,
          genderBaseData.total
        )}%)`,
        'Female Over 18': `${genderBaseData.femaleOver18} (${getPercentage(
          genderBaseData.femaleOver18,
          genderBaseData.total
        )}%)`,
        Total: genderBaseData.total
      })
    }
    csvStreams.push([
      `${event} Registered`,
      stringify(stream, { header: true })
    ])
  }
  // populating csv for time frame based registration data
  if (monthlyMetrics.timeFrames) {
    const stream = []
    for (const timeFrameData of monthlyMetrics.timeFrames) {
      const loc = await fetchLocation(timeFrameData.locationId, {
        Authorization: `Bearer ${auth.token}`
      })
      stream.push({
        Location: loc.name,
        [`Within ${EXPECTED_BIRTH_REGISTRATION_IN_DAYS} days`]: `${
          timeFrameData.regWithinTargetd
        } (${getPercentage(
          timeFrameData.regWithinTargetd,
          timeFrameData.total
        )}%)`,
        [`${EXPECTED_BIRTH_REGISTRATION_IN_DAYS} days - 1 year`]: `${
          timeFrameData.regWithinTargetdTo1yr
        } (${getPercentage(
          timeFrameData.regWithinTargetdTo1yr,
          timeFrameData.total
        )}%)`,
        '1 year to 5 years': `${
          timeFrameData.regWithin1yrTo5yr
        } (${getPercentage(
          timeFrameData.regWithin1yrTo5yr,
          timeFrameData.total
        )}%)`,
        'Over 5 years': `${timeFrameData.regOver5yr} (${getPercentage(
          timeFrameData.regOver5yr,
          timeFrameData.total
        )}%)`,
        Total: timeFrameData.total
      })
    }
    csvStreams.push([
      `${event} registered by time period`,
      stringify(stream, { header: true })
    ])
  }
  // populating csv for 45 days based estimated data
  if (monthlyMetrics.estimatedTargetDayMetrics) {
    const stream = []
    for (const estimatedTargetDayData of monthlyMetrics.estimatedTargetDayMetrics) {
      const loc = await fetchLocation(estimatedTargetDayData.locationId, {
        Authorization: `Bearer ${auth.token}`
      })
      stream.push({
        Location: loc.name,
        'Estimated no. of registrations':
          estimatedTargetDayData.estimatedRegistration,
        [`Total registered in ${EXPECTED_BIRTH_REGISTRATION_IN_DAYS} days`]:
          estimatedTargetDayData.registrationInTargetDay,
        'Percentage of estimate': `${estimatedTargetDayData.estimationPercentage}%`
      })
    }
    csvStreams.push([
      `Estimated vs total registered in ${EXPECTED_BIRTH_REGISTRATION_IN_DAYS} days`,
      stringify(stream, { header: true })
    ])
  }
  // populating csv for registration payment data
  if (monthlyMetrics.payments) {
    const stream = []
    for (const paymentData of monthlyMetrics.payments) {
      const loc = await fetchLocation(paymentData.locationId, {
        Authorization: `Bearer ${auth.token}`
      })
      stream.push({
        Location: loc.name,
        Total: paymentData.total
      })
    }
    csvStreams.push([
      `Payment collected for ${event.toLowerCase()} certificates`,
      stringify(stream, { header: true })
    ])
  }

  // Getting CSV contents as zip
  return archiveStreams(csvStreams)
}

function archiveStreams(csvStreams: any[]) {
  const archive = archiver('zip', {
    // Sets the compression level.
    zlib: { level: 9 }
  })
  csvStreams.forEach(([name, stream]) => {
    archive.append(stream as any, { name: `${name}.csv` })
  })
  archive.finalize()

  return archive
}

function getPercentage(value: number, total: number) {
  return value === 0 || total === 0 ? 0 : Math.round((value / total) * 100)
}
