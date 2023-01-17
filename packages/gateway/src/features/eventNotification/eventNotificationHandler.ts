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
import { badRequest } from '@hapi/boom'
import { fetchFHIR } from '@gateway/features/fhir/utils'

const RESOURCE_TYPES = ['Patient', 'RelatedPerson', 'Encounter', 'Observation']

const resourceSchema = Joi.object({
  resourceType: Joi.string()
    .required()
    .valid(...RESOURCE_TYPES)
})

const compositionSchema = Joi.object({
  fullUrl: Joi.string().required(),
  resource: Joi.object({
    resourceType: Joi.string().required().valid('Composition')
  })
    .required()
    .unknown()
})

const taskSchema = Joi.object({
  fullUrl: Joi.string().required(),
  resource: Joi.object({
    resourceType: Joi.string().required().valid('Task')
  })
    .required()
    .unknown()
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
  entry: Joi.array()
    .ordered(compositionSchema, taskSchema)
    .items(entrySchema)
    .required()
})

export function validationFailedAction(
  _: Hapi.Request,
  _2: Hapi.ResponseToolkit,
  e: Joi.ValidationError
) {
  throw e
}

function validateTask(bundle: fhir.Bundle) {
  const taskEntry = bundle.entry?.find(
    (entry) => entry.resource?.resourceType === 'Task'
  )
  const compositionEntry = bundle.entry?.find(
    (entry) => entry.resource?.resourceType === 'Composition'
  )
  if (!taskEntry) {
    throw new Error('Task entry not found in bundle')
  }
  if (!compositionEntry) {
    throw new Error('Composition entry not found in bundle')
  }
  const task = taskEntry.resource as fhir.Task
  if (task.status !== 'draft') {
    throw new Error('Task status should be draft')
  }
  if (task.focus?.reference !== compositionEntry.fullUrl) {
    throw new Error('Task must reference the composition entry')
  }
}

export async function eventNotificationHandler(
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    validateTask(req.payload as fhir.Bundle)
  } catch (e) {
    return badRequest(e)
  }
  return fetchFHIR(
    '',
    { Authorization: req.headers.authorization },
    'POST',
    JSON.stringify(req.payload)
  )
}
