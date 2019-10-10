import * as Hapi from 'hapi'
import { writePoints } from '@metrics/influxdb/client'
import { generateBirthRegPoint } from '@metrics/features/registration/pointGenerator'
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
    writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}

export async function birthRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const points = []
  try {
    points.push(
      await generateBirthRegPoint(
        request.payload as fhir.Bundle,
        'mark-existing-application-registered',
        {
          Authorization: request.headers.authorization
        }
      )
    )
    writePoints(points)
  } catch (err) {
    return internal(err)
  }

  return h.response().code(200)
}
