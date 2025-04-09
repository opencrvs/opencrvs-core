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
import {
  ITextInputProps as TextInputProps,
  TextInput as TextInputComponent
} from '@opencrvs/components'

interface NumberInputProps
  extends Omit<TextInputProps, 'type' | 'maxLength' | 'onChange'> {
  onChange(val: number | undefined): void
  value: number | undefined
  min?: number
}

function NumberInput({ value, disabled, ...props }: NumberInputProps) {
  const [inputValue, setInputValue] = React.useState(
    value && isNaN(value) ? undefined : value
  )

  const allowOnlyPositive = props.min !== undefined && props.min >= 0

  return (
    <TextInputComponent
      type={'number'}
      {...props}
      data-testid={`number__${props.id}`}
      isDisabled={disabled}
      value={inputValue}
      onBlur={(e) => {
        props.onChange(inputValue)
        props.onBlur?.(e)
      }}
      onChange={(e) => {
        // Parse the input value as a floating-point number to allow decimal values.
        // If the parsed value is NaN (e.g., when the input is cleared), set inputValue to undefined.
        // Otherwise, update inputValue with the parsed number.
        const updatedValue = parseFloat(e.target.value)
        isNaN(updatedValue)
          ? setInputValue(undefined)
          : setInputValue(updatedValue)
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (allowOnlyPositive && e.key === '-') {
          e.preventDefault()
        }
      }}
    />
  )
}

export const Number = {
  Input: NumberInput,
  Output: ({ value }: { value?: number }) => {
    return <>{value?.toString() || ''}</>
  }
}
