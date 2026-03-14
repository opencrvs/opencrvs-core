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
  FormState,
  FieldConfig
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

/* eslint-disable max-lines */

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

const DEFAULT_COUNTRY_FIELD = {
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
  DEFAULT_COUNTRY_FIELD,
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

/**
 * Wraps a field config so it is permanently disabled by replacing any existing
 * `ENABLE` conditional with one that never resolves to true.
 */
function withDisabledConditional<T extends FieldConfig>(field: T): T {
  return {
    ...field,
    conditionals: [
      ...(field.conditionals ?? []).filter((cond) => cond.type !== 'ENABLE'),
      { type: 'ENABLE', conditional: not(alwaysTrue()) }
    ]
  }
}

/**
 * Builds the three groups of sub-fields that make up an address form:
 * a country picker, a list of administrative-area dropdowns, and any
 * free-text street-level fields.
 *
 * The admin-area dropdowns are derived from `adminStructure` (the country's
 * configured hierarchy, e.g. Province → District → Sub-district).  Each
 * dropdown is only shown once the one above it has a value selected, and all
 * domestic dropdowns are hidden when the selected country is international.
 *
 * Field-level overrides in `addressConfig.configuration.fields` take
 * precedence over the defaults derived from `adminStructure`, allowing
 * individual levels to customise label, required flag, or show/hide
 * conditionals.
 *
 * When `disabled` is `true` every generated field is wrapped with
 * `withDisabledConditional` so the whole address block becomes read-only
 * regardless of the individual field's own `ENABLE` conditional.
 *
 * @example
 * // No field overrides – fields are generated 1-to-1 from the admin structure:
 * const { countryField, domesticFields, streetAddressFields } =
 *   generateAddressFields(addressConfig, [
 *     { id: 'province', label: { id: 'province', defaultMessage: 'Province', description: '' } },
 *     { id: 'district', label: { id: 'district', defaultMessage: 'District', description: '' } }
 *   ])
 * // domesticFields => [provinceField, districtField]
 * // districtField has a SHOW conditional that requires provinceField to be non-empty
 *
 * @example
 * // Render the entire address as disabled (e.g. in a read-only review panel):
 * const fields = generateAddressFields(addressConfig, adminStructure, true)
 * // All fields in fields.domesticFields have { type: 'ENABLE', conditional: not(alwaysTrue()) }
 */
function generateAddressFields(
  addressConfig: AddressField,
  adminStructure: AdminStructureItem[],
  disabled?: boolean
): {
  countryField: CountryField
  domesticFields: AdministrativeAreaField[]
  streetAddressFields: TextField[]
} {
  const configFields = addressConfig.configuration?.fields
  const countryFieldConfig = configFields?.find(
    (f) => f.type === FieldType.COUNTRY
  )
  const countryField: CountryField = {
    ...DEFAULT_COUNTRY_FIELD,
    ...countryFieldConfig,
    required: countryFieldConfig?.required ?? addressConfig.required,
    type: FieldType.COUNTRY
  }

  const adminConfigs =
    configFields?.filter((f) => f.type === FieldType.ADMINISTRATIVE_AREA) ??
    adminStructure.map((admin) => ({
      ...admin,
      type: FieldType.ADMINISTRATIVE_AREA,
      required: addressConfig.required,
      conditionals: []
    }))

  const domesticFields = adminConfigs.map((adminConfig, index) => {
    const { id } = adminConfig
    const isFirst = index === 0
    const adminItem = adminStructure.find((s) => s.id === id)
    if (!adminItem) {
      throw new Error(
        `Invalid field ${id} in address configuration ${addressConfig.id}`
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
      required: adminConfig.required ?? addressConfig.required,
      label,
      configuration
    }

    return disabled ? withDisabledConditional(field) : field
  })

  const streetAddressFields =
    addressConfig.configuration?.streetAddressForm ?? []

  return {
    countryField: disabled
      ? withDisabledConditional(countryField)
      : countryField,
    domesticFields,
    streetAddressFields: streetAddressFields.map((f) =>
      disabled ? withDisabledConditional(f) : f
    )
  }
}

function extractAddressLines(
  obj: Partial<AddressFieldValue>,
  adminLevelIds: string[]
) {
  const keysToIgnore = ['country', ...adminLevelIds]
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

/**
 * Resolves a compact `AddressFieldValue` (which stores only the leaf
 * administrative-area id in `administrativeArea`) into a value where every
 * level in the admin hierarchy has its own key populated.
 *
 * The expansion is performed by walking up the location tree stored in
 * `adminStructureLocations` until all `adminLevelIds` are filled.
 *
 * @example
 * // Given: adminLevelIds = ['province', 'district']
 * //        administrativeArea = 'district-123' (a district whose parent is 'province-456')
 * const expanded = withHierarchyExpanded(value, adminLevelIds, locations)
 * // expanded => { ...value, province: 'province-456', district: 'district-123' }
 */
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

/**
 * Converts the compact parent `AddressFieldValue` into a flat `EventState`
 * object suitable for driving the nested `FormFieldGenerator`.
 *
 * Three transformations are applied:
 * 1. The single `administrativeArea` id is expanded into one key per admin
 *    level via `withHierarchyExpanded` (e.g. `province`, `district`).
 * 2. The `streetLevelDetails` record is spread into top-level keys so each
 *    street-level field is addressed directly by its id.
 * 3. `addressType` is left out.
 *
 * @example
 * const parent: AddressFieldValue = {
 *   country: 'FAR',
 *   addressType: AddressType.DOMESTIC,
 *   administrativeArea: 'district-123',
 *   streetLevelDetails: { addressLine1: '42 Main St' }
 * }
 * const nested = transformParentValueToNestedValue(parent, ['province', 'district'], locations)
 * // nested => {
 * //   country: 'FAR', addressType: 'DOMESTIC',
 * //   province: 'province-456', district: 'district-123',
 * //   addressLine1: '42 Main St'
 * // }
 */
function transformParentValueToNestedValue(
  value: AddressFieldValue,
  adminLevelIds: string[],
  adminStructureLocations: Location[]
): EventState {
  const { streetLevelDetails, addressType, ...valueWithoutStreetLevelDetails } =
    withHierarchyExpanded(value, adminLevelIds, adminStructureLocations)
  return {
    ...valueWithoutStreetLevelDetails,
    ...streetLevelDetails
  }
}

/**
 * Converts the flat `EventState` produced by `FormFieldGenerator` back into
 * the compact `AddressFieldValue` stored in the parent form.
 *
 * Three transformations are applied (inverse of `transformParentValueToNestedValue`):
 * 1. All keys that are not admin-level ids or reserved address keys are
 *    collected into `streetLevelDetails`.
 * 2. For domestic addresses, the deepest non-empty admin-level id value is
 *    stored as `administrativeArea` (the single canonical reference used for
 *    persistence and searching).
 * 3. Based on the selected country, `addressType` is added in.
 *
 * @example
 * const nested: EventState = {
 *   country: 'FAR',
 *   province: 'province-456',
 *   district: 'district-123',
 *   addressLine1: '42 Main St'
 * }
 * const parent = transformNestedValueToParentValue(nested, ['province', 'district'])
 * // parent => {
 * //   country: 'FAR',
 * //   addressType: AddressType.DOMESTIC,
 * //   administrativeArea: 'district-123',
 * //   streetLevelDetails: { addressLine1: '42 Main St' }
 * // }
 */
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

/**
 * Converts the parent-level `touched` map (keyed by `AddressFieldValue` keys)
 * into the flat touched map expected by the nested `FormFieldGenerator`.
 *
 * - `administrativeArea: true` in the parent is broadcast to every admin-level
 *   field id so all dropdowns show their validation errors together.
 * - `country` is passed through unchanged.
 * - `streetLevelDetails` (an object keyed by street field id) is spread into
 *   top-level entries so each street field knows whether it has been touched.
 *
 * @example
 * const parentTouched = {
 *   administrativeArea: true,
 *   streetLevelDetails: { addressLine1: true }
 * }
 * const nested = transformParentTouchedToNestedTouched(
 *   parentTouched, ['province', 'district'], ['addressLine1']
 * )
 * // nested => { province: true, district: true, addressLine1: true }
 */
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

/**
 * Converts the flat nested touched map (produced by `FormFieldGenerator`) back
 * into the parent-level touched map stored on the outer form.
 * Inverse of `transformParentTouchedToNestedTouched`.
 *
 * - If *any* admin-level field was touched, `administrativeArea: true` is set
 *   so the parent field is marked touched.
 * - `country` is passed through unchanged.
 * - Street field touched entries are collected under `streetLevelDetails`.
 *
 * @example
 * const nestedTouched = { province: true, district: true, addressLine1: true }
 * const parent = transformNestedTouchedToParentTouched(
 *   nestedTouched, ['province', 'district'], ['addressLine1']
 * )
 * // parent => {
 * //   administrativeArea: true,
 * //   streetLevelDetails: { addressLine1: true }
 * // }
 */
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
 * Form component for capturing a structured address.
 *
 * Renders a `FormFieldGenerator` whose fields are built dynamically from the
 * country's administrative structure (e.g. Province → District) plus any
 * optional free-text street-level fields defined in the field configuration.
 *
 * Key behaviours:
 * - Administrative-area dropdowns are shown one level at a time; each level is
 *   hidden until the level above it has a value selected.
 * - Switching the country to a non-domestic value hides all domestic fields.
 * - When `disabled` is `true` all sub-fields are rendered as read-only,
 *   regardless of their own `ENABLE` conditional.
 *
 * Internally the component works with a *flat* `EventState` (one key per
 * sub-field) while the parent form stores a compact `AddressFieldValue`.
 * The `transform*` helpers convert between the two representations on every
 * change / blur event.
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
    generateAddressFields(addressConfig, appConfigAdminLevels, disabled)

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
      // addressType is passed as context to the nested form due to the value
      // being refererred in conditionals but not having any associated field
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
  configuration: AddressField
}) {
  const validatorContext = useValidatorContext()
  const { getLocations } = useLocations()
  const [adminStructureLocations] = getLocations.useSuspenseQuery({
    locationType: LocationType.enum.ADMIN_STRUCTURE
  })
  const { config } = useSelector(getOfflineData)
  const appConfigAdminLevels = config.ADMIN_STRUCTURE

  if (!value) {
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
