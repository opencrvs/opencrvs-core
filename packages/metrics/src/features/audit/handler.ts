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
import { query, writePoints } from '@metrics/influxdb/client'
import { internal } from '@hapi/boom'
import { IUserAuditBody } from '@metrics/features/registration'
import { PRACTITIONER_ID } from '@metrics/features/getTimeLogged/constants'

export async function newAuditHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const points = []
  try {
    const remoteAddress =
      request.headers['x-real-ip'] || request.info.remoteAddress
    const userAgent =
      request.headers['x-real-user-agent'] || request.headers['user-agent']
    const payload = request.payload as IUserAuditBody
    points.push(
      await generateAuditPoint(
        payload.practitionerId,
        payload.action,
        remoteAddress,
        userAgent,
        payload.additionalData
      )
    )
    await writePoints(points)
  } catch (err) {
    return internal(err)
  }
  return h.response().code(201)
}

export async function getUserAuditsHandler(request: Hapi.Request) {
  const practitionerId = request.query[PRACTITIONER_ID]
  const results = await getUserAuditEvents(practitionerId)
  return {
    results,
    total: results.length
  }
}

export async function getUserAuditEvents(practitionerId: string) {
  return await query(
    `SELECT * from user_audit_event where practitionerId = $practitionerId`,
    { placeholders: { practitionerId: practitionerId } }
  )
}
