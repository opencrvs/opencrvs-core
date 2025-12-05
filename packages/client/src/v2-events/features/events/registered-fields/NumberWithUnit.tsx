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
import styled from 'styled-components'
import {
  SelectOption,
  NumberWithUnitFieldValue,
  NumberWithUnitField,
  NumberWithUnitFieldUpdateValue
} from '@opencrvs/commons/client'
import { Number } from './Number'
import { Select } from './Select'

const NumberWithUnitWrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 8px;
`

interface NumberWithUnitInputProps {
  onChange(newValue: NumberWithUnitFieldUpdateValue | undefined): void
  options: SelectOption[]
  value: NumberWithUnitFieldValue | undefined
  configuration?: NumberWithUnitField['configuration']
}

function NumberWithUnitInput({
  value,
  onChange,
  configuration,
  options,
  ...props
}: NumberWithUnitInputProps) {
  const handleUnitChange = (code: string) => {
    onChange({ ...value, unit: code })
  }

  const handleNumericValueChange = (newVal: number | undefined) => {
    onChange({ ...value, numericValue: newVal })
  }

  return (
    <NumberWithUnitWrapper>
      <Number.Input
        {...props}
        min={configuration?.min}
        placeholder={configuration?.numberFieldPlaceholder?.defaultMessage}
        value={value?.numericValue}
        onChange={handleNumericValueChange}
      />
      <Select.Input
        {...props}
        id="unit"
        options={options}
        type="SELECT"
        value={value?.unit}
        onChange={handleUnitChange}
      />
    </NumberWithUnitWrapper>
  )
}

export const NumberWithUnit = {
  Input: NumberWithUnitInput,
  Output: ({ value }: { value?: NumberWithUnitFieldValue }) => {
    if (value?.numericValue === undefined || value?.unit === undefined) {
      return null
    }

    return <>{`${value.numericValue} ${value.unit}` || ''}</>
  }
}
