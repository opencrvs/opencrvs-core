import * as Hapi from 'hapi'
import {
  createBirthRegistrationHandler,
  markBirthAsRegisteredHandler,
  markBirthAsCertifiedHandler
} from '../registration/handler'
import { hasBirthRegistrationNumber } from '../registration/fhir/fhir-utils'
import updateTaskHandler from '../task/handler'
import { HEARTH_URL } from 'src/constants'
import fetch, { RequestInit } from 'node-fetch'
import { logger } from 'src/logger'
import { isUserAuthorized } from './auth'

export enum Events {
  BIRTH_NEW_DEC = '/events/birth/new-declaration',
  BIRTH_UPDATE_DEC = '/events/birth/update-declaration',
  BIRTH_NEW_REG = '/events/birth/new-registration',
  BIRTH_MARK_REG = '/events/birth/mark-registered',
  BIRTH_MARK_CERT = '/events/birth/mark-certified',
  BIRTH_MARK_VOID = '/events/birth/mark-voided',
  UNKNOWN = 'unknown'
}

function detectEvent(request: Hapi.Request): Events {
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
          if (!hasBirthRegistrationNumber(fhirBundle)) {
            return Events.BIRTH_MARK_REG
          } else {
            return Events.BIRTH_MARK_CERT
          }
        } else {
          return Events.BIRTH_NEW_DEC
        }
      }
      if (firstEntry.resourceType === 'Task' && firstEntry.id) {
        return Events.BIRTH_MARK_REG
      }
    }
  }

  if (request.method === 'put' && request.path.includes('/fhir/Task')) {
    return Events.BIRTH_MARK_VOID
  }

  return Events.UNKNOWN
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

  let path = request.path
  if (request.method === 'post' || request.method === 'put') {
    requestOpts.body = JSON.stringify(request.payload)
  } else if (request.method === 'get' && request.url.path) {
    path = request.url.path
  }
  const res = await fetch(HEARTH_URL + path.replace('/fhir', ''), requestOpts)
  const resBody = await res.json()
  const response = h.response(resBody)

  response.code(res.status)
  res.headers.forEach((headerVal, headerName) => {
    response.header(headerName, headerVal)
  })

  return response
}

export async function fhirWorkflowEventHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const event = detectEvent(request)
  logger.info(`Event detected: ${event}`)

  // Unknown event are allowed through to Hearth by default.
  // We can restrict what resources can be used in Hearth directly if necessary
  if (
    event !== Events.UNKNOWN &&
    !isUserAuthorized(request.auth.credentials.scope, event)
  ) {
    return h.response().code(401)
  }

  let response

  switch (event) {
    case Events.BIRTH_NEW_DEC:
      response = await createBirthRegistrationHandler(request, h)
      break
    case Events.BIRTH_MARK_REG:
      response = await markBirthAsRegisteredHandler(request, h)
      break
    case Events.BIRTH_MARK_CERT:
      response = await markBirthAsCertifiedHandler(request, h)
      break
    case Events.BIRTH_MARK_VOID:
      response = await updateTaskHandler(request, h)
      break
    default:
      // forward as-is to hearth
      response = await forwardToHearth(request, h)
  }

  // TODO: send to event channels here

  return response
}
