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
import { renderHook, waitFor } from '@testing-library/react'
import React, { PropsWithChildren, Suspense } from 'react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import { IntlProvider } from 'react-intl'
import superjson from 'superjson'
import {
  DEFAULT_EFFECTIVE_FROM,
  VersionedEventConfig,
  versionedTennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { AppRouter, queryClient, TRPCProvider } from '@client/v2-events/trpc'
import { createTestStore } from '@client/tests/util'
import {
  useEventConfigurationForRecord,
  useEventConfigurationResolver
} from './useEventConfiguration'

const [base] = versionedTennisClubMembershipEvent.versions

// The test store's country time zone is Asia/Dhaka (UTC+6).
const config: VersionedEventConfig = {
  ...versionedTennisClubMembershipEvent,
  versions: [
    { ...base, id: 'v1', effectiveFrom: DEFAULT_EFFECTIVE_FROM },
    {
      ...base,
      id: 'v2',
      effectiveFrom: '2030-01-02',
      title: { ...base.title, defaultMessage: 'Title of v2' }
    }
  ]
}

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const server = setupServer(tRPCMsw.event.config.get.query(() => [config]))

beforeAll(() => server.listen())
afterAll(() => server.close())

beforeEach(() => {
  queryClient.clear()
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

afterEach(() => {
  vi.useRealTimers()
})

class CaughtError extends React.Component<
  PropsWithChildren<{ onError?: (error: Error) => void }>,
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error) {
    this.props.onError?.(error)
  }
  render() {
    return this.state.hasError ? null : this.props.children
  }
}

async function createWrapper(onError?: (error: Error) => void) {
  const { store } = await createTestStore()
  return function wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <TRPCProvider waitForClientRestored={false}>
          <IntlProvider locale="en">
            <CaughtError onError={onError}>
              <Suspense fallback={null}>{children}</Suspense>
            </CaughtError>
          </IntlProvider>
        </TRPCProvider>
      </Provider>
    )
  }
}

const record = {
  type: config.id,
  configVersionId: 'v1',
  trackingId: 'TRACK01'
}

describe('useEventConfigurationForRecord', () => {
  it("uses the record's version, not the one in effect today", async () => {
    // v2 is in effect
    vi.setSystemTime(new Date('2030-06-01T00:00:00Z'))
    const wrapper = await createWrapper()

    const { result } = renderHook(
      () => useEventConfigurationForRecord(record),
      { wrapper }
    )

    await waitFor(() =>
      expect(result.current.eventConfiguration.title).toEqual(base.title)
    )
  })

  it('shows an error naming the record and the version when the version is not configured', async () => {
    const errors: Error[] = []
    const wrapper = await createWrapper((error) => errors.push(error))

    renderHook(
      () =>
        useEventConfigurationForRecord({
          ...record,
          configVersionId: 'removed-version'
        }),
      { wrapper }
    )

    await waitFor(() => expect(errors).toHaveLength(1))
    const { message } = JSON.parse(errors[0].message)
    expect(message).toContain('TRACK01')
    expect(message).toContain('removed-version')
  })
})

describe('useEventConfigurationResolver', () => {
  it("resolves the record's version", async () => {
    vi.setSystemTime(new Date('2030-06-01T00:00:00Z'))
    const wrapper = await createWrapper()

    const { result } = renderHook(() => useEventConfigurationResolver(), {
      wrapper
    })

    await waitFor(() => expect(result.current).toBeTypeOf('function'))
    expect(result.current(record)?.title).toEqual(base.title)
  })

  it('gives undefined when the version is not configured', async () => {
    vi.setSystemTime(new Date('2030-06-01T00:00:00Z'))
    const wrapper = await createWrapper()

    const { result } = renderHook(() => useEventConfigurationResolver(), {
      wrapper
    })

    await waitFor(() => expect(result.current).toBeTypeOf('function'))
    expect(
      result.current({ ...record, configVersionId: 'removed-version' })
    ).toBeUndefined()
  })
})
