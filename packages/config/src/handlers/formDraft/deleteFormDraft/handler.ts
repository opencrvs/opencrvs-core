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
import { logger } from '@config/config/logger'
import * as Joi from 'joi'
import FormDraft, {
  IFormDraftModel,
  validEvent,
  DraftStatus
} from '@config/models/formDraft'
import Question from '@config/models/question'
import { Event } from '@config/models/certificate'
import { isValidFormDraftOperation } from '@config/handlers/formDraft/createOrupdateFormDraft/handler'

export interface IDeleteFormDraftPayload {
  event: Event
}

export async function deleteFormDraftHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const formDraft = request.payload as IDeleteFormDraftPayload

  const draft = (await FormDraft.findOne({
    event: formDraft.event
  })) as IFormDraftModel

  if (!isValidFormDraftOperation(draft.status, DraftStatus.DELETED)) {
    return h
      .response(`Invalid Operation. Can not delete ${draft.status} form draft.`)
      .code(400)
  }

  if (draft) {
    try {
      const eventRegex = new RegExp(`^(${formDraft.event}\.)`)
      await Question.deleteMany({ fieldId: eventRegex })
    } catch (err) {
      return h.response(`Failed to delete question. ${err}`).code(400)
    }

    draft.status = DraftStatus.DELETED
    draft.version = 0
    draft.updatedAt = Date.now()
    draft.history = []

    try {
      await FormDraft.updateOne({ _id: draft._id }, draft)
      return h.response(draft).code(201)
    } catch (err) {
      logger.error(err)
      return h
        .response(`Could not delete draft for ${draft.event} event`)
        .code(400)
    }
  } else {
    return h.response(`No form draft found for ${formDraft.event}`).code(400)
  }
}

export const requestSchema = Joi.object({
  event: Joi.string()
    .valid(...validEvent)
    .required()
})
