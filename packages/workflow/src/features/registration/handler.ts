import * as Hapi from 'hapi'
import * as Joi from 'joi'
import fetch from 'node-fetch'
import { fhirUrl } from 'src/constants'
import { pushTrackingId } from './fhir/fhir-doc-modifier'
import { sendBirthNotification } from './utils'
import { getTrackingId } from './fhir/fhir-utils'

export default async function submitBirthDeclarationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = pushTrackingId(JSON.parse(
    request.payload.toString()
  ) as fhir.Bundle)
  const res = await fetch(fhirUrl, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })

  if (!res.ok) {
    /* 
        Based res.status we will know whether there is any dup error or not 
        If any, then we will resubmit the declaration (coming as part of another PR)
      */
    throw new Error(
      `FHIR post to /fhir failed with [${res.status}] body: ${await res.text()}`
    )
  }

  const resBody = await res.json()
  if (
    !resBody ||
    !resBody.entry ||
    !resBody.entry[0] ||
    !resBody.entry[0].response ||
    !resBody.entry[0].response.location
  ) {
    throw new Error(`FHIR response did not send a valid response`)
  }

  /* sending notification to the contact */
  sendBirthNotification(payload, {
    Authorization: request.headers['authorization']
  })

  /* returning the newly created tracking id */
  return { trackingid: getTrackingId(payload) }
}

export const fhirBundleSchema = Joi.object({
  resourceType: Joi.string().required(),
  type: Joi.string().optional(),
  entry: Joi.array().required()
})
