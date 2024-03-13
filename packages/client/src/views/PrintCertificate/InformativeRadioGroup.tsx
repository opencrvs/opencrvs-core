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
import * as React from 'react'
import { RadioGroup } from '@opencrvs/components/lib/Radio'
import { InputField } from '@client/components/form/InputField'
import {
  Ii18nFormField,
  IFormFieldValue,
  Ii18nRadioGroupFormField,
  Ii18nInformativeRadioGroupFormField
} from '@client/forms'

import { ParentDetails } from '@client/views/PrintCertificate/ParentDetails'
import styled from 'styled-components'

const RadioGroupWrapper = styled.div`
  > div > span {
    display: block !important;
  }
`

type IInputProps = {
  id: string
  onChange: (e: React.ChangeEvent<any>) => void
  onBlur: (e: React.FocusEvent<any>) => void
  value: IFormFieldValue
  disabled?: boolean
  error: boolean
  touched?: boolean
}

type IInputFieldProps = {
  id: string
  label: string
  description?: string
  required?: boolean
  disabled?: boolean
  prefix?: string
  postfix?: string
  error: string
  touched: boolean
}

type IProps = {
  value: IFormFieldValue
  inputProps: IInputProps
  inputFieldProps: IInputFieldProps
  fieldDefinition: Ii18nFormField
  onSetFieldValue: (name: string, value: IFormFieldValue) => void
}

function InformativeRadioGroupComponent({
  value,
  inputProps,
  inputFieldProps,
  onSetFieldValue,
  fieldDefinition
}: IProps) {
  return (
    <RadioGroupWrapper>
      <InputField {...inputFieldProps}>
        <ParentDetails
          information={
            (fieldDefinition as Ii18nInformativeRadioGroupFormField).information
          }
        />
        <RadioGroup
          {...inputProps}
          onChange={(val: string) => onSetFieldValue(fieldDefinition.name, val)}
          options={(fieldDefinition as Ii18nRadioGroupFormField).options}
          name={fieldDefinition.name}
          value={value as string}
        />
      </InputField>
    </RadioGroupWrapper>
  )
}

export const InformativeRadioGroup = InformativeRadioGroupComponent
