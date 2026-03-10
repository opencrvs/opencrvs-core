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
  Country as CountryField,
  field as fieldHelper,
  FieldType,
  Location,
  not,
  AdministrativeAreas,
  alwaysTrue,
  AddressType,
  isFieldDisplayedOnReview,
  AddressField,
  AdministrativeArea as AdministrativeAreaField,
  TextField,
  LocationType,
  ValidatorContext,
  IndexMap,
  FormState
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { Output } from '@client/v2-events/features/events/components/Output'
import { getFormDataStringifier } from '@client/v2-events/hooks/useFormDataStringifier'
import { getOfflineData } from '@client/offline/selectors'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { AdminStructureItem } from '@client/utils/referenceApi'
import { getAdminLevelHierarchy } from '@client/v2-events/utils'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { withSuspense } from '@client/v2-events/components/withSuspense'

interface Props {
  id: string
  name: string
  onBlur: (formikFieldId: string, newTouched: FormState<boolean>) => void
  onChange: (newValue: AddressFieldValue) => void
  touched: IndexMap<FormState<boolean>> | undefined
  value?: AddressFieldValue
  config: AddressField
  disabled?: boolean
  validatorContext: ValidatorContext
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
} satisfies CountryField

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
} satisfies TextField

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
} satisfies TextField

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
} satisfies TextField

const ALL_ADDRESS_FIELDS = [
  COUNTRY_FIELD,
  ADDRESS_TYPE_FIELD,
  ADMINISTRATIVE_AREA_FIELD,
  STREET_LEVEL_DETAILS_FIELD
]

function isDomesticAddress() {
  return and(
    not(fieldHelper('country').isUndefined()),
    fieldHelper('addressType').isEqualTo(AddressType.DOMESTIC)
  )
}

function generateAddressFields(
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
    ...COUNTRY_FIELD,
    ...countryFieldConfig,
    required: countryFieldConfig?.required ?? config.required,
    type: FieldType.COUNTRY
  }

  const adminConfigs =
    configFields?.filter((f) => f.type === FieldType.ADMINISTRATIVE_AREA) ??
    adminStructure.map((admin) => ({
      ...admin,
      type: FieldType.ADMINISTRATIVE_AREA,
      required: config.required,
      conditionals: []
    }))

  const domesticFields = adminConfigs.map((adminConfig, index) => {
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

    const mandatoryShowCondition = and(
      isDomesticAddress(),
      not(fieldHelper(parentId).isFalsy())
    )

    const existingShowConditional = adminConfig.conditionals?.find(
      ({ type }) => type === ConditionalType.SHOW
    )

    const conditionals = [
      ...(adminConfig.conditionals ?? []).filter(
        ({ type }) => type !== ConditionalType.SHOW
      ),
      {
        type: ConditionalType.SHOW,
        conditional: existingShowConditional
          ? and(existingShowConditional.conditional, mandatoryShowCondition)
          : mandatoryShowCondition
      }
    ]

    const configuration: AdministrativeAreaField['configuration'] = {
      type: AdministrativeAreas.enum.ADMIN_STRUCTURE
    }

    if (!isFirst && prevItem?.id) {
      configuration.partOf = fieldHelper(prevItem.id)
    }

    const field: AdministrativeAreaField = {
      id,
      type: FieldType.ADMINISTRATIVE_AREA,
      conditionals,
      parent: !isFirst ? fieldHelper(parentId) : undefined,
      required: adminConfig.required ?? config.required,
      label,
      configuration
    }

    return field
  })

  const streetAddressFields = config.configuration?.streetAddressForm ?? []

  return {
    countryField,
    domesticFields,
    streetAddressFields
  }
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
  ) as Record<string, string>
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
      return val[key] as string
    }
  }
  return undefined
}

function getAdministrativeArea(value?: AddressFieldValue) {
  return value?.addressType === AddressType.DOMESTIC
    ? value.administrativeArea
    : undefined
}

function withHierarchyExpanded(
  value: AddressFieldValue,
  adminLevelIds: string[],
  adminStructureLocations: Location[]
): AddressFieldValue {
  const administrativeArea = getAdministrativeArea(value)
  const derivedAdminLevels = getAdminLevelHierarchy(
    administrativeArea,
    adminStructureLocations,
    adminLevelIds
  )
  return {
    ...value,
    ...derivedAdminLevels
  }
}

function transformParentValueToNestedValue(
  value: AddressFieldValue,
  adminLevelIds: string[],
  adminStructureLocations: Location[]
): EventState {
  const { streetLevelDetails, ...valueWithoutStreetLevelDetails } =
    withHierarchyExpanded(value, adminLevelIds, adminStructureLocations)
  return {
    ...valueWithoutStreetLevelDetails,
    ...streetLevelDetails
  }
}

function transformNestedValueToParentValue(
  nestedValue: EventState,
  adminLevelIds: string[]
): AddressFieldValue {
  const addressLines = extractAddressLines(nestedValue, adminLevelIds)
  const leafAdminLevelValue = getLeafAdministrativeLevel(
    nestedValue,
    adminLevelIds
  )
  const country = nestedValue.country as string
  const defaultCountry = window.config.COUNTRY || 'FAR'
  if (country === defaultCountry) {
    return {
      country,
      addressType: AddressType.DOMESTIC,
      administrativeArea: leafAdminLevelValue ?? '',
      streetLevelDetails: addressLines
    }
  }
  return {
    country,
    addressType: AddressType.INTERNATIONAL,
    streetLevelDetails: addressLines
  }
}

