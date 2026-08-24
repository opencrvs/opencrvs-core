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
import { DocumentPath } from '../documents'
import * as z from 'zod/v4'
import { AdministrativeAreaPath } from './VersionedLocation'

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
  path: DocumentPath,
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
    firstname: z.string().nullish(),
    surname: z.string().nullish(),
    middlename: z.string().nullish()
  })
  .or(z.null())
  .or(z.undefined())

export type NameFieldValue = z.infer<typeof NameFieldValue>
export type NameFieldUpdateValue = z.infer<typeof NameFieldUpdateValue>

const StreetLevelDetailsValue = z.record(z.string(), z.string()).optional()

export const StreetLevelDetailsUpdateValue = z
  .record(z.string(), z.string().nullable())
  .nullish()

const BaseAddressFieldValue = z.object({
  country: z.string(),
  streetLevelDetails: StreetLevelDetailsValue
})

const BaseAddressFieldUpdateValue = z.object({
  country: z.string().nullish(),
  streetLevelDetails: StreetLevelDetailsUpdateValue
})

export const DomesticAddressFieldValue = BaseAddressFieldValue.extend({
  addressType: z.literal(AddressType.DOMESTIC),
  administrativeArea: z.string().uuid()
})

export type DomesticAddressFieldValue = z.infer<
  typeof DomesticAddressFieldValue
>

const InternationalAddressFieldValue = BaseAddressFieldValue.extend({
  addressType: z.literal(AddressType.INTERNATIONAL)
})

export const AddressFieldValue = z.discriminatedUnion('addressType', [
  DomesticAddressFieldValue,
  InternationalAddressFieldValue
])

export type AddressFieldValue = z.infer<typeof AddressFieldValue>

/**
 * An address as advanced search holds it: `administrativeArea` is the chain of
 * levels picked, root first, each pinned to the name that was clicked
 * (@see AdministrativeAreaPath). The last link is the leaf and the only one the
 * search uses; the ancestors are kept so every dropdown and every part of the
 * criteria pill shows the name it was picked under.
 *
 * Only the client-side search value takes this shape. Declarations keep a bare
 * `administrativeArea` uuid, and the query is narrowed back to a plain
 * {@link AddressFieldValue} before it leaves the client, so stored records and
 * their index are unaffected.
 */
export const DomesticVersionedAddressFieldValue = BaseAddressFieldValue.extend({
  addressType: z.literal(AddressType.DOMESTIC),
  administrativeArea: AdministrativeAreaPath
})

export const VersionedAddressFieldValue = z.discriminatedUnion('addressType', [
  DomesticVersionedAddressFieldValue,
  InternationalAddressFieldValue
])

export type VersionedAddressFieldValue = z.infer<
  typeof VersionedAddressFieldValue
>

const DomesticAddressUpdateFieldValue = BaseAddressFieldUpdateValue.extend({
  addressType: z.literal(AddressType.DOMESTIC),
  administrativeArea: z
    .string()
    .uuid()
    .nullish() /* Leaf level admin structure */
})

const InternationalAddressUpdateFieldValue = BaseAddressFieldUpdateValue.extend(
  {
    addressType: z.literal(AddressType.INTERNATIONAL)
  }
)

export const AddressFieldUpdateValue = z
  .discriminatedUnion('addressType', [
    DomesticAddressUpdateFieldValue,
    InternationalAddressUpdateFieldValue
  ])
  .nullish()

export type AddressFieldUpdateValue = z.infer<typeof AddressFieldUpdateValue>

export const FileFieldValueWithOption = z.object({
  path: DocumentPath,
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
  .object({
    data: z.record(z.string(), z.string()),
    updatedAt: z.iso.datetime()
  })
  .nullish()

export type QueryParamReaderFieldValue = z.infer<
  typeof QueryParamReaderFieldValue
>

export const QueryParamReaderFieldUpdateValue = z.object({
  data: z.record(z.string(), z.string())
})

const ReadDataValue = z.object({
  data: z.any()
})
export const QrReaderFieldValue = ReadDataValue
export type QrReaderFieldValue = z.infer<typeof QrReaderFieldValue>

export const IdReaderFieldValue = ReadDataValue
export type IdReaderFieldValue = z.infer<typeof IdReaderFieldValue>

export const NumberWithUnitFieldValue = z.object({
  numericValue: z.number(),
  unit: z.string()
})
export const NumberWithUnitFieldUpdateValue = z.object({
  numericValue: z.number().optional(),
  unit: z.string().optional()
})
export type NumberWithUnitFieldValue = z.infer<typeof NumberWithUnitFieldValue>
export type NumberWithUnitFieldUpdateValue = z.infer<
  typeof NumberWithUnitFieldUpdateValue
>
export const CustomFieldValue = z.unknown().brand('CustomFieldValue')
export type CustomFieldValue = z.infer<typeof CustomFieldValue>
