import * as Hapi from 'hapi'
import fetch from 'node-fetch'
import { fhirUrl } from 'src/constants'
import {
  modifyRegistrationBundle,
  markBundleAsRegistered
} from './fhir/fhir-bundle-modifier'
import { sendBirthNotification } from './utils'
import { getTrackingId, getBirthRegistrationNumber } from './fhir/fhir-utils'
import { EVENT_TYPE } from './fhir/constants'
import { getToken } from 'src/utils/authUtils'
import { logger } from 'src/logger'

export async function createBirthRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const payload = modifyRegistrationBundle(
      request.payload as fhir.Bundle,
      EVENT_TYPE.BIRTH,
      getToken(request)
    )

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
        `FHIR post to /fhir failed with [${
          res.status
        }] body: ${await res.text()}`
      )
    }

    /* sending notification to the contact */
    sendBirthNotification(payload, {
      Authorization: request.headers['authorization']
    })
    /* returning the newly created tracking id */
    return { trackingid: getTrackingId(payload) }
  } catch (error) {
    logger.error(`Workflow/createBirthRegistrationHandler: error: ${error}`)
    throw new Error(error)
  }
}

export async function markBirthAsRegisteredHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const payload = markBundleAsRegistered(
      request.payload as fhir.Bundle,
      getToken(request)
    )

    /* hearth will do put calls if it finds id on the bundle */
    const res = await fetch(fhirUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/fhir+json'
      }
    })
    if (!res.ok) {
      throw new Error(
        `FHIR post to /fhir failed with [${
          res.status
        }] body: ${await res.text()}`
      )
    }
    // TODO: need to send notification here

    /* returning the newly created birth registration number */
    return { BirthRegistrationNumber: getBirthRegistrationNumber(payload) }
  } catch (error) {
    logger.error(`Workflow/markBirthAsRegisteredHandler: error: ${error}`)
    throw new Error(error)
  }
}
