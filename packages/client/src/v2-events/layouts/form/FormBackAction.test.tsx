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
import { render, act } from '@testing-library/react'
import {
  FormBackActionProvider,
  useFormBackAction,
  useProvideFormBackAction
} from './FormBackAction'

let headerBack: (() => void) | undefined

function Header() {
  headerBack = useFormBackAction()
  return null
}

function Body({ onBack }: { onBack?: () => void }) {
  useProvideFormBackAction(onBack)
  return null
}

function App({ onBack }: { onBack?: () => void }) {
  return (
    <FormBackActionProvider>
      <Header />
      <Body onBack={onBack} />
    </FormBackActionProvider>
  )
}

describe('FormBackAction', () => {
  it('returns undefined when there is no provider', () => {
    let back: unknown = 'unset'
    function Standalone() {
      back = useFormBackAction()
      return null
    }
    render(<Standalone />)
    expect(back).toBeUndefined()
  })

  it('does not throw when providing a back action without a provider', () => {
    // Pages / wizards are rendered in isolation in stories and tests, outside
    // FormLayout. Providing a back action there must be a safe no-op.
    function StandaloneBody() {
      useProvideFormBackAction(vi.fn())
      return null
    }
    expect(() => render(<StandaloneBody />)).not.toThrow()
  })

  it('publishes a back handler that the header can read and invoke', () => {
    const onBack = vi.fn()
    render(<App onBack={onBack} />)

    expect(headerBack).toBeTypeOf('function')
    act(() => headerBack?.())
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('keeps a stable wrapper that always calls the latest onBack', () => {
    const first = vi.fn()
    const second = vi.fn()

    const { rerender } = render(<App onBack={first} />)
    const stableRef = headerBack
    expect(stableRef).toBeTypeOf('function')

    // New handler identity, but the button still exists (page > 0 both times):
    // the published wrapper must stay referentially stable.
    rerender(<App onBack={second} />)
    expect(headerBack).toBe(stableRef)

    act(() => headerBack?.())
    expect(second).toHaveBeenCalledTimes(1)
    expect(first).not.toHaveBeenCalled()
  })

  it('clears the back handler when no back action is provided', () => {
    const { rerender } = render(<App onBack={vi.fn()} />)
    expect(headerBack).toBeTypeOf('function')

    rerender(<App onBack={undefined} />)
    expect(headerBack).toBeUndefined()
  })
})
