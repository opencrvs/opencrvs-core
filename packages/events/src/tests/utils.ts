import { appRouter, t } from '@events/router'

const { createCallerFactory } = t

export function createTestClient() {
  const createCaller = createCallerFactory(appRouter)
  const caller = createCaller({
    user: { id: '1', primaryOfficeId: '123' },
    token: 'NOT_A_REAL_TOKEN'
  })
  return caller
}
