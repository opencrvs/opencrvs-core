import { router, publicProcedure } from '@events/router/trpc'
import { z } from 'zod'
import { getUsersById } from '@events/service/users/users'

export const userRouter = router({
  list: publicProcedure
    .input(z.array(z.string()))
    .query(async ({ input }) => getUsersById(input))
})
