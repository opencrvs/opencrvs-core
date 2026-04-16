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

import * as z from 'zod/v4'

const TranslationConfig = z.object({
  id: z
    .string()
    .describe(
      'The identifier of the translation referred in translation CSV files'
    ),
  defaultMessage: z.string().describe('Default translation message'),
  description: z
    .string()
    .describe(
      'Describe the translation for a translator to be able to identify it.'
    )
})

export const SearchCriteria = z.enum([
  'TRACKING_ID',
  'REGISTRATION_NUMBER',
  'NATIONAL_ID',
  'NAME',
  'PHONE_NUMBER',
  'EMAIL'
])

export const ApplicationConfig = z.object({
  APPLICATION_NAME: z.string(),
  COUNTRY_LOGO: z.object({
    fileName: z.string(),
    file: z.string()
  }),
  SYSTEM_IANA_TIMEZONE: z.string(),
  CURRENCY: z.object({
    languagesAndCountry: z.array(z.string()),
    isoCode: z.string()
  }),
  ADMIN_STRUCTURE: z.array(
    z.object({
      id: z.string(),
      label: TranslationConfig
    })
  ),
  PHONE_NUMBER_PATTERN: z.string().or(z.instanceof(RegExp)),
  USER_NOTIFICATION_DELIVERY_METHOD: z.string(),
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: z.string(),
  SEARCH_DEFAULT_CRITERIA: SearchCriteria.optional().default('TRACKING_ID')
})

export type ApplicationConfig = z.infer<typeof ApplicationConfig>

export const defineApplicationConfig = (
  config: z.input<typeof ApplicationConfig>
): ApplicationConfig => {
  return ApplicationConfig.parse(config)
}

export const BackgroundConfig = z
  .object({
    backgroundColor: z.string().optional(),
    backgroundImage: z.string().optional(),
    imageFit: z.string().optional()
  })
  .refine(
    (data) => !!(data.backgroundColor || data.backgroundImage),
    'backgroundColor and backgroundImage cannot be empty at the same time'
  )

export const LoginConfig = z.object({
  COUNTRY: z.string(),
  LANGUAGES: z.array(z.string()),
  USER_NOTIFICATION_DELIVERY_METHOD: z.string(),
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: z.string(),
  PHONE_NUMBER_PATTERN: z.string().or(z.instanceof(RegExp)),
  LOGIN_BACKGROUND: BackgroundConfig,
  SENTRY: z.string()
})

export type LoginConfig = z.infer<typeof LoginConfig>

export const defineLoginConfig = (
  config: z.input<typeof LoginConfig>
): LoginConfig => {
  return LoginConfig.parse(config)
}

export const ClientConfig = z.object({
  COUNTRY: z.string(),
  LANGUAGES: z.array(z.string()),
  SENTRY: z.string(),
  REGISTER_BACKGROUND: BackgroundConfig,
  DASHBOARDS: z.array(
    z.object({
      id: z.string(),
      title: TranslationConfig,
      url: z.string()
    })
  ),
  FEATURES: z
    .object({ V2_EVENTS: z.boolean().optional().default(true) })
    .optional()
    .default({ V2_EVENTS: true })
})

export type ClientConfig = z.infer<typeof ClientConfig>

export const defineClientConfig = (
  config: z.input<typeof ClientConfig>
): ClientConfig => {
  return ClientConfig.parse(config)
}
