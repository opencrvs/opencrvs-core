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
import Question, { IQuestion, validFieldType } from '@config/models/question'
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import { internal } from '@hapi/boom'

export default async function createQuestion(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const questionDto = request.payload as IQuestion
  try {
    await Question.create(questionDto)
  } catch (e) {
    throw internal(e.message)
  }

  return h.response().code(201)
}

const messageDescriptorSchema = Joi.object({
  id: Joi.string().required(),
  defaultMessage: Joi.string(),
  description: Joi.string()
})

export const requestSchema = Joi.object({
  fieldId: Joi.string().required(),
  fhirSectionCode: Joi.string().required(),
  fhirResource: {
    type: Joi.string().required(),
    code: Joi.string(),
    description: Joi.string(),
    categoryCode: Joi.string(),
    categoryDescription: Joi.string(),
    data: {
      valueQuantity: {
        unit: Joi.string(),
        system: Joi.string(),
        code: Joi.string(),
        value: Joi.string()
      }
    },
    valueField: Joi.string().required() // valueField defines the path in the data object where the field value is written
  },
  label: messageDescriptorSchema.required(),
  placeholder: Joi.string(),
  maxLength: Joi.number(),
  options: Joi.array().items(
    Joi.object({
      label: messageDescriptorSchema.required(),
      value: Joi.string().required()
    })
  ),
  fieldName: Joi.string().required(),
  fieldType: Joi.string()
    .valid(...validFieldType)
    .required(),
  sectionPositionForField: Joi.number().required(),
  enabled: Joi.boolean().required(),
  required: Joi.boolean().required(),
  custom: Joi.boolean()
})

export const responseSchema = Joi.object({})
