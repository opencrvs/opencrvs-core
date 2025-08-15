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
import { useSelector } from 'react-redux'
import {
  EventState,
  ConfigurableAddressFieldValue,
  and,
  ConditionalType,
  field as createFieldCondition,
  FieldConfig,
  FieldProps,
  FieldType,
  not,
  GeographicalArea,
  AdministrativeAreas,
  alwaysTrue,
  AddressType,
  isFieldDisplayedOnReview,
  ConfigurableAddressField,
  TranslationConfig,
  never
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { Output } from '@client/v2-events/features/events/components/Output'
import {
  formDataStringifierFactory,
  stringifySimpleField
} from '@client/v2-events/hooks/useFormDataStringifier'
import { getOfflineData } from '@client/offline/selectors'
// ADDRESS field may not contain another ADDRESS field
export type FieldConfigWithoutAddress = Exclude<
  FieldConfig,
  { type: typeof FieldType.CONFIGURABLE_ADDRESS }
>
type Props = FieldProps<typeof FieldType.CONFIGURABLE_ADDRESS> & {
  onChange: (newValue: Partial<ConfigurableAddressFieldValue>) => void
  value?: ConfigurableAddressFieldValue
  configuration?: ConfigurableAddressField['configuration']
}
function addDefaultValue<T extends FieldConfigWithoutAddress>(
  defaultValues?: ConfigurableAddressFieldValue
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
export function isDomesticAddress() {
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

function populateAdminStructure(
  locationLevel1: {
    id: string
    label: { id: string; defaultMessage: string; description: string }
  },
  locationLevel2: {
    id: string
    label: TranslationConfig
  }
) {
  return [
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
      id: locationLevel1.id,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: isDomesticAddress()
        }
      ],
      required: true,
      parent: createFieldCondition('country'),
      label: locationLevel1.label,
      type: FieldType.ADMINISTRATIVE_AREA,
      configuration: { type: AdministrativeAreas.enum.ADMIN_STRUCTURE }
    },
    {
      id: locationLevel2.id,
      type: FieldType.ADMINISTRATIVE_AREA,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            isDomesticAddress(),
            not(createFieldCondition(locationLevel1.id).isUndefined())
          )
        }
      ],
      required: true,
      parent: createFieldCondition('country'),
      label: locationLevel2.label,
      configuration: {
        type: AdministrativeAreas.enum.ADMIN_STRUCTURE,
        partOf: {
          $declaration: locationLevel1.id
        }
      }
    },
    {
      id: 'urbanOrRural',
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        },
        {
          type: ConditionalType.SHOW,
          conditional: and(
            isDomesticAddress(),
            not(createFieldCondition('zone').isUndefined())
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
  ]
}
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
type RequiredKeysFromFieldValue = AllKeys<ConfigurableAddressFieldValue>
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
/* type _ExpectTrue = Expect<
  EnsureSameUnion<AllFields, RequiredKeysFromFieldValue>
> */
const ALL_ADDRESS_INPUT_FIELDS = [
  ...ADMIN_STRUCTURE,
  ...URBAN_FIELDS,
  ...RURAL_FIELDS,
  ...GENERIC_ADDRESS_FIELDS
] satisfies Array<FieldConfigWithoutAddress>
const SEARCH_MODE_FIELDS: Array<
  (typeof ALL_ADDRESS_INPUT_FIELDS)[number]['id']
> = [
  'country',
  /* 'province',
  'district', */
  'state',
  'district2',
  /* 'urbanOrRural', */
  'town',
  'village'
]
function getFilteredFields(
  searchMode: boolean,
  addressInputFields: Array<FieldConfigWithoutAddress>
) {
  if (!searchMode) {
    return addressInputFields
  }
  return ALL_ADDRESS_INPUT_FIELDS.filter((field) =>
    SEARCH_MODE_FIELDS.includes(field.id)
  )
}
/**
 * AddressInput is a form component for capturing address details based on administrative structure.
 *
 * - The form dynamically adjusts the fields displayed based on user input.
 * - By default, it includes fields for admin structure and a selection between urban and rural addresses.
 * - All admin structure fields are hidden until the previous field is selected.
 * - Address details fields are only shown when district is selected (it being the last admin structure field).
 * - In search mode, only displays admin structure and town/village fields.
 */
