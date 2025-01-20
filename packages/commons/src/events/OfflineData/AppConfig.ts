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

const CountryLogoSchema = z.object({
  fileName: z.string(),
  file: z.string()
})

const LoginBackgroundSchema = z.object({
  backgroundColor: z.string().optional(),
  backgroundImage: z.string().optional(),
  imageFit: z.string().optional()
})

const CurrencySchema = z.object({
  isoCode: z.string(),
  languagesAndCountry: z.array(z.string())
})

const SearchCriteria = {
  TRACKING_ID: 'TRACKING_ID',
  REGISTRATION_NUMBER: 'REGISTRATION_NUMBER',
  NATIONAL_ID: 'NATIONAL_ID',
  NAME: 'NAME',
  PHONE_NUMBER: 'PHONE_NUMBER',
  EMAIL: 'EMAIL'
} as const

const SearchCriteriaTypeSchema = z.nativeEnum(SearchCriteria)

export const ApplicationConfigSchema = z.object({
  APPLICATION_NAME: z.string(),
  BIRTH: z.object({
    REGISTRATION_TARGET: z.number(),
    LATE_REGISTRATION_TARGET: z.number(),
    PRINT_IN_ADVANCE: z.boolean()
  }),
  COUNTRY_LOGO: CountryLogoSchema,
  CURRENCY: CurrencySchema,
  DEATH: z.object({
    REGISTRATION_TARGET: z.number(),
    PRINT_IN_ADVANCE: z.boolean()
  }),
  MARRIAGE: z.object({
    REGISTRATION_TARGET: z.number(),
    PRINT_IN_ADVANCE: z.boolean()
  }),
  FEATURES: z.object({
    DEATH_REGISTRATION: z.boolean(),
    MARRIAGE_REGISTRATION: z.boolean(),
    EXTERNAL_VALIDATION_WORKQUEUE: z.boolean(),
    INFORMANT_SIGNATURE: z.boolean(),
    PRINT_DECLARATION: z.boolean(),
    DATE_OF_BIRTH_UNKNOWN: z.boolean(),
    INFORMANT_SIGNATURE_REQUIRED: z.boolean()
  }),
  FIELD_AGENT_AUDIT_LOCATIONS: z.string(),
  DECLARATION_AUDIT_LOCATIONS: z.string(),
  PHONE_NUMBER_PATTERN: z.string(),
  NID_NUMBER_PATTERN: z.string(),
  LOGIN_BACKGROUND: LoginBackgroundSchema,
  USER_NOTIFICATION_DELIVERY_METHOD: z.string(),
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: z.string(),
  SEARCH_DEFAULT_CRITERIA: SearchCriteriaTypeSchema.optional()
})

export type ApplicationConfigSchema = z.infer<typeof ApplicationConfigSchema>
