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
  ITextAreaProps as ComponentTextAreaInputProps,
  TextArea as TextAreaInputComponent
} from '@opencrvs/components'
interface TextAreaInputProps
  extends Omit<ComponentTextAreaInputProps, 'onChange' | 'value'> {
  onChange(val: string | undefined): void
  value: string | undefined
}
function TextAreaInput({
  value,
  maxLength,
  disabled,
  ...props
}: TextAreaInputProps) {
  const [inputValue, setInputValue] = React.useState<string>(value ?? '')

  React.useEffect(() => {
    setInputValue(value ?? '')
  }, [value])

  return (
    <TextAreaInputComponent
      {...props}
      data-testid={`textarea__${props.id}`}
      disabled={disabled}
      maxLength={maxLength}
      value={inputValue}
      onBlur={(e) => {
        props.onChange(inputValue)
        props.onBlur?.(e)
      }}
      onChange={(e) => setInputValue(e.target.value)}
    />
  )
}

export const TextArea = {
  Input: TextAreaInput,
  Output: null
}
