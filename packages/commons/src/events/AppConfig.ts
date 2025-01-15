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

const iCountryLogoSchema = z.object({
  fileName: z.string(),
  file: z.string()
})

const iLoginBackgroundSchema = z.object({
  backgroundColor: z.string().optional(),
  backgroundImage: z.string().optional(),
  imageFit: z.string().optional()
})

enum EventType {
  Birth = 'birth',
  Death = 'death',
  Marriage = 'marriage',
  TENNIS_CLUB_MEMBERSHIP = 'TENNIS_CLUB_MEMBERSHIP'
}
const eventTypeSchema = z.nativeEnum(EventType)

const fontFamilyTypesSchema = z.object({
  normal: z.string(),
  bold: z.string(),
  italics: z.string(),
  bolditalics: z.string()
})

const CertificateConfigDataSchema = z.object({
  id: z.string(),
  event: eventTypeSchema,
  label: z.object({
    id: z.string(),
    defaultMessage: z.string(),
    description: z.string()
  }),
  isDefault: z.boolean(),
  fee: z.object({
    onTime: z.number(),
    late: z.number(),
    delayed: z.number()
  }),
  svgUrl: z.string(),
  fonts: z.record(fontFamilyTypesSchema).optional()
})

const CertificateDataSchema = CertificateConfigDataSchema.extend({
  hash: z.string().optional(),
  svg: z.string()
})

export type CertificateDataSchema = z.infer<typeof CertificateDataSchema>

const iCurrencySchema = z.object({
  isoCode: z.string(),
  languagesAndCountry: z.array(z.string())
})

enum SearchCriteria {
  TRACKING_ID = 'TRACKING_ID',
  REGISTRATION_NUMBER = 'REGISTRATION_NUMBER',
  NATIONAL_ID = 'NATIONAL_ID',
  NAME = 'NAME',
  PHONE_NUMBER = 'PHONE_NUMBER',
  EMAIL = 'EMAIL'
}
const searchCriteriaTypeSchema = z.nativeEnum(SearchCriteria)

const ApplicationConfigSchema = z.object({
  APPLICATION_NAME: z.string(),
  BIRTH: z.object({
    REGISTRATION_TARGET: z.number(),
    LATE_REGISTRATION_TARGET: z.number(),
    PRINT_IN_ADVANCE: z.boolean()
  }),
  COUNTRY_LOGO: iCountryLogoSchema,
  CURRENCY: iCurrencySchema,
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
  LOGIN_BACKGROUND: iLoginBackgroundSchema,
  USER_NOTIFICATION_DELIVERY_METHOD: z.string(),
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: z.string(),
  SEARCH_DEFAULT_CRITERIA: searchCriteriaTypeSchema.optional()
})

export const ApplicationConfigResponseSchema = z.object({
  config: ApplicationConfigSchema.optional(),
  certificates: z.array(CertificateDataSchema)
})

export type ApplicationConfigResponseSchema = z.infer<
  typeof ApplicationConfigResponseSchema
>
