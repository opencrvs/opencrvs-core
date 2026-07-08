import { getClient } from './postgres'
import Hapi from '@hapi/hapi'
import * as z from 'zod/v4'
import { UUID } from '@opencrvs/toolkit/events'

export const Icd10CodeRecord = z.object({
  id: UUID,
  label: z.string(),
  code: z.string().nullish(),
  validUntil: z.iso.datetime().nullable()
})

export type Icd10CodeRecord = z.infer<typeof Icd10CodeRecord>

export async function causeOfDeathSearchHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const db = getClient()

  const terms = (request.query['terms'] as string)?.trim()

  if (!terms) {
    return h.response({ error: "Missing 'terms' parameter" }).code(400)
  }

  const likeTerm = `%${terms}%`

  try {
    const rows = await db
      .selectFrom('icd10')
      .select(['id', 'label'])
      .where((eb) =>
        eb.and([
          eb('label', 'ilike', likeTerm),
          eb.or([
            eb('valid_until', 'is', null),
            eb('valid_until', '>', new Date())
          ])
        ])
      )
      .limit(50)
      .execute()

    return h.response({ results: rows }).code(200)
  } catch (err) {
    request.log(['error'], err instanceof Error ? err : String(err))
    return h.response({ error: 'Internal server error' }).code(500)
  }
}
