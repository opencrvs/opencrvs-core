/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as Hapi from '@hapi/hapi'
import { GATEWAY_URL } from '@countryconfig/constants'
import { createClient } from '@opencrvs/toolkit/api'
import { systemClient } from './system-client'
import { logger } from '@countryconfig/logger'
import { env } from '@countryconfig/environment'
import fetch from 'node-fetch'
import { z } from 'zod'

const NameSchema = z.object({
  firstname: z.string(),
  middlename: z.string().optional(),
  surname: z.string()
})

const AddressSchema = z.object({
  country: z.string(),
  addressType: z.string(),
  administrativeArea: z.string(),
  streetLevelDetails: z
    .object({
      street: z.string().optional()
    })
    .optional()
})

const SignatureSchema = z.object({
  path: z.string(),
  originalFilename: z.string(),
  type: z.string()
})

const DeclarationSchema = z.object({
  'informant.relation': z.string().optional(),
  'informant.email': z.string().optional(),
  'informant.name': NameSchema.optional(),
  'informant.phoneNo': z.string().optional(),
  'informant.address': AddressSchema.optional(),
  'informant.idType': z.string().optional(),
  'informant.nid': z.string().optional(),
  'informant.dob': z.string().optional(),
  'informant.verified': z.string().optional(),
  'child.name': NameSchema.optional(),
  'child.gender': z.string().optional(),
  'child.dob': z.string().optional(),
  'child.placeOfBirth': z.string().optional(),
  'child.birthLocationId': z.string().optional(),
  'mother.name': NameSchema.optional(),
  'mother.nationality': z.string().optional(),
  'mother.idType': z.string().optional(),
  'mother.verified': z.string().optional(),
  'mother.dob': z.string().optional(),
  'mother.dobUnknown': z.boolean().optional(),
  'mother.address': AddressSchema.optional(),
  'father.detailsNotAvailable': z.boolean().optional(),
  'father.reason': z.string().optional()
})

const AnnotationSchema = z.object({
  'review.comment': z.string().optional(),
  'review.signature': SignatureSchema.optional()
})

const NotificationRequestSchema = z.object({
  createdAtLocation: z.string(),
  declaration: DeclarationSchema,
  annotation: AnnotationSchema.optional(),
  eventId: z.string(),
  transactionId: z.string(),
  keepAssignment: z.boolean().optional()
})

interface LocationWithOffice {
  birthLocation: {
    id: string
    name: string
    administrativeAreaId: string | null
  } | null
  crvsOffice: {
    id: string
    name: string
    administrativeAreaId: string | null
  } | null
}

/**
 * Checks if system authentication is configured
 */
const isAuthConfigured = (): boolean =>
  Boolean(env.SYSTEM_CLIENT_ID && env.SYSTEM_CLIENT_SECRET)

/**
 * Creates an API client with system authentication
 */
async function createAuthenticatedClient() {
  const url = new URL('events', GATEWAY_URL).toString()

  if (!isAuthConfigured()) {
    throw new Error('System client credentials not configured')
  }

  const token = await systemClient.getToken()
  return createClient(url, `Bearer ${token}`)
}

/**
 * Finds the birth location and corresponding CRVS office based on administrativeAreaId
 */
async function findLocationAndOffice(
  birthLocationId: string
): Promise<LocationWithOffice> {
  const client = await createAuthenticatedClient()

  // Fetch all locations
  const locations = await client.locations.list.query()

  // Find the birth location
  const birthLocation = locations.find((loc) => loc.id === birthLocationId)

  if (!birthLocation) {
    logger.warn(`Birth location with id ${birthLocationId} not found`)
    return { birthLocation: null, crvsOffice: null }
  }

  const administrativeAreaId = birthLocation.administrativeAreaId

  if (!administrativeAreaId) {
    logger.warn(
      `Birth location ${birthLocationId} does not have an administrativeAreaId`
    )
    return {
      birthLocation: {
        id: birthLocation.id,
        name: birthLocation.name,
        administrativeAreaId: null
      },
      crvsOffice: null
    }
  }

  // Find CRVS_OFFICE with the same administrativeAreaId
  const crvsOffice = locations.find(
    (loc) =>
      loc.locationType === 'CRVS_OFFICE' &&
      loc.administrativeAreaId === administrativeAreaId
  )

  return {
    birthLocation: {
      id: birthLocation.id,
      name: birthLocation.name,
      administrativeAreaId
    },
    crvsOffice: crvsOffice
      ? {
          id: crvsOffice.id,
          name: crvsOffice.name,
          administrativeAreaId: crvsOffice.administrativeAreaId
        }
      : null
  }
}

/**
 * Handler for /api/events/<event id>/notify endpoint
 * Takes child.birthLocationId from declaration data, finds it and its administrativeAreaId,
 * then finds a CRVS_OFFICE type location with that same administrativeAreaId,
 * adds the office to the request body and forwards to gateway
 */
export async function notificationsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const parseResult = NotificationRequestSchema.safeParse(request.payload)

    if (!parseResult.success) {
      logger.warn('Invalid notification request payload:', parseResult.error)
      return h
        .response({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid request payload',
          details: parseResult.error.issues
        })
        .code(400)
    }

    const payload = parseResult.data
    const birthLocationId = payload.declaration['child.birthLocationId']

    // Find the CRVS office if birthLocationId is provided
    let modifiedPayload = { ...payload }
    if (birthLocationId) {
      const result = await findLocationAndOffice(birthLocationId)

      if (result.crvsOffice) {
        modifiedPayload = {
          ...payload,
          createdAtLocation: result.crvsOffice.id
        }
        logger.info(
          `Found CRVS office ${result.crvsOffice.name} for birth location ${birthLocationId}`
        )
      } else {
        logger.warn(
          `No CRVS office found for birth location ${birthLocationId}`
        )
      }
    }

    // Get system token and forward request to gateway
    const token = await systemClient.getToken()
    const targetUrl = `${GATEWAY_URL}/events/events/${payload.eventId}/notify`

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-correlation-id':
          (request.headers['x-correlation-id'] as string) ||
          `notifications-${Date.now()}`
      },
      body: JSON.stringify(modifiedPayload)
    })

    const responseBody = await response.json()

    // Return the gateway response
    const hapiResponse = h.response(responseBody).code(response.status)

    // Copy relevant headers from gateway response
    const contentType = response.headers.get('content-type')
    if (contentType) {
      hapiResponse.header('Content-Type', contentType)
    }

    return hapiResponse
  } catch (error) {
    logger.error('Error in notifications handler:', error)
    return h
      .response({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to process notification request'
      })
      .code(500)
  }
}
