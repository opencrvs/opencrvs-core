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
import { useIntl } from 'react-intl'
import {
  ITextInputProps as TextInputProps,
  TextInput as TextInputComponent
} from '@opencrvs/components'
import { NumberField } from '@opencrvs/commons/client'

interface NumberInputProps
  extends Omit<TextInputProps, 'type' | 'max' | 'min' | 'onChange'> {
  onChange(val: number | undefined): void
  value: number | undefined
  min?: number
  max?: number
  integer?: boolean
  'data-testid'?: string
}

function stripLeadingZeroes(digits: string) {
  return digits.replace(/^0+(?=\d)/, '')
}

/**
 * Anything that is not a digit, a '.' or a leading '-' is dropped
 * '-' is kept only in first position, and only when `allowNegative`
 * `integer` drops '.' as well ('12.6' -> '126')
 * Only the first '.' separates; later ones join the fraction ('1.2.3' -> '1.23')
 * Leading zeroes are collapsed ('0020' -> '20'), keeping a lone '0' and '0.5'
 * Intermediates ('-', '12.') pass through and are normalised on blur
 */
function sanitizeNumericInput(
  value: string,
  { integer, allowNegative }: { integer?: boolean; allowNegative: boolean }
) {
  const sign = allowNegative && value.startsWith('-') ? '-' : ''
  const digitsAndSeparators = value.replace(/[^\d.]/g, '')

  if (integer) {
    const digits = digitsAndSeparators.replace(/\./g, '')

    return sign + stripLeadingZeroes(digits)
  }

  const [whole, ...fractions] = digitsAndSeparators.split('.')
  const strippedWhole = stripLeadingZeroes(whole)

  if (fractions.length === 0) {
    return sign + strippedWhole
  }

  return `${sign}${strippedWhole}.${fractions.join('')}`
}

/**
 * A value the user is still typing is rejected only once it can no longer
 * become something valid, so `max` caps what can be entered the way a
 * character limit used to. `min` is not checked here: '5' is on the way to
 * '50'.
 */
function exceedsMax(value: string, max?: number) {
  if (max === undefined) {
    return false
  }

  const parsedValue = parseFloat(value)

  return !isNaN(parsedValue) && parsedValue > max
}

function toNumberValue(value: number | undefined) {
  return value === undefined || isNaN(value) ? '' : value.toString()
}

function NumberInput({
  value,
  disabled,
  integer,
  'data-testid': dataTestId,
  ...props
}: NumberInputProps) {
  const [inputValue, setInputValue] = React.useState(toNumberValue(value))

  const allowNegative = props.min === undefined || props.min < 0

  React.useEffect(() => {
    setInputValue(toNumberValue(value))
  }, [value])

  return (
    <TextInputComponent
      {...props}
      data-testid={dataTestId ?? `number__${props.id}`}
      inputMode={integer ? 'numeric' : 'decimal'}
      isDisabled={disabled}
      value={inputValue}
      onBlur={(e) => {
        const parsedValue = parseFloat(inputValue)
        const committedValue = isNaN(parsedValue) ? undefined : parsedValue
        setInputValue(toNumberValue(committedValue))
        props.onChange(committedValue)
        props.onBlur?.(e)
      }}
      onChange={(e) => {
        const sanitizedValue = sanitizeNumericInput(e.target.value, {
          integer,
          allowNegative
        })

        if (exceedsMax(sanitizedValue, props.max)) {
          // State does not change, so React would not re-render and the
          // rejected characters would stay in the DOM.
          e.target.value = inputValue
          return
        }

        setInputValue(sanitizedValue)
      }}
    />
  )
}

export const Number = {
  Input: NumberInput,
  Output: ({ value, config }: { value?: number; config: NumberField }) => {
    if (value == null) {
      return null
    }

    const intl = useIntl()
    const prefix = config.configuration?.prefix
    const postfix = config.configuration?.postfix
    return (
      <>
        {prefix && intl.formatMessage(prefix)}
        {value.toString()}
        {postfix && intl.formatMessage(postfix)}
      </>
    )
  }
}
