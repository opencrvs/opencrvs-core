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
import Question, {
  IQuestion,
  IQuestionModel,
  validFieldType
} from '@config/models/question'
import * as Hapi from '@hapi/hapi'
import { logger } from '@config/config/logger'
import * as Joi from 'joi'
import { messageSchema } from '@config/handlers/question/createQuestion/handler'

export default async function updateQuestion(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const question = request.payload as IQuestion & { id: string }
  const existingQuestion: IQuestionModel | null = await Question.findOne({
    _id: question.id
  })
  if (!existingQuestion) {
    throw new Error(`No question found by given id: ${question.id}`)
  }

  existingQuestion.fieldId = question.fieldId
  existingQuestion.label = question.label
  existingQuestion.placeholder = question.placeholder
  existingQuestion.maxLength = question.maxLength
  existingQuestion.fieldName = question.fieldName
  existingQuestion.fieldType = question.fieldType
  existingQuestion.preceedingFieldId = question.preceedingFieldId
  existingQuestion.required = question.required
  existingQuestion.enabled = question.enabled
  existingQuestion.custom = question.custom
  existingQuestion.initialValue = question.initialValue

  try {
    await Question.update({ _id: existingQuestion._id }, existingQuestion)
  } catch (err) {
    logger.error(err)
    // return 400 if there is a validation error when saving to mongo
    return h.response().code(400)
  }

  return h.response(existingQuestion).code(201)
}

export const requestSchema = Joi.object({
  id: Joi.string().required(),
  fieldId: Joi.string().required(),
  label: messageSchema,
  placeholder: messageSchema,
  description: messageSchema,
  tooltip: messageSchema,
  errorMessage: messageSchema,
  maxLength: Joi.number(),
  fieldName: Joi.string(),
  fieldType: Joi.string().valid(...validFieldType),
  preceedingFieldId: Joi.string(),
  required: Joi.boolean(),
  enabled: Joi.string(),
  custom: Joi.boolean(),
  initialValue: Joi.string()
})