function transformParentTouchedToNestedTouched(
  parentTouched: IndexMap<FormState<boolean>>,
  adminLevelIds: string[],
  streetAddressFieldIds: string[]
): IndexMap<FormState<boolean>> {
  const result: IndexMap<FormState<boolean>> = {}

  if (parentTouched.administrativeArea) {
    adminLevelIds.forEach((id) => {
      result[id] = true
    })
  }
  if (parentTouched.country) {
    result.country = parentTouched.country
  }

  const streetLevelDetailsTouched = parentTouched.streetLevelDetails
  if (
    streetLevelDetailsTouched &&
    typeof streetLevelDetailsTouched === 'object'
  ) {
    streetAddressFieldIds.forEach((id) => {
      if (streetLevelDetailsTouched[id]) {
        result[id] = streetLevelDetailsTouched[id]
      }
    })
  }

  return result
}

function transformNestedTouchedToParentTouched(
  nestedTouched: IndexMap<FormState<boolean>>,
  adminLevelIds: string[],
  streetAddressFieldIds: string[]
): IndexMap<FormState<boolean>> {
  const result: IndexMap<FormState<boolean>> = {}

  const adminLevelTouched = adminLevelIds.some((id) => nestedTouched[id])
  if (adminLevelTouched) {
    result.administrativeArea = true
  }
  if (nestedTouched.country) {
    result.country = nestedTouched.country
  }

  const streetDetailsTouched: Record<string, FormState<boolean>> = {}
  streetAddressFieldIds.forEach((id) => {
    if (nestedTouched[id]) {
      streetDetailsTouched[id] = nestedTouched[id]
    }
  })
  result.streetLevelDetails = streetDetailsTouched

  return result
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
    onBlur,
    onChange,
    config: addressConfig,
    disabled,
    name,
    value = {
      addressType: AddressType.DOMESTIC,
      country: '',
      administrativeArea: ''
    },
    validatorContext,
    touched = {},
    ...otherProps
  } = props
  const { config } = useSelector(getOfflineData)
  const { getLocations } = useLocations()
  const [adminStructureLocations] = getLocations.useSuspenseQuery({
    locationType: LocationType.enum.ADMIN_STRUCTURE
  })
  const appConfigAdminLevels = config.ADMIN_STRUCTURE
  const adminLevelIds = appConfigAdminLevels.map((level) => level.id)

  const { countryField, domesticFields, streetAddressFields } =
    generateAddressFields(addressConfig, appConfigAdminLevels)

  const streetAddressFieldIds = streetAddressFields.map((f) => f.id)

  const nestedValue = transformParentValueToNestedValue(
    value,
    adminLevelIds,
    adminStructureLocations
  )
  const nestedTouched = transformParentTouchedToNestedTouched(
    touched,
    adminLevelIds,
    streetAddressFieldIds
  )

  const fields = [countryField, ...domesticFields, ...streetAddressFields]

  return (
    <FormFieldGenerator
      {...otherProps}
      fields={fields}
      formContext={{ addressType: value.addressType }}
      formTouched={nestedTouched}
      formValues={nestedValue}
      validatorContext={validatorContext}
      onFormChange={(nestedVal) =>
        onChange(transformNestedValueToParentValue(nestedVal, adminLevelIds))
      }
      onTouchedChange={(newTouched) =>
        onBlur(
          name,
          transformNestedTouchedToParentTouched(
            newTouched,
            adminLevelIds,
            streetAddressFieldIds
          )
        )
      }
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
  const validatorContext = useValidatorContext()
  const { getLocations } = useLocations()
  const [adminStructureLocations] = getLocations.useSuspenseQuery({
    locationType: LocationType.enum.ADMIN_STRUCTURE
  })
  const { config } = useSelector(getOfflineData)
  const appConfigAdminLevels = config.ADMIN_STRUCTURE

  if (!value || !configuration) {
    return ''
  }

  const adminLevelIds = appConfigAdminLevels.map((level) => level.id)

  const addressValueWithHierarchyExpanded = withHierarchyExpanded(
    value,
    adminLevelIds,
    adminStructureLocations
  )

  const flattenedAddressValues = transformParentValueToNestedValue(
    value,
    adminLevelIds,
    adminStructureLocations
  )

  const { countryField, domesticFields, streetAddressFields } =
    generateAddressFields(configuration, appConfigAdminLevels)

  const fieldsToShow = [countryField, ...domesticFields, ...streetAddressFields]
    .map((field) => ({
      field,
      value: flattenedAddressValues[field.id]
    }))
    .filter(
      (field) =>
        field.value &&
        isFieldDisplayedOnReview(
          field.field,
          addressValueWithHierarchyExpanded,
          validatorContext
        )
    )

  return (
    <>
      {fieldsToShow.map((field, index) => (
        <React.Fragment key={field.field.id}>
          <Output field={field.field} value={field.value} />
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
  const stringifier = getFormDataStringifier(intl, locations)
  const stringifiedResult = stringifier(ALL_ADDRESS_FIELDS, value as EventState)
  const { streetLevelDetails } = value

  const administrativeArea = getAdministrativeArea(value)
  if (value.addressType === AddressType.INTERNATIONAL) {
    return { ...stringifiedResult, streetLevelDetails }
  }
  const appConfigAdminLevels = adminLevels?.map((level) => level.id)

  const adminStructureLocations = locations.filter(
    (location) => location.locationType === 'ADMIN_STRUCTURE'
  )

  const adminLevelHierarchy = getAdminLevelHierarchy(
    administrativeArea,
    adminStructureLocations,
    appConfigAdminLevels as string[],
    'withNames'
  )

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
