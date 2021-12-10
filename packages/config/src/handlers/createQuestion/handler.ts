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
import Question, { IQuestion, validFieldType } from '@config/models/Question'
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

export const requestSchema = Joi.object({
  label: Joi.object({
    id: Joi.string().required(),
    defaultMessage: Joi.string(),
    description: Joi.string()
  }).required(),
  placeholder: Joi.string(),
  fieldName: Joi.string().required(),
  fieldType: Joi.string()
    .valid(...validFieldType)
    .required(),
  fieldId: Joi.string().required(),
  sectionPositionForField: Joi.number().required(),
  fhirSchema: Joi.string().required(),
  enabled: Joi.boolean().required(),
  custom: Joi.boolean(),
  required: Joi.boolean().required()
})

export const responseSchema = Joi.object({})
