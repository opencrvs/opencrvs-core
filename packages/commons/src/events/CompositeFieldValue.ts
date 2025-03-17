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

/**
 * Composite field value consists of multiple field values.
 */

export const GeographicalArea = {
  URBAN: 'URBAN',
  RURAL: 'RURAL'
} as const

export const FileFieldValue = z.object({
  filename: z.string(),
  originalFilename: z.string(),
  type: z.string()
})

export type FileFieldValue = z.infer<typeof FileFieldValue>

const AdminStructure = z.object({
  country: z.string(),
  province: z.string(),
  district: z.string()
})

export const UrbanAddressValue = AdminStructure.extend({
  urbanOrRural: z.literal(GeographicalArea.URBAN),
  town: z.string().optional(),
  residentialArea: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  zipCode: z.string().optional()
})

export const RuralAddressValue = AdminStructure.extend({
  urbanOrRural: z.literal(GeographicalArea.RURAL),
  village: z.string().optional()
})

export const UrbanAddressUpdateValue = AdminStructure.extend({
  urbanOrRural: z.literal(GeographicalArea.URBAN),
  town: z.string().nullish(),
  residentialArea: z.string().nullish(),
  street: z.string().nullish(),
  number: z.string().nullish(),
  zipCode: z.string().nullish()
})

export const RuralAddressUpdateValue = AdminStructure.extend({
  urbanOrRural: z.literal(GeographicalArea.RURAL),
  village: z.string().nullish()
})

export const AddressFieldValue = z.discriminatedUnion('urbanOrRural', [
  UrbanAddressValue,
  RuralAddressValue
])

export const AddressFieldUpdateValue = z.discriminatedUnion('urbanOrRural', [
  UrbanAddressUpdateValue,
  RuralAddressUpdateValue
])

export type AddressFieldValue = z.infer<typeof AddressFieldValue>

export const FileFieldValueWithOption = z.object({
  filename: z.string(),
  originalFilename: z.string(),
  type: z.string(),
  option: z.string()
})

export type FileFieldValueWithOption = z.infer<typeof FileFieldValueWithOption>

export const FileFieldWithOptionValue = z.array(FileFieldValueWithOption)
export type FileFieldWithOptionValue = z.infer<typeof FileFieldWithOptionValue>
