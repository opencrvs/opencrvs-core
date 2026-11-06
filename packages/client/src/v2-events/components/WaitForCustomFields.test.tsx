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
import { act, render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getTheme } from '@opencrvs/components'

const preloadCustomFields = vi.fn<() => Promise<void>>()
const ensureQueryData = vi.fn<() => Promise<unknown>>()

vi.mock('@client/v2-events/features/events/registered-fields/Custom', () => ({
  preloadCustomFields
}))
vi.mock('@client/v2-events/trpc', () => ({
  queryClient: { ensureQueryData },
  trpcOptionsProxy: {
    event: { config: { get: { queryOptions: () => ({}) } } }
  }
}))

/** A promise that the test resolves */
function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

/** Each test imports a new copy, because the module remembers a preload */
async function renderGate() {
  const { WaitForCustomFields } = await import('./WaitForCustomFields')
  return render(
    <ThemeProvider theme={getTheme()}>
      <WaitForCustomFields>
        <span>{'App'}</span>
      </WaitForCustomFields>
    </ThemeProvider>
  )
}

describe('WaitForCustomFields', () => {
  beforeEach(() => {
    vi.resetModules()
    preloadCustomFields.mockReset()
    ensureQueryData.mockReset().mockResolvedValue([])
  })

  it('opens the app only after the custom field modules are loaded', async () => {
    const preload = deferred()
    preloadCustomFields.mockReturnValue(preload.promise)

    await renderGate()
    expect(screen.queryByText('App')).toBeNull()

    await act(async () => preload.resolve())
    expect(await screen.findByText('App')).toBeTruthy()
  })

  it('opens the app when the config does not load', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    ensureQueryData.mockRejectedValue(new Error('offline'))

    await renderGate()

    expect(await screen.findByText('App')).toBeTruthy()
    expect(preloadCustomFields).not.toHaveBeenCalled()
  })

  it('opens the app after a time limit when a module loads slowly', async () => {
    vi.useFakeTimers()
    try {
      preloadCustomFields.mockReturnValue(new Promise(() => undefined))

      await renderGate()
      expect(screen.queryByText('App')).toBeNull()

      await act(async () => vi.advanceTimersByTime(15000))
      expect(screen.getByText('App')).toBeTruthy()
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not wait again when the app opens a second time', async () => {
    preloadCustomFields.mockResolvedValue(undefined)
    const { WaitForCustomFields } = await import('./WaitForCustomFields')
    const ui = (
      <ThemeProvider theme={getTheme()}>
        <WaitForCustomFields>
          <span>{'App'}</span>
        </WaitForCustomFields>
      </ThemeProvider>
    )

    const first = render(ui)
    await screen.findByText('App')
    first.unmount()

    render(ui)
    expect(screen.getByText('App')).toBeTruthy()
    expect(preloadCustomFields).toHaveBeenCalledTimes(1)
  })
})
