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
import styled from 'styled-components'
import * as _ from 'lodash'
import { isUndefined } from 'lodash'
import {
  FieldConfig,
  FieldValue,
  isAddressFieldType,
  isAdministrativeAreaFieldType,
  isBulletListFieldType,
  isCheckboxFieldType,
  isCountryFieldType,
  isDateFieldType,
  isTimeFieldType,
  isDateRangeFieldType,
  isDividerFieldType,
  isEmailFieldType,
  isFacilityFieldType,
  isFileFieldType,
  isFileFieldWithOptionType,
  isNumberFieldType,
  isOfficeFieldType,
  isPageHeaderFieldType,
  isParagraphFieldType,
  isRadioGroupFieldType,
  isSelectFieldType,
  isTextAreaFieldType,
  isTextFieldType,
  isNameFieldType,
  isIdFieldType,
  isPhoneFieldType,
  isSelectDateRangeFieldType,
  isLocationFieldType,
  FileFieldWithOptionValue,
  EventState,
  FormConfig,
  FieldType
} from '@opencrvs/commons/client'
import {
  Address,
  AdministrativeArea,
  BulletList,
  Checkbox,
  DateField,
  Divider,
  LocationSearch,
  PageHeader,
  RadioGroup,
  Select,
  SelectCountry,
  Paragraph,
  Number,
  Text,
  TimeField,
  getRegisteredFieldByFieldConfig
} from '@client/v2-events/features/events/registered-fields'
import { File } from '@client/v2-events/components/forms/inputs/FileInput/FileInput'
import { Name } from '@client/v2-events/features/events/registered-fields/Name'
import { DateRangeField } from '@client/v2-events/features/events/registered-fields/DateRangeField'
import { FileWithOption } from '@client/v2-events/components/forms/inputs/FileInput/DocumentUploaderWithOption'

const Deleted = styled.del`
  color: ${({ theme }) => theme.colors.negative};
`

const DeletedEmpty = styled(Deleted)`
  text-decoration: none;
`

/**
 *  Used for setting output/read (REVIEW) values for FORM input/write fields (string defaults based on FieldType).
 * For setting default fields for intl object @see setEmptyValuesForFields
 *
 *  @returns sensible default value for the field type given the field configuration.
 */
export function ValueOutput(
  field: {
    config: FieldConfig
    value: FieldValue
  },
  searchMode?: {} | boolean
) {
  if (
    isEmailFieldType(field) ||
    isIdFieldType(field) ||
    isPhoneFieldType(field) ||
    isTextFieldType(field) ||
    isTextAreaFieldType(field)
  ) {
    return <Text.Output value={field.value} />
  }

  if (isDateFieldType(field)) {
    return <DateField.Output value={field.value} />
  }

  if (isTimeFieldType(field)) {
    return <TimeField.Output value={field.value} />
  }

  if (isDateRangeFieldType(field)) {
    return <DateRangeField.Output value={field.value} />
  }

  if (isPageHeaderFieldType(field)) {
    return PageHeader.Output
  }

  if (isParagraphFieldType(field)) {
    return Paragraph.Output
  }

  if (isNumberFieldType(field)) {
    return <Number.Output {...field} />
  }

  if (isFileFieldType(field)) {
    return <File.Output {...field} />
  }

  if (isFileFieldWithOptionType(field)) {
    return <FileWithOption.Output {...field} />
  }

  if (isBulletListFieldType(field)) {
    return BulletList.Output
  }

  if (isSelectFieldType(field) || isSelectDateRangeFieldType(field)) {
    return <Select.Output options={field.config.options} value={field.value} />
  }

  if (isCountryFieldType(field)) {
    return <SelectCountry.Output value={field.value} />
  }

  if (isCheckboxFieldType(field)) {
    return (
      <Checkbox.Output required={field.config.required} value={field.value} />
    )
  }

  if (isAddressFieldType(field)) {
    return (
      <Address.Output
        configuration={field.config}
        fields={searchMode === true ? ['country'] : undefined}
        lineSeparator={searchMode === true ? ', ' : undefined}
        value={field.value}
      />
    )
  }

  if (isRadioGroupFieldType(field)) {
    return (
      <RadioGroup.Output options={field.config.options} value={field.value} />
    )
  }

  if (isNameFieldType(field)) {
    return <Name.Output configuration={field.config} value={field.value} />
  }

  if (isAdministrativeAreaFieldType(field)) {
    return <AdministrativeArea.Output value={field.value} />
  }

  if (isOfficeFieldType(field) || isLocationFieldType(field)) {
    return <LocationSearch.Output value={field.value} />
  }

  if (isDividerFieldType(field)) {
    return Divider.Output
  }

  if (isFacilityFieldType(field)) {
    return <LocationSearch.Output value={field.value} />
  }
}

