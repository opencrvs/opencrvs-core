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
import { logger } from '@opencrvs/commons'
import { badData } from '@hapi/boom'
import * as Joi from 'joi'
import { pick } from 'lodash'
import getSystems from '@config/handlers/system/systemHandler'
import { env } from '@config/environment'
import fetch from 'node-fetch'
import { getToken } from '@config/utils/auth'
import { pipe } from 'fp-ts/lib/function'
import { verifyToken } from '@config/utils/verifyToken'
import { getAcceptedScopesFromToken } from '@opencrvs/commons/authentication'

export default async function configHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const [certificates, config, systems] = await Promise.all([
      getCertificatesConfig(request, h),
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

async function getCertificatesConfig(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const authToken = getToken(request)
  const decodedOrError = pipe(authToken, verifyToken)
  if (decodedOrError._tag === 'Left') {
    return []
  }

  const printCertifiedCopiesScope = getAcceptedScopesFromToken(authToken, [
    'record.print-certified-copies'
  ])
  if (printCertifiedCopiesScope.length === 0) {
    return []
  }

  const url = new URL(`/certificates`, env.COUNTRY_CONFIG_URL).toString()

  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${authToken}` }
  })

  if (!res.ok) {
    throw new Error(
      `Failed to fetch certificates configuration: ${res.statusText} ${url}`
    )
  }

  const certificateConfigs = await res.json()

  // @TODO: new 1.9.11 will be ported when working on this task: https://github.com/opencrvs/opencrvs-core/issues/12039
  // If there are no templateIds specified in the scope, all the certificates configuration will be fetched
  // if (!templateIds.length) {
  return certificateConfigs
  // }

  // If there are templateIds specified in the scope, only the certificates configuration matching those templateIds will be fetched
  // if (templateIds.length > 0) {
  //   return certificateConfigs.filter((config: { id: string }) =>
  //     templateIds.includes(config.id)
  //   )
  // }
}

async function getConfigFromCountry(authToken?: string) {
  const url = new URL('config/application', env.COUNTRY_CONFIG_URL).toString()

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Expected to get the application config from ${url}`)
  }
  return res.json()
}

async function getApplicationConfig(
  request?: Hapi.Request,
  h?: Hapi.ResponseToolkit
) {
  const configFromCountryConfig = await getConfigFromCountry()
  const { error, value: updatedConfigFromCountryConfig } =
    applicationConfigResponseValidation.validate(configFromCountryConfig, {
      allowUnknown: true
    })
  if (error) {
    throw badData(error.details[0].message)
  }

  return updatedConfigFromCountryConfig
}

export async function getLoginConfigHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const refineConfigResponse = pick(await getApplicationConfig(), [
    'APPLICATION_NAME',
    'COUNTRY_LOGO',
    'PHONE_NUMBER_PATTERN',
    'USER_NOTIFICATION_DELIVERY_METHOD',
    'INFORMANT_NOTIFICATION_DELIVERY_METHOD'
  ])
  return { config: refineConfigResponse }
}

const searchCriteria = [
  'TRACKING_ID',
  'REGISTRATION_NUMBER',
  'NATIONAL_ID',
  'NAME',
  'PHONE_NUMBER',
  'EMAIL'
]

const applicationConfigResponseValidation = Joi.object({
  APPLICATION_NAME: Joi.string().required(),
  COUNTRY_LOGO: Joi.object()
    .keys({
      fileName: Joi.string().required(),
      file: Joi.string().required()
    })
    .required(),
  CURRENCY: Joi.object()
    .keys({
      isoCode: Joi.string().required(),
      languagesAndCountry: Joi.array().items(Joi.string()).required()
    })
    .required(),
  PHONE_NUMBER_PATTERN: Joi.string().required(),
  USER_NOTIFICATION_DELIVERY_METHOD: Joi.string().allow('').optional(),
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: Joi.string().allow('').optional(),
  SEARCH_DEFAULT_CRITERIA: Joi.string()
    .valid(...searchCriteria)
    .optional()
    .default('TRACKING_ID')
})
