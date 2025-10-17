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

export const StreetLevelDetailsValue = z
  .record(z.string(), z.string())
  .optional()

export const AddressFieldValue = z.object({
  country: z.string(),
  addressType: z.enum([AddressType.DOMESTIC, AddressType.INTERNATIONAL]),
  administrativeArea: z
    .string()
    .uuid()
    .optional() /* Leaf level admin structure */,
  streetLevelDetails: StreetLevelDetailsValue
})

export const StreetLevelDetailsUpdateValue = z
  .record(z.string(), z.string())
  .nullish()

export const AddressFieldUpdateValue = z.object({
  country: z.string(),
  addressType: z.enum([AddressType.DOMESTIC, AddressType.INTERNATIONAL]),
  administrativeArea: z
    .string()
    .uuid()
    .nullish() /* Leaf level admin structure */,
  streetLevelDetails: StreetLevelDetailsUpdateValue
})

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

export const HttpFieldValue = z.object({
  loading: z.boolean(),
  error: z.object({ statusCode: z.number(), message: z.string() }).nullish(),
  data: z.any()
})
export type HttpFieldValue = z.infer<typeof HttpFieldValue>
export const HttpFieldUpdateValue = z
  .object({
    loading: z.boolean().nullish(),
    error: z.object({ statusCode: z.number(), message: z.string() }).nullish(),
    data: z.any().nullish()
  })
  .or(z.null())
  .or(z.undefined())

export const QueryParamReaderFieldValue = z
  .record(z.string(), z.string())
  .nullish()
export type QueryParamReaderFieldValue = z.infer<
  typeof QueryParamReaderFieldValue
>

export const QueryParamReaderFieldUpdateValue = z.record(z.string(), z.string())

const ReadDataValue = z.object({
  data: z.any()
})
export const QrReaderFieldValue = ReadDataValue
export type QrReaderFieldValue = z.infer<typeof QrReaderFieldValue>

export const IdReaderFieldValue = ReadDataValue
export type IdReaderFieldValue = z.infer<typeof IdReaderFieldValue>
