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
import { useFormikContext } from 'formik'
import { AgeValue, DateValue, EventState } from '@opencrvs/commons/client'
import {
  TextInput as TextInputComponent,
  ITextInputProps as TextInputProps
} from '@opencrvs/components'
import { makeFormFieldIdFormikCompatible } from '@client/v2-events/components/forms/utils'

interface AgeInputProps extends Omit<TextInputProps, 'min' | 'onChange'> {
  asOfDateRef: string
  onChange(val: AgeValue | undefined): void
  value: number | undefined
}

function AgeInput({ asOfDateRef, value, ...props }: AgeInputProps) {
  const { values } = useFormikContext<EventState>()

  const asOfDate = DateValue.safeParse(
    values[makeFormFieldIdFormikCompatible(asOfDateRef)]
  ).data

  const [inputValue, setInputValue] = React.useState(
    value && isNaN(value) ? undefined : value
  )

  return (
    <TextInputComponent
      {...props}
      data-testid={`age__${props.id}`}
      maxLength={3}
      value={inputValue}
      onBlur={(e) => {
        props.onChange(inputValue ? { age: inputValue, asOfDate } : undefined)
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
