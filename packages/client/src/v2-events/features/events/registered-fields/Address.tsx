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
import { IntlShape, useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { useField, useFormikContext } from 'formik'
import { get } from 'lodash'
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
  AdministrativeArea as AdministrativeAreaField,
  DefaultAddressFieldValue,
  LocationType,
  ValidatorContext,
  RequireConfig,
  Country as CountryField,
  DomesticAddressFieldValue,
  TextField,
  SelectField,
  TranslationConfig,
  FieldReference
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { Output } from '@client/v2-events/features/events/components/Output'
import { getFormDataStringifier } from '@client/v2-events/hooks/useFormDataStringifier'
import { getOfflineData } from '@client/offline/selectors'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { AdminStructureItem } from '@client/utils/referenceApi'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getAdminLevelHierarchy } from '@client/v2-events/utils'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { InputField } from '@client/components/form/InputField'
import { AdministrativeArea } from './AdministrativeArea'
import { SelectCountry } from './SelectCountry'

// ADDRESS field may not contain another ADDRESS field
type AddressSubfield = CountryField | TextField | AdministrativeAreaField

type Props = FieldPropsWithoutReferenceValue<typeof FieldType.ADDRESS> & {
  onChange: (newValue: Partial<AddressFieldValue>) => void
  value?: AddressFieldValue
  configuration?: AddressField['configuration']
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
} as const satisfies AddressSubfield

function CountrySelectInput({
  config,
  onChange,
  disabled
}: {
  config: NonNullable<NonNullable<AddressField['configuration']>['fields']>[0]
  onChange: (val: string) => void
  disabled?: boolean
}) {
  const [input, meta, helper] = useField<string>(config.id)
  const intl = useIntl()
  const mergedConfig: CountryField = {
    ...COUNTRY_FIELD,
    ...config,
    type: FieldType.COUNTRY
  }
  return (
    <InputField
      id={config.id}
      error={meta.error}
      label={intl.formatMessage(mergedConfig.label)}
      touched={meta.touched}
      htmlFor={config.id}
    >
      <SelectCountry.Input
        {...mergedConfig}
        disabled={disabled}
        value={input.value}
        onChange={onChange}
      />
    </InputField>
  )
}

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
} as const satisfies AddressSubfield

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
} as const satisfies AddressSubfield

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
} as const satisfies AddressSubfield

const ALL_ADDRESS_FIELDS = [
  COUNTRY_FIELD,
  ADDRESS_TYPE_FIELD,
  ADMINISTRATIVE_AREA_FIELD,
  STREET_LEVEL_DETAILS_FIELD
]

function isDomesticAddress() {
  return and(
    not(createFieldCondition('country').isUndefined()),
    createFieldCondition('addressType').isEqualTo(AddressType.DOMESTIC)
  )
}

