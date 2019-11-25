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
import {
  ILocationDataResponse,
  getLocations,
  verifyAndFetchNidInfo
} from '@resources/bgd/features/administrative/service/service'

export interface INidVerification {
  dob: string
  nid: string
}

export async function locationsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<ILocationDataResponse> {
  let result
  try {
    result = await getLocations()
  } catch (err) {
    throw Error(err)
  }
  return result
}

export async function nidVerificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as INidVerification
  return verifyAndFetchNidInfo(payload.nid, payload.dob)
}

export const nidVerificationReqSchema = Joi.object({
  dob: Joi.string(),
  nid: Joi.string()
})

export const nidResponseSchema = Joi.object({
  data: Joi.object({
    name: Joi.array().items(
      Joi.object({
        use: Joi.string(),
        family: Joi.string()
      })
    ),
    gender: Joi.string()
  }),
  operationResult: Joi.object({
    success: Joi.boolean(),
    error: Joi.object({
      errorMessage: Joi.string(),
      errorCode: Joi.number()
    })
  })
})
