import { renderHook, waitFor } from '@testing-library/react'
import React, { PropsWithChildren } from 'react'
import { setupServer } from 'msw/node'
import { vi } from 'vitest'
import superjson from 'superjson'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { UUID } from '@opencrvs/commons/client'
import { TRPCProvider, AppRouter, queryClient } from '@client/v2-events/trpc'
import { useUsers } from './useUsers'

const serverSpy = vi.fn()
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/users' })],
  transformer: { input: superjson, output: superjson }
})

const server = setupServer(
  tRPCMsw.user.get.query((input: string) => {
    serverSpy({ route: 'user.get', input })
    return {
      id: input,
      name: [
        {
          use: 'official',
          given: ['Test'],
          family: 'User'
        }
      ],
      role: 'user',
      primaryOfficeId: 'office-1' as string & UUID,
      signature: undefined,
      avatar: undefined
    }
  }),
  tRPCMsw.user.list.query((input: string[]) => {
    serverSpy({ route: 'user.list', input })
    return input.map((id) => ({
      id,
      name: [
        {
          use: 'official',
          given: [`User ${id}`],
          family: 'Family'
        }
      ],
      role: 'user',
      primaryOfficeId: 'office-1' as string & UUID,
      signature: undefined,
      avatar: undefined
    }))
  })
)

function wrapper({ children }: PropsWithChildren) {
  return <TRPCProvider waitForClientRestored={false}>{children}</TRPCProvider>
}

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
  serverSpy.mockClear()
})
afterAll(() => server.close())

describe('useUsers.getUser', () => {
  test('calls API with valid alphanumeric userId', async () => {
    const { result } = renderHook(() => useUsers().getUser.useQuery('abc123'), {
      wrapper
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ id: 'abc123', name: 'Test User' })
    expect(serverSpy).toHaveBeenCalledWith({
      route: 'user.get',
      input: 'abc123'
    })
  })

  test('throws error with invalid userId', async () => {
    const { result } = renderHook(
      () => useUsers().getUser.useQuery('invalid-$$$'),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
      expect(result.current.error?.message).toMatch(/Invalid user id/)
    })
    expect(serverSpy).not.toHaveBeenCalled()
  })
})

describe('useUsers.getUsers', () => {
  test('calls API with valid array of alphanumeric ids', async () => {
    const { result } = renderHook(
      () => useUsers().getUsers.useQuery(['a1', 'b2']),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([
      { id: 'a1', name: 'User a1' },
      { id: 'b2', name: 'User b2' }
    ])
    expect(serverSpy).toHaveBeenCalledWith({
      route: 'user.list',
      input: ['a1', 'b2']
    })
  })

  test('throws error when array has invalid ids', async () => {
    const { result } = renderHook(
      () => useUsers().getUsers.useQuery(['a1', '$$$']),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
      expect(result.current.error?.message).toMatch(/Invalid user id/)
    })
    expect(serverSpy).not.toHaveBeenCalled()
  })
})
