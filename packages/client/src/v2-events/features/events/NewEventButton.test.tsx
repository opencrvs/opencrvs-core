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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { ThemeProvider } from 'styled-components'
import { getTheme } from '@opencrvs/components/lib/theme'

// The two data hooks are mocked so the real ones — and their
// `@opencrvs/commons` / router / redux dependencies — never load. Factories
// return plain functions reading module-level state (the pattern vitest 0.25
// applies reliably); tests set the state before rendering.
let mockCreatableEvents: Array<{ id: string; label: unknown }> = []
const mockCreateEvent = vi.fn()

vi.mock('@client/v2-events/features/events/useCreateEvent', () => ({
  useCreateEvent: () => mockCreateEvent
}))
vi.mock('@client/v2-events/features/events/useEventConfiguration', () => ({
  useCreatableEventConfigurations: () => mockCreatableEvents
}))

const birth = {
  id: 'birth',
  label: { id: 'event.birth.label', defaultMessage: 'Birth', description: '' }
}
const death = {
  id: 'death',
  label: { id: 'event.death.label', defaultMessage: 'Death', description: '' }
}

async function renderButton(variant: 'header' | 'fab' = 'header') {
  const { NewEventButton } = await import('./NewEventButton')
  return render(
    <ThemeProvider theme={getTheme()}>
      <IntlProvider locale="en">
        <NewEventButton variant={variant} />
      </IntlProvider>
    </ThemeProvider>
  )
}

describe('NewEventButton', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mockCreatableEvents = []
  })

  afterEach(() => {
    cleanup()
  })

  it('renders nothing when the user may not create any event', async () => {
    mockCreatableEvents = []
    const { container } = await renderButton()
    expect(container.querySelector('button')).toBeNull()
  })

  it('creates the event directly (no menu) when only one type is creatable', async () => {
    mockCreatableEvents = [birth]
    await renderButton()

    // No menu header/items are rendered for the single-type shortcut.
    expect(screen.queryByText('Declare an event')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'New event' }))
    expect(mockCreateEvent).toHaveBeenCalledWith('birth')
  })

  it('renders a menu of creatable types when more than one is available', async () => {
    mockCreatableEvents = [birth, death]
    await renderButton()

    // Menu header, and one item per creatable event type.
    expect(screen.getByText('Declare an event')).toBeTruthy()
    expect(screen.getByText('Birth')).toBeTruthy()
    expect(screen.getByText('Death')).toBeTruthy()
  })
})
