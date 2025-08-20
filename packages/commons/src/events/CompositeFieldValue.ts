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
import { FullDocumentPath } from '../documents'
import { z } from 'zod'

/**
 * Composite field value consists of multiple field values.
 */

export const GeographicalArea = {
  URBAN: 'URBAN',
  RURAL: 'RURAL'
} as const

export const AddressType = {
  DOMESTIC: 'DOMESTIC',
  INTERNATIONAL: 'INTERNATIONAL'
} as const

export const FileFieldValue = z.object({
  path: FullDocumentPath,
  originalFilename: z.string(),
  type: z.string()
})

export type FileFieldValue = z.infer<typeof FileFieldValue>

export const NameFieldValue = z.object({
  firstname: z.string(),
  surname: z.string(),
  middlename: z.string().optional()
})

export const NameFieldUpdateValue = z
  .object({
    firstname: z.string(),
    surname: z.string(),
    middlename: z.string().nullish()
  })
  .or(z.null())
  .or(z.undefined())

export type NameFieldValue = z.infer<typeof NameFieldValue>
export type NameFieldUpdateValue = z.infer<typeof NameFieldUpdateValue>

export const DomesticAddressValue = z.object({
  country: z.string(),
  addressType: z.literal(AddressType.DOMESTIC),
  adminLevel1: z.string().optional(),
  adminLevel2: z.string().optional(),
  adminLevel3: z.string().optional(),
  adminLevel4: z.string().optional(),
  adminLevel5: z.string().optional(),
  adminLevel6: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  addressLine3: z.string().optional(),
  addressLine4: z.string().optional(),
  addressLine5: z.string().optional()
})

export const DomesticAddressUpdateValue = z.object({
  country: z.string(),
  addressType: z.literal(AddressType.DOMESTIC),
  adminLevel1: z.string().nullish(),
  adminLevel2: z.string().nullish(),
  adminLevel3: z.string().nullish(),
  adminLevel4: z.string().nullish(),
  adminLevel5: z.string().nullish(),
  adminLevel6: z.string().nullish(),
  addressLine1: z.string().nullish(),
  addressLine2: z.string().nullish(),
  addressLine3: z.string().nullish(),
  addressLine4: z.string().nullish(),
  addressLine5: z.string().nullish()
})

export type DomesticAddressUpdateValue = z.infer<
  typeof DomesticAddressUpdateValue
>

export const InternationalAddressValue = z.object({
  country: z.string(),
  addressType: z.literal(AddressType.INTERNATIONAL),
  internationalAddressLine1: z.string().optional(),
  internationalAddressLine2: z.string().optional(),
  internationalAddressLine3: z.string().optional(),
  internationalAddressLine4: z.string().optional(),
  internationalAddressLine5: z.string().optional()
})

export const InternationalAddressUpdateValue = z.object({
  country: z.string(),
  addressType: z.literal(AddressType.INTERNATIONAL),
  internationalAddressLine1: z.string().nullish(),
  internationalAddressLine2: z.string().nullish(),
  internationalAddressLine3: z.string().nullish(),
  internationalAddressLine4: z.string().nullish(),
  internationalAddressLine5: z.string().nullish()
})

export type InternationalAddressUpdateValue = z.infer<
  typeof InternationalAddressUpdateValue
>

export const AddressFieldValue = z.union([
  DomesticAddressValue,
  InternationalAddressValue
])

export const AddressFieldUpdateValue = z.union([
  DomesticAddressUpdateValue,
  InternationalAddressUpdateValue
])

export type AddressFieldValue = z.infer<typeof AddressFieldValue>

export const FileFieldValueWithOption = z.object({
  path: FullDocumentPath,
  originalFilename: z.string(),
  type: z.string(),
  option: z.string()
})

export type FileFieldValueWithOption = z.infer<typeof FileFieldValueWithOption>

export const FileFieldWithOptionValue = z.array(FileFieldValueWithOption)
export type FileFieldWithOptionValue = z.infer<typeof FileFieldWithOptionValue>
