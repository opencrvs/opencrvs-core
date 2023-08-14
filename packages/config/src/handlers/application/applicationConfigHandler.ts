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
} from '@config/models/config'
import { logger } from '@config/config/logger'
import { internal } from '@hapi/boom'
import * as Joi from 'joi'
import { merge, pick } from 'lodash'
import { getActiveCertificatesHandler } from '@config/handlers/certificate/certificateHandler'
import getSystems from '@config/handlers/system/systemHandler'
import { getDocumentUrl } from '@config/services/documents'
import { COUNTRY_CONFIG_URL } from '@config/config/constants'
import fetch from 'node-fetch'

export default async function configHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const [certificates, config, systems] = await Promise.all([
      getActiveCertificatesHandler(request, h).then((certs) =>
        Promise.all(
          certs.map(async (cert) => ({
            ...cert,
            svgCode: await getDocumentUrl(cert.svgCode, {
              Authorization: request.headers.authorization
            })
          }))
        )
      ),
      getApplicationConfig(request, h),
      getSystems(request, h)
    ])
    return {
      config,
      certificates,
      systems
    }
  } catch (ex) {
    logger.error(ex)
    return {}
  }
}

async function getConfigFromCountry() {
  const url = new URL('application-config', COUNTRY_CONFIG_URL).toString()
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Expected to get the aplication config from ${url}`)
  }
  return res.json()
}

export async function getApplicationConfig(
  request?: Hapi.Request,
  h?: Hapi.ResponseToolkit
) {
  const configFromCountryConfig = await getConfigFromCountry()
  try {
    const configFromDB = await ApplicationConfig.findOne({})
    const finalConfig = merge(configFromCountryConfig, configFromDB?.toObject())
    return finalConfig
  } catch (error) {
    throw internal(error.message)
  }
}

export async function getLoginConfigHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const refineConfigResponse = pick(await getApplicationConfig(), [
    'APPLICATION_NAME',
    'COUNTRY_LOGO',
    'PHONE_NUMBER_PATTERN',
    'LOGIN_BACKGROUND'
  ])
  return { config: refineConfigResponse }
}

export async function updateApplicationConfigHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const currentConfig = await getApplicationConfig()
    const changeConfig = request.payload as IApplicationConfigurationModel
    const applicationConfig = merge(currentConfig, changeConfig)
    await ApplicationConfig.findOneAndUpdate(
      {},
      { $set: applicationConfig },
      { upsert: true }
    )
    return h.response(applicationConfig).code(201)
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
    },
    PRINT_IN_ADVANCE: Joi.boolean()
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
    },
    PRINT_IN_ADVANCE: Joi.boolean()
  }),
  MARRIAGE: Joi.object().keys({
    REGISTRATION_TARGET: Joi.number(),
    FEE: {
      ON_TIME: Joi.number(),
      DELAYED: Joi.number()
    },
    PRINT_IN_ADVANCE: Joi.boolean()
  }),
  FIELD_AGENT_AUDIT_LOCATIONS: Joi.string(),
  EXTERNAL_VALIDATION_WORKQUEUE: Joi.boolean(),
  PHONE_NUMBER_PATTERN: Joi.string(),
  BIRTH_REGISTRATION_TARGET: Joi.number(),
  DEATH_REGISTRATION_TARGET: Joi.number(),
  NID_NUMBER_PATTERN: Joi.string(),
  INFORMANT_SIGNATURE: Joi.boolean(),
  DATE_OF_BIRTH_UNKNOWN: Joi.boolean(),
  INFORMANT_SIGNATURE_REQUIRED: Joi.boolean(),
  LOGIN_BACKGROUND: Joi.object({
    backgroundColor: Joi.string().allow('').optional(),
    backgroundImage: Joi.string().allow('').optional(),
    imageFit: Joi.string().allow('').optional()
  })
})
