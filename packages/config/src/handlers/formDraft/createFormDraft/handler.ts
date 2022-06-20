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
import Question, { IQuestion, IQuestionModel } from '@config/models/question'
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
import { requestSchema as questionReqeustSchema } from '@config/handlers/question/createQuestion/handler'
import { find, partition, isEmpty } from 'lodash'
import { Event } from '@config/models/certificate'

export interface ICreateDraft
  extends Pick<IFormDraftModel, 'event' | 'comment'> {
  questions: IQuestion[]
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

      try {
        await Question.insertMany(newDraft.questions)
      } catch (err) {
        return h.response(`Failed to create new questions. ${err}`).code(400)
      }

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

export const requestSchema = Joi.object({
  id: Joi.string(),
  event: Joi.string()
    .valid(...validEvent)
    .required(),
  questions: Joi.array().items(questionReqeustSchema).required(),
  comment: Joi.string().required()
})
