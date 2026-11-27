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
import { onlineManager } from '@tanstack/react-query'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  MockInstance,
  vi
} from 'vitest'
import { versionedTennisClubMembershipEvent } from '@opencrvs/commons/client'
import { addLocalEventConfig } from '@client/v2-events/features/events/useEvents/api'
import { queryClient, TRPCProvider } from '@client/v2-events/trpc'
import * as CustomField from '@client/v2-events/features/events/registered-fields/Custom'
import { usePreloadCustomFields } from './usePreloadCustomFields'

function Layout() {
  usePreloadCustomFields()
  return <span>{'Workqueue'}</span>
}

function renderLayout() {
  return render(
    <TRPCProvider waitForClientRestored={false}>
      <React.Suspense fallback={<span>{'Loading'}</span>}>
        <Layout />
      </React.Suspense>
    </TRPCProvider>
  )
}

/** A promise that the test resolves */
function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

describe('usePreloadCustomFields', () => {
  let preloadCustomFields: MockInstance<typeof CustomField.preloadCustomFields>

  beforeEach(() => {
    vi.spyOn(CustomField, 'findCustomFieldSources').mockReturnValue([
      '/custom-field.js'
    ])
    preloadCustomFields = vi.spyOn(CustomField, 'preloadCustomFields')
    addLocalEventConfig(versionedTennisClubMembershipEvent)
  })

  afterEach(() => {
    onlineManager.setOnline(true)
    vi.useRealTimers()
    queryClient.clear()
    vi.restoreAllMocks()
  })

  it('suspends until the custom field modules are loaded', async () => {
    const preload = deferred()
    preloadCustomFields.mockReturnValue(preload.promise)

    renderLayout()
    expect(screen.getByText('Loading')).toBeTruthy()
    expect(preloadCustomFields).toHaveBeenCalledWith(['/custom-field.js'])

    await act(async () => preload.resolve())
    expect(await screen.findByText('Workqueue')).toBeTruthy()
  })

  it('loads the modules also when the device is offline', async () => {
    onlineManager.setOnline(false)
    preloadCustomFields.mockResolvedValue(undefined)

    renderLayout()

    expect(await screen.findByText('Workqueue')).toBeTruthy()
    expect(preloadCustomFields).toHaveBeenCalledTimes(1)
  })

  it('renders after a time limit when a module loads slowly', async () => {
    vi.useFakeTimers()
    preloadCustomFields.mockReturnValue(new Promise(() => undefined))

    renderLayout()
    expect(screen.getByText('Loading')).toBeTruthy()

    await act(async () => vi.advanceTimersByTimeAsync(15000))
    expect(screen.getByText('Workqueue')).toBeTruthy()
  })
})
