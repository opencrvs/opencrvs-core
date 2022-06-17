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
  validEvent,
  DraftStatus,
  IFormDraft
} from '@config/models/formDraft'
import { Event } from '@config/models/certificate'
import { clearHearthElasticInfluxData } from '@config/services/formDraftService'

const STATUS_TRANSITION: Record<DraftStatus, DraftStatus[]> = {
  [DraftStatus.DRAFT]: [DraftStatus.DRAFT, DraftStatus.IN_PREVIEW],
  [DraftStatus.IN_PREVIEW]: [DraftStatus.PUBLISHED, DraftStatus.DRAFT],
  [DraftStatus.PUBLISHED]: []
}

export function isValidStatusTransition(
  currentStatus: DraftStatus,
  newStatus: DraftStatus
) {
  if (STATUS_TRANSITION[currentStatus].includes(newStatus)) {
    return true
  }
  return false
}

export interface IModifyFormDraftPayload {
  event: Event
  status: DraftStatus
}
export async function modifyDraftStatusHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { event, status: newStatus } =
    request.payload as IModifyFormDraftPayload

  const draft = await FormDraft.findOne({
    event
  })

  /* When the default form configuration is published */
  if (!draft) {
    if (newStatus !== DraftStatus.PUBLISHED) {
      return h
        .response(`Could not find any form draft for ${event} event`)
        .code(400)
    }

    try {
      const formDraft: IFormDraft = {
        event: event,
        status: newStatus,
        comment: 'Default configuration',
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

  const currentStatus = draft.status

  if (!isValidStatusTransition(currentStatus, newStatus)) {
    return h
      .response(
        `Invalid Operation. Can not update form draft status from ${draft.status} to ${newStatus}`
      )
      .code(400)
  }

  try {
    if (currentStatus === DraftStatus.IN_PREVIEW) {
      await clearHearthElasticInfluxData(request)
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
    .valid(DraftStatus.DRAFT, DraftStatus.IN_PREVIEW, DraftStatus.PUBLISHED)
    .required()
})