function AddressInput(props: Props) {
  const {
    onChange,
    defaultValue,
    configuration,
    value = {},
    ...otherProps
  } = props
  const { config } = useSelector(getOfflineData)
  const MY_ADMIN_STRUCTURE = config.ADMIN_STRUCTURE

  const NEW_ADMIN_STRUCTURE = populateAdminStructure(
    MY_ADMIN_STRUCTURE[0],
    MY_ADMIN_STRUCTURE[1]
  ) as FieldConfigWithoutAddress[]

  const searchMode = configuration?.searchMode || false
  const administrativeLevelsCutoff = configuration?.administrativeLevels
  // If administrativeLevelsCutoff is provided, only show admin levels till/before provided administrativeLevelsCutoff
  console.log('administrativeLevelsCutoff', administrativeLevelsCutoff)

  const additionalAddressFields =
    configuration?.streetAddressForm as FieldConfigWithoutAddress[]
  // If custom address fields are provided, then only render those; otherwise render default form
  console.log('additionalAddressFields', additionalAddressFields)

  const fields = getFilteredFields(searchMode, NEW_ADMIN_STRUCTURE)

  const fieldsWithDefaults = defaultValue
    ? fields.map(addDefaultValue(defaultValue))
    : fields

  console.log('value', value)

  return (
    <FormFieldGenerator
      {...otherProps}
      fields={[...fieldsWithDefaults /* , ...additionalAddressFields */]}
      initialValues={{ ...defaultValue, ...value }}
      onChange={(values) => {
        console.log('onChange values', values)
        return onChange(values.zone as ConfigurableAddressFieldValue)
      }}
    />
  )
}
function AddressOutput({
  value,
  searchMode = false
}: {
  value?: ConfigurableAddressFieldValue
  searchMode?: boolean
}) {
  if (!value) {
    return ''
  }
  console.log('AddressOutput value', value)
  const { config } = useSelector(getOfflineData)
  const MY_ADMIN_STRUCTURE = config.ADMIN_STRUCTURE

  const NEW_ADMIN_STRUCTURE = populateAdminStructure(
    MY_ADMIN_STRUCTURE[0],
    MY_ADMIN_STRUCTURE[1]
  ) as FieldConfigWithoutAddress[]

  console.log('NEW_ADMIN_STRUCTURE in AddressOutput', NEW_ADMIN_STRUCTURE)

  const fields = getFilteredFields(searchMode, NEW_ADMIN_STRUCTURE)
    .map((field) => ({
      field,
      value: value[field.id as keyof typeof value]
    }))
    .filter(
      (field) =>
        field.value &&
        isFieldDisplayedOnReview(field.field satisfies FieldConfig, value)
    )
  console.log('fields', fields)
  if (searchMode) {
    return (
      <>
        {fields.map((field, index) => (
          <React.Fragment key={field.field.id}>
            <Output
              field={field.field}
              showPreviouslyMissingValuesAsChanged={false}
              value={field.value}
            />
            {index < fields.length - 1 && ', '}
          </React.Fragment>
        ))}
      </>
    )
  }
  return (
    <>
      {fields.map((field) => (
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
  value: ConfigurableAddressFieldValue
) {
  const fieldStringifier = stringifySimpleField(intl, locations)
  /*
   * As address is just a collection of other form fields, its string formatter just redirects the data back to
   * form data stringifier so location and other form fields can handle stringifying their own data
   */
  const formStringifier = formDataStringifierFactory(fieldStringifier)
  return formStringifier(ALL_ADDRESS_FIELDS, value as EventState)
}
export const ConfigurableAddress = {
  Input: AddressInput,
  Output: AddressOutput,
  stringify
}
