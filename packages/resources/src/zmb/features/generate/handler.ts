/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { generateRegistrationNumber } from '@resources/zmb/features/generate/service'
import { GENERATE_TYPE_RN } from '@resources/zmb/features/utils'

export interface IGeneratorHandlerPayload {
  trackingId: string
}

export async function generatorHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IGeneratorHandlerPayload
  switch (request.params.type) {
    case GENERATE_TYPE_RN:
      return {
        registrationNumber: await generateRegistrationNumber(payload.trackingId)
      }
    default:
      throw new Error('No defined type matched')
  }
}

export const requestSchema = Joi.object({
  trackingId: Joi.string(),
  practitionerId: Joi.string()
})

export const responseSchema = Joi.object({
  registrationNumber: Joi.string()
})
