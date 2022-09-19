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
import { generateAuditPoint } from '@metrics/features/registration/pointGenerator'
import { writePoints } from '@metrics/influxdb/client'
import { internal } from '@hapi/boom'
import { IUserAuditBody } from '@metrics/features/registration/fhirUtils'

export async function newAuditHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const points = []
  try {
    const remoteAddress =
      request.headers['x-real-ip'] || request.info.remoteAddress
    const userAgent = request.headers['user-agent']
    points.push(
      await generateAuditPoint(
        request.payload as IUserAuditBody,
        remoteAddress,
        userAgent
      )
    )
    await writePoints(points)
  } catch (err) {
    return internal(err)
  }
  return h.response().code(201)
}
