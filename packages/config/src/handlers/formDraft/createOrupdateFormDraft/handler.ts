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
import FormDraft, {
  IFormDraft,
  IHistory,
  IFormDraftModel,
  validEvent,
  DraftStatus
} from '@config/models/formDraft'
import { messageSchema } from '@config/handlers/question/createQuestion/handler'
import { find, partition, isEmpty } from 'lodash'
import { Event } from '@config/models/certificate'
import {
  clearHearthElasticInfluxData,
  clearQuestionConfigs
} from '@config/services/formDraftService'

export function isValidFormDraftOperation(
  currentStatus: string,
  newStatus: string
) {
  const validStatusMapping = {
    [DraftStatus.DRAFT]: [
      DraftStatus.DRAFT,
      DraftStatus.IN_PREVIEW,
      DraftStatus.DELETED
    ],
    [DraftStatus.IN_PREVIEW]: [DraftStatus.PUBLISHED, DraftStatus.DRAFT],
    [DraftStatus.PUBLISHED]: [null],
    [DraftStatus.DELETED]: [DraftStatus.DRAFT]
  }

  if (
    currentStatus &&
    validStatusMapping[currentStatus] &&
    !validStatusMapping[currentStatus].includes(newStatus)
  ) {
    return false
  }

  return true
}

export interface ICreateDraft
  extends Pick<IFormDraftModel, 'event' | 'comment'> {
  questions: IQuestion[] | []
}

export interface IModifyDraftStatus {
  event: Event
  status: DraftStatus
}

export async function createFormDraftHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const newDraft = request.payload as ICreateDraft
  const eventRegex = new RegExp(`^(${newDraft.event}\.)`)
  const oldDraft: IFormDraftModel | null = await FormDraft.findOne({
    event: newDraft.event
  })

  if (!oldDraft) {
    //create draft
    try {
      const formDraft: IFormDraft = {
        event: newDraft.event,
        status: DraftStatus.DRAFT,
        comment: newDraft.comment,
        history: [],
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      await FormDraft.create(formDraft)
      return h.response(formDraft).code(201)
    } catch (e) {
      return h.response('Could not create draft').code(400)
    }
  }

  //update draft
  const history: IHistory = {
    version: oldDraft.version,
    status: oldDraft.status,
    comment: oldDraft.comment,
    updatedAt: oldDraft.updatedAt
  }

  oldDraft.history.unshift(history)
  oldDraft.status = DraftStatus.DRAFT
  oldDraft.version = oldDraft.version + 1
  oldDraft.comment = newDraft.comment
  oldDraft.updatedAt = Date.now()

  try {
    await FormDraft.updateOne({ _id: oldDraft._id }, oldDraft)
  } catch (err) {
    logger.error(err)
    return h
      .response(`Could not update draft for ${oldDraft.event} event`)
      .code(400)
  }

  //create/update/delete questions
  if (!isEmpty(newDraft.questions)) {
    const existingQuestions: IQuestionModel[] = await Question.find({
      fieldId: eventRegex
    }).exec()

    const [modifiedQuestions, newQuestions] = partition(
      newDraft.questions,
      (question) => {
        return find(existingQuestions, { fieldId: question.fieldId })
      }
    )

    //update existing questions
    if (modifiedQuestions) {
      try {
        await Promise.all(
          modifiedQuestions.map(async (question) => {
            await Question.updateOne({ fieldId: question.fieldId }, question)
          })
        )
      } catch (err) {
        return h
          .response(`Failed to update existing question. ${err}`)
          .code(400)
      }
    }

    //create new questions
    if (newQuestions) {
      try {
        await Question.insertMany(newQuestions)
      } catch (err) {
        return h.response(`Failed to create new questions. ${err}`).code(400)
      }
    }

    //delete non-existing questions
    try {
      const deletedQuestionList = existingQuestions
        .filter(
          ({ fieldId: existQuestion }) =>
            !modifiedQuestions.find(
              ({ fieldId: newQuestion }) => newQuestion === existQuestion
            )
        )
        .map((question) => question.fieldId)
      await Question.deleteMany({ fieldId: { $in: deletedQuestionList } })
    } catch (err) {
      return h.response(`Failed to delete question. ${err}`).code(400)
    }
  } else {
    //deleting question for requested event type
    try {
      await Question.deleteMany({ fieldId: eventRegex })
    } catch (err) {
      return h.response(`Failed to delete questions. ${err}`).code(400)
    }
  }

  return h.response(oldDraft).code(201)
}

export async function modifyDraftStatusHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { event, status: newStatus } = request.payload as IModifyDraftStatus

  const draft = await FormDraft.findOne({
    event
  })

  if (!draft) {
    return h
      .response(`Could not find any form draft for ${event} event`)
      .code(400)
  }

  if (!isValidFormDraftOperation(draft.status, newStatus)) {
    return h
      .response(
        `Invalid Operation. Can not update form draft status from ${draft.status} to ${newStatus}`
      )
      .code(400)
  }

  try {
    if (
      (draft.status === DraftStatus.IN_PREVIEW &&
        newStatus === DraftStatus.DRAFT) ||
      newStatus === DraftStatus.DELETED
    ) {
      await clearHearthElasticInfluxData(request)
      if (newStatus === DraftStatus.DELETED) {
        await clearQuestionConfigs(event)
      }
    }
    draft.status = newStatus
    draft.updatedAt = Date.now()
    await FormDraft.updateOne({ _id: draft._id }, draft)
  } catch (err) {
    logger.error(err)
    return h
      .response(
        `Could not update draft for ${draft.event} event. Error : ${err}`
      )
      .code(400)
  }

  return h.response(draft).code(201)
}

export const questionReqSchema = Joi.object({
  id: Joi.string(),
  fieldId: Joi.string(),
  label: messageSchema,
  placeholder: messageSchema,
  maxLength: Joi.number(),
  fieldName: Joi.string(),
  fieldType: Joi.string().valid(...validFieldType),
  preceedingFieldId: Joi.string(),
  required: Joi.boolean(),
  enabled: Joi.string().allow(''),
  custom: Joi.boolean(),
  initialValue: Joi.string()
})

export const requestSchema = Joi.object({
  id: Joi.string(),
  event: Joi.string()
    .valid(...validEvent)
    .required(),
  questions: Joi.array().items(questionReqSchema).required(),
  comment: Joi.string().required()
})

export const modifyFormDraftStatus = Joi.object({
  event: Joi.string()
    .valid(...validEvent)
    .required(),
  status: Joi.string()
    .valid(
      DraftStatus.DRAFT,
      DraftStatus.IN_PREVIEW,
      DraftStatus.PUBLISHED,
      DraftStatus.DELETED
    )
    .required()
})
