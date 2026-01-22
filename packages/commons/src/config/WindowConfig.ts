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

import { z } from 'zod'

export const DashboardSchema = z.object({
  id: z.string(),
  title: z.object({
    id: z.string(),
    defaultMessage: z.string(),
    description: z.string()
  }),
  url: z.string(),
  context: z
    .object({
      params: z.enum(['locationId', 'token']).optional(),
      forwardSearchParams: z.boolean().optional()
    })
    .optional()
})

const BIRTH_CONFIG_SCHEMA = z.object({
  REGISTRATION_TARGET: z.number().optional(),
  LATE_REGISTRATION_TARGET: z.number().optional(),
  PRINT_IN_ADVANCE: z.boolean().optional()
})

const COUNTRY_LOGO_SCHEMA = z.object({
  fileName: z.string().optional(),
  file: z.string().optional()
})

const CURRENCY_SCHEMA = z.object({
  isoCode: z.string().optional(),
  languagesAndCountry: z.array(z.string()).optional()
})

const DEATH_CONFIG_SCHEMA = z.object({
  REGISTRATION_TARGET: z.number().optional(),
  PRINT_IN_ADVANCE: z.boolean().optional()
})

const MARRIAGE_CONFIG_SCHEMA = z.object({
  REGISTRATION_TARGET: z.number().optional(),
  PRINT_IN_ADVANCE: z.boolean().optional()
})

const FEATURES_CONFIG_SCHEMA = z.object({
  DEATH_REGISTRATION: z.boolean().optional(),
  MARRIAGE_REGISTRATION: z.boolean().optional(),
  EXTERNAL_VALIDATION_WORKQUEUE: z.boolean().optional(),
  PRINT_DECLARATION: z.boolean().optional(),
  DATE_OF_BIRTH_UNKNOWN: z.boolean().optional(),
  V2_EVENTS: z.boolean().optional()
})

export const WindowConfigSchema = z.object({
  APPLICATION_NAME: z.string().optional(),
  API_GATEWAY_URL: z.string().optional(),
  BIRTH: BIRTH_CONFIG_SCHEMA.optional(),
  CONFIG_API_URL: z.string().optional(),
  COUNTRY: z.string().optional(),
  COUNTRY_LOGO: COUNTRY_LOGO_SCHEMA.optional(),
  CURRENCY: CURRENCY_SCHEMA.optional(),
  DEATH: DEATH_CONFIG_SCHEMA.optional(),
  MARRIAGE: MARRIAGE_CONFIG_SCHEMA.optional(),
  FEATURES: FEATURES_CONFIG_SCHEMA.optional(),
  SHOW_FARAJALAND_IN_COUNTRY_LISTS: z.boolean().optional(),
  USER_NOTIFICATION_DELIVERY_METHOD: z.enum(['sms', 'email']).optional(),
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: z.enum(['sms', 'email']).optional(),
  FIELD_AGENT_AUDIT_LOCATIONS: z.string().optional(),
  PHONE_NUMBER_PATTERN: z.string().optional(),
  NID_NUMBER_PATTERN: z.string().optional(),
  DECLARATION_AUDIT_LOCATIONS: z.string().optional(),
  LANGUAGES: z.string().optional(),
  AUTH_API_URL: z.string().optional(),
  CLIENT_APP_URL: z.string().optional(),
  LOGIN_URL: z.string().optional(),
  AUTH_URL: z.string().optional(),
  MINIO_URL: z.string().optional(),
  MINIO_BASE_URL: z.string().optional(),
  MINIO_BUCKET: z.string().optional(),
  COUNTRY_CONFIG_URL: z.string().optional(),
  SENTRY: z.string().optional(),
  SIGNATURE_REQUIRED_FOR_ROLES: z.array(z.string()).optional(),
  SYSTEM_IANA_TIMEZONE: z.string().optional(),
  DASHBOARDS: z.array(DashboardSchema).optional()
})

export type WindowConfig = z.infer<typeof WindowConfigSchema>
export type WindowConfigInput = z.input<typeof WindowConfigSchema>
