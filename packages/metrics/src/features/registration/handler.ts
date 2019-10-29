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
import { writePoints } from '@metrics/influxdb/client'
import {
  generateBirthRegPoint,
  generateEventDurationPoint
} from '@metrics/features/registration/pointGenerator'
import { internal } from 'boom'

export async function newBirthRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const points = []
  try {
    points.push(
      await generateBirthRegPoint(
        request.payload as fhir.Bundle,
        'register-new-application',
        {
          Authorization: request.headers.authorization
        }
      )
    )
    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function birthRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const points = await Promise.all([
      generateEventDurationPoint(
        request.payload as fhir.Bundle,
        ['DECLARED', 'VALIDATED'],
        {
          Authorization: request.headers.authorization
        }
      ),
      generateBirthRegPoint(
        request.payload as fhir.Bundle,
        'mark-existing-application-registered',
        {
          Authorization: request.headers.authorization
        }
      )
    ])

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function birthCertifiedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const points = await Promise.all([
      generateEventDurationPoint(
        request.payload as fhir.Bundle,
        ['REGISTERED'],
        {
          Authorization: request.headers.authorization
        }
      )
    ])

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}