function findPreviousValueWithSameLabel(
  field: FieldConfig,
  previousForm: EventState,
  formConfig: FormConfig
): { value?: FieldValue; field?: FieldConfig } {
  const allFieldsOfCurrentPage =
    formConfig.pages.find((page) => page.fields.some((f) => f.id === field.id))
      ?.fields || []

  const formValuesWithSameLabel = allFieldsOfCurrentPage
    .filter(
      (f) =>
        f.label.id === field.label.id &&
        f.id !== field.id &&
        previousForm[f.id] !== undefined &&
        previousForm[f.id] !== null &&
        previousForm[f.id] !== ''
    )
    .map((f) => ({
      value: previousForm[f.id],
      field: f
    }))

  // Most likely there is only one field with the same label
  // at a time, so we take the first match
  if (formValuesWithSameLabel.length > 0) {
    return {
      value: formValuesWithSameLabel[0].value,
      field: formValuesWithSameLabel[0].field
    }
  }

  return { value: undefined, field: undefined }
}

export function isEmptyValue(field: FieldConfig, value: unknown) {
  const module = getRegisteredFieldByFieldConfig(field)
  if (
    module &&
    'isEmptyValue' in module &&
    typeof module.isEmptyValue === 'function'
  ) {
    return Boolean(value) ? module.isEmptyValue(value) : true
  }
  return !Boolean(value)
}

export function Output({
  field,
  value,
  previousValue,
  showPreviouslyMissingValuesAsChanged = true,
  previousForm,
  formConfig,
  displayEmptyAsDash = false
}: {
  field: FieldConfig
  value?: FieldValue
  previousValue?: FieldValue
  showPreviouslyMissingValuesAsChanged?: boolean
  previousForm?: EventState
  formConfig?: FormConfig
  displayEmptyAsDash?: boolean
}) {
  // Explicitly check for undefined, so that e.g. number 0 is considered a value,
  // even null is considered as value removed
  const hasValue = !isUndefined(value)

  let previousValueField: FieldConfig | undefined

  if (isUndefined(previousValue) && previousForm && formConfig) {
    // Multiple fields can share the same label but have different IDs
    // (e.g. "child.birthLocation" and "child.address.privateHome" share the label "Location of birth").
    // In correction view, if the previous form had a value for "child.birthLocation"
    // and the correction form populates "child.address.privateHome", only the latter
    // will be visible while the previous value is hidden due to conditionals.
    // When comparing to a previous form, check all fields with the same label and compare
    // their values to detect changes, even if the active field ID is different.
    // IMPROVEMENT TODO: https://github.com/opencrvs/opencrvs-core/issues/10206
    const previousValueWithSameLabel = findPreviousValueWithSameLabel(
      field,
      previousForm,
      formConfig
    )
    previousValue = previousValueWithSameLabel.value
    previousValueField = previousValueWithSameLabel.field
  }

  if (!hasValue) {
    if (previousValue) {
      return (
        <ValueOutput
          config={previousValueField ?? field}
          value={previousValue}
        />
      )
    }

    if (displayEmptyAsDash) {
      return '-'
    }

    return <ValueOutput config={field} value={''} />
  }

  const hasPreviousValue = previousValue !== undefined

  // Note, checking for previousValue !== value is not enough, as we have composite fields.
  if (hasPreviousValue && !_.isEqual(previousValue, value)) {
    let valueOutput = <ValueOutput config={field} value={value} />

    if (isEmptyValue(field, value)) {
      if (displayEmptyAsDash) {
        valueOutput = <>{'-'}</>
      }

      valueOutput = <>{null}</>
    }

    return (
      <>
        {!isEmptyValue(field, previousValue) && (
          <>
            <Deleted>
              <ValueOutput
                config={previousValueField ?? field}
                value={previousValue}
              />
            </Deleted>
            <br />
          </>
        )}
        {valueOutput}
      </>
    )
  }

  if (!hasPreviousValue && showPreviouslyMissingValuesAsChanged) {
    const deleted = (
      <ValueOutput config={{ ...field, required: true }} value={undefined} />
    )
    return (
      <>
        {isEmptyValue(field, previousValue) ? (
          // For a deleted 'dash', we dont want to overline the dash
          <DeletedEmpty>{'-'}</DeletedEmpty>
        ) : (
          <Deleted>{deleted}</Deleted>
        )}
        <br />
        <ValueOutput config={field} value={value} />
      </>
    )
  }

  return <ValueOutput config={field} value={value} />
}
