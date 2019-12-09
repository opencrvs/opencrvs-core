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
  generateInCompleteFieldPoints,
  generateBirthRegPoint,
  generateDeathRegPoint,
  generateEventDurationPoint,
  generatePaymentPoint,
  generateTimeLoggedPoint
} from '@metrics/features/registration/pointGenerator'
import { internal } from 'boom'
import { populateBundleFromPayload } from '@metrics/features/registration/utils'

export async function baseHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const points = []
  try {
    points.push(generateTimeLoggedPoint(request.payload as fhir.Bundle))
    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function inProgressHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const points = await generateInCompleteFieldPoints(
      request.payload as fhir.Bundle,
      {
        Authorization: request.headers.authorization
      }
    )
    points.push(generateTimeLoggedPoint(request.payload as fhir.Bundle))
    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

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
      ),
      generateTimeLoggedPoint(request.payload as fhir.Bundle)
    )
    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function markBirthRegisteredHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const bundle = await populateBundleFromPayload(
      request.payload as fhir.Bundle | fhir.Task,
      request.headers.authorization
    )

    const points = await Promise.all([
      generateEventDurationPoint(
        bundle,
        ['DECLARED', 'VALIDATED', 'WAITING_VALIDATION'],
        {
          Authorization: request.headers.authorization
        }
      ),
      generateBirthRegPoint(bundle, 'mark-existing-application-registered', {
        Authorization: request.headers.authorization
      }),
      generateTimeLoggedPoint(bundle)
    ])

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}
export async function newDeathRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const points = []
  try {
    points.push(
      await generateDeathRegPoint(
        request.payload as fhir.Bundle,
        'register-new-application',
        {
          Authorization: request.headers.authorization
        }
      ),
      generateTimeLoggedPoint(request.payload as fhir.Bundle)
    )
    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}
export async function markDeathRegisteredHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const bundle = await populateBundleFromPayload(
      request.payload as fhir.Bundle | fhir.Task,
      request.headers.authorization
    )

    const points = await Promise.all([
      generateEventDurationPoint(
        bundle,
        ['DECLARED', 'VALIDATED', 'WAITING_VALIDATION'],
        {
          Authorization: request.headers.authorization
        }
      ),
      generateDeathRegPoint(bundle, 'mark-existing-application-registered', {
        Authorization: request.headers.authorization
      }),
      generateTimeLoggedPoint(bundle)
    ])

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function markCertifiedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const points = await Promise.all([
      generatePaymentPoint(request.payload as fhir.Bundle),
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

export async function markValidatedHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const points = await Promise.all([
      generateEventDurationPoint(request.payload as fhir.Bundle, ['DECLARED'], {
        Authorization: request.headers.authorization
      }),
      generateTimeLoggedPoint(request.payload as fhir.Bundle)
    ])

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}
