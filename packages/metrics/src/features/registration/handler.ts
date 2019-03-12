import * as Hapi from 'hapi'
import { writePoints } from 'src/influxdb/client'
import { generateBirthRegPoint } from './pointGenerator'

export async function newBirthRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const points = []
  points.push(generateBirthRegPoint(request.payload as fhir.Bundle, 'new-reg'))
  writePoints(points)
  return h.response().code(200)
}

export async function birthRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const points = []
  points.push(
    generateBirthRegPoint(request.payload as fhir.Bundle, 'update-reg')
  )
  writePoints(points)
  return h.response().code(200)
}
