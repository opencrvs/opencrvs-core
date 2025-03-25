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
}

function NumberInput({ value, disabled, ...props }: NumberInputProps) {
  const [inputValue, setInputValue] = React.useState(
    value && isNaN(value) ? undefined : value
  )

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
        const updatedValue = parseInt(e.target.value, 10)
        isNaN(updatedValue)
          ? setInputValue(undefined)
          : setInputValue(updatedValue)
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
