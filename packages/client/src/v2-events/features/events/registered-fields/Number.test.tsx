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
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'styled-components'
import { getTheme } from '@opencrvs/components/lib/theme'
import { Number } from './Number'

function renderNumberInput(props: {
  min?: number
  max?: number
  maxLength?: number
  value?: number
  onChange?: (val: number | undefined) => void
}) {
  const { min, max, maxLength, value, onChange } = props
  return render(
    <ThemeProvider theme={getTheme()}>
      <Number.Input
        id="test-number"
        name="test-number"
        label="Test Number"
        min={min}
        max={max}
        maxLength={maxLength}
        value={value}
        onChange={onChange ?? vi.fn()}
        onBlur={vi.fn()}
        touched={false}
      />
    </ThemeProvider>
  )
}

describe('Number.Input', () => {
  it('renders an input with type number', () => {
    renderNumberInput({})
    const input = screen.getByTestId('number__test-number')
    expect(input.getAttribute('type')).toBe('number')
  })

  it('passes min attribute to the input', () => {
    renderNumberInput({ min: 0 })
    const input = screen.getByTestId('number__test-number')
    expect(input.getAttribute('min')).toBe('0')
  })

  it('passes max attribute to the input', () => {
    renderNumberInput({ max: 100 })
    const input = screen.getByTestId('number__test-number')
    expect(input.getAttribute('max')).toBe('100')
  })

  it('passes maxLength attribute to the input', () => {
    renderNumberInput({ maxLength: 3 })
    const input = screen.getByTestId('number__test-number')
    expect(input.getAttribute('maxlength')).toBe('3')
  })

  it('passes min, max and maxLength together', () => {
    renderNumberInput({ min: 18, max: 100, maxLength: 3 })
    const input = screen.getByTestId('number__test-number')
    expect(input.getAttribute('min')).toBe('18')
    expect(input.getAttribute('max')).toBe('100')
    expect(input.getAttribute('maxlength')).toBe('3')
  })

  it('calls onChange with the entered value on blur', async () => {
    const onChange = vi.fn()
    renderNumberInput({ onChange })
    const input = screen.getByTestId('number__test-number')
    await userEvent.type(input, '42')
    await userEvent.tab()
    expect(onChange).toHaveBeenCalledWith(42)
  })
})
