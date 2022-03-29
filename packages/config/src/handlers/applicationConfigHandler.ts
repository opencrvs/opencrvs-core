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
import ApplicationConfig, {
  IApplicationConfigurationModel
} from '@config/models/config' //   IApplicationConfigurationModel
import { logger } from '@config/config/logger'
import { badRequest } from '@hapi/boom'
import * as Joi from 'joi'
import { merge } from 'lodash'
import { getActiveCertificatesHandler } from '@config/handlers/certificate/certificateHandler'
import getQuestionsHandler from '@config/handlers/getQuestions/handler'

export default async function applicationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const certificateResponse = await getActiveCertificatesHandler(request, h)
    const questionsResponse = await getQuestionsHandler(request, h)
    let appConfig: IApplicationConfigurationModel | null
    // tslint:disable-next-line
    appConfig = await ApplicationConfig.findOne({})
    return {
      config: appConfig,
      certificates: certificateResponse,
      formConfig: {
        questionConfig: questionsResponse
      }
    }
  } catch (ex) {
    logger.error(ex)
    return {}
  }
}

export async function updateApplicationConfigHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const applicationConfig = request.payload as IApplicationConfigurationModel
    const existingApllicationConfig: IApplicationConfigurationModel | null =
      await ApplicationConfig.findOne({})
    if (!existingApllicationConfig) {
      throw badRequest('No existing application config found')
    }
    // Update existing application config fields
    merge(existingApllicationConfig, applicationConfig)

    await ApplicationConfig.update(
      { _id: existingApllicationConfig._id },
      existingApllicationConfig
    )
    return h.response(existingApllicationConfig).code(201)
  } catch (err) {
    logger.error(err)
    // return 400 if there is a validation error when saving to mongo
    return h.response().code(400)
  }
}

export const updateApplicationConfig = Joi.object({
  APPLICATION_NAME: Joi.string(),
  BACKGROUND_SYNC_BROADCAST_CHANNEL: Joi.string(),
  BIRTH: Joi.object().keys({
    REGISTRATION_TARGET: Joi.number(),
    LATE_REGISTRATION_TARGET: Joi.number(),
    FEE: {
      ON_TIME: Joi.number(),
      LATE: Joi.number(),
      DELAYED: Joi.number()
    }
  }),
  COUNTRY: Joi.string(),
  COUNTRY_LOGO: Joi.object().keys({
    fileName: Joi.string(),
    file: Joi.string()
  }),
  COUNTRY_LOGO_RENDER_WIDTH: Joi.number(),
  COUNTRY_LOGO_RENDER_HEIGHT: Joi.number(),
  CURRENCY: Joi.object().keys({
    isoCode: Joi.string(),
    languagesAndCountry: Joi.array().items(Joi.string())
  }),
  DEATH: Joi.object().keys({
    REGISTRATION_TARGET: Joi.number(),
    FEE: {
      ON_TIME: Joi.number(),
      DELAYED: Joi.number()
    }
  }),
  DESKTOP_TIME_OUT_MILLISECONDS: Joi.number(),
  LANGUAGES: Joi.string(),
  UI_POLLING_INTERVAL: Joi.number(),
  FIELD_AGENT_AUDIT_LOCATIONS: Joi.string(),
  APPLICATION_AUDIT_LOCATIONS: Joi.string(),
  INFORMANT_MINIMUM_AGE: Joi.number(),
  HIDE_EVENT_REGISTER_INFORMATION: Joi.boolean(),
  EXTERNAL_VALIDATION_WORKQUEUE: Joi.boolean(),
  SENTRY: Joi.string(),
  LOGROCKET: Joi.string(),
  PHONE_NUMBER_PATTERN: Joi.string(),
  BIRTH_REGISTRATION_TARGET: Joi.number(),
  DEATH_REGISTRATION_TARGET: Joi.number(),
  NID_NUMBER_PATTERN: Joi.string()
})
