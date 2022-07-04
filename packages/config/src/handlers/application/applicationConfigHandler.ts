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
import { badRequest, internal } from '@hapi/boom'
import * as Joi from 'joi'
import { merge, pick } from 'lodash'
import { getActiveCertificatesHandler } from '@config/handlers/certificate/certificateHandler'
import getQuestionsHandler from '@config/handlers/question/getQuestions/handler'
import getFormDrafts from '@config/handlers/formDraft/getFormDrafts/handler'

export default async function configHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const [certificates, questionConfig, formDrafts, config] =
      await Promise.all([
        getActiveCertificatesHandler(request, h),
        getQuestionsHandler(request, h),
        getFormDrafts(request, h),
        getApplicationConfig(request, h)
      ])
    return {
      config,
      certificates,
      formConfig: {
        questionConfig,
        formDrafts
      }
    }
  } catch (ex) {
    logger.error(ex)
    return {}
  }
}

export async function getApplicationConfig(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  let applicationConfig: IApplicationConfigurationModel | null
  try {
    applicationConfig = await ApplicationConfig.findOne({})
  } catch (error) {
    throw internal(error.message)
  }
  return applicationConfig
}

export async function getLoginConfigHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  let loginConfig: IApplicationConfigurationModel | null
  try {
    loginConfig = await ApplicationConfig.findOne({})
  } catch (error) {
    throw internal(error.message)
  }
  const refineConfigResponse = pick(loginConfig, [
    'APPLICATION_NAME',
    'COUNTRY_LOGO'
  ])
  return { config: refineConfigResponse }
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
  BIRTH: Joi.object().keys({
    REGISTRATION_TARGET: Joi.number(),
    LATE_REGISTRATION_TARGET: Joi.number(),
    FEE: {
      ON_TIME: Joi.number(),
      LATE: Joi.number(),
      DELAYED: Joi.number()
    }
  }),
  COUNTRY_LOGO: Joi.object().keys({
    fileName: Joi.string(),
    file: Joi.string()
  }),
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
  FIELD_AGENT_AUDIT_LOCATIONS: Joi.string(),
  HIDE_EVENT_REGISTER_INFORMATION: Joi.boolean(),
  EXTERNAL_VALIDATION_WORKQUEUE: Joi.boolean(),
  PHONE_NUMBER_PATTERN: Joi.string(),
  BIRTH_REGISTRATION_TARGET: Joi.number(),
  DEATH_REGISTRATION_TARGET: Joi.number(),
  NID_NUMBER_PATTERN: Joi.string(),
  ADDRESSES: Joi.number().valid(...[1, 2])
})
