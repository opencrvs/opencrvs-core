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
import { useSelector } from 'react-redux'
import {
  EventState,
  AddressFieldValue,
  and,
  ConditionalType,
  field as createFieldCondition,
  FieldConfig,
  FieldPropsWithoutReferenceValue,
  FieldType,
  Location,
  not,
  AdministrativeAreas,
  alwaysTrue,
  AddressType,
  isFieldDisplayedOnReview,
  AddressField,
  AdministrativeArea,
  DefaultAddressFieldValue,
  LocationType
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { Output } from '@client/v2-events/features/events/components/Output'
import { getFormDataStringifier } from '@client/v2-events/hooks/useFormDataStringifier'
import { getOfflineData } from '@client/offline/selectors'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { AdminStructureItem } from '@client/utils/referenceApi'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getAdminLevelHierarchy } from '@client/v2-events/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'

// ADDRESS field may not contain another ADDRESS field
type FieldConfigWithoutAddress = Exclude<
  FieldConfig,
  { type: typeof FieldType.ADDRESS }
>

type Props = FieldPropsWithoutReferenceValue<typeof FieldType.ADDRESS> & {
  onChange: (newValue: Partial<AddressFieldValue>) => void
  value?: AddressFieldValue
  configuration?: AddressField['configuration']
  disabled?: boolean
}

const COUNTRY_FIELD = {
  id: 'country',
  conditionals: [],
  required: true,
  label: {
    id: 'field.address.country.label',
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
    id: 'messages.emptyString'
  },
  type: FieldType.TEXT
} as const satisfies FieldConfigWithoutAddress

const ADMINISTRATIVE_AREA_FIELD = {
  id: 'administrativeArea',
  conditionals: [
    {
      type: ConditionalType.SHOW,
      conditional: not(alwaysTrue())
    }
  ],
  label: {
    defaultMessage: '',
    description: 'empty string',
    id: 'messages.emptyString'
  },
  type: FieldType.TEXT
} as const satisfies FieldConfigWithoutAddress

const STREET_LEVEL_DETAILS_FIELD = {
  id: 'streetLevelDetails',
  conditionals: [
    {
      type: ConditionalType.SHOW,
      conditional: not(alwaysTrue())
    }
  ],
  label: {
    defaultMessage: '',
    description: 'empty string',
    id: 'messages.emptyString'
  },
  type: FieldType.TEXT
} as const satisfies FieldConfigWithoutAddress

const ALL_ADDRESS_FIELDS = [
  COUNTRY_FIELD,
  ADDRESS_TYPE_FIELD,
  ADMINISTRATIVE_AREA_FIELD,
  STREET_LEVEL_DETAILS_FIELD
]

const ALL_ADDRESS_INPUT_FIELDS = [
  COUNTRY_FIELD
] satisfies Array<FieldConfigWithoutAddress>

type AddressFieldIdentifier = (typeof ALL_ADDRESS_FIELDS)[number]['id']

function isDomesticAddress() {
  return and(
    not(createFieldCondition('country').isUndefined()),
    createFieldCondition('addressType').isEqualTo(AddressType.DOMESTIC)
  )
}

function generateAdminStructureFields(
  inputArray: AdminStructureItem[]
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
      conditionals,
      parent: createFieldCondition(parentId),
      required: true,
      label,
      configuration
    }

    return field
  })
}

function extractAddressLines(
  obj: Partial<AddressFieldValue>,
  adminLevelIds: string[]
) {
  const keysToIgnore = [
    'country',
    'addressType',
    'administrativeArea',
    'streetLevelDetails',
    ...adminLevelIds
  ]
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([key, value]) => !keysToIgnore.includes(key) && value
    )
  )
}

