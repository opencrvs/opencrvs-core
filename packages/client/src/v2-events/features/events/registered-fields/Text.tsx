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

function TextInput({
  value,
  maxLength,
  disabled,
  type,
  ...props
}: TextInputProps) {
  const [inputValue, setInputValue] = React.useState(value ?? '')

  return (
    <TextInputComponent
      type={type ?? 'text'}
      {...props}
      data-testid={`text__${props.id}`}
      isDisabled={disabled}
      maxLength={maxLength}
      value={inputValue}
      onBlur={(e) => {
        props.onChange?.(e)
      }}
      onChange={(e) => setInputValue(e.target.value)}
    />
  )
}

export const Text = {
  Input: TextInput,
  Output: ({ value }: { value?: string }) => <>{value?.toString() || ''}</>
}
