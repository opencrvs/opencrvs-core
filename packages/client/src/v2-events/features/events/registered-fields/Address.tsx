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
import { IntlShape } from 'react-intl'
import { Location } from '@events/service/locations/locations'
import {
  EventState,
  AddressFieldValue,
  and,
  ConditionalType,
  field as createFieldCondition,
  FieldConfig,
  FieldProps,
  FieldType,
  not,
  GeographicalArea,
  AdministrativeAreas,
  isFieldVisible,
  alwaysTrue,
  AddressType
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { Output } from '@client/v2-events/features/events/components/Output'
import {
  formDataStringifierFactory,
  stringifySimpleField
} from '@client/v2-events/hooks/useFormDataStringifier'

// ADDRESS field may not contain another ADDRESS field
type FieldConfigWithoutAddress = Exclude<
  FieldConfig,
  { type: typeof FieldType.ADDRESS }
>

type Props = FieldProps<typeof FieldType.ADDRESS> & {
  onChange: (newValue: Partial<AddressFieldValue>) => void
  value?: AddressFieldValue
}

function addDefaultValue<T extends FieldConfigWithoutAddress>(
  defaultValues?: AddressFieldValue
): (fieldConfig: T) => T {
  if (!defaultValues) {
    return (fieldConfig) => fieldConfig
  }

  return (fieldConfig) => {
    const key = fieldConfig.id as keyof typeof defaultValues

    if (!defaultValues[key]) {
      return fieldConfig
    }

    return {
      ...fieldConfig,
      defaultValue: defaultValues[key]
    }
  }
}

function isDomesticAddress() {
  return and(
    not(createFieldCondition('country').isUndefined()),
    createFieldCondition('addressType').isEqualTo(AddressType.DOMESTIC)
  )
}

function isInternationalAddress() {
  return and(
    not(createFieldCondition('country').isUndefined()),
    createFieldCondition('addressType').isEqualTo(AddressType.INTERNATIONAL)
  )
}

const displayWhenDistrictUrbanSelected = [
  {
    type: ConditionalType.SHOW,
    conditional: and(
      isDomesticAddress(),
      createFieldCondition('urbanOrRural').isEqualTo(GeographicalArea.URBAN),
      not(createFieldCondition('district').isUndefined())
    )
  }
]

const addressTypeField = {
  id: 'addressType',
  conditionals: [
    {
      type: ConditionalType.SHOW,
      conditional: not(alwaysTrue())
    }
  ],
  label: {
    defaultMessage: '',
    description: 'empty string',
    id: 'v2.messages.emptyString'
  },
  type: FieldType.TEXT
} as const satisfies FieldConfigWithoutAddress

const URBAN_FIELDS = [
  {
    id: 'town',
    conditionals: displayWhenDistrictUrbanSelected,
    required: false,
    label: {
      id: 'v2.field.address.town.label',
      defaultMessage: 'Town',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'residentialArea',
    conditionals: displayWhenDistrictUrbanSelected,
    required: false,
    label: {
      id: 'v2.field.address.residentialArea.label',
      defaultMessage: 'Residential Area',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'street',
    conditionals: displayWhenDistrictUrbanSelected,
    required: false,
    label: {
      id: 'v2.field.address.street.label',
      defaultMessage: 'Street',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'number',
    conditionals: displayWhenDistrictUrbanSelected,
    required: false,
    label: {
      id: 'v2.field.address.number.label',
      defaultMessage: 'Number',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'zipCode',
    conditionals: displayWhenDistrictUrbanSelected,
    required: false,
    label: {
      id: 'v2.field.address.zipCode.label',
      defaultMessage: 'Postcode / Zip',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  }
] as const satisfies FieldConfigWithoutAddress[]

const RURAL_FIELDS = [
  {
    id: 'village',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isDomesticAddress(),
          createFieldCondition('urbanOrRural').isEqualTo(
            GeographicalArea.RURAL
          ),
          not(createFieldCondition('district').isUndefined())
        )
      }
    ],
    required: false,
    label: {
      id: 'v2.field.address.village.label',
      defaultMessage: 'Village',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
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
    type: FieldType.COUNTRY
  },
  {
    id: 'province',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isDomesticAddress()
      }
    ],
    required: true,
    label: {
      id: 'v2.field.address.province.label',
      defaultMessage: 'Province',
      description: 'This is the label for the field'
    },
    type: FieldType.ADMINISTRATIVE_AREA,
    configuration: { type: AdministrativeAreas.enum.ADMIN_STRUCTURE }
  },
  {
    id: 'district',
    type: FieldType.ADMINISTRATIVE_AREA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isDomesticAddress(),
          not(createFieldCondition('province').isUndefined())
        )
      }
    ],
    required: true,
    label: {
      id: 'v2.field.address.district.label',
      defaultMessage: 'District',
      description: 'This is the label for the field'
    },
    configuration: {
      type: AdministrativeAreas.enum.ADMIN_STRUCTURE,
      partOf: {
        $declaration: 'province'
      }
    }
  },
  {
    id: 'urbanOrRural',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isDomesticAddress(),
          not(createFieldCondition('district').isUndefined())
        )
      }
    ],
    required: false,
    label: {
      id: 'v2.field.address.urbanOrRural.label',
      defaultMessage: 'Urban or Rural',
      description: 'This is the label for the field'
    },
    hideLabel: true,
    type: FieldType.RADIO_GROUP,
    options: [
      {
        value: GeographicalArea.URBAN,
        label: {
          id: 'v2.field.address.label.urban',
          defaultMessage: 'Urban',
          description: 'Label for form field checkbox option Urban'
        }
      },
      {
        value: GeographicalArea.RURAL,
        label: {
          id: 'v2.field.address.label.rural',
          defaultMessage: 'Rural',
          description: 'Label for form field checkbox option Rural'
        }
      }
    ],
    defaultValue: GeographicalArea.URBAN,
    configuration: {
      styles: { size: 'NORMAL' }
    }
  }
] as const satisfies FieldConfigWithoutAddress[]

