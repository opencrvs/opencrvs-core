import * as Hapi from '@hapi/hapi'
import { generateTimeLoggedPoint } from '@metrics/features/registration/pointGenerator'
import { writePoints } from '@metrics/influxdb/client'
import { internal } from '@hapi/boom'

export async function newAuditHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const points = []
  try {
    points.push(
      await generateTimeLoggedPoint(request.payload as fhir.Bundle, {
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
