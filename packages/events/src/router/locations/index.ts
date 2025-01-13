import { router, publicProcedure } from '@events/router/trpc'
import { middleware } from '@events/router/middleware/middleware'
import {
  getLocations,
  Location,
  setLocations
} from '@events/service/locations/locations'
import { z } from 'zod'

export const locationRouter = router({
  set: publicProcedure
    .use(middleware.isNationalSystemAdminUser)
    .input(z.array(Location).min(1))
    .mutation(async (options) => {
      await setLocations(options.input)
    }),
  get: publicProcedure.output(z.array(Location)).query(getLocations)
})