function generateAdminStructureFields(
  inputArray: AdminStructureItem[],
  required: RequireConfig
): AdministrativeAreaField[] {
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
      required,
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

function getAdministrativeArea(value?: AddressFieldValue) {
  return value?.addressType === AddressType.DOMESTIC
    ? value.administrativeArea
    : undefined
}

function AdminAreaInput({
  config,
  partOfRef,
  onChange,
  label,
  parent,
  disabled
}: {
  config: NonNullable<NonNullable<AddressField['configuration']>['fields']>[0]
  partOfRef?: string
  disabled?: boolean
  label: TranslationConfig
  parent?: FieldReference
  onChange: (val: string | null) => void
}) {
  const [input, meta, helper] = useField<string>(config.id)
  const {
    config: { ADMIN_STRUCTURE }
  } = useSelector(getOfflineData)
  const { values } = useFormikContext<object>()
  const intl = useIntl()
  const partOf = partOfRef ? get(values, partOfRef) : null

  const mergedConfig: AdministrativeAreaField = {
    ...config,
    type: FieldType.ADMINISTRATIVE_AREA,
    parent,
    label,
    configuration: {
      type: AdministrativeAreas.enum.ADMIN_STRUCTURE
    }
  }
  return (
    <InputField
      id={mergedConfig.id}
      error={meta.error}
      label={intl.formatMessage(mergedConfig.label)}
      touched={meta.touched}
      htmlFor={mergedConfig.id}
    >
      <AdministrativeArea.Input
        {...mergedConfig}
        disabled={disabled}
        partOf={partOf}
        value={input.value}
        onChange={onChange}
      />
    </InputField>
  )
}

function AddressInput2({
  addressConfig,
  onChange
}: {
  addressConfig: AddressField
  onChange: (newValue: Partial<AddressFieldValue>) => void
}) {
  const [input, meta, helper] = useField<AddressFieldValue>(addressConfig.id)
  const {
    config: { ADMIN_STRUCTURE }
  } = useSelector(getOfflineData)
  const countryFieldConfig = addressConfig.configuration?.fields?.find(
    ({ type }) => type === FieldType.COUNTRY
  )
  const adminAreaConfigs =
    addressConfig.configuration?.fields?.filter(
      ({ type }) => type === FieldType.ADMINISTRATIVE_AREA
    ) ?? []

  const handleCountryChange = (val: string) => {
    const defaultCountry = window.config.COUNTRY || 'FAR'
    if (val === defaultCountry) {
      onChange({
        country: val,
        addressType: AddressType.DOMESTIC
      })
    } else {
      onChange({
        country: val,
        addressType: AddressType.INTERNATIONAL
      })
    }
  }
  return (
    <>
      {countryFieldConfig && (
        <CountrySelectInput
          config={{
            ...countryFieldConfig,
            id: `${addressConfig.id}.${countryFieldConfig.id}`
          }}
          onChange={handleCountryChange}
        />
      )}
      {adminAreaConfigs.map((adminConfig, i) => {
        const config = {
          ...adminConfig,
          id: `${addressConfig.id}.${adminConfig.id}`
        }
        const label = ADMIN_STRUCTURE.find(
          (level) => level.id === adminConfig.id
        )?.label ?? { id: '', defaultMessage: '', description: '' }
        const partOfRef =
          i > 0
            ? `${addressConfig.id}.${adminAreaConfigs[i - 1].id}`
            : undefined

        const parent =
          i > 0
            ? {
                $$field: addressConfig.id,
                $$subfield: [adminAreaConfigs[i - 1].id]
              }
            : countryFieldConfig && {
                $$field: addressConfig.id,
                $$subfield: [countryFieldConfig.id]
              }

        const handleAdminLevelChange = (
          val: string | null,
          adminLevel: number
        ) => {
          const newValue = {
            ...input.value,
            addressType: AddressType.DOMESTIC,
            [adminAreaConfigs[adminLevel].id]: val
          }
          return onChange({
            ...newValue,
            administrativeArea: adminAreaConfigs.reduce(
              //@ts-expect-error
              (acc, { id }) => newValue[id] ?? acc,
              undefined
            )
          })
        }
        return (
          <AdminAreaInput
            key={adminConfig.id}
            config={config}
            label={label}
            parent={parent}
            partOfRef={partOfRef}
            onChange={(val) => handleAdminLevelChange(val, i)}
          />
        )
      })}
    </>
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
    disabled,
    value,
    validatorContext,
    ...otherProps
  } = props
  const { config } = useSelector(getOfflineData)
  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()
  const userDetails = useSelector(getUserDetails)
  const appConfigAdminLevels = config.ADMIN_STRUCTURE
  const adminLevelIds = appConfigAdminLevels.map((level) => level.id)
  const adminStructure = generateAdminStructureFields(
    appConfigAdminLevels,
    otherProps.required
  )
  const customAddressFields = props.configuration?.streetAddressForm

  const adminStructureLocations = locations.filter(
    (location) => location.locationType === 'ADMIN_STRUCTURE'
  )

  const administrativeArea = getAdministrativeArea(value)

  const resolveAdministrativeArea = (
    adminArea:
      | DomesticAddressFieldValue['administrativeArea']
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

  if (
    value &&
    value.addressType === AddressType.DOMESTIC &&
    resolvedAdministrativeArea
  ) {
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

  const fields = [
    { ...COUNTRY_FIELD, required: otherProps.required },
    ...adminStructure,
    ...addressFields
  ].map((x) => {
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
  })

  const handleChange = (values: EventState) => {
    const addressLines = extractAddressLines(values, adminLevelIds)
    const leafAdminLevelValue = getLeafAdministrativeLevel(
      values,
      adminLevelIds
    )
    const { country, addressType } = values

    const addressValue = {
      country,
      addressType,
      administrativeArea:
        addressType === AddressType.DOMESTIC ? leafAdminLevelValue : undefined,
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
      parentId={props.id}
      validatorContext={validatorContext}
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
  const validatorContext = useValidatorContext()
  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()
  const { config } = useSelector(getOfflineData)
  const customAddressFields = configuration?.configuration
    ?.streetAddressForm as AddressSubfield[]
  const appConfigAdminLevels = config.ADMIN_STRUCTURE

  if (!value) {
    return ''
  }

  const administrativeArea = getAdministrativeArea(value)
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

  const adminStructure = generateAdminStructureFields(
    appConfigAdminLevels,
    configuration?.required
  )

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

  const fieldsToShow = [
    { ...COUNTRY_FIELD, required: configuration?.required },
    ...adminStructure,
    ...addressFields
  ]
    .map((field) => ({
      field,
      value: flattenedAddressValues[field.id]
    }))
    .filter(
      (field) =>
        field.value &&
        isFieldDisplayedOnReview(
          field.field satisfies FieldConfig,
          addressValues,
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
  Input: withSuspense(AddressInput2),
  Output: AddressOutput,
  toCertificateVariables
}
