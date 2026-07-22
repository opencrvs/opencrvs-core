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
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { ThemeProvider } from 'styled-components'
import { getTheme } from '@opencrvs/components/lib/theme'
import { NewEventButton } from './NewEventButton'

const { createEventSpy, state } = vi.hoisted(() => ({
  createEventSpy: vi.fn(),
  state: { configs: [] as Array<{ id: string; label: unknown }> }
}))

vi.mock('./useCreateEvent', () => ({
  useCreateEvent: () => createEventSpy
}))

vi.mock('./useEventConfiguration', () => ({
  useCreatableEventConfigurations: () => state.configs
}))

const birth = {
  id: 'birth',
  label: { id: 'event.birth.label', defaultMessage: 'Birth', description: '' }
}
const death = {
  id: 'death',
  label: { id: 'event.death.label', defaultMessage: 'Death', description: '' }
}

function renderButton(variant: 'header' | 'fab' = 'header') {
  return render(
    <ThemeProvider theme={getTheme()}>
      <IntlProvider locale="en">
        <NewEventButton variant={variant} />
      </IntlProvider>
    </ThemeProvider>
  )
}

describe('NewEventButton', () => {
  afterEach(() => {
    createEventSpy.mockClear()
    cleanup()
  })

  it('renders nothing when the user may not create any event', () => {
    state.configs = []
    const { container } = renderButton()
    expect(container.querySelector('button')).toBeNull()
  })

  it('creates the event directly (no menu) when only one type is creatable', () => {
    state.configs = [birth]
    renderButton()

    // No menu header/items are rendered for the single-type shortcut.
    expect(screen.queryByText('Declare an event')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'New event' }))
    expect(createEventSpy).toHaveBeenCalledWith('birth')
  })

  it('renders a menu of creatable types when more than one is available', () => {
    state.configs = [birth, death]
    renderButton()

    // Menu header, and one item per creatable event type.
    expect(screen.getByText('Declare an event')).toBeTruthy()
    expect(screen.getByText('Birth')).toBeTruthy()
    expect(screen.getByText('Death')).toBeTruthy()
  })
})
