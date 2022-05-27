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
import FormDraft, { validEvent } from '@config/models/formDraft'
import { Event } from '@config/models/certificate'
import {
  clearHearthElasticInfluxData,
  clearQuestionConfigs
} from '@config/services/formDraftService'

export interface IDeleteFormDraftPayload {
  event: Event
}

export async function deleteFormDraftHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { event } = request.payload as IDeleteFormDraftPayload

  try {
    await Promise.all([
      clearHearthElasticInfluxData(request),
      clearQuestionConfigs(event),
      FormDraft.findOneAndRemove({ event })
    ])
  } catch (err) {
    logger.error(err)
    return h
      .response(`Could not delete draft for ${event} event. Error : ${err}`)
      .code(400)
  }

  return h.response().code(204)
}

export const requestSchema = Joi.object({
  event: Joi.string()
    .valid(...validEvent)
    .required()
})
