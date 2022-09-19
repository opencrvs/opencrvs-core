import * as Hapi from '@hapi/hapi'
import { generateAuditPoint } from '@metrics/features/registration/pointGenerator'
import { writePoints } from '@metrics/influxdb/client'
import { internal } from '@hapi/boom'

export async function newAuditHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  //TODO: get user action type and data from request and pass to generateAuditPoint

  const points = []
  try {
    points.push(
      await generateAuditPoint(request.payload as fhir.Bundle, 'LOGGED_IN', {
        Authorization: request.headers.authorization,
        'x-correlation-id': request.headers['x-correlation-id']
      })
    )
    await writePoints(points)
  } catch (err) {
    return internal(err)
  }
  return h.response().code(200)
}