const GENERIC_ADDRESS_FIELDS = [
  {
    id: 'state',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: true,
    label: {
      id: 'v2.field.address.state.label',
      defaultMessage: 'State',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'district2',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: true,
    label: {
      id: 'v2.field.address.district2.label',
      defaultMessage: 'District',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'cityOrTown',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: false,
    label: {
      id: 'v2.field.address.cityOrTown.label',
      defaultMessage: 'City / Town',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'addressLine1',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: false,
    label: {
      id: 'v2.field.address.addressLine1.label',
      defaultMessage: 'Address Line 1',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'addressLine2',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: false,
    label: {
      id: 'v2.field.address.addressLine2.label',
      defaultMessage: 'Address Line 2',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'addressLine3',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: false,
    label: {
      id: 'v2.field.address.addressLine3.label',
      defaultMessage: 'Address Line 3',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'postcodeOrZip',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: false,
    label: {
      id: 'v2.field.address.postcodeOrZip.label',
      defaultMessage: 'Postcode / Zip',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  }
] as const satisfies FieldConfigWithoutAddress[]

const ALL_ADDRESS_FIELDS = [
  ...ADMIN_STRUCTURE,
  ...URBAN_FIELDS,
  ...RURAL_FIELDS,
  ...GENERIC_ADDRESS_FIELDS,
  addressTypeField
]

type AllKeys<T> = T extends unknown ? keyof T : never
type RequiredKeysFromFieldValue = AllKeys<AddressFieldValue>
type EnsureSameUnion<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : false
  : false
type Expect<T extends true> = T

type AllFields = (typeof ALL_ADDRESS_FIELDS)[number]['id']

/*
 * This type ensures that all fields needed in AddressFieldValue type
 * are actually defined in the field config below.
 * Comment out one field to see the error.
 *
 * If you see a type error, it means that the fields in the component do not
 * match the fields in the AddressFieldValue type.
 */
type _ExpectTrue = Expect<
  EnsureSameUnion<AllFields, RequiredKeysFromFieldValue>
>

/**
 * AddressInput is a form component for capturing address details based on administrative structure.
 *
 * - The form dynamically adjusts the fields displayed based on user input.
 * - By default, it includes fields for admin structure and a selection between urban and rural addresses.
 * - All admin structure fields are hidden until the previous field is selected.
 * - Address details fields are only shown when district is selected (it being the last admin structure field).
 */
function AddressInput(props: Props) {
  const { onChange, defaultValue, value = {}, ...otherProps } = props

  const fields = [
    ...ADMIN_STRUCTURE,
    ...URBAN_FIELDS,
    ...RURAL_FIELDS,
    ...GENERIC_ADDRESS_FIELDS
  ] satisfies Array<FieldConfigWithoutAddress>

  return (
    <FormFieldGenerator
      {...otherProps}
      fields={defaultValue ? fields.map(addDefaultValue(defaultValue)) : fields}
      form={value}
      initialValues={{ ...defaultValue, ...value }}
      setAllFieldsDirty={false}
      onChange={(values) => onChange(values as Partial<AddressFieldValue>)}
    />
  )
}

function AddressOutput({ value }: { value?: AddressFieldValue }) {
  if (!value) {
    return ''
  }
  return (
    <>
      {ALL_ADDRESS_FIELDS.map((field) => ({
        field,
        value: value[field.id as keyof typeof value]
      }))
        .filter(
          (field) =>
            field.value &&
            isFieldVisible(field.field satisfies FieldConfig, value)
        )
        .map((field) => (
          <React.Fragment key={field.field.id}>
            <Output
              field={field.field}
              showPreviouslyMissingValuesAsChanged={false}
              value={field.value}
            />
            <br />
          </React.Fragment>
        ))}
    </>
  )
}

function stringify(
  intl: IntlShape,
  locations: Location[],
  value: AddressFieldValue
) {
  const fieldStringifier = stringifySimpleField(intl, locations)

  /*
   * As address is just a collection of other form fields, its string formatter just redirects the data back to
   * form data stringifier so location and other form fields can handle stringifying their own data
   */
  const formStringifier = formDataStringifierFactory(fieldStringifier)
  return formStringifier(ALL_ADDRESS_FIELDS, value as EventState)
}

export const Address = {
  Input: AddressInput,
  Output: AddressOutput,
  stringify
}
