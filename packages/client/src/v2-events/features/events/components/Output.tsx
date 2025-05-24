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
import {
  FieldConfig,
  FieldValue,
  isAddressFieldType,
  isAdministrativeAreaFieldType,
  isBulletListFieldType,
  isCheckboxFieldType,
  isCountryFieldType,
  isDateFieldType,
  isDateRangeFieldType,
  isDividerFieldType,
  isEmailFieldType,
  isFacilityFieldType,
  isFileFieldType,
  isNumberFieldType,
  isOfficeFieldType,
  isPageHeaderFieldType,
  isParagraphFieldType,
  isRadioGroupFieldType,
  isSelectFieldType,
  isTextFieldType
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
  Text
} from '@client/v2-events/features/events/registered-fields'
import { File } from '@client/v2-events/components/forms/inputs/FileInput/FileInput'
import { DateRangeField } from '../registered-fields/DateRangeField'

const Deleted = styled.del`
  color: ${({ theme }) => theme.colors.negative};
`

/**
 *  Used for setting output/read (REVIEW) values for FORM input/write fields (string defaults based on FieldType).
 * For setting default fields for intl object @see setEmptyValuesForFields
 *
 *  @returns sensible default value for the field type given the field configuration.
 */
export function ValueOutput(field: { config: FieldConfig; value: FieldValue }) {
  if (isEmailFieldType(field) || isTextFieldType(field)) {
    return Text.Output({ value: field.value })
  }

  if (isDateFieldType(field)) {
    return DateField.Output({ value: field.value })
  }

  if (isDateRangeFieldType(field)) {
    return DateRangeField.Output({ value: field.value })
  }

  if (isPageHeaderFieldType(field)) {
    return PageHeader.Output
  }

  if (isParagraphFieldType(field)) {
    return Paragraph.Output
  }

  if (isNumberFieldType(field)) {
    return Number.Output({ value: field.value })
  }

  if (isFileFieldType(field)) {
    return File.Output
  }

  if (isBulletListFieldType(field)) {
    return BulletList.Output
  }

  if (isSelectFieldType(field)) {
    return Select.Output({
      options: field.config.options,
      value: field.value
    })
  }

  if (isCountryFieldType(field)) {
    return SelectCountry.Output({ value: field.value })
  }

  if (isCheckboxFieldType(field)) {
    return Checkbox.Output({
      required: field.config.required,
      value: field.value
    })
  }

  if (isAddressFieldType(field)) {
    return Address.Output({ value: field.value })
  }

  if (isRadioGroupFieldType(field)) {
    return RadioGroup.Output({
      options: field.config.options,
      value: field.value
    })
  }

  if (isAdministrativeAreaFieldType(field)) {
    return AdministrativeArea.Output({ value: field.value })
  }

  if (isOfficeFieldType(field)) {
    return LocationSearch.Output({ value: field.value })
  }

  if (isDividerFieldType(field)) {
    return Divider.Output
  }

  if (isFacilityFieldType(field)) {
    return LocationSearch.Output({ value: field.value })
  }
}

export function Output({
  field,
  value,
  previousValue,
  showPreviouslyMissingValuesAsChanged = true
}: {
  field: FieldConfig
  value?: FieldValue
  previousValue?: FieldValue
  showPreviouslyMissingValuesAsChanged: boolean
}) {
  // Explicitly check for undefined, so that e.g. number 0 is considered a value
  const hasValue = value !== undefined

  if (!hasValue) {
    if (previousValue) {
      return ValueOutput({ config: field, value: previousValue })
    }

    return ValueOutput({ config: field, value: '' })
  }

  const hasPreviousValue = previousValue !== undefined

  // Note, checking for previousValue !== value is not enough, as we have composite fields.
  if (hasPreviousValue && !_.isEqual(previousValue, value)) {
    const valueOutput = ValueOutput({
      config: field,
      value
    })

    if (valueOutput === null) {
      return null
    }

    const previousValueOutput = ValueOutput({
      config: field,
      value: previousValue
    })

    return (
      <>
        {previousValueOutput !== null && (
          <>
            <Deleted>
              <ValueOutput config={field} value={previousValue} />
            </Deleted>
            <br />
          </>
        )}
        {valueOutput}
      </>
    )
  }

  if (!hasPreviousValue && showPreviouslyMissingValuesAsChanged) {
    return (
      <>
        <Deleted>
          <ValueOutput config={{ ...field, required: true }} value="-" />
        </Deleted>
        <br />
        <ValueOutput config={field} value={value} />
      </>
    )
  }

  return ValueOutput({ config: field, value })
}
