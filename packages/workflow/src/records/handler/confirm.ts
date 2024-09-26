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
import * as z from 'zod'
import { getToken } from '@workflow/utils/auth-utils'
import { validateRequest } from '@workflow/utils/index'
import { useExternalValidationQueue } from '@opencrvs/commons/message-queue'
import { REDIS_HOST } from '@workflow/constants'
import { SUPPORTED_PATIENT_IDENTIFIER_CODES } from '@opencrvs/commons/types'
import * as Hapi from '@hapi/hapi'

const requestSchema = z.object({
  registrationNumber: z.string(),
  childIdentifiers: z
    .array(
      z.object({
        type: z.enum(SUPPORTED_PATIENT_IDENTIFIER_CODES),
        value: z.string()
      })
    )
    .optional(),
  trackingId: z.string()
})

const { recordValidated } = useExternalValidationQueue(REDIS_HOST)

export async function confirmRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const token = getToken(request)
  const payload = validateRequest(requestSchema, request.payload)
  const recordId = request.params.id

  const { registrationNumber, childIdentifiers, trackingId } = payload

  await recordValidated({
    recordId,
    identifiers: childIdentifiers || [],
    registrationNumber,
    trackingId,
    token
  })

  return h.response().code(202)
}
