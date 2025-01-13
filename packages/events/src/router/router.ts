import { router } from '@events/router/trpc'

import { eventRouter } from './event'
import { userRouter } from './user'
import { locationRouter } from './locations'

export const appRouter = router({
  event: eventRouter,
  user: userRouter,
  locations: locationRouter
})

/**
 * @public
 */
export type AppRouter = typeof appRouter
