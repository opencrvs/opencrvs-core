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
import { uploadBase64ToMinio } from '@metrics/api'
import { VS_EXPORT_SCRIPT_PATH } from '@metrics/constants'
import { fork } from 'child_process'
import * as fs from 'fs'
import { join } from 'path'

const BIRTH_REPORT_PATH = join(__dirname, '../../../scripts/Birth_Report.csv')
const DEATH_REPORT_PATH = join(__dirname, '../../../scripts/Death_Report.csv')

export async function vsExportHandler(
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

  script.on('close', async (code) => {
    console.log(`child process exited with code ${code}`)
    try {
      if (
        fs.existsSync(BIRTH_REPORT_PATH) &&
        fs.existsSync(DEATH_REPORT_PATH)
      ) {
        //convert csv files to base64
        const birthContents = fs.readFileSync(BIRTH_REPORT_PATH, {
          encoding: 'base64'
        })
        const deathContents = fs.readFileSync(DEATH_REPORT_PATH, {
          encoding: 'base64'
        })
        //upload files to minio
        const birthUploadResponse = await uploadBase64ToMinio(birthContents)
        const deathUploadResponse = await uploadBase64ToMinio(deathContents)
        console.log(birthUploadResponse)
        console.log(deathUploadResponse)
      }
    } catch (err) {
      console.error(err)
    }
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