function getLeafAdministrativeLevel(
  val: Partial<AddressFieldValue>,
  keys: string[]
) {
  if (val.addressType === AddressType.INTERNATIONAL) {
    return undefined
  }
  // Start from the last key and move backwards
  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i] as keyof AddressFieldValue
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
  const { onChange, defaultValue, disabled, value, ...otherProps } = props
  const { config } = useSelector(getOfflineData)
  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()
  const userDetails = useSelector(getUserDetails)
  const appConfigAdminLevels = config.ADMIN_STRUCTURE
  const adminLevelIds = appConfigAdminLevels.map((level) => level.id)
  const adminStructure = generateAdminStructureFields(appConfigAdminLevels)
  const customAddressFields = props.configuration?.streetAddressForm

  const adminStructureLocations = locations.filter(
    (location) => location.locationType === 'ADMIN_STRUCTURE'
  )

  const administrativeArea = value?.administrativeArea

  const resolveAdministrativeArea = (
    adminArea:
      | AddressFieldValue['administrativeArea']
      | DefaultAddressFieldValue['administrativeArea']
  ) => {
    if (!adminArea) {
      return undefined
    }
    if (typeof adminArea === 'string') {
      return adminArea
    }
    if (adminArea.$location) {
      const locationId = userDetails?.primaryOffice.id

      const hierarchy = getAdminLevelHierarchy(
        locationId,
        locations,
        adminLevelIds
      )

      return hierarchy[adminArea.$location]
    }
  }

  const resolvedAdministrativeArea =
    resolveAdministrativeArea(administrativeArea)

  if (value) {
    value.administrativeArea = resolvedAdministrativeArea
  }

  const resolvedValue = {
    ...value,
    ...value?.streetLevelDetails,
    administrativeArea: resolvedAdministrativeArea
  }

  const addressFields =
    Array.isArray(customAddressFields) && customAddressFields.length > 0
      ? customAddressFields
      : []

  const derivedAdminLevels = getAdminLevelHierarchy(
    resolvedAdministrativeArea,
    adminStructureLocations,
    adminLevelIds
  )

  const fields = [COUNTRY_FIELD, ...adminStructure, ...addressFields].map(
    (x) => {
      const existingEnableCondition =
        x.conditionals?.find((c) => c.type === ConditionalType.ENABLE)
          ?.conditional ?? not(not(alwaysTrue()))
      return {
        ...x,
        conditionals: [
          ...(x.conditionals ?? []),
          {
            type: ConditionalType.ENABLE,
            conditional: disabled ? not(alwaysTrue()) : existingEnableCondition
          }
        ]
      }
    }
  )

  const handleChange = (values: EventState) => {
    const addressLines = extractAddressLines(values, adminLevelIds)
    const leafAdminLevelValue = getLeafAdministrativeLevel(
      values,
      adminLevelIds
    )
    const addressValue = {
      ...values,
      administrativeArea:
        values.addressType === AddressType.DOMESTIC
          ? leafAdminLevelValue
          : undefined,
      streetLevelDetails: addressLines
    }

    const cleanedAddressValue = Object.fromEntries(
      Object.entries(addressValue).filter(([_, v]) => v != null)
    )

    onChange(cleanedAddressValue as AddressFieldValue)
  }

  return (
    <FormFieldGenerator
      {...otherProps}
      fields={fields}
      initialValues={{ ...resolvedValue, ...derivedAdminLevels }}
      locations={adminStructureLocations}
      parentId={props.id}
      onChange={handleChange}
    />
  )
}

function AddressOutput({
  value,
  lineSeparator,
  configuration
}: {
  value?: AddressFieldValue
  lineSeparator?: React.ReactNode
  configuration?: AddressField
}) {
  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()
  const { config } = useSelector(getOfflineData)
  const customAddressFields = configuration?.configuration
    ?.streetAddressForm as FieldConfigWithoutAddress[]
  const appConfigAdminLevels = config.ADMIN_STRUCTURE

  if (!value) {
    return ''
  }

  const administrativeArea = value.administrativeArea
  const adminStructureLocations = locations.filter(
    (location) => location.locationType === LocationType.enum.ADMIN_STRUCTURE
  )

  const adminLevelIds = appConfigAdminLevels.map((level) => level.id)

  const adminLevels = getAdminLevelHierarchy(
    administrativeArea,
    adminStructureLocations,
    adminLevelIds
  )

  const addressValues = {
    ...value,
    ...adminLevels
  }

  const adminStructure = generateAdminStructureFields(appConfigAdminLevels)

  const addressFields =
    Array.isArray(customAddressFields) && customAddressFields.length > 0
      ? customAddressFields
      : []

  function flattenAddressObject(
    obj: AddressFieldValue
  ): Record<string, string | undefined> {
    const { streetLevelDetails, ...rest } = obj
    return {
      ...rest,
      ...(streetLevelDetails && typeof streetLevelDetails === 'object'
        ? streetLevelDetails
        : {})
    }
  }

  const flattenedAddressValues = flattenAddressObject(addressValues)

  const fieldsToShow = [COUNTRY_FIELD, ...adminStructure, ...addressFields]
    .map((field) => ({
      field,
      value: flattenedAddressValues[field.id]
    }))
    .filter(
      (field) =>
        field.value &&
        isFieldDisplayedOnReview(
          field.field satisfies FieldConfig,
          addressValues
        )
    )

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

function toCertificateVariables(
  value: AddressFieldValue,
  context: {
    intl: IntlShape
    locations: Location[]
    adminLevels?: AdminStructureItem[]
  }
) {
  /*
   * As address is just a collection of other form fields, its string formatter just redirects the data back to
   * form data stringifier so location and other form fields can handle stringifying their own data
   */
  const { intl, locations, adminLevels } = context
  const appConfigAdminLevels = adminLevels?.map((level) => level.id)

  const { administrativeArea, streetLevelDetails } = value

  const adminStructureLocations = locations.filter(
    (location) => location.locationType === 'ADMIN_STRUCTURE'
  )

  const adminLevelHierarchy = getAdminLevelHierarchy(
    administrativeArea,
    adminStructureLocations,
    appConfigAdminLevels as string[],
    'withNames'
  )

  const stringifier = getFormDataStringifier(intl, locations)
  const stringifiedResult = stringifier(ALL_ADDRESS_FIELDS, value as EventState)

  return {
    ...stringifiedResult,
    ...adminLevelHierarchy,
    streetLevelDetails
  }
}

export const Address = {
  Input: withSuspense(AddressInput),
  Output: AddressOutput,
  toCertificateVariables
}
