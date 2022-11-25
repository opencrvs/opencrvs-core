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
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'

const RESOURCE_TYPES = [
  'Composition',
  'Task',
  'Patient',
  'RelatedPerson',
  'Encounter',
  'Observation'
]

const resourceSchema = Joi.object({
  resourceType: Joi.string()
    .required()
    .valid(...RESOURCE_TYPES)
})

const entrySchema = Joi.object({
  fullUrl: Joi.string().required(),
  resource: resourceSchema.required().unknown()
})

export const fhirBundleSchema = Joi.object({
  resourceType: Joi.string().required().valid('Bundle'),
  type: Joi.string().required().valid('document'),
  meta: Joi.object({
    lastUpdated: Joi.date().iso().required()
  }).required(),
  entry: Joi.array().items(entrySchema).required()
})

export function validationFailedAction(
  _: Hapi.Request,
  _2: Hapi.ResponseToolkit,
  e: Joi.ValidationError
) {
  throw e
}

export function eventNotificationHandler(
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  return h.response('Yay!')
}
