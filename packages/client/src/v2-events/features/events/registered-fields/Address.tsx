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
import React from 'react'
import {
  ActionFormData,
  AddressFieldValue,
  alwaysTrue,
  ConditionalType,
  field as createFieldCondition,
  defineConditional,
  FieldConfig,
  FieldProps,
  not
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { Output } from '@client/v2-events/features/events/components/Output'
import { useFormDataStringifier } from '@client/v2-events/hooks/useFormDataStringifier'

type FieldConfigWithoutAddress = Exclude<FieldConfig, { type: 'ADDRESS' }>

type Props = FieldProps<'ADDRESS'> & {
  onChange: (newValue: ActionFormData) => void
  value?: AddressFieldValue
}

function hide<T extends FieldConfig>(fieldConfig: T): T {
  return {
    ...fieldConfig,
    conditionals: (fieldConfig.conditionals || []).concat({
      type: ConditionalType.SHOW,
      conditional: not(defineConditional(alwaysTrue()))
    })
  }
}

/**
 * AddressInput is a form component for capturing address details based on administrative structure.
 *
 * - The form dynamically adjusts the fields displayed based on user input.
 * - By default, it includes fields for admin structure and a selection between urban and rural addresses.
 * - All admin structure fields are hidden until the previous field is selected.
 * - Address details fields are only shown when district is selected (it being the last admin structure field).
 */
function AddressInput(props: Props) {
  const { onChange, value = {}, ...otherProps } = props

  let fields = [
    ...ADMIN_STRUCTURE,
    ...URBAN_FIELDS,
    ...RURAL_FIELDS.map(hide)
  ] satisfies Array<FieldConfigWithoutAddress>

  if (!value.district) {
    fields = [
      ...ADMIN_STRUCTURE,
      ...URBAN_FIELDS.map(hide),
      ...RURAL_FIELDS.map(hide)
    ]
  }

  if (value.urbanOrRural === 'RURAL') {
    fields = [...ADMIN_STRUCTURE, ...URBAN_FIELDS.map(hide), ...RURAL_FIELDS]
  }

  return (
    <FormFieldGenerator
      {...otherProps}
      fields={fields}
      formData={value}
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
        type: ConditionalType.SHOW,
        conditional: not(createFieldCondition('country').isUndefined())
      }
    ],
    required: true,
    label: {
      id: 'v2.field.address.province.label',
      defaultMessage: 'Province',
      description: 'This is the label for the field'
    },
    type: 'ADMINISTRATIVE_AREA',
    configuration: { type: 'ADMIN_STRUCTURE' }
  },
  {
    id: 'district',
    type: 'ADMINISTRATIVE_AREA',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: not(createFieldCondition('province').isUndefined())
      }
    ],
    required: true,
    label: {
      id: 'v2.field.address.district.label',
      defaultMessage: 'District',
      description: 'This is the label for the field'
    },
    configuration: {
      type: 'ADMIN_STRUCTURE',
      partOf: {
        $data: 'province'
      }
    }
  },
  {
    id: 'urbanOrRural',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: not(createFieldCondition('district').isUndefined())
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
    defaultValue: 'URBAN',
    options: [
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
    configuration: {
      styles: { size: 'NORMAL' }
    }
  }
] as const satisfies FieldConfigWithoutAddress[]

const ALL_FIELDS = [...ADMIN_STRUCTURE, ...URBAN_FIELDS, ...RURAL_FIELDS]

type RequiredKeysFromFieldValue = keyof AddressFieldValue
type EnsureSameUnion<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : false
  : false
type Expect<T extends true> = T

type AllFields = (typeof ALL_FIELDS)[number]['id']

/*
 * This type ensures that all fields needed in AddressFieldValue type
 * are actually defined in the field config below.
 * Comment out one field to see the error.
 *
 * If you see a type error, it means that the fields in the component do not
 * match the fields in the AddressFieldValue type.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _ExpectTrue = Expect<
  EnsureSameUnion<AllFields, RequiredKeysFromFieldValue>
>

function AddressOutput({ value }: { value?: AddressFieldValue }) {
  if (!value) {
    return ''
  }

  return (
    <>
      {ALL_FIELDS.map((field) => ({ field, value: value[field.id] }))
        .filter((field) => field.value)
        .map((field) => (
          <>
            <Output
              field={field.field}
              showPreviouslyMissingValuesAsChanged={false}
              value={field.value}
            />
            <br />
          </>
        ))}
    </>
  )
}

function useStringifier() {
  return function useAddressStringifier(value: AddressFieldValue) {
    /*
     * As address is just a collection of other form fields, its string formatter just redirects the data back to
     * form data stringifier so location and other form fields can handle stringifying their own data
     */
    const stringifier = useFormDataStringifier()
    return stringifier(ALL_FIELDS, value as ActionFormData)
  }
}

export const Address = {
  Input: AddressInput,
  Output: AddressOutput,
  useStringifier: useStringifier
}
