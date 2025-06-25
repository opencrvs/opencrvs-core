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
  ITextInputProps as ComponentTextInputProps,
  TextInput as TextInputComponent
} from '@opencrvs/components'

interface TextInputProps
  extends Omit<ComponentTextInputProps, 'onChange' | 'value'> {
  onChange(val: string | undefined): void
  value: string | undefined
}

function TextInput({
  value,
  maxLength,
  disabled,
  type,
  ...props
}: TextInputProps) {
  return (
    <TextInputComponent
      {...props}
      data-testid={`text__${props.id}`}
      isDisabled={disabled}
      maxLength={maxLength}
      type={type ?? 'text'}
      value={value || ''}
      onBlur={(e) => props.onBlur && props.onBlur(e)}
      onChange={(e) => props.onChange(e.target.value)}
    />
  )
}

export const Text = {
  Input: TextInput,
  Output: ({ value }: { value?: string }) => <>{value?.toString() || ''}</>
}
