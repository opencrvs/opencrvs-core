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
import React, { useMemo } from 'react'
import {
  ActionFormData,
  AddressField,
  AddressFieldValue,
  defineConditional,
  field,
  FieldConfig,
  FieldProps,
  FieldType,
  trueConstant
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'

type FieldConfigWithoutAddress = Exclude<FieldConfig, { type: 'ADDRESS' }>

type Props = FieldProps<'ADDRESS'> & {
  onChange: (newValue: ActionFormData) => void
  value?: AddressFieldValue
}

function hide(
  fieldConfig: FieldConfigWithoutAddress
): FieldConfigWithoutAddress {
  return {
    ...fieldConfig,
    conditionals: (fieldConfig.conditionals || []).concat({
      type: 'HIDE',
      conditional: defineConditional(trueConstant())
    })
  }
}

function addInitialValue(initialValues: AddressField['initialValue']) {
  if (!initialValues) {
    return (fieldConfig: FieldConfigWithoutAddress) => fieldConfig
  }

  return (fieldConfig: FieldConfigWithoutAddress) => {
    if (!initialValues[fieldConfig.id]) {
      return fieldConfig
    }

    return {
      ...fieldConfig,
      initialValue: initialValues[
        fieldConfig.id
      ] as FieldConfigWithoutAddress['initialValue']
    }
  }
}

export function Address(props: Props) {
  const { onChange, initialValue = {}, value = {}, ...otherProps } = props

  let fields: Array<FieldConfigWithoutAddress> = [
    ...ADMIN_STRUCTURE,
    ...URBAN_FIELDS,
    ...RURAL_FIELDS.map(hide)
  ]

  if (!value?.district) {
    fields = [
      ...ADMIN_STRUCTURE,
      ...URBAN_FIELDS.map(hide),
      ...RURAL_FIELDS.map(hide)
    ]
  }

  if (value?.urbanOrRural === 'RURAL') {
    fields = [...ADMIN_STRUCTURE, ...URBAN_FIELDS.map(hide), ...RURAL_FIELDS]
  }

  return (
    <FormFieldGenerator
      {...otherProps}
      fields={fields.map(addInitialValue(initialValue))}
      formData={value || {}}
      setAllFieldsDirty={false}
      onChange={onChange}
    />
  )
}

const URBAN_FIELDS = [
  {
    id: 'town',
    conditionals: [],
    required: false,
    label: {
      id: 'v2.field.address.town.label',
      defaultMessage: 'Town',
      description: 'This is the label for the field'
    },
    type: 'TEXT'
  },
  {
    id: 'residentialArea',
    conditionals: [],
    required: false,
    label: {
      id: 'v2.field.address.residentialArea.label',
      defaultMessage: 'Residential Area',
      description: 'This is the label for the field'
    },
    type: 'TEXT'
  },
  {
    id: 'street',
    conditionals: [],
    required: false,
    label: {
      id: 'v2.field.address.street.label',
      defaultMessage: 'Street',
      description: 'This is the label for the field'
    },
    type: 'TEXT'
  },
  {
    id: 'number',
    conditionals: [],
    required: false,
    label: {
      id: 'v2.field.address.number.label',
      defaultMessage: 'Number',
      description: 'This is the label for the field'
    },
    type: 'TEXT'
  },
  {
    id: 'zipCode',
    conditionals: [],
    required: false,
    label: {
      id: 'v2.field.address.zipCode.label',
      defaultMessage: 'Postcode / Zip',
      description: 'This is the label for the field'
    },
    type: 'TEXT'
  }
] as const satisfies FieldConfigWithoutAddress[]

const RURAL_FIELDS = [
  {
    id: 'village',
    conditionals: [],
    required: false,
    label: {
      id: 'v2.field.address.village.label',
      defaultMessage: 'Village',
      description: 'This is the label for the field'
    },
    type: 'TEXT'
  }
] as const satisfies FieldConfigWithoutAddress[]

const ADMIN_STRUCTURE = [
  {
    id: 'country',
    conditionals: [],
    required: true,
    label: {
      id: 'v2.field.address.country.label',
      defaultMessage: 'Country',
      description: 'This is the label for the field'
    },
    type: 'COUNTRY'
  },
  {
    id: 'province',
    conditionals: [
      {
        type: 'HIDE',
        conditional: defineConditional(field('country').isUndefined().apply())
      }
    ],
    required: true,
    label: {
      id: 'v2.field.address.province.label',
      defaultMessage: 'Province',
      description: 'This is the label for the field'
    },
    type: 'LOCATION',
    options: {
      type: 'ADMIN_STRUCTURE'
    }
  },
  {
    id: 'district',
    conditionals: [
      {
        type: 'HIDE',
        conditional: defineConditional(field('province').isUndefined().apply())
      }
    ],
    required: true,
    label: {
      id: 'v2.field.address.district.label',
      defaultMessage: 'District',
      description: 'This is the label for the field'
    },
    type: 'LOCATION',
    options: {
      partOf: {
        $data: 'province'
      },
      type: 'ADMIN_STRUCTURE'
    }
  },
  {
    id: 'urbanOrRural',
    conditionals: [
      {
        type: 'HIDE',
        conditional: defineConditional(field('district').isUndefined().apply())
      }
    ],
    required: false,
    label: {
      id: 'v2.field.address.urbanOrRural.label',
      defaultMessage: 'Urban or Rural',
      description: 'This is the label for the field'
    },
    hideLabel: true,
    type: 'RADIO_GROUP',
    initialValue: 'URBAN',
    optionValues: [
      {
        value: 'URBAN',
        label: {
          id: 'v2.field.address.label.urban',
          defaultMessage: 'Urban',
          description: 'Label for form field checkbox option Urban'
        }
      },
      {
        value: 'RURAL',
        label: {
          id: 'v2.field.address.label.rural',
          defaultMessage: 'Rural',
          description: 'Label for form field checkbox option Rural'
        }
      }
    ],
    options: {
      size: 'NORMAL'
    },
    flexDirection: 'row'
  }
] as const satisfies FieldConfigWithoutAddress[]

const ALL_FIELDS = [
  ...ADMIN_STRUCTURE,
  ...URBAN_FIELDS,
  ...RURAL_FIELDS
] as const satisfies FieldConfigWithoutAddress[]
