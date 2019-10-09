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
      generateEventDurationPoint(request.payload as fhir.Bundle, 'DECLARED', {
        Authorization: request.headers.authorization
      }),
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
      generateEventDurationPoint(request.payload as fhir.Bundle, 'REGISTERED', {
        Authorization: request.headers.authorization
      })
    ])

    await writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}
