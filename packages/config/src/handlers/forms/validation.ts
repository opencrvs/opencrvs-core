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
import * as Joi from 'joi'

const messageDescriptor = Joi.object({
  defaultMessage: Joi.string().allow(''),
  id: Joi.string().required(),
  description: Joi.string()
})

const previewGroup = Joi.object({
  id: Joi.string().required(),
  label: messageDescriptor.required(),
  fieldToRedirect: Joi.string(),
  delimiter: Joi.string(),
  required: Joi.boolean(),
  initialValue: Joi.string()
})

const conditional = Joi.object({
  description: Joi.string(),
  action: Joi.string().required(),
  expression: Joi.string().allow('').required()
})

/*
 * TODO: The field validation needs to be made stricter
 */
const field = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  label: messageDescriptor,
  conditionals: Joi.array().items(conditional)
}).unknown()

const group = Joi.object({
  id: Joi.string().required(),
  title: messageDescriptor,
  fields: Joi.array().items(field).required(),
  previewGroups: Joi.array().items(previewGroup),
  conditionals: Joi.array().items(conditional),
  preventContinueIfError: Joi.boolean()
})

const section = Joi.object({
  id: Joi.string().required(),
  viewType: Joi.string().valid('form', 'hidden').required(),
  name: messageDescriptor.required(),
  title: messageDescriptor,
  groups: Joi.array().items(group).required(),
  mapping: Joi.object().unknown()
})

const form = Joi.object({
  sections: Joi.array().items(section)
})

export const registrationForms = Joi.object({
  version: Joi.string(),
  birth: form,
  death: form,
  marriage: form
})
