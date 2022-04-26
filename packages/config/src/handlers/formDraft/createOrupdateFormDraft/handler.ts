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
import { internal } from '@hapi/boom'
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
    [DraftStatus.IN_PREVIEW]: [DraftStatus.PUBLISHED, DraftStatus.DELETED],
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

export interface IQuestionsDraft
  extends Omit<
    IFormDraftModel,
    'version' | 'history' | 'updatedAt' | 'createdAt'
  > {
  questions: IQuestion[] | []
}

export interface IModifyDraftStatus {
  event: Event
  status: DraftStatus
}

export async function createOrUpdateFormDraftHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const questionsDraft = request.payload as IQuestionsDraft
  const eventRegex = new RegExp(`^(${questionsDraft.event}\.)`)
  let draft: IFormDraftModel | null = await FormDraft.findOne({
    event: questionsDraft.event
  })

  //update draft
  if (draft) {
    if (!isValidFormDraftOperation(draft.status, questionsDraft.status)) {
      return h
        .response(
          `Invalid Operation. Can not update form draft status from ${draft.status} to ${questionsDraft.status}`
        )
        .code(400)
    }

    const history: IHistory = {
      version: draft.version,
      status: draft.status,
      comment: draft.comment,
      updatedAt: draft.updatedAt
    }
    draft.history?.unshift(history)
    draft.status = DraftStatus.DRAFT
    draft.version = draft.version + 1
    draft.comment = questionsDraft.comment
    draft.updatedAt = Date.now()

    try {
      await FormDraft.updateOne({ _id: draft._id }, draft)
    } catch (err) {
      logger.error(err)
      return h
        .response(`Could not update draft for ${draft.event} event`)
        .code(400)
    }

    //create/update/delete questions
    if (!isEmpty(questionsDraft.questions)) {
      const existingQuestions: IQuestionModel[] = await Question.find({
        fieldId: eventRegex
      }).exec()

      const allQuestion = partition(questionsDraft.questions, (question) => {
        return find(existingQuestions, { fieldId: question.fieldId })
      })

      //update existing questions
      //allQuestion[0] contains list of modifying questions
      if (allQuestion[0]) {
        try {
          Promise.all(
            allQuestion[0].map(async (question) => {
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
      //allQuestion[1] contains list of new questions
      if (allQuestion[1]) {
        try {
          await Question.insertMany(allQuestion[1])
        } catch (err) {
          return h.response(`Failed to create new questions. ${err}`).code(400)
        }
      }

      //delete non-existing questions
      try {
        const deletedQuestionList = existingQuestions
          .filter(
            ({ fieldId: existQuestion }) =>
              !allQuestion[0].find(
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
  } else {
    //create draft
    try {
      const formDraft: IFormDraft = {
        event: questionsDraft.event,
        status: questionsDraft.status,
        comment: questionsDraft.comment,
        version: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      draft = await FormDraft.create(formDraft)
    } catch (e) {
      throw internal(e.message)
    }
  }

  return h.response(draft).code(201)
}

export async function modifyDraftStatusHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const formDraftStatusPayload = request.payload as IModifyDraftStatus

  const draft: IFormDraftModel | null = await FormDraft.findOne({
    event: formDraftStatusPayload.event
  })

  if (draft) {
    if (
      !isValidFormDraftOperation(draft.status, formDraftStatusPayload.status)
    ) {
      return h
        .response(
          `Invalid Operation. Can not update form draft status from ${draft.status} to ${formDraftStatusPayload.status}`
        )
        .code(400)
    }

    draft.status = formDraftStatusPayload.status
    draft.updatedAt = Date.now()

    try {
      await FormDraft.updateOne({ _id: draft._id }, draft)
    } catch (err) {
      logger.error(err)
      return h
        .response(`Could not update draft for ${draft.event} event`)
        .code(400)
    }
  } else {
    return h
      .response(
        `Could not found any form draft for ${formDraftStatusPayload.status}`
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
  enabled: Joi.string(),
  custom: Joi.boolean(),
  initialValue: Joi.string()
})

export const requestSchema = Joi.object({
  id: Joi.string(),
  event: Joi.string()
    .valid(...validEvent)
    .required(),
  questions: Joi.array().items(questionReqSchema),
  status: Joi.string().valid(DraftStatus.DRAFT).required(),
  comment: Joi.string(),
  deleted: Joi.array().items(Joi.string())
})

export const modifyFormDraftStatus = Joi.object({
  event: Joi.string()
    .valid(...validEvent)
    .required(),
  status: Joi.string()
    .valid(DraftStatus.IN_PREVIEW, DraftStatus.PUBLISHED)
    .required()
})
