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
import FormDraft, { validEvent, DraftStatus } from '@config/models/formDraft'
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

export interface IModifyDraftStatus {
  event: Event
  status: DraftStatus
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
        draft.history = []
        draft.comment = ''
        draft.version = 0
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

export const requestSchema = Joi.object({
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
