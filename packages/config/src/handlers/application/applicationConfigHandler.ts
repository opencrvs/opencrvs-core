/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as Hapi from '@hapi/hapi'
import ApplicationConfig, {
  IApplicationConfigurationModel
} from '@config/models/config'
import { logger } from '@config/config/logger'
import { badData, internal } from '@hapi/boom'
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
    if (process.env.NODE_ENV === 'development') {
      throw ex
    }
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

function stripIdFromApplicationConfig(config: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(config).map(([key, value]) => {
      let rest = value
      if (
        typeof value === 'object' &&
        value !== null &&
        '_id' in value &&
        key !== '_id'
      ) {
        const { _id, ...remaining } = value as { _id: any }
        rest = remaining
      }
      return [key, rest]
    })
  )
}

export async function getApplicationConfig(
  request?: Hapi.Request,
  h?: Hapi.ResponseToolkit
) {
  const configFromCountryConfig = await getConfigFromCountry()
  const stripApplicationConfig = stripIdFromApplicationConfig(
    configFromCountryConfig
  )
  const { error, value } = applicationConfigResponseValidation.validate(
    stripApplicationConfig,
    { allowUnknown: true }
  )
  if (error) {
    throw badData(error.details[0].message)
  }
  const updatedConfigFromCountryConfig = value

  try {
    const configFromDB = await ApplicationConfig.findOne({})
    const finalConfig = merge(
      updatedConfigFromCountryConfig,
      configFromDB?.toObject()
    )
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
    'LOGIN_BACKGROUND',
    'USER_NOTIFICATION_DELIVERY_METHOD',
    'INFORMANT_NOTIFICATION_DELIVERY_METHOD'
  ])
  return { config: refineConfigResponse }
}

export async function updateApplicationConfigHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    let applicationConfig
    const configFromDB = await ApplicationConfig.findOne({})
    const changeConfig = request.payload as IApplicationConfigurationModel

    if (configFromDB !== null) {
      applicationConfig = merge(configFromDB, changeConfig)
    }
    applicationConfig = changeConfig
    await ApplicationConfig.findOneAndUpdate(
      {},
      { $set: applicationConfig },
      { upsert: true }
    )

    return h.response(await getApplicationConfig()).code(201)
  } catch (err) {
    logger.error(err)
    // return 400 if there is a validation error when saving to mongo
    return h.response().code(400)
  }
}

export const updateApplicationConfig = Joi.object({
  APPLICATION_NAME: Joi.string(),
  COUNTRY_LOGO: Joi.object().keys({
    fileName: Joi.string(),
    file: Joi.string()
  }),
  LOGIN_BACKGROUND: Joi.object({
    backgroundColor: Joi.string().allow('').optional(),
    backgroundImage: Joi.string().allow('').optional(),
    imageFit: Joi.string().allow('').optional()
  }),
  CURRENCY: Joi.object().keys({
    isoCode: Joi.string(),
    languagesAndCountry: Joi.array().items(Joi.string())
  }),
  PHONE_NUMBER_PATTERN: Joi.string(),
  NID_NUMBER_PATTERN: Joi.string(),
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
  })
})

const applicationConfigResponseValidation = Joi.object({
  APPLICATION_NAME: Joi.string().required(),
  COUNTRY_LOGO: Joi.object()
    .keys({
      fileName: Joi.string().required(),
      file: Joi.string().required()
    })
    .required(),
  LOGIN_BACKGROUND: Joi.object({
    backgroundColor: Joi.string().allow('').optional(),
    backgroundImage: Joi.string().allow('').optional(),
    imageFit: Joi.string().allow('').optional()
  }).required(),
  CURRENCY: Joi.object()
    .keys({
      isoCode: Joi.string().required(),
      languagesAndCountry: Joi.array().items(Joi.string()).required()
    })
    .required(),
  PHONE_NUMBER_PATTERN: Joi.string().required(),
  NID_NUMBER_PATTERN: Joi.string().required(),
  BIRTH: Joi.object()
    .keys({
      REGISTRATION_TARGET: Joi.number().required(),
      LATE_REGISTRATION_TARGET: Joi.number().required(),
      FEE: Joi.object()
        .keys({
          ON_TIME: Joi.number().required(),
          LATE: Joi.number().required(),
          DELAYED: Joi.number().required()
        })
        .required(),
      PRINT_IN_ADVANCE: Joi.boolean().required()
    })
    .required(),
  DEATH: Joi.object()
    .keys({
      REGISTRATION_TARGET: Joi.number().required(),
      FEE: Joi.object()
        .keys({
          ON_TIME: Joi.number().required(),
          DELAYED: Joi.number().required()
        })
        .required(),
      PRINT_IN_ADVANCE: Joi.boolean().required()
    })
    .required(),
  MARRIAGE: Joi.object()
    .keys({
      REGISTRATION_TARGET: Joi.number().required(),
      FEE: Joi.object()
        .keys({
          ON_TIME: Joi.number().required(),
          DELAYED: Joi.number().required()
        })
        .required(),
      PRINT_IN_ADVANCE: Joi.boolean().required()
    })
    .required(),
  FIELD_AGENT_AUDIT_LOCATIONS: Joi.string().required(),
  DECLARATION_AUDIT_LOCATIONS: Joi.string().required(),
  EXTERNAL_VALIDATION_WORKQUEUE: Joi.boolean().required(),
  MARRIAGE_REGISTRATION: Joi.boolean().required(),
  DATE_OF_BIRTH_UNKNOWN: Joi.boolean().required(),
  INFORMANT_SIGNATURE: Joi.boolean().required(),
  INFORMANT_SIGNATURE_REQUIRED: Joi.boolean().required(),
  USER_NOTIFICATION_DELIVERY_METHOD: Joi.string().allow('').optional(),
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: Joi.string().allow('').optional()
})
