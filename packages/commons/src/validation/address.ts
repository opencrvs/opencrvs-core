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

import {
  AddressField,
  AdministrativeArea as AdministrativeAreaField,
  Country as CountryField,
  TextField,
  AdministrativeAreas
} from '../events/FieldConfig'
import { TranslationConfig } from '../events/TranslationConfig'
import { ConditionalType as ConditionalTypeEnum } from '../events/Conditional'
import { and, not } from '../conditionals'
import {
  AddressType,
  FieldType,
  field as createFieldCondition
} from '../events'

interface AdminStructureItem {
  id: string
  label: TranslationConfig
}

function isDomesticAddress() {
  return and(
    not(createFieldCondition('country').isUndefined()),
    createFieldCondition('addressType').isEqualTo(AddressType.DOMESTIC)
  )
}

const COUNTRY_FIELD_BASE: CountryField = {
  id: 'country',
  conditionals: [],
  required: false,
  label: {
    id: 'field.address.country.label',
    defaultMessage: 'Country',
    description: 'This is the label for the field'
  },
  type: FieldType.COUNTRY
}

export function getAddressFields(
  config: AddressField,
  adminStructure: AdminStructureItem[]
): {
  countryField: CountryField
  domesticFields: AdministrativeAreaField[]
  streetAddressFields: TextField[]
} {
  const configFields = config.configuration?.fields
  const countryFieldConfig = configFields?.find(
    (f) => f.type === FieldType.COUNTRY
  )
  const countryField: CountryField = {
    ...COUNTRY_FIELD_BASE,
    ...countryFieldConfig,
    required: countryFieldConfig?.required ?? config.required,
    type: FieldType.COUNTRY
  }

  const adminConfigs = configFields?.filter(
    (f) => f.type === FieldType.ADMINISTRATIVE_AREA
  )

  const domesticFields =
    adminConfigs?.map((adminConfig, index) => {
      const { id } = adminConfig
      const isFirst = index === 0
      const adminItem = adminStructure.find((s) => s.id === id)
      if (!adminItem) {
        throw new Error(
          `Invalid field ${id} in address configuration ${config.id}`
        )
      }
      const label = adminItem.label

      const prevItem = index > 0 ? adminConfigs[index - 1] : null
      const parentId = isFirst ? 'country' : (prevItem?.id ?? '')

      const mandatoryShowCondition = isFirst
        ? isDomesticAddress()
        : and(
            isDomesticAddress(),
            not(createFieldCondition(parentId).isUndefined())
          )

      const existingShowConditional = adminConfig.conditionals?.find(
        ({ type }) => type === ConditionalTypeEnum.SHOW
      )

      const conditionals = [
        ...(adminConfig.conditionals ?? []).filter(
          ({ type }) => type !== ConditionalTypeEnum.SHOW
        ),
        {
          type: ConditionalTypeEnum.SHOW,
          conditional: existingShowConditional
            ? and(existingShowConditional.conditional, mandatoryShowCondition)
            : mandatoryShowCondition
        }
      ]

      const configuration: AdministrativeAreaField['configuration'] = {
        type: AdministrativeAreas.enum.ADMIN_STRUCTURE
      }

      if (!isFirst && prevItem?.id) {
        configuration.partOf = { $declaration: prevItem.id }
      }

      const field: AdministrativeAreaField = {
        id,
        type: FieldType.ADMINISTRATIVE_AREA,
        conditionals,
        parent: createFieldCondition(parentId),
        required: adminConfig.required ?? config.required,
        label,
        configuration
      }

      return field
    }) ?? []

  const streetAddressFields = config.configuration?.streetAddressForm ?? []

  return {
    countryField,
    domesticFields,
    streetAddressFields
  }
}
