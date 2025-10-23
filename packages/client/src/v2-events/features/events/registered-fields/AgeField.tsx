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
import { AgeValue } from '@opencrvs/commons/client'
import {
  TextInput as TextInputComponent,
  ITextInputProps as TextInputProps
} from '@opencrvs/components'

interface AgeInputProps extends Omit<TextInputProps, 'min' | 'onChange'> {
  asOfDateRef: string
  onChange(val: AgeValue | undefined): void
  value: number | undefined
}

const AGE_MAX_CHARACTERS = 3

function AgeInput({ asOfDateRef, value, ...props }: AgeInputProps) {
  const [inputValue, setInputValue] = React.useState(
    value && isNaN(value) ? undefined : value
  )

  return (
    <TextInputComponent
      {...props}
      data-testid={`age__${props.id}`}
      maxLength={AGE_MAX_CHARACTERS}
      value={inputValue}
      onBlur={(e) => {
        props.onChange(
          inputValue ? { age: inputValue, asOfDateRef } : undefined
        )
        props.onBlur?.(e)
      }}
      onChange={(e) => {
        const parsedValue = parseInt(e.target.value, 10)

        isNaN(parsedValue)
          ? setInputValue(undefined)
          : setInputValue(parsedValue)
      }}
    />
  )
}

export const AgeField = {
  Input: AgeInput,
  Output: ({ value }: { value?: AgeValue }) => value?.age ?? ''
}
