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
import { AddressField, NameField } from './FieldConfig'
import { NonEmptyTextValue, TextValue } from './FieldValue'
import {
  AddressFieldUpdateValue,
  AddressFieldValue
} from './CompositeFieldValue'

/**
 * Dynamically builds a Zod schema for a "NAME" field based on its configuration.
 *
 * Why this exists: each form field can have its own "required" configuration.
 * NAME fields are composite — made up of subfields like firstname, surname, and middlename.
 * We can’t just hardcode a single Zod schema for all names, because different forms
 * (e.g. applicant, father, mother) may require different parts.
 *
 * This function reads the configuration and builds a schema that respects which
 * subfields are required and which are optional.
 */
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

/**
 * Dynamically builds a Zod schema for an "ADDRESS" field.
 *
 * Why this exists:
 * The address field is dynamic — its structure depends on whether it’s a domestic
 * or international address and which street-level fields (e.g. house number, ward, block)
 * are configured for that event type.
 *
 * The validation ensures:
 *  - Required core fields (country, addressType) are always present.
 *  - Administrative area (like a district or region) can be optional.
 *  - Street-level details are validated against the configured set of keys.
 *    This prevents clients from sending unexpected data keys that don’t exist
 *    in the configuration (a common data integrity issue).
 */
export function getDynamicAddressFieldValue(field: AddressField) {
  const schema = field.required ? AddressFieldValue : AddressFieldUpdateValue
  const configIds =
    field.configuration?.streetAddressForm?.map((a) => a.id) ?? []

  // @todo - show required validation errors for street level fields like state/street
  return schema.refine((arg) => {
    const submittedKeys = Object.keys(arg.streetLevelDetails ?? {})
    const invalidKeys = submittedKeys.filter((k) => !configIds.includes(k))
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
}

export type DynamicAddressFieldValue = ReturnType<
  typeof getDynamicAddressFieldValue
>
