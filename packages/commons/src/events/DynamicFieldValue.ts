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
import { AddressField, NameField } from './FieldConfig'
import { NonEmptyTextValue, TextValue } from './FieldValue'
import { AddressType, StreetLevelDetailsValue } from './CompositeFieldValue'

export function getDynamicNameValue(field: NameField) {
  const nameConfiguration = field.configuration?.name
  return z.object({
    firstname: nameConfiguration?.firstname?.required
      ? NonEmptyTextValue
      : TextValue,
    surname: nameConfiguration?.surname?.required
      ? NonEmptyTextValue
      : TextValue,
    middlename: nameConfiguration?.middlename?.required
      ? NonEmptyTextValue
      : TextValue.optional()
  })
}

export type DynamicNameValue = ReturnType<typeof getDynamicNameValue>

export function getDynamicAddressFieldValue(field: AddressField) {
  const streetAddressConfig = field.configuration?.streetAddressForm
  return z.object({
    country: z.string(),
    addressType: z.enum([AddressType.DOMESTIC, AddressType.INTERNATIONAL]),
    administrativeArea: z
      .string()
      .uuid()
      .optional() /* Leaf level admin structure */,
    streetLevelDetails: StreetLevelDetailsValue.refine((arg) => {
      const submittedKeys = Object.keys(arg ?? {})
      const configIds =
        (streetAddressConfig && streetAddressConfig.map((a) => a.id)) ?? []
      const invalidKeys = submittedKeys.filter(
        (key) => !configIds.includes(key)
      )
      if (invalidKeys.length) {
        // eslint-disable-next-line no-console
        console.log(
          'Invalid streetLevelDetails: unknown keys',
          JSON.stringify(invalidKeys, null, 2)
        )
        return false
      }

      return true
    })
  })
}

export type DynamicAddressFieldValue = ReturnType<
  typeof getDynamicAddressFieldValue
>
