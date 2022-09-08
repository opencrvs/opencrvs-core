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
import { VS_EXPORT_SCRIPT_PATH } from '@metrics/constants'
import { logger } from '@metrics/logger'
import { fork } from 'child_process'

export async function annualVSExportHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const startDate = request.query.startDate //yyyy-mm-dd
  const endDate = request.query.endDate //yyyy-mm-dd
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return h
      .response({
        message: 'Invalid date for generating vital statistics report.',
        statusCode: 422
      })
      .code(422)
  }

  const childArgv = [startDate, endDate]
  const script = fork(VS_EXPORT_SCRIPT_PATH, childArgv)
  script.on('close', (code) => {
    logger.info(`child process exited with code ${code}`)
  })
  return h
    .response({
      message: 'Generating vital statistics report.',
      statusCode: 202
    })
    .code(202)
}

function isValidDate(date: string) {
  const regEx = /^\d{4}-\d{2}-\d{2}$/
  if (!date.match(regEx)) {
    return false // Invalid format
  }
  const d = new Date(date)
  const dNum = d.getTime()
  if (!dNum && dNum !== 0) {
    return false // NaN value, Invalid date
  }
  return d.toISOString().slice(0, 10) === date
}
