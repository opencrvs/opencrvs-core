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
import { makeFormFieldIdFormikCompatible } from '@client/v2-events/components/forms/utils'
import { Number as NumberField, NumberInputProps } from './Number'

interface AgeInputProps extends Omit<NumberInputProps, 'min' | 'onChange'> {
  asOfDateRef: string
  onChange(val: AgeValue | undefined): void
}

function AgeInput({ asOfDateRef, ...props }: AgeInputProps) {
  const { values } = useFormikContext<EventState>()

  const asOfDate = DateValue.safeParse(
    values[makeFormFieldIdFormikCompatible(asOfDateRef)]
  ).data

  return (
    <NumberField.Input
      {...props}
      data-testid={`age__${props.id}`}
      min={0}
      value={props.value}
      onBlur={(e) => {
        props.onChange(
          e.target.value ? { age: Number(e.target.value), asOfDate } : undefined
        )
        props.onBlur?.(e)
      }}
      onChange={(newAge) =>
        props.onChange(
          newAge === undefined ? undefined : { age: newAge, asOfDate }
        )
      }
      onKeyDownCapture={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (
          ['.', 'e'].includes(e.key) ||
          (e.key === '0' && !e.currentTarget.value)
        ) {
          e.preventDefault()
        }
      }}
      onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData('text')
        const numeric = Number(text)
        e.currentTarget.value = String(numeric)
        e.preventDefault()
        props.onChange(numeric ? { age: numeric, asOfDate } : undefined)
      }}
    />
  )
}

export const AgeField = {
  Input: AgeInput,
  Output: ({ value }: { value?: AgeValue }) => value?.age ?? ''
}
