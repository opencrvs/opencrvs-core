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
import * as Joi from 'joi'

export enum Code {
  CRVS_OFFICE = 'CRVS_OFFICE',
  ADMIN_STRUCTURE = 'ADMIN_STRUCTURE',
  HEALTH_FACILITY = 'HEALTH_FACILITY'
}

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
}).label('BundleEntry')

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
    .label('BundleEntries')
}).label('FhirBundle')

export const validationFailedAction: Hapi.RouteOptionsValidate['failAction'] = (
  _,
  _2,
  e
) => {
  throw e
}
