import * as Hapi from 'hapi'
import {
  createBirthRegistrationHandler,
  markBirthAsRegisteredHandler
} from '../registration/handler'
import updateTaskHandler from '../task/handler'
import { HEARTH_URL } from 'src/constants'
import fetch, { RequestInit } from 'node-fetch'
import { logger } from 'src/logger'

function detectEvent(request: Hapi.Request): string {
  if (
    request.method === 'post' &&
    (request.path === '/fhir' || request.path === '/fhir/')
  ) {
    const fhirBundle = request.payload as fhir.Bundle
    if (
      fhirBundle.entry &&
      fhirBundle.entry[0] &&
      fhirBundle.entry[0].resource
    ) {
      const firstEntry = fhirBundle.entry[0].resource
      if (firstEntry.resourceType === 'Composition') {
        if (firstEntry.id) {
          // might need to switch between mark as registered and update registration here eventually
          return '/events/birth/mark-registered'
        } else {
          return '/events/birth/new-declaration'
        }
      }
    }
  }

  if (request.method === 'put' && request.path.includes('/fhir/Task')) {
    return '/events/birth/mark-voided'
  }

  return 'unknown'
}

async function forwardToHearth(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  logger.info(
    `Forwarding to Hearth unchanged: ${request.method} ${request.path}`
  )

  const requestOpts: RequestInit = {
    method: request.method,
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  }
  if (request.method === 'post' || request.method === 'put') {
    requestOpts.body = JSON.stringify(request.payload)
  }

  const res = await fetch(HEARTH_URL + request.path.replace('/fhir', ''))
  const resBody = await res.json()
  const response = h.response(resBody)

  response.code(res.status)
  for (const header in res.headers) {
    if (res.headers.hasOwnProperty(header)) {
      response.header(header, res.headers[header])
    }
  }

  return response
}

export async function fhirWorkflowEventHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const event = detectEvent(request)
  logger.info(`Event detected: ${event}`)

  // TODO handle user scopes

  let response

  switch (event) {
    case '/events/birth/new-declaration':
      response = await createBirthRegistrationHandler(request, h)
      break
    case '/events/birth/update-declaration':
      break
    case '/events/birth/new-registration':
      break
    case '/events/birth/mark-registered':
      response = await markBirthAsRegisteredHandler(request, h)
      break
    case '/events/birth/mark-certified':
      break
    case '/events/birth/mark-voided':
      response = await updateTaskHandler(request, h)
      break
    default:
      // forward as-is to hearth
      response = await forwardToHearth(request, h)
  }

  // TODO: send to event channels here

  return response
}
