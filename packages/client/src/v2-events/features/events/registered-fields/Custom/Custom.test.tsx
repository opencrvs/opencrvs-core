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
import { fileURLToPath } from 'node:url'
import React from 'react'
import { cloneDeep } from 'lodash'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import {
  FieldType,
  getDeclaration,
  tennisClubMembershipEvent,
  toVersionedEventConfig
} from '@opencrvs/commons/client'
import { getTheme } from '@opencrvs/components/lib/theme'
import { Custom, preloadCustomFields } from './Custom'

/** Test-only custom field modules, in the form that country config gives them */
function fixture(name: string) {
  return fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url))
}

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={getTheme()}>{ui}</ThemeProvider>)
}

describe('Custom field', () => {
  it('renders the Input of the module with the React instance of the client', async () => {
    const onChange = vi.fn()

    renderWithTheme(
      <Custom.Input
        configuration={undefined}
        id="custom"
        src={fixture('counter.js')}
        value={2}
        onChange={onChange}
      />
    )

    fireEvent.click(await screen.findByText('Clicked 2 times'))

    expect(await screen.findByText('Clicked 3 times')).toBeTruthy()
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('renders the Output of the module', async () => {
    renderWithTheme(
      <Custom.Output id="custom" src={fixture('counter.js')} value={42} />
    )

    expect(await screen.findByText('Value is 42')).toBeTruthy()
  })

  it('calls the factory of a module only once', async () => {
    renderWithTheme(
      <>
        <Custom.Output id="first" src={fixture('counter.js')} value={1} />
        <Custom.Output id="second" src={fixture('counter.js')} value={2} />
      </>
    )

    expect(await screen.findByText('Value is 1')).toBeTruthy()
    expect(await screen.findByText('Value is 2')).toBeTruthy()
    expect(
      (globalThis as { counterFactoryCalls?: number }).counterFactoryCalls
    ).toBe(1)
  })

  it('shares the React of the client before a bundled module loads', async () => {
    renderWithTheme(
      <Custom.Output
        id="custom"
        src={fixture('shared-externals.js')}
        value={1}
      />
    )

    expect(
      await screen.findByText('Text from a context made at load time')
    ).toBeTruthy()
  })

  it('shows an error when the module has no default export factory', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    renderWithTheme(
      <Custom.Output id="custom" src={fixture('named-exports.js')} value={1} />
    )

    expect(await screen.findByText('Error loading component')).toBeTruthy()
  })

  it('shows an error when the module cannot be loaded', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    renderWithTheme(
      <Custom.Output id="custom" src={fixture('missing.js')} value={1} />
    )

    expect(await screen.findByText('Error loading component')).toBeTruthy()
  })

  it('keeps a render error inside the field', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    renderWithTheme(
      <>
        <Custom.Output id="custom" src={fixture('throws.js')} value={1} />
        <span>{'Sibling field'}</span>
      </>
    )

    expect(await screen.findByText('Error loading component')).toBeTruthy()
    expect(screen.getByText('Sibling field')).toBeTruthy()
  })

  it('preloads each custom field module of the events once', async () => {
    const src = fixture('preload.js')
    const event = cloneDeep(tennisClubMembershipEvent)
    const [firstPage, secondPage] = getDeclaration(event).pages
    for (const [index, page] of [firstPage, secondPage].entries()) {
      page.fields.push({
        id: `custom.field${index}`,
        type: FieldType._EXPERIMENTAL_CUSTOM,
        src,
        label: { id: 'custom.label', defaultMessage: 'Custom', description: '' }
      })
    }

    await preloadCustomFields([
      toVersionedEventConfig(event),
      toVersionedEventConfig(event)
    ])

    const calls = () =>
      (globalThis as { preloadFactoryCalls?: number }).preloadFactoryCalls
    expect(calls()).toBe(1)

    renderWithTheme(<Custom.Output id="custom" src={src} value={1} />)
    expect(await screen.findByText('Preloaded field')).toBeTruthy()
    expect(calls()).toBe(1)
  })

  it('preloads the custom field modules of every version of an event', async () => {
    const src = fixture('preload-later-version.js')
    const laterVersion = cloneDeep(tennisClubMembershipEvent)
    getDeclaration(laterVersion).pages[0].fields.push({
      id: 'custom.later',
      type: FieldType._EXPERIMENTAL_CUSTOM,
      src,
      label: { id: 'custom.label', defaultMessage: 'Custom', description: '' }
    })
    const config = toVersionedEventConfig(tennisClubMembershipEvent)
    config.versions.push({
      ...toVersionedEventConfig(laterVersion).versions[0],
      id: 'later',
      effectiveFrom: '2030-01-01'
    })

    await preloadCustomFields([config])

    expect(
      (globalThis as { laterVersionFactoryCalls?: number })
        .laterVersionFactoryCalls
    ).toBe(1)
  })

  it('does not fail the preload when a module cannot be loaded', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const event = cloneDeep(tennisClubMembershipEvent)
    getDeclaration(event).pages[0].fields.push({
      id: 'custom.missing',
      type: FieldType._EXPERIMENTAL_CUSTOM,
      src: fixture('missing-preload.js'),
      label: { id: 'custom.label', defaultMessage: 'Custom', description: '' }
    })

    await expect(
      preloadCustomFields([toVersionedEventConfig(event)])
    ).resolves.toBeUndefined()
  })
})
