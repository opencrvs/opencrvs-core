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
  AddressFieldValue,
  and,
  ConditionalType,
  field as createFieldCondition,
  FieldConfig,
  FieldProps,
  FieldType,
  not,
  AdministrativeAreas,
  alwaysTrue,
  AddressType,
  isFieldDisplayedOnReview,
  AddressField,
  AdministrativeArea
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { Output } from '@client/v2-events/features/events/components/Output'
import {
  formDataStringifierFactory,
  stringifySimpleField
} from '@client/v2-events/hooks/useFormDataStringifier'
import { getOfflineData } from '@client/offline/selectors'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { IAdminStructureItem } from '@client/utils/referenceApi'

// ADDRESS field may not contain another ADDRESS field
type FieldConfigWithoutAddress = Exclude<
  FieldConfig,
  { type: typeof FieldType.ADDRESS }
>

type Props = FieldProps<typeof FieldType.ADDRESS> & {
  onChange: (newValue: Partial<AddressFieldValue>) => void
  value?: AddressFieldValue
  configuration?: AddressField['configuration']
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

function getAdminLevelHierarchy(
  targetAdminUUId: string | undefined,
  locations: Location[]
) {
  // Prepare result object
  const result: Partial<Record<`adminLevel${number}`, string>> = {}

  // Find the starting location
  let current = targetAdminUUId
    ? locations.find((l) => l.id === targetAdminUUId.toString())
    : null

  // Walk up the hierarchy, collecting UUIDs
  let level = 0
  while (current) {
    level++
    result[`adminLevel${level}` as const] = current.id
    if (!current.partOf) {
      break
    }
    // partOf may be "Location/UUID" or just "UUID"
    const parentId = current.partOf.replace(/^Location\//, '')
    current = locations.find((l) => l.id === parentId)
  }

  // Reverse the result so adminLevel1 is the root, adminLevelN is the leaf
  const entries = Object.entries(result).reverse()
  const hierarchy: Partial<Record<`adminLevel${number}`, string>> = {}
  entries.forEach(([_, id], idx) => {
    hierarchy[`adminLevel${idx + 1}` as const] = id
  })
  return hierarchy
}

function transformKeyArray(
  inputArray: IAdminStructureItem[]
): AdministrativeArea[] {
  return inputArray.map((item, index) => {
    const { id, label } = item
    const isFirst = index === 0

    const prevItem = index > 0 ? inputArray[index - 1] : null
    const parentId = isFirst ? 'country' : (prevItem?.id ?? '')

    const conditionals = [
      {
        type: ConditionalType.SHOW,
        conditional: isFirst
          ? isDomesticAddress()
          : and(
              isDomesticAddress(),
              not(createFieldCondition(parentId).isUndefined())
            )
      }
    ]

    const configuration: AdministrativeArea['configuration'] = {
      type: AdministrativeAreas.enum.ADMIN_STRUCTURE
    }

    if (!isFirst && prevItem?.id) {
      configuration.partOf = { $declaration: prevItem.id }
    }

    const field: AdministrativeArea = {
      id,
      type: FieldType.ADMINISTRATIVE_AREA,
      required: true,
      label,
      parent: createFieldCondition(parentId),
      conditionals,
      configuration
    }

    return field
  })
}

const COUNTRY_FIELD = {
  id: 'country',
  conditionals: [],
  required: true,
  label: {
    id: 'v2.field.address.country.label',
    defaultMessage: 'Country',
    description: 'This is the label for the field'
  },
  type: FieldType.COUNTRY
} as const satisfies FieldConfigWithoutAddress

const ADDRESS_TYPE_FIELD = {
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

const ALL_ADDRESS_FIELDS = [COUNTRY_FIELD, ADDRESS_TYPE_FIELD]

const ALL_ADDRESS_INPUT_FIELDS = [
  COUNTRY_FIELD
] satisfies Array<FieldConfigWithoutAddress>

type AddressFieldIdentifier = (typeof ALL_ADDRESS_FIELDS)[number]['id']

function getFilteredFields(fieldsToShow?: Array<string>) {
  if (!fieldsToShow) {
    return ALL_ADDRESS_INPUT_FIELDS
  }
  return ALL_ADDRESS_INPUT_FIELDS.filter((field) =>
    fieldsToShow.includes(field.id)
  )
}

function extractAddressLines(obj: Partial<AddressFieldValue>) {
  const keysToIgnore = [
    'country',
    'addressType',
    'administrativeArea',
    'streetLevelDetails',
    'adminLevel1',
    'adminLevel2',
    'adminLevel3',
    'adminLevel4',
    'adminLevel5',
    'adminLevel6'
  ]
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([key, value]) => !keysToIgnore.includes(key) && value !== undefined
    )
  )
}

function getLeafAdministrativeLevel(val: Partial<AddressFieldValue>) {
  for (let i = 6; i >= 1; i--) {
    const key = `adminLevel${i}` as keyof AddressFieldValue
    if (val[key]) {
      return val[key]
    }
  }
  return undefined
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
  const { onChange, defaultValue, value, ...otherProps } = props
  const { config } = useSelector(getOfflineData)
  const appConfigAdminLevels = config.ADMIN_STRUCTURE
  const administrativeLevelsCutoff = props.configuration?.administrativeLevels

  const administrativeLevels =
    Array.isArray(administrativeLevelsCutoff) &&
    administrativeLevelsCutoff.length > 0
      ? administrativeLevelsCutoff
      : appConfigAdminLevels

  const adminStructure = transformKeyArray(appConfigAdminLevels)

  /* const adminStructure = myAdminStructure.filter((item) =>
    administrativeLevels.includes(item.id)
  ) */

  const customAddressFields = props.configuration
    ?.streetAddressForm as FieldConfigWithoutAddress[]

  const addressFields =
    Array.isArray(customAddressFields) && customAddressFields.length > 0
      ? customAddressFields
      : []

  console.log(
    'defaultValue.administrativeArea :>> ',
    defaultValue?.administrativeArea
  )

  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()
  const administrativeAreaUUID =
    value?.administrativeArea || defaultValue?.administrativeArea

  const derivedAdminLevels = getAdminLevelHierarchy(
    administrativeAreaUUID,
    locations
  )
  console.log('adminLevels:', derivedAdminLevels)

  const fields = [COUNTRY_FIELD, ...adminStructure, ...addressFields]

  console.log('value in AddressInput', { ...value, ...derivedAdminLevels })

  return (
    <FormFieldGenerator
      {...otherProps}
      fields={fields}
      initialValues={{ ...value, ...derivedAdminLevels }}
      parentId={props.id}
      onChange={(values) => {
        console.log('AddressInput onChange values:', values)

        const addressLines = extractAddressLines(values)

        const leafAdminLevel = getLeafAdministrativeLevel(values)

        if (leafAdminLevel) {
          console.log('Leaf level adminLevel value:', leafAdminLevel)
        }

        onChange({
          ...values,
          administrativeArea:
            value?.addressType === AddressType.DOMESTIC
              ? leafAdminLevel
              : undefined,
          streetLevelDetails: addressLines
        } as Partial<AddressFieldValue>)
      }}
    />
  )
}

function AddressOutput({
  value,
  lineSeparator,
  fields,
  configuration
}: {
  value?: AddressFieldValue
  lineSeparator?: React.ReactNode
  fields?: Array<AddressFieldIdentifier>
  configuration?: AddressField
}) {
  if (!value) {
    return ''
  }
  console.log('value in AddressOutput', value)

  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()
  const targetAdminUUId = value.administrativeArea

  const location = targetAdminUUId?.toString()
    ? locations.find((l) => l.id === targetAdminUUId.toString())
    : null

  console.log('location in AddressOutput', location)

  const adminLevels = getAdminLevelHierarchy(targetAdminUUId, locations)
  console.log('adminLevels:', adminLevels)

  const updatedValues = {
    ...value,
    ...adminLevels
  }

  console.log('updatedValues in AddressOutput', updatedValues)

  const { config } = useSelector(getOfflineData)
  const appConfigAdminLevels = config.ADMIN_STRUCTURE

  const adminStructure = transformKeyArray(appConfigAdminLevels)

  /* const adminStructure = ADMIN_STRUCTURE_FIELDS.filter((item) =>
    appConfigAdminLevels.includes(item.id)
  ) */

  const customAddressFields = configuration?.configuration
    ?.streetAddressForm as FieldConfigWithoutAddress[]

  console.log('customAddressFields :>> ', customAddressFields)

  const addressFields =
    Array.isArray(customAddressFields) && customAddressFields.length > 0
      ? customAddressFields
      : []

  function flattenAddressObject(obj: AddressFieldValue): Record<string, any> {
    if (!obj) {
      return {}
    }
    const { streetLevelDetails, ...rest } = obj
    return {
      ...rest,
      ...(streetLevelDetails && typeof streetLevelDetails === 'object'
        ? streetLevelDetails
        : {})
    }
  }

  const flatValues = flattenAddressObject(updatedValues)

  const fieldsToShow = [COUNTRY_FIELD, ...adminStructure, ...addressFields]
    .map((field) => ({
      field,
      value: flatValues[field.id]
    }))
    .filter(
      (field) =>
        field.value &&
        isFieldDisplayedOnReview(
          field.field satisfies FieldConfig,
          updatedValues
        )
    )

  console.log('fieldsToShow :>> ', fieldsToShow)

  return (
    <>
      {fieldsToShow.map((field, index) => (
        <React.Fragment key={field.field.id}>
          <Output
            field={field.field}
            showPreviouslyMissingValuesAsChanged={false}
            value={field.value}
          />
          {index < fieldsToShow.length - 1 && (lineSeparator || <br />)}
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
